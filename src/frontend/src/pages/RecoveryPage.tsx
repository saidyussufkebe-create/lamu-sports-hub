import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addRecoveryRequest } from "@/utils/localStore";
import {
  ArrowLeft,
  CheckCircle,
  ExternalLink,
  KeyRound,
  Laptop,
  MessageSquare,
  Ticket,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

const STEPS = [
  {
    icon: <KeyRound className="w-5 h-5" />,
    title: "Use your Recovery Phrase",
    desc: 'If you saved a seed phrase when setting up Internet Identity, visit identity.ic0.app and use "Lost Access" to recover with it.',
    color: "oklch(0.55 0.18 252)",
    bg: "oklch(0.55 0.18 252 / 0.12)",
  },
  {
    icon: <Laptop className="w-5 h-5" />,
    title: "Use Another Device",
    desc: "If you linked another device — a phone, tablet, or laptop — use that device to log into Internet Identity and manage your identity.",
    color: "oklch(0.6 0.22 24)",
    bg: "oklch(0.6 0.22 24 / 0.12)",
  },
  {
    icon: <MessageSquare className="w-5 h-5" />,
    title: "Contact Officials",
    desc: "If you've lost both, submit a recovery request below. An LSH official will review it and help re-link your account within 24–48 hours.",
    color: "oklch(0.65 0.15 155)",
    bg: "oklch(0.65 0.15 155 / 0.12)",
  },
  {
    icon: <ExternalLink className="w-5 h-5" />,
    title: "Visit II Portal",
    desc: "The Internet Identity portal lets you manage linked devices, anchors, and recovery options directly.",
    color: "oklch(0.82 0.08 82)",
    bg: "oklch(0.82 0.08 82 / 0.12)",
    isPortal: true,
  },
];

export function RecoveryPage() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [principalId, setPrincipalId] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Full name is required";
    if (!contact.trim()) newErrors.contact = "Phone or email is required";
    if (!issueDescription.trim())
      newErrors.issue = "Please describe your issue";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const ticket = addRecoveryRequest({
      name: name.trim(),
      contact: contact.trim(),
      lastPrincipalId: principalId.trim(),
      issueDescription: issueDescription.trim(),
    });
    setTicketId(ticket.ticketId);
    setSubmitted(true);
  };

  return (
    <div
      data-ocid="recovery.page"
      className="min-h-screen flex flex-col"
      style={{
        background:
          "linear-gradient(160deg, oklch(0.08 0.04 258) 0%, oklch(0.12 0.05 252) 40%, oklch(0.1 0.03 248) 70%, oklch(0.09 0.06 245) 100%)",
      }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/3 right-0 w-72 h-72 rounded-full opacity-5"
          style={{
            background:
              "radial-gradient(circle, oklch(0.55 0.18 252), transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-1/4 left-0 w-48 h-48 rounded-full opacity-5"
          style={{
            background:
              "radial-gradient(circle, oklch(0.6 0.22 24), transparent 70%)",
          }}
        />
      </div>

      {/* Top bar */}
      <div className="relative z-10 flex items-center gap-3 px-4 pt-5 pb-4 border-b border-white/10">
        <a
          href="/"
          className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-foreground"
          style={{ color: "oklch(0.65 0.08 252)" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </a>
        <div className="flex-1" />
        <img
          src="/assets/generated/lamu-sports-hub-logo-transparent.dim_400x400.png"
          alt="LSH"
          className="w-8 h-8 object-contain opacity-80"
        />
      </div>

      <div className="relative z-10 flex-1 px-4 pb-12 max-w-lg mx-auto w-full">
        {/* Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="pt-8 pb-6"
        >
          <h1 className="font-display font-black text-2xl sm:text-3xl text-foreground mb-2">
            Lost Access to Your Account?
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Lamu Sports Hub uses Internet Identity — there's no password to
            reset. Instead, you recover access using your device or seed phrase.
            Follow the steps below.
          </p>
        </motion.div>

        {/* Section A: Recovery Guide */}
        <motion.section
          data-ocid="recovery.guide_section"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-8"
        >
          <h2
            className="font-display font-bold text-sm uppercase tracking-widest mb-3"
            style={{ color: "oklch(0.6 0.22 24)" }}
          >
            Recovery Options
          </h2>
          <div className="space-y-3">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.15 + i * 0.08, duration: 0.4 }}
                className="rounded-xl border p-4 flex gap-3"
                style={{
                  backgroundColor: step.bg,
                  borderColor: `${step.color.replace(")", " / 0.25)").replace("oklch(", "oklch(")}`,
                }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: step.bg, color: step.color }}
                >
                  {step.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground mb-1">
                    {step.isPortal && (
                      <span className="inline-flex items-center gap-1">
                        Step {i + 1}: {step.title}
                      </span>
                    )}
                    {!step.isPortal && `Step ${i + 1}: ${step.title}`}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
                  {step.isPortal && (
                    <a
                      href="https://identity.ic0.app"
                      target="_blank"
                      rel="noopener noreferrer"
                      data-ocid="recovery.ii_portal_button"
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                      style={{
                        background: "oklch(0.82 0.08 82 / 0.2)",
                        color: "oklch(0.82 0.08 82)",
                        border: "1px solid oklch(0.82 0.08 82 / 0.3)",
                      }}
                    >
                      <ExternalLink className="w-3 h-3" />
                      Open II Portal
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Section B: Recovery Request Form */}
        <motion.section
          data-ocid="recovery.form_section"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div
            className="rounded-2xl border p-5"
            style={{
              backgroundColor: "oklch(0.14 0.04 255 / 0.8)",
              borderColor: "oklch(0.28 0.05 252)",
            }}
          >
            <h2 className="font-display font-bold text-base text-foreground mb-1">
              Submit a Recovery Request
            </h2>
            <p className="text-xs text-muted-foreground mb-5 leading-relaxed">
              Can't recover via the methods above? Fill out the form and an LSH
              official will reach out to you within 24–48 hours.
            </p>

            {submitted ? (
              /* Success state */
              <motion.div
                data-ocid="recovery.success_state"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: "backOut" }}
                className="text-center py-4"
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: "oklch(0.65 0.15 155 / 0.15)" }}
                >
                  <CheckCircle
                    className="w-7 h-7"
                    style={{ color: "oklch(0.65 0.15 155)" }}
                  />
                </div>
                <h3 className="font-display font-bold text-base text-foreground mb-1">
                  Request Submitted!
                </h3>
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                  Keep this ticket ID safe. An official will review your request
                  and respond within 24–48 hours.
                </p>
                <div
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl mb-4"
                  style={{
                    background: "oklch(0.55 0.18 252 / 0.15)",
                    border: "1px solid oklch(0.55 0.18 252 / 0.3)",
                  }}
                >
                  <Ticket
                    className="w-4 h-4"
                    style={{ color: "oklch(0.55 0.18 252)" }}
                  />
                  <span
                    className="font-mono font-bold text-sm tracking-wider"
                    style={{ color: "oklch(0.75 0.12 252)" }}
                  >
                    {ticketId}
                  </span>
                </div>
                <div>
                  <a
                    href="/recovery-status"
                    data-ocid="recovery.check_status_link"
                    className="text-xs font-medium underline underline-offset-2 transition-colors hover:opacity-80"
                    style={{ color: "oklch(0.6 0.22 24)" }}
                  >
                    Check request status →
                  </a>
                </div>
              </motion.div>
            ) : (
              /* Form */
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label
                    htmlFor="recovery-name"
                    className="text-xs mb-1.5 block"
                  >
                    Full Name{" "}
                    <span style={{ color: "oklch(0.6 0.22 24)" }}>*</span>
                  </Label>
                  <Input
                    id="recovery-name"
                    data-ocid="recovery.name_input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="text-sm h-10"
                  />
                  {errors.name && (
                    <p
                      className="text-xs mt-1"
                      style={{ color: "oklch(0.6 0.22 24)" }}
                    >
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="recovery-contact"
                    className="text-xs mb-1.5 block"
                  >
                    Phone or Email{" "}
                    <span style={{ color: "oklch(0.6 0.22 24)" }}>*</span>
                  </Label>
                  <Input
                    id="recovery-contact"
                    data-ocid="recovery.contact_input"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="+254 7XX XXX XXX or email@example.com"
                    className="text-sm h-10"
                  />
                  {errors.contact && (
                    <p
                      className="text-xs mt-1"
                      style={{ color: "oklch(0.6 0.22 24)" }}
                    >
                      {errors.contact}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="recovery-principal"
                    className="text-xs mb-1.5 block"
                  >
                    Last Known Principal ID{" "}
                    <span className="text-muted-foreground font-normal">
                      (optional)
                    </span>
                  </Label>
                  <Input
                    id="recovery-principal"
                    data-ocid="recovery.principal_input"
                    value={principalId}
                    onChange={(e) => setPrincipalId(e.target.value)}
                    placeholder="e.g. xxxxx-xxxxx-xxxxx-xxxxx-cai"
                    className="text-sm h-10 font-mono"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="recovery-issue"
                    className="text-xs mb-1.5 block"
                  >
                    Describe Your Issue{" "}
                    <span style={{ color: "oklch(0.6 0.22 24)" }}>*</span>
                  </Label>
                  <Textarea
                    id="recovery-issue"
                    data-ocid="recovery.issue_textarea"
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                    placeholder="Explain what happened — e.g. lost phone, wiped device, can't access recovery phrase..."
                    className="text-sm min-h-[90px] resize-none"
                  />
                  {errors.issue && (
                    <p
                      className="text-xs mt-1"
                      style={{ color: "oklch(0.6 0.22 24)" }}
                    >
                      {errors.issue}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  data-ocid="recovery.submit_button"
                  className="w-full font-bold text-sm h-11 rounded-xl"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.6 0.22 24) 0%, oklch(0.55 0.25 20) 100%)",
                    color: "oklch(0.97 0 0)",
                  }}
                >
                  Submit Recovery Request
                </Button>
              </form>
            )}
          </div>
        </motion.section>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Built with ❤️ using caffeine.ai
          </a>
        </div>
      </div>
    </div>
  );
}
