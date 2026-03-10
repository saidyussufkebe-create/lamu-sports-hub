import type { T__5 as BackendMatch, T__1 as BackendTeam } from "@/backend";
import { getTeamColor } from "@/components/shared/TeamBadge";

export type StandingEntry = {
  position: number;
  team: {
    teamId: string;
    name: string;
    area: string;
    color: string;
    secondaryColor: string;
  };
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  form: Array<"W" | "D" | "L">;
};

export function computeBackendStandings(
  teams: BackendTeam[],
  matches: BackendMatch[],
): StandingEntry[] {
  type Row = {
    played: number;
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
    points: number;
    recentMatches: Array<{ date: bigint; result: "W" | "D" | "L" }>;
  };

  const table: Record<string, Row> = {};

  // Initialize table for all teams
  for (const team of teams) {
    table[team.teamId] = {
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
      recentMatches: [],
    };
  }

  // Process only played matches
  const playedMatches = matches.filter(
    (m) =>
      m.status?.toString().includes("played") ||
      m.status?.toString() === "played",
  );

  for (const match of playedMatches) {
    const homeRow = table[match.homeTeam];
    const awayRow = table[match.awayTeam];
    if (!homeRow || !awayRow) continue;

    const homeScore = Number(match.homeScore);
    const awayScore = Number(match.awayScore);

    homeRow.played++;
    awayRow.played++;
    homeRow.goalsFor += homeScore;
    homeRow.goalsAgainst += awayScore;
    awayRow.goalsFor += awayScore;
    awayRow.goalsAgainst += homeScore;

    if (homeScore > awayScore) {
      homeRow.wins++;
      homeRow.points += 3;
      homeRow.recentMatches.push({ date: match.date, result: "W" });
      awayRow.losses++;
      awayRow.recentMatches.push({ date: match.date, result: "L" });
    } else if (homeScore < awayScore) {
      awayRow.wins++;
      awayRow.points += 3;
      awayRow.recentMatches.push({ date: match.date, result: "W" });
      homeRow.losses++;
      homeRow.recentMatches.push({ date: match.date, result: "L" });
    } else {
      homeRow.draws++;
      homeRow.points++;
      homeRow.recentMatches.push({ date: match.date, result: "D" });
      awayRow.draws++;
      awayRow.points++;
      awayRow.recentMatches.push({ date: match.date, result: "D" });
    }
  }

  const sorted = teams
    .filter((t) => table[t.teamId])
    .sort((a, b) => {
      const ra = table[a.teamId];
      const rb = table[b.teamId];
      const ptsDiff = rb.points - ra.points;
      if (ptsDiff !== 0) return ptsDiff;
      const gdA = ra.goalsFor - ra.goalsAgainst;
      const gdB = rb.goalsFor - rb.goalsAgainst;
      const gdDiff = gdB - gdA;
      if (gdDiff !== 0) return gdDiff;
      return rb.goalsFor - ra.goalsFor;
    });

  return sorted.map((team, i) => {
    const row = table[team.teamId];
    const recentSorted = [...row.recentMatches]
      .sort((a, b) => Number(b.date) - Number(a.date))
      .slice(0, 5)
      .map((m) => m.result);

    return {
      position: i + 1,
      team: {
        teamId: team.teamId,
        name: team.name,
        area: team.area,
        color: getTeamColor(team.teamId),
        secondaryColor: "oklch(0.95 0.02 82)",
      },
      played: row.played,
      wins: row.wins,
      draws: row.draws,
      losses: row.losses,
      goalsFor: row.goalsFor,
      goalsAgainst: row.goalsAgainst,
      goalDiff: row.goalsFor - row.goalsAgainst,
      points: row.points,
      form: recentSorted as Array<"W" | "D" | "L">,
    };
  });
}
