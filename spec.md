# Lamu Sports Hub

## Current State
Full-stack app with Motoko backend and React/TypeScript frontend. Features: Dashboard, Standings (auto-calculated from matches via standingsUtils.ts), Teams, Players, Matches, News, Leaderboard, Notifications, Admin Panel, Profile, Settings, and more. Local storage fallback for PIN-session users. Known persistent issues: demo notifications, team name edits not always reflecting, news not showing on dashboard.

## Requested Changes (Diff)

### Add
- **Matchday countdown alert banner** on Dashboard: when a match is scheduled within 2 hours, show a dismissible banner with team names, time, and venue
- **Fan comments/reactions** on news posts: heart, fire, clap emoji reactions (stored locally per newsId); comment thread stored locally
- **Season summary stats** widget on Dashboard: top scorer, most assists, most clean sheets, total goals this season — computed from real match/player data
- **Global search** component: search bar in TopNav (mobile: search icon, opens overlay); searches teams, players, and news, shows results live
- **Bulk player import** in Admin Panel > Players tab: paste or upload CSV with columns name,position,jerseyNumber,teamId; preview and confirm before importing
- **Match result entry with event tracking** in Admin Panel > Matches: when marking a match as played, a modal to enter goal scorers (player + minute), assists (player + minute), and yellow/red cards — saves locally and auto-increments player stats

### Modify
- **Notifications page**: hard remove any remaining demo data; `runMigrations()` must run on app startup in main.tsx
- **Team name edits**: after edit, also force-refresh all consumers via a custom event (`lsh:teams-updated`) that TeamsPage, PlayersPage, SettingsPage, and DashboardPage listen to
- **Dashboard news section**: fallback to `getLocalNews()` if backend returns empty; also add auto-poll every 30s
- **Leaderboard page**: compute top scorers from real local players (combining backend + local players) sorted by goals desc
- **Standings page**: already uses computeBackendStandings; add form guide column (last 5 results dots)
- **Player profile page**: add a Comments/Reactions tab below stats
- **Team profile page**: add recent match results section (last 5 matches with scores)

### Remove
- Any remaining hardcoded demo player/team/referee names in initial render

## Implementation Plan
1. Add `runMigrations()` call in main.tsx before React render
2. Add `lsh:teams-updated` custom event dispatching in Admin Panel team CRUD; add window event listeners in TeamsPage, PlayersPage, SettingsPage
3. Fix Dashboard news: merge backend news + local news, sort by timestamp, auto-poll
4. Add matchday alert banner component to DashboardPage (check matches within 2h window)
5. Add global search overlay to TopNav with results from backend teams/players and local news
6. Add emoji reactions + comments to NewsPage individual post view (local storage)
7. Add season summary stats widget to DashboardPage
8. Add bulk import dialog to AdminPanelPage Players tab
9. Add match event entry modal to AdminPanelPage Matches tab
10. Update LeaderboardPage to compute from real data
11. Add form guide dots to StandingsPage
12. Add recent matches to TeamProfilePage
