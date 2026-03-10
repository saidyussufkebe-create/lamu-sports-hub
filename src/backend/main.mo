import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  type UserId = Principal;
  type TeamId = Text;
  type PlayerId = Text;
  type MatchId = Text;
  type VoteId = Text;
  type NotificationId = Text;
  type NewsId = Text;

  module UserProfile {
    public type Role = {
      #admin;
      #coach;
      #player;
      #fan;
    };

    public type T = {
      userId : Text;
      name : Text;
      phone : Text;
      email : Text;
      role : Role;
      area : Text;
      favoriteTeamId : ?TeamId;
    };
  };

  module Team {
    public type T = {
      teamId : TeamId;
      name : Text;
      area : Text;
      coachId : Text;
      wins : Nat;
      losses : Nat;
      draws : Nat;
      goalsFor : Nat;
      goalsAgainst : Nat;
      isApproved : Bool;
      logo : ?Storage.ExternalBlob;
    };
  };

  module Player {
    public type Position = {
      #goalkeeper;
      #defender;
      #midfielder;
      #forward;
    };

    public type T = {
      playerId : PlayerId;
      userId : Text;
      teamId : TeamId;
      nickname : Text;
      name : Text;
      position : Position;
      jerseyNumber : Nat;
      matchesPlayed : Nat;
      goals : Nat;
      assists : Nat;
      yellowCards : Nat;
      redCards : Nat;
      photo : ?Storage.ExternalBlob;
      isVerified : Bool;
    };
  };

  module Match {
    public type Status = {
      #scheduled;
      #live;
      #played;
    };

    public type T = {
      matchId : MatchId;
      homeTeam : TeamId;
      awayTeam : TeamId;
      homeScore : Nat;
      awayScore : Nat;
      date : Time.Time;
      kickoffTime : Text;
      mvpPlayerId : ?PlayerId;
      status : Status;
      commentary : [Text];
    };
  };

  module MVPVote {
    public type T = {
      voteId : VoteId;
      matchId : MatchId;
      voterId : UserId;
      nomineePlayerId : PlayerId;
      timestamp : Time.Time;
    };
  };

  module Notification {
    public type Type = {
      #message;
      #reminder;
      #alert;
    };

    public type T = {
      notificationId : NotificationId;
      userId : UserId;
      notifType : Type;
      message : Text;
      isRead : Bool;
      timestamp : Time.Time;
    };
  };

  module News {
    public type T = {
      newsId : NewsId;
      title : Text;
      body : Text;
      photo : ?Storage.ExternalBlob;
      authorId : Text;
      timestamp : Time.Time;
      isPublished : Bool;
    };

    public func compareByTimestamp(a : T, b : T) : Order.Order {
      Int.compare(b.timestamp, a.timestamp);
    };
  };

  let userProfiles = Map.empty<UserId, UserProfile.T>();
  let userProfilesByUserId = Map.empty<Text, UserProfile.T>();
  let teams = Map.empty<TeamId, Team.T>();
  let players = Map.empty<PlayerId, Player.T>();
  let matches = Map.empty<MatchId, Match.T>();
  let mvpVotes = Map.empty<VoteId, MVPVote.T>();
  let notifications = Map.empty<NotificationId, Notification.T>();
  let news = Map.empty<NewsId, News.T>();

  var nextTeamId = 1;
  var nextPlayerId = 1;
  var nextMatchId = 1;
  var nextVoteId = 1;
  var nextNotificationId = 1;
  var nextUserId = 1;

  // ------------------- Helper Functions -------------------

  private func isGuest(caller : Principal) : Bool {
    caller.toText() == "2vxsx-fae";
  };

  // Check if caller is authenticated (non-anonymous)
  private func isAuthenticated(caller : Principal) : Bool {
    not isGuest(caller);
  };

  // Check if caller has user permission (authenticated or explicit #user role)
  private func hasUserPermission(caller : Principal) : Bool {
    if (isGuest(caller)) {
      return false;
    };
    // Any authenticated user is treated as having #user permission.
    true;
  };

  // ------------------- User Functions -------------------

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile.T {
    if (not hasUserPermission(caller)) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(name : Text, phone : Text, email : Text, role : UserProfile.Role, area : Text, favoriteTeamId : ?TeamId) : async () {
    if (not hasUserPermission(caller)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    let profile : UserProfile.T = {
      userId = caller.toText();
      name;
      phone;
      email;
      role;
      area;
      favoriteTeamId;
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func createOrUpdateUserProfile(name : Text, phone : Text, email : Text, role : UserProfile.Role, area : Text, favoriteTeamId : ?TeamId) : async () {
    if (not hasUserPermission(caller)) {
      Runtime.trap("Unauthorized: Only users can create or update profiles");
    };
    let profile : UserProfile.T = {
      userId = caller.toText();
      name;
      phone;
      email;
      role;
      area;
      favoriteTeamId;
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(userId : UserId) : async ?UserProfile.T {
    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(userId);
  };

  public query ({ caller }) func getAllUserProfiles() : async [UserProfile.T] {
    if (not hasUserPermission(caller)) {
      Runtime.trap("Unauthorized: Only registered users can view all profiles");
    };
    let principalProfiles = userProfiles.values().toArray();
    let textProfiles = userProfilesByUserId.values().toArray();
    principalProfiles.concat(textProfiles);
  };

  public query ({ caller }) func getUserIdFromCaller() : async Text {
    caller.toText();
  };

  private func isCoach(caller : Principal) : Bool {
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) {
        switch (profile.role) {
          case (#coach) { true };
          case (_) { false };
        };
      };
    };
  };

  private func isTeamCoach(caller : Principal, teamId : TeamId) : Bool {
    switch (teams.get(teamId)) {
      case (null) { false };
      case (?team) { team.coachId == caller.toText() };
    };
  };

  // -------------------- Team Functions -------------------

  public shared ({ caller }) func createTeam(name : Text, area : Text) : async TeamId {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Only authenticated users can create teams");
    };
    if (not isCoach(caller) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only coaches or admins can create teams");
    };

    let teamId = "T" # nextTeamId.toText();
    nextTeamId += 1;

    let team : Team.T = {
      teamId;
      name;
      area;
      coachId = caller.toText();
      wins = 0;
      losses = 0;
      draws = 0;
      goalsFor = 0;
      goalsAgainst = 0;
      isApproved = false;
      logo = null;
    };
    teams.add(teamId, team);
    teamId;
  };

  public shared ({ caller }) func approveTeam(teamId : TeamId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can approve teams");
    };

    switch (teams.get(teamId)) {
      case (null) { Runtime.trap("Team not found") };
      case (?team) {
        let approvedTeam = { team with isApproved = true };
        teams.add(teamId, approvedTeam);
      };
    };
  };

  public query ({ caller }) func getTeam(teamId : TeamId) : async ?Team.T {
    teams.get(teamId);
  };

  public query ({ caller }) func getAllTeams() : async [Team.T] {
    teams.values().toArray();
  };

  // ---------------------- Player Functions --------------------

  public shared ({ caller }) func createPlayer(teamId : TeamId, nickname : Text, name : Text, position : Player.Position, jerseyNumber : Nat) : async PlayerId {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Only authenticated users can create players");
    };
    if (not isTeamCoach(caller, teamId) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the team's coach or admins can create players for this team");
    };

    let playerId = "P" # nextPlayerId.toText();
    nextPlayerId += 1;

    let player : Player.T = {
      playerId;
      userId = caller.toText();
      teamId;
      nickname;
      name;
      position;
      jerseyNumber;
      matchesPlayed = 0;
      goals = 0;
      assists = 0;
      yellowCards = 0;
      redCards = 0;
      photo = null;
      isVerified = false;
    };
    players.add(playerId, player);
    playerId;
  };

  public shared ({ caller }) func adminAddPlayer(teamId : TeamId, nickname : Text, name : Text, position : Player.Position, jerseyNumber : Nat) : async PlayerId {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Only authenticated users can add players");
    };

    let playerId = "P" # nextPlayerId.toText();
    nextPlayerId += 1;

    let player : Player.T = {
      playerId;
      userId = caller.toText();
      teamId;
      nickname;
      name;
      position;
      jerseyNumber;
      matchesPlayed = 0;
      goals = 0;
      assists = 0;
      yellowCards = 0;
      redCards = 0;
      photo = null;
      isVerified = false;
    };
    players.add(playerId, player);
    playerId;
  };

  public query ({ caller }) func getPlayer(playerId : PlayerId) : async ?Player.T {
    players.get(playerId);
  };

  public query ({ caller }) func getPlayersByTeam(teamId : TeamId) : async [Player.T] {
    players.values().toArray().filter(func(p) { p.teamId == teamId });
  };

  public query ({ caller }) func getAllPlayers() : async [Player.T] {
    players.values().toArray();
  };

  // --------------------- Match Functions ----------------------

  public shared ({ caller }) func createMatch(homeTeam : TeamId, awayTeam : TeamId, date : Time.Time, kickoffTime : Text) : async MatchId {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Only authenticated users can create matches");
    };

    let matchId = "M" # nextMatchId.toText();
    nextMatchId += 1;

    let match : Match.T = {
      matchId;
      homeTeam;
      awayTeam;
      homeScore = 0;
      awayScore = 0;
      date;
      kickoffTime;
      mvpPlayerId = null;
      status = #scheduled;
      commentary = [];
    };
    matches.add(matchId, match);
    matchId;
  };

  public shared ({ caller }) func updateMatchScore(matchId : MatchId, homeScore : Nat, awayScore : Nat, status : Match.Status) : async () {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Only authenticated users can update match scores");
    };

    switch (matches.get(matchId)) {
      case (null) { Runtime.trap("Match not found") };
      case (?match) {
        let isHomeCoach = isTeamCoach(caller, match.homeTeam);
        let isAwayCoach = isTeamCoach(caller, match.awayTeam);
        let isAdmin = AccessControl.isAdmin(accessControlState, caller);

        if (not isHomeCoach and not isAwayCoach and not isAdmin) {
          Runtime.trap("Unauthorized: Only coaches of participating teams or admins can update match scores");
        };

        let updatedMatch = {
          match with
          homeScore;
          awayScore;
          status;
        };
        matches.add(matchId, updatedMatch);
      };
    };
  };

  public query ({ caller }) func getMatch(matchId : MatchId) : async ?Match.T {
    matches.get(matchId);
  };

  public query ({ caller }) func getMatchesByStatus(status : Match.Status) : async [Match.T] {
    matches.values().toArray().filter(func(m) { m.status == status });
  };

  public query ({ caller }) func getAllMatches() : async [Match.T] {
    matches.values().toArray();
  };

  // ------------------- MVPVote Functions ----------------------

  private func hasVotedForMatch(voterId : UserId, matchId : MatchId) : Bool {
    let votes = mvpVotes.values().toArray();
    votes.any(func(v : MVPVote.T) : Bool {
      v.voterId == voterId and v.matchId == matchId
    });
  };

  public shared ({ caller }) func createMVPVote(matchId : MatchId, nomineePlayerId : PlayerId) : async () {
    if (not hasUserPermission(caller)) {
      Runtime.trap("Unauthorized: Only users can vote for MVP");
    };

    if (hasVotedForMatch(caller, matchId)) {
      Runtime.trap("Unauthorized: You have already voted for MVP in this match");
    };

    let voteId = "V" # nextVoteId.toText();
    nextVoteId += 1;

    let vote : MVPVote.T = {
      voteId;
      matchId;
      voterId = caller;
      nomineePlayerId;
      timestamp = Time.now();
    };
    mvpVotes.add(voteId, vote);
  };

  public query ({ caller }) func getMVPVotesByMatch(matchId : MatchId) : async [MVPVote.T] {
    mvpVotes.values().toArray().filter(func(v) { v.matchId == matchId });
  };

  public query ({ caller }) func getAllMVPVotes() : async [MVPVote.T] {
    if (not hasUserPermission(caller)) {
      Runtime.trap("Unauthorized: Only registered users can view all MVP votes");
    };
    mvpVotes.values().toArray();
  };

  // ------------------ Notification Functions -------------------

  public shared ({ caller }) func createNotification(userId : UserId, notifType : Notification.Type, message : Text) : async NotificationId {
    if (not hasUserPermission(caller)) {
      Runtime.trap("Unauthorized: Only users can create notifications");
    };

    let notificationId = "N" # nextNotificationId.toText();
    nextNotificationId += 1;

    let notification : Notification.T = {
      notificationId;
      userId;
      notifType;
      message;
      isRead = false;
      timestamp = Time.now();
    };
    notifications.add(notificationId, notification);
    notificationId;
  };

  public shared ({ caller }) func markNotificationAsRead(notificationId : NotificationId) : async () {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Only authenticated users can mark notifications as read");
    };

    switch (notifications.get(notificationId)) {
      case (null) { Runtime.trap("Notification not found") };
      case (?notification) {
        if (notification.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only mark your own notifications as read");
        };

        let updatedNotification = {
          notification with
          isRead = true;
        };
        notifications.add(notificationId, updatedNotification);
      };
    };
  };

  public query ({ caller }) func getNotificationsByUser(userId : UserId) : async [Notification.T] {
    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own notifications");
    };
    notifications.values().toArray().filter(func(n) { n.userId == userId });
  };

  public query ({ caller }) func getAllNotifications() : async [Notification.T] {
    if (not hasUserPermission(caller)) {
      Runtime.trap("Unauthorized: Only registered users can view all notifications");
    };
    notifications.values().toArray();
  };

  // ----------------------- Admin Functions ------------------------

  public shared ({ caller }) func adminCreateUser(name : Text, phone : Text, email : Text, role : UserProfile.Role, area : Text) : async Text {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Only authenticated users can create users");
    };

    let userId = "U" # nextUserId.toText();
    nextUserId += 1;

    let profile : UserProfile.T = {
      userId;
      name;
      phone;
      email;
      role;
      area;
      favoriteTeamId = null;
    };
    userProfilesByUserId.add(userId, profile);
    userId;
  };

  public shared ({ caller }) func adminCreateTeam(name : Text, area : Text, coachName : Text) : async TeamId {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Only authenticated users can create teams");
    };

    let teamId = "T" # nextTeamId.toText();
    nextTeamId += 1;

    let team : Team.T = {
      teamId;
      name;
      area;
      coachId = coachName;
      wins = 0;
      losses = 0;
      draws = 0;
      goalsFor = 0;
      goalsAgainst = 0;
      isApproved = true;
      logo = null;
    };
    teams.add(teamId, team);
    teamId;
  };

  // ----------------------- News Functions ------------------------

  public shared ({ caller }) func createNews(title : Text, body : Text, isPublished : Bool) : async NewsId {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Only authenticated users can create news");
    };

    let newsId = "NEWS" # Time.now().toText();

    let newsItem : News.T = {
      newsId;
      title;
      body;
      photo = null;
      authorId = caller.toText();
      timestamp = Time.now();
      isPublished;
    };
    news.add(newsId, newsItem);
    newsId;
  };

  public shared ({ caller }) func updateNews(newsId : NewsId, title : Text, body : Text, isPublished : Bool) : async () {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Only authenticated users can update news");
    };

    switch (news.get(newsId)) {
      case (null) { Runtime.trap("News item not found") };
      case (?newsItem) {
        if (newsItem.authorId != caller.toText() and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the author or admins can update this news");
        };

        let updatedNews = {
          newsItem with
          title;
          body;
          isPublished;
        };
        news.add(newsId, updatedNews);
      };
    };
  };

  public shared ({ caller }) func deleteNews(newsId : NewsId) : async () {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Only authenticated users can delete news");
    };

    switch (news.get(newsId)) {
      case (null) { Runtime.trap("News item not found") };
      case (?newsItem) {
        if (newsItem.authorId != caller.toText() and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the author or admins can delete this news");
        };
        news.remove(newsId);
      };
    };
  };

  public query ({ caller }) func getAllNews() : async [News.T] {
    let publishedNews = news.values().toArray().filter(func(n) { n.isPublished });
    publishedNews.sort(News.compareByTimestamp);
  };

  public query ({ caller }) func getAllNewsAdmin() : async [News.T] {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Only authenticated users can view all news");
    };
    news.values().toArray().sort(News.compareByTimestamp);
  };

  public query ({ caller }) func getNews(newsId : NewsId) : async ?News.T {
    switch (news.get(newsId)) {
      case (null) { null };
      case (?newsItem) {
        if (newsItem.isPublished or newsItem.authorId == caller.toText() or AccessControl.isAdmin(accessControlState, caller)) {
          ?newsItem;
        } else {
          null;
        };
      };
    };
  };
};
