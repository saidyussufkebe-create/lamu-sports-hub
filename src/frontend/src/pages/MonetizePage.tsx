import { useNavigate } from "@tanstack/react-router";
import {
  ChevronRight,
  DollarSign,
  Heart,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import { motion } from "motion/react";

const SPONSORSHIP_CARDS = [
  {
    icon: <Trophy className="w-6 h-6" />,
    title: "Team Registration Fee",
    description:
      "Register your team for the season. Fees help fund pitch maintenance and league operations, keeping island football alive.",
    color: "oklch(0.55 0.18 252)",
    bgColor: "oklch(0.55 0.18 252 / 0.12)",
  },
  {
    icon: <Star className="w-6 h-6" />,
    title: "Local Sponsor Listings",
    description:
      "Advertise your business to the entire Lamu sports community. Match-day shoutouts, banner placements, and profile features for local businesses.",
    color: "oklch(0.82 0.12 82)",
    bgColor: "oklch(0.82 0.12 82 / 0.12)",
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: "Premium Player Profile Badge",
    description:
      "Stand out with a verified premium badge on your player profile. Unlock detailed analytics and increased visibility for scouts.",
    color: "oklch(0.6 0.22 24)",
    bgColor: "oklch(0.6 0.22 24 / 0.12)",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Tournament Hosting Commission",
    description:
      "Host your own tournament through LSH. We manage registration, fixtures, and results for a small commission — bringing the island together.",
    color: "oklch(0.55 0.18 145)",
    bgColor: "oklch(0.55 0.18 145 / 0.12)",
  },
];

export function MonetizePage() {
  const navigate = useNavigate();

  return (
    <div data-ocid="monetize.page" className="min-h-screen pb-24 pt-14">
      {/* Header */}
      <div
        className="px-4 py-6"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.1 0.04 255) 0%, oklch(0.14 0.06 252) 60%, oklch(0.12 0.06 24) 100%)",
        }}
      >
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-6 h-6 text-yellow-400" />
            <h1 className="font-display font-black text-2xl text-foreground">
              Support LSH
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Help us grow island football 🏝️
          </p>
        </motion.div>
      </div>

      {/* Intro text */}
      <div className="px-4 mt-5">
        <motion.p
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-sm text-muted-foreground leading-relaxed"
        >
          Lamu Sports Hub runs on community spirit and local support. Every
          contribution — big or small — goes directly back into developing youth
          talent and island football infrastructure.
        </motion.p>
      </div>

      {/* Cards */}
      <div className="px-4 mt-5 space-y-4">
        {SPONSORSHIP_CARDS.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 + i * 0.07 }}
            data-ocid={`monetize.card.${i + 1}`}
          >
            <div
              className="rounded-xl border border-border bg-card p-5 space-y-3"
              style={{ borderColor: `${card.color.replace(" 0.12", " 0.3")}` }}
            >
              {/* Icon + Title */}
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: card.bgColor,
                    color: card.color,
                  }}
                >
                  {card.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-sm text-foreground leading-tight">
                    {card.title}
                  </h3>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-muted-foreground leading-relaxed">
                {card.description}
              </p>

              {/* CTA */}
              <button
                type="button"
                className="w-full py-2 rounded-lg border text-xs font-bold transition-all hover:opacity-90 flex items-center justify-center gap-1.5"
                style={{
                  backgroundColor: card.bgColor,
                  borderColor: card.color.replace(" /", "33 /"),
                  color: card.color,
                }}
                onClick={() => navigate({ to: "/about" })}
                data-ocid={`monetize.contact.button.${i + 1}`}
              >
                Contact Officials <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer note */}
      <div className="px-4 mt-6">
        <motion.div
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl border border-border/50 bg-muted/20 p-4 text-center"
          data-ocid="monetize.note.panel"
        >
          <p className="text-xs text-muted-foreground leading-relaxed">
            For enquiries, contact{" "}
            <span className="font-semibold text-foreground">Said Joseph</span>{" "}
            or any LSH official via the{" "}
            <button
              type="button"
              className="text-primary font-semibold hover:underline"
              onClick={() => navigate({ to: "/about" })}
              data-ocid="monetize.about.link"
            >
              About page
            </button>
            .
          </p>
        </motion.div>
      </div>
    </div>
  );
}
