import type { T__4 as BackendNewsItem } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@/hooks/useActor";
import {
  addNewsComment,
  getLocalNews,
  getNewsComments,
  getNewsConfirmations,
  getNewsPhotos,
  getNewsReactions,
  getUserSettings,
  setNewsReaction,
} from "@/utils/localStore";
import { CheckCircle, Newspaper, RefreshCw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────
type NewsItem = BackendNewsItem;

// ── Helpers ────────────────────────────────────────────────────────────────────
function timeAgo(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  const date = new Date(ms);
  const now = Date.now();
  const diff = now - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 2) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const NEWS_GRADIENTS = [
  "linear-gradient(135deg, oklch(0.22 0.08 252) 0%, oklch(0.15 0.04 255) 100%)",
  "linear-gradient(135deg, oklch(0.2 0.07 24) 0%, oklch(0.16 0.04 255) 100%)",
  "linear-gradient(135deg, oklch(0.18 0.06 82) 0%, oklch(0.14 0.04 255) 100%)",
  "linear-gradient(135deg, oklch(0.2 0.07 160) 0%, oklch(0.15 0.04 255) 100%)",
];

// ── Loading skeleton ───────────────────────────────────────────────────────────
function NewsSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <Skeleton className="w-full h-32" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-3 w-16 rounded-full" />
        <Skeleton className="h-5 w-full rounded" />
        <Skeleton className="h-4 w-4/5 rounded" />
        <Skeleton className="h-3 w-24 rounded" />
      </div>
    </div>
  );
}

// ── News Card ──────────────────────────────────────────────────────────────────
function NewsCard({
  item,
  index,
  isConfirmed,
  photoUrl,
  onClick,
}: {
  item: NewsItem;
  index: number;
  isConfirmed: boolean;
  photoUrl: string | null;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      initial={{ y: 16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        delay: Math.min(index * 0.06, 0.5),
        type: "spring",
        stiffness: 260,
        damping: 24,
      }}
      className="w-full text-left rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-card transition-all overflow-hidden"
      onClick={onClick}
      data-ocid={`news.item.${index + 1}`}
    >
      {/* Thumbnail */}
      <div
        className="w-full h-32 relative overflow-hidden"
        style={{
          background: photoUrl
            ? undefined
            : NEWS_GRADIENTS[index % NEWS_GRADIENTS.length],
        }}
      >
        {photoUrl && (
          <img
            src={photoUrl}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        )}
        {/* Overlay gradient for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />

        {/* Official badge */}
        {isConfirmed && (
          <div className="absolute top-2 right-2">
            <span className="flex items-center gap-1 bg-emerald-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
              <CheckCircle className="w-3 h-3" />
              Official
            </span>
          </div>
        )}

        {/* Island themed overlay icon */}
        <div className="absolute bottom-2 left-3 text-white/60">
          <Newspaper className="w-4 h-4" />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] text-muted-foreground font-medium">
            {timeAgo(item.timestamp)}
          </span>
          {isConfirmed && (
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 h-4 border-emerald-500/40 text-emerald-400"
            >
              Verified
            </Badge>
          )}
        </div>

        <h3 className="font-display font-bold text-sm text-foreground leading-snug line-clamp-2 mb-1.5">
          {item.title}
        </h3>

        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {item.body}
        </p>

        <p className="text-[10px] text-primary/70 font-semibold mt-2">
          Read more →
        </p>
      </div>
    </motion.button>
  );
}

// ── Full Story Sheet ───────────────────────────────────────────────────────────
function NewsDetailSheet({
  item,
  isConfirmed,
  photoUrl,
  onClose,
}: {
  item: NewsItem | null;
  isConfirmed: boolean;
  photoUrl: string | null;
  onClose: () => void;
}) {
  return (
    <Sheet open={!!item} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="bottom"
        className="max-h-[90vh] rounded-t-2xl pb-10 overflow-y-auto"
        data-ocid="news.detail.sheet"
      >
        {item && (
          <>
            {/* Photo */}
            {photoUrl && (
              <div className="w-full h-44 rounded-xl overflow-hidden mb-4 -mt-2">
                <img
                  src={photoUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <SheetHeader className="text-left mb-3">
              {isConfirmed && (
                <div className="flex items-center gap-1.5 mb-1">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-400">
                    Officially Confirmed
                  </span>
                </div>
              )}
              <SheetTitle className="font-display font-black text-xl leading-tight text-left">
                {item.title}
              </SheetTitle>
              <p className="text-xs text-muted-foreground">
                {timeAgo(item.timestamp)}
              </p>
            </SheetHeader>

            <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
              {item.body}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

// Pure helper: convert local news items to backend-compatible NewsItem shape
function localToNewsItem(
  ln: ReturnType<typeof getLocalNews>[number],
): NewsItem {
  return {
    newsId: ln.newsId,
    title: ln.title,
    body: ln.body,
    isPublished: ln.isPublished,
    authorId: ln.authorId,
    timestamp: BigInt(ln.timestamp) * BigInt(1_000_000), // ms -> ns
    photo: undefined,
  } as NewsItem;
}

// ── NewsPage ───────────────────────────────────────────────────────────────────
export function NewsPage() {
  const { actor, isFetching: actorFetching } = useActor();

  useEffect(() => {
    document.title = "Latest News – Lamu Sports Hub | Lamu Football Updates";
  }, []);

  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  // Start true so skeletons show immediately on mount
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [newsConfirmations, setNewsConfirmations] = useState(() =>
    getNewsConfirmations(),
  );
  const [refreshing, setRefreshing] = useState(false);

  const actorRef = useRef(actor);
  useEffect(() => {
    actorRef.current = actor;
  }, [actor]);

  const loadNews = useCallback(async (showRefreshing = false) => {
    // Always load local news immediately
    const localItems = getLocalNews()
      .filter((ln) => ln.isPublished)
      .map(localToNewsItem);

    // Prefer the live actor ref so refreshes always use the latest actor
    const a = actorRef.current;
    if (!a) {
      // No backend — show local news only
      setNewsList(localItems);
      setLoading(false);
      setRefreshing(false);
      return;
    }
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);
    try {
      const items = await a.getAllNews();
      const backendIds = new Set((items as NewsItem[]).map((i) => i.newsId));
      // Merge: backend first, then any local-only items
      const merged = [
        ...(items as NewsItem[]),
        ...localItems.filter((li) => !backendIds.has(li.newsId)),
      ].sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1));
      setNewsList(merged);
      setNewsConfirmations(getNewsConfirmations());
      setError(null);
    } catch {
      setError("Could not load news. Tap Refresh to try again.");
      // Still show local news on error
      setNewsList(localItems);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Load on actor ready — set loading immediately so skeleton shows
  const newsLoadedRef = useRef(false);
  // Reset ref on unmount so news reloads fresh when navigating back
  useEffect(() => {
    return () => {
      newsLoadedRef.current = false;
    };
  }, []);
  useEffect(() => {
    // Wait while actor is initialising — but cap the wait at 8s to avoid infinite spinner
    if (actorFetching) {
      const timeout = setTimeout(() => setLoading(false), 8000);
      return () => clearTimeout(timeout);
    }
    // Actor finished initialising but is null → no data, stop loading
    if (!actor) {
      setLoading(false);
      return;
    }
    // Avoid double-fetching
    if (newsLoadedRef.current) return;
    newsLoadedRef.current = true;
    // Sync the ref immediately so loadNews can use the latest actor
    actorRef.current = actor;
    setLoading(true);
    loadNews();
  }, [actor, actorFetching, loadNews]);

  // Photo blob URLs — ExternalBlob has getBytes() / getDirectURL()
  const [photoBlobUrls, setPhotoBlobUrls] = useState<Record<string, string>>(
    {},
  );
  useEffect(() => {
    let cancelled = false;
    const urls: Record<string, string> = {};
    const revokeUrls: string[] = [];

    const promises = newsList
      .filter((item) => item.photo != null)
      .map(async (item) => {
        try {
          // Use getDirectURL if available, otherwise fall back to getBytes
          const directUrl = item.photo!.getDirectURL();
          if (directUrl) {
            urls[item.newsId] = directUrl;
          } else {
            const bytes = await item.photo!.getBytes();
            const blobObj = new Blob([bytes], { type: "image/jpeg" });
            const blobUrl = URL.createObjectURL(blobObj);
            revokeUrls.push(blobUrl);
            urls[item.newsId] = blobUrl;
          }
        } catch {
          // ignore photo errors
        }
      });

    Promise.all(promises).then(() => {
      if (!cancelled) {
        // Merge with local photos so photos saved via admin panel show up
        const localPhotos = getNewsPhotos();
        setPhotoBlobUrls({ ...localPhotos, ...urls });
      }
    });

    return () => {
      cancelled = true;
      for (const u of revokeUrls) URL.revokeObjectURL(u);
    };
  }, [newsList]);

  const isLoading = actorFetching || loading;

  return (
    <div data-ocid="news.page" className="min-h-screen pb-24 pt-14">
      {/* Header */}
      <div
        className="px-4 py-5"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.1 0.04 255) 0%, oklch(0.14 0.06 252) 100%)",
        }}
      >
        <motion.div
          className="flex items-start justify-between"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div>
            <h1 className="font-display font-black text-2xl text-foreground flex items-center gap-2">
              <Newspaper className="w-6 h-6 text-primary" />
              News
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Latest from Lamu Sports Hub
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 gap-1.5 text-xs"
            onClick={() => loadNews(true)}
            disabled={refreshing || isLoading}
            data-ocid="news.refresh.button"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </motion.div>
      </div>

      {/* Content */}
      <div className="px-4 pt-4 space-y-3" data-ocid="news.list">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 4 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders have no meaningful key
            <NewsSkeleton key={`news-skeleton-${i}`} />
          ))
        ) : error ? (
          // Error state
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
            data-ocid="news.error_state"
          >
            <p className="text-sm text-muted-foreground mb-3">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadNews(true)}
              data-ocid="news.retry.button"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Try again
            </Button>
          </motion.div>
        ) : newsList.length === 0 ? (
          // Empty state
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center"
            data-ocid="news.empty_state"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ background: "oklch(0.18 0.04 255)" }}
            >
              <Newspaper className="w-7 h-7 text-muted-foreground" />
            </div>
            <h3 className="font-display font-bold text-base text-foreground mb-1">
              No news yet
            </h3>
            <p className="text-xs text-muted-foreground max-w-48">
              Officials will post the latest island football news here
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {newsList.map((item, i) => (
              <NewsCard
                key={item.newsId}
                item={item}
                index={i}
                isConfirmed={!!newsConfirmations[item.newsId]}
                photoUrl={photoBlobUrls[item.newsId] ?? null}
                onClick={() => setSelectedNews(item)}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Detail sheet */}
      <NewsDetailSheet
        item={selectedNews}
        isConfirmed={
          selectedNews ? !!newsConfirmations[selectedNews.newsId] : false
        }
        photoUrl={
          selectedNews ? (photoBlobUrls[selectedNews.newsId] ?? null) : null
        }
        onClose={() => setSelectedNews(null)}
      />
    </div>
  );
}
