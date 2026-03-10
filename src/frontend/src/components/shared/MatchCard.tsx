import {
  type MockMatch,
  type MockTeam,
  formatMatchDate,
  formatTime,
} from "@/data/mockData";
import { Calendar, Clock, MapPin, User } from "lucide-react";
import { TeamBadge } from "./TeamBadge";

interface MatchCardProps {
  match: MockMatch;
  homeTeam: MockTeam;
  awayTeam: MockTeam;
  onClick?: () => void;
  compact?: boolean;
  className?: string;
  refereeName?: string;
  pitchName?: string;
}

export function MatchCard({
  match,
  homeTeam,
  awayTeam,
  onClick,
  compact = false,
  className = "",
  refereeName,
  pitchName,
}: MatchCardProps) {
  const isPlayed = match.status === "played";
  const isLive = match.status === "live";
  const isScheduled = match.status === "scheduled";

  if (compact) {
    return (
      <button
        type="button"
        className={`w-full flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:border-primary/40 transition-all cursor-pointer text-left ${className}`}
        onClick={onClick}
      >
        {/* Home */}
        <div className="flex items-center gap-1.5 flex-1 justify-end">
          <span className="text-xs font-semibold text-foreground truncate text-right">
            {homeTeam.name}
          </span>
          <TeamBadge team={homeTeam} size="xs" />
        </div>

        {/* Score / Time */}
        <div className="flex flex-col items-center min-w-[50px]">
          {isPlayed && (
            <span className="font-black font-stats text-sm text-foreground">
              {match.homeScore} - {match.awayScore}
            </span>
          )}
          {isLive && (
            <div className="flex items-center gap-1">
              <span className="live-indicator w-2 h-2 rounded-full bg-accent inline-block" />
              <span className="font-bold text-xs text-accent">LIVE</span>
            </div>
          )}
          {isScheduled && (
            <span className="text-xs text-muted-foreground font-medium">
              {formatTime(match.date)}
            </span>
          )}
        </div>

        {/* Away */}
        <div className="flex items-center gap-1.5 flex-1">
          <TeamBadge team={awayTeam} size="xs" />
          <span className="text-xs font-semibold text-foreground truncate">
            {awayTeam.name}
          </span>
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`w-full rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-card transition-all cursor-pointer overflow-hidden text-left ${className}`}
      onClick={onClick}
    >
      {/* Status bar */}
      <div
        className={`h-0.5 w-full ${
          isLive
            ? "bg-accent live-indicator"
            : isPlayed
              ? "bg-primary/60"
              : "bg-muted"
        }`}
      />

      <div className="p-4">
        {/* Date / Status */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>{formatMatchDate(match.date)}</span>
          </div>

          {isLive && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-accent/20 text-accent border border-accent/40">
              <span className="live-indicator w-1.5 h-1.5 rounded-full bg-accent" />
              LIVE
            </span>
          )}
          {isPlayed && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
              FT
            </span>
          )}
          {isScheduled && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{formatTime(match.date)}</span>
            </div>
          )}
        </div>

        {/* Teams & Score */}
        <div className="flex items-center gap-3">
          {/* Home Team */}
          <div className="flex-1 flex flex-col items-center gap-2">
            <TeamBadge team={homeTeam} size="lg" />
            <span className="text-xs font-semibold text-foreground text-center leading-tight">
              {homeTeam.name}
            </span>
          </div>

          {/* Score or VS */}
          <div className="flex flex-col items-center gap-1 min-w-[60px]">
            {isPlayed || isLive ? (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black font-stats text-foreground">
                  {match.homeScore}
                </span>
                <span className="text-lg text-muted-foreground font-light">
                  —
                </span>
                <span className="text-2xl font-black font-stats text-foreground">
                  {match.awayScore}
                </span>
              </div>
            ) : (
              <span className="text-xl font-black font-stats text-muted-foreground">
                VS
              </span>
            )}
          </div>

          {/* Away Team */}
          <div className="flex-1 flex flex-col items-center gap-2">
            <TeamBadge team={awayTeam} size="lg" />
            <span className="text-xs font-semibold text-foreground text-center leading-tight">
              {awayTeam.name}
            </span>
          </div>
        </div>

        {/* Referee + Pitch */}
        {(refereeName || pitchName) && (
          <div className="mt-3 pt-3 border-t border-border/50 flex flex-wrap items-center justify-center gap-3">
            {refereeName && (
              <div className="flex items-center gap-1.5">
                <User className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Referee:{" "}
                  <span className="font-medium text-foreground">
                    {refereeName}
                  </span>
                </span>
              </div>
            )}
            {pitchName && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {pitchName}
                  </span>
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </button>
  );
}
