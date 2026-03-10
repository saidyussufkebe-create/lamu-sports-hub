import type { T__1 as BackendTeam } from "@/backend";
import { TeamBadge, getTeamColor } from "@/components/shared/TeamBadge";
import { AreaBadge } from "@/components/shared/TeamBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useActor } from "@/hooks/useActor";
import { CheckCircle2, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

interface OnboardingPageProps {
  onComplete: (
    teamId: string,
    name?: string,
    email?: string,
    role?: string,
    area?: string,
  ) => void;
}

const AREAS = ["Shela", "Hindi", "Mkunguni", "Langoni", "Mkomani", "Lamu Town"];

export function OnboardingPage({ onComplete }: OnboardingPageProps) {
  const { actor } = useActor();
  const [step, setStep] = useState<"profile" | "team">("profile");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("fan");
  const [area, setArea] = useState("Lamu Town");
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState<BackendTeam[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(false);

  useEffect(() => {
    if (!actor) return;
    setTeamsLoading(true);
    actor
      .getAllTeams()
      .then((t) => setTeams(t))
      .catch(() => setTeams([]))
      .finally(() => setTeamsLoading(false));
  }, [actor]);

  const handleProfileNext = () => {
    if (!name.trim()) return;
    setStep("team");
  };

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    setLoading(false);
    onComplete(selected ?? "", name, email, role, area);
  };

  return (
    <div
      data-ocid="onboarding.page"
      className="min-h-screen flex flex-col items-center justify-start px-4 pt-12 pb-24"
      style={{
        background:
          "linear-gradient(160deg, oklch(0.1 0.04 255) 0%, oklch(0.14 0.06 252) 50%, oklch(0.12 0.05 248) 100%)",
      }}
    >
      {/* Logo */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-8 text-center"
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 text-3xl"
          style={{ background: "oklch(0.55 0.18 252 / 0.3)" }}
        >
          ⚽
        </div>
        <h1 className="font-display font-black text-2xl text-foreground">
          Welcome to{" "}
          <span style={{ color: "oklch(0.6 0.22 24)" }}>Lamu Sports Hub</span>
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Set up your profile to get started
        </p>
      </motion.div>

      {/* Step indicators */}
      <div className="flex items-center gap-3 mb-8">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black"
          style={{
            background: "oklch(0.55 0.18 252)",
            color: "white",
          }}
        >
          {step === "team" ? <CheckCircle2 className="w-4 h-4" /> : "1"}
        </div>
        <div
          className="h-0.5 w-12"
          style={{
            background:
              step === "team" ? "oklch(0.55 0.18 252)" : "oklch(0.3 0.04 255)",
          }}
        />
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black"
          style={{
            background:
              step === "team" ? "oklch(0.6 0.22 24)" : "oklch(0.2 0.04 255)",
            color: step === "team" ? "white" : "oklch(0.5 0.06 255)",
          }}
        >
          2
        </div>
      </div>

      {step === "profile" && (
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-full max-w-sm space-y-4"
        >
          <h2 className="font-display font-bold text-lg text-foreground text-center">
            Your Profile
          </h2>

          <div className="space-y-1.5">
            <Label htmlFor="ob-name" className="text-sm">
              Full Name *
            </Label>
            <Input
              id="ob-name"
              placeholder="e.g. Hassan Mwende"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-ocid="onboarding.name.input"
              className="h-11"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ob-email" className="text-sm">
              Email{" "}
              <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Input
              id="ob-email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              data-ocid="onboarding.email.input"
              className="h-11"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">I am a...</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger
                className="h-11"
                data-ocid="onboarding.role.select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fan">⚡ Fan</SelectItem>
                <SelectItem value="player">⚽ Player</SelectItem>
                <SelectItem value="coach">🏆 Coach</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Home Area</Label>
            <Select value={area} onValueChange={setArea}>
              <SelectTrigger
                className="h-11"
                data-ocid="onboarding.area.select"
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

          <Button
            size="lg"
            className="w-full font-bold h-12 mt-2"
            disabled={!name.trim()}
            onClick={handleProfileNext}
            data-ocid="onboarding.next_button"
            style={{
              background: name.trim()
                ? "linear-gradient(135deg, oklch(0.55 0.18 252) 0%, oklch(0.45 0.16 252) 100%)"
                : undefined,
            }}
          >
            Continue →
          </Button>
        </motion.div>
      )}

      {step === "team" && (
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-full max-w-2xl"
        >
          <h2 className="font-display font-bold text-lg text-foreground text-center mb-2">
            Pick Your Team
          </h2>
          <p className="text-muted-foreground text-sm text-center mb-5">
            Choose the team you support.{" "}
            <span className="text-muted-foreground/60">
              (You can skip this)
            </span>
          </p>

          {teamsLoading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading teams...</span>
            </div>
          ) : teams.length === 0 ? (
            <div className="rounded-xl border border-border bg-card py-10 text-center mb-6">
              <p className="text-sm text-muted-foreground">
                No teams registered yet. Officials will add teams soon.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {teams.map((team, i) => (
                <motion.button
                  key={team.teamId}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  data-ocid={`onboarding.team.item.${i + 1}`}
                  type="button"
                  onClick={() =>
                    setSelected(selected === team.teamId ? null : team.teamId)
                  }
                  className={`relative rounded-xl p-4 border-2 transition-all text-left flex flex-col items-center gap-3 ${
                    selected === team.teamId
                      ? "border-accent bg-accent/10"
                      : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  {selected === team.teamId && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle2 className="w-4 h-4 text-accent" />
                    </div>
                  )}
                  <TeamBadge
                    team={{
                      teamId: team.teamId,
                      name: team.name,
                      area: team.area,
                      color: getTeamColor(team.teamId),
                    }}
                    size="lg"
                  />
                  <div className="text-center">
                    <p className="font-bold text-xs text-foreground leading-tight">
                      {team.name}
                    </p>
                    <AreaBadge area={team.area} className="mt-1" />
                  </div>
                  <div className="flex gap-1 text-xs text-muted-foreground">
                    <span className="font-bold text-green-400">
                      {Number(team.wins)}W
                    </span>
                    <span>·</span>
                    <span className="font-bold text-yellow-400">
                      {Number(team.draws)}D
                    </span>
                    <span>·</span>
                    <span className="font-bold text-red-400">
                      {Number(team.losses)}L
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setStep("profile")}
              data-ocid="onboarding.back_button"
            >
              ← Back
            </Button>
            <Button
              size="lg"
              className="flex-1 font-bold"
              disabled={loading}
              onClick={handleSubmit}
              data-ocid="onboarding.submit_button"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.6 0.22 24) 0%, oklch(0.55 0.25 20) 100%)",
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : selected ? (
                "Confirm My Team →"
              ) : (
                "Skip & Continue →"
              )}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
