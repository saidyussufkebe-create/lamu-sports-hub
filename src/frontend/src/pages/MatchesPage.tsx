import { MatchCard } from "@/components/shared/MatchCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MOCK_MATCHES, MOCK_TEAMS } from "@/data/mockData";
import {
  getMatchPitches,
  getMatchReferees,
  getPitches,
  getReferees,
  getSeasonSettings,
} from "@/utils/localStore";
import { useNavigate } from "@tanstack/react-router";
import { Calendar } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

export function MatchesPage() {
  const navigate = useNavigate();
  const [division, setDivision] = useState<"senior" | "u18">("senior");

  useEffect(() => {
    document.title =
      "Fixtures & Results – Lamu Sports Hub | Lamu Football Matches";
  }, []);

  const { seasonName, tournamentName } = getSeasonSettings();

  const upcomingMatches = MOCK_MATCHES.filter((m) => m.status === "scheduled");
  const liveMatches = MOCK_MATCHES.filter((m) => m.status === "live");
  const playedMatches = MOCK_MATCHES.filter(
    (m) => m.status === "played",
  ).reverse();

  const defaultTab = liveMatches.length > 0 ? "live" : "upcoming";

  // Referee lookup
  const allReferees = getReferees();
  const matchRefereeMap = getMatchReferees();
  const getRefereeName = (matchId: string): string | undefined => {
    const refId = matchRefereeMap[matchId];
    if (!refId) return undefined;
    return allReferees.find((r) => r.refereeId === refId)?.name;
  };

  // Pitch lookup
  const allPitches = getPitches();
  const matchPitchMap = getMatchPitches();
  const getPitchName = (matchId: string): string | undefined => {
    const pitchId = matchPitchMap[matchId];
    if (!pitchId) return undefined;
    return allPitches.find((p) => p.pitchId === pitchId)?.name;
  };

  return (
    <div data-ocid="matches.page" className="min-h-screen pb-24 pt-14">
      {/* Header */}
      <div
        className="px-4 py-5"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.1 0.04 255) 0%, oklch(0.14 0.06 252) 100%)",
        }}
      >
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h1 className="font-display font-black text-2xl text-foreground flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            Fixtures & Results
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Season {seasonName} — {tournamentName}
          </p>
        </motion.div>
      </div>

      {/* Division Toggle */}
      <div className="px-4 pt-4 flex gap-2" data-ocid="matches.division.toggle">
        <button
          type="button"
          onClick={() => setDivision("senior")}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border ${
            division === "senior"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card border-border text-muted-foreground hover:border-primary/40"
          }`}
          data-ocid="matches.senior.tab"
        >
          Senior
        </button>
        <button
          type="button"
          onClick={() => setDivision("u18")}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border ${
            division === "u18"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card border-border text-muted-foreground hover:border-primary/40"
          }`}
          data-ocid="matches.u18.tab"
        >
          Under-18
        </button>
      </div>

      {division === "u18" ? (
        <div className="px-4 mt-4" data-ocid="matches.u18.panel">
          <div className="rounded-xl border border-border bg-card p-8 text-center space-y-3">
            <span className="text-4xl">🏃</span>
            <h2 className="font-display font-black text-lg text-foreground">
              Under-18 League
            </h2>
            <p className="text-sm text-muted-foreground">
              Registration Open — Season {seasonName}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The U18 League is open for team registrations. Contact officials
              to register a youth team and be part of Lamu's next generation of
              football talent.
            </p>
            <button
              type="button"
              className="mt-2 px-4 py-2 rounded-lg text-xs font-bold text-primary border border-primary/40 hover:bg-primary/10 transition-all"
              onClick={() => navigate({ to: "/about" })}
              data-ocid="matches.u18.contact_button"
            >
              Contact Officials →
            </button>
          </div>
        </div>
      ) : (
        <Tabs defaultValue={defaultTab} className="px-4 pt-4">
          <TabsList
            className="w-full grid grid-cols-3 mb-4"
            data-ocid="matches.tab"
          >
            <TabsTrigger value="upcoming" className="text-xs">
              Upcoming ({upcomingMatches.length})
            </TabsTrigger>
            <TabsTrigger value="live" className="text-xs">
              {liveMatches.length > 0 && (
                <span className="live-indicator mr-1 w-1.5 h-1.5 rounded-full bg-accent inline-block" />
              )}
              Live ({liveMatches.length})
            </TabsTrigger>
            <TabsTrigger value="results" className="text-xs">
              Results ({playedMatches.length})
            </TabsTrigger>
          </TabsList>

          {/* Upcoming */}
          <TabsContent value="upcoming">
            <div className="space-y-3" data-ocid="matches.list">
              {upcomingMatches.length === 0 ? (
                <div
                  className="text-center py-12 text-muted-foreground"
                  data-ocid="matches.empty_state"
                >
                  <Calendar className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No upcoming matches scheduled</p>
                </div>
              ) : (
                upcomingMatches.map((match, i) => {
                  const home = MOCK_TEAMS.find(
                    (t) => t.teamId === match.homeTeamId,
                  )!;
                  const away = MOCK_TEAMS.find(
                    (t) => t.teamId === match.awayTeamId,
                  )!;
                  return (
                    <motion.div
                      key={match.matchId}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: i * 0.06 }}
                      data-ocid={`matches.item.${i + 1}`}
                    >
                      <MatchCard
                        match={match}
                        homeTeam={home}
                        awayTeam={away}
                        onClick={() => navigate({ to: "/matches" })}
                        refereeName={getRefereeName(match.matchId)}
                        pitchName={getPitchName(match.matchId)}
                      />
                    </motion.div>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* Live */}
          <TabsContent value="live">
            <div className="space-y-3">
              {liveMatches.length === 0 ? (
                <div
                  className="text-center py-12 text-muted-foreground"
                  data-ocid="matches.empty_state"
                >
                  <div className="w-10 h-10 rounded-full border-2 border-muted mx-auto mb-2 flex items-center justify-center">
                    <span className="text-lg">⚽</span>
                  </div>
                  <p className="text-sm">No matches currently live</p>
                </div>
              ) : (
                liveMatches.map((match, i) => {
                  const home = MOCK_TEAMS.find(
                    (t) => t.teamId === match.homeTeamId,
                  )!;
                  const away = MOCK_TEAMS.find(
                    (t) => t.teamId === match.awayTeamId,
                  )!;
                  return (
                    <motion.div
                      key={match.matchId}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: i * 0.06 }}
                      data-ocid={`matches.item.${i + 1}`}
                    >
                      <MatchCard
                        match={match}
                        homeTeam={home}
                        awayTeam={away}
                        onClick={() =>
                          navigate({ to: `/matchday/${match.matchId}` })
                        }
                        refereeName={getRefereeName(match.matchId)}
                        pitchName={getPitchName(match.matchId)}
                      />
                    </motion.div>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* Results */}
          <TabsContent value="results">
            <div className="space-y-3">
              {playedMatches.map((match, i) => {
                const home = MOCK_TEAMS.find(
                  (t) => t.teamId === match.homeTeamId,
                )!;
                const away = MOCK_TEAMS.find(
                  (t) => t.teamId === match.awayTeamId,
                )!;
                return (
                  <motion.div
                    key={match.matchId}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: i * 0.06 }}
                    data-ocid={`matches.item.${i + 1}`}
                  >
                    <MatchCard
                      match={match}
                      homeTeam={home}
                      awayTeam={away}
                      onClick={() =>
                        navigate({ to: `/matchday/${match.matchId}` })
                      }
                      refereeName={getRefereeName(match.matchId)}
                      pitchName={getPitchName(match.matchId)}
                    />
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
