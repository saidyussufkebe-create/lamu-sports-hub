import type { Role as BackendRole, T, T__1, T__2 } from "@/backend";
import { Role } from "@/backend";
import {
  AreaBadge,
  IslandPrideBadge,
  TeamBadge,
} from "@/components/shared/TeamBadge";
import { Badge } from "@/components/ui/badge";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  LSH_PROFILE_PHOTO_KEY,
  LSH_USER_SETTINGS_KEY,
  getProfilePhoto,
  getUserSettings,
  setLocalStore,
} from "@/utils/localStore";
import {
  type SimpleUserProfile,
  setActiveSimpleSession,
  updateSimpleProfile,
} from "@/utils/simpleAuth";
import {
  Calendar,
  Camera,
  Edit3,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Save,
  Shield,
  Target,
  User,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface ProfilePageProps {
  role?: string;
  favoriteTeamId?: string;
  userName?: string;
  simpleProfile?: SimpleUserProfile | null;
  onSimpleSignOut?: () => void;
}

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
  { value: "fan", label: "Fan" },
  { value: "player", label: "Player" },
  { value: "coach", label: "Coach" },
];

function roleToBackend(r: string): BackendRole {
  const map: Record<string, BackendRole> = {
    fan: Role.fan,
    player: Role.player,
    coach: Role.coach,
    admin: Role.admin,
  };
  return map[r] ?? Role.fan;
}

function roleFromBackend(r: BackendRole): string {
  const s = String(r);
  if (s === "admin" || s.includes("admin")) return "admin";
  if (s === "coach" || s.includes("coach")) return "coach";
  if (s === "player" || s.includes("player")) return "player";
  return "fan";
}

export function ProfilePage({
  role: propRole = "fan",
  favoriteTeamId,
  userName,
  simpleProfile,
  onSimpleSignOut,
}: ProfilePageProps) {
  const { identity, clear } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();

  const [editing, setEditing] = useState(false);
  const [profileLoading, setProfileLoading] = useState(!simpleProfile);

  // Simple user editable fields (localStorage only)
  const [simpleName, setSimpleName] = useState(simpleProfile?.name ?? "");
  const [simplePhone, setSimplePhone] = useState(simpleProfile?.phone ?? "");
  const [simpleEmail, setSimpleEmail] = useState(simpleProfile?.email ?? "");
  const [simpleArea, setSimpleArea] = useState(
    simpleProfile?.area ?? "Lamu Town",
  );
  const [simpleRole, setSimpleRole] = useState<"fan" | "player" | "coach">(
    simpleProfile?.role ?? "fan",
  );

  // Fields from backend (II users)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState("Lamu Town");
  const [userRole, setUserRole] = useState(propRole);
  const [favTeam, setFavTeam] = useState(favoriteTeamId || "");

  const [profilePhoto, setProfilePhoto] = useState<string | null>(
    getProfilePhoto,
  );
  const [photoLightbox, setPhotoLightbox] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Real backend data
  const [teams, setTeams] = useState<T__1[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [myPlayer, setMyPlayer] = useState<T__2 | null>(null);
  const [playerTeam, setPlayerTeam] = useState<T__1 | null>(null);

  // Load user profile + teams + players from backend
  // biome-ignore lint/correctness/useExhaustiveDependencies: favoriteTeamId and userName are stable props used as fallback only
  useEffect(() => {
    // Safety timeout: if actor never becomes ready after 8s, show empty state
    const timeoutId = setTimeout(() => {
      const local = getUserSettings();
      setName((prev) => prev || local.displayName || userName || "");
      setFavTeam(
        (prev) => prev || favoriteTeamId || local.favoriteTeamId || "",
      );
      setProfileLoading(false);
      setTeamsLoading(false);
    }, 8000);

    if (!actor || actorFetching) return () => clearTimeout(timeoutId);
    clearTimeout(timeoutId);

    let cancelled = false;

    async function loadData() {
      try {
        const [backendProfile, allTeams, allPlayers] = await Promise.all([
          actor!.getCallerUserProfile().catch(() => null),
          actor!.getAllTeams().catch(() => [] as T__1[]),
          actor!.getAllPlayers().catch(() => [] as T__2[]),
        ]);
        if (cancelled) return;

        // Populate profile fields from backend
        if (backendProfile) {
          const profile = backendProfile as T;
          setName(profile.name || "");
          setEmail(profile.email || "");
          setPhone(profile.phone || "");
          setArea(profile.area || "Lamu Town");
          setUserRole(roleFromBackend(profile.role));
          const teamId = profile.favoriteTeamId ?? "";
          setFavTeam(teamId);
          // Also persist to local settings so other pages pick it up
          setLocalStore(LSH_USER_SETTINGS_KEY, {
            ...getUserSettings(),
            displayName: profile.name || "",
            favoriteTeamId: teamId,
          });
        } else {
          // Fall back to local settings if backend returns nothing
          const local = getUserSettings();
          setName(local.displayName || userName || "");
          setFavTeam(favoriteTeamId || local.favoriteTeamId || "");
        }

        setTeams(allTeams);

        // Find this user's player record
        const principal = identity?.getPrincipal().toString();
        if (principal) {
          const found = allPlayers.find((p) => p.userId === principal) ?? null;
          setMyPlayer(found);
          if (found) {
            const team =
              allTeams.find((t) => t.teamId === found.teamId) ?? null;
            setPlayerTeam(team);
          }
        }
      } catch {
        // silently fail — empty state shows
        const local = getUserSettings();
        setName((prev) => prev || local.displayName || userName || "");
        setFavTeam(
          (prev) => prev || favoriteTeamId || local.favoriteTeamId || "",
        );
      } finally {
        if (!cancelled) {
          setTeamsLoading(false);
          setProfileLoading(false);
        }
      }
    }

    loadData();
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [actor, actorFetching, identity]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setProfilePhoto(dataUrl);
      setLocalStore(LSH_PROFILE_PHOTO_KEY, dataUrl);
      toast.success("Profile photo updated!");
    };
    reader.readAsDataURL(file);
  };

  // ── Photo lightbox ────────────────────────────────────────────────────────
  const PhotoLightbox =
    photoLightbox && profilePhoto ? (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
        style={{ cursor: "zoom-out" }}
        aria-label="Profile photo fullscreen"
        aria-modal="true"
        role="presentation"
        onClick={() => setPhotoLightbox(false)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setPhotoLightbox(false);
        }}
      >
        <img
          src={profilePhoto}
          alt="Profile full size"
          className="max-w-[92vw] max-h-[92vh] rounded-2xl object-contain shadow-2xl"
          style={{
            border: "2px solid oklch(0.6 0.22 24 / 0.4)",
            cursor: "default",
          }}
        />
        <button
          type="button"
          className="absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white"
          onClick={() => setPhotoLightbox(false)}
          aria-label="Close fullscreen photo"
        >
          ✕
        </button>
      </div>
    ) : null;

  // ── Simple profile save handler ───────────────────────────────────────────
  const handleSimpleSave = () => {
    if (!simpleProfile) return;
    const updated = updateSimpleProfile(simpleProfile.id, {
      name: simpleName.trim() || simpleProfile.name,
      phone: simplePhone.trim(),
      email: simpleEmail.trim(),
      area: simpleArea,
      role: simpleRole,
    });
    if (updated) {
      setActiveSimpleSession(updated);
      toast.success("Profile updated successfully");
      setEditing(false);
    }
  };

  // Favorite team from real backend teams
  const favoriteTeam = teams.find((t) => t.teamId === favTeam) ?? null;

  // ── Simple user profile view ──────────────────────────────────────────────
  if (simpleProfile) {
    const displaySimpleName = simpleName || simpleProfile.name || "Member";
    return (
      <div data-ocid="profile.page" className="min-h-screen pb-24 pt-14">
        {PhotoLightbox}
        {/* Header */}
        <div
          className="px-4 pt-6 pb-8 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.1 0.04 255) 0%, oklch(0.14 0.06 252) 100%)",
          }}
        >
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-start gap-4"
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
              {profilePhoto ? (
                <button
                  type="button"
                  onClick={() => setPhotoLightbox(true)}
                  title="View full photo"
                  className="focus:outline-none"
                  style={{ cursor: "zoom-in" }}
                >
                  <img
                    src={profilePhoto}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover"
                    style={{ border: "3px solid oklch(0.6 0.22 24 / 0.5)" }}
                  />
                </button>
              ) : (
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black font-stats"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.6 0.22 24), oklch(0.5 0.2 38))",
                    border: "3px solid oklch(0.6 0.22 24 / 0.4)",
                  }}
                >
                  {displaySimpleName.charAt(0).toUpperCase()}
                </div>
              )}
              <button
                type="button"
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                style={{
                  background: "oklch(0.55 0.18 252)",
                  border: "2px solid oklch(0.12 0.04 252)",
                }}
                onClick={() => photoInputRef.current?.click()}
                data-ocid="profile.upload_button"
              >
                <Camera className="w-3 h-3 text-white" />
              </button>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display font-black text-xl text-foreground">
                  {displaySimpleName}
                </h1>
                <IslandPrideBadge />
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge
                  variant="outline"
                  className="text-xs capitalize"
                  style={{
                    borderColor: "oklch(0.6 0.22 24)",
                    color: "oklch(0.6 0.22 24)",
                  }}
                >
                  {simpleRole}
                </Badge>
                {simpleArea && <AreaBadge area={simpleArea} />}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Local account · No passkey required
              </p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => setEditing(!editing)}
              data-ocid="profile.edit_button"
            >
              <Edit3 className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>

        <div className="px-4 mt-4 space-y-4">
          {/* Personal Details */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.05 }}
            data-ocid="profile.details.card"
          >
            <h2 className="font-display font-bold text-sm text-foreground uppercase tracking-wide mb-3">
              Personal Details
            </h2>
            <div className="rounded-xl border border-border bg-card divide-y divide-border/60">
              {[
                {
                  icon: (
                    <User
                      className="w-4 h-4"
                      style={{ color: "oklch(0.6 0.18 252)" }}
                    />
                  ),
                  label: "Full Name",
                  value: simpleName || "Not set",
                  empty: !simpleName,
                },
                {
                  icon: (
                    <Mail
                      className="w-4 h-4"
                      style={{ color: "oklch(0.6 0.22 24)" }}
                    />
                  ),
                  label: "Email",
                  value: simpleEmail || "Not set",
                  empty: !simpleEmail,
                },
                {
                  icon: (
                    <Phone
                      className="w-4 h-4"
                      style={{ color: "oklch(0.65 0.18 155)" }}
                    />
                  ),
                  label: "Phone",
                  value: simplePhone || "Not set",
                  empty: !simplePhone,
                },
                {
                  icon: (
                    <MapPin
                      className="w-4 h-4"
                      style={{ color: "oklch(0.75 0.15 82)" }}
                    />
                  ),
                  label: "Home Area",
                  value: simpleArea || "Not set",
                  empty: !simpleArea,
                },
                {
                  icon: (
                    <Shield
                      className="w-4 h-4"
                      style={{ color: "oklch(0.6 0.22 24)" }}
                    />
                  ),
                  label: "Role",
                  value:
                    simpleRole.charAt(0).toUpperCase() + simpleRole.slice(1),
                  empty: false,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "oklch(0.16 0.04 255)" }}
                  >
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                      {item.label}
                    </div>
                    <div
                      className={`text-sm font-semibold mt-0.5 ${item.empty ? "text-muted-foreground/50 italic" : "text-foreground"}`}
                    >
                      {item.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 text-center">
              Tap the edit icon above to update your details
            </p>
          </motion.div>

          {/* Edit form for simple users */}
          {editing && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <h2 className="font-display font-bold text-sm text-foreground uppercase tracking-wide mb-3">
                Edit Profile
              </h2>
              <div className="rounded-xl p-4 border border-border bg-card space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">
                    Full Name
                  </Label>
                  <Input
                    value={simpleName}
                    onChange={(e) => setSimpleName(e.target.value)}
                    placeholder="Your full name"
                    className="h-9 text-sm"
                    data-ocid="profile.input"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">
                    Email
                  </Label>
                  <Input
                    type="email"
                    value={simpleEmail}
                    onChange={(e) => setSimpleEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="h-9 text-sm"
                    data-ocid="profile.email.input"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">
                    Phone
                  </Label>
                  <Input
                    type="tel"
                    value={simplePhone}
                    onChange={(e) => setSimplePhone(e.target.value)}
                    placeholder="+254 7xx xxx xxx"
                    className="h-9 text-sm"
                    data-ocid="profile.phone.input"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">
                    Home Area
                  </Label>
                  <Select
                    value={simpleArea || "Lamu Town"}
                    onValueChange={setSimpleArea}
                  >
                    <SelectTrigger
                      className="h-9 text-sm"
                      data-ocid="profile.area.select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AREAS.map((a) => (
                        <SelectItem key={a} value={a} className="text-sm">
                          {a}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">
                    I am a...
                  </Label>
                  <Select
                    value={simpleRole}
                    onValueChange={(v) =>
                      setSimpleRole(v as "fan" | "player" | "coach")
                    }
                  >
                    <SelectTrigger
                      className="h-9 text-sm"
                      data-ocid="profile.role.select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map((r) => (
                        <SelectItem
                          key={r.value}
                          value={r.value}
                          className="text-sm"
                        >
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={handleSimpleSave}
                  data-ocid="profile.save_button"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.6 0.22 24) 0%, oklch(0.55 0.25 20) 100%)",
                  }}
                >
                  <Save className="w-3 h-3 mr-2" />
                  Save Changes
                </Button>
              </div>
            </motion.div>
          )}

          {/* Sign out */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              variant="outline"
              className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
              onClick={onSimpleSignOut}
              data-ocid="profile.delete_button"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      if (actor) {
        await actor.createOrUpdateUserProfile(
          name.trim(),
          phone.trim(),
          email.trim(),
          roleToBackend(userRole),
          area,
          favTeam || null,
        );
      }
    } catch {
      // Save backend failure silently — local will still update
    }
    setLocalStore(LSH_USER_SETTINGS_KEY, {
      ...getUserSettings(),
      displayName: name,
      favoriteTeamId: favTeam,
    });
    setEditing(false);
    toast.success("Profile updated successfully");
  };

  // Build a MockTeam-compatible object for TeamBadge from backend T__1
  function toTeamBadgeShape(t: T__1) {
    return {
      teamId: t.teamId,
      name: t.name,
      area: t.area,
      coachName: t.coachId,
      color: "oklch(0.55 0.18 252)",
      secondaryColor: "oklch(0.82 0.08 82)",
      wins: Number(t.wins),
      losses: Number(t.losses),
      draws: Number(t.draws),
      goalsFor: Number(t.goalsFor),
      goalsAgainst: Number(t.goalsAgainst),
      isApproved: t.isApproved,
    };
  }

  const displayName =
    name ||
    (identity
      ? `${identity.getPrincipal().toString().slice(0, 8)}...`
      : "Unknown User");

  return (
    <div data-ocid="profile.page" className="min-h-screen pb-24 pt-14">
      {PhotoLightbox}
      {/* Header */}
      <div
        className="px-4 pt-6 pb-8 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.1 0.04 255) 0%, oklch(0.14 0.06 252) 100%)",
        }}
      >
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-start gap-4"
        >
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
            {profilePhoto ? (
              <button
                type="button"
                onClick={() => setPhotoLightbox(true)}
                title="View full photo"
                className="focus:outline-none"
                style={{ cursor: "zoom-in" }}
              >
                <img
                  src={profilePhoto}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover"
                  style={{ border: "3px solid oklch(0.55 0.18 252 / 0.4)" }}
                />
              </button>
            ) : (
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black font-stats"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.55 0.18 252), oklch(0.45 0.15 252))",
                  border: "3px solid oklch(0.55 0.18 252 / 0.4)",
                }}
              >
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            {/* Camera overlay button */}
            <button
              type="button"
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
              style={{
                background: "oklch(0.6 0.22 24)",
                border: "2px solid oklch(0.12 0.04 252)",
              }}
              onClick={() => photoInputRef.current?.click()}
              title="Upload profile photo"
              data-ocid="profile.upload_button"
            >
              <Camera className="w-3 h-3 text-white" />
            </button>
          </div>

          <div className="flex-1 min-w-0">
            {profileLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-display font-black text-xl text-foreground">
                    {displayName}
                  </h1>
                  <IslandPrideBadge />
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge
                    variant="outline"
                    className="text-xs capitalize"
                    style={{
                      borderColor: "oklch(0.6 0.22 24)",
                      color: "oklch(0.6 0.22 24)",
                    }}
                  >
                    {userRole}
                  </Badge>
                  {area && <AreaBadge area={area} />}
                </div>
              </>
            )}
            {identity && (
              <p className="text-[10px] text-muted-foreground mt-1 font-mono truncate max-w-[200px]">
                {identity.getPrincipal().toString().slice(0, 16)}...
              </p>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => setEditing(!editing)}
            data-ocid="profile.edit_button"
          >
            <Edit3 className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {/* Personal Details Card */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.05 }}
          data-ocid="profile.details.card"
        >
          <h2 className="font-display font-bold text-sm text-foreground uppercase tracking-wide mb-3">
            Personal Details
          </h2>
          {profileLoading ? (
            <div
              className="rounded-xl border border-border bg-card p-4 space-y-3"
              data-ocid="profile.loading_state"
            >
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-7 h-7 rounded-lg flex-shrink-0" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card divide-y divide-border/60">
              {[
                {
                  icon: (
                    <User
                      className="w-4 h-4"
                      style={{ color: "oklch(0.6 0.18 252)" }}
                    />
                  ),
                  label: "Full Name",
                  value: name || "Not set",
                  empty: !name,
                },
                {
                  icon: (
                    <Mail
                      className="w-4 h-4"
                      style={{ color: "oklch(0.6 0.22 24)" }}
                    />
                  ),
                  label: "Email",
                  value: email || "Not set",
                  empty: !email,
                },
                {
                  icon: (
                    <Phone
                      className="w-4 h-4"
                      style={{ color: "oklch(0.65 0.18 155)" }}
                    />
                  ),
                  label: "Phone",
                  value: phone || "Not set",
                  empty: !phone,
                },
                {
                  icon: (
                    <MapPin
                      className="w-4 h-4"
                      style={{ color: "oklch(0.75 0.15 82)" }}
                    />
                  ),
                  label: "Home Area",
                  value: area || "Not set",
                  empty: !area,
                },
                {
                  icon: (
                    <Shield
                      className="w-4 h-4"
                      style={{ color: "oklch(0.6 0.22 24)" }}
                    />
                  ),
                  label: "Role",
                  value: userRole
                    ? userRole.charAt(0).toUpperCase() + userRole.slice(1)
                    : "Fan",
                  empty: false,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "oklch(0.16 0.04 255)" }}
                  >
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                      {item.label}
                    </div>
                    <div
                      className={`text-sm font-semibold mt-0.5 ${item.empty ? "text-muted-foreground/50 italic" : "text-foreground"}`}
                    >
                      {item.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!profileLoading && (
            <p className="text-[10px] text-muted-foreground mt-2 text-center">
              Tap the edit icon above to update your details
            </p>
          )}
        </motion.div>

        {/* Player Stats (only if this user is a registered player) */}
        {myPlayer && playerTeam && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            data-ocid="profile.stats.card"
          >
            <h2 className="font-display font-bold text-sm text-foreground uppercase tracking-wide mb-3">
              My Stats
            </h2>
            <div
              className="rounded-xl p-4 border border-border relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.22 0.08 252 / 0.4) 0%, oklch(0.16 0.04 255) 70%)",
              }}
            >
              <div
                className="absolute top-2 right-2 text-5xl font-black font-stats opacity-10"
                style={{ color: "oklch(0.82 0.08 82)" }}
              >
                {Number(myPlayer.jerseyNumber)}
              </div>
              <div className="flex items-center gap-3 mb-4">
                <TeamBadge team={toTeamBadgeShape(playerTeam)} size="md" />
                <div>
                  <div className="font-bold text-sm text-foreground">
                    {playerTeam.name}
                  </div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {String(myPlayer.position)}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  {
                    label: "Apps",
                    value: Number(myPlayer.matchesPlayed),
                    icon: <Calendar className="w-3 h-3" />,
                  },
                  {
                    label: "Goals",
                    value: Number(myPlayer.goals),
                    icon: <Target className="w-3 h-3" />,
                  },
                  {
                    label: "Assists",
                    value: Number(myPlayer.assists),
                    icon: <Zap className="w-3 h-3" />,
                  },
                  {
                    label: "Cards",
                    value:
                      Number(myPlayer.yellowCards) + Number(myPlayer.redCards),
                    icon: null,
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-lg bg-card/50 p-2 text-center border border-border/60"
                  >
                    <div className="font-black font-stats text-xl text-foreground">
                      {stat.value}
                    </div>
                    <div className="text-[9px] text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Favorite Team */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <h2 className="font-display font-bold text-sm text-foreground uppercase tracking-wide mb-3">
            My Team
          </h2>
          {teamsLoading ? (
            <div
              className="rounded-xl p-4 border border-border bg-card flex items-center gap-3"
              data-ocid="profile.loading_state"
            >
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ) : favoriteTeam ? (
            <div className="rounded-xl p-4 border border-border bg-card flex items-center gap-3">
              <TeamBadge team={toTeamBadgeShape(favoriteTeam)} size="lg" />
              <div>
                <div className="font-bold text-foreground">
                  {favoriteTeam.name}
                </div>
                <AreaBadge area={favoriteTeam.area} />
              </div>
            </div>
          ) : (
            <div
              className="rounded-xl p-4 border border-border bg-card flex items-center gap-3 text-muted-foreground text-sm"
              data-ocid="profile.empty_state"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "oklch(0.18 0.04 252)" }}
              >
                <User
                  className="w-5 h-5"
                  style={{ color: "oklch(0.5 0.08 252)" }}
                />
              </div>
              <span>
                No favourite team set — edit your profile to choose one.
              </span>
            </div>
          )}
        </motion.div>

        {/* Edit Profile Form */}
        {editing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <h2 className="font-display font-bold text-sm text-foreground uppercase tracking-wide mb-3">
              Edit Profile
            </h2>
            <div className="rounded-xl p-4 border border-border bg-card space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">
                  Full Name
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="h-9 text-sm"
                  data-ocid="profile.input"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">
                  Email
                </Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="h-9 text-sm"
                  data-ocid="profile.email.input"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">
                  Phone
                </Label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+254 7xx xxx xxx"
                  className="h-9 text-sm"
                  data-ocid="profile.phone.input"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">
                  Home Area
                </Label>
                <Select value={area || "Lamu Town"} onValueChange={setArea}>
                  <SelectTrigger
                    className="h-9 text-sm"
                    data-ocid="profile.area.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AREAS.map((a) => (
                      <SelectItem key={a} value={a} className="text-sm">
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">
                  I am a...
                </Label>
                <Select value={userRole || "fan"} onValueChange={setUserRole}>
                  <SelectTrigger
                    className="h-9 text-sm"
                    data-ocid="profile.role.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((r) => (
                      <SelectItem
                        key={r.value}
                        value={r.value}
                        className="text-sm"
                      >
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">
                  Favourite Team
                </Label>
                <Select
                  value={favTeam || "none"}
                  onValueChange={(v) => setFavTeam(v === "none" ? "" : v)}
                  disabled={teamsLoading}
                >
                  <SelectTrigger
                    className="h-9 text-sm"
                    data-ocid="profile.team.select"
                  >
                    <SelectValue placeholder="Select a team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value="none"
                      className="text-sm text-muted-foreground"
                    >
                      None
                    </SelectItem>
                    {teams.map((t) => (
                      <SelectItem
                        key={t.teamId}
                        value={t.teamId}
                        className="text-sm"
                      >
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                size="sm"
                className="w-full"
                onClick={handleSave}
                data-ocid="profile.save_button"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.6 0.22 24) 0%, oklch(0.55 0.25 20) 100%)",
                }}
              >
                <Save className="w-3 h-3 mr-2" />
                Save Changes
              </Button>
            </div>
          </motion.div>
        )}

        {/* Logout */}
        {identity && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              variant="outline"
              className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
              onClick={clear}
              data-ocid="profile.delete_button"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
