import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  LSH_USER_SETTINGS_KEY,
  type UserSettings,
  getDeletedTeamIds,
  getLocalPlayers,
  getLocalTeams,
  getOfficials,
  getPitches,
  getSeasonSettings,
  getTeamOverrides,
  getUserSettings,
  setLocalStore,
} from "@/utils/localStore";
import { applyTheme } from "@/utils/themeUtils";
import { useNavigate } from "@tanstack/react-router";
import {
  Bell,
  CheckCircle,
  ChevronRight,
  Clock,
  ExternalLink,
  Eye,
  FileText,
  Globe,
  Heart,
  HelpCircle,
  Info,
  Languages,
  Loader2,
  Lock,
  MapPin,
  MessageCircle,
  Mic,
  Monitor,
  Moon,
  Phone,
  Radio,
  Settings,
  Shield,
  Star,
  Sun,
  Trash2,
  Trophy,
  User,
  UserX,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

// ─── Section Header ────────────────────────────────────────────────────────────
function SectionHeader({
  icon: Icon,
  label,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  accent?: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center"
        style={{ background: accent ?? "oklch(0.25 0.06 252 / 0.5)" }}
      >
        <Icon className="w-3.5 h-3.5 text-foreground" />
      </div>
      <h2 className="font-display font-black text-xs text-foreground uppercase tracking-widest">
        {label}
      </h2>
    </div>
  );
}

// ─── Quick Link Row ────────────────────────────────────────────────────────────
function QuickLinkRow({
  icon: Icon,
  label,
  to,
  onNavigate,
}: {
  icon: React.ElementType;
  label: string;
  to: string;
  onNavigate: (path: string) => void;
}) {
  return (
    <button
      type="button"
      className="flex items-center gap-3 w-full py-2.5 px-1 rounded-lg hover:bg-muted/40 transition-colors text-left group"
      onClick={() => onNavigate(to)}
    >
      <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
        <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      <span className="flex-1 text-sm font-medium text-foreground">
        {label}
      </span>
      <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
    </button>
  );
}

// ─── Channel Row ──────────────────────────────────────────────────────────────
function ChannelRow({
  icon: Icon,
  iconColor,
  platform,
  handle,
  url,
}: {
  icon: React.ElementType;
  iconColor: string;
  platform: string;
  handle: string;
  url: string;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 py-2.5 px-1 rounded-lg hover:bg-muted/40 transition-colors group"
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
        style={{ background: `${iconColor}22` }}
      >
        <Icon className="w-4 h-4" style={{ color: iconColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{platform}</p>
        <p className="text-xs text-muted-foreground truncate">{handle}</p>
      </div>
      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors shrink-0" />
    </a>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>(getUserSettings);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const seasonSettings = getSeasonSettings();
  const pitches = getPitches();
  const officials = getOfficials();

  // Real teams from local store (with overrides applied, deleted filtered out)
  const overrides = getTeamOverrides();
  const deletedIds = new Set(getDeletedTeamIds());
  const realTeams = getLocalTeams()
    .filter((t) => !deletedIds.has(t.teamId))
    .map((t) => ({
      teamId: t.teamId,
      name: overrides[t.teamId]?.name ?? t.name,
      area: overrides[t.teamId]?.area ?? t.area,
    }));

  // Real players from local store
  const realPlayers = getLocalPlayers();

  const update = <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K],
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const toggleInterest = (interest: string) => {
    setSettings((prev) => {
      const current = prev.interests;
      const next = current.includes(interest)
        ? current.filter((i) => i !== interest)
        : [...current, interest];
      return { ...prev, interests: next };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    setLocalStore(LSH_USER_SETTINGS_KEY, settings);
    // Apply theme immediately so the user sees the change without reload
    applyTheme(settings.theme);
    setSaving(false);
    toast.success("Settings saved!");
  };

  const handleClearData = () => {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith("lsh_"));
    for (const k of keys) {
      localStorage.removeItem(k);
    }
    toast.success("App data cleared. Reloading…");
    setTimeout(() => window.location.reload(), 800);
  };

  const goTo = (path: string) => {
    navigate({ to: path as "/" });
  };

  const sectionClass = "rounded-2xl border border-border bg-card p-4 space-y-1";

  const INTEREST_OPTIONS = [
    { id: "news", label: "News & Updates", icon: FileText },
    { id: "leaderboard", label: "Leaderboards", icon: Trophy },
    { id: "matchday", label: "Matchday Live", icon: Zap },
    { id: "mvp", label: "MVP Votes", icon: Star },
    { id: "explore", label: "Explore / Tactics", icon: Eye },
  ];

  return (
    <div data-ocid="settings.page" className="min-h-screen pb-28 pt-14">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div
        className="px-4 py-5"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.1 0.04 255) 0%, oklch(0.15 0.07 252) 100%)",
        }}
      >
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h1 className="font-display font-black text-2xl text-foreground flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" />
            My LSH Settings
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Personalise your Lamu Sports Hub experience
          </p>
        </motion.div>
      </div>

      <div className="px-4 mt-5 space-y-4">
        {/* ── Personal Details & Account Security ────────────────────────────── */}
        <motion.section
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.03 }}
          className={sectionClass}
          data-ocid="settings.account_security.section"
        >
          <SectionHeader
            icon={Lock}
            label="Personal Details & Account Security"
            accent="oklch(0.3 0.16 252 / 0.5)"
          />

          {/* Security status */}
          <div className="flex items-center gap-3 rounded-xl bg-muted/20 border border-border/40 px-3 py-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-bold text-foreground">
                  Internet Identity
                </p>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] px-1.5 py-0 h-4 flex items-center gap-1">
                  <CheckCircle className="w-2.5 h-2.5" />
                  Secured
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                Your Internet Identity is secured by your device (fingerprint,
                Face ID, or security key)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <a
              href="https://identity.ic0.app"
              target="_blank"
              rel="noopener noreferrer"
              data-ocid="settings.manage_identity.button"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/20 transition-colors px-3 py-2.5 text-xs font-bold text-primary"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Manage Identity
            </a>
            <button
              type="button"
              data-ocid="settings.account_recovery.button"
              onClick={() => goTo("/recovery")}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-muted/30 hover:bg-muted/60 transition-colors px-3 py-2.5 text-xs font-bold text-foreground"
            >
              <Lock className="w-3.5 h-3.5 text-muted-foreground" />
              Account Recovery
            </button>
          </div>
        </motion.section>

        {/* ── Profile ──────────────────────────────────────────────────────── */}
        <motion.section
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.05 }}
          className={sectionClass}
          data-ocid="settings.profile.section"
        >
          <SectionHeader
            icon={User}
            label="Profile"
            accent="oklch(0.3 0.12 230 / 0.5)"
          />
          <div>
            <Label className="text-xs mb-1.5 block text-muted-foreground">
              Display Name
            </Label>
            <Input
              value={settings.displayName}
              onChange={(e) => update("displayName", e.target.value)}
              className="h-9 text-sm"
              placeholder="Enter your display name…"
              data-ocid="settings.display_name.input"
            />
          </div>
        </motion.section>

        {/* ── Manage Account ────────────────────────────────────────────────── */}
        <motion.section
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.07 }}
          className={sectionClass}
          data-ocid="settings.manage_account.section"
        >
          <SectionHeader
            icon={UserX}
            label="Manage Account"
            accent="oklch(0.35 0.2 24 / 0.4)"
          />
          <p className="text-[11px] text-muted-foreground leading-relaxed pb-1">
            Manage your account data and profile settings.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300 gap-1.5"
                  data-ocid="settings.clear_data.button"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear App Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear all app data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will reset all your local settings, saved preferences,
                    and cached data. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearData}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Clear Data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button
              variant="outline"
              size="sm"
              className="text-xs border-destructive/30 text-destructive hover:bg-destructive/10 gap-1.5"
              data-ocid="settings.delete_account.button"
              onClick={() => goTo("/suggestions")}
            >
              <UserX className="w-3.5 h-3.5" />
              Delete Account
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground/50 pt-1">
            Account deletion requires contacting an official via the Suggestions
            page.
          </p>
        </motion.section>

        {/* ── Favourite Team ────────────────────────────────────────────────── */}
        <motion.section
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className={sectionClass}
          data-ocid="settings.favorite.section"
        >
          <SectionHeader
            icon={Star}
            label="Favourite Team"
            accent="oklch(0.65 0.18 75 / 0.35)"
          />
          <p className="text-[11px] text-muted-foreground pb-1">
            Personalises your home screen with your team's news, previews, and
            highlights.
          </p>
          <div>
            <Label className="text-xs mb-1.5 block text-muted-foreground">
              Select your team
            </Label>
            <Select
              value={settings.favoriteTeamId}
              onValueChange={(v) => update("favoriteTeamId", v)}
            >
              <SelectTrigger
                className="h-9 text-sm"
                data-ocid="settings.favorite_team.select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {realTeams.length === 0 ? (
                  <SelectItem
                    value="__no_teams__"
                    disabled
                    className="text-sm text-muted-foreground"
                  >
                    No teams registered yet
                  </SelectItem>
                ) : (
                  realTeams.map((team) => (
                    <SelectItem
                      key={team.teamId}
                      value={team.teamId}
                      className="text-sm"
                    >
                      {team.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </motion.section>

        {/* ── Favourite Player ──────────────────────────────────────────────── */}
        <motion.section
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className={sectionClass}
          data-ocid="settings.favorite_player.section"
        >
          <SectionHeader
            icon={Users}
            label="Favourite Player"
            accent="oklch(0.45 0.15 252 / 0.4)"
          />
          <div>
            <Label className="text-xs mb-1.5 block text-muted-foreground">
              Select your player
            </Label>
            <Select
              value={settings.favoritePlayerId ?? "__none__"}
              onValueChange={(v) =>
                update("favoritePlayerId", v === "__none__" ? undefined : v)
              }
            >
              <SelectTrigger
                className="h-9 text-sm"
                data-ocid="settings.favorite_player.select"
              >
                <SelectValue placeholder="Choose a player…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  value="__none__"
                  className="text-sm text-muted-foreground"
                >
                  — No favourite player —
                </SelectItem>
                {realPlayers.map((player) => {
                  const team = realTeams.find(
                    (t) => t.teamId === player.teamId,
                  );
                  return (
                    <SelectItem
                      key={player.playerId}
                      value={player.playerId}
                      className="text-sm"
                    >
                      {player.name}
                      {team ? ` (${team.name})` : ""}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </motion.section>

        {/* ── Smart Alerts (Notifications) ──────────────────────────────────── */}
        <motion.section
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`${sectionClass} !space-y-0`}
          data-ocid="settings.notifications.section"
        >
          <SectionHeader
            icon={Bell}
            label="Smart Alerts"
            accent="oklch(0.55 0.2 24 / 0.35)"
          />
          <p className="text-[11px] text-muted-foreground pb-2">
            Configure which alerts you receive for matches and updates.
          </p>
          <div className="space-y-0 divide-y divide-border/40">
            {[
              {
                key: "matchAlerts" as const,
                label: "Match Alerts",
                desc: "Upcoming match reminders and live score notifications",
                ocid: "settings.match_alerts.switch",
                icon: Bell,
              },
              {
                key: "lineupAlerts" as const,
                label: "Lineup Alerts",
                desc: "Get notified when team lineups are confirmed",
                ocid: "settings.lineup_alerts.switch",
                icon: Users,
              },
              {
                key: "goalAlerts" as const,
                label: "Goal Alerts",
                desc: "Instant alerts when a goal is scored",
                ocid: "settings.goal_alerts.switch",
                icon: Zap,
              },
              {
                key: "newsAlerts" as const,
                label: "News Updates",
                desc: "Latest news and announcements from LSH officials",
                ocid: "settings.news_alerts.switch",
                icon: FileText,
              },
              {
                key: "mvpReminders" as const,
                label: "MVP Vote Reminders",
                desc: "Reminders to vote for the weekly Match MVP",
                ocid: "settings.mvp_reminders.switch",
                icon: Trophy,
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-start justify-between gap-3 py-3 first:pt-0"
              >
                <div className="flex items-start gap-2.5 flex-1">
                  <item.icon className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {item.label}
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings[item.key]}
                  onCheckedChange={(v) => update(item.key, v)}
                  data-ocid={item.ocid}
                />
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── Save Button ───────────────────────────────────────────────────── */}
        <Button
          className="w-full text-sm font-bold"
          onClick={handleSave}
          disabled={saving}
          data-ocid="settings.save_button"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.6 0.22 24) 0%, oklch(0.55 0.25 20) 100%)",
          }}
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Saving…
            </>
          ) : (
            "Save Settings"
          )}
        </Button>

        {/* ── Appearance & Interests ────────────────────────────────────────── */}
        <motion.section
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.22 }}
          className={sectionClass}
          data-ocid="settings.appearance.section"
        >
          <SectionHeader
            icon={Monitor}
            label="Appearance & Interests"
            accent="oklch(0.3 0.15 280 / 0.5)"
          />

          {/* Theme */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">
              Theme
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  {
                    value: "dark",
                    label: "Dark",
                    icon: Moon,
                    ocid: "settings.theme_dark.toggle",
                  },
                  {
                    value: "light",
                    label: "Light",
                    icon: Sun,
                    ocid: "settings.theme_light.toggle",
                  },
                  {
                    value: "system",
                    label: "System",
                    icon: Monitor,
                    ocid: "settings.theme_system.toggle",
                  },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  data-ocid={opt.ocid}
                  onClick={() => update("theme", opt.value)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-bold transition-all ${
                    settings.theme === opt.value
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border bg-muted/20 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  <opt.icon className="w-4 h-4" />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <Separator className="my-3" />

          {/* Content Interests */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">
              Content Interests
            </p>
            <div className="space-y-2">
              {INTEREST_OPTIONS.map((opt, idx) => (
                <div
                  key={opt.id}
                  className="flex items-center gap-3 py-1.5 px-1 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <Checkbox
                    id={`interest-${opt.id}`}
                    checked={settings.interests.includes(opt.id)}
                    onCheckedChange={() => toggleInterest(opt.id)}
                    data-ocid={`settings.interests.checkbox.${idx + 1}`}
                  />
                  <Label
                    htmlFor={`interest-${opt.id}`}
                    className="flex items-center gap-2 text-sm font-medium cursor-pointer flex-1"
                  >
                    <opt.icon className="w-3.5 h-3.5 text-muted-foreground" />
                    {opt.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ── Language / Regional Settings ──────────────────────────────────── */}
        <motion.section
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.24 }}
          className={sectionClass}
          data-ocid="settings.language.section"
        >
          <SectionHeader
            icon={Languages}
            label="Language & Regional Settings"
            accent="oklch(0.3 0.12 145 / 0.4)"
          />
          <div>
            <Label className="text-xs mb-1.5 block text-muted-foreground">
              Language
            </Label>
            <Select
              value={settings.language}
              onValueChange={(v) =>
                update("language", v as UserSettings["language"])
              }
            >
              <SelectTrigger
                className="h-9 text-sm"
                data-ocid="settings.language.select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en" className="text-sm">
                  🇬🇧 English
                </SelectItem>
                <SelectItem value="sw" className="text-sm">
                  🇰🇪 Kiswahili
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-start gap-2 mt-2 rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-2.5">
            <Info className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
            <p className="text-[11px] text-amber-300 leading-relaxed">
              Some content (including radio) may be subject to territory
              restrictions and may not be available in all regions.
            </p>
          </div>
        </motion.section>

        {/* ── Divider ───────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 py-1">
          <Separator className="flex-1" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
            App Information
          </span>
          <Separator className="flex-1" />
        </div>

        {/* ── App Info ──────────────────────────────────────────────────────── */}
        <motion.section
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className={sectionClass}
          data-ocid="settings.app_info.section"
        >
          <SectionHeader
            icon={Info}
            label="App Info"
            accent="oklch(0.3 0.1 220 / 0.5)"
          />
          <div className="grid grid-cols-2 gap-2 mt-1">
            {[
              { label: "App", value: "Lamu Sports Hub" },
              { label: "Version", value: "1.0.0 (Phase 1 MVP)" },
              {
                label: "Season",
                value: seasonSettings.seasonName,
              },
              {
                label: "Tournament",
                value: seasonSettings.tournamentName,
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-xl bg-muted/30 border border-border/50 px-3 py-2.5"
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
                  {label}
                </p>
                <p className="text-sm font-semibold text-foreground leading-snug">
                  {value}
                </p>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-primary/70 font-semibold pt-2 pb-1">
            🏝️ Island Pride. Island Football.
          </p>
        </motion.section>

        {/* ── Pitches ───────────────────────────────────────────────────────── */}
        <motion.section
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={sectionClass}
          data-ocid="settings.pitches.section"
        >
          <SectionHeader
            icon={MapPin}
            label="Pitches & Grounds"
            accent="oklch(0.3 0.12 145 / 0.4)"
          />
          <div className="space-y-2 mt-1">
            {pitches.map((pitch, i) => (
              <div
                key={pitch.pitchId}
                className="flex items-start gap-3 rounded-xl bg-muted/20 border border-border/40 px-3 py-2.5"
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-black bg-primary/10 text-primary mt-0.5">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">
                    {pitch.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {pitch.location}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0 h-4"
                    >
                      {pitch.surface}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground/60">
                      Cap: {pitch.capacity.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── LSH Channels ─────────────────────────────────────────────────── */}
        <motion.section
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35 }}
          className={sectionClass}
          data-ocid="settings.channels.section"
        >
          <SectionHeader
            icon={Globe}
            label="LSH Channels"
            accent="oklch(0.35 0.15 160 / 0.4)"
          />
          <div className="divide-y divide-border/30">
            <ChannelRow
              icon={MessageCircle}
              iconColor="oklch(0.65 0.2 145)"
              platform="WhatsApp"
              handle="+254 705 434 375"
              url="https://wa.me/254705434375"
            />
            <ChannelRow
              icon={Globe}
              iconColor="oklch(0.55 0.22 0)"
              platform="Instagram"
              handle="@lamusportshub"
              url="https://instagram.com/lamusportshub"
            />
            <ChannelRow
              icon={Globe}
              iconColor="oklch(0.5 0.2 252)"
              platform="Facebook"
              handle="Lamu Sports Hub"
              url="https://facebook.com/lamusportshub"
            />
            <ChannelRow
              icon={Globe}
              iconColor="oklch(0.7 0.02 220)"
              platform="X (Twitter)"
              handle="@LamuSportsHub"
              url="https://x.com/LamuSportsHub"
            />
          </div>
        </motion.section>

        {/* ── Radio Lamu FM ─────────────────────────────────────────────────── */}
        <motion.section
          id="radio-lamu-fm"
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.37 }}
          className="rounded-2xl border border-border overflow-hidden"
          data-ocid="settings.radio_lamu.section"
        >
          {/* Gradient header */}
          <div
            className="px-4 pt-4 pb-3"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.2 0.12 230) 0%, oklch(0.25 0.14 250) 50%, oklch(0.22 0.16 20) 100%)",
            }}
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <Radio className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-display font-black text-lg text-white">
                    Radio Lamu FM
                  </h3>
                  <Badge className="bg-white/20 text-white border-white/30 text-[10px] px-1.5 py-0 h-4">
                    91.1 MHz
                  </Badge>
                </div>
                <p className="text-xs font-bold text-white/70 tracking-widest uppercase mt-0.5">
                  IDHAA YA JAMII
                </p>
                <p className="text-xs text-white/60 mt-1 leading-relaxed">
                  Inspiring Lamu's youth with 24/7 community stories
                </p>
              </div>
            </div>

            {/* Live pulse indicator */}
            <div className="flex items-center gap-2 mt-3">
              <div className="relative flex items-center justify-center w-5 h-5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
              </div>
              <span className="text-[11px] font-bold text-white/80 uppercase tracking-wider">
                Broadcasting 24 / 7
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="bg-card px-4 py-3 space-y-3">
            <a
              href="https://www.google.com/search?q=Radio+Lamu+FM+live+stream"
              target="_blank"
              rel="noopener noreferrer"
              data-ocid="settings.radio_listen.button"
              className="flex items-center justify-center gap-2 w-full rounded-xl py-2.5 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.45 0.2 230) 0%, oklch(0.55 0.22 250) 100%)",
              }}
            >
              <Mic className="w-4 h-4" />
              Listen Live
            </a>

            <div className="space-y-2">
              <a
                href="mailto:info@lamuyouthalliance.org"
                className="flex items-center gap-3 py-2 rounded-lg hover:bg-muted/40 transition-colors group"
              >
                <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                  info@lamuyouthalliance.org
                </span>
              </a>

              <a
                href="tel:+254726613166"
                className="flex items-center gap-3 py-2 rounded-lg hover:bg-muted/40 transition-colors group"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="text-sm text-foreground group-hover:text-emerald-400 transition-colors">
                  +254 726 613166
                </span>
              </a>

              <div className="flex items-center gap-3 py-2">
                <div className="w-7 h-7 rounded-full bg-amber-500/15 flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <span className="text-sm text-muted-foreground">
                  Lamu, Kenya
                </span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── Officials Contacts ────────────────────────────────────────────── */}
        <motion.section
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className={sectionClass}
          data-ocid="settings.officials.section"
        >
          <SectionHeader
            icon={Shield}
            label="Officials Contacts"
            accent="oklch(0.35 0.16 50 / 0.4)"
          />
          <div className="space-y-2 mt-1">
            {officials
              .slice()
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((official) => (
                <div
                  key={official.officialId}
                  className="flex items-center gap-3 rounded-xl bg-muted/20 border border-border/40 px-3 py-2.5"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                    <span className="text-xs font-black text-primary uppercase">
                      {official.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">
                      {official.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {official.title}
                    </p>
                  </div>
                  <a
                    href={`tel:${official.contact.replace(/\s/g, "")}`}
                    className="w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center shrink-0 transition-colors"
                    title={`Call ${official.name}`}
                    aria-label={`Call ${official.name}`}
                  >
                    <Phone className="w-3.5 h-3.5 text-primary" />
                  </a>
                </div>
              ))}
          </div>
          <p className="text-[10px] text-muted-foreground/60 text-center pt-1">
            Tap the phone icon to call an official directly
          </p>
        </motion.section>

        {/* ── Help & Support ────────────────────────────────────────────────── */}
        <motion.section
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.42 }}
          className={sectionClass}
          data-ocid="settings.help.section"
        >
          <SectionHeader
            icon={HelpCircle}
            label="Help & Support"
            accent="oklch(0.3 0.14 180 / 0.4)"
          />
          <Accordion type="single" collapsible className="w-full">
            {[
              {
                q: "How do I register a player?",
                a: "Go to More > Add Player or Admin Panel > Players tab. Fill in the player details and tap Submit.",
              },
              {
                q: "How do I post news?",
                a: "Go to Admin Panel > News tab. Write your story, upload a photo, toggle Publish immediately ON, then tap Add News.",
              },
              {
                q: "How do I vote for MVP?",
                a: "After a match, go to More > MVP Vote or the match card. Select the player who performed best and confirm your vote.",
              },
              {
                q: "How do I report a problem?",
                a: "Go to More > Suggestions or tap Submit Feedback in Quick Links. Describe the issue and officials will respond.",
              },
              {
                q: "What is Internet Identity?",
                a: "It is a secure, passwordless login using your device (fingerprint, Face ID, or security key). No password needed — your device IS your key.",
              },
              {
                q: "Is my data safe?",
                a: "Yes. All data is stored on the Internet Computer blockchain, which cannot be modified without admin access.",
              },
            ].map((item, idx) => (
              <AccordionItem
                key={item.q}
                value={`faq-${idx}`}
                data-ocid={`settings.help.panel.${idx + 1}`}
              >
                <AccordionTrigger className="text-sm font-semibold text-foreground text-left hover:no-underline py-3">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-[13px] text-muted-foreground leading-relaxed pb-3">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.section>

        {/* ── Quick Links ───────────────────────────────────────────────────── */}
        <motion.section
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.45 }}
          className={sectionClass}
          data-ocid="settings.quick_links.section"
        >
          <SectionHeader
            icon={ChevronRight}
            label="Quick Links"
            accent="oklch(0.3 0.08 270 / 0.4)"
          />
          <div className="divide-y divide-border/30">
            <QuickLinkRow
              icon={FileText}
              label="Terms & Conditions"
              to="/about"
              onNavigate={goTo}
            />
            <QuickLinkRow
              icon={Shield}
              label="Privacy Policy"
              to="/about"
              onNavigate={goTo}
            />
            <QuickLinkRow
              icon={Info}
              label="About the App"
              to="/about"
              onNavigate={goTo}
            />
            <QuickLinkRow
              icon={Clock}
              label="LSH History"
              to="/history"
              onNavigate={goTo}
            />
            <QuickLinkRow
              icon={MessageCircle}
              label="Submit Feedback"
              to="/suggestions"
              onNavigate={goTo}
            />
            <QuickLinkRow
              icon={Trophy}
              label="Awards"
              to="/awards"
              onNavigate={goTo}
            />
            <button
              type="button"
              className="flex items-center gap-3 w-full py-2.5 px-1 rounded-lg hover:bg-muted/40 transition-colors text-left group"
              onClick={() => {
                setTimeout(() => {
                  document
                    .getElementById("radio-lamu-fm")
                    ?.scrollIntoView({ behavior: "smooth" });
                }, 100);
              }}
            >
              <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <Radio className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <span className="flex-1 text-sm font-medium text-foreground">
                Radio Lamu FM
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
            </button>
          </div>
        </motion.section>

        {/* ── App Version Footer ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="text-center py-6 space-y-1"
        >
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
              <Heart className="w-2.5 h-2.5 text-primary" />
            </div>
            <p className="text-xs font-black text-foreground/80 tracking-wide">
              Lamu Sports Hub v1.0.0
            </p>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Built with Island Pride by{" "}
            <span className="font-semibold text-foreground/70">
              Said Joseph
            </span>
          </p>
          <p className="text-[10px] text-muted-foreground/50">
            Phase 1 MVP · Internet Computer · {new Date().getFullYear()}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
