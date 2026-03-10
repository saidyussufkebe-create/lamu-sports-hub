import { Badge } from "@/components/ui/badge";
import { type Referee, getReferees } from "@/utils/localStore";
import { Phone, Shield, UserCheck } from "lucide-react";
import { motion } from "motion/react";

export function RefereesPage() {
  const referees = getReferees();

  const active = referees.filter((r) => r.isActive);
  const inactive = referees.filter((r) => !r.isActive);

  return (
    <div data-ocid="referees.page" className="min-h-screen pb-24 pt-14">
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
            <Shield className="w-6 h-6 text-primary" />
            Referees
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Licensed match officials — Season 2025/26
          </p>
        </motion.div>
      </div>

      {/* Stats bar */}
      <div className="px-4 mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl p-3 bg-card border border-border text-center">
          <div className="font-black font-stats text-2xl text-green-400">
            {active.length}
          </div>
          <div className="text-[10px] text-muted-foreground">Active</div>
        </div>
        <div className="rounded-xl p-3 bg-card border border-border text-center">
          <div className="font-black font-stats text-2xl text-muted-foreground">
            {inactive.length}
          </div>
          <div className="text-[10px] text-muted-foreground">Inactive</div>
        </div>
      </div>

      {/* Active Referees */}
      <div className="px-4 mt-5">
        <h2 className="font-display font-bold text-sm text-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <UserCheck className="w-4 h-4 text-green-400" />
          Active Officials
        </h2>
        {active.length === 0 ? (
          <div
            className="rounded-xl border border-border bg-card py-10 flex flex-col items-center gap-2 text-center"
            data-ocid="referees.empty_state"
          >
            <Shield className="w-10 h-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No referees yet.</p>
          </div>
        ) : (
          <div className="space-y-3" data-ocid="referees.list">
            {active.map((ref, i) => (
              <RefereeCard key={ref.refereeId} referee={ref} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* Inactive Referees */}
      {inactive.length > 0 && (
        <div className="px-4 mt-5">
          <h2 className="font-display font-bold text-sm text-muted-foreground uppercase tracking-wide mb-3">
            Inactive / On Leave
          </h2>
          <div className="space-y-3">
            {inactive.map((ref, i) => (
              <RefereeCard key={ref.refereeId} referee={ref} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RefereeCard({
  referee,
  index,
}: {
  referee: Referee;
  index: number;
}) {
  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: index * 0.06 }}
      data-ocid={`referees.item.${index + 1}`}
      className="rounded-xl border border-border bg-card p-4 flex items-center gap-4"
    >
      {/* Avatar */}
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-black flex-shrink-0"
        style={{
          background: referee.isActive
            ? "linear-gradient(135deg, oklch(0.45 0.18 252) 0%, oklch(0.35 0.14 252) 100%)"
            : "oklch(0.22 0.02 252)",
          color: "oklch(0.9 0.05 82)",
        }}
      >
        {referee.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm text-foreground">
            {referee.name}
          </span>
          {referee.isActive ? (
            <Badge
              className="text-[9px] px-1.5 py-0 h-4"
              style={{
                backgroundColor: "oklch(0.3 0.12 145 / 0.3)",
                color: "oklch(0.75 0.18 145)",
                border: "1px solid oklch(0.45 0.18 145 / 0.5)",
              }}
            >
              Active
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">
              Inactive
            </Badge>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          License: {referee.licenseNumber}
        </p>
        <a
          href={`tel:${referee.contact}`}
          className="flex items-center gap-1 text-[11px] mt-1 hover:text-primary transition-colors"
          style={{ color: "oklch(0.6 0.15 252)" }}
          data-ocid={`referees.contact.link.${index + 1}`}
        >
          <Phone className="w-3 h-3" />
          {referee.contact}
        </a>
      </div>
    </motion.div>
  );
}
