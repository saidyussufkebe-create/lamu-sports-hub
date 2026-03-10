import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export type NewsId = string;
export interface T__1 {
    isApproved: boolean;
    area: string;
    logo?: ExternalBlob;
    name: string;
    wins: bigint;
    goalsFor: bigint;
    losses: bigint;
    coachId: string;
    goalsAgainst: bigint;
    teamId: TeamId;
    draws: bigint;
}
export type MatchId = string;
export type TeamId = string;
export interface T__4 {
    title: string;
    isPublished: boolean;
    authorId: string;
    body: string;
    newsId: NewsId;
    timestamp: Time;
    photo?: ExternalBlob;
}
export type UserId = Principal;
export interface T__3 {
    notifType: Type;
    userId: UserId;
    isRead: boolean;
    message: string;
    timestamp: Time;
    notificationId: NotificationId;
}
export type PlayerId = string;
export interface T__2 {
    nickname: string;
    assists: bigint;
    userId: string;
    playerId: PlayerId;
    name: string;
    yellowCards: bigint;
    jerseyNumber: bigint;
    isVerified: boolean;
    goals: bigint;
    redCards: bigint;
    matchesPlayed: bigint;
    photo?: ExternalBlob;
    teamId: TeamId;
    position: Position;
}
export interface T {
    area: string;
    userId: string;
    name: string;
    role: Role;
    email: string;
    favoriteTeamId?: TeamId;
    phone: string;
}
export type NotificationId = string;
export interface T__5 {
    status: Status;
    homeTeam: TeamId;
    date: Time;
    matchId: MatchId;
    homeScore: bigint;
    awayTeam: TeamId;
    awayScore: bigint;
    commentary: Array<string>;
    mvpPlayerId?: PlayerId;
    kickoffTime: string;
}
export interface T__6 {
    voteId: VoteId;
    matchId: MatchId;
    voterId: UserId;
    timestamp: Time;
    nomineePlayerId: PlayerId;
}
export type VoteId = string;
export enum Position {
    goalkeeper = "goalkeeper",
    midfielder = "midfielder",
    forward = "forward",
    defender = "defender"
}
export enum Role {
    fan = "fan",
    admin = "admin",
    player = "player",
    coach = "coach"
}
export enum Status {
    scheduled = "scheduled",
    played = "played",
    live = "live"
}
export enum Type {
    alert = "alert",
    reminder = "reminder",
    message = "message"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    adminAddPlayer(teamId: TeamId, nickname: string, name: string, position: Position, jerseyNumber: bigint): Promise<PlayerId>;
    adminCreateTeam(name: string, area: string, coachName: string): Promise<TeamId>;
    adminCreateUser(name: string, phone: string, email: string, role: Role, area: string): Promise<string>;
    approveTeam(teamId: TeamId): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createMVPVote(matchId: MatchId, nomineePlayerId: PlayerId): Promise<void>;
    createMatch(homeTeam: TeamId, awayTeam: TeamId, date: Time, kickoffTime: string): Promise<MatchId>;
    createNews(title: string, body: string, isPublished: boolean): Promise<NewsId>;
    createNotification(userId: UserId, notifType: Type, message: string): Promise<NotificationId>;
    createOrUpdateUserProfile(name: string, phone: string, email: string, role: Role, area: string, favoriteTeamId: TeamId | null): Promise<void>;
    createPlayer(teamId: TeamId, nickname: string, name: string, position: Position, jerseyNumber: bigint): Promise<PlayerId>;
    createTeam(name: string, area: string): Promise<TeamId>;
    deleteNews(newsId: NewsId): Promise<void>;
    getAllMVPVotes(): Promise<Array<T__6>>;
    getAllMatches(): Promise<Array<T__5>>;
    getAllNews(): Promise<Array<T__4>>;
    getAllNewsAdmin(): Promise<Array<T__4>>;
    getAllNotifications(): Promise<Array<T__3>>;
    getAllPlayers(): Promise<Array<T__2>>;
    getAllTeams(): Promise<Array<T__1>>;
    getAllUserProfiles(): Promise<Array<T>>;
    getCallerUserProfile(): Promise<T | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMVPVotesByMatch(matchId: MatchId): Promise<Array<T__6>>;
    getMatch(matchId: MatchId): Promise<T__5 | null>;
    getMatchesByStatus(status: Status): Promise<Array<T__5>>;
    getNews(newsId: NewsId): Promise<T__4 | null>;
    getNotificationsByUser(userId: UserId): Promise<Array<T__3>>;
    getPlayer(playerId: PlayerId): Promise<T__2 | null>;
    getPlayersByTeam(teamId: TeamId): Promise<Array<T__2>>;
    getTeam(teamId: TeamId): Promise<T__1 | null>;
    getUserIdFromCaller(): Promise<string>;
    getUserProfile(userId: UserId): Promise<T | null>;
    isCallerAdmin(): Promise<boolean>;
    markNotificationAsRead(notificationId: NotificationId): Promise<void>;
    saveCallerUserProfile(name: string, phone: string, email: string, role: Role, area: string, favoriteTeamId: TeamId | null): Promise<void>;
    updateMatchScore(matchId: MatchId, homeScore: bigint, awayScore: bigint, status: Status): Promise<void>;
    updateNews(newsId: NewsId, title: string, body: string, isPublished: boolean): Promise<void>;
}
