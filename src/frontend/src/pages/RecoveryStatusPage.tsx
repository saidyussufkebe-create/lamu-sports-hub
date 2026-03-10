import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type RecoveryRequest, getRecoveryRequests } from "@/utils/localStore";
import {
  ArrowLeft,
  Clock,
  MessageSquare,
  Search,
  Ticket,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

function StatusBadge({ status }: { status: RecoveryRequest["status"] }) {
  if (status === "pending") {
    return (
      <Badge
        className="text-xs font-bold px-2 py-0.5"
        style={{
          background: "oklch(0.75 0.18 82 / 0.2)",
          color: "oklch(0.65 0.18 82)",
          border: "1px solid oklch(0.65 0.18 82 / 0.3)",
        }}
      >
        <Clock className="w-3 h-3 mr-1" />
        Pending Review
      </Badge>
    );
  }
  if (status === "resolved") {
    return (
      <Badge
        className="text-xs font-bold px-2 py-0.5"
        style={{
          background: "oklch(0.65 0.15 155 / 0.2)",
          color: "oklch(0.65 0.15 155)",
          border: "1px solid oklch(0.65 0.15 155 / 0.3)",
        }}
      >
        ✓ Resolved
      </Badge>
    );
  }
  return (
    <Badge
      className="text-xs font-bold px-2 py-0.5"
      style={{
        background: "oklch(0.6 0.22 24 / 0.15)",
        color: "oklch(0.6 0.22 24)",
        border: "1px solid oklch(0.6 0.22 24 / 0.3)",
      }}
    >
      <XCircle className="w-3 h-3 mr-1" />
      Rejected
    </Badge>
  );
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function RecoveryStatusPage() {
  const [ticketInput, setTicketInput] = useState("");
  const [result, setResult] = useState<RecoveryRequest | null | undefined>(
    undefined,
  );

  const handleCheck = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = ticketInput.trim().toUpperCase();
    const all = getRecoveryRequests();
    const found = all.find((r) => r.ticketId === trimmed) ?? null;
    setResult(found);
  };

  return (
    <div
      data-ocid="recovery_status.page"
      className="min-h-screen flex flex-col"
      style={{
        background:
          "linear-gradient(160deg, oklch(0.08 0.04 258) 0%, oklch(0.12 0.05 252) 40%, oklch(0.1 0.03 248) 70%, oklch(0.09 0.06 245) 100%)",
      }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 right-0 w-64 h-64 rounded-full opacity-5"
          style={{
            background:
              "radial-gradient(circle, oklch(0.55 0.18 252), transparent 70%)",
          }}
        />
      </div>

      {/* Top bar */}
      <div className="relative z-10 flex items-center gap-3 px-4 pt-5 pb-4 border-b border-white/10">
        <a
          href="/recovery"
          className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-foreground"
          style={{ color: "oklch(0.65 0.08 252)" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Recovery
        </a>
        <div className="flex-1" />
        <img
          src="/assets/generated/lamu-sports-hub-logo-transparent.dim_400x400.png"
          alt="LSH"
          className="w-8 h-8 object-contain opacity-80"
        />
      </div>

      <div className="relative z-10 flex-1 px-4 pb-12 max-w-md mx-auto w-full">
        {/* Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="pt-8 pb-6"
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
            style={{ background: "oklch(0.55 0.18 252 / 0.15)" }}
          >
            <Search
              className="w-6 h-6"
              style={{ color: "oklch(0.55 0.18 252)" }}
            />
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-foreground mb-2">
            Check Recovery Status
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Enter the ticket ID you received when you submitted your recovery
            request to see its current status.
          </p>
        </motion.div>

        {/* Lookup form */}
        <motion.form
          onSubmit={handleCheck}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="space-y-3 mb-6"
        >
          <div>
            <Label htmlFor="ticket-id" className="text-xs mb-1.5 block">
              Ticket ID
            </Label>
            <Input
              id="ticket-id"
              data-ocid="recovery_status.ticket_input"
              value={ticketInput}
              onChange={(e) => setTicketInput(e.target.value)}
              placeholder="e.g. LSH-REC-1234"
              className="text-sm h-11 font-mono tracking-wider"
              autoComplete="off"
            />
          </div>
          <Button
            type="submit"
            data-ocid="recovery_status.check_button"
            className="w-full font-bold text-sm h-11 rounded-xl"
            disabled={!ticketInput.trim()}
            style={{
              background:
                "linear-gradient(135deg, oklch(0.55 0.18 252) 0%, oklch(0.45 0.16 252) 100%)",
              color: "oklch(0.97 0 0)",
            }}
          >
            <Search className="w-4 h-4 mr-2" />
            Check Status
          </Button>
        </motion.form>

        {/* Result */}
        <AnimatePresence mode="wait">
          {result === null && (
            <motion.div
              key="not-found"
              data-ocid="recovery_status.error_state"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-xl border p-5 text-center"
              style={{
                background: "oklch(0.6 0.22 24 / 0.08)",
                borderColor: "oklch(0.6 0.22 24 / 0.25)",
              }}
            >
              <XCircle
                className="w-8 h-8 mx-auto mb-2"
                style={{ color: "oklch(0.6 0.22 24)" }}
              />
              <p className="font-semibold text-sm text-foreground mb-1">
                No Request Found
              </p>
              <p className="text-xs text-muted-foreground">
                No request found with ticket ID{" "}
                <span className="font-mono font-bold text-foreground">
                  {ticketInput.trim().toUpperCase()}
                </span>
                . Check the ID and try again.
              </p>
            </motion.div>
          )}

          {result !== null && result !== undefined && (
            <motion.div
              key="found"
              data-ocid="recovery_status.result_card"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-xl border p-5 space-y-4"
              style={{
                background: "oklch(0.14 0.04 255 / 0.8)",
                borderColor: "oklch(0.28 0.05 252)",
              }}
            >
              {/* Ticket header */}
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "oklch(0.55 0.18 252 / 0.15)" }}
                >
                  <Ticket
                    className="w-5 h-5"
                    style={{ color: "oklch(0.55 0.18 252)" }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono font-bold text-sm text-foreground">
                      {result.ticketId}
                    </span>
                    <StatusBadge status={result.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Submitted {formatDate(result.submittedAt)}
                  </p>
                </div>
              </div>

              {/* Request details */}
              <div
                className="rounded-lg p-3 space-y-2"
                style={{ background: "oklch(0.1 0.03 248 / 0.5)" }}
              >
                <div className="flex gap-2">
                  <span className="text-xs text-muted-foreground w-16 flex-shrink-0">
                    Name
                  </span>
                  <span className="text-xs font-medium text-foreground">
                    {result.name}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="text-xs text-muted-foreground w-16 flex-shrink-0">
                    Contact
                  </span>
                  <span className="text-xs font-medium text-foreground">
                    {result.contact}
                  </span>
                </div>
                {result.lastPrincipalId && (
                  <div className="flex gap-2">
                    <span className="text-xs text-muted-foreground w-16 flex-shrink-0">
                      Principal
                    </span>
                    <span className="text-xs font-mono text-foreground break-all">
                      {result.lastPrincipalId}
                    </span>
                  </div>
                )}
                <div className="flex gap-2">
                  <span className="text-xs text-muted-foreground w-16 flex-shrink-0">
                    Issue
                  </span>
                  <span className="text-xs text-foreground leading-relaxed">
                    {result.issueDescription}
                  </span>
                </div>
              </div>

              {/* Admin reply */}
              {result.adminReply ? (
                <div
                  className="rounded-lg p-3"
                  style={{
                    background: "oklch(0.65 0.15 155 / 0.1)",
                    border: "1px solid oklch(0.65 0.15 155 / 0.25)",
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <MessageSquare
                      className="w-3.5 h-3.5"
                      style={{ color: "oklch(0.65 0.15 155)" }}
                    />
                    <span
                      className="text-xs font-bold uppercase tracking-wide"
                      style={{ color: "oklch(0.65 0.15 155)" }}
                    >
                      Official Reply
                    </span>
                  </div>
                  <p className="text-xs text-foreground leading-relaxed">
                    {result.adminReply}
                  </p>
                </div>
              ) : (
                result.status === "pending" && (
                  <p className="text-xs text-muted-foreground text-center py-1">
                    No reply yet. An official will respond within 24–48 hours.
                  </p>
                )
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="mt-10 text-center text-xs text-muted-foreground">
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
