import { CheckCircle, Lock, Mail, Phone, Shield } from "lucide-react";
import { motion } from "motion/react";
import { SiFacebook, SiInstagram, SiWhatsapp, SiX } from "react-icons/si";

const APP_VERSION = "1.0.0";

export function AboutPage() {
  return (
    <div data-ocid="about.page" className="min-h-screen pb-24 pt-14">
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
            About LSH
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            App v{APP_VERSION} — Lamu Sports Hub
          </p>
        </motion.div>
      </div>

      <div className="px-4 mt-5 space-y-5">
        {/* About the App */}
        <motion.section
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          data-ocid="about.app.section"
          className="rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">🏝️</span>
            <h2 className="font-display font-bold text-base text-foreground">
              Lamu Sports Hub
            </h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Lamu Sports Hub (LSH) is the official digital platform for managing
            and celebrating football in Lamu County, Kenya. We connect players,
            teams, coaches, referees, and fans in one place — bringing island
            pride to the digital age.
          </p>
          <div
            className="mt-3 px-3 py-2 rounded-lg text-xs font-medium"
            style={{
              background: "oklch(0.18 0.05 252 / 0.5)",
              color: "oklch(0.72 0.14 85)",
            }}
          >
            Version {APP_VERSION} · Phase 1 MVP
          </div>
        </motion.section>

        {/* Developer */}
        <motion.section
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          data-ocid="about.developer.section"
          className="rounded-xl border border-border bg-card p-4"
        >
          <h2 className="font-display font-bold text-sm text-foreground uppercase tracking-wide mb-3">
            Developer
          </h2>
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-black flex-shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.55 0.18 252) 0%, oklch(0.4 0.15 252) 100%)",
                color: "oklch(0.9 0.05 82)",
              }}
            >
              SJ
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">Said Joseph</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Founder & Lead Developer
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                I learned all about life in football ⚽
              </p>
            </div>
          </div>
        </motion.section>

        {/* History */}
        <motion.section
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          data-ocid="about.history.section"
          className="rounded-xl border border-border bg-card p-4"
        >
          <h2 className="font-display font-bold text-sm text-foreground uppercase tracking-wide mb-3">
            History
          </h2>
          <div className="space-y-3">
            {[
              {
                year: "2025",
                event: "Founded",
                desc: "Said Joseph launches Lamu Sports Hub with a vision to digitise local football management.",
              },
              {
                year: "2025",
                event: "First Season",
                desc: "Season 2025/26 kicks off with 8 teams from across Lamu Island.",
              },
              {
                year: "2026",
                event: "Phase 1 Live",
                desc: "Player registration, match management, standings, and leaderboards go online.",
              },
            ].map((item) => (
              <div key={item.event} className="flex gap-3">
                <div
                  className="w-12 text-center text-[10px] font-black pt-0.5 flex-shrink-0"
                  style={{ color: "oklch(0.6 0.22 24)" }}
                >
                  {item.year}
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">
                    {item.event}
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Under-18 */}
        <motion.section
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          data-ocid="about.u18.section"
          className="rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🌟</span>
            <h2 className="font-display font-bold text-sm text-foreground uppercase tracking-wide">
              Under-18 League
            </h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The LSH Under-18 League runs parallel to the senior league. Youth
            teams from all areas of Lamu Island are welcome to register. We
            believe in nurturing young talent and giving every child a platform
            to shine. Contact officials to register a youth team.
          </p>
        </motion.section>

        {/* Social Channels */}
        <motion.section
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          data-ocid="about.social.section"
          className="rounded-xl border border-border bg-card p-4"
        >
          <h2 className="font-display font-bold text-sm text-foreground uppercase tracking-wide mb-3">
            LSH Channels
          </h2>
          <div className="space-y-2.5">
            {[
              {
                icon: <SiWhatsapp className="w-5 h-5" />,
                label: "WhatsApp",
                value: "+254 705 434 375",
                href: "https://wa.me/254705434375",
                color: "oklch(0.6 0.18 145)",
                ocid: "about.whatsapp.link",
              },
              {
                icon: <SiInstagram className="w-5 h-5" />,
                label: "Instagram",
                value: "@lamusportshub",
                href: "https://instagram.com/lamusportshub",
                color: "oklch(0.65 0.22 0)",
                ocid: "about.instagram.link",
              },
              {
                icon: <SiFacebook className="w-5 h-5" />,
                label: "Facebook",
                value: "/lamusportshub",
                href: "https://facebook.com/lamusportshub",
                color: "oklch(0.55 0.2 252)",
                ocid: "about.facebook.link",
              },
              {
                icon: <SiX className="w-5 h-5" />,
                label: "X (Twitter)",
                value: "@lamusportshub",
                href: "https://x.com/lamusportshub",
                color: "oklch(0.85 0.02 255)",
                ocid: "about.x.link",
              },
            ].map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 py-2 rounded-lg hover:bg-muted/20 transition-colors -mx-1 px-1"
                data-ocid={social.ocid}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: `${social.color.replace(")", " / 0.15)").replace("oklch", "oklch")}`,
                    color: social.color,
                  }}
                >
                  {social.icon}
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    {social.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {social.value}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </motion.section>

        {/* Contact Us */}
        <motion.section
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35 }}
          data-ocid="about.contact.section"
          className="rounded-xl border border-border bg-card p-4"
        >
          <h2 className="font-display font-bold text-sm text-foreground uppercase tracking-wide mb-3">
            Contact Us
          </h2>
          <div className="space-y-3">
            <a
              href="mailto:lamusportshub@gmail.com"
              className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
              data-ocid="about.email.link"
            >
              <Mail className="w-5 h-5 text-muted-foreground" />
              <span>lamusportshub@gmail.com</span>
            </a>
            <a
              href="tel:+254705434375"
              className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
              data-ocid="about.phone.link"
            >
              <Phone className="w-5 h-5 text-muted-foreground" />
              <span>+254 705 434 375</span>
            </a>
          </div>
        </motion.section>

        {/* App Safety & Security */}
        <motion.section
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.38 }}
          data-ocid="about.safety.section"
          className="rounded-xl p-4 overflow-hidden relative"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.12 0.05 252) 0%, oklch(0.1 0.03 255) 100%)",
            border: "1px solid oklch(0.55 0.18 252 / 0.35)",
          }}
        >
          {/* Background shield watermark */}
          <div
            className="absolute -right-4 -bottom-4 opacity-5"
            aria-hidden="true"
          >
            <Shield
              className="w-28 h-28"
              style={{ color: "oklch(0.7 0.18 252)" }}
            />
          </div>
          <div className="flex items-center gap-2 mb-3 relative">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "oklch(0.55 0.18 252 / 0.2)" }}
            >
              <Shield
                className="w-4 h-4"
                style={{ color: "oklch(0.72 0.18 252)" }}
              />
            </div>
            <h2 className="font-display font-bold text-sm text-foreground uppercase tracking-wide">
              App Safety &amp; Security
            </h2>
          </div>

          <div className="space-y-3 relative">
            {[
              {
                icon: (
                  <CheckCircle
                    className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                    style={{ color: "oklch(0.65 0.18 145)" }}
                  />
                ),
                title: "On-chain storage",
                desc: "All data (teams, players, matches, news) is stored on the Internet Computer blockchain — it cannot be deleted by anyone except authorised admins.",
              },
              {
                icon: (
                  <Lock
                    className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                    style={{ color: "oklch(0.72 0.18 252)" }}
                  />
                ),
                title: "Internet Identity login",
                desc: "Only users with a verified Internet Identity can write data. Anonymous users can only read public info.",
              },
              {
                icon: (
                  <Shield
                    className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                    style={{ color: "oklch(0.82 0.15 85)" }}
                  />
                ),
                title: "Admin-only control",
                desc: "Only accounts with the Admin role can create news, modify matches, manage users and teams. Fans and players cannot touch core data.",
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-2.5">
                {item.icon}
                <div>
                  <p className="text-xs font-bold text-foreground">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}

            {/* Manual protection steps */}
            <div
              className="rounded-lg p-3 mt-1"
              style={{ background: "oklch(0.16 0.04 252 / 0.6)" }}
            >
              <p className="text-xs font-bold text-foreground mb-2">
                How to protect your app manually:
              </p>
              <ol className="space-y-1.5 list-none">
                {[
                  {
                    num: 1,
                    text: "Never share your Internet Identity with anyone.",
                  },
                  {
                    num: 2,
                    text: "Only assign the Admin role to trusted people.",
                  },
                  {
                    num: 3,
                    text: "If you notice unauthorised changes, go to Admin Panel → Users and remove that person's admin access.",
                  },
                  {
                    num: 4,
                    text: "Use the Suggestions box to report any security concerns to officials.",
                  },
                ].map((step) => (
                  <li
                    key={step.num}
                    className="flex items-start gap-2 text-[11px] text-muted-foreground leading-relaxed"
                  >
                    <span
                      className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black"
                      style={{
                        background: "oklch(0.55 0.18 252 / 0.3)",
                        color: "oklch(0.72 0.18 252)",
                      }}
                    >
                      {step.num}
                    </span>
                    {step.text}
                  </li>
                ))}
              </ol>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              <strong className="text-foreground">
                Urgent security issues?
              </strong>{" "}
              Contact Said Joseph directly through the official LSH channels
              listed below.
            </p>
          </div>
        </motion.section>

        {/* Terms & Conditions */}
        <motion.section
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          data-ocid="about.terms.section"
          className="rounded-xl border border-border bg-card p-4"
        >
          <h2 className="font-display font-bold text-sm text-foreground uppercase tracking-wide mb-3">
            Terms &amp; Conditions
          </h2>
          <div className="space-y-3 text-[12px] text-muted-foreground leading-relaxed">
            <p>
              <strong className="text-foreground">1. Eligibility.</strong>{" "}
              Participants must be registered residents of Lamu County. Players
              must comply with age-group requirements as determined by LSH
              officials.
            </p>
            <p>
              <strong className="text-foreground">2. Fair Play.</strong> All
              players, coaches, and officials are expected to uphold the spirit
              of fair play and sportsmanship. Any form of abuse, cheating, or
              unsportsmanlike conduct will result in disciplinary action.
            </p>
            <p>
              <strong className="text-foreground">3. Registration.</strong>{" "}
              Player registration must be approved by LSH officials. Providing
              false information during registration is grounds for immediate
              disqualification.
            </p>
            <p>
              <strong className="text-foreground">4. Liability.</strong> LSH is
              not liable for any injuries, loss, or damage sustained during
              matches or training. All participants play at their own risk.
            </p>
            <p>
              <strong className="text-foreground">5. Disputes.</strong> All
              disputes must be reported in writing to LSH officials within 48
              hours. Decisions by the LSH Committee are final.
            </p>
            <p>
              <strong className="text-foreground">6. Conduct.</strong> Teams are
              responsible for the conduct of their players and supporters. Teams
              may be penalised for fan misconduct at official events.
            </p>
            <p>
              <strong className="text-foreground">7. Data Use.</strong> By
              registering, you consent to LSH collecting and using your
              information for league management purposes as outlined in our
              Privacy Policy.
            </p>
          </div>
        </motion.section>

        {/* Privacy Policy */}
        <motion.section
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.45 }}
          data-ocid="about.privacy.section"
          className="rounded-xl border border-border bg-card p-4"
        >
          <h2 className="font-display font-bold text-sm text-foreground uppercase tracking-wide mb-3">
            Privacy Policy
          </h2>
          <div className="space-y-3 text-[12px] text-muted-foreground leading-relaxed">
            <p>
              <strong className="text-foreground">Data We Collect.</strong> We
              collect your name, phone number, area of residence, team
              affiliation, and match performance statistics.
            </p>
            <p>
              <strong className="text-foreground">How We Use It.</strong> Your
              data is used solely for league management — publishing standings,
              leaderboards, match fixtures, and player profiles. We do not
              collect payment information.
            </p>
            <p>
              <strong className="text-foreground">Third-Party Sharing.</strong>{" "}
              We do not sell or share your personal data with third parties.
              Aggregate statistics may be shared with county sports authorities
              for reporting purposes.
            </p>
            <p>
              <strong className="text-foreground">Data Retention.</strong> Your
              data is retained for the duration of your registration. You may
              request deletion by contacting lamusportshub@gmail.com.
            </p>
            <p>
              <strong className="text-foreground">Your Rights.</strong> You have
              the right to access, correct, or request deletion of your personal
              data at any time.
            </p>
          </div>
        </motion.section>

        {/* App version footer */}
        <div className="text-center text-xs text-muted-foreground/50 pb-2">
          Lamu Sports Hub v{APP_VERSION} · Island Pride. Island Football. 🏝️
        </div>
      </div>
    </div>
  );
}
