import type {
  T__5 as BackendMatch,
  T__2 as BackendPlayer,
  T__1 as BackendTeam,
} from "@/backend";
import { TeamBadge } from "@/components/shared/TeamBadge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useActor } from "@/hooks/useActor";
import {
  getLocalPlayers,
  getLocalStore,
  setLocalStore,
} from "@/utils/localStore";
import { useNavigate, useParams } from "@tanstack/react-router";
import { CheckCircle2, ChevronLeft, Loader2, Trophy } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const MVP_VOTES_KEY = "lsh_mvp_votes";

function getMvpVotes(): Record<string, Record<string, string>> {
  return getLocalStore<Record<string, Record<string, string>>>(
    MVP_VOTES_KEY,
    {},
  );
}

function setMvpVote(matchId: string, userId: string, playerId: string) {
  const all = getMvpVotes();
  if (!all[matchId]) all[matchId] = {};
  all[matchId][userId] = playerId;
  setLocalStore(MVP_VOTES_KEY, all);
}

export function MVPVotePage() {
  const { matchId } = useParams({ strict: false }) as { matchId: string };
  const navigate = useNavigate();
  const { actor } = useActor();

  const [loading, setLoading] = useState(true);
  const [match, setMatch] = useState<BackendMatch | null>(null);
  const [teams, setTeams] = useState<BackendTeam[]>([]);
  const [homePlayers, setHomePlayers] = useState<BackendPlayer[]>([]);
  const [awayPlayers, setAwayPlayers] = useState<BackendPlayer[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const userId = getLocalStore<string>("lsh_session_name", "anon") || "anon";

  useEffect(() => {
    if (!actor) return;
    setLoading(true);
    Promise.all([
      actor.getAllMatches(),
      actor.getAllTeams(),
      actor.getAllPlayers(),
    ])
      .then(([matches, t, allPlayers]) => {
        const target = matchId
          ? (matches.find((m) => m.matchId === matchId) ?? matches[0])
          : matches[0];
        setMatch(target ?? null);
        setTeams(t);
        if (target) {
          const localPlayers = getLocalPlayers();
          const allP = [
            ...allPlayers,
            ...localPlayers
              .filter(
                (lp) => !allPlayers.some((bp) => bp.playerId === lp.playerId),
              )
              .map(
                (lp) =>
                  ({
                    playerId: lp.playerId,
                    userId: "",
                    name: lp.name,
                    nickname: lp.nickname,
                    teamId: lp.teamId,
                    position: lp.position as any,
                    jerseyNumber: BigInt(lp.jerseyNumber),
                    goals: BigInt(0),
                    assists: BigInt(0),
                    yellowCards: BigInt(0),
                    redCards: BigInt(0),
                    matchesPlayed: BigInt(0),
                    isVerified: false,
                    bio: "",
                    photoUrl: "",
                  }) as unknown as BackendPlayer,
              ),
          ];
          setHomePlayers(
            allP.filter((p) => p.teamId === target.homeTeam).slice(0, 5),
          );
          setAwayPlayers(
            allP.filter((p) => p.teamId === target.awayTeam).slice(0, 5),
          );

          // Check if already voted
          const votes = getMvpVotes();
          if (votes[target.matchId]?.[userId]) {
            setHasVoted(true);
            setSelectedPlayerId(votes[target.matchId][userId]);
          }
        }
      })
      .catch((err) => console.error("Failed to load MVP vote data:", err))
      .finally(() => setLoading(false));
  }, [actor, matchId, userId]);

  const allPlayers = [...homePlayers, ...awayPlayers];

  // Build vote tallies from local storage
  const votes = match ? (getMvpVotes()[match.matchId] ?? {}) : {};
  const tallies: Record<string, number> = {};
  for (const pid of Object.values(votes)) {
    tallies[pid] = (tallies[pid] ?? 0) + 1;
  }
  const totalVotes = Object.values(tallies).reduce((a, b) => a + b, 0);

  const handleVote = async () => {
    if (!selectedPlayerId || !match) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setMvpVote(match.matchId, userId, selectedPlayerId);
    setSubmitting(false);
    setHasVoted(true);
    toast.success("Vote submitted! Thank you for participating.");
  };

  const homeTeam = match
    ? teams.find((t) => t.teamId === match.homeTeam)
    : null;
  const awayTeam = match
    ? teams.find((t) => t.teamId === match.awayTeam)
    : null;
  const homeColor = "oklch(0.4 0.18 252)";
  const awayColor = "oklch(0.55 0.2 24)";

  if (loading) {
    return (
      <div className="min-h-screen pb-24 pt-14 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen pb-24 pt-14 flex flex-col items-center justify-center gap-3 px-4 text-center">
        <Trophy className="w-10 h-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          No matches available for voting yet.
        </p>
        <Button variant="outline" onClick={() => navigate({ to: "/matches" })}>
          Back to Matches
        </Button>
      </div>
    );
  }

  return (
    <div data-ocid="mvp_vote.page" className="min-h-screen pb-24 pt-14">
      {/* Back */}
      <button
        type="button"
        className="fixed top-14 left-0 z-40 flex items-center gap-1 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors bg-card/80 backdrop-blur-sm"
        onClick={() => navigate({ to: "/matches" })}
      >
        <ChevronLeft className="w-4 h-4" />
        Matches
      </button>

      {/* Header */}
      <div
        className="px-4 pt-8 pb-6"
        style={{
          background: `linear-gradient(135deg, ${homeColor}40 0%, oklch(0.1 0.04 252) 50%, ${awayColor}40 100%)`,
        }}
      >
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="flex items-center gap-2">
              {homeTeam && (
                <TeamBadge
                  team={{
                    teamId: homeTeam.teamId,
                    name: homeTeam.name,
                    area: homeTeam.area,
                    color: homeColor,
                  }}
                  size="sm"
                />
              )}
              <span className="font-bold text-sm">
                {homeTeam?.name ?? "Home"}
              </span>
            </div>
            <span className="font-black font-stats text-lg text-foreground">
              {Number(match.homeScore)} — {Number(match.awayScore)}
            </span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">
                {awayTeam?.name ?? "Away"}
              </span>
              {awayTeam && (
                <TeamBadge
                  team={{
                    teamId: awayTeam.teamId,
                    name: awayTeam.name,
                    area: awayTeam.area,
                    color: awayColor,
                  }}
                  size="sm"
                />
              )}
            </div>
          </div>
          <h1 className="font-display font-black text-xl text-foreground">
            Vote for MVP
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Choose the player of the match
          </p>
        </div>
      </div>

      <div className="px-4 mt-5">
        {allPlayers.length === 0 && !hasVoted && (
          <div className="rounded-xl border border-border bg-card py-12 flex flex-col items-center gap-3 text-center">
            <Trophy className="w-10 h-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              No players registered for these teams yet.
            </p>
            <p className="text-xs text-muted-foreground/60">
              Officials can register players in the Admin Panel.
            </p>
          </div>
        )}

        {!hasVoted && allPlayers.length > 0 && (
          <>
            <p className="text-xs text-muted-foreground mb-3 font-medium">
              Select a player:
            </p>
            <div
              className="grid grid-cols-2 gap-3 mb-5"
              data-ocid="mvp_vote.player.list"
            >
              {allPlayers.map((player, i) => {
                const team = teams.find((t) => t.teamId === player.teamId);
                const isHome = player.teamId === match.homeTeam;
                const color = isHome ? homeColor : awayColor;
                const isSelected = selectedPlayerId === player.playerId;
                return (
                  <motion.button
                    key={player.playerId}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: i * 0.06 }}
                    data-ocid={`mvp_vote.player.item.${i + 1}`}
                    className={`rounded-xl p-3 border-2 transition-all text-left relative overflow-hidden ${
                      isSelected
                        ? "border-accent bg-accent/10"
                        : "border-border bg-card hover:border-primary/40"
                    }`}
                    onClick={() =>
                      !hasVoted && setSelectedPlayerId(player.playerId)
                    }
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle2 className="w-4 h-4 text-accent" />
                      </div>
                    )}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-base font-black font-stats border-2 mb-2"
                      style={{
                        backgroundColor: color,
                        color: "oklch(0.95 0.02 82)",
                        borderColor: "oklch(0.95 0.02 82 / 0.3)",
                      }}
                    >
                      {Number(player.jerseyNumber)}
                    </div>
                    <div className="font-bold text-xs text-foreground leading-tight">
                      {player.name}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {team?.name ?? ""}
                    </div>
                    <div className="text-[10px] mt-1">
                      <span className="text-green-400 font-bold">
                        {Number(player.goals)}G
                      </span>{" "}
                      <span className="text-blue-400 font-bold">
                        {Number(player.assists)}A
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <Button
              className="w-full font-bold h-11"
              disabled={!selectedPlayerId || submitting}
              onClick={handleVote}
              data-ocid="mvp_vote.submit_button"
              style={
                selectedPlayerId
                  ? {
                      background:
                        "linear-gradient(135deg, oklch(0.6 0.22 24) 0%, oklch(0.55 0.25 20) 100%)",
                    }
                  : undefined
              }
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Vote ⭐"
              )}
            </Button>
          </>
        )}

        {hasVoted && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-4 mb-6"
          >
            <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-2" />
            <h2 className="font-display font-bold text-lg text-foreground">
              Vote Submitted!
            </h2>
            <p className="text-sm text-muted-foreground">
              Here are the current results:
            </p>
          </motion.div>
        )}

        {/* Vote tallies — shown after voting */}
        {hasVoted && allPlayers.length > 0 && (
          <div className="mt-4" data-ocid="mvp_vote.tally.list">
            <h3 className="font-bold text-xs text-muted-foreground uppercase tracking-wide mb-3">
              Current Vote Tallies
            </h3>
            <div className="space-y-3">
              {allPlayers
                .sort(
                  (a, b) =>
                    (tallies[b.playerId] ?? 0) - (tallies[a.playerId] ?? 0),
                )
                .map((player) => {
                  const team = teams.find((t) => t.teamId === player.teamId);
                  const isHome = player.teamId === match.homeTeam;
                  const color = isHome ? homeColor : awayColor;
                  const voteCount = tallies[player.playerId] ?? 0;
                  const pct =
                    totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
                  return (
                    <div
                      key={player.playerId}
                      className="flex items-center gap-3"
                    >
                      <div className="flex items-center gap-2 w-32 flex-shrink-0">
                        {team && (
                          <TeamBadge
                            team={{
                              teamId: team.teamId,
                              name: team.name,
                              area: team.area,
                              color,
                            }}
                            size="xs"
                          />
                        )}
                        <span className="text-xs font-medium text-foreground truncate">
                          {player.name.split(" ")[0]}
                        </span>
                      </div>
                      <div className="flex-1">
                        <Progress value={pct} className="h-2" />
                      </div>
                      <span className="text-xs font-black text-foreground w-8 text-right">
                        {voteCount}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
