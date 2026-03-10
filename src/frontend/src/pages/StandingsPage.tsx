import type { T__5 as BackendMatch, T__1 as BackendTeam } from "@/backend";
import { TeamBadge } from "@/components/shared/TeamBadge";
import { useActor } from "@/hooks/useActor";
import { getSeasonSettings } from "@/utils/localStore";
import { computeBackendStandings } from "@/utils/standingsUtils";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

type FormBadge = "W" | "D" | "L";

function FormBadgeComp({ result }: { result: FormBadge }) {
  const map = {
    W: "bg-green-500/80 text-white",
    D: "bg-yellow-500/80 text-white",
    L: "bg-red-500/80 text-white",
  };
  return (
    <span
      className={`w-4 h-4 rounded-sm text-[8px] font-black flex items-center justify-center ${map[result]}`}
    >
      {result}
    </span>
  );
}

export function StandingsPage() {
  const navigate = useNavigate();
  const { actor } = useActor();
  const [division, setDivision] = useState<"senior" | "u18">("senior");
  const { seasonName, tournamentName } = getSeasonSettings();

  const [teams, setTeams] = useState<BackendTeam[]>([]);
  const [matches, setMatches] = useState<BackendMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title =
      "League Standings – Lamu Sports Hub | Lamu Football Tables";
  }, []);

  useEffect(() => {
    if (!actor) return;
    setLoading(true);
    Promise.all([actor.getAllTeams(), actor.getAllMatches()])
      .then(([t, m]) => {
        setTeams(t);
        setMatches(m);
      })
      .catch((err) => console.error("Failed to load standings data:", err))
      .finally(() => setLoading(false));
  }, [actor]);

  const standings = computeBackendStandings(teams, matches);

  // Derive summary stats from real data
  const topGoalsTeam =
    standings.length > 0
      ? standings.reduce(
          (a, b) => (b.goalsFor > a.goalsFor ? b : a),
          standings[0],
        )
      : null;
  const topPointsTeam =
    standings.length > 0
      ? standings.reduce((a, b) => (b.points > a.points ? b : a), standings[0])
      : null;
  const bestDefenceTeam =
    standings.length > 0
      ? standings.reduce(
          (a, b) => (b.goalsAgainst < a.goalsAgainst ? b : a),
          standings[0],
        )
      : null;

  return (
    <div data-ocid="standings.page" className="min-h-screen pb-24 pt-14">
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
          <h1 className="font-display font-black text-2xl text-foreground">
            League Table
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Season {seasonName} — {tournamentName}
          </p>
        </motion.div>
      </div>

      {/* Division Toggle */}
      <div
        className="px-4 pt-3 flex gap-2"
        data-ocid="standings.division.toggle"
      >
        <button
          type="button"
          onClick={() => setDivision("senior")}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border ${
            division === "senior"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card border-border text-muted-foreground hover:border-primary/40"
          }`}
          data-ocid="standings.senior.tab"
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
          data-ocid="standings.u18.tab"
        >
          Under-18
        </button>
      </div>

      {division === "u18" ? (
        <div className="px-4 mt-4" data-ocid="standings.u18.panel">
          <div className="rounded-xl border border-border bg-card p-8 text-center space-y-3">
            <span className="text-4xl">🏃</span>
            <h2 className="font-display font-black text-lg text-foreground">
              Under-18 League
            </h2>
            <p className="text-sm font-semibold text-muted-foreground">
              Launching Soon — Season {seasonName}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The U18 league standings will appear here once the season begins.
              Youth teams can register now — contact officials via the About
              page.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Zone legend */}
          <div className="px-4 pt-3 pb-2 flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-4 rounded-sm bg-primary" />
              <span className="text-[10px] text-muted-foreground">
                Champions Zone
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-4 rounded-sm bg-accent" />
              <span className="text-[10px] text-muted-foreground">
                Relegation Zone
              </span>
            </div>
          </div>

          {/* Table — horizontally scrollable on mobile */}
          <div className="px-4" data-ocid="standings.table">
            <div className="rounded-xl border border-border overflow-hidden bg-card shadow-card">
              <div className="overflow-x-auto">
                {/* Header */}
                <div
                  className="grid px-3 py-2.5 text-[10px] text-muted-foreground font-bold uppercase tracking-wider border-b border-border bg-muted/30"
                  style={{
                    gridTemplateColumns:
                      "28px minmax(100px,1fr) 26px 26px 26px 26px 30px 30px 30px 36px",
                    minWidth: 520,
                  }}
                >
                  <span>#</span>
                  <span>Club</span>
                  <span className="text-center">MP</span>
                  <span className="text-center">W</span>
                  <span className="text-center">D</span>
                  <span className="text-center">L</span>
                  <span className="text-center">GF</span>
                  <span className="text-center">GA</span>
                  <span className="text-center">GD</span>
                  <span className="text-center font-black">Pts</span>
                </div>

                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div
                      // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
                      key={i}
                      className="px-3 py-3.5 border-b border-border/40 last:border-0 animate-pulse"
                      style={{ minWidth: 520 }}
                    >
                      <div className="h-4 bg-muted/40 rounded w-full" />
                    </div>
                  ))
                ) : standings.length === 0 ? (
                  <div
                    className="px-3 py-12 text-center"
                    data-ocid="standings.empty_state"
                    style={{ minWidth: 520 }}
                  >
                    <p className="text-sm text-muted-foreground">
                      No teams registered yet. Check back soon.
                    </p>
                  </div>
                ) : (
                  standings.map((entry, i) => {
                    const isChampions = i < 2;
                    const isRelegation =
                      i >= standings.length - 2 && standings.length > 3;

                    return (
                      <motion.button
                        type="button"
                        key={entry.team.teamId}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.04 }}
                        data-ocid={`standings.row.${i + 1}`}
                        className={`w-full grid px-3 py-3 items-center border-b border-border/40 last:border-0 hover:bg-muted/20 cursor-pointer transition-colors relative text-left ${
                          isChampions
                            ? "zone-champions"
                            : isRelegation
                              ? "zone-relegation"
                              : ""
                        }`}
                        style={{
                          gridTemplateColumns:
                            "28px minmax(100px,1fr) 26px 26px 26px 26px 30px 30px 30px 36px",
                          minWidth: 520,
                        }}
                        onClick={() =>
                          navigate({ to: `/teams/${entry.team.teamId}` })
                        }
                      >
                        {/* Position */}
                        <span
                          className={`text-sm font-black ${
                            i === 0
                              ? "text-yellow-400"
                              : i === 1
                                ? "text-gray-300"
                                : i === 2
                                  ? "text-amber-600"
                                  : "text-muted-foreground"
                          }`}
                        >
                          {entry.position}
                        </span>

                        {/* Club */}
                        <div className="flex items-center gap-2 min-w-0">
                          <TeamBadge team={entry.team} size="sm" />
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-foreground truncate block">
                              {entry.team.name}
                            </span>
                            <div className="hidden sm:flex gap-0.5 mt-0.5">
                              {entry.form.map((f, fi) => (
                                // biome-ignore lint/suspicious/noArrayIndexKey: form order is stable
                                <FormBadgeComp key={`form-${fi}`} result={f} />
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* MP */}
                        <span className="text-xs text-center text-muted-foreground">
                          {entry.played}
                        </span>
                        {/* W */}
                        <span className="text-xs text-center font-semibold text-green-400">
                          {entry.wins}
                        </span>
                        {/* D */}
                        <span className="text-xs text-center text-yellow-400">
                          {entry.draws}
                        </span>
                        {/* L */}
                        <span className="text-xs text-center text-red-400">
                          {entry.losses}
                        </span>
                        {/* GF */}
                        <span className="text-xs text-center text-foreground">
                          {entry.goalsFor}
                        </span>
                        {/* GA */}
                        <span className="text-xs text-center text-muted-foreground">
                          {entry.goalsAgainst}
                        </span>
                        {/* GD */}
                        <span
                          className={`text-xs text-center font-bold ${
                            entry.goalDiff > 0
                              ? "text-green-400"
                              : entry.goalDiff < 0
                                ? "text-red-400"
                                : "text-muted-foreground"
                          }`}
                        >
                          {entry.goalDiff > 0 ? "+" : ""}
                          {entry.goalDiff}
                        </span>
                        {/* Pts */}
                        <span className="text-sm text-center font-black text-foreground">
                          {entry.points}
                        </span>
                      </motion.button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Stats footer */}
          {!loading && standings.length > 0 && (
            <div className="px-4 mt-4 grid grid-cols-3 gap-3">
              {[
                {
                  label: "Most Goals",
                  value: topGoalsTeam?.team.name ?? "—",
                  sub: topGoalsTeam ? `${topGoalsTeam.goalsFor} scored` : "",
                },
                {
                  label: "Top Points",
                  value: topPointsTeam?.team.name ?? "—",
                  sub: topPointsTeam ? `${topPointsTeam.points} pts` : "",
                },
                {
                  label: "Best Defence",
                  value: bestDefenceTeam?.team.name ?? "—",
                  sub: bestDefenceTeam
                    ? `${bestDefenceTeam.goalsAgainst} conceded`
                    : "",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg p-3 bg-card border border-border text-center"
                >
                  <div className="text-[10px] text-muted-foreground mb-1">
                    {stat.label}
                  </div>
                  <div className="text-xs font-bold text-foreground leading-tight">
                    {stat.value}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {stat.sub}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
