import type { T__2 as BackendPlayer, T__1 as BackendTeam } from "@/backend";
import { AreaBadge, IslandPrideBadge } from "@/components/shared/TeamBadge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type MockPlayer,
  getPositionColor,
  getPositionLabel,
} from "@/data/mockData";
import { useActor } from "@/hooks/useActor";
import { getLocalPlayers, getLocalTeams } from "@/utils/localStore";
import { useNavigate } from "@tanstack/react-router";
import {
  Search,
  ShieldCheck,
  Target,
  UserCheck,
  Users,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

// Deterministic team color palette for backend teams
const TEAM_COLORS = [
  "#0B2E6F",
  "#8B1A1A",
  "#1A6B3A",
  "#6B1A6B",
  "#2E6B6B",
  "#6B4A1A",
  "#1A3A6B",
  "#3A1A1A",
];
const TEAM_SECONDARY_COLORS = [
  "#E8C98A",
  "#FFD700",
  "#A3E4A1",
  "#E4A1E4",
  "#A1E4E4",
  "#E4CFA1",
  "#A1BCE4",
  "#D4A1A1",
];

function getTeamColorByIndex(index: number) {
  return TEAM_COLORS[index % TEAM_COLORS.length];
}
function getTeamSecondaryColorByIndex(index: number) {
  return TEAM_SECONDARY_COLORS[index % TEAM_SECONDARY_COLORS.length];
}

type ResolvedTeam = {
  teamId: string;
  name: string;
  area: string;
  color: string;
  secondaryColor: string;
};

function backendToMock(p: BackendPlayer): MockPlayer {
  const posValue = p.position as unknown as string;
  const posKey = posValue as MockPlayer["position"];
  return {
    playerId: p.playerId,
    name: p.name,
    nickname: p.nickname,
    teamId: p.teamId,
    position: posKey || "midfielder",
    jerseyNumber: Number(p.jerseyNumber),
    matchesPlayed: Number(p.matchesPlayed),
    goals: Number(p.goals),
    assists: Number(p.assists),
    yellowCards: Number(p.yellowCards),
    redCards: Number(p.redCards),
    isVerified: p.isVerified ?? false,
    nationality: "Kenyan",
  };
}

const POSITION_OPTIONS = [
  { value: "all", label: "All Positions" },
  { value: "goalkeeper", label: "Goalkeeper" },
  { value: "defender", label: "Defender" },
  { value: "midfielder", label: "Midfielder" },
  { value: "forward", label: "Forward" },
];

// ── Player Card ────────────────────────────────────────────────────────────────
function PlayerCard({
  player,
  index,
  teamsMap,
  onClick,
}: {
  player: MockPlayer;
  index: number;
  teamsMap: Map<string, ResolvedTeam>;
  onClick: () => void;
}) {
  const team = teamsMap.get(player.teamId);
  const posColor = getPositionColor(player.position);
  const posLabel = getPositionLabel(player.position);

  return (
    <motion.button
      type="button"
      initial={{ y: 16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        delay: Math.min(index * 0.04, 0.4),
        type: "spring",
        stiffness: 260,
        damping: 24,
      }}
      className="w-full text-left rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-card transition-all overflow-hidden"
      onClick={onClick}
      data-ocid={`players.item.${index + 1}`}
    >
      {/* Position color accent strip */}
      <div className="h-0.5 w-full" style={{ backgroundColor: posColor }} />

      <div className="p-3 flex items-center gap-3">
        {/* Jersey number bubble */}
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-base font-black font-stats flex-shrink-0 border-2"
          style={{
            backgroundColor: team ? `${team.color}33` : "oklch(0.2 0.04 255)",
            color: team ? team.secondaryColor : "oklch(0.82 0.08 82)",
            borderColor: team ? `${team.color}66` : "oklch(0.3 0.06 255)",
          }}
        >
          {player.jerseyNumber}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{
                backgroundColor: `${posColor}25`,
                color: posColor,
                border: `1px solid ${posColor}40`,
              }}
            >
              {posLabel}
            </span>
            {player.isVerified && <IslandPrideBadge />}
          </div>
          <p className="font-bold text-sm text-foreground mt-0.5 truncate leading-tight">
            {player.name}
          </p>
          {player.nickname && (
            <p className="text-xs text-muted-foreground truncate">
              "{player.nickname}"
            </p>
          )}
          {team && (
            <div className="mt-1">
              <AreaBadge area={team.area} />
            </div>
          )}
        </div>

        {/* Stats column */}
        <div className="flex flex-col gap-1.5 items-end flex-shrink-0">
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-400">
            <Target className="w-3 h-3" />
            <span>{player.goals}</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-blue-400">
            <Zap className="w-3 h-3" />
            <span>{player.assists}</span>
          </div>
          <div className="text-[10px] text-muted-foreground font-medium">
            {player.matchesPlayed} apps
          </div>
        </div>
      </div>
    </motion.button>
  );
}

// ── Loading Skeleton ───────────────────────────────────────────────────────────
function PlayerSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="h-0.5 w-full bg-muted/40" />
      <div className="p-3 flex items-center gap-3">
        <Skeleton className="w-11 h-11 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3 w-12 rounded-full" />
          <Skeleton className="h-4 w-28 rounded" />
          <Skeleton className="h-3 w-16 rounded" />
        </div>
        <div className="flex flex-col gap-1.5 items-end">
          <Skeleton className="h-3 w-8 rounded" />
          <Skeleton className="h-3 w-8 rounded" />
          <Skeleton className="h-3 w-10 rounded" />
        </div>
      </div>
    </div>
  );
}

// ── PlayersPage ────────────────────────────────────────────────────────────────
export function PlayersPage() {
  const navigate = useNavigate();
  const { actor, isFetching: actorFetching } = useActor();

  useEffect(() => {
    document.title = "Players – Lamu Sports Hub | Lamu County Football Players";
  }, []);

  const [search, setSearch] = useState("");
  const [posFilter, setPosFilter] = useState("all");
  const [teamFilter, setTeamFilter] = useState("all");
  const [players, setPlayers] = useState<MockPlayer[]>([]);
  const [backendTeams, setBackendTeams] = useState<BackendTeam[]>([]);
  // Start as true so we show skeletons immediately instead of blank content
  const [loadingData, setLoadingData] = useState(true);
  const loadedRef = useRef(false);

  // Load players and teams from backend together, merged with local data
  useEffect(() => {
    // If actor is still initialising, wait — but cap the wait at 8s
    if (actorFetching) {
      const timeout = setTimeout(() => setLoadingData(false), 8000);
      return () => clearTimeout(timeout);
    }

    const localPlayers = getLocalPlayers();
    const localTeams = getLocalTeams();

    // If actor finished but is null (anonymous / unavailable), show local data
    if (!actor) {
      const localMockPlayers = localPlayers.map(
        (lp) =>
          ({
            playerId: lp.playerId,
            name: lp.name,
            nickname: lp.nickname,
            teamId: lp.teamId,
            position: lp.position as MockPlayer["position"],
            jerseyNumber: lp.jerseyNumber,
            matchesPlayed: 0,
            goals: 0,
            assists: 0,
            yellowCards: 0,
            redCards: 0,
            isVerified: lp.isConfirmed,
            nationality: "Kenyan",
          }) as MockPlayer,
      );
      setPlayers(localMockPlayers);
      const localBackendTeams = localTeams.map(
        (lt) =>
          ({
            teamId: lt.teamId,
            name: lt.name,
            area: lt.area,
            coachId: lt.coachName,
            logoUrl: "",
            wins: BigInt(0),
            losses: BigInt(0),
            draws: BigInt(0),
            goalsFor: BigInt(0),
            goalsAgainst: BigInt(0),
            isApproved: false,
          }) as import("@/backend").T__1,
      );
      setBackendTeams(localBackendTeams);
      setLoadingData(false);
      return;
    }
    // Avoid double-fetching if already loaded with this actor
    if (loadedRef.current) return;
    loadedRef.current = true;
    setLoadingData(true);
    Promise.all([actor.getAllPlayers(), actor.getAllTeams()])
      .then(([rawPlayers, rawTeams]) => {
        const backendPlayerIds = new Set(rawPlayers.map((p) => p.playerId));
        const backendTeamIds = new Set(rawTeams.map((t) => t.teamId));
        // Append local-only players not already on backend
        const extraLocalPlayers = localPlayers
          .filter((lp) => !backendPlayerIds.has(lp.playerId))
          .map(
            (lp) =>
              ({
                playerId: lp.playerId,
                name: lp.name,
                nickname: lp.nickname,
                teamId: lp.teamId,
                position: lp.position as MockPlayer["position"],
                jerseyNumber: lp.jerseyNumber,
                matchesPlayed: 0,
                goals: 0,
                assists: 0,
                yellowCards: 0,
                redCards: 0,
                isVerified: lp.isConfirmed,
                nationality: "Kenyan",
              }) as MockPlayer,
          );
        // Append local-only teams not already on backend
        const extraLocalTeams = localTeams
          .filter((lt) => !backendTeamIds.has(lt.teamId))
          .map(
            (lt) =>
              ({
                teamId: lt.teamId,
                name: lt.name,
                area: lt.area,
                coachId: lt.coachName,
                logoUrl: "",
                wins: BigInt(0),
                losses: BigInt(0),
                draws: BigInt(0),
                goalsFor: BigInt(0),
                goalsAgainst: BigInt(0),
                isApproved: false,
              }) as import("@/backend").T__1,
          );
        setPlayers([...rawPlayers.map(backendToMock), ...extraLocalPlayers]);
        setBackendTeams([...rawTeams, ...extraLocalTeams]);
      })
      .catch(() => {
        // Fall back to local data on error
        const localMockPlayers = localPlayers.map(
          (lp) =>
            ({
              playerId: lp.playerId,
              name: lp.name,
              nickname: lp.nickname,
              teamId: lp.teamId,
              position: lp.position as MockPlayer["position"],
              jerseyNumber: lp.jerseyNumber,
              matchesPlayed: 0,
              goals: 0,
              assists: 0,
              yellowCards: 0,
              redCards: 0,
              isVerified: lp.isConfirmed,
              nationality: "Kenyan",
            }) as MockPlayer,
        );
        setPlayers(localMockPlayers);
      })
      .finally(() => setLoadingData(false));
  }, [actor, actorFetching]);

  // Build a stable teamsMap from backend teams with deterministic colors
  const teamsMap = useMemo<Map<string, ResolvedTeam>>(() => {
    const map = new Map<string, ResolvedTeam>();
    backendTeams.forEach((t, i) => {
      map.set(t.teamId, {
        teamId: t.teamId,
        name: t.name,
        area: t.area,
        color: getTeamColorByIndex(i),
        secondaryColor: getTeamSecondaryColorByIndex(i),
      });
    });
    return map;
  }, [backendTeams]);

  // Team filter options from backend
  const teamOptions = useMemo(() => {
    const opts = backendTeams.map((t) => ({ id: t.teamId, name: t.name }));
    return [{ id: "all", name: "All Teams" }, ...opts];
  }, [backendTeams]);

  const filtered = useMemo(() => {
    return players.filter((p) => {
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.nickname?.toLowerCase().includes(search.toLowerCase());
      const matchesPos = posFilter === "all" || p.position === posFilter;
      const matchesTeam = teamFilter === "all" || p.teamId === teamFilter;
      return matchesSearch && matchesPos && matchesTeam;
    });
  }, [players, search, posFilter, teamFilter]);

  const isLoading = actorFetching || loadingData;

  const hasFilters = search || posFilter !== "all" || teamFilter !== "all";

  return (
    <div data-ocid="players.page" className="min-h-screen pb-24 pt-14">
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
            <UserCheck className="w-6 h-6 text-primary" />
            Players
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isLoading
              ? "Loading players…"
              : `${players.length} registered island footballer${players.length !== 1 ? "s" : ""}`}
          </p>
        </motion.div>

        {/* Quick stats bar */}
        <motion.div
          className="grid grid-cols-3 gap-2 mt-3"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {[
            {
              icon: <Users className="w-3.5 h-3.5" />,
              label: "Total",
              value: players.length,
              color: "oklch(0.65 0.15 252)",
            },
            {
              icon: <Target className="w-3.5 h-3.5" />,
              label: "Goals",
              value: players.reduce((s, p) => s + p.goals, 0),
              color: "#22C55E",
            },
            {
              icon: <ShieldCheck className="w-3.5 h-3.5" />,
              label: "Verified",
              value: players.filter((p) => p.isVerified).length,
              color: "#F59E0B",
            },
          ].map(({ icon, label, value, color }) => (
            <div
              key={label}
              className="rounded-xl px-3 py-2 text-center"
              style={{
                backgroundColor: `color-mix(in oklch, ${color} 12%, oklch(0.12 0.04 255))`,
              }}
            >
              <div className="flex justify-center mb-0.5" style={{ color }}>
                {icon}
              </div>
              <div
                className="font-black font-stats text-lg leading-none"
                style={{ color }}
              >
                {value}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Filters */}
      <div className="px-4 pt-4 pb-2 space-y-2">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-9 h-9 text-sm"
            placeholder="Search players…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-ocid="players.search_input"
          />
        </div>

        {/* Position + Team filters */}
        <div className="flex gap-2">
          <Select value={posFilter} onValueChange={setPosFilter}>
            <SelectTrigger
              className="h-8 flex-1 text-xs"
              data-ocid="players.position.select"
            >
              <SelectValue placeholder="Position" />
            </SelectTrigger>
            <SelectContent>
              {POSITION_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="text-xs"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={teamFilter} onValueChange={setTeamFilter}>
            <SelectTrigger
              className="h-8 flex-1 text-xs"
              data-ocid="players.team.select"
            >
              <SelectValue placeholder="Team" />
            </SelectTrigger>
            <SelectContent>
              {teamOptions.map((t) => (
                <SelectItem key={t.id} value={t.id} className="text-xs">
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Result count */}
        {!isLoading && (
          <div className="flex items-center justify-between text-xs text-muted-foreground px-0.5">
            <span>
              {filtered.length} player{filtered.length !== 1 ? "s" : ""}
            </span>
            {filtered.length > 0 && (
              <span>
                {filtered.reduce((s, p) => s + p.goals, 0)} goals ·{" "}
                {filtered.filter((p) => p.isVerified).length} verified
              </span>
            )}
          </div>
        )}
      </div>

      {/* List */}
      <div className="px-4 space-y-2" data-ocid="players.list">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders have no meaningful key
            <PlayerSkeleton key={`skeleton-${i}`} />
          ))
        ) : filtered.length === 0 ? (
          // Empty state
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center"
            data-ocid="players.empty_state"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ background: "oklch(0.18 0.04 255)" }}
            >
              <UserCheck className="w-7 h-7 text-muted-foreground" />
            </div>
            <h3 className="font-display font-bold text-base text-foreground mb-1">
              {hasFilters ? "No players found" : "No players registered yet"}
            </h3>
            <p className="text-xs text-muted-foreground max-w-52">
              {hasFilters
                ? "Try adjusting your filters"
                : "Officials can add players via the Admin Panel."}
            </p>
            {hasFilters && (
              <button
                type="button"
                className="mt-3 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                onClick={() => {
                  setSearch("");
                  setPosFilter("all");
                  setTeamFilter("all");
                }}
              >
                Clear filters
              </button>
            )}
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.map((player, i) => (
              <PlayerCard
                key={player.playerId}
                player={player}
                index={i}
                teamsMap={teamsMap}
                onClick={() => navigate({ to: `/players/${player.playerId}` })}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
