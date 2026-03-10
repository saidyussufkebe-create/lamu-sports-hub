import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Video, getVideos } from "@/utils/localStore";
import { ExternalLink, Layers, PlayCircle, Swords, Zap } from "lucide-react";
import { motion } from "motion/react";

export function ExplorePage() {
  const videos = getVideos();

  const tactics = videos.filter((v) => v.category === "tactics");
  const preparation = videos.filter((v) => v.category === "preparation");
  const highlights = videos.filter((v) => v.category === "highlights");

  return (
    <div data-ocid="explore.page" className="min-h-screen pb-24 pt-14">
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
            <Layers className="w-6 h-6 text-primary" />
            Explore
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tactics, training & preparation videos
          </p>
        </motion.div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tactics" className="px-4 pt-4">
        <TabsList
          className="w-full grid grid-cols-3 mb-4"
          data-ocid="explore.tab"
        >
          <TabsTrigger value="tactics" data-ocid="explore.tactics.tab">
            <Swords className="w-3.5 h-3.5 mr-1.5" />
            Tactics
          </TabsTrigger>
          <TabsTrigger value="preparation" data-ocid="explore.preparation.tab">
            <Zap className="w-3.5 h-3.5 mr-1.5" />
            Training
          </TabsTrigger>
          <TabsTrigger value="highlights" data-ocid="explore.highlights.tab">
            <PlayCircle className="w-3.5 h-3.5 mr-1.5" />
            Highlights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tactics">
          <VideoGrid
            videos={tactics}
            emptyLabel="No tactics videos yet."
            ocidScope="explore.tactics"
          />
        </TabsContent>
        <TabsContent value="preparation">
          <VideoGrid
            videos={preparation}
            emptyLabel="No training videos yet."
            ocidScope="explore.preparation"
          />
        </TabsContent>
        <TabsContent value="highlights">
          <VideoGrid
            videos={highlights}
            emptyLabel="No highlight videos yet."
            ocidScope="explore.highlights"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function VideoGrid({
  videos,
  emptyLabel,
  ocidScope,
}: {
  videos: Video[];
  emptyLabel: string;
  ocidScope: string;
}) {
  if (videos.length === 0) {
    return (
      <div
        className="rounded-xl border border-border bg-card py-12 flex flex-col items-center gap-2 text-center"
        data-ocid={`${ocidScope}.empty_state`}
      >
        <PlayCircle className="w-10 h-10 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        <p className="text-xs text-muted-foreground/60">
          Admins can add videos from the admin panel.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {videos.map((video, i) => (
        <VideoCard
          key={video.videoId}
          video={video}
          index={i}
          ocidScope={ocidScope}
        />
      ))}
    </div>
  );
}

function VideoCard({
  video,
  index,
  ocidScope,
}: {
  video: Video;
  index: number;
  ocidScope: string;
}) {
  // Detect if it's a valid YouTube embed URL
  const isYoutubeEmbed = video.url.includes("youtube.com/embed/");

  return (
    <motion.div
      initial={{ y: 15, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.08 }}
      data-ocid={`${ocidScope}.item.${index + 1}`}
      className="rounded-xl border border-border bg-card overflow-hidden"
    >
      {/* Video Embed */}
      {isYoutubeEmbed ? (
        <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
          <iframe
            src={video.url}
            title={video.title}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
      ) : (
        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block relative"
          data-ocid={`${ocidScope}.link.${index + 1}`}
        >
          <div
            className="w-full flex items-center justify-center"
            style={{
              height: 180,
              background:
                "linear-gradient(135deg, oklch(0.18 0.06 252) 0%, oklch(0.12 0.04 255) 100%)",
            }}
          >
            <PlayCircle
              className="w-16 h-16"
              style={{ color: "oklch(0.6 0.22 24)" }}
            />
          </div>
        </a>
      )}

      {/* Info */}
      <div className="p-3 flex items-center justify-between gap-2">
        <h3 className="font-semibold text-sm text-foreground line-clamp-2 flex-1">
          {video.title}
        </h3>
        {!isYoutubeEmbed && (
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0"
          >
            <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
          </a>
        )}
      </div>
    </motion.div>
  );
}
