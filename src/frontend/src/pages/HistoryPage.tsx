import { motion } from "motion/react";

type Milestone = {
  year: string;
  month?: string;
  title: string;
  description: string;
  icon: string;
};

const MILESTONES: Milestone[] = [
  {
    year: "2025",
    month: "January",
    title: "The Vision",
    description:
      "Said Joseph envisions a digital platform to connect the fragmented youth football scene in Lamu, where talent goes unrecognized and records are kept on paper.",
    icon: "💡",
  },
  {
    year: "2025",
    month: "April",
    title: "Lamu Sports Hub Founded",
    description:
      "LSH is officially founded with a mission to digitise, celebrate, and develop Lamu youth sports. The first committee is formed with four founding officials.",
    icon: "🏝️",
  },
  {
    year: "2025",
    month: "July",
    title: "First Team Registrations",
    description:
      "Eight teams from across the island — Shela, Hindi, Mkunguni, Langoni, Mkomani, Lamu Town, Matondoni, and Kipungani — register for the inaugural season.",
    icon: "⚽",
  },
  {
    year: "2025",
    month: "September",
    title: "Referees & Officials Appointed",
    description:
      "Licensed referees are vetted and appointed. A transparent officiating structure is established, bringing credibility to every match.",
    icon: "🟡",
  },
  {
    year: "2025",
    month: "October",
    title: "Season 2025/26 Kicks Off",
    description:
      "The inaugural Lamu Premier League season begins. Matchdays are held across Twaif, Mala, Sports Ground, and the Carpet Field.",
    icon: "🚀",
  },
  {
    year: "2026",
    month: "January",
    title: "Digital Platform Launches",
    description:
      "The LSH app goes live with real-time standings, player profiles, match results, leaderboards, and fan engagement features.",
    icon: "📱",
  },
  {
    year: "2026",
    month: "March",
    title: "Community Grows",
    description:
      "Over 200 registered players, 8 teams, and hundreds of fans. The platform becomes the heartbeat of Lamu football.",
    icon: "🌍",
  },
  {
    year: "Future",
    title: "What's Next",
    description:
      "Phase 2 brings Under-18 tournaments, talent scouting, sponsor integrations, and multi-sport expansion. Lamu youth sport is only getting started.",
    icon: "🌟",
  },
];

export function HistoryPage() {
  return (
    <div data-ocid="history.page" className="min-h-screen pb-24 pt-14">
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
          <h1 className="font-display font-black text-2xl text-foreground">
            Our History
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            The story of Lamu Sports Hub 🏝️
          </p>
        </motion.div>
      </div>

      {/* Intro */}
      <div className="px-4 mt-5">
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl p-4 border border-border relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.2 0.06 252 / 0.4) 0%, oklch(0.14 0.04 252) 100%)",
          }}
        >
          <div
            className="absolute top-0 right-0 text-8xl opacity-5 font-black font-stats leading-none pointer-events-none"
            style={{ color: "oklch(0.82 0.08 82)" }}
          >
            LSH
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed relative">
            Lamu Sports Hub was born from a simple belief: that the football
            talent in Lamu deserves a stage. From the alleys of Langoni to the
            beaches of Shela, this island has always had heart. Now it has a
            home.
          </p>
        </motion.div>
      </div>

      {/* Timeline */}
      <div className="px-4 mt-6">
        <div className="relative">
          {/* Vertical line */}
          <div
            className="absolute left-5 top-0 bottom-0 w-0.5 rounded-full"
            style={{ background: "oklch(0.3 0.06 252)" }}
          />

          <div className="space-y-6">
            {MILESTONES.map((milestone, i) => (
              <motion.div
                key={milestone.title}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.07 + 0.15 }}
                className="flex gap-4 relative"
                data-ocid={`history.item.${i + 1}`}
              >
                {/* Icon bubble */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg border-2 relative z-10"
                  style={{
                    background:
                      milestone.year === "Future"
                        ? "linear-gradient(135deg, oklch(0.72 0.14 85) 0%, oklch(0.6 0.18 85) 100%)"
                        : "linear-gradient(135deg, oklch(0.2 0.06 252) 0%, oklch(0.16 0.04 252) 100%)",
                    borderColor:
                      milestone.year === "Future"
                        ? "oklch(0.72 0.14 85)"
                        : "oklch(0.35 0.08 252)",
                  }}
                >
                  {milestone.icon}
                </div>

                {/* Content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-[10px] font-black uppercase tracking-widest"
                      style={{
                        color:
                          milestone.year === "Future"
                            ? "oklch(0.72 0.14 85)"
                            : "oklch(0.6 0.22 24)",
                      }}
                    >
                      {milestone.month
                        ? `${milestone.month} ${milestone.year}`
                        : milestone.year}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-sm text-foreground mb-1">
                    {milestone.title}
                  </h3>
                  <p className="text-[12px] text-muted-foreground leading-relaxed">
                    {milestone.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 mt-6 pb-2">
        <div
          className="rounded-xl p-4 text-center"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.18 0.06 252) 0%, oklch(0.12 0.04 255) 100%)",
          }}
        >
          <p className="font-display font-black text-lg text-foreground">
            Island Pride. Island Football.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            🏝️ Built for Lamu. Built by Lamu.
          </p>
        </div>
      </div>
    </div>
  );
}
