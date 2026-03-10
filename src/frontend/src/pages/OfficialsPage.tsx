import { getOfficials } from "@/utils/localStore";
import { Mail, Phone, Shield, Users } from "lucide-react";
import { motion } from "motion/react";

export function OfficialsPage() {
  const officials = getOfficials().sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );

  return (
    <div data-ocid="officials.page" className="min-h-screen pb-24 pt-14">
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
            Meet the Officials
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            The leadership team behind Lamu Sports Hub
          </p>
        </motion.div>
      </div>

      <div className="px-4 mt-5 space-y-3">
        {officials.length === 0 ? (
          <div
            className="rounded-xl border border-border bg-card py-12 flex flex-col items-center gap-3 text-center"
            data-ocid="officials.empty_state"
          >
            <Users className="w-10 h-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              No officials listed yet.
            </p>
          </div>
        ) : (
          officials.map((official, i) => (
            <motion.div
              key={official.officialId}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.06 }}
              data-ocid={`officials.item.${i + 1}`}
            >
              <div className="rounded-xl border border-border bg-card p-4 flex items-start gap-4">
                {/* Avatar */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 ring-2"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.45 0.18 252) 0%, oklch(0.35 0.14 252) 100%)",
                    color: "oklch(0.9 0.05 82)",
                  }}
                >
                  {official.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-sm text-foreground">
                    {official.name}
                  </h3>
                  <p
                    className="text-xs font-semibold mt-0.5"
                    style={{ color: "oklch(0.6 0.22 24)" }}
                  >
                    {official.title}
                  </p>

                  <div className="flex flex-col gap-1.5 mt-2">
                    {official.contact && (
                      <a
                        href={`tel:${official.contact.replace(/\s/g, "")}`}
                        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        data-ocid={`officials.phone.link.${i + 1}`}
                      >
                        <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                        {official.contact}
                      </a>
                    )}
                    {official.email && (
                      <a
                        href={`mailto:${official.email}`}
                        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        data-ocid={`officials.email.link.${i + 1}`}
                      >
                        <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                        {official.email}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Footer note */}
      <div className="px-4 mt-6 text-center">
        <p className="text-xs text-muted-foreground leading-relaxed">
          To reach the LSH leadership team, use the contact details above or
          visit the About page for more information.
        </p>
      </div>
    </div>
  );
}
