export function getLocalStore<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setLocalStore<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// ── Referees ──────────────────────────────────────────────────────────────────
export type Referee = {
  refereeId: string;
  name: string;
  contact: string;
  licenseNumber: string;
  isActive: boolean;
};

export const LSH_REFEREES_KEY = "lsh_referees";

export function getReferees(): Referee[] {
  return getLocalStore<Referee[]>(LSH_REFEREES_KEY, []);
}

// ── Awards ────────────────────────────────────────────────────────────────────
export type Award = {
  awardId: string;
  title: string;
  recipientName: string;
  recipientType: "player" | "team";
  season: string;
  description: string;
  isConfirmed: boolean;
  awardDate: string;
};

export const LSH_AWARDS_KEY = "lsh_awards";

export function getAwards(): Award[] {
  return getLocalStore<Award[]>(LSH_AWARDS_KEY, []);
}

// ── Videos ────────────────────────────────────────────────────────────────────
export type Video = {
  videoId: string;
  title: string;
  url: string;
  category: "tactics" | "preparation" | "highlights";
};

export const LSH_VIDEOS_KEY = "lsh_videos";

const SEED_VIDEOS: Video[] = [
  {
    videoId: "vid-001",
    title: "Understanding the 4-3-3 Formation",
    url: "https://www.youtube.com/embed/dWBaVXDsS7g",
    category: "tactics",
  },
  {
    videoId: "vid-002",
    title: "Pressing & High Press Tactics Explained",
    url: "https://www.youtube.com/embed/x2cuvjfVOJg",
    category: "tactics",
  },
  {
    videoId: "vid-003",
    title: "Pre-Match Warm-Up Drills for Football Players",
    url: "https://www.youtube.com/embed/ZDz1OVX3jYE",
    category: "preparation",
  },
];

export function getVideos(): Video[] {
  const stored = getLocalStore<Video[] | null>(LSH_VIDEOS_KEY, null);
  if (!stored) {
    setLocalStore(LSH_VIDEOS_KEY, SEED_VIDEOS);
    return SEED_VIDEOS;
  }
  return stored;
}

// ── Suggestions ───────────────────────────────────────────────────────────────
export type Suggestion = {
  suggestionId: string;
  message: string;
  suggestionType: "suggestion" | "problem_report";
  timestamp: string;
  isRead: boolean;
  authorNote: string;
  officialReply: string;
};

export const LSH_SUGGESTIONS_KEY = "lsh_suggestions";

// ── Officials ─────────────────────────────────────────────────────────────────
export type Official = {
  officialId: string;
  name: string;
  title: string;
  contact: string;
  email: string;
  displayOrder: number;
};

export const LSH_OFFICIALS_KEY = "lsh_officials";

export function getOfficials(): Official[] {
  return getLocalStore<Official[]>(LSH_OFFICIALS_KEY, []);
}

// ── Pitches ───────────────────────────────────────────────────────────────────
export type Pitch = {
  pitchId: string;
  name: string;
  location: string;
  surface: string;
  capacity: number;
};

export const LSH_PITCHES_KEY = "lsh_pitches";

const SEED_PITCHES: Pitch[] = [
  {
    pitchId: "pitch-001",
    name: "Twaif Ground",
    location: "Twaif, Lamu Island",
    surface: "Natural grass",
    capacity: 500,
  },
  {
    pitchId: "pitch-002",
    name: "Mala Ground",
    location: "Mala, Lamu Island",
    surface: "Natural grass",
    capacity: 300,
  },
  {
    pitchId: "pitch-003",
    name: "Sports Ground",
    location: "Lamu Town, Lamu Island",
    surface: "Natural grass",
    capacity: 800,
  },
  {
    pitchId: "pitch-004",
    name: "Carpet Field",
    location: "Lamu Town, Lamu Island",
    surface: "Artificial turf",
    capacity: 200,
  },
];

export function getPitches(): Pitch[] {
  const stored = getLocalStore<Pitch[] | null>(LSH_PITCHES_KEY, null);
  if (!stored) {
    setLocalStore(LSH_PITCHES_KEY, SEED_PITCHES);
    return SEED_PITCHES;
  }
  return stored;
}

// ── Season Settings ───────────────────────────────────────────────────────────
export type SeasonSettings = {
  seasonName: string;
  tournamentName: string;
  currentYear: string;
};

export const LSH_SEASON_SETTINGS_KEY = "lsh_season_settings";

export function getSeasonSettings(): SeasonSettings {
  return getLocalStore<SeasonSettings>(LSH_SEASON_SETTINGS_KEY, {
    seasonName: "2025/26",
    tournamentName: "Lamu Premier League",
    currentYear: "2026",
  });
}

// ── System Status ─────────────────────────────────────────────────────────────
export type SystemStatus = {
  isActive: boolean;
  message: string;
};

export const LSH_SYSTEM_STATUS_KEY = "lsh_system_status";

// ── Player Confirmations ──────────────────────────────────────────────────────
export const LSH_PLAYER_CONFIRMATIONS_KEY = "lsh_player_confirmations";

export function getPlayerConfirmations(): Record<string, boolean> {
  return getLocalStore<Record<string, boolean>>(
    LSH_PLAYER_CONFIRMATIONS_KEY,
    {},
  );
}

// ── Player Photos ─────────────────────────────────────────────────────────────
export const LSH_PLAYER_PHOTOS_KEY = "lsh_player_photos";

export function getPlayerPhotos(): Record<string, string> {
  return getLocalStore<Record<string, string>>(LSH_PLAYER_PHOTOS_KEY, {});
}

// ── Match Referee Assignments ─────────────────────────────────────────────────
// Maps matchId -> refereeId
export const LSH_MATCH_REFEREES_KEY = "lsh_match_referees";

export function getMatchReferees(): Record<string, string> {
  return getLocalStore<Record<string, string>>(LSH_MATCH_REFEREES_KEY, {});
}

export function setMatchReferee(
  matchId: string,
  refereeId: string | null,
): void {
  const current = getMatchReferees();
  if (refereeId === null) {
    delete current[matchId];
  } else {
    current[matchId] = refereeId;
  }
  setLocalStore(LSH_MATCH_REFEREES_KEY, current);
}

// ── Profile Photo ──────────────────────────────────────────────────────────────
export const LSH_PROFILE_PHOTO_KEY = "lsh_profile_photo";

export function getProfilePhoto(): string | null {
  return getLocalStore<string | null>(LSH_PROFILE_PHOTO_KEY, null);
}

// ── User Settings ─────────────────────────────────────────────────────────────
export type UserSettings = {
  matchAlerts: boolean;
  newsAlerts: boolean;
  mvpReminders: boolean;
  lineupAlerts: boolean;
  goalAlerts: boolean;
  favoriteTeamId: string;
  favoritePlayerId: string | undefined;
  displayName: string;
  theme: "dark" | "light" | "system";
  language: "en" | "sw";
  interests: string[];
};

export const LSH_USER_SETTINGS_KEY = "lsh_user_settings";

export function getUserSettings(): UserSettings {
  const stored = getLocalStore<Partial<UserSettings>>(
    LSH_USER_SETTINGS_KEY,
    {},
  );
  return {
    matchAlerts: stored.matchAlerts ?? true,
    newsAlerts: stored.newsAlerts ?? true,
    mvpReminders: stored.mvpReminders ?? false,
    lineupAlerts: stored.lineupAlerts ?? false,
    goalAlerts: stored.goalAlerts ?? true,
    favoriteTeamId: stored.favoriteTeamId ?? "",
    favoritePlayerId: stored.favoritePlayerId ?? undefined,
    displayName: stored.displayName ?? "",
    theme: stored.theme ?? "dark",
    language: stored.language ?? "en",
    interests: stored.interests ?? ["news", "leaderboard"],
  };
}

// ── Match Pitches ─────────────────────────────────────────────────────────────
export const LSH_MATCH_PITCHES_KEY = "lsh_match_pitches";

export function getMatchPitches(): Record<string, string> {
  return getLocalStore<Record<string, string>>(LSH_MATCH_PITCHES_KEY, {});
}

export function setMatchPitch(matchId: string, pitchId: string | null): void {
  const current = getMatchPitches();
  if (pitchId === null) {
    delete current[matchId];
  } else {
    current[matchId] = pitchId;
  }
  setLocalStore(LSH_MATCH_PITCHES_KEY, current);
}

// ── Team Logos ────────────────────────────────────────────────────────────────
export const LSH_TEAM_LOGOS_KEY = "lsh_team_logos";

export function getTeamLogos(): Record<string, string> {
  return getLocalStore<Record<string, string>>(LSH_TEAM_LOGOS_KEY, {});
}

export function setTeamLogo(teamId: string, base64: string): void {
  const current = getTeamLogos();
  current[teamId] = base64;
  setLocalStore(LSH_TEAM_LOGOS_KEY, current);
}

// ── News Confirmations ────────────────────────────────────────────────────────
// Maps newsId -> { confirmedBy: string; confirmedAt: string }
export type NewsConfirmation = {
  confirmedBy: string;
  confirmedAt: string;
};

export const LSH_NEWS_CONFIRMATIONS_KEY = "lsh_news_confirmations";

export function getNewsConfirmations(): Record<string, NewsConfirmation> {
  return getLocalStore<Record<string, NewsConfirmation>>(
    LSH_NEWS_CONFIRMATIONS_KEY,
    {},
  );
}

export function confirmNews(newsId: string, confirmedBy: string): void {
  const current = getNewsConfirmations();
  current[newsId] = {
    confirmedBy,
    confirmedAt: new Date().toISOString(),
  };
  setLocalStore(LSH_NEWS_CONFIRMATIONS_KEY, current);
}

export function unconfirmNews(newsId: string): void {
  const current = getNewsConfirmations();
  delete current[newsId];
  setLocalStore(LSH_NEWS_CONFIRMATIONS_KEY, current);
}

// ── Recovery Requests ─────────────────────────────────────────────────────────
export type RecoveryRequest = {
  ticketId: string; // e.g. "LSH-REC-1234"
  submittedAt: string; // ISO date
  name: string;
  contact: string; // phone or email
  lastPrincipalId: string; // what the user remembers
  issueDescription: string;
  status: "pending" | "resolved" | "rejected";
  adminReply: string;
};

export const LSH_RECOVERY_KEY = "lsh_recovery_requests";

export function getRecoveryRequests(): RecoveryRequest[] {
  return getLocalStore<RecoveryRequest[]>(LSH_RECOVERY_KEY, []);
}

export function addRecoveryRequest(
  req: Omit<
    RecoveryRequest,
    "ticketId" | "submittedAt" | "status" | "adminReply"
  >,
): RecoveryRequest {
  const all = getRecoveryRequests();
  const ticket: RecoveryRequest = {
    ...req,
    ticketId: `LSH-REC-${Math.floor(1000 + Math.random() * 9000)}`,
    submittedAt: new Date().toISOString(),
    status: "pending",
    adminReply: "",
  };
  all.push(ticket);
  setLocalStore(LSH_RECOVERY_KEY, all);
  return ticket;
}

export function updateRecoveryRequest(
  ticketId: string,
  updates: Partial<Pick<RecoveryRequest, "status" | "adminReply">>,
): void {
  const all = getRecoveryRequests();
  const idx = all.findIndex((r) => r.ticketId === ticketId);
  if (idx !== -1) {
    all[idx] = { ...all[idx], ...updates };
    setLocalStore(LSH_RECOVERY_KEY, all);
  }
}

// ── Official Access Code ──────────────────────────────────────────────────────
export const LSH_OFFICIAL_CODE_KEY = "lsh_official_code";
const DEFAULT_OFFICIAL_CODE = "LSH2026";

export function getOfficialCode(): string {
  return getLocalStore<string>(LSH_OFFICIAL_CODE_KEY, DEFAULT_OFFICIAL_CODE);
}

export function setOfficialCode(code: string): void {
  setLocalStore(LSH_OFFICIAL_CODE_KEY, code);
}

export function setOfficialSessionVerified(): void {
  sessionStorage.setItem("lsh_official_session", "verified");
}

export function isOfficialSessionVerified(): boolean {
  return sessionStorage.getItem("lsh_official_session") === "verified";
}

export function clearOfficialSession(): void {
  sessionStorage.removeItem("lsh_official_session");
}

// ── App Logo ──────────────────────────────────────────────────────────────────
export const LSH_APP_LOGO_KEY = "lsh_app_logo";

export function getAppLogo(): string | null {
  return getLocalStore<string | null>(LSH_APP_LOGO_KEY, null);
}

export function setAppLogo(base64: string): void {
  setLocalStore(LSH_APP_LOGO_KEY, base64);
}

export function clearAppLogo(): void {
  localStorage.removeItem(LSH_APP_LOGO_KEY);
}

// ── Team Name/Area Overrides ───────────────────────────────────────────────────
export const LSH_TEAM_OVERRIDES_KEY = "lsh_team_overrides";

export type TeamOverride = { name: string; area: string };

export function getTeamOverrides(): Record<string, TeamOverride> {
  return getLocalStore<Record<string, TeamOverride>>(
    LSH_TEAM_OVERRIDES_KEY,
    {},
  );
}

export function setTeamOverride(teamId: string, override: TeamOverride): void {
  const current = getTeamOverrides();
  current[teamId] = override;
  setLocalStore(LSH_TEAM_OVERRIDES_KEY, current);
}

// ── Soft-deleted Teams ─────────────────────────────────────────────────────────
export const LSH_DELETED_TEAMS_KEY = "lsh_deleted_teams";

export function getDeletedTeamIds(): string[] {
  return getLocalStore<string[]>(LSH_DELETED_TEAMS_KEY, []);
}

export function softDeleteTeam(teamId: string): void {
  const current = getDeletedTeamIds();
  if (!current.includes(teamId)) {
    current.push(teamId);
    setLocalStore(LSH_DELETED_TEAMS_KEY, current);
  }
}

// ── News Photos ────────────────────────────────────────────────────────────────
// Maps newsId -> base64 data URL of the uploaded photo
export const LSH_NEWS_PHOTOS_KEY = "lsh_news_photos";

export function getNewsPhotos(): Record<string, string> {
  return getLocalStore<Record<string, string>>(LSH_NEWS_PHOTOS_KEY, {});
}

export function setNewsPhoto(newsId: string, base64: string): void {
  const current = getNewsPhotos();
  current[newsId] = base64;
  setLocalStore(LSH_NEWS_PHOTOS_KEY, current);
}

export function deleteNewsPhoto(newsId: string): void {
  const current = getNewsPhotos();
  delete current[newsId];
  setLocalStore(LSH_NEWS_PHOTOS_KEY, current);
}

// ── Notifications Read State ──────────────────────────────────────────────────
// Persists which notification IDs have been marked as read
export const LSH_NOTIF_READ_KEY = "lsh_notif_read_ids";

export function getReadNotifIds(): string[] {
  return getLocalStore<string[]>(LSH_NOTIF_READ_KEY, []);
}

export function markNotifRead(notifId: string): void {
  const current = getReadNotifIds();
  if (!current.includes(notifId)) {
    current.push(notifId);
    setLocalStore(LSH_NOTIF_READ_KEY, current);
  }
}

export function markAllNotifsRead(notifIds: string[]): void {
  const current = getReadNotifIds();
  const merged = Array.from(new Set([...current, ...notifIds]));
  setLocalStore(LSH_NOTIF_READ_KEY, merged);
}

// ── Local Notifications (sent by officials via Admin Panel > Notify) ──────────
export type LocalNotification = {
  notificationId: string;
  type: "alert" | "reminder" | "message";
  message: string;
  timestamp: string; // ISO date string
  isRead: boolean;
  target: string; // "all" or area name
};

export const LSH_LOCAL_NOTIFS_KEY = "lsh_local_notifications";

export function getLocalNotifications(): LocalNotification[] {
  return getLocalStore<LocalNotification[]>(LSH_LOCAL_NOTIFS_KEY, []);
}

export function addLocalNotification(
  notif: Omit<LocalNotification, "notificationId" | "timestamp" | "isRead">,
): LocalNotification {
  const all = getLocalNotifications();
  const newNotif: LocalNotification = {
    ...notif,
    notificationId: `NOTIF-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    isRead: false,
  };
  all.unshift(newNotif);
  setLocalStore(LSH_LOCAL_NOTIFS_KEY, all);
  return newNotif;
}

export function clearLocalNotifications(): void {
  setLocalStore(LSH_LOCAL_NOTIFS_KEY, []);
}

export function deleteLocalNotification(notifId: string): void {
  const current = getLocalNotifications().filter(
    (n) => n.notificationId !== notifId,
  );
  setLocalStore(LSH_LOCAL_NOTIFS_KEY, current);
}

// ── Soft-deleted Players ───────────────────────────────────────────────────────
export const LSH_DELETED_PLAYERS_KEY = "lsh_deleted_players";

export function getDeletedPlayerIds(): string[] {
  return getLocalStore<string[]>(LSH_DELETED_PLAYERS_KEY, []);
}

export function softDeletePlayer(playerId: string): void {
  const current = getDeletedPlayerIds();
  if (!current.includes(playerId)) {
    current.push(playerId);
    setLocalStore(LSH_DELETED_PLAYERS_KEY, current);
  }
}

// ── Local News (for users without Internet Identity) ──────────────────────────
// Full news items stored locally so PIN-session officials can publish news
// even when the backend requires II authentication.
export type LocalNewsItem = {
  newsId: string;
  title: string;
  body: string;
  isPublished: boolean;
  authorId: string;
  timestamp: number; // ms epoch
  photoBase64?: string;
};

export const LSH_LOCAL_NEWS_KEY = "lsh_local_news";

export function getLocalNews(): LocalNewsItem[] {
  return getLocalStore<LocalNewsItem[]>(LSH_LOCAL_NEWS_KEY, []);
}

export function addLocalNewsItem(item: LocalNewsItem): void {
  const current = getLocalNews();
  current.unshift(item); // newest first
  setLocalStore(LSH_LOCAL_NEWS_KEY, current);
}

export function updateLocalNewsItem(
  newsId: string,
  updates: Partial<LocalNewsItem>,
): void {
  const current = getLocalNews();
  const idx = current.findIndex((n) => n.newsId === newsId);
  if (idx !== -1) {
    current[idx] = { ...current[idx], ...updates };
    setLocalStore(LSH_LOCAL_NEWS_KEY, current);
  }
}

export function deleteLocalNewsItem(newsId: string): void {
  const current = getLocalNews().filter((n) => n.newsId !== newsId);
  setLocalStore(LSH_LOCAL_NEWS_KEY, current);
}

// ── Local Teams (for users without Internet Identity) ─────────────────────────
export type LocalTeam = {
  teamId: string;
  name: string;
  area: string;
  coachName: string;
  createdAt: number;
};

export const LSH_LOCAL_TEAMS_KEY = "lsh_local_teams";

export function getLocalTeams(): LocalTeam[] {
  return getLocalStore<LocalTeam[]>(LSH_LOCAL_TEAMS_KEY, []);
}

export function addLocalTeam(team: LocalTeam): void {
  const current = getLocalTeams();
  current.push(team);
  setLocalStore(LSH_LOCAL_TEAMS_KEY, current);
}

export function updateLocalTeam(
  teamId: string,
  updates: Partial<LocalTeam>,
): void {
  const current = getLocalTeams();
  const idx = current.findIndex((t) => t.teamId === teamId);
  if (idx !== -1) {
    current[idx] = { ...current[idx], ...updates };
    setLocalStore(LSH_LOCAL_TEAMS_KEY, current);
  }
}

export function deleteLocalTeam(teamId: string): void {
  const current = getLocalTeams().filter((t) => t.teamId !== teamId);
  setLocalStore(LSH_LOCAL_TEAMS_KEY, current);
}

// ── Local Players (for users without Internet Identity) ───────────────────────
export type LocalPlayer = {
  playerId: string;
  name: string;
  nickname: string;
  teamId: string;
  position: string;
  jerseyNumber: number;
  photoBase64?: string;
  isConfirmed: boolean;
  createdAt: number;
};

export const LSH_LOCAL_PLAYERS_KEY = "lsh_local_players";

export function getLocalPlayers(): LocalPlayer[] {
  return getLocalStore<LocalPlayer[]>(LSH_LOCAL_PLAYERS_KEY, []);
}

export function addLocalPlayer(player: LocalPlayer): void {
  const current = getLocalPlayers();
  current.push(player);
  setLocalStore(LSH_LOCAL_PLAYERS_KEY, current);
}

export function updateLocalPlayer(
  playerId: string,
  updates: Partial<LocalPlayer>,
): void {
  const current = getLocalPlayers();
  const idx = current.findIndex((p) => p.playerId === playerId);
  if (idx !== -1) {
    current[idx] = { ...current[idx], ...updates };
    setLocalStore(LSH_LOCAL_PLAYERS_KEY, current);
  }
}

export function deleteLocalPlayer(playerId: string): void {
  const current = getLocalPlayers().filter((p) => p.playerId !== playerId);
  setLocalStore(LSH_LOCAL_PLAYERS_KEY, current);
}

// ── Migrations ───────────────────────────────────────────────────────────────
const DEMO_PHRASES = [
  "welcome",
  "season",
  "match day",
  "demo",
  "test notification",
  "league begins",
];
function isDemoNotification(n: LocalNotification): boolean {
  const text = n.message.toLowerCase();
  return DEMO_PHRASES.some((p) => text.includes(p));
}

export function runMigrations(): void {
  if (!localStorage.getItem("lsh_migration_v2")) {
    // Clear any stale demo notifications from previous versions
    localStorage.setItem(LSH_LOCAL_NOTIFS_KEY, JSON.stringify([]));
    localStorage.setItem("lsh_migration_v2", "done");
  }
  if (!localStorage.getItem("lsh_migration_v3")) {
    // Remove demo-phrase notifications but keep real official notifications
    const current = getLocalNotifications();
    const cleaned = current.filter((n) => !isDemoNotification(n));
    setLocalStore(LSH_LOCAL_NOTIFS_KEY, cleaned);
    localStorage.setItem("lsh_migration_v3", "done");
  }
}

// ── News Reactions ────────────────────────────────────────────────────────────
// Key: lsh_reactions_[newsId] => { [userId]: emoji }
export function getNewsReactions(newsId: string): Record<string, string> {
  return getLocalStore<Record<string, string>>(`lsh_reactions_${newsId}`, {});
}

export function setNewsReaction(
  newsId: string,
  userId: string,
  emoji: string | null,
): void {
  const current = getNewsReactions(newsId);
  if (emoji === null) {
    delete current[userId];
  } else {
    current[userId] = emoji;
  }
  setLocalStore(`lsh_reactions_${newsId}`, current);
}

// ── News Comments ─────────────────────────────────────────────────────────────
export type NewsComment = {
  commentId: string;
  author: string;
  text: string;
  timestamp: string;
};

export function getNewsComments(newsId: string): NewsComment[] {
  return getLocalStore<NewsComment[]>(`lsh_comments_${newsId}`, []);
}

export function addNewsComment(
  newsId: string,
  comment: Omit<NewsComment, "commentId" | "timestamp">,
): NewsComment {
  const all = getNewsComments(newsId);
  const newComment: NewsComment = {
    ...comment,
    commentId: `CMT-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
  };
  all.push(newComment);
  setLocalStore(`lsh_comments_${newsId}`, all);
  return newComment;
}

// ── Match Events ──────────────────────────────────────────────────────────────
export type GoalEvent = {
  team: "home" | "away";
  playerName: string;
  minute: number;
};

export type CardEvent = {
  playerName: string;
  cardType: "yellow" | "red";
  minute: number;
};

export type MatchEvents = {
  goals: GoalEvent[];
  cards: CardEvent[];
};

export function getMatchEvents(matchId: string): MatchEvents {
  return getLocalStore<MatchEvents>(`lsh_match_events_${matchId}`, {
    goals: [],
    cards: [],
  });
}

export function setMatchEvents(matchId: string, events: MatchEvents): void {
  setLocalStore(`lsh_match_events_${matchId}`, events);
}
