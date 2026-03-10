// Lamu Sports Hub — Frontend Mock Data
// Used for UI demonstration; not passed to backend

export type MockTeam = {
  teamId: string;
  name: string;
  area: string;
  coachName: string;
  color: string;
  secondaryColor: string;
  wins: number;
  losses: number;
  draws: number;
  goalsFor: number;
  goalsAgainst: number;
  isApproved: boolean;
};

export type MockPlayer = {
  playerId: string;
  name: string;
  nickname: string;
  teamId: string;
  position: "goalkeeper" | "defender" | "midfielder" | "forward";
  jerseyNumber: number;
  matchesPlayed: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  isVerified: boolean;
  nationality: string;
};

export type MockMatch = {
  matchId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  date: string;
  status: "scheduled" | "live" | "played";
  mvpPlayerId?: string;
  refereeId?: string;
  commentary: CommentaryEntry[];
};

export type CommentaryEntry = {
  minute: number;
  type:
    | "goal"
    | "yellow_card"
    | "red_card"
    | "kickoff"
    | "halftime"
    | "fulltime"
    | "substitution"
    | "info";
  text: string;
  playerId?: string;
};

export type MockNotification = {
  notificationId: string;
  userId: string;
  type: "alert" | "reminder" | "message";
  message: string;
  timestamp: string;
  isRead: boolean;
};

export const MOCK_TEAMS: MockTeam[] = [
  {
    teamId: "team-001",
    name: "Shela United",
    area: "Shela",
    coachName: "Ali Hassan",
    color: "#0B2E6F",
    secondaryColor: "#E8C98A",
    wins: 8,
    losses: 2,
    draws: 2,
    goalsFor: 27,
    goalsAgainst: 12,
    isApproved: true,
  },
  {
    teamId: "team-002",
    name: "Hindi Warriors",
    area: "Hindi",
    coachName: "Omar Shafiq",
    color: "#8B1A1A",
    secondaryColor: "#FFD700",
    wins: 7,
    losses: 3,
    draws: 2,
    goalsFor: 24,
    goalsAgainst: 15,
    isApproved: true,
  },
  {
    teamId: "team-003",
    name: "Mkunguni FC",
    area: "Mkunguni",
    coachName: "Salim Abdallah",
    color: "#1A6B3A",
    secondaryColor: "#FFFFFF",
    wins: 6,
    losses: 3,
    draws: 3,
    goalsFor: 20,
    goalsAgainst: 14,
    isApproved: true,
  },
  {
    teamId: "team-004",
    name: "Langoni Stars",
    area: "Langoni",
    coachName: "Hassan Mwana",
    color: "#6B1A6B",
    secondaryColor: "#E8C98A",
    wins: 5,
    losses: 4,
    draws: 3,
    goalsFor: 18,
    goalsAgainst: 16,
    isApproved: true,
  },
  {
    teamId: "team-005",
    name: "Mkomani Eagles",
    area: "Mkomani",
    coachName: "Said Mwalimu",
    color: "#2E6B6B",
    secondaryColor: "#FFD700",
    wins: 5,
    losses: 5,
    draws: 2,
    goalsFor: 16,
    goalsAgainst: 18,
    isApproved: true,
  },
  {
    teamId: "team-006",
    name: "Lamu Town FC",
    area: "Lamu Town",
    coachName: "Rashid Kombo",
    color: "#6B4A1A",
    secondaryColor: "#FFFFFF",
    wins: 4,
    losses: 5,
    draws: 3,
    goalsFor: 15,
    goalsAgainst: 19,
    isApproved: true,
  },
  {
    teamId: "team-007",
    name: "Matondoni FC",
    area: "Matondoni",
    coachName: "Yusufu Bakari",
    color: "#1A3A6B",
    secondaryColor: "#E84B3A",
    wins: 3,
    losses: 6,
    draws: 3,
    goalsFor: 12,
    goalsAgainst: 22,
    isApproved: true,
  },
  {
    teamId: "team-008",
    name: "Kipungani FC",
    area: "Kipungani",
    coachName: "Amani Juma",
    color: "#3A1A1A",
    secondaryColor: "#E8C98A",
    wins: 1,
    losses: 9,
    draws: 2,
    goalsFor: 8,
    goalsAgainst: 28,
    isApproved: true,
  },
];

export const MOCK_PLAYERS: MockPlayer[] = [
  // Shela United
  {
    playerId: "p-001",
    name: "Jamal Abubakar",
    nickname: "The Wall",
    teamId: "team-001",
    position: "goalkeeper",
    jerseyNumber: 1,
    matchesPlayed: 12,
    goals: 0,
    assists: 0,
    yellowCards: 1,
    redCards: 0,
    isVerified: true,
    nationality: "Kenyan",
  },
  {
    playerId: "p-002",
    name: "Hassan Mwende",
    nickname: "Rocket",
    teamId: "team-001",
    position: "forward",
    jerseyNumber: 9,
    matchesPlayed: 12,
    goals: 11,
    assists: 4,
    yellowCards: 2,
    redCards: 0,
    isVerified: true,
    nationality: "Kenyan",
  },
  {
    playerId: "p-003",
    name: "Omar Kiprotich",
    nickname: "Bullet",
    teamId: "team-001",
    position: "midfielder",
    jerseyNumber: 8,
    matchesPlayed: 11,
    goals: 5,
    assists: 7,
    yellowCards: 1,
    redCards: 0,
    isVerified: true,
    nationality: "Kenyan",
  },
  {
    playerId: "p-004",
    name: "Ali Ndegwa",
    nickname: "Iron",
    teamId: "team-001",
    position: "defender",
    jerseyNumber: 4,
    matchesPlayed: 12,
    goals: 1,
    assists: 2,
    yellowCards: 3,
    redCards: 0,
    isVerified: true,
    nationality: "Kenyan",
  },
  {
    playerId: "p-005",
    name: "Yusuf Otieno",
    nickname: "Flash",
    teamId: "team-001",
    position: "forward",
    jerseyNumber: 11,
    matchesPlayed: 10,
    goals: 7,
    assists: 3,
    yellowCards: 1,
    redCards: 0,
    isVerified: false,
    nationality: "Kenyan",
  },

  // Hindi Warriors
  {
    playerId: "p-006",
    name: "Rashid Kamau",
    nickname: "Panther",
    teamId: "team-002",
    position: "forward",
    jerseyNumber: 10,
    matchesPlayed: 12,
    goals: 9,
    assists: 5,
    yellowCards: 2,
    redCards: 0,
    isVerified: true,
    nationality: "Kenyan",
  },
  {
    playerId: "p-007",
    name: "Salim Mungai",
    nickname: "Tide",
    teamId: "team-002",
    position: "midfielder",
    jerseyNumber: 6,
    matchesPlayed: 12,
    goals: 4,
    assists: 8,
    yellowCards: 1,
    redCards: 0,
    isVerified: true,
    nationality: "Kenyan",
  },
  {
    playerId: "p-008",
    name: "Ahmed Wanjiku",
    nickname: "Storm",
    teamId: "team-002",
    position: "defender",
    jerseyNumber: 3,
    matchesPlayed: 11,
    goals: 2,
    assists: 1,
    yellowCards: 4,
    redCards: 1,
    isVerified: true,
    nationality: "Kenyan",
  },
  {
    playerId: "p-009",
    name: "Said Ochieng",
    nickname: "Lion",
    teamId: "team-002",
    position: "goalkeeper",
    jerseyNumber: 1,
    matchesPlayed: 12,
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    isVerified: false,
    nationality: "Kenyan",
  },
  {
    playerId: "p-010",
    name: "Hamisi Njoroge",
    nickname: "Hawk",
    teamId: "team-002",
    position: "forward",
    jerseyNumber: 7,
    matchesPlayed: 10,
    goals: 6,
    assists: 2,
    yellowCards: 2,
    redCards: 0,
    isVerified: true,
    nationality: "Kenyan",
  },

  // Mkunguni FC
  {
    playerId: "p-011",
    name: "Idris Cheruiyot",
    nickname: "Ghost",
    teamId: "team-003",
    position: "midfielder",
    jerseyNumber: 8,
    matchesPlayed: 12,
    goals: 6,
    assists: 6,
    yellowCards: 1,
    redCards: 0,
    isVerified: true,
    nationality: "Kenyan",
  },
  {
    playerId: "p-012",
    name: "Baraka Muya",
    nickname: "Seal",
    teamId: "team-003",
    position: "goalkeeper",
    jerseyNumber: 1,
    matchesPlayed: 12,
    goals: 0,
    assists: 1,
    yellowCards: 2,
    redCards: 0,
    isVerified: true,
    nationality: "Kenyan",
  },
  {
    playerId: "p-013",
    name: "Juma Langat",
    nickname: "Thunder",
    teamId: "team-003",
    position: "forward",
    jerseyNumber: 9,
    matchesPlayed: 11,
    goals: 5,
    assists: 3,
    yellowCards: 2,
    redCards: 0,
    isVerified: false,
    nationality: "Kenyan",
  },
  {
    playerId: "p-014",
    name: "Farid Kiptoo",
    nickname: "Wind",
    teamId: "team-003",
    position: "defender",
    jerseyNumber: 5,
    matchesPlayed: 12,
    goals: 1,
    assists: 2,
    yellowCards: 3,
    redCards: 0,
    isVerified: true,
    nationality: "Kenyan",
  },
  {
    playerId: "p-015",
    name: "Khalid Rono",
    nickname: "Eagle",
    teamId: "team-003",
    position: "midfielder",
    jerseyNumber: 7,
    matchesPlayed: 10,
    goals: 4,
    assists: 4,
    yellowCards: 1,
    redCards: 0,
    isVerified: true,
    nationality: "Kenyan",
  },

  // Langoni Stars
  {
    playerId: "p-016",
    name: "Musa Koech",
    nickname: "Star",
    teamId: "team-004",
    position: "forward",
    jerseyNumber: 11,
    matchesPlayed: 12,
    goals: 8,
    assists: 3,
    yellowCards: 2,
    redCards: 0,
    isVerified: true,
    nationality: "Kenyan",
  },
  {
    playerId: "p-017",
    name: "Ahmed Kiptanui",
    nickname: "Flame",
    teamId: "team-004",
    position: "midfielder",
    jerseyNumber: 6,
    matchesPlayed: 11,
    goals: 3,
    assists: 7,
    yellowCards: 1,
    redCards: 0,
    isVerified: true,
    nationality: "Kenyan",
  },
  {
    playerId: "p-018",
    name: "Ibrahim Bett",
    nickname: "Rock",
    teamId: "team-004",
    position: "defender",
    jerseyNumber: 4,
    matchesPlayed: 12,
    goals: 1,
    assists: 1,
    yellowCards: 4,
    redCards: 0,
    isVerified: false,
    nationality: "Kenyan",
  },
  {
    playerId: "p-019",
    name: "Yunus Korir",
    nickname: "Shade",
    teamId: "team-004",
    position: "goalkeeper",
    jerseyNumber: 1,
    matchesPlayed: 12,
    goals: 0,
    assists: 0,
    yellowCards: 1,
    redCards: 0,
    isVerified: true,
    nationality: "Kenyan",
  },

  // Mkomani Eagles
  {
    playerId: "p-020",
    name: "Daniel Kimeto",
    nickname: "Condor",
    teamId: "team-005",
    position: "forward",
    jerseyNumber: 9,
    matchesPlayed: 12,
    goals: 7,
    assists: 2,
    yellowCards: 2,
    redCards: 0,
    isVerified: true,
    nationality: "Kenyan",
  },
  {
    playerId: "p-021",
    name: "Peter Sang",
    nickname: "Swift",
    teamId: "team-005",
    position: "midfielder",
    jerseyNumber: 8,
    matchesPlayed: 11,
    goals: 3,
    assists: 5,
    yellowCards: 3,
    redCards: 0,
    isVerified: true,
    nationality: "Kenyan",
  },

  // Lamu Town FC
  {
    playerId: "p-022",
    name: "Boniface Kigen",
    nickname: "Baron",
    teamId: "team-006",
    position: "midfielder",
    jerseyNumber: 7,
    matchesPlayed: 12,
    goals: 5,
    assists: 4,
    yellowCards: 2,
    redCards: 1,
    isVerified: true,
    nationality: "Kenyan",
  },
  {
    playerId: "p-023",
    name: "Emmanuel Chesang",
    nickname: "Spike",
    teamId: "team-006",
    position: "forward",
    jerseyNumber: 11,
    matchesPlayed: 10,
    goals: 4,
    assists: 2,
    yellowCards: 1,
    redCards: 0,
    isVerified: false,
    nationality: "Kenyan",
  },
];

export const MOCK_MATCHES: MockMatch[] = [
  // Played matches
  {
    matchId: "m-001",
    homeTeamId: "team-001",
    awayTeamId: "team-002",
    homeScore: 3,
    awayScore: 1,
    date: "2026-02-15T15:00:00",
    status: "played",
    mvpPlayerId: "p-002",
    commentary: [
      {
        minute: 1,
        type: "kickoff",
        text: "Kick-off! Shela United vs Hindi Warriors. The island derby begins!",
      },
      {
        minute: 12,
        type: "goal",
        text: "GOAL! Hassan Mwende (Shela United) fires from 20 yards — it's in the top corner!",
        playerId: "p-002",
      },
      {
        minute: 28,
        type: "yellow_card",
        text: "Yellow card for Ahmed Wanjiku (Hindi Warriors) for a late tackle.",
        playerId: "p-008",
      },
      {
        minute: 35,
        type: "goal",
        text: "GOAL! Rashid Kamau (Hindi Warriors) equalizes with a header from a corner!",
        playerId: "p-006",
      },
      {
        minute: 45,
        type: "halftime",
        text: "Half-time: Shela United 1-1 Hindi Warriors. What a first half!",
      },
      {
        minute: 58,
        type: "goal",
        text: "GOAL! Hassan Mwende strikes again — his second of the game. Shela lead!",
        playerId: "p-002",
      },
      {
        minute: 71,
        type: "yellow_card",
        text: "Yellow card for Yusuf Otieno (Shela United).",
        playerId: "p-005",
      },
      {
        minute: 85,
        type: "goal",
        text: "GOAL! Omar Kiprotich seals it with a stunning strike from outside the box!",
        playerId: "p-003",
      },
      {
        minute: 90,
        type: "fulltime",
        text: "Full-time: Shela United 3-1 Hindi Warriors. Island pride!",
      },
    ],
  },
  {
    matchId: "m-002",
    homeTeamId: "team-003",
    awayTeamId: "team-004",
    homeScore: 2,
    awayScore: 2,
    date: "2026-02-20T15:00:00",
    status: "played",
    mvpPlayerId: "p-016",
    commentary: [
      { minute: 1, type: "kickoff", text: "Kick-off at Mkunguni Ground!" },
      {
        minute: 22,
        type: "goal",
        text: "GOAL! Idris Cheruiyot with a rocket from midfield!",
        playerId: "p-011",
      },
      {
        minute: 45,
        type: "halftime",
        text: "Half-time: Mkunguni FC 1-0 Langoni Stars.",
      },
      {
        minute: 55,
        type: "goal",
        text: "GOAL! Musa Koech equalizes for Langoni Stars with a penalty!",
        playerId: "p-016",
      },
      {
        minute: 68,
        type: "goal",
        text: "GOAL! Juma Langat puts Mkunguni back ahead!",
        playerId: "p-013",
      },
      {
        minute: 89,
        type: "goal",
        text: "GOAL! Musa Koech saves the point for Langoni Stars in the 89th minute!",
        playerId: "p-016",
      },
      {
        minute: 90,
        type: "fulltime",
        text: "Full-time: Mkunguni FC 2-2 Langoni Stars. Drama!",
      },
    ],
  },
  {
    matchId: "m-003",
    homeTeamId: "team-005",
    awayTeamId: "team-006",
    homeScore: 1,
    awayScore: 0,
    date: "2026-02-22T16:00:00",
    status: "played",
    mvpPlayerId: "p-020",
    commentary: [
      {
        minute: 1,
        type: "kickoff",
        text: "Kick-off! Mkomani Eagles host Lamu Town FC.",
      },
      {
        minute: 67,
        type: "goal",
        text: "GOAL! Daniel Kimeto breaks the deadlock with a header!",
        playerId: "p-020",
      },
      {
        minute: 90,
        type: "fulltime",
        text: "Full-time: Mkomani Eagles 1-0 Lamu Town FC.",
      },
    ],
  },
  {
    matchId: "m-004",
    homeTeamId: "team-002",
    awayTeamId: "team-003",
    homeScore: 3,
    awayScore: 0,
    date: "2026-02-25T15:00:00",
    status: "played",
    mvpPlayerId: "p-006",
    commentary: [
      {
        minute: 1,
        type: "kickoff",
        text: "Hindi Warriors look to bounce back!",
      },
      {
        minute: 8,
        type: "goal",
        text: "GOAL! Rashid Kamau opens the scoring — 1-0!",
        playerId: "p-006",
      },
      {
        minute: 34,
        type: "goal",
        text: "GOAL! Hamisi Njoroge doubles the lead!",
        playerId: "p-010",
      },
      {
        minute: 45,
        type: "halftime",
        text: "Half-time: Hindi Warriors 2-0 Mkunguni FC.",
      },
      {
        minute: 78,
        type: "goal",
        text: "GOAL! Rashid Kamau completes his brace. 3-0!",
        playerId: "p-006",
      },
      {
        minute: 90,
        type: "fulltime",
        text: "Full-time: Hindi Warriors 3-0 Mkunguni FC. Dominant display!",
      },
    ],
  },
  {
    matchId: "m-005",
    homeTeamId: "team-001",
    awayTeamId: "team-004",
    homeScore: 2,
    awayScore: 1,
    date: "2026-02-28T15:00:00",
    status: "played",
    mvpPlayerId: "p-002",
    commentary: [
      {
        minute: 1,
        type: "kickoff",
        text: "Shela United look to extend their lead at the top!",
      },
      {
        minute: 19,
        type: "goal",
        text: "GOAL! Yusuf Otieno gives Shela the lead!",
        playerId: "p-005",
      },
      {
        minute: 45,
        type: "halftime",
        text: "Half-time: Shela United 1-0 Langoni Stars.",
      },
      {
        minute: 60,
        type: "goal",
        text: "GOAL! Musa Koech equalizes for Langoni Stars!",
        playerId: "p-016",
      },
      {
        minute: 77,
        type: "goal",
        text: "GOAL! Hassan Mwende wins it late for Shela United!",
        playerId: "p-002",
      },
      {
        minute: 90,
        type: "fulltime",
        text: "Full-time: Shela United 2-1 Langoni Stars.",
      },
    ],
  },
  // Live match
  {
    matchId: "m-006",
    homeTeamId: "team-002",
    awayTeamId: "team-001",
    homeScore: 1,
    awayScore: 2,
    date: "2026-03-04T15:00:00",
    status: "live",
    commentary: [
      {
        minute: 1,
        type: "kickoff",
        text: "Kick-off! The rematch everyone has been waiting for!",
      },
      {
        minute: 15,
        type: "goal",
        text: "GOAL! Hassan Mwende scores again — Shela take the lead early!",
        playerId: "p-002",
      },
      {
        minute: 33,
        type: "yellow_card",
        text: "Yellow card shown to Salim Mungai for dissent.",
        playerId: "p-007",
      },
      {
        minute: 41,
        type: "goal",
        text: "GOAL! Rashid Kamau equalizes with a clinical finish!",
        playerId: "p-006",
      },
      {
        minute: 45,
        type: "halftime",
        text: "Half-time: Hindi Warriors 1-1 Shela United.",
      },
      {
        minute: 62,
        type: "goal",
        text: "GOAL! Omar Kiprotich puts Shela ahead again — stunning volley!",
        playerId: "p-003",
      },
      {
        minute: 67,
        type: "info",
        text: "Hindi Warriors pushing for an equalizer. Pressure building...",
      },
    ],
  },
  // Upcoming matches
  {
    matchId: "m-007",
    homeTeamId: "team-003",
    awayTeamId: "team-005",
    homeScore: 0,
    awayScore: 0,
    date: "2026-03-07T15:00:00",
    status: "scheduled",
    commentary: [],
  },
  {
    matchId: "m-008",
    homeTeamId: "team-004",
    awayTeamId: "team-006",
    homeScore: 0,
    awayScore: 0,
    date: "2026-03-08T15:00:00",
    status: "scheduled",
    commentary: [],
  },
  {
    matchId: "m-009",
    homeTeamId: "team-007",
    awayTeamId: "team-008",
    homeScore: 0,
    awayScore: 0,
    date: "2026-03-09T16:00:00",
    status: "scheduled",
    commentary: [],
  },
];

export const MOCK_NOTIFICATIONS: MockNotification[] = [
  {
    notificationId: "n-001",
    userId: "user-001",
    type: "alert",
    message: "GOAL! Hassan Mwende scores for Shela United in the 15th minute!",
    timestamp: "2026-03-04T15:15:00",
    isRead: false,
  },
  {
    notificationId: "n-002",
    userId: "user-001",
    type: "reminder",
    message: "Reminder: Mkunguni FC vs Mkomani Eagles tomorrow at 3:00 PM",
    timestamp: "2026-03-06T10:00:00",
    isRead: false,
  },
  {
    notificationId: "n-003",
    userId: "user-001",
    type: "message",
    message:
      "Vote for your MVP! Shela United vs Hindi Warriors match has ended.",
    timestamp: "2026-02-28T17:00:00",
    isRead: true,
  },
  {
    notificationId: "n-004",
    userId: "user-001",
    type: "alert",
    message: "Your team Shela United is top of the table with 26 points!",
    timestamp: "2026-02-28T18:00:00",
    isRead: true,
  },
  {
    notificationId: "n-005",
    userId: "user-001",
    type: "reminder",
    message: "League Round 7 fixtures are now available. Check the schedule!",
    timestamp: "2026-03-01T09:00:00",
    isRead: false,
  },
];

// Compute standings
export type StandingsEntry = {
  position: number;
  team: MockTeam;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  form: ("W" | "D" | "L")[];
};

export function computeStandings(): StandingsEntry[] {
  const entries: StandingsEntry[] = MOCK_TEAMS.map((team) => ({
    position: 0,
    team,
    played: team.wins + team.draws + team.losses,
    wins: team.wins,
    draws: team.draws,
    losses: team.losses,
    goalsFor: team.goalsFor,
    goalsAgainst: team.goalsAgainst,
    goalDiff: team.goalsFor - team.goalsAgainst,
    points: team.wins * 3 + team.draws,
    form: [] as ("W" | "D" | "L")[],
  }));

  // Sort: points desc, then GD desc, then GF desc
  entries.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
    return b.goalsFor - a.goalsFor;
  });

  // Assign positions and compute form (last 5 matches)
  entries.forEach((entry, i) => {
    entry.position = i + 1;
    const teamMatches = MOCK_MATCHES.filter(
      (m) =>
        m.status === "played" &&
        (m.homeTeamId === entry.team.teamId ||
          m.awayTeamId === entry.team.teamId),
    ).slice(-5);
    entry.form = teamMatches.map((m) => {
      const isHome = m.homeTeamId === entry.team.teamId;
      const teamScore = isHome ? m.homeScore : m.awayScore;
      const oppScore = isHome ? m.awayScore : m.homeScore;
      if (teamScore > oppScore) return "W";
      if (teamScore === oppScore) return "D";
      return "L";
    });
  });

  return entries;
}

// Top scorers
export type TopScorer = {
  rank: number;
  player: MockPlayer;
  team: MockTeam;
};

export function getTopScorers(): TopScorer[] {
  const sorted = [...MOCK_PLAYERS]
    .filter((p) => p.goals > 0)
    .sort((a, b) => b.goals - a.goals || b.assists - a.assists)
    .slice(0, 10);
  return sorted.map((p, i) => ({
    rank: i + 1,
    player: p,
    team: MOCK_TEAMS.find((t) => t.teamId === p.teamId)!,
  }));
}

export function getTopAssists(): TopScorer[] {
  const sorted = [...MOCK_PLAYERS]
    .filter((p) => p.assists > 0)
    .sort((a, b) => b.assists - a.assists || b.goals - a.goals)
    .slice(0, 10);
  return sorted.map((p, i) => ({
    rank: i + 1,
    player: p,
    team: MOCK_TEAMS.find((t) => t.teamId === p.teamId)!,
  }));
}

export function getAreaColor(area: string): string {
  const map: Record<string, string> = {
    Shela: "#E84B3A",
    Hindi: "#E87E3A",
    Mkunguni: "#3AE87E",
    Langoni: "#B03AE8",
    Mkomani: "#3A9BE8",
    "Lamu Town": "#E8C93A",
    Matondoni: "#3AE8D4",
    Kipungani: "#E83A7E",
  };
  return map[area] || "#E84B3A";
}

export function getPositionLabel(position: string): string {
  const map: Record<string, string> = {
    goalkeeper: "GK",
    defender: "DEF",
    midfielder: "MID",
    forward: "FWD",
  };
  return map[position] || position.toUpperCase();
}

export function getPositionColor(position: string): string {
  const map: Record<string, string> = {
    goalkeeper: "#F59E0B",
    defender: "#3B82F6",
    midfielder: "#10B981",
    forward: "#EF4444",
  };
  return map[position] || "#6B7280";
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export function formatMatchDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}
