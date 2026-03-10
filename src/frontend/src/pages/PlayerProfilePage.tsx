import type { T__2 as BackendPlayer, T__1 as BackendTeam } from "@/backend";
import {
  AreaBadge,
  IslandPrideBadge,
  TeamBadge,
  getTeamColor,
} from "@/components/shared/TeamBadge";
import { Button } from "@/components/ui/button";
import { useActor } from "@/hooks/useActor";
import { getPlayerPhotos } from "@/utils/localStore";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  AlertTriangle,
  Loader2,
  Square,
  Star,
  Target,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

function getPositionLabel(pos: string): string {
  const map: Record<string, string> = {
    goalkeeper: "Goalkeeper",
    defender: "Defender",
    midfielder: "Midfielder",
    forward: "Forward",
  };
  return map[pos.toLowerCase()] || pos;
}

function getPositionColor(pos: string): string {
  const map: Record<string, string> = {
    goalkeeper: "oklch(0.55 0.18 252)",
    defender: "oklch(0.55 0.18 145)",
    midfielder: "oklch(0.6 0.22 24)",
    forward: "oklch(0.82 0.15 85)",
  };
  return map[pos.toLowerCase()] || "oklch(0.62 0 0)";
}

export function PlayerProfilePage() {
  const { playerId } = useParams({ strict: false }) as { playerId: string };
  const navigate = useNavigate();
  const { actor } = useActor();

  const [player, setPlayer] = useState<BackendPlayer | null>(null);
  const [team, setTeam] = useState<BackendTeam | null>(null);
  const [loading, setLoading] = useState(true);
  const playerPhotos = getPlayerPhotos();

  useEffect(() => {
    if (!actor || !playerId) return;
    setLoading(true);
    actor
      .getPlayer(playerId)
      .then(async (p) => {
        setPlayer(p);
        if (p?.teamId) {
          try {
            const t = await actor.getTeam(p.teamId);
            setTeam(t);
          } catch {
            // team fetch failed silently
          }
        }
      })
      .catch((err) => console.error("Failed to load player:", err))
      .finally(() => setLoading(false));
  }, [actor, playerId]);

  if (loading) {
    return (
      <div className="min-h-screen pb-24 pt-14 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen pb-24 pt-14 flex flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-muted-foreground">Player not found.</p>
        <Button variant="outline" onClick={() => navigate({ to: "/players" })}>
          Back to Players
        </Button>
      </div>
    );
  }

  const teamColor = team ? getTeamColor(team.teamId) : "oklch(0.4 0.06 255)";
  const posStr = String(player.position);
  const posColor = getPositionColor(posStr);
  const posLabel = getPositionLabel(posStr);
  const playerPhoto = playerPhotos[player.playerId];

  const goals = Number(player.goals);
  const assists = Number(player.assists);
  const matchesPlayed = Number(player.matchesPlayed);
  const yellowCards = Number(player.yellowCards);
  const redCards = Number(player.redCards);
  const jerseyNumber = Number(player.jerseyNumber);

  return (
    <div data-ocid="player_profile.page" className="min-h-screen pb-24 pt-14">
      {/* Back */}
      <button
        type="button"
        className="fixed top-14 left-0 z-40 flex items-center gap-1 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors bg-card/80 backdrop-blur-sm"
        onClick={() =>
          team
            ? navigate({ to: `/teams/${team.teamId}` })
            : navigate({ to: "/players" })
        }
        data-ocid="player_profile.back.button"
      >
        <X className="w-4 h-4" />
        {team ? team.name : "Players"}
      </button>

      {/* Hero */}
      <div
        className="pt-8 pb-8 px-4 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${teamColor}55 0%, oklch(0.12 0.04 252) 70%)`,
        }}
      >
        {/* Big jersey number watermark */}
        <div
          className="absolute -bottom-4 -right-2 text-[120px] font-black font-stats opacity-8 leading-none pointer-events-none select-none"
          style={{ color: teamColor }}
        >
          {jerseyNumber}
        </div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="flex items-start gap-4">
            {/* Avatar */}
            {playerPhoto ? (
              <div
                className="w-20 h-20 rounded-full border-4 flex-shrink-0 overflow-hidden"
                style={{ borderColor: `${teamColor}66` }}
              >
                <img
                  src={playerPhoto}
                  alt={player.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black font-stats border-4 flex-shrink-0"
                style={{
                  backgroundColor: teamColor,
                  color: "oklch(0.95 0.02 82)",
                  borderColor: `${teamColor}66`,
                }}
              >
                {jerseyNumber}
              </div>
            )}

            <div className="flex-1 pt-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: `${posColor}33`,
                    color: posColor,
                    border: `1px solid ${posColor}55`,
                  }}
                >
                  {posLabel}
                </span>
                {player.isVerified && <IslandPrideBadge />}
              </div>
              <h1 className="font-display font-black text-2xl text-foreground mt-1 leading-tight">
                {player.name}
              </h1>
              {player.nickname && (
                <p className="text-muted-foreground text-sm">
                  "{player.nickname}"
                </p>
              )}
              {team && (
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <TeamBadge
                    team={{
                      teamId: team.teamId,
                      name: team.name,
                      area: team.area,
                      color: teamColor,
                    }}
                    size="sm"
                    showName
                  />
                  <AreaBadge area={team.area} />
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Stats */}
      <div className="px-4 mt-5" data-ocid="player_profile.stats.card">
        <h2 className="font-display font-bold text-sm text-foreground uppercase tracking-wide mb-3">
          Season Stats
        </h2>

        {/* Main stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <StatCard
            icon={<Target className="w-5 h-5" />}
            value={goals}
            label="Goals"
            color="#22C55E"
          />
          <StatCard
            icon={<Zap className="w-5 h-5" />}
            value={assists}
            label="Assists"
            color="#3B82F6"
          />
        </div>

        <div className="grid grid-cols-3 gap-3 mb-3">
          <StatCard
            icon={<Trophy className="w-4 h-4" />}
            value={matchesPlayed}
            label="Apps"
            color="oklch(0.82 0.08 82)"
            small
          />
          <StatCard
            icon={<AlertTriangle className="w-4 h-4" />}
            value={yellowCards}
            label="Yellow"
            color="#EAB308"
            small
          />
          <StatCard
            icon={<Square className="w-4 h-4" />}
            value={redCards}
            label="Red"
            color="#EF4444"
            small
          />
        </div>

        {/* Per game stats */}
        <div className="rounded-xl border border-border bg-card p-4 mt-3">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
            Per Game
          </h3>
          <div className="space-y-3">
            {[
              {
                label: "Goals per game",
                value:
                  matchesPlayed > 0
                    ? (goals / matchesPlayed).toFixed(2)
                    : "0.00",
                color: "#22C55E",
              },
              {
                label: "Assists per game",
                value:
                  matchesPlayed > 0
                    ? (assists / matchesPlayed).toFixed(2)
                    : "0.00",
                color: "#3B82F6",
              },
              {
                label: "Goal contributions",
                value: goals + assists,
                color: "oklch(0.82 0.08 82)",
              },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between"
              >
                <span className="text-sm text-muted-foreground">
                  {row.label}
                </span>
                <span
                  className="font-black font-stats text-lg"
                  style={{ color: row.color }}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
  color,
  small = false,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: string;
  small?: boolean;
}) {
  return (
    <div
      className="rounded-xl p-4 border text-center"
      style={{
        backgroundColor: `color-mix(in oklch, ${color} 8%, oklch(0.16 0.04 255))`,
        borderColor: `color-mix(in oklch, ${color} 30%, transparent)`,
      }}
    >
      <div className="flex justify-center mb-1.5" style={{ color }}>
        {icon}
      </div>
      <div
        className={`font-black font-stats leading-none ${small ? "text-2xl" : "text-4xl"}`}
        style={{ color }}
      >
        {value}
      </div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
