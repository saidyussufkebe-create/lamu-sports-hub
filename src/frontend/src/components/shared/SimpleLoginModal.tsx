import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  type SimpleUserProfile,
  createSimpleUser,
  getAllSimpleProfiles,
  setActiveSimpleSession,
  verifySimpleUser,
} from "@/utils/simpleAuth";
import { AlertCircle, Loader2, UserPlus, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const AREAS = [
  "Shela",
  "Hindi",
  "Mkunguni",
  "Langoni",
  "Mkomani",
  "Lamu Town",
  "Matondoni",
  "Kipungani",
];

const ROLE_OPTIONS = [
  { value: "fan", label: "⚽ Fan" },
  { value: "player", label: "🏃 Player" },
  { value: "coach", label: "🎽 Coach" },
] as const;

interface SimpleLoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (profile: SimpleUserProfile) => void;
}

export function SimpleLoginModal({
  open,
  onOpenChange,
  onSuccess,
}: SimpleLoginModalProps) {
  // ── Register state ────────────────────────────────────────────────────────
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regRole, setRegRole] = useState<"fan" | "player" | "coach">("fan");
  const [regArea, setRegArea] = useState("Lamu Town");
  const [regPin, setRegPin] = useState("");
  const [regPinConfirm, setRegPinConfirm] = useState("");
  const [regError, setRegError] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  // ── Sign-in state ─────────────────────────────────────────────────────────
  const [selectedUserId, setSelectedUserId] = useState("");
  const [signInPin, setSignInPin] = useState("");
  const [signInError, setSignInError] = useState("");
  const [signInLoading, setSignInLoading] = useState(false);

  const existingProfiles = getAllSimpleProfiles();

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleRegister = async () => {
    setRegError("");

    if (!regName.trim()) {
      setRegError("Full name is required.");
      return;
    }
    if (regPin.length !== 4 || !/^\d{4}$/.test(regPin)) {
      setRegError("PIN must be exactly 4 digits.");
      return;
    }
    if (regPin !== regPinConfirm) {
      setRegError("PINs do not match.");
      return;
    }

    setRegLoading(true);
    // Small delay so the loading state is visible
    await new Promise((r) => setTimeout(r, 400));

    try {
      const profile = createSimpleUser(
        regName,
        regPhone,
        regEmail,
        regRole,
        regArea,
        regPin,
      );
      setActiveSimpleSession(profile);
      toast.success(`Welcome to Lamu Sports Hub, ${profile.name}! 🏝️`);
      onSuccess(profile);
      onOpenChange(false);
      // Reset form
      setRegName("");
      setRegPhone("");
      setRegEmail("");
      setRegRole("fan");
      setRegArea("Lamu Town");
      setRegPin("");
      setRegPinConfirm("");
    } catch {
      setRegError("Registration failed. Please try again.");
    } finally {
      setRegLoading(false);
    }
  };

  const handleSignIn = async () => {
    setSignInError("");

    if (!selectedUserId) {
      setSignInError("Please select your name.");
      return;
    }
    if (signInPin.length !== 4 || !/^\d{4}$/.test(signInPin)) {
      setSignInError("PIN must be exactly 4 digits.");
      return;
    }

    setSignInLoading(true);
    await new Promise((r) => setTimeout(r, 400));

    try {
      const profile = verifySimpleUser(selectedUserId, signInPin);
      if (!profile) {
        setSignInError("Incorrect PIN. Please try again.");
        return;
      }
      setActiveSimpleSession(profile);
      toast.success(`Welcome back, ${profile.name}! 🏝️`);
      onSuccess(profile);
      onOpenChange(false);
      setSelectedUserId("");
      setSignInPin("");
    } finally {
      setSignInLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-sm w-full rounded-2xl border-0 p-0 overflow-hidden"
        style={{
          background: "oklch(0.13 0.04 255)",
          border: "1px solid oklch(0.25 0.05 252)",
        }}
        data-ocid="simple_login.dialog"
      >
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle
            className="font-display font-black text-xl"
            style={{ color: "oklch(0.82 0.08 82)" }}
          >
            Lamu Sports Hub
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Join the community — no passkey required.
          </p>
        </DialogHeader>

        <Tabs defaultValue="register" className="w-full px-6 pb-6">
          <TabsList
            className="w-full grid grid-cols-2 mb-5 rounded-xl h-10"
            style={{ background: "oklch(0.18 0.04 252)" }}
          >
            <TabsTrigger
              value="register"
              className="rounded-lg text-sm font-semibold data-[state=active]:shadow-sm"
              data-ocid="simple_login.register.tab"
            >
              <UserPlus className="w-3.5 h-3.5 mr-1.5" />
              New Here?
            </TabsTrigger>
            <TabsTrigger
              value="signin"
              className="rounded-lg text-sm font-semibold data-[state=active]:shadow-sm"
              data-ocid="simple_login.signin.tab"
            >
              <Users className="w-3.5 h-3.5 mr-1.5" />
              Welcome Back
            </TabsTrigger>
          </TabsList>

          {/* ── Register Tab ───────────────────────────────────────────── */}
          <TabsContent value="register" className="mt-0 space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">
                Full Name <span style={{ color: "oklch(0.6 0.22 24)" }}>*</span>
              </Label>
              <Input
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Your full name"
                className="h-9 text-sm rounded-lg"
                maxLength={60}
                data-ocid="simple_login.name.input"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">
                  Phone
                </Label>
                <Input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+254 7xx xxx"
                  className="h-9 text-sm rounded-lg"
                  data-ocid="simple_login.phone.input"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">
                  Email
                </Label>
                <Input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="h-9 text-sm rounded-lg"
                  data-ocid="simple_login.email.input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">
                  I am a...
                </Label>
                <Select
                  value={regRole}
                  onValueChange={(v) =>
                    setRegRole(v as "fan" | "player" | "coach")
                  }
                >
                  <SelectTrigger
                    className="h-9 text-sm rounded-lg"
                    data-ocid="simple_login.role.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">
                  Home Area
                </Label>
                <Select value={regArea} onValueChange={setRegArea}>
                  <SelectTrigger
                    className="h-9 text-sm rounded-lg"
                    data-ocid="simple_login.area.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AREAS.map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">
                  Create PIN{" "}
                  <span style={{ color: "oklch(0.6 0.22 24)" }}>*</span>
                </Label>
                <Input
                  type="password"
                  value={regPin}
                  onChange={(e) =>
                    setRegPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  placeholder="4 digits"
                  className="h-9 text-sm rounded-lg tracking-widest"
                  inputMode="numeric"
                  maxLength={4}
                  data-ocid="simple_login.pin.input"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">
                  Confirm PIN{" "}
                  <span style={{ color: "oklch(0.6 0.22 24)" }}>*</span>
                </Label>
                <Input
                  type="password"
                  value={regPinConfirm}
                  onChange={(e) =>
                    setRegPinConfirm(
                      e.target.value.replace(/\D/g, "").slice(0, 4),
                    )
                  }
                  placeholder="4 digits"
                  className="h-9 text-sm rounded-lg tracking-widest"
                  inputMode="numeric"
                  maxLength={4}
                  data-ocid="simple_login.pin_confirm.input"
                />
              </div>
            </div>

            {regError && (
              <div
                className="flex items-center gap-2 text-xs py-2 px-3 rounded-lg"
                style={{
                  background: "oklch(0.22 0.08 24 / 0.3)",
                  color: "oklch(0.7 0.18 24)",
                  border: "1px solid oklch(0.35 0.12 24 / 0.4)",
                }}
                data-ocid="simple_login.register.error_state"
              >
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {regError}
              </div>
            )}

            <Button
              className="w-full h-10 font-bold text-sm rounded-xl mt-1"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.6 0.22 24) 0%, oklch(0.5 0.2 38) 100%)",
                color: "oklch(0.97 0 0)",
              }}
              onClick={handleRegister}
              disabled={regLoading}
              data-ocid="simple_login.register.submit_button"
            >
              {regLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Joining...
                </>
              ) : (
                "Join the Hub 🏝️"
              )}
            </Button>
          </TabsContent>

          {/* ── Sign-In Tab ────────────────────────────────────────────── */}
          <TabsContent value="signin" className="mt-0 space-y-3">
            {existingProfiles.length === 0 ? (
              <div
                className="text-center py-6 text-sm text-muted-foreground rounded-xl border border-border"
                data-ocid="simple_login.signin.empty_state"
              >
                <p>No accounts yet.</p>
                <p className="mt-1 text-xs opacity-70">
                  Switch to "New Here?" to create your profile.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">
                    Select Your Name
                  </Label>
                  <Select
                    value={selectedUserId}
                    onValueChange={setSelectedUserId}
                  >
                    <SelectTrigger
                      className="h-9 text-sm rounded-lg"
                      data-ocid="simple_login.user.select"
                    >
                      <SelectValue placeholder="Choose your profile..." />
                    </SelectTrigger>
                    <SelectContent>
                      {existingProfiles.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          <span className="font-medium">{p.name}</span>
                          <span className="ml-2 text-xs text-muted-foreground capitalize">
                            ({p.role} · {p.area})
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">
                    Enter Your 4-Digit PIN
                  </Label>
                  <Input
                    type="password"
                    value={signInPin}
                    onChange={(e) =>
                      setSignInPin(
                        e.target.value.replace(/\D/g, "").slice(0, 4),
                      )
                    }
                    placeholder="••••"
                    className="h-9 text-sm rounded-lg tracking-widest text-center"
                    inputMode="numeric"
                    maxLength={4}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSignIn();
                    }}
                    data-ocid="simple_login.signin_pin.input"
                  />
                </div>

                {signInError && (
                  <div
                    className="flex items-center gap-2 text-xs py-2 px-3 rounded-lg"
                    style={{
                      background: "oklch(0.22 0.08 24 / 0.3)",
                      color: "oklch(0.7 0.18 24)",
                      border: "1px solid oklch(0.35 0.12 24 / 0.4)",
                    }}
                    data-ocid="simple_login.signin.error_state"
                  >
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {signInError}
                  </div>
                )}

                <Button
                  className="w-full h-10 font-bold text-sm rounded-xl"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.55 0.18 252) 0%, oklch(0.45 0.15 252) 100%)",
                    color: "oklch(0.97 0 0)",
                  }}
                  onClick={handleSignIn}
                  disabled={signInLoading}
                  data-ocid="simple_login.signin.submit_button"
                >
                  {signInLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    "Sign In ✓"
                  )}
                </Button>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
