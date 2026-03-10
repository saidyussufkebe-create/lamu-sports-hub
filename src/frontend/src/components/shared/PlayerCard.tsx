import {
  type MockPlayer,
  type MockTeam,
  getPositionColor,
  getPositionLabel,
} from "@/data/mockData";
import { AlertTriangle, Square, Star, Target, Zap } from "lucide-react";
import { IslandPrideBadge, TeamBadge } from "./TeamBadge";

interface PlayerCardProps {
  player: MockPlayer;
  team: MockTeam;
  compact?: boolean;
  onClick?: () => void;
  className?: string;
}

export function PlayerCard({
  player,
  team,
  compact = false,
  onClick,
  className = "",
}: PlayerCardProps) {
  const posColor = getPositionColor(player.position);
  const posLabel = getPositionLabel(player.position);

  if (compact) {
    return (
      <button
        type="button"
        className={`w-full flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:border-primary/40 transition-all cursor-pointer text-left ${className}`}
        onClick={onClick}
      >
        {/* Jersey number */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-stats flex-shrink-0"
          style={{
            backgroundColor: `${team.color}44`,
            color: team.secondaryColor,
          }}
        >
          {player.jerseyNumber}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-foreground truncate">
              {player.name}
            </span>
            {player.isVerified && (
              <span className="text-yellow-400 flex-shrink-0">
                <Star className="w-3 h-3 fill-yellow-400" />
              </span>
            )}
          </div>
          {player.nickname && (
            <span className="text-xs text-muted-foreground">
              &quot;{player.nickname}&quot;
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className="px-1.5 py-0.5 rounded text-xs font-bold"
            style={{ backgroundColor: `${posColor}22`, color: posColor }}
          >
            {posLabel}
          </span>
          <TeamBadge team={team} size="xs" />
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`w-full relative overflow-hidden rounded-xl border border-border hover:border-primary/50 transition-all hover:shadow-card group cursor-pointer text-left ${className}`}
      onClick={onClick}
      style={{
        background: `linear-gradient(135deg, ${team.color}33 0%, oklch(0.16 0.04 255) 60%)`,
      }}
    >
      {/* Jersey number watermark */}
      <div
        className="absolute top-0 right-0 text-7xl font-black font-stats opacity-10 leading-none pointer-events-none select-none"
        style={{ color: team.secondaryColor }}
      >
        {player.jerseyNumber}
      </div>

      <div className="relative p-4">
        {/* Top row: position + island pride */}
        <div className="flex items-center justify-between mb-3">
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

        {/* Avatar placeholder */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-black font-stats border-2"
            style={{
              backgroundColor: team.color,
              color: team.secondaryColor,
              borderColor: `${team.secondaryColor}66`,
            }}
          >
            {player.jerseyNumber}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-foreground text-sm leading-tight">
                {player.name}
              </span>
            </div>
            {player.nickname && (
              <span className="text-xs text-muted-foreground">
                &quot;{player.nickname}&quot;
              </span>
            )}
            <div className="flex items-center gap-1 mt-0.5">
              <TeamBadge team={team} size="xs" />
              <span className="text-xs text-muted-foreground">{team.name}</span>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-1">
          <StatChip
            icon={<Target className="w-3 h-3" />}
            value={player.goals}
            label="Goals"
            color="#22C55E"
          />
          <StatChip
            icon={<Zap className="w-3 h-3" />}
            value={player.assists}
            label="Assist"
            color="#3B82F6"
          />
          <StatChip
            icon={<AlertTriangle className="w-3 h-3" />}
            value={player.yellowCards}
            label="YC"
            color="#EAB308"
          />
          <StatChip
            icon={<Square className="w-3 h-3" />}
            value={player.redCards}
            label="RC"
            color="#EF4444"
          />
        </div>

        <div className="mt-2 text-xs text-muted-foreground text-center">
          {player.matchesPlayed} matches played
        </div>
      </div>
    </button>
  );
}

function StatChip({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: string;
}) {
  return (
    <div
      className="rounded-lg p-1.5 text-center flex flex-col items-center gap-0.5"
      style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}
    >
      <div style={{ color }}>{icon}</div>
      <span
        className="font-black font-stats text-sm leading-none"
        style={{ color }}
      >
        {value}
      </span>
      <span className="text-[9px] text-muted-foreground leading-none">
        {label}
      </span>
    </div>
  );
}
