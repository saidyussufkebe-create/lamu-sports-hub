import type {
  T__5 as BackendMatch,
  T__2 as BackendPlayer,
  T__1 as BackendTeam,
} from "@/backend";
import { TeamBadge } from "@/components/shared/TeamBadge";
import { useActor } from "@/hooks/useActor";
import {
  getMatchPitches,
  getMatchReferees,
  getPitches,
  getReferees,
} from "@/utils/localStore";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  AlertTriangle,
  Calendar,
  Clock,
  Flag,
  Info,
  Loader2,
  MapPin,
  Square,
  Target,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

type CommentaryType =
  | "goal"
  | "yellow_card"
  | "red_card"
  | "kickoff"
  | "halftime"
  | "fulltime"
  | "substitution"
  | "info";

function parseCommentaryType(line: string): CommentaryType {
  const lower = line.toLowerCase();
  if (lower.includes("goal") || lower.includes("⚽")) return "goal";
  if (lower.includes("yellow") || lower.includes("🟨")) return "yellow_card";
  if (lower.includes("red card") || lower.includes("🟥")) return "red_card";
  if (
    lower.includes("kick off") ||
    lower.includes("kickoff") ||
    lower.includes("🏁")
  )
    return "kickoff";
  if (
    lower.includes("half time") ||
    lower.includes("halftime") ||
    lower.includes("half-time")
  )
    return "halftime";
  if (
    lower.includes("full time") ||
    lower.includes("fulltime") ||
    lower.includes("full-time") ||
    lower.includes("final")
  )
    return "fulltime";
  if (lower.includes("sub") || lower.includes("substitut"))
    return "substitution";
  return "info";
}

function parseMinute(line: string): string {
  const match = line.match(/^(\d+)['′\s]/);
  return match ? match[1] : "–";
}

function stripMinutePrefix(line: string): string {
  return line.replace(/^\d+['′\s]+/, "").trim();
}

function CommentaryIcon({ type }: { type: CommentaryType }) {
  const map: Record<CommentaryType, React.ReactNode> = {
    goal: <Target className="w-4 h-4 text-green-400" />,
    yellow_card: <AlertTriangle className="w-4 h-4 text-yellow-400" />,
    red_card: <Square className="w-4 h-4 text-red-500" />,
    kickoff: <Flag className="w-4 h-4 text-primary" />,
    halftime: <Clock className="w-4 h-4 text-orange-400" />,
    fulltime: <Clock className="w-4 h-4 text-foreground" />,
    substitution: <Info className="w-4 h-4 text-blue-400" />,
    info: <Info className="w-4 h-4 text-muted-foreground" />,
  };
  return <>{map[type] || <Info className="w-4 h-4 text-muted-foreground" />}</>;
}

function CommentaryBg(type: CommentaryType): string {
  const map: Record<CommentaryType, string> = {
    goal: "bg-green-500/10 border-green-500/30",
    yellow_card: "bg-yellow-500/10 border-yellow-500/30",
    red_card: "bg-red-500/10 border-red-500/30",
    kickoff: "bg-primary/10 border-primary/30",
    halftime: "bg-orange-500/10 border-orange-500/30",
    fulltime: "bg-muted/20 border-border",
    substitution: "bg-blue-500/10 border-blue-500/30",
    info: "bg-card border-border/50",
  };
  return map[type] || "bg-card border-border/50";
}

function formatMatchDate(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  if (!ms) return "—";
  return new Date(ms).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getTeamColor(teamId: string): string {
  const colors = [
    "oklch(0.55 0.18 252)",
    "oklch(0.55 0.18 145)",
    "oklch(0.6 0.22 24)",
    "oklch(0.55 0.15 82)",
    "oklch(0.55 0.18 300)",
    "oklch(0.55 0.18 200)",
  ];
  const idx =
    Math.abs(
      (teamId.charCodeAt(0) ?? 0) + (teamId.charCodeAt(teamId.length - 1) ?? 0),
    ) % colors.length;
  return colors[idx];
}

export function MatchdayPage() {
  const { matchId } = useParams({ strict: false }) as { matchId: string };
  const navigate = useNavigate();
  const { actor, isFetching } = useActor();

  const [match, setMatch] = useState<BackendMatch | null>(null);
  const [homeTeam, setHomeTeam] = useState<BackendTeam | null>(null);
  const [awayTeam, setAwayTeam] = useState<BackendTeam | null>(null);
  const [mvpPlayer, setMvpPlayer] = useState<BackendPlayer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!actor || isFetching || !matchId) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const m = await actor.getMatch(matchId);
        if (!m) {
          setError("Match not found.");
          return;
        }
        setMatch(m);

        // Load both teams in parallel
        const [home, away] = await Promise.all([
          actor.getTeam(m.homeTeam),
          actor.getTeam(m.awayTeam),
        ]);
        setHomeTeam(home ?? null);
        setAwayTeam(away ?? null);

        // Load MVP player if set
        if (m.mvpPlayerId) {
          const mvp = await actor.getPlayer(m.mvpPlayerId);
          setMvpPlayer(mvp ?? null);
        }
      } catch (err) {
        console.error("Failed to load matchday data:", err);
        setError("Failed to load match. Please go back and try again.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [actor, isFetching, matchId]);

  // Referee lookup
  const matchRefereeMap = getMatchReferees();
  const allReferees = getReferees();
  const assignedRefereeId = matchId ? matchRefereeMap[matchId] : undefined;
  const assignedReferee = assignedRefereeId
    ? allReferees.find((r) => r.refereeId === assignedRefereeId)
    : null;

  // Pitch lookup
  const matchPitchMap = getMatchPitches();
  const allPitches = getPitches();
  const assignedPitchId = matchId ? matchPitchMap[matchId] : undefined;
  const assignedPitch = assignedPitchId
    ? allPitches.find((p) => p.pitchId === assignedPitchId)
    : null;

  if (loading || isFetching) {
    return (
      <div
        className="min-h-screen pb-24 pt-14 flex flex-col items-center justify-center gap-4"
        data-ocid="matchday.loading_state"
      >
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading match...</p>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div
        className="min-h-screen pb-24 pt-14 flex flex-col items-center justify-center gap-4 px-6 text-center"
        data-ocid="matchday.error_state"
      >
        <span className="text-4xl">⚽</span>
        <p className="font-bold text-foreground">
          {error ?? "Match not found."}
        </p>
        <button
          type="button"
          onClick={() => navigate({ to: "/matches" })}
          className="px-4 py-2 rounded-xl text-sm font-bold text-white"
          style={{ background: "oklch(0.55 0.18 252)" }}
          data-ocid="matchday.go_back.button"
        >
          ← Back to Matches
        </button>
      </div>
    );
  }

  const statusStr = String(match.status);
  const isLive = statusStr.includes("live");
  const isPlayed = statusStr.includes("played");

  const homeColor = getTeamColor(match.homeTeam);
  const awayColor = getTeamColor(match.awayTeam);

  const homeTeamForBadge = homeTeam
    ? { teamId: homeTeam.teamId, name: homeTeam.name, area: homeTeam.area }
    : { teamId: match.homeTeam, name: match.homeTeam.slice(0, 6), area: "" };

  const awayTeamForBadge = awayTeam
    ? { teamId: awayTeam.teamId, name: awayTeam.name, area: awayTeam.area }
    : { teamId: match.awayTeam, name: match.awayTeam.slice(0, 6), area: "" };

  // Parse commentary strings into structured entries
  const commentary = (match.commentary ?? []).map((line) => ({
    type: parseCommentaryType(line),
    minute: parseMinute(line),
    text: stripMinutePrefix(line) || line,
  }));
  const reversedCommentary = [...commentary].reverse();

  return (
    <div data-ocid="matchday.page" className="min-h-screen pb-24 pt-14">
      {/* Back */}
      <button
        type="button"
        className="fixed top-14 left-0 z-40 flex items-center gap-1 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors bg-card/80 backdrop-blur-sm"
        onClick={() => navigate({ to: "/matches" })}
        data-ocid="matchday.back.button"
      >
        <X className="w-4 h-4" />
        Matches
      </button>

      {/* Score hero */}
      <div
        className="pt-8 pb-8 px-4 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${homeColor}40 0%, oklch(0.1 0.04 252) 40%, ${awayColor}40 100%)`,
        }}
        data-ocid="matchday.score.card"
      >
        {/* Status badge */}
        <div className="flex justify-center mb-4">
          {isLive && (
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/20 border border-accent/40">
              <span className="live-indicator w-2 h-2 rounded-full bg-accent" />
              <span className="font-bold text-sm text-accent tracking-widest uppercase">
                Live
              </span>
              {commentary.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {commentary[commentary.length - 1].minute}'
                </span>
              )}
            </div>
          )}
          {isPlayed && (
            <div className="px-4 py-1.5 rounded-full bg-muted/40 border border-border">
              <span className="font-bold text-sm text-muted-foreground uppercase tracking-widest">
                Full Time
              </span>
            </div>
          )}
          {!isLive && !isPlayed && (
            <div className="px-4 py-1.5 rounded-full bg-primary/20 border border-primary/40">
              <span className="font-bold text-sm text-primary uppercase tracking-widest">
                Upcoming
              </span>
            </div>
          )}
        </div>

        {/* Teams + Score */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center justify-between gap-2"
        >
          {/* Home */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <TeamBadge team={homeTeamForBadge} size="xl" />
            <span className="font-display font-bold text-sm text-foreground text-center leading-tight">
              {homeTeam?.name ?? match.homeTeam}
            </span>
            <span className="text-xs text-muted-foreground">HOME</span>
          </div>

          {/* Score */}
          <div className="flex flex-col items-center flex-shrink-0 px-4">
            {isLive || isPlayed ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3"
              >
                <span className="font-black font-stats text-6xl text-foreground">
                  {Number(match.homeScore)}
                </span>
                <span className="text-3xl text-muted-foreground font-light">
                  —
                </span>
                <span className="font-black font-stats text-6xl text-foreground">
                  {Number(match.awayScore)}
                </span>
              </motion.div>
            ) : (
              <span className="font-black font-stats text-4xl text-muted-foreground">
                VS
              </span>
            )}
          </div>

          {/* Away */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <TeamBadge team={awayTeamForBadge} size="xl" />
            <span className="font-display font-bold text-sm text-foreground text-center leading-tight">
              {awayTeam?.name ?? match.awayTeam}
            </span>
            <span className="text-xs text-muted-foreground">AWAY</span>
          </div>
        </motion.div>

        {/* MVP */}
        {mvpPlayer && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-5 flex items-center justify-center gap-2"
          >
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30">
              <span className="text-yellow-400">⭐</span>
              <span className="text-xs text-yellow-400 font-bold">
                MVP: {mvpPlayer.name}
              </span>
            </div>
          </motion.div>
        )}

        {/* Match Meta: Date, Time, Referee */}
        <motion.div
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-4 flex flex-wrap items-center justify-center gap-3"
        >
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatMatchDate(match.date)}</span>
          </div>
          {match.kickoffTime && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>KO {match.kickoffTime}</span>
            </div>
          )}
          {assignedReferee && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <User className="w-3.5 h-3.5" />
              <span>
                Referee:{" "}
                <span className="font-medium text-foreground">
                  {assignedReferee.name}
                </span>
              </span>
            </div>
          )}
          {assignedPitch && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              <span className="font-medium text-foreground">
                {assignedPitch.name}
              </span>
            </div>
          )}
        </motion.div>
      </div>

      {/* Matchday Stories Commentary */}
      {commentary.length > 0 && (
        <div className="px-4 mt-5">
          <h2 className="font-display font-bold text-sm text-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <span className="text-base">📲</span>
            Matchday Stories
          </h2>

          <div className="space-y-2" data-ocid="matchday.commentary.list">
            <AnimatePresence>
              {reversedCommentary.map((entry, i) => (
                <motion.div
                  // biome-ignore lint/suspicious/noArrayIndexKey: commentary order is stable
                  key={`commentary-${i}`}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  data-ocid={`matchday.story.item.${i + 1}`}
                  className={`rounded-xl p-3 border flex items-start gap-3 ${CommentaryBg(entry.type)}`}
                >
                  {/* Minute */}
                  <div className="flex-shrink-0 w-8 text-center">
                    <span className="font-black font-stats text-xs text-muted-foreground">
                      {entry.minute}'
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    <CommentaryIcon type={entry.type} />
                  </div>

                  {/* Text */}
                  <p
                    className={`text-sm flex-1 leading-relaxed ${
                      entry.type === "goal"
                        ? "font-bold text-foreground"
                        : entry.type === "fulltime" || entry.type === "halftime"
                          ? "font-semibold text-foreground"
                          : "text-muted-foreground"
                    }`}
                  >
                    {entry.text}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {commentary.length === 0 && !isLive && !isPlayed && (
        <div className="px-4 mt-8 text-center">
          <div className="rounded-xl p-8 border border-border bg-card/50">
            <span className="text-4xl mb-3 block">⏰</span>
            <p className="font-bold text-foreground mb-1">
              Match not started yet
            </p>
            <p className="text-sm text-muted-foreground">
              Live commentary will appear here once the match begins.
            </p>
          </div>
        </div>
      )}

      {commentary.length === 0 && isPlayed && (
        <div className="px-4 mt-8 text-center">
          <div className="rounded-xl p-8 border border-border bg-card/50">
            <span className="text-4xl mb-3 block">🏁</span>
            <p className="font-bold text-foreground mb-1">Match finished</p>
            <p className="text-sm text-muted-foreground">
              No commentary was recorded for this match.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
