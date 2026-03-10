import { type T__1 as BackendTeam, Position, Role } from "@/backend";
import { OfficialAccessModal } from "@/components/shared/OfficialAccessModal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@/hooks/useActor";
import {
  addLocalNewsItem,
  addLocalPlayer,
  addLocalTeam,
  isOfficialSessionVerified,
  setNewsPhoto,
} from "@/utils/localStore";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Award,
  BarChart2,
  BookOpen,
  Building2,
  Calendar,
  Clock,
  Compass,
  DollarSign,
  FilePlus,
  Grid3x3,
  Heart,
  Home,
  Info,
  Loader2,
  Lock,
  MessageSquare,
  Newspaper,
  Settings,
  Shield,
  ShieldCheck,
  Trophy,
  User,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  ocid: string;
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  {
    path: "/",
    label: "Home",
    icon: <Home className="w-5 h-5" />,
    ocid: "nav.home.link",
  },
  {
    path: "/teams",
    label: "Teams",
    icon: <Users className="w-5 h-5" />,
    ocid: "nav.teams.link",
  },
  {
    path: "/players",
    label: "Players",
    icon: <UserCheck className="w-5 h-5" />,
    ocid: "nav.players.link",
  },
  {
    path: "/news",
    label: "News",
    icon: <Newspaper className="w-5 h-5" />,
    ocid: "nav.news.link",
  },
];

const EXTRA_NAV: NavItem[] = [
  {
    path: "/profile",
    label: "Profile",
    icon: <User className="w-5 h-5" />,
    ocid: "nav.profile.link",
  },
];

const MORE_ITEMS = [
  {
    path: "/standings",
    label: "Standings",
    icon: <BarChart2 className="w-5 h-5" />,
    ocid: "nav.standings.link",
  },
  {
    path: "/matches",
    label: "Matches",
    icon: <Calendar className="w-5 h-5" />,
    ocid: "nav.matches.link",
  },
  {
    path: "/leaderboard",
    label: "Leaders",
    icon: <Trophy className="w-5 h-5" />,
    ocid: "nav.leaderboard.link",
  },
  {
    path: "/referees",
    label: "Referees",
    icon: <Shield className="w-5 h-5" />,
    ocid: "nav.referees.link",
  },
  {
    path: "/awards",
    label: "Awards",
    icon: <Award className="w-5 h-5" />,
    ocid: "nav.awards.link",
  },
  {
    path: "/explore",
    label: "Explore",
    icon: <Compass className="w-5 h-5" />,
    ocid: "nav.explore.link",
  },
  {
    path: "/about",
    label: "About",
    icon: <Info className="w-5 h-5" />,
    ocid: "nav.about.link",
  },
  {
    path: "/history",
    label: "History",
    icon: <Clock className="w-5 h-5" />,
    ocid: "nav.history.link",
  },
  {
    path: "/suggestions",
    label: "Suggestions",
    icon: <MessageSquare className="w-5 h-5" />,
    ocid: "nav.suggestions.link",
  },
  {
    path: "/settings",
    label: "Settings",
    icon: <Settings className="w-5 h-5" />,
    ocid: "nav.settings.link",
  },
  {
    path: "/officials",
    label: "Officials",
    icon: <Users className="w-5 h-5" />,
    ocid: "nav.officials.link",
  },
  {
    path: "/monetize",
    label: "Support",
    icon: <Heart className="w-5 h-5" />,
    ocid: "nav.monetize.link",
  },
];

const ROLE_NAV_ITEMS: (NavItem & { roles: string[] })[] = [
  {
    path: "/coach",
    label: "Coach",
    icon: <Users className="w-5 h-5" />,
    ocid: "nav.coach.link",
    roles: ["coach", "admin"],
  },
  {
    path: "/admin",
    label: "Admin Panel",
    icon: <Shield className="w-5 h-5" />,
    ocid: "nav.admin.link",
    roles: ["admin"],
  },
];

const AREAS = [
  "Shela",
  "Hindi",
  "Mkunguni",
  "Langoni",
  "Mkomani",
  "Lamu Town",
] as const;

// ─── Add Player Dialog ────────────────────────────────────────────────────────

interface AddPlayerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const positionMap: Record<string, Position> = {
  goalkeeper: Position.goalkeeper,
  defender: Position.defender,
  midfielder: Position.midfielder,
  forward: Position.forward,
};

function AddPlayerDialog({ open, onOpenChange }: AddPlayerDialogProps) {
  const { actor } = useActor();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [teamId, setTeamId] = useState("");
  const [position, setPosition] = useState("");
  const [jerseyNumber, setJerseyNumber] = useState("");
  const [bio, setBio] = useState("");
  const [teams, setTeams] = useState<BackendTeam[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(false);

  // Load real teams from backend whenever dialog opens
  useEffect(() => {
    if (!open || !actor) return;
    setTeamsLoading(true);
    actor
      .getAllTeams()
      .then((t) => setTeams(t))
      .catch(() => setTeams([]))
      .finally(() => setTeamsLoading(false));
  }, [open, actor]);

  function resetForm() {
    setName("");
    setNickname("");
    setTeamId("");
    setPosition("");
    setJerseyNumber("");
    setBio("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !teamId || !position) {
      toast.error("Please fill in all required fields.");
      return;
    }
    const positionEnum = positionMap[position];
    if (!positionEnum) {
      toast.error("Invalid position selected.");
      return;
    }
    setLoading(true);
    try {
      let backendOk = false;
      try {
        await actor?.adminAddPlayer(
          teamId,
          nickname.trim(),
          name.trim(),
          positionEnum,
          BigInt(jerseyNumber || 0),
        );
        backendOk = true;
      } catch {
        backendOk = false;
      }
      if (!backendOk) {
        const localId = `LOCAL-PLAYER-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        addLocalPlayer({
          playerId: localId,
          name: name.trim(),
          nickname: nickname.trim(),
          teamId,
          position,
          jerseyNumber: Number(jerseyNumber) || 0,
          isConfirmed: false,
          createdAt: Date.now(),
        });
      }
      toast.success("Player registered!");
      resetForm();
      onOpenChange(false);
    } catch {
      toast.error("Failed to register player. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!loading) {
          if (!v) resetForm();
          onOpenChange(v);
        }
      }}
      data-ocid="more.add_player.dialog"
    >
      <DialogContent
        className="max-w-sm mx-auto rounded-2xl"
        data-ocid="more.add_player.dialog"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-lg">
            <span className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-accent" />
            </span>
            Register Player
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-1">
          {/* Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="player-name">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="player-name"
              placeholder="e.g. Hassan Mwende"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-ocid="more.add_player.input"
              required
            />
          </div>

          {/* Nickname */}
          <div className="space-y-1.5">
            <Label htmlFor="player-nickname">Nickname (optional)</Label>
            <Input
              id="player-nickname"
              placeholder="e.g. Rocket"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>

          {/* Team */}
          <div className="space-y-1.5">
            <Label htmlFor="player-team">
              Team <span className="text-destructive">*</span>
            </Label>
            {teamsLoading ? (
              <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-input text-sm text-muted-foreground">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Loading teams…
              </div>
            ) : teams.length === 0 ? (
              <div className="flex items-center h-10 px-3 rounded-md border border-destructive/40 bg-destructive/5 text-xs text-destructive">
                No teams found. Add a team in Admin Panel first.
              </div>
            ) : (
              <Select value={teamId} onValueChange={setTeamId}>
                <SelectTrigger
                  id="player-team"
                  data-ocid="more.add_player.select"
                >
                  <SelectValue placeholder="Select team…" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((t) => (
                    <SelectItem key={t.teamId} value={t.teamId}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Position */}
          <div className="space-y-1.5">
            <Label htmlFor="player-position">
              Position <span className="text-destructive">*</span>
            </Label>
            <Select value={position} onValueChange={setPosition}>
              <SelectTrigger
                id="player-position"
                data-ocid="more.add_player.select"
              >
                <SelectValue placeholder="Select position…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="goalkeeper">Goalkeeper</SelectItem>
                <SelectItem value="defender">Defender</SelectItem>
                <SelectItem value="midfielder">Midfielder</SelectItem>
                <SelectItem value="forward">Forward</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Jersey Number */}
          <div className="space-y-1.5">
            <Label htmlFor="player-jersey">Jersey Number</Label>
            <Input
              id="player-jersey"
              type="number"
              min={1}
              max={99}
              placeholder="e.g. 10"
              value={jerseyNumber}
              onChange={(e) => setJerseyNumber(e.target.value)}
            />
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <Label htmlFor="player-bio">Description / Bio</Label>
            <Textarea
              id="player-bio"
              placeholder="e.g. Fast winger with excellent dribbling skills…"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              data-ocid="more.add_player.textarea"
            />
          </div>

          <DialogFooter className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              disabled={loading}
              data-ocid="more.add_player.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={loading}
              data-ocid="more.add_player.submit_button"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering…
                </>
              ) : (
                "Register Player"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Add Coach Dialog ─────────────────────────────────────────────────────────

interface AddCoachDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function AddCoachDialog({ open, onOpenChange }: AddCoachDialogProps) {
  const { actor } = useActor();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");

  function resetForm() {
    setName("");
    setArea("");
    setPhone("");
    setEmail("");
    setDescription("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !area) {
      toast.error("Name and area are required.");
      return;
    }
    setLoading(true);
    try {
      await actor?.adminCreateUser(
        name.trim(),
        phone.trim(),
        email.trim(),
        Role.coach,
        area,
      );
      toast.success("Coach added!");
      resetForm();
      onOpenChange(false);
    } catch {
      toast.error("Failed to add coach. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!loading) {
          if (!v) resetForm();
          onOpenChange(v);
        }
      }}
    >
      <DialogContent
        className="max-w-sm mx-auto rounded-2xl"
        data-ocid="more.add_coach.dialog"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-lg">
            <span className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center">
              <Users className="w-4 h-4 text-accent" />
            </span>
            Add Coach
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-1">
          {/* Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="coach-name">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="coach-name"
              placeholder="e.g. Ali Hassan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-ocid="more.add_coach.input"
              required
            />
          </div>

          {/* Area */}
          <div className="space-y-1.5">
            <Label htmlFor="coach-area">
              Area <span className="text-destructive">*</span>
            </Label>
            <Select value={area} onValueChange={setArea}>
              <SelectTrigger id="coach-area" data-ocid="more.add_coach.select">
                <SelectValue placeholder="Select area…" />
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

          {/* Phone */}
          <div className="space-y-1.5">
            <Label htmlFor="coach-phone">Phone (optional)</Label>
            <Input
              id="coach-phone"
              type="tel"
              placeholder="e.g. +254 712 345 678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="coach-email">Email (optional)</Label>
            <Input
              id="coach-email"
              type="email"
              placeholder="e.g. ali@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="coach-desc">Coaching Description</Label>
            <Textarea
              id="coach-desc"
              placeholder="e.g. 10 years experience in youth football, specializes in 4-3-3…"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              data-ocid="more.add_coach.textarea"
            />
          </div>

          <DialogFooter className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              disabled={loading}
              data-ocid="more.add_coach.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={loading}
              data-ocid="more.add_coach.submit_button"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding…
                </>
              ) : (
                "Add Coach"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Add Team Dialog ──────────────────────────────────────────────────────────

interface AddTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function AddTeamDialog({ open, onOpenChange }: AddTeamDialogProps) {
  const { actor } = useActor();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [coachName, setCoachName] = useState("");

  function resetForm() {
    setName("");
    setArea("");
    setCoachName("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !area) {
      toast.error("Team name and area are required.");
      return;
    }
    setLoading(true);
    try {
      let backendOk = false;
      try {
        await actor?.adminCreateTeam(name.trim(), area, coachName.trim());
        backendOk = true;
      } catch {
        backendOk = false;
      }
      if (!backendOk) {
        const localId = `LOCAL-TEAM-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        addLocalTeam({
          teamId: localId,
          name: name.trim(),
          area,
          coachName: coachName.trim(),
          createdAt: Date.now(),
        });
      }
      toast.success(`Team "${name}" created!`);
      resetForm();
      onOpenChange(false);
    } catch {
      toast.error("Failed to create team. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!loading) {
          if (!v) resetForm();
          onOpenChange(v);
        }
      }}
    >
      <DialogContent
        className="max-w-sm mx-auto rounded-2xl"
        data-ocid="more.add_team.dialog"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-lg">
            <span className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-accent" />
            </span>
            Add Team
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-1">
          {/* Team Name */}
          <div className="space-y-1.5">
            <Label htmlFor="team-name">
              Team Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="team-name"
              placeholder="e.g. Shela United FC"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-ocid="more.add_team.input"
              required
            />
          </div>

          {/* Area */}
          <div className="space-y-1.5">
            <Label htmlFor="team-area">
              Area <span className="text-destructive">*</span>
            </Label>
            <Select value={area} onValueChange={setArea}>
              <SelectTrigger id="team-area" data-ocid="more.add_team.select">
                <SelectValue placeholder="Select area…" />
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

          {/* Coach Name */}
          <div className="space-y-1.5">
            <Label htmlFor="team-coach">Coach Name (optional)</Label>
            <Input
              id="team-coach"
              placeholder="e.g. Omar Kiprotich"
              value={coachName}
              onChange={(e) => setCoachName(e.target.value)}
            />
          </div>

          <DialogFooter className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              disabled={loading}
              data-ocid="more.add_team.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={loading}
              data-ocid="more.add_team.submit_button"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating…
                </>
              ) : (
                "Create Team"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Add News Dialog ──────────────────────────────────────────────────────────

interface AddNewsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function AddNewsDialog({ open, onOpenChange }: AddNewsDialogProps) {
  const { actor } = useActor();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  function resetForm() {
    setTitle("");
    setBody("");
    setIsPublished(true);
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoPreview(null);
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error("Title and body are required.");
      return;
    }
    setLoading(true);
    try {
      let savedId: string | undefined;
      try {
        savedId = await actor?.createNews(
          title.trim(),
          body.trim(),
          isPublished,
        );
      } catch {
        savedId = undefined;
      }

      if (!savedId) {
        // Local fallback for PIN-session officials without Internet Identity
        const localId = `LOCAL-NEWS-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        // Convert objectURL preview to base64 if present
        let photoBase64: string | undefined;
        if (photoPreview) {
          try {
            const resp = await fetch(photoPreview);
            const blob = await resp.blob();
            photoBase64 = await new Promise<string>((res, rej) => {
              const reader = new FileReader();
              reader.onloadend = () => res(reader.result as string);
              reader.onerror = rej;
              reader.readAsDataURL(blob);
            });
          } catch {
            photoBase64 = undefined;
          }
        }
        addLocalNewsItem({
          newsId: localId,
          title: title.trim(),
          body: body.trim(),
          isPublished,
          authorId: "official",
          timestamp: Date.now(),
          photoBase64,
        });
        if (photoBase64) setNewsPhoto(localId, photoBase64);
      } else if (photoPreview) {
        // Save photo for the real backend newsId
        try {
          const resp = await fetch(photoPreview);
          const blob = await resp.blob();
          const base64 = await new Promise<string>((res, rej) => {
            const reader = new FileReader();
            reader.onloadend = () => res(reader.result as string);
            reader.onerror = rej;
            reader.readAsDataURL(blob);
          });
          setNewsPhoto(savedId, base64);
        } catch {
          // ignore photo save error
        }
      }

      toast.success(isPublished ? "News published!" : "News saved as draft.");
      resetForm();
      onOpenChange(false);
    } catch {
      toast.error("Failed to publish news. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!loading) {
          if (!v) resetForm();
          onOpenChange(v);
        }
      }}
    >
      <DialogContent
        className="max-w-sm mx-auto rounded-2xl"
        data-ocid="more.add_news.dialog"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-lg">
            <span className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center">
              <FilePlus className="w-4 h-4 text-accent" />
            </span>
            Create News
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-1">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="news-title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="news-title"
              placeholder="e.g. Shela United Win Island Derby 3-1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              data-ocid="more.add_news.input"
              required
            />
          </div>

          {/* Body */}
          <div className="space-y-1.5">
            <Label htmlFor="news-body">
              Story <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="news-body"
              placeholder="Write the full story here…"
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              data-ocid="more.add_news.textarea"
              required
            />
          </div>

          {/* Photo Upload */}
          <div className="space-y-1.5">
            <Label>Photo (optional)</Label>
            {photoPreview ? (
              <div className="relative rounded-xl overflow-hidden border border-border">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full h-32 object-cover"
                />
                <button
                  type="button"
                  className="absolute top-2 right-2 bg-card/80 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs font-semibold text-muted-foreground hover:text-destructive transition-colors"
                  onClick={() => {
                    URL.revokeObjectURL(photoPreview);
                    setPhotoPreview(null);
                  }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <label
                htmlFor="news-photo"
                className="flex flex-col items-center justify-center gap-1.5 py-4 rounded-xl border border-dashed border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                data-ocid="more.add_news.upload_button"
              >
                <FilePlus className="w-5 h-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-medium">
                  Tap to add a photo
                </span>
                <input
                  id="news-photo"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </label>
            )}
          </div>

          {/* Publish Toggle */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3">
            <div>
              <p className="text-sm font-semibold">Publish immediately</p>
              <p className="text-xs text-muted-foreground">
                Off = save as draft
              </p>
            </div>
            <Switch
              checked={isPublished}
              onCheckedChange={setIsPublished}
              data-ocid="more.add_news.switch"
            />
          </div>

          <DialogFooter className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              disabled={loading}
              data-ocid="more.add_news.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={loading}
              data-ocid="more.add_news.submit_button"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publishing…
                </>
              ) : isPublished ? (
                "Publish"
              ) : (
                "Save Draft"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── BottomNav ────────────────────────────────────────────────────────────────

interface BottomNavProps {
  role?: string;
  isOfficialSession?: boolean;
  onOfficialSessionVerified?: () => void;
  onLockOfficialSession?: () => void;
}

export function BottomNav({
  role,
  isOfficialSession,
  onOfficialSessionVerified,
  onLockOfficialSession,
}: BottomNavProps) {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const [showMore, setShowMore] = useState(false);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [showAddCoach, setShowAddCoach] = useState(false);
  const [showAddNews, setShowAddNews] = useState(false);
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [showOfficialModal, setShowOfficialModal] = useState(false);
  const [confirmLock, setConfirmLock] = useState(false);

  // Main nav: Home, Teams, Players, News + Profile
  const allItems = [...NAV_ITEMS, ...EXTRA_NAV];

  // Check if current path is one of the "more" items
  const isMoreActive = MORE_ITEMS.some(
    (item) =>
      currentPath === item.path ||
      (item.path !== "/" && currentPath.startsWith(item.path)),
  );

  // Admin if role is admin OR official session is verified
  const isAdmin = role === "admin" || isOfficialSessionVerified();
  const effectiveRole = isAdmin ? "admin" : role;
  const roleNavItems = ROLE_NAV_ITEMS.filter(
    (item) => effectiveRole && item.roles.includes(effectiveRole),
  );

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-card/95 backdrop-blur-sm border-t border-border flex items-stretch">
        {allItems.map((item) => {
          const isActive =
            currentPath === item.path ||
            (item.path !== "/" && currentPath.startsWith(item.path));
          return (
            <button
              type="button"
              key={item.path}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors relative ${
                isActive
                  ? "text-accent"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => navigate({ to: item.path })}
              data-ocid={item.ocid}
            >
              <div
                className={`${isActive ? "scale-110" : ""} transition-transform`}
              >
                {item.icon}
              </div>
              <span
                className={`text-[10px] font-semibold ${isActive ? "font-bold" : ""}`}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="absolute top-0 w-8 h-0.5 bg-accent rounded-b-full" />
              )}
            </button>
          );
        })}

        {/* More button */}
        <button
          type="button"
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors relative ${
            isMoreActive || showMore
              ? "text-accent"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setShowMore(true)}
          data-ocid="nav.more.button"
        >
          <Grid3x3 className="w-5 h-5" />
          <span className="text-[10px] font-semibold">More</span>
          {isMoreActive && (
            <span className="absolute top-0 w-8 h-0.5 bg-accent rounded-b-full" />
          )}
        </button>
      </nav>

      {/* More Sheet */}
      <Sheet open={showMore} onOpenChange={setShowMore}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl pb-8"
          data-ocid="nav.more.sheet"
        >
          <SheetHeader className="mb-4">
            <SheetTitle className="font-display text-left flex items-center justify-between">
              <span>More</span>
              {/* Official session indicator in sheet header */}
              {isOfficialSession && (
                <span
                  className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{
                    background: "oklch(0.22 0.08 155 / 0.3)",
                    border: "1px solid oklch(0.4 0.12 155 / 0.5)",
                    color: "oklch(0.65 0.15 155)",
                  }}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Official Mode
                </span>
              )}
            </SheetTitle>
          </SheetHeader>

          {/* Official Access toggle — always visible at top of sheet */}
          {!isOfficialSession ? (
            <button
              type="button"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border mb-4 transition-all hover:border-primary/40"
              style={{
                borderColor: "oklch(0.3 0.06 252)",
                background: "oklch(0.15 0.04 252 / 0.4)",
              }}
              onClick={() => {
                setShowMore(false);
                setShowOfficialModal(true);
              }}
              data-ocid="more.official_access.button"
            >
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "oklch(0.28 0.08 252 / 0.5)" }}
              >
                <Shield
                  className="w-4 h-4"
                  style={{ color: "oklch(0.65 0.12 252)" }}
                />
              </span>
              <div className="text-left flex-1">
                <p className="text-sm font-semibold text-foreground">
                  Official Access
                </p>
                <p className="text-xs text-muted-foreground">
                  Enter code to unlock admin controls
                </p>
              </div>
              <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </button>
          ) : (
            <div
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border mb-4"
              style={{
                borderColor: "oklch(0.4 0.12 155 / 0.5)",
                background: "oklch(0.15 0.07 155 / 0.3)",
              }}
            >
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "oklch(0.28 0.1 155 / 0.5)" }}
              >
                <ShieldCheck
                  className="w-4 h-4"
                  style={{ color: "oklch(0.65 0.15 155)" }}
                />
              </span>
              <div className="text-left flex-1">
                <p
                  className="text-sm font-semibold"
                  style={{ color: "oklch(0.65 0.15 155)" }}
                >
                  Official Mode Active
                </p>
                <p className="text-xs text-muted-foreground">
                  Admin controls are unlocked
                </p>
              </div>
              {!confirmLock ? (
                <button
                  type="button"
                  className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors hover:opacity-80"
                  style={{
                    background: "oklch(0.28 0.08 24 / 0.4)",
                    color: "oklch(0.6 0.22 24)",
                    border: "1px solid oklch(0.4 0.12 24 / 0.4)",
                  }}
                  onClick={() => setConfirmLock(true)}
                  data-ocid="more.lock_official.button"
                >
                  <Lock className="w-3 h-3" />
                  Lock
                </button>
              ) : (
                <div className="flex gap-1">
                  <button
                    type="button"
                    className="text-xs font-bold px-2 py-1 rounded-lg"
                    style={{
                      background: "oklch(0.5 0.2 24 / 0.3)",
                      color: "oklch(0.6 0.22 24)",
                    }}
                    onClick={() => {
                      onLockOfficialSession?.();
                      setConfirmLock(false);
                      setShowMore(false);
                    }}
                    data-ocid="more.lock_official.confirm_button"
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    className="text-xs font-semibold px-2 py-1 rounded-lg text-muted-foreground"
                    onClick={() => setConfirmLock(false)}
                    data-ocid="more.lock_official.cancel_button"
                  >
                    No
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Standard MORE_ITEMS grid */}
          <div className="grid grid-cols-4 gap-3">
            {MORE_ITEMS.map((item) => {
              const isActive =
                currentPath === item.path ||
                (item.path !== "/" && currentPath.startsWith(item.path));
              return (
                <button
                  type="button"
                  key={item.path}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all ${
                    isActive
                      ? "bg-accent/10 border-accent/40 text-accent"
                      : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                  }`}
                  onClick={() => {
                    navigate({ to: item.path });
                    setShowMore(false);
                  }}
                  data-ocid={item.ocid}
                >
                  <div className="w-8 h-8 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-semibold">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Role-specific nav items — Coach / Admin */}
          {roleNavItems.length > 0 && (
            <div className="mt-5">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                Officials
              </p>
              <div className="grid grid-cols-4 gap-3">
                {roleNavItems.map((item) => {
                  const isActive =
                    currentPath === item.path ||
                    (item.path !== "/" && currentPath.startsWith(item.path));
                  return (
                    <button
                      type="button"
                      key={item.path}
                      className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all ${
                        isActive
                          ? "bg-accent/10 border-accent/40 text-accent"
                          : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                      }`}
                      onClick={() => {
                        navigate({ to: item.path });
                        setShowMore(false);
                      }}
                      data-ocid={item.ocid}
                    >
                      <div className="w-8 h-8 flex items-center justify-center">
                        {item.icon}
                      </div>
                      <span className="text-[10px] font-semibold">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Officials Quick Actions — admin / official session only */}
          {isAdmin && (
            <div className="mt-5">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                Officials Quick Actions
              </p>
              <div className="grid grid-cols-4 gap-2">
                {/* Add Team */}
                <button
                  type="button"
                  className="flex flex-col items-center gap-1.5 py-3 rounded-xl border border-accent/30 bg-accent/8 text-accent hover:bg-accent/15 hover:border-accent/60 transition-all"
                  onClick={() => {
                    setShowMore(false);
                    setShowAddTeam(true);
                  }}
                  data-ocid="more.add_team.open_modal_button"
                >
                  <div className="w-8 h-8 flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold">Add Team</span>
                </button>

                {/* Add Player */}
                <button
                  type="button"
                  className="flex flex-col items-center gap-1.5 py-3 rounded-xl border border-accent/30 bg-accent/8 text-accent hover:bg-accent/15 hover:border-accent/60 transition-all"
                  onClick={() => {
                    setShowMore(false);
                    setShowAddPlayer(true);
                  }}
                  data-ocid="more.add_player.open_modal_button"
                >
                  <div className="w-8 h-8 flex items-center justify-center">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold">Add Player</span>
                </button>

                {/* Add Coach */}
                <button
                  type="button"
                  className="flex flex-col items-center gap-1.5 py-3 rounded-xl border border-accent/30 bg-accent/8 text-accent hover:bg-accent/15 hover:border-accent/60 transition-all"
                  onClick={() => {
                    setShowMore(false);
                    setShowAddCoach(true);
                  }}
                  data-ocid="more.add_coach.open_modal_button"
                >
                  <div className="w-8 h-8 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold">Add Coach</span>
                </button>

                {/* Add News */}
                <button
                  type="button"
                  className="flex flex-col items-center gap-1.5 py-3 rounded-xl border border-accent/30 bg-accent/8 text-accent hover:bg-accent/15 hover:border-accent/60 transition-all"
                  onClick={() => {
                    setShowMore(false);
                    setShowAddNews(true);
                  }}
                  data-ocid="more.add_news.open_modal_button"
                >
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FilePlus className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold">Add News</span>
                </button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Quick-action Dialogs */}
      <AddTeamDialog open={showAddTeam} onOpenChange={setShowAddTeam} />
      <AddPlayerDialog open={showAddPlayer} onOpenChange={setShowAddPlayer} />
      <AddCoachDialog open={showAddCoach} onOpenChange={setShowAddCoach} />
      <AddNewsDialog open={showAddNews} onOpenChange={setShowAddNews} />

      {/* Official Access Modal */}
      <OfficialAccessModal
        open={showOfficialModal}
        onOpenChange={setShowOfficialModal}
        onVerified={() => {
          onOfficialSessionVerified?.();
        }}
      />
    </>
  );
}
