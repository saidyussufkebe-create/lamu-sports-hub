import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  getAppLogo,
  getLocalNews,
  getLocalNotifications,
  getLocalPlayers,
  getLocalTeams,
  getReadNotifIds,
  isOfficialSessionVerified,
} from "@/utils/localStore";
import { useNavigate } from "@tanstack/react-router";
import { Bell, LogOut, Search, ShieldCheck, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface TopNavProps {
  onNotificationsClick: () => void;
}

type SearchResult = {
  type: "team" | "player" | "news";
  id: string;
  title: string;
  subtitle: string;
  route: string;
};

export function TopNav({ onNotificationsClick }: TopNavProps) {
  const navigate = useNavigate();
  const { identity, clear } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const officialSession = isOfficialSessionVerified();
  const customLogo = getAppLogo();
  const logoSrc =
    customLogo ?? "/assets/uploads/file_00000000fbc87243ae7561e59571a7e1-1.png";

  // Notification count from local notifications
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const compute = () => {
      const all = getLocalNotifications();
      const readIds = new Set(getReadNotifIds());
      setUnreadCount(
        all.filter((n) => !n.isRead && !readIds.has(n.notificationId)).length,
      );
    };
    compute();
    window.addEventListener("storage", compute);
    window.addEventListener("lsh:notifications-updated", compute);
    return () => {
      window.removeEventListener("storage", compute);
      window.removeEventListener("lsh:notifications-updated", compute);
    };
  }, []);

  useEffect(() => {
    if (!actor || actorFetching || !identity) return;
    let cancelled = false;
    actor
      .getAllNotifications()
      .then((allNotifs) => {
        if (cancelled) return;
        const unread = allNotifs.filter((n) => !n.isRead).length;
        setUnreadCount((prev) => Math.max(prev, unread));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [actor, actorFetching, identity]);

  const displayCount =
    unreadCount > 9 ? "9+" : unreadCount > 0 ? String(unreadCount) : null;

  // ── Search ──
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [allTeams, setAllTeams] = useState<
    Array<{ teamId: string; name: string; area: string }>
  >([]);
  const [allPlayers, setAllPlayers] = useState<
    Array<{ playerId: string; name: string; position: string }>
  >([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load backend data when search opens
  useEffect(() => {
    if (!searchOpen || !actor) return;
    Promise.all([actor.getAllTeams(), actor.getAllPlayers()])
      .then(([t, p]) => {
        setAllTeams(
          t.map((team) => ({
            teamId: team.teamId,
            name: team.name,
            area: team.area,
          })),
        );
        setAllPlayers(
          p.map((pl) => ({
            playerId: pl.playerId,
            name: pl.name,
            position: String(pl.position),
          })),
        );
      })
      .catch(() => {});
  }, [searchOpen, actor]);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [searchOpen]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(() => {
      const q = query.toLowerCase().trim();
      const found: SearchResult[] = [];

      // Teams
      const localTeams = getLocalTeams();
      const teamPool = [
        ...allTeams,
        ...localTeams
          .filter((lt) => !allTeams.some((at) => at.teamId === lt.teamId))
          .map((lt) => ({ teamId: lt.teamId, name: lt.name, area: lt.area })),
      ];
      for (const t of teamPool) {
        if (
          t.name.toLowerCase().includes(q) ||
          t.area.toLowerCase().includes(q)
        ) {
          found.push({
            type: "team",
            id: t.teamId,
            title: t.name,
            subtitle: t.area,
            route: `/teams/${t.teamId}`,
          });
        }
      }

      // Players
      const localPlayers = getLocalPlayers();
      const playerPool = [
        ...allPlayers,
        ...localPlayers
          .filter((lp) => !allPlayers.some((ap) => ap.playerId === lp.playerId))
          .map((lp) => ({
            playerId: lp.playerId,
            name: lp.name,
            position: lp.position,
          })),
      ];
      for (const p of playerPool) {
        if (p.name.toLowerCase().includes(q)) {
          found.push({
            type: "player",
            id: p.playerId,
            title: p.name,
            subtitle: p.position,
            route: `/players/${p.playerId}`,
          });
        }
      }

      // News
      const localNews = getLocalNews().filter((n) => n.isPublished);
      for (const n of localNews) {
        if (
          n.title.toLowerCase().includes(q) ||
          n.body.toLowerCase().includes(q)
        ) {
          found.push({
            type: "news",
            id: n.newsId,
            title: n.title,
            subtitle: "News",
            route: "/news",
          });
        }
      }

      setResults(found.slice(0, 12));
    }, 300);
  }, [query, allTeams, allPlayers]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const typeIcon = (type: SearchResult["type"]) =>
    type === "team" ? "🛡️" : type === "player" ? "👤" : "📰";
  const typeLabel = (type: SearchResult["type"]) =>
    type === "team" ? "Team" : type === "player" ? "Player" : "News";

  const groups = [
    { label: "Teams", type: "team" as const },
    { label: "Players", type: "player" as const },
    { label: "News", type: "news" as const },
  ].filter((g) => results.some((r) => r.type === g.type));

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-card/95 backdrop-blur-sm border-b border-border flex items-center px-4 gap-3">
        {/* Logo + Name */}
        <button
          type="button"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          onClick={() => navigate({ to: "/" })}
          data-ocid="nav.link"
        >
          <img
            src={logoSrc}
            alt="Lamu Sports Hub"
            className="w-8 h-8 object-contain"
          />
          <span className="font-display font-black text-sm hidden sm:block">
            <span className="text-secondary">Lamu</span>{" "}
            <span className="text-foreground">Sports Hub</span>
          </span>
        </button>

        <div className="flex-1" />

        {/* Official Mode indicator */}
        {officialSession && (
          <span
            className="hidden sm:flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full"
            style={{
              background: "oklch(0.22 0.08 155 / 0.3)",
              border: "1px solid oklch(0.4 0.12 155 / 0.5)",
              color: "oklch(0.65 0.15 155)",
            }}
          >
            <ShieldCheck className="w-3 h-3" />
            Official
          </span>
        )}
        {officialSession && (
          <span
            className="sm:hidden w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: "oklch(0.65 0.15 155)" }}
            title="Official Mode Active"
          />
        )}

        {/* Search Button */}
        <button
          type="button"
          className="relative p-2 rounded-full hover:bg-muted/50 transition-colors"
          onClick={() => setSearchOpen(true)}
          data-ocid="nav.search.button"
          aria-label="Search"
        >
          <Search className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Notification Bell */}
        <button
          type="button"
          className="relative p-2 rounded-full hover:bg-muted/50 transition-colors"
          onClick={onNotificationsClick}
          data-ocid="nav.link"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
          {displayCount !== null && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-accent text-accent-foreground text-[9px] font-bold flex items-center justify-center px-0.5">
              {displayCount}
            </span>
          )}
        </button>

        {/* Auth button */}
        {identity ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={clear}
            className="text-muted-foreground hover:text-foreground"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        ) : null}
      </header>

      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col"
            style={{ background: "oklch(0.08 0.03 252 / 0.96)" }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setSearchOpen(false);
            }}
            data-ocid="search.modal"
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="p-4 border-b border-border"
            >
              <div className="flex items-center gap-3 max-w-lg mx-auto">
                <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <Input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search teams, players, news…"
                  className="flex-1 bg-transparent border-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-0 h-10 text-base px-0"
                  data-ocid="search.input"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="p-1.5 rounded-full hover:bg-muted/50"
                  data-ocid="search.close_button"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </motion.div>

            <div className="flex-1 overflow-y-auto p-4 max-w-lg mx-auto w-full">
              {query.trim() && results.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-12">
                  No results for "{query}"
                </p>
              )}
              {!query.trim() && (
                <p className="text-sm text-muted-foreground text-center py-12">
                  Type to search teams, players, and news
                </p>
              )}
              {groups.map((group) => (
                <div key={group.type} className="mb-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                    {group.label}
                  </p>
                  <div className="space-y-1">
                    {results
                      .filter((r) => r.type === group.type)
                      .map((result, i) => (
                        <motion.button
                          key={result.id}
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: i * 0.04 }}
                          type="button"
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors text-left"
                          onClick={() => {
                            setSearchOpen(false);
                            navigate({ to: result.route as any });
                          }}
                          data-ocid={`search.result.item.${i + 1}`}
                        >
                          <span className="text-xl">
                            {typeIcon(result.type)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">
                              {result.title}
                            </p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {result.subtitle}
                            </p>
                          </div>
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{
                              background:
                                result.type === "team"
                                  ? "oklch(0.3 0.1 252 / 0.4)"
                                  : result.type === "player"
                                    ? "oklch(0.25 0.1 155 / 0.4)"
                                    : "oklch(0.28 0.1 24 / 0.4)",
                              color:
                                result.type === "team"
                                  ? "oklch(0.65 0.12 252)"
                                  : result.type === "player"
                                    ? "oklch(0.65 0.15 155)"
                                    : "oklch(0.7 0.16 24)",
                            }}
                          >
                            {typeLabel(result.type)}
                          </span>
                        </motion.button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
