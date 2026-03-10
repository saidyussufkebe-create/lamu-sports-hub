import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getOfficialCode,
  setOfficialSessionVerified,
} from "@/utils/localStore";
import { Lock, ShieldCheck } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface OfficialAccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerified?: () => void;
}

export function OfficialAccessModal({
  open,
  onOpenChange,
  onVerified,
}: OfficialAccessModalProps) {
  const [code, setCode] = useState("");
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleClose() {
    if (loading) return;
    setCode("");
    setShake(false);
    setSuccess(false);
    onOpenChange(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);

    // Simulate brief check delay for feel
    await new Promise((r) => setTimeout(r, 350));

    const correctCode = getOfficialCode();
    if (code.trim() === correctCode) {
      setOfficialSessionVerified();
      setSuccess(true);
      setLoading(false);
      toast.success("Official access unlocked!", {
        description: "Welcome, official. Controls are now active.",
        icon: "🔓",
      });
      await new Promise((r) => setTimeout(r, 700));
      onVerified?.();
      handleClose();
    } else {
      setShake(true);
      setLoading(false);
      setCode("");
      setTimeout(() => {
        setShake(false);
        inputRef.current?.focus();
      }, 600);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-sm mx-auto rounded-2xl"
        data-ocid="official_access.dialog"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5 font-display text-lg">
            <span
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.35 0.12 252) 0%, oklch(0.28 0.1 252) 100%)",
              }}
            >
              <Lock className="w-4.5 h-4.5 text-primary" />
            </span>
            Official Access
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Enter your official access code to unlock admin controls.
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-3 py-6"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: "oklch(0.3 0.1 155 / 0.3)" }}
              >
                <ShieldCheck
                  className="w-8 h-8"
                  style={{ color: "oklch(0.65 0.15 155)" }}
                />
              </div>
              <p className="font-display font-bold text-base text-foreground">
                Access Unlocked!
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              className="space-y-5 mt-2"
            >
              <div className="space-y-2">
                <Label
                  htmlFor="official-code"
                  className="text-sm font-semibold"
                >
                  Access Code
                </Label>
                <motion.div
                  animate={shake ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  <Input
                    ref={inputRef}
                    id="official-code"
                    type="password"
                    placeholder="Enter code…"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    autoComplete="off"
                    autoFocus
                    className="h-11 text-base tracking-widest font-mono"
                    data-ocid="official_access.input"
                  />
                </motion.div>
                <AnimatePresence>
                  {shake && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs font-medium"
                      style={{ color: "oklch(0.6 0.22 24)" }}
                      data-ocid="official_access.error_state"
                    >
                      Incorrect access code. Contact Said Joseph.
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleClose}
                  disabled={loading}
                  data-ocid="official_access.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 font-bold"
                  disabled={loading || !code.trim()}
                  data-ocid="official_access.submit_button"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.55 0.18 252) 0%, oklch(0.45 0.16 252) 100%)",
                    color: "oklch(0.97 0 0)",
                  }}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 0.8,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "linear",
                        }}
                        className="inline-block"
                      >
                        ⟳
                      </motion.span>
                      Checking…
                    </span>
                  ) : (
                    "Unlock Access"
                  )}
                </Button>
              </div>

              <p className="text-center text-[11px] text-muted-foreground">
                Code issued by Said Joseph · Chairman &amp; Founder
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
