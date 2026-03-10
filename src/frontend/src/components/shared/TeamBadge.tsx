import { type MockTeam, getAreaColor } from "@/data/mockData";
import { getTeamLogos } from "@/utils/localStore";

// A union type that works for both MockTeam and real backend teams
export type TeamLike = {
  teamId: string;
  name: string;
  area: string;
  color?: string;
  secondaryColor?: string;
};

// Deterministic color generation for backend teams without colors
const TEAM_COLORS = [
  "oklch(0.55 0.18 252)",
  "oklch(0.55 0.18 145)",
  "oklch(0.6 0.22 24)",
  "oklch(0.55 0.15 82)",
  "oklch(0.55 0.18 300)",
  "oklch(0.55 0.18 200)",
];

export function getTeamColor(teamId: string): string {
  const idx =
    Math.abs(
      (teamId.charCodeAt(0) || 0) + (teamId.charCodeAt(teamId.length - 1) || 0),
    ) % TEAM_COLORS.length;
  return TEAM_COLORS[idx];
}

export function getTeamSecondaryColor(_teamId: string): string {
  return "oklch(0.95 0.02 82)";
}

interface TeamBadgeProps {
  team: TeamLike | MockTeam;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showName?: boolean;
  className?: string;
}

const sizeMap = {
  xs: { outer: "w-6 h-6", text: "text-[8px]" },
  sm: { outer: "w-8 h-8", text: "text-[10px]" },
  md: { outer: "w-10 h-10", text: "text-xs" },
  lg: { outer: "w-14 h-14", text: "text-sm" },
  xl: { outer: "w-20 h-20", text: "text-base" },
};

export function TeamBadge({
  team,
  size = "md",
  showName = false,
  className = "",
}: TeamBadgeProps) {
  const s = sizeMap[size];
  const initials = team.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();

  const uploadedLogo = getTeamLogos()[team.teamId];
  const bgColor = team.color || getTeamColor(team.teamId);
  const fgColor =
    (team as MockTeam).secondaryColor || getTeamSecondaryColor(team.teamId);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`${s.outer} rounded-full flex items-center justify-center font-bold font-display flex-shrink-0 ring-2 ring-white/10 overflow-hidden`}
        style={
          uploadedLogo
            ? undefined
            : { backgroundColor: bgColor, color: fgColor }
        }
      >
        {uploadedLogo ? (
          <img
            src={uploadedLogo}
            alt={`${team.name} logo`}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className={s.text}>{initials}</span>
        )}
      </div>
      {showName && (
        <span className="text-sm font-semibold text-foreground truncate">
          {team.name}
        </span>
      )}
    </div>
  );
}

interface AreaBadgeProps {
  area: string;
  className?: string;
}

export function AreaBadge({ area, className = "" }: AreaBadgeProps) {
  const color = getAreaColor(area);
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${className}`}
      style={{
        backgroundColor: `${color}22`,
        color: color,
        borderColor: `${color}55`,
      }}
    >
      {area}
    </span>
  );
}

interface IslandPrideBadgeProps {
  className?: string;
}

export function IslandPrideBadge({ className = "" }: IslandPrideBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-bold ${className}`}
      style={{
        backgroundColor: "#FFD70022",
        color: "#FFD700",
        border: "1px solid #FFD70055",
      }}
      title="Verified Lamu Participant"
    >
      <svg
        width="10"
        height="10"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-label="Island Pride star"
      >
        <title>Island Pride</title>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      Island Pride
    </span>
  );
}
