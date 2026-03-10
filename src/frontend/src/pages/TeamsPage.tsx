import type { T__1 as BackendTeam } from "@/backend";
import { AreaBadge } from "@/components/shared/TeamBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@/hooks/useActor";
import {
  getDeletedTeamIds,
  getLocalTeams,
  getTeamOverrides,
} from "@/utils/localStore";
import { useNavigate } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";

// Deterministic color palette for teams
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

function getTeamColor(index: number) {
  return TEAM_COLORS[index % TEAM_COLORS.length];
}

function TeamSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="h-1 w-full bg-muted/40" />
      <div className="p-3 flex flex-col items-center gap-2">
        <Skeleton className="w-14 h-14 rounded-full" />
        <Skeleton className="h-4 w-24 rounded" />
        <Skeleton className="h-3 w-16 rounded-full" />
        <div className="flex gap-1 w-full">
          <Skeleton className="flex-1 h-6 rounded" />
          <Skeleton className="flex-1 h-6 rounded" />
          <Skeleton className="flex-1 h-6 rounded" />
        </div>
      </div>
    </div>
  );
}

export function TeamsPage() {
  const navigate = useNavigate();
  const { actor, isFetching: actorFetching } = useActor();
  const [areaFilter, setAreaFilter] = useState<string>("all");
  const [teams, setTeams] = useState<BackendTeam[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    document.title = "Teams – Lamu Sports Hub | Lamu Football Clubs";
  }, []);

  // Load real teams from backend, then merge with locally stored teams,
  // apply name/area overrides and filter out soft-deleted teams.
  const loadTeams = useCallback(() => {
    if (actorFetching) return;
    const localTeams = getLocalTeams();
    const overrides = getTeamOverrides();
    const deletedIds = new Set(getDeletedTeamIds());

    const applyOverride = (t: BackendTeam): BackendTeam => {
      const ov = overrides[t.teamId];
      if (!ov) return t;
      return { ...t, name: ov.name, area: ov.area };
    };

    if (!actor) {
      // No backend — show local teams only (excluding deleted)
      const merged = localTeams
        .filter((lt) => !deletedIds.has(lt.teamId))
        .map(
          (lt) =>
            ({
              teamId: lt.teamId,
              name: overrides[lt.teamId]?.name ?? lt.name,
              area: overrides[lt.teamId]?.area ?? lt.area,
              coachId: lt.coachName,
              logoUrl: "",
              wins: BigInt(0),
              losses: BigInt(0),
              draws: BigInt(0),
              goalsFor: BigInt(0),
              goalsAgainst: BigInt(0),
              isApproved: false,
            }) as BackendTeam,
        );
      setTeams(merged);
      setLoadingData(false);
      return;
    }
    setLoadingData(true);
    actor
      .getAllTeams()
      .then((rawTeams) => {
        const backendIds = new Set(rawTeams.map((t) => t.teamId));
        // Apply overrides + filter deleted for backend teams
        const processedBackend = rawTeams
          .filter((t) => !deletedIds.has(t.teamId))
          .map(applyOverride);
        // Append local-only teams that aren't in backend and aren't deleted
        const extraLocal = localTeams
          .filter(
            (lt) => !backendIds.has(lt.teamId) && !deletedIds.has(lt.teamId),
          )
          .map(
            (lt) =>
              ({
                teamId: lt.teamId,
                name: overrides[lt.teamId]?.name ?? lt.name,
                area: overrides[lt.teamId]?.area ?? lt.area,
                coachId: lt.coachName,
                logoUrl: "",
                wins: BigInt(0),
                losses: BigInt(0),
                draws: BigInt(0),
                goalsFor: BigInt(0),
                goalsAgainst: BigInt(0),
                isApproved: false,
              }) as BackendTeam,
          );
        setTeams([...processedBackend, ...extraLocal]);
      })
      .catch(() => {
        // Fall back to local teams on error
        const merged = localTeams
          .filter((lt) => !deletedIds.has(lt.teamId))
          .map(
            (lt) =>
              ({
                teamId: lt.teamId,
                name: overrides[lt.teamId]?.name ?? lt.name,
                area: overrides[lt.teamId]?.area ?? lt.area,
                coachId: lt.coachName,
                logoUrl: "",
                wins: BigInt(0),
                losses: BigInt(0),
                draws: BigInt(0),
                goalsFor: BigInt(0),
                goalsAgainst: BigInt(0),
                isApproved: false,
              }) as BackendTeam,
          );
        setTeams(merged);
      })
      .finally(() => setLoadingData(false));
  }, [actor, actorFetching]);

  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  // Re-load teams when window regains focus, localStorage changes, or admin dispatches update
  useEffect(() => {
    const reload = () => loadTeams();
    window.addEventListener("focus", reload);
    window.addEventListener("storage", reload);
    window.addEventListener("lsh:teams-updated", reload);
    return () => {
      window.removeEventListener("focus", reload);
      window.removeEventListener("storage", reload);
      window.removeEventListener("lsh:teams-updated", reload);
    };
  }, [loadTeams]);

  const isLoading = actorFetching || loadingData;

  const areas = useMemo(
    () => [
      "all",
      ...Array.from(new Set(teams.map((t) => t.area).filter(Boolean))),
    ],
    [teams],
  );

  const filtered = useMemo(
    () =>
      areaFilter === "all" ? teams : teams.filter((t) => t.area === areaFilter),
    [teams, areaFilter],
  );

  return (
    <div data-ocid="teams.page" className="min-h-screen pb-24 pt-14">
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
            <Users className="w-6 h-6 text-primary" />
            Teams
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isLoading
              ? "Loading teams…"
              : `${teams.length} club${teams.length !== 1 ? "s" : ""} competing this season`}
          </p>
        </motion.div>
      </div>

      {/* Filter */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-2">
        <Select value={areaFilter} onValueChange={setAreaFilter}>
          <SelectTrigger
            className="w-40 h-8 text-xs"
            data-ocid="teams.area.select"
          >
            <SelectValue placeholder="Filter by area" />
          </SelectTrigger>
          <SelectContent>
            {areas.map((a) => (
              <SelectItem key={a} value={a} className="text-xs">
                {a === "all" ? "All Areas" : a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!isLoading && (
          <span className="text-xs text-muted-foreground">
            {filtered.length} team{filtered.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Grid */}
      <div
        className="px-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
        data-ocid="teams.list"
      >
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
            <TeamSkeleton key={`team-skeleton-${i}`} />
          ))
        ) : filtered.length === 0 ? (
          <div
            className="col-span-2 sm:col-span-3 md:col-span-4 flex flex-col items-center justify-center py-16 text-center"
            data-ocid="teams.empty_state"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ background: "oklch(0.18 0.04 255)" }}
            >
              <Users className="w-7 h-7 text-muted-foreground" />
            </div>
            <h3 className="font-display font-bold text-base text-foreground mb-1">
              No teams registered yet
            </h3>
            <p className="text-xs text-muted-foreground max-w-52">
              Officials can add teams via the Admin Panel.
            </p>
          </div>
        ) : (
          filtered.map((team, i) => {
            const color = getTeamColor(i);
            const wins = Number(team.wins ?? 0);
            const draws = Number(team.draws ?? 0);
            const losses = Number(team.losses ?? 0);
            const pts = wins * 3 + draws;

            return (
              <motion.div
                key={team.teamId}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: Math.min(i * 0.05, 0.4) }}
                data-ocid={`teams.item.${i + 1}`}
              >
                <button
                  type="button"
                  className="w-full rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-card transition-all text-left overflow-hidden"
                  onClick={() => navigate({ to: `/teams/${team.teamId}` })}
                >
                  {/* Color top bar */}
                  <div className="h-1" style={{ backgroundColor: color }} />

                  <div className="p-3 flex flex-col items-center gap-2">
                    {/* Team initial badge */}
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-black text-white border-2"
                      style={{
                        backgroundColor: `${color}33`,
                        borderColor: `${color}66`,
                        color,
                      }}
                    >
                      {team.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-xs text-foreground leading-tight">
                        {team.name}
                      </div>
                      {team.area && (
                        <AreaBadge area={team.area} className="mt-1.5" />
                      )}
                    </div>
                    {/* Record */}
                    <div className="flex gap-1 text-xs w-full justify-center">
                      <span className="flex-1 text-center py-1 rounded bg-green-500/10 text-green-400 font-bold">
                        {wins}W
                      </span>
                      <span className="flex-1 text-center py-1 rounded bg-yellow-500/10 text-yellow-400 font-bold">
                        {draws}D
                      </span>
                      <span className="flex-1 text-center py-1 rounded bg-red-500/10 text-red-400 font-bold">
                        {losses}L
                      </span>
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {pts} pts
                    </div>
                  </div>
                </button>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
