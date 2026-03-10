import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Award, getAwards } from "@/utils/localStore";
import {
  Award as AwardIcon,
  CheckCircle,
  Shield,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import { motion } from "motion/react";

export function AwardsPage() {
  const awards = getAwards();

  const playerAwards = awards.filter((a) => a.recipientType === "player");
  const teamAwards = awards.filter((a) => a.recipientType === "team");

  return (
    <div data-ocid="awards.page" className="min-h-screen pb-24 pt-14">
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
            <Trophy
              className="w-6 h-6"
              style={{ color: "oklch(0.82 0.16 85)" }}
            />
            Awards
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Season honours — LSH 2025/26
          </p>
        </motion.div>
      </div>

      {/* Summary */}
      <div className="px-4 mt-4 grid grid-cols-3 gap-2">
        {[
          { label: "Total", value: awards.length, icon: "🏆" },
          {
            label: "Confirmed",
            value: awards.filter((a) => a.isConfirmed).length,
            icon: "✅",
          },
          {
            label: "Pending",
            value: awards.filter((a) => !a.isConfirmed).length,
            icon: "⏳",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl p-3 bg-card border border-border text-center"
          >
            <div className="text-xl">{s.icon}</div>
            <div className="font-black font-stats text-xl text-foreground">
              {s.value}
            </div>
            <div className="text-[9px] text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="player" className="px-4 pt-4" data-ocid="awards.tab">
        <TabsList className="w-full grid grid-cols-2 mb-4">
          <TabsTrigger value="player" data-ocid="awards.player.tab">
            <Star className="w-3.5 h-3.5 mr-1.5" />
            Player Awards
          </TabsTrigger>
          <TabsTrigger value="team" data-ocid="awards.team.tab">
            <Users className="w-3.5 h-3.5 mr-1.5" />
            Team Awards
          </TabsTrigger>
        </TabsList>

        <TabsContent value="player">
          {playerAwards.length === 0 ? (
            <div
              className="rounded-xl border border-border bg-card py-12 flex flex-col items-center gap-2 text-center"
              data-ocid="awards.player.empty_state"
            >
              <AwardIcon className="w-10 h-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                No player awards yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {playerAwards.map((award, i) => (
                <AwardCard key={award.awardId} award={award} index={i} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="team">
          {teamAwards.length === 0 ? (
            <div
              className="rounded-xl border border-border bg-card py-12 flex flex-col items-center gap-2 text-center"
              data-ocid="awards.team.empty_state"
            >
              <Trophy className="w-10 h-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                No team awards yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {teamAwards.map((award, i) => (
                <AwardCard key={award.awardId} award={award} index={i} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AwardCard({ award, index }: { award: Award; index: number }) {
  const isConfirmed = award.isConfirmed;

  return (
    <motion.div
      initial={{ y: 15, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.07 }}
      data-ocid={`awards.item.${index + 1}`}
      className="rounded-xl border bg-card p-4 relative overflow-hidden"
      style={{
        borderColor: isConfirmed
          ? "oklch(0.72 0.14 85 / 0.4)"
          : "oklch(0.3 0.02 252)",
        background: isConfirmed
          ? "linear-gradient(135deg, oklch(0.18 0.05 85 / 0.3) 0%, oklch(0.16 0.04 252) 100%)"
          : undefined,
      }}
    >
      {/* Decorative trophy watermark */}
      <div className="absolute right-3 top-3 opacity-8 text-5xl pointer-events-none select-none">
        🏆
      </div>

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: isConfirmed
              ? "linear-gradient(135deg, oklch(0.72 0.14 85) 0%, oklch(0.6 0.18 85) 100%)"
              : "oklch(0.22 0.02 252)",
            color: isConfirmed ? "oklch(0.12 0.04 252)" : "oklch(0.5 0.04 252)",
          }}
        >
          {award.recipientType === "player" ? (
            <Star className="w-5 h-5" />
          ) : (
            <Shield className="w-5 h-5" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display font-bold text-sm text-foreground">
              {award.title}
            </h3>
            {isConfirmed ? (
              <span
                className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: "oklch(0.72 0.14 85 / 0.15)",
                  color: "oklch(0.72 0.14 85)",
                  border: "1px solid oklch(0.72 0.14 85 / 0.4)",
                }}
              >
                <CheckCircle className="w-2.5 h-2.5" />
                Confirmed
              </span>
            ) : (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                Pending
              </span>
            )}
          </div>

          <p
            className="text-xs font-semibold mt-0.5"
            style={{ color: "oklch(0.6 0.22 24)" }}
          >
            {award.recipientName}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
            {award.description}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[10px] text-muted-foreground/60">
              Season: {award.season}
            </span>
            <span className="text-[10px] text-muted-foreground/60">
              {new Date(award.awardDate).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
