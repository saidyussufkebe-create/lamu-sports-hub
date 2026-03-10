import {
  type T__1 as BackendTeam,
  type ExternalBlob,
  type T__2 as PlayerT,
  Position,
  Role,
} from "@/backend";
import { AreaBadge, TeamBadge } from "@/components/shared/TeamBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

import { type T__5 as BackendMatch, Status } from "@/backend";
import { useActor } from "@/hooks/useActor";
import { isOfficialSessionVerified } from "@/utils/localStore";
import {
  type Award,
  type CardEvent,
  type GoalEvent,
  LSH_AWARDS_KEY,
  LSH_OFFICIALS_KEY,
  LSH_PITCHES_KEY,
  LSH_PLAYER_CONFIRMATIONS_KEY,
  LSH_PLAYER_PHOTOS_KEY,
  LSH_REFEREES_KEY,
  LSH_SEASON_SETTINGS_KEY,
  LSH_SUGGESTIONS_KEY,
  LSH_SYSTEM_STATUS_KEY,
  type LocalNewsItem,
  type NewsConfirmation,
  type Official,
  type Pitch,
  type RecoveryRequest,
  type Referee,
  type SeasonSettings,
  type Suggestion,
  type SystemStatus,
  type TeamOverride,
  addLocalNewsItem,
  addLocalNotification,
  addLocalPlayer,
  addLocalTeam,
  clearAppLogo,
  confirmNews,
  deleteLocalNewsItem,
  deleteLocalPlayer,
  deleteLocalTeam,
  getAppLogo,
  getAwards,
  getDeletedPlayerIds,
  getDeletedTeamIds,
  getLocalNews,
  getLocalPlayers,
  getLocalStore,
  getLocalTeams,
  getMatchEvents,
  getMatchPitches,
  getMatchReferees,
  getNewsConfirmations,
  getNewsPhotos,
  getOfficialCode,
  getOfficials,
  getPitches,
  getPlayerConfirmations,
  getPlayerPhotos,
  getRecoveryRequests,
  getReferees,
  getSeasonSettings,
  getTeamLogos,
  getTeamOverrides,
  setAppLogo,
  setLocalStore,
  setMatchEvents,
  setMatchPitch,
  setMatchReferee,
  setNewsPhoto,
  setOfficialCode,
  setTeamLogo,
  setTeamOverride,
  softDeletePlayer,
  softDeleteTeam,
  unconfirmNews,
  updateRecoveryRequest,
} from "@/utils/localStore";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Bell,
  Calendar,
  CheckCircle,
  ClipboardCopy,
  Cog,
  Download,
  Edit,
  ImageIcon,
  Info,
  KeyRound,
  Loader2,
  Lock,
  MessageSquare,
  Newspaper,
  Phone,
  Plus,
  Shield,
  Trash2,
  Trophy,
  Upload,
  UserCheck,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type MockUser = {
  userId: string;
  name: string;
  role: string;
  area: string;
  email: string;
};

const AREAS = ["Shela", "Hindi", "Mkunguni", "Langoni", "Mkomani", "Lamu Town"];

type NewsItem = {
  newsId: string;
  title: string;
  body: string;
  isPublished: boolean;
  timestamp: bigint;
  photo?: ExternalBlob;
  authorId: string;
};

function formatTimestamp(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  const date = new Date(ms);
  const now = Date.now();
  const diff = now - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 2) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

// ── AUTH GATE wrapper ──────────────────────────────────────────────────────────
export function AdminPanelPage() {
  const { actor, isFetching: actorFetching } = useActor();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminCheckLoading, setAdminCheckLoading] = useState(true);

  useEffect(() => {
    // Official session code is the primary gate — no backend check needed
    if (isOfficialSessionVerified()) {
      setIsAdmin(true);
      setAdminCheckLoading(false);
      return;
    }

    if (actorFetching) return;
    if (!actor) {
      setAdminCheckLoading(false);
      setIsAdmin(false);
      return;
    }
    setAdminCheckLoading(true);

    // Safety timeout: if the admin check doesn't resolve within 5 seconds,
    // treat as non-admin rather than hanging forever on the loading screen.
    const timeout = setTimeout(() => {
      setIsAdmin(false);
      setAdminCheckLoading(false);
    }, 5000);

    actor
      .isCallerAdmin()
      .then((result) => {
        clearTimeout(timeout);
        setIsAdmin(result);
      })
      .catch(() => {
        clearTimeout(timeout);
        setIsAdmin(false);
      })
      .finally(() => setAdminCheckLoading(false));

    return () => clearTimeout(timeout);
  }, [actor, actorFetching]);

  // Loading state while checking admin
  if (adminCheckLoading || actorFetching) {
    return (
      <div
        className="min-h-screen pb-24 pt-14 flex flex-col items-center justify-center gap-4"
        data-ocid="admin.loading_state"
      >
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          Checking admin access...
        </p>
      </div>
    );
  }

  // Access denied screen
  if (!isAdmin) {
    return (
      <div
        className="min-h-screen pb-24 pt-14 flex flex-col items-center justify-center gap-5 px-6 text-center"
        data-ocid="admin.error_state"
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: "oklch(0.6 0.22 24 / 0.15)" }}
        >
          <Lock className="w-8 h-8" style={{ color: "oklch(0.6 0.22 24)" }} />
        </div>
        <div>
          <h2 className="font-display font-black text-xl text-foreground mb-2">
            Official Access Required
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
            Enter your Official Access Code first. Tap "More" in the navigation
            bar, then "Official Access" and enter the code given to you by Said
            Joseph.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.55 0.18 252) 0%, oklch(0.45 0.16 252) 100%)",
          }}
          data-ocid="admin.go_back.button"
        >
          Go Back
        </button>
      </div>
    );
  }

  return <AdminPanelInner />;
}

// ── INNER PANEL (only rendered for verified admins) ────────────────────────────
function AdminPanelInner() {
  const { actor } = useActor();
  // Controlled tab state so quick actions can switch tabs programmatically
  const [activeTab, setActiveTab] = useState("players");
  // Trigger to auto-open Players add dialog from Quick Actions
  const [openPlayerDialog, setOpenPlayerDialog] = useState(false);
  const [showCreateMatch, setShowCreateMatch] = useState(false);
  const [inboxUnread, setInboxUnread] = useState<number>(() => {
    const suggestions = getLocalStore<Suggestion[]>(LSH_SUGGESTIONS_KEY, []);
    return suggestions.filter((s) => !s.isRead).length;
  });
  const [recoveryRequests, setRecoveryRequests] = useState<RecoveryRequest[]>(
    () => getRecoveryRequests(),
  );
  const recoveryPendingCount = recoveryRequests.filter(
    (r) => r.status === "pending",
  ).length;
  const [loading, setLoading] = useState(false);
  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [matchDate, setMatchDate] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [notifTarget, setNotifTarget] = useState("all");

  // Edit state
  const [editingUser, setEditingUser] = useState<MockUser | null>(null);
  const [editUserName, setEditUserName] = useState("");
  const [editUserRole, setEditUserRole] = useState("");
  const [editUserArea, setEditUserArea] = useState("");

  const [editingTeam, setEditingTeam] = useState<BackendTeam | null>(null);
  const [editTeamName, setEditTeamName] = useState("");
  const [editTeamArea, setEditTeamArea] = useState("");

  const [editingMatch, setEditingMatch] = useState<BackendMatch | null>(null);
  const [editHomeScore, setEditHomeScore] = useState("");
  const [editAwayScore, setEditAwayScore] = useState("");
  const [editMatchStatus, setEditMatchStatus] = useState<
    "scheduled" | "live" | "played"
  >("scheduled");
  const [editMatchRefereeId, setEditMatchRefereeId] = useState<string>("");
  // Real backend matches for the matches tab
  const [backendMatches, setBackendMatches] = useState<BackendMatch[]>([]);
  const [backendMatchesLoading, setBackendMatchesLoading] = useState(false);

  // Real backend users for the users tab
  const [backendUsers, setBackendUsers] = useState<MockUser[]>([]);
  const [backendUsersLoading, setBackendUsersLoading] = useState(false);

  // Match referee assignments from localStorage
  const [matchReferees, setMatchRefereesState] =
    useState<Record<string, string>>(getMatchReferees);

  // New match referee
  const [matchRefereeId, setMatchRefereeId] = useState<string>("");

  // Match pitch assignments
  const [matchPitches, setMatchPitchesState] =
    useState<Record<string, string>>(getMatchPitches);
  const [matchPitchId, setMatchPitchId] = useState<string>("");
  const [editMatchPitchId, setEditMatchPitchId] = useState<string>("");

  // Real backend teams (for match creation)
  const [backendTeamsForMatch, setBackendTeamsForMatch] = useState<
    BackendTeam[]
  >([]);
  const [backendTeamsForMatchLoading, setBackendTeamsForMatchLoading] =
    useState(false);

  // Team logos
  const [teamLogos, setTeamLogosState] =
    useState<Record<string, string>>(getTeamLogos);
  const teamLogoInputRef = useRef<HTMLInputElement>(null);
  const [logoUploadTeamId, setLogoUploadTeamId] = useState<string | null>(null);

  // Logo for edit dialog (separate from row logo upload)
  const editLogoInputRef = useRef<HTMLInputElement>(null);
  const [editLogoPreview, setEditLogoPreview] = useState<string | null>(null);

  const handleEditLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingTeam) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setTeamLogo(editingTeam.teamId, dataUrl);
      setTeamLogosState(getTeamLogos());
      setEditLogoPreview(dataUrl);
      toast.success("Team logo uploaded!");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Delete team state
  const [deletingTeamId, setDeletingTeamId] = useState<string | null>(null);
  const [deletingTeamName, setDeletingTeamName] = useState<string>("");
  const [deleteTeamLoading, setDeleteTeamLoading] = useState(false);

  const handleDeleteTeam = () => {
    if (!deletingTeamId) return;
    setDeleteTeamLoading(true);
    if (deletingTeamId.startsWith("LOCAL-TEAM-")) {
      deleteLocalTeam(deletingTeamId);
    } else {
      softDeleteTeam(deletingTeamId);
    }
    setDeletingTeamId(null);
    setDeletingTeamName("");
    setDeleteTeamLoading(false);
    setTeamRefreshTrigger((n) => n + 1);
    window.dispatchEvent(new CustomEvent("lsh:teams-updated"));
    toast.success("Team removed.");
  };

  // Match Events state
  const [showMatchEvents, setShowMatchEvents] = useState(false);
  const [matchEventsMatchId, setMatchEventsMatchId] = useState<string>("");
  const [currentEvents, setCurrentEvents] = useState<{
    goals: GoalEvent[];
    cards: CardEvent[];
  }>({ goals: [], cards: [] });
  const [newGoalTeam, setNewGoalTeam] = useState<"home" | "away">("home");
  const [newGoalPlayer, setNewGoalPlayer] = useState("");
  const [newGoalMinute, setNewGoalMinute] = useState("");
  const [newCardPlayer, setNewCardPlayer] = useState("");
  const [newCardType, setNewCardType] = useState<"yellow" | "red">("yellow");
  const [newCardMinute, setNewCardMinute] = useState("");

  const openMatchEvents = (matchId: string) => {
    setMatchEventsMatchId(matchId);
    setCurrentEvents(getMatchEvents(matchId));
    setShowMatchEvents(true);
  };

  const addGoalEvent = () => {
    if (!newGoalPlayer.trim()) return;
    const updated = {
      ...currentEvents,
      goals: [
        ...currentEvents.goals,
        {
          team: newGoalTeam,
          playerName: newGoalPlayer.trim(),
          minute: Number.parseInt(newGoalMinute) || 0,
        },
      ],
    };
    setCurrentEvents(updated);
    setMatchEvents(matchEventsMatchId, updated);
    setNewGoalPlayer("");
    setNewGoalMinute("");
  };

  const addCardEvent = () => {
    if (!newCardPlayer.trim()) return;
    const updated = {
      ...currentEvents,
      cards: [
        ...currentEvents.cards,
        {
          playerName: newCardPlayer.trim(),
          cardType: newCardType,
          minute: Number.parseInt(newCardMinute) || 0,
        },
      ],
    };
    setCurrentEvents(updated);
    setMatchEvents(matchEventsMatchId, updated);
    setNewCardPlayer("");
    setNewCardMinute("");
  };

  // Add User state
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserPhone, setNewUserPhone] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<string>("fan");
  const [newUserArea, setNewUserArea] = useState<string>("Lamu Town");
  const [addUserLoading, setAddUserLoading] = useState(false);

  // Add Team state
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamArea, setNewTeamArea] = useState<string>("Lamu Town");
  const [newTeamCoach, setNewTeamCoach] = useState("");
  const [addTeamLoading, setAddTeamLoading] = useState(false);
  // Increment to tell TeamsTabContent to refresh after a team is created
  const [teamRefreshTrigger, setTeamRefreshTrigger] = useState(0);

  // News confirmations
  const [newsConfirmations, setNewsConfirmations] =
    useState<Record<string, NewsConfirmation>>(getNewsConfirmations);

  // News photos (local store, keyed by newsId)
  const [newsPhotos, setNewsPhotosState] =
    useState<Record<string, string>>(getNewsPhotos);

  // Load real backend teams whenever the matches tab is active or create-match dialog opens
  useEffect(() => {
    if (!actor) return;
    if (activeTab !== "matches" && !showCreateMatch) return;
    setBackendTeamsForMatchLoading(true);
    actor
      .getAllTeams()
      .then((teams) => setBackendTeamsForMatch(teams))
      .catch((err) => console.error("Failed to load teams for match:", err))
      .finally(() => setBackendTeamsForMatchLoading(false));
  }, [actor, activeTab, showCreateMatch]);

  // Load real backend matches when matches tab is active
  const fetchMatches = async () => {
    if (!actor) return;
    setBackendMatchesLoading(true);
    try {
      const m = await actor.getAllMatches();
      setBackendMatches(m);
    } catch (err) {
      console.error("Failed to load matches:", err);
    } finally {
      setBackendMatchesLoading(false);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: activeTab is intentional
  useEffect(() => {
    if (activeTab === "matches" && actor) {
      fetchMatches();
      // Also load teams for the matches list display
      if (backendTeamsForMatch.length === 0) {
        setBackendTeamsForMatchLoading(true);
        actor
          .getAllTeams()
          .then((teams) => setBackendTeamsForMatch(teams))
          .catch((err) => console.error("Failed to load teams:", err))
          .finally(() => setBackendTeamsForMatchLoading(false));
      }
    }
  }, [activeTab, actor]);

  // Load real users from backend when users tab is active
  // biome-ignore lint/correctness/useExhaustiveDependencies: activeTab is intentional
  useEffect(() => {
    if (activeTab === "users" && actor) {
      setBackendUsersLoading(true);
      actor
        .getAllUserProfiles()
        .then((profiles) => {
          setBackendUsers(
            profiles.map((p) => ({
              userId: p.userId,
              name: p.name || "(no name)",
              role: p.role as string,
              area: p.area || "",
              email: p.email || "",
            })),
          );
        })
        .catch((err) => console.error("Failed to load users:", err))
        .finally(() => setBackendUsersLoading(false));
    }
  }, [activeTab, actor]);

  const handleConfirmNews = (newsId: string) => {
    confirmNews(newsId, "Admin");
    setNewsConfirmations(getNewsConfirmations());
    toast.success("News post officially confirmed!");
  };

  const handleUnconfirmNews = (newsId: string) => {
    unconfirmNews(newsId);
    setNewsConfirmations(getNewsConfirmations());
    toast.success("Confirmation removed.");
  };

  // News state
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [showAddNews, setShowAddNews] = useState(false);
  const [newsTitle, setNewsTitle] = useState("");
  const [newsBody, setNewsBody] = useState("");
  const [newsPublished, setNewsPublished] = useState(true);
  const [_newsPhotoFile, setNewsPhotoFile] = useState<File | null>(null);
  const [newsPhotoPreview, setNewsPhotoPreview] = useState<string | null>(null);
  const [addNewsLoading, setAddNewsLoading] = useState(false);
  const newsFileRef = useRef<HTMLInputElement>(null);

  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [editNewsTitle, setEditNewsTitle] = useState("");
  const [editNewsBody, setEditNewsBody] = useState("");
  const [editNewsPublished, setEditNewsPublished] = useState(true);
  const [editNewsLoading, setEditNewsLoading] = useState(false);

  const [deleteNewsId, setDeleteNewsId] = useState<string | null>(null);
  const [deleteNewsLoading, setDeleteNewsLoading] = useState(false);

  // Load news when tab becomes active — merges backend + local-only items
  const fetchNews = async () => {
    setNewsLoading(true);
    try {
      const localItems = getLocalNews().map(
        (ln) =>
          ({
            newsId: ln.newsId,
            title: ln.title,
            body: ln.body,
            isPublished: ln.isPublished,
            authorId: ln.authorId,
            timestamp: BigInt(ln.timestamp) * BigInt(1_000_000),
            photo: undefined,
          }) as NewsItem,
      );

      if (!actor) {
        // No backend — show local only
        setNewsList(localItems);
        setNewsPhotosState(getNewsPhotos());
        setNewsLoading(false);
        return;
      }

      const items = await actor.getAllNewsAdmin();
      const backendIds = new Set((items as NewsItem[]).map((i) => i.newsId));
      const merged = [
        ...(items as NewsItem[]),
        ...localItems.filter((li) => !backendIds.has(li.newsId)),
      ].sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1));
      setNewsList(merged);
      // Sync local photos state in case new photos were saved
      setNewsPhotosState(getNewsPhotos());
    } catch {
      // On error, at least show locally stored news
      const localItems = getLocalNews().map(
        (ln) =>
          ({
            newsId: ln.newsId,
            title: ln.title,
            body: ln.body,
            isPublished: ln.isPublished,
            authorId: ln.authorId,
            timestamp: BigInt(ln.timestamp) * BigInt(1_000_000),
            photo: undefined,
          }) as NewsItem,
      );
      setNewsList(localItems);
      setNewsPhotosState(getNewsPhotos());
    } finally {
      setNewsLoading(false);
    }
  };

  const openEditUser = (user: MockUser) => {
    setEditingUser(user);
    setEditUserName(user.name);
    setEditUserRole(user.role);
    setEditUserArea(user.area);
  };

  const handleSaveUser = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    setEditingUser(null);
    toast.success(`${editUserName}'s profile updated!`);
  };

  const openEditTeam = (team: BackendTeam) => {
    setEditingTeam(team);
    setEditTeamName(team.name);
    setEditTeamArea(team.area);
    setEditLogoPreview(teamLogos[team.teamId] ?? null);
  };

  const handleSaveTeam = async () => {
    if (!editingTeam) return;
    setLoading(true);
    try {
      // Save the edit override to localStorage so the updated name/area persists
      setTeamOverride(editingTeam.teamId, {
        name: editTeamName.trim(),
        area: editTeamArea,
      });
      // If there's a pending logo upload in the edit dialog, it was already saved via setTeamLogo
      toast.success(`${editTeamName} updated successfully!`);
      setEditingTeam(null);
      // Trigger a teams refresh
      setTeamRefreshTrigger((n) => n + 1);
      window.dispatchEvent(new CustomEvent("lsh:teams-updated"));
    } catch {
      toast.error("Failed to update team.");
    } finally {
      setLoading(false);
    }
  };

  const openEditMatch = (match: BackendMatch) => {
    setEditingMatch(match);
    setEditHomeScore(String(Number(match.homeScore)));
    setEditAwayScore(String(Number(match.awayScore)));
    // Convert backend status to string key
    const statusStr = String(match.status);
    const s = statusStr.includes("live")
      ? "live"
      : statusStr.includes("played")
        ? "played"
        : "scheduled";
    setEditMatchStatus(s);
    setEditMatchRefereeId(matchReferees[match.matchId] ?? "");
    setEditMatchPitchId(matchPitches[match.matchId] ?? "");
  };

  const handleSaveMatch = async () => {
    if (!editingMatch) return;
    setLoading(true);
    try {
      const statusMap: Record<string, Status> = {
        scheduled: Status.scheduled,
        live: Status.live,
        played: Status.played,
      };
      await actor?.updateMatchScore(
        editingMatch.matchId,
        BigInt(Number.parseInt(editHomeScore) || 0),
        BigInt(Number.parseInt(editAwayScore) || 0),
        statusMap[editMatchStatus] ?? Status.scheduled,
      );
      // Save referee/pitch locally
      setMatchReferee(editingMatch.matchId, editMatchRefereeId || null);
      setMatchRefereesState(getMatchReferees());
      setMatchPitch(editingMatch.matchId, editMatchPitchId || null);
      setMatchPitchesState(getMatchPitches());
      toast.success("Match updated successfully!");
      setEditingMatch(null);
      await fetchMatches();
    } catch {
      toast.error("Failed to update match. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMatch = async () => {
    if (!homeTeam || !awayTeam || !matchDate) {
      toast.error("Please fill all fields");
      return;
    }
    if (homeTeam === awayTeam) {
      toast.error("Home and away teams must be different");
      return;
    }
    setLoading(true);
    try {
      // Parse datetime-local value to timestamp (nanoseconds for ICP)
      const dateMs = new Date(matchDate).getTime();
      const dateNs = BigInt(dateMs) * BigInt(1_000_000);
      // Extract kickoff time as HH:MM from the datetime-local input
      const kickoffTime = matchDate.includes("T")
        ? (matchDate.split("T")[1]?.slice(0, 5) ?? "00:00")
        : "00:00";
      const newMatchId = await actor?.createMatch(
        homeTeam,
        awayTeam,
        dateNs,
        kickoffTime,
      );
      if (newMatchId && matchRefereeId) {
        setMatchReferee(newMatchId, matchRefereeId);
        setMatchRefereesState(getMatchReferees());
      }
      if (newMatchId && matchPitchId) {
        setMatchPitch(newMatchId, matchPitchId);
        setMatchPitchesState(getMatchPitches());
      }
      toast.success("Match scheduled successfully!");
      setShowCreateMatch(false);
      setHomeTeam("");
      setAwayTeam("");
      setMatchDate("");
      setMatchRefereeId("");
      setMatchPitchId("");
      await fetchMatches();
    } catch {
      toast.error("Failed to schedule match. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async () => {
    if (!notifMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    addLocalNotification({
      type: "message",
      message: notifMessage.trim(),
      target: notifTarget,
    });
    setLoading(false);
    setNotifMessage("");
    toast.success(
      `Notification saved for ${notifTarget === "all" ? "all users" : `${notifTarget} area`}!`,
    );
  };

  const handleAddUser = async () => {
    if (!newUserName.trim()) {
      toast.error("Full name is required");
      return;
    }
    setAddUserLoading(true);
    try {
      const roleMap: Record<string, Role> = {
        admin: Role.admin,
        coach: Role.coach,
        player: Role.player,
        fan: Role.fan,
      };
      await actor?.adminCreateUser(
        newUserName.trim(),
        newUserPhone.trim(),
        newUserEmail.trim(),
        roleMap[newUserRole] ?? Role.fan,
        newUserArea,
      );
      toast.success(`User "${newUserName}" added successfully!`);
      setShowAddUser(false);
      setNewUserName("");
      setNewUserPhone("");
      setNewUserEmail("");
      setNewUserRole("fan");
      setNewUserArea("Lamu Town");
    } catch {
      toast.error("Failed to add user. Please try again.");
    } finally {
      setAddUserLoading(false);
    }
  };

  const handleAddTeam = async () => {
    if (!newTeamName.trim()) {
      toast.error("Team name is required");
      return;
    }
    setAddTeamLoading(true);
    try {
      let backendOk = false;
      try {
        await actor?.adminCreateTeam(
          newTeamName.trim(),
          newTeamArea,
          newTeamCoach.trim(),
        );
        backendOk = true;
      } catch {
        backendOk = false;
      }

      if (!backendOk) {
        // Local fallback for PIN-session officials
        const localId = `LOCAL-TEAM-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        addLocalTeam({
          teamId: localId,
          name: newTeamName.trim(),
          area: newTeamArea,
          coachName: newTeamCoach.trim(),
          createdAt: Date.now(),
        });
        toast.warning(
          "Saved locally — log in as an Official to save permanently to the league.",
        );
      }

      toast.success(`Team "${newTeamName}" created!`);
      setShowAddTeam(false);
      setNewTeamName("");
      setNewTeamArea("Lamu Town");
      setNewTeamCoach("");
      // Switch to teams tab and trigger a refresh
      setActiveTab("teams");
      setTeamRefreshTrigger((n) => n + 1);
      window.dispatchEvent(new CustomEvent("lsh:teams-updated"));
    } catch {
      toast.error("Failed to create team. Please try again.");
    } finally {
      setAddTeamLoading(false);
    }
  };

  const handleTeamLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !logoUploadTeamId) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setTeamLogo(logoUploadTeamId, dataUrl);
      setTeamLogosState(getTeamLogos());
      toast.success("Team logo updated!");
      setLogoUploadTeamId(null);
    };
    reader.readAsDataURL(file);
    // Reset input
    e.target.value = "";
  };

  const handleNewsPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewsPhotoFile(file);
    const url = URL.createObjectURL(file);
    setNewsPhotoPreview(url);
  };

  const handleAddNews = async () => {
    if (!newsTitle.trim() || !newsBody.trim()) {
      toast.error("Title and body are required");
      return;
    }
    setAddNewsLoading(true);
    try {
      let savedNewsId: string | undefined;
      try {
        savedNewsId = await actor?.createNews(
          newsTitle.trim(),
          newsBody.trim(),
          newsPublished,
        );
      } catch {
        // Backend rejected (anonymous caller) — fall back to local storage
        savedNewsId = undefined;
      }

      if (savedNewsId) {
        // Backend success — save photo under the real newsId
        if (newsPhotoPreview) {
          setNewsPhoto(savedNewsId, newsPhotoPreview);
        }
      } else {
        // Local fallback — create a local-only news item
        const localId = `LOCAL-NEWS-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        addLocalNewsItem({
          newsId: localId,
          title: newsTitle.trim(),
          body: newsBody.trim(),
          isPublished: newsPublished,
          authorId: "official",
          timestamp: Date.now(),
          photoBase64: newsPhotoPreview ?? undefined,
        });
        if (newsPhotoPreview) {
          setNewsPhoto(localId, newsPhotoPreview);
        }
        toast.warning(
          "Saved locally — log in as an Official to save permanently to the league.",
        );
      }

      toast.success("News post created!");
      setShowAddNews(false);
      setNewsTitle("");
      setNewsBody("");
      setNewsPublished(true);
      setNewsPhotoFile(null);
      setNewsPhotoPreview(null);
      await fetchNews();
    } catch {
      toast.error("Failed to create news. Please try again.");
    } finally {
      setAddNewsLoading(false);
    }
  };

  const openEditNews = (item: NewsItem) => {
    setEditingNews(item);
    setEditNewsTitle(item.title);
    setEditNewsBody(item.body);
    setEditNewsPublished(item.isPublished);
  };

  const handleEditNews = async () => {
    if (!editingNews || !editNewsTitle.trim() || !editNewsBody.trim()) {
      toast.error("Title and body are required");
      return;
    }
    setEditNewsLoading(true);
    try {
      const isLocal = editingNews.newsId.startsWith("LOCAL-NEWS-");
      if (isLocal) {
        // Update local-only item
        const { updateLocalNewsItem } = await import("@/utils/localStore");
        updateLocalNewsItem(editingNews.newsId, {
          title: editNewsTitle.trim(),
          body: editNewsBody.trim(),
          isPublished: editNewsPublished,
        });
      } else {
        await actor?.updateNews(
          editingNews.newsId,
          editNewsTitle.trim(),
          editNewsBody.trim(),
          editNewsPublished,
        );
      }
      toast.success("News post updated!");
      setEditingNews(null);
      await fetchNews();
    } catch {
      toast.error("Failed to update news.");
    } finally {
      setEditNewsLoading(false);
    }
  };

  const handleDeleteNews = async () => {
    if (!deleteNewsId) return;
    setDeleteNewsLoading(true);
    try {
      const isLocal = deleteNewsId.startsWith("LOCAL-NEWS-");
      if (isLocal) {
        deleteLocalNewsItem(deleteNewsId);
      } else {
        await actor?.deleteNews(deleteNewsId);
      }
      toast.success("News post deleted.");
      setDeleteNewsId(null);
      await fetchNews();
    } catch {
      toast.error("Failed to delete news.");
    } finally {
      setDeleteNewsLoading(false);
    }
  };

  const roleColor = (role: string) => {
    const map: Record<string, string> = {
      admin: "oklch(0.82 0.15 85)",
      coach: "oklch(0.55 0.18 252)",
      player: "oklch(0.6 0.22 24)",
      fan: "oklch(0.82 0.08 82)",
    };
    return map[role] || "oklch(0.62 0 0)";
  };

  return (
    <div data-ocid="admin.page" className="min-h-screen pb-24 pt-14">
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
            Admin Panel
          </h1>
          <p
            className="text-xs mt-0.5 font-semibold flex items-center gap-1"
            style={{ color: "oklch(0.65 0.18 82)" }}
          >
            <Lock className="w-3 h-3" />
            Officials only — all changes are recorded
          </p>
        </motion.div>
      </div>

      {/* Summary stats */}
      <div className="px-4 mt-4 grid grid-cols-4 gap-2 mb-2">
        {[
          { label: "Users", value: backendUsers.length, icon: "👤" },
          { label: "Teams", value: backendTeamsForMatch.length, icon: "🏟️" },
          { label: "Matches", value: backendMatches.length, icon: "⚽" },
          { label: "Players", value: "–", icon: "🏃" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl p-3 bg-card border border-border text-center"
          >
            <div className="text-lg">{stat.icon}</div>
            <div className="font-black font-stats text-xl text-foreground">
              {stat.value}
            </div>
            <div className="text-[9px] text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ── Quick Actions Strip ─────────────────────────────────────────────── */}
      <div className="px-4 mt-3 mb-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
          Quick Actions
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            data-ocid="admin.add_player.primary_button"
            onClick={() => {
              setOpenPlayerDialog(true);
              setActiveTab("players");
            }}
            className="flex items-center gap-1.5 shrink-0 rounded-full border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[11px] font-bold px-3 py-1.5 transition-all active:scale-95"
          >
            <UserCheck className="w-3.5 h-3.5" />
            Add Player
          </button>
          <button
            type="button"
            data-ocid="admin.add_match.secondary_button"
            onClick={() => {
              setActiveTab("matches");
              setTimeout(() => setShowCreateMatch(true), 100);
            }}
            className="flex items-center gap-1.5 shrink-0 rounded-full border border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-bold px-3 py-1.5 transition-all active:scale-95"
          >
            <Calendar className="w-3.5 h-3.5" />
            Add Match
          </button>
          <button
            type="button"
            data-ocid="admin.add_news.secondary_button"
            onClick={() => {
              setActiveTab("news");
              setTimeout(() => setShowAddNews(true), 100);
            }}
            className="flex items-center gap-1.5 shrink-0 rounded-full border border-accent/40 bg-accent/10 hover:bg-accent/20 text-accent text-[11px] font-bold px-3 py-1.5 transition-all active:scale-95"
          >
            <Newspaper className="w-3.5 h-3.5" />
            Add News
          </button>
          <button
            type="button"
            data-ocid="admin.add_user.secondary_button"
            onClick={() => {
              setActiveTab("users");
              setTimeout(() => setShowAddUser(true), 100);
            }}
            className="flex items-center gap-1.5 shrink-0 rounded-full border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[11px] font-bold px-3 py-1.5 transition-all active:scale-95"
          >
            <Users className="w-3.5 h-3.5" />
            Add User
          </button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => {
          setActiveTab(v);
          if (v !== "players") setOpenPlayerDialog(false);
          if (v === "news") fetchNews();
          if (v === "matches") fetchMatches();
          if (v === "inbox") {
            const suggestions = getLocalStore<Suggestion[]>(
              LSH_SUGGESTIONS_KEY,
              [],
            );
            setInboxUnread(suggestions.filter((s) => !s.isRead).length);
          }
        }}
        className="px-4 pt-2"
      >
        {/* Row 1 — Players first for visibility */}
        <TabsList
          className="w-full grid grid-cols-5 mb-1"
          data-ocid="admin.tab"
        >
          <TabsTrigger
            value="players"
            className="text-[9px] px-0.5 data-[state=active]:text-emerald-400"
            data-ocid="admin.players.tab"
          >
            <UserCheck className="w-3 h-3 mr-0.5" />
            Players
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="text-[9px] px-0.5"
            data-ocid="admin.users.tab"
          >
            <Users className="w-3 h-3 mr-0.5" />
            Users
          </TabsTrigger>
          <TabsTrigger
            value="teams"
            className="text-[9px] px-0.5"
            data-ocid="admin.teams.tab"
          >
            <Trophy className="w-3 h-3 mr-0.5" />
            Teams
          </TabsTrigger>
          <TabsTrigger
            value="matches"
            className="text-[9px] px-0.5"
            data-ocid="admin.matches.tab"
          >
            <Calendar className="w-3 h-3 mr-0.5" />
            Matches
          </TabsTrigger>
          <TabsTrigger
            value="news"
            className="text-[9px] px-0.5"
            data-ocid="admin.news.tab"
          >
            <Newspaper className="w-3 h-3 mr-0.5" />
            News
          </TabsTrigger>
        </TabsList>
        {/* Row 2 */}
        <TabsList className="w-full grid grid-cols-5 mb-4">
          <TabsTrigger
            value="notify"
            className="text-[9px] px-0.5"
            data-ocid="admin.notify.tab"
          >
            <Bell className="w-3 h-3 mr-0.5" />
            Notify
          </TabsTrigger>
          <TabsTrigger
            value="referees"
            className="text-[9px] px-0.5"
            data-ocid="admin.referees.tab"
          >
            <Shield className="w-3 h-3 mr-0.5" />
            Refs
          </TabsTrigger>
          <TabsTrigger
            value="awards"
            className="text-[9px] px-0.5"
            data-ocid="admin.awards.tab"
          >
            <Trophy className="w-3 h-3 mr-0.5" />
            Awards
          </TabsTrigger>
          <TabsTrigger
            value="officials"
            className="text-[9px] px-0.5"
            data-ocid="admin.officials.tab"
          >
            <Users className="w-3 h-3 mr-0.5" />
            Officials
          </TabsTrigger>
          <TabsTrigger
            value="admin-settings"
            className="text-[9px] px-0.5"
            data-ocid="admin.settings.tab"
          >
            <Cog className="w-3 h-3 mr-0.5" />
            Settings
          </TabsTrigger>
        </TabsList>
        {/* Row 3 — Inbox + Admins + Recovery */}
        <TabsList className="w-full grid grid-cols-3 mb-4">
          <TabsTrigger
            value="inbox"
            className="text-[9px] px-0.5 gap-1"
            data-ocid="admin.inbox.tab"
          >
            <MessageSquare className="w-3 h-3" />
            Inbox
            {inboxUnread > 0 && (
              <span className="ml-0.5 bg-accent text-accent-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                {inboxUnread}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="admins"
            className="text-[9px] px-0.5 gap-1"
            data-ocid="admin.admins.tab"
          >
            <Shield className="w-3 h-3" />
            Admins
          </TabsTrigger>
          <TabsTrigger
            value="recovery"
            className="text-[9px] px-0.5 gap-1"
            data-ocid="admin.recovery_tab"
          >
            <KeyRound className="w-3 h-3" />
            Recovery
            {recoveryPendingCount > 0 && (
              <span className="ml-0.5 bg-accent text-accent-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                {recoveryPendingCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users">
          <div className="flex justify-end mb-3">
            <Button
              size="sm"
              className="text-xs gap-1"
              onClick={() => setShowAddUser(true)}
              data-ocid="admin.add_user.open_modal_button"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.6 0.22 24) 0%, oklch(0.55 0.25 20) 100%)",
              }}
            >
              <Plus className="w-3 h-3" />
              Add User
            </Button>
          </div>
          <div
            className="rounded-xl border border-border overflow-hidden bg-card"
            data-ocid="admin.users.table"
          >
            <div className="px-3 py-2 border-b border-border bg-muted/20">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                All Users ({backendUsers.length})
              </span>
            </div>
            {backendUsersLoading ? (
              <div
                className="flex items-center justify-center py-8 gap-2 text-muted-foreground text-xs"
                data-ocid="admin.users.loading_state"
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading users...
              </div>
            ) : backendUsers.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground text-xs"
                data-ocid="admin.users.empty_state"
              >
                <Users className="w-6 h-6 opacity-40" />
                <p>No registered users yet</p>
                <p className="text-[10px] opacity-60">
                  Users appear here once they log in and complete onboarding
                </p>
              </div>
            ) : (
              backendUsers.map((user, i) => (
                <div
                  key={user.userId}
                  className="flex items-center gap-3 px-3 py-3 border-b border-border/50 last:border-0"
                  data-ocid={`admin.user.row.${i + 1}`}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{
                      backgroundColor: `${roleColor(user.role)}22`,
                      color: roleColor(user.role),
                    }}
                  >
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-xs text-foreground">
                      {user.name}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {user.area}
                    </div>
                  </div>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full font-bold capitalize"
                    style={{
                      backgroundColor: `${roleColor(user.role)}22`,
                      color: roleColor(user.role),
                    }}
                  >
                    {user.role}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6 text-muted-foreground hover:text-foreground"
                    data-ocid={`admin.user.edit_button.${i + 1}`}
                    onClick={() => openEditUser(user)}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6 text-red-400 hover:text-red-300"
                    data-ocid={`admin.user.delete_button.${i + 1}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* Teams Tab */}
        <TabsContent value="teams">
          <TeamsTabContent
            setShowAddTeam={setShowAddTeam}
            teamLogos={teamLogos}
            teamLogoInputRef={teamLogoInputRef}
            setLogoUploadTeamId={setLogoUploadTeamId}
            openEditTeam={openEditTeam}
            activeTab={activeTab}
            refreshTrigger={teamRefreshTrigger}
            onDeleteTeam={(id, name) => {
              setDeletingTeamId(id);
              setDeletingTeamName(name);
            }}
          />
        </TabsContent>

        {/* Matches Tab */}
        <TabsContent value="matches">
          <div className="flex justify-end mb-3">
            <Button
              size="sm"
              className="text-xs gap-1"
              onClick={() => setShowCreateMatch(true)}
              data-ocid="admin.create_match.button"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.6 0.22 24) 0%, oklch(0.55 0.25 20) 100%)",
              }}
            >
              <Plus className="w-3 h-3" />
              Create Match
            </Button>
          </div>

          {backendMatchesLoading ? (
            <div
              className="flex items-center justify-center py-12 text-muted-foreground"
              data-ocid="admin.matches.loading_state"
            >
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span className="text-sm">Loading matches...</span>
            </div>
          ) : backendMatches.length === 0 ? (
            <div
              className="rounded-xl border border-border bg-card py-12 flex flex-col items-center gap-3 text-center"
              data-ocid="admin.matches.empty_state"
            >
              <Calendar className="w-10 h-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                No matches scheduled yet.
              </p>
              <p className="text-xs text-muted-foreground/60">
                Use the "Create Match" button above.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-border overflow-hidden bg-card">
              <div className="px-3 py-2 border-b border-border bg-muted/20">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  All Matches ({backendMatches.length})
                </span>
              </div>
              {backendMatches.map((match, i) => {
                const home = backendTeamsForMatch.find(
                  (t) => t.teamId === match.homeTeam,
                );
                const away = backendTeamsForMatch.find(
                  (t) => t.teamId === match.awayTeam,
                );
                const statusStr = String(match.status);
                const isLive = statusStr.includes("live");
                const isPlayed = statusStr.includes("played");
                return (
                  <div
                    key={match.matchId}
                    className="flex items-center gap-3 px-3 py-3 border-b border-border/50 last:border-0"
                    data-ocid={`admin.match.row.${i + 1}`}
                  >
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      {home && (
                        <TeamBadge
                          team={{
                            teamId: home.teamId,
                            name: home.name,
                            area: home.area,
                          }}
                          size="xs"
                        />
                      )}
                      <span className="text-xs font-semibold text-foreground truncate">
                        {home?.name ?? match.homeTeam}
                      </span>
                      {(isLive || isPlayed) && (
                        <span className="font-black font-stats text-xs text-foreground">
                          {Number(match.homeScore)}–{Number(match.awayScore)}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">vs</span>
                      <span className="text-xs font-semibold text-foreground truncate">
                        {away?.name ?? match.awayTeam}
                      </span>
                      {away && (
                        <TeamBadge
                          team={{
                            teamId: away.teamId,
                            name: away.name,
                            area: away.area,
                          }}
                          size="xs"
                        />
                      )}
                    </div>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold capitalize flex-shrink-0 ${
                        isLive
                          ? "bg-accent/20 text-accent"
                          : isPlayed
                            ? "bg-green-500/20 text-green-400"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isLive ? "live" : isPlayed ? "played" : "scheduled"}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6 text-muted-foreground hover:text-foreground flex-shrink-0"
                      data-ocid={`admin.match.edit_button.${i + 1}`}
                      onClick={() => openEditMatch(match)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-6 h-6 text-xs flex-shrink-0"
                      title="Match Events"
                      onClick={(e) => {
                        e.stopPropagation();
                        openMatchEvents(match.matchId);
                      }}
                      data-ocid={`admin.matches.events_button.${i + 1}`}
                    >
                      ⚽
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* News Tab */}
        <TabsContent value="news">
          <div className="flex justify-end mb-3">
            <Button
              size="sm"
              className="text-xs gap-1"
              onClick={() => setShowAddNews(true)}
              data-ocid="admin.add_news.open_modal_button"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.6 0.22 24) 0%, oklch(0.55 0.25 20) 100%)",
              }}
            >
              <Plus className="w-3 h-3" />
              Add News
            </Button>
          </div>

          {newsLoading ? (
            <div
              className="flex items-center justify-center py-12 text-muted-foreground"
              data-ocid="admin.news.loading_state"
            >
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span className="text-sm">Loading news...</span>
            </div>
          ) : newsList.length === 0 ? (
            <div
              className="rounded-xl border border-border bg-card py-12 flex flex-col items-center gap-3 text-center"
              data-ocid="admin.news.empty_state"
            >
              <Newspaper className="w-10 h-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                No news posts yet.
              </p>
              <p className="text-xs text-muted-foreground/60">
                Create your first post with the "Add News" button above.
              </p>
            </div>
          ) : (
            <div
              className="rounded-xl border border-border overflow-hidden bg-card"
              data-ocid="admin.news.list"
            >
              <div className="px-3 py-2 border-b border-border bg-muted/20">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  All Posts ({newsList.length})
                </span>
              </div>
              {newsList.map((item, i) => (
                <div
                  key={item.newsId}
                  className="flex items-center gap-3 px-3 py-3 border-b border-border/50 last:border-0"
                  data-ocid={`admin.news.row.${i + 1}`}
                >
                  {/* Thumbnail — show backend photo, or local photo, or placeholder */}
                  <div
                    className="w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.2 0.06 252) 0%, oklch(0.15 0.04 255) 100%)",
                    }}
                  >
                    {item.photo ? (
                      <img
                        src={item.photo.getDirectURL()}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : newsPhotos[item.newsId] ? (
                      <img
                        src={newsPhotos[item.newsId]}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-xs text-foreground truncate">
                      {item.title}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span className="text-[10px] text-muted-foreground">
                        {formatTimestamp(item.timestamp)}
                      </span>
                      {newsConfirmations[item.newsId] && (
                        <span
                          className="flex items-center gap-0.5 text-[9px] font-bold px-1 py-0.5 rounded-full"
                          style={{
                            backgroundColor: "oklch(0.55 0.18 145 / 0.15)",
                            color: "oklch(0.65 0.18 145)",
                          }}
                        >
                          <CheckCircle className="w-2.5 h-2.5" />
                          Confirmed
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0 ${
                      item.isPublished
                        ? "bg-green-500/20 text-green-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {item.isPublished ? "Live" : "Draft"}
                  </span>
                  {/* Confirm / Unconfirm button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`w-6 h-6 flex-shrink-0 ${
                      newsConfirmations[item.newsId]
                        ? "text-green-400 hover:text-red-400"
                        : "text-muted-foreground hover:text-green-400"
                    }`}
                    title={
                      newsConfirmations[item.newsId]
                        ? "Remove official confirmation"
                        : "Mark as officially confirmed"
                    }
                    data-ocid={`admin.news.confirm_button.${i + 1}`}
                    onClick={() =>
                      newsConfirmations[item.newsId]
                        ? handleUnconfirmNews(item.newsId)
                        : handleConfirmNews(item.newsId)
                    }
                  >
                    <CheckCircle className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6 text-muted-foreground hover:text-foreground flex-shrink-0"
                    data-ocid={`admin.news.edit_button.${i + 1}`}
                    onClick={() => openEditNews(item)}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6 text-red-400 hover:text-red-300 flex-shrink-0"
                    data-ocid={`admin.news.delete_button.${i + 1}`}
                    onClick={() => setDeleteNewsId(item.newsId)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Suggestions tab (read-only between notify and players for now) */}
        {/* Players Tab */}
        <TabsContent value="players">
          <AdminPlayersTab autoOpenDialog={openPlayerDialog} />
        </TabsContent>

        {/* Referees Tab */}
        <TabsContent value="referees">
          <AdminRefereesTab />
        </TabsContent>

        {/* Awards Tab */}
        <TabsContent value="awards">
          <AdminAwardsTab />
        </TabsContent>

        {/* Officials Tab */}
        <TabsContent value="officials">
          <AdminOfficialsTab />
        </TabsContent>

        {/* Admin Settings Tab */}
        <TabsContent value="admin-settings">
          <AdminSettingsTab />
        </TabsContent>

        {/* Inbox Tab */}
        <TabsContent value="inbox">
          <AdminSuggestionsInboxTab onUnreadChange={setInboxUnread} />
        </TabsContent>

        {/* Admins Tab */}
        <TabsContent value="admins">
          <AdminsListTab />
        </TabsContent>

        {/* Recovery Tab */}
        <TabsContent value="recovery">
          <AdminRecoveryTab
            requests={recoveryRequests}
            onUpdate={() => setRecoveryRequests(getRecoveryRequests())}
          />
        </TabsContent>

        {/* Notify Tab */}
        <TabsContent value="notify">
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <h3 className="font-display font-bold text-sm text-foreground">
              Send Notification
            </h3>
            <div>
              <Label className="text-xs mb-1 block">Target Audience</Label>
              <Select value={notifTarget} onValueChange={setNotifTarget}>
                <SelectTrigger className="h-9 text-sm" data-ocid="admin.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-sm">
                    All Users
                  </SelectItem>
                  <SelectItem value="Shela" className="text-sm">
                    Shela Area
                  </SelectItem>
                  <SelectItem value="Hindi" className="text-sm">
                    Hindi Area
                  </SelectItem>
                  <SelectItem value="Mkunguni" className="text-sm">
                    Mkunguni Area
                  </SelectItem>
                  <SelectItem value="Langoni" className="text-sm">
                    Langoni Area
                  </SelectItem>
                  <SelectItem value="Mkomani" className="text-sm">
                    Mkomani Area
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1 block">Message *</Label>
              <Textarea
                value={notifMessage}
                onChange={(e) => setNotifMessage(e.target.value)}
                placeholder="Enter your notification message..."
                className="text-sm min-h-[80px] resize-none"
                data-ocid="admin.textarea"
              />
            </div>
            <Button
              className="w-full text-sm"
              onClick={handleSendNotification}
              disabled={loading}
              data-ocid="admin.notify.button"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.55 0.18 252) 0%, oklch(0.45 0.16 252) 100%)",
              }}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Bell className="w-4 h-4 mr-2" />
                  Send Notification
                </>
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* ── ADD USER DIALOG ── */}
      <Dialog
        open={showAddUser}
        onOpenChange={(open) => {
          if (!open) setShowAddUser(false);
        }}
      >
        <DialogContent data-ocid="admin.add_user.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Add New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs mb-1 block">Full Name *</Label>
              <Input
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="e.g. Hassan Mwende"
                className="h-9 text-sm"
                data-ocid="admin.add_user.input"
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Phone (optional)</Label>
              <Input
                value={newUserPhone}
                onChange={(e) => setNewUserPhone(e.target.value)}
                placeholder="+254 7XX XXX XXX"
                className="h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Email (optional)</Label>
              <Input
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="user@example.com"
                className="h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Role</Label>
              <Select value={newUserRole} onValueChange={setNewUserRole}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin" className="text-sm">
                    Admin
                  </SelectItem>
                  <SelectItem value="coach" className="text-sm">
                    Coach
                  </SelectItem>
                  <SelectItem value="player" className="text-sm">
                    Player
                  </SelectItem>
                  <SelectItem value="fan" className="text-sm">
                    Fan
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1 block">Area</Label>
              <Select value={newUserArea} onValueChange={setNewUserArea}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AREAS.map((area) => (
                    <SelectItem key={area} value={area} className="text-sm">
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddUser(false)}
              data-ocid="admin.add_user.cancel_button"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAddUser}
              disabled={addUserLoading}
              data-ocid="admin.add_user.submit_button"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.6 0.22 24) 0%, oklch(0.55 0.25 20) 100%)",
              }}
            >
              {addUserLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Add User"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── ADD TEAM DIALOG ── */}
      <Dialog
        open={showAddTeam}
        onOpenChange={(open) => {
          if (!open) setShowAddTeam(false);
        }}
      >
        <DialogContent data-ocid="admin.add_team.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Add New Team</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs mb-1 block">Team Name *</Label>
              <Input
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="e.g. Shela United FC"
                className="h-9 text-sm"
                data-ocid="admin.add_team.input"
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Area</Label>
              <Select value={newTeamArea} onValueChange={setNewTeamArea}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AREAS.map((area) => (
                    <SelectItem key={area} value={area} className="text-sm">
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1 block">
                Coach Name (optional)
              </Label>
              <Input
                value={newTeamCoach}
                onChange={(e) => setNewTeamCoach(e.target.value)}
                placeholder="e.g. Omar Kiprotich"
                className="h-9 text-sm"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddTeam(false)}
              data-ocid="admin.add_team.cancel_button"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAddTeam}
              disabled={addTeamLoading}
              data-ocid="admin.add_team.submit_button"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.6 0.22 24) 0%, oklch(0.55 0.25 20) 100%)",
              }}
            >
              {addTeamLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Create Team"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── ADD NEWS DIALOG ── */}
      <Dialog
        open={showAddNews}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddNews(false);
            setNewsPhotoPreview(null);
            setNewsPhotoFile(null);
          }
        }}
      >
        <DialogContent
          className="max-h-[90vh] overflow-y-auto"
          data-ocid="admin.add_news.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">Add News Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs mb-1 block">Title *</Label>
              <Input
                value={newsTitle}
                onChange={(e) => setNewsTitle(e.target.value)}
                placeholder="News headline..."
                className="h-9 text-sm"
                data-ocid="admin.add_news.input"
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Body *</Label>
              <Textarea
                value={newsBody}
                onChange={(e) => setNewsBody(e.target.value)}
                placeholder="Write the full news story here..."
                className="text-sm min-h-[100px] resize-none"
                data-ocid="admin.add_news.textarea"
              />
            </div>
            {/* Photo Upload */}
            <div>
              <Label className="text-xs mb-1 block">Photo (optional)</Label>
              <input
                type="file"
                accept="image/*"
                ref={newsFileRef}
                className="hidden"
                onChange={handleNewsPhotoChange}
              />
              {newsPhotoPreview ? (
                <div className="relative rounded-lg overflow-hidden">
                  <img
                    src={newsPhotoPreview}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    className="absolute top-2 right-2 bg-black/60 rounded-full p-1 text-white hover:bg-black/80"
                    onClick={() => {
                      setNewsPhotoFile(null);
                      setNewsPhotoPreview(null);
                    }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="w-full h-20 rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-1.5 text-muted-foreground"
                  onClick={() => newsFileRef.current?.click()}
                  data-ocid="admin.add_news.upload_button"
                >
                  <ImageIcon className="w-5 h-5" />
                  <span className="text-xs">Click to upload photo</span>
                </button>
              )}
            </div>
            <div className="flex items-center justify-between py-1">
              <Label className="text-xs">Publish immediately</Label>
              <Switch
                checked={newsPublished}
                onCheckedChange={setNewsPublished}
                data-ocid="admin.add_news.switch"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddNews(false)}
              data-ocid="admin.add_news.cancel_button"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAddNews}
              disabled={addNewsLoading}
              data-ocid="admin.add_news.submit_button"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.6 0.22 24) 0%, oklch(0.55 0.25 20) 100%)",
              }}
            >
              {addNewsLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Publish Post"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── EDIT NEWS DIALOG ── */}
      <Dialog
        open={!!editingNews}
        onOpenChange={(open) => {
          if (!open) setEditingNews(null);
        }}
      >
        <DialogContent
          className="max-h-[90vh] overflow-y-auto"
          data-ocid="admin.edit_news.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">Edit News Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs mb-1 block">Title *</Label>
              <Input
                value={editNewsTitle}
                onChange={(e) => setEditNewsTitle(e.target.value)}
                className="h-9 text-sm"
                data-ocid="admin.edit_news.input"
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Body *</Label>
              <Textarea
                value={editNewsBody}
                onChange={(e) => setEditNewsBody(e.target.value)}
                className="text-sm min-h-[100px] resize-none"
                data-ocid="admin.edit_news.textarea"
              />
            </div>
            <div className="flex items-center justify-between py-1">
              <Label className="text-xs">Published</Label>
              <Switch
                checked={editNewsPublished}
                onCheckedChange={setEditNewsPublished}
                data-ocid="admin.edit_news.switch"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingNews(null)}
              data-ocid="admin.edit_news.cancel_button"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleEditNews}
              disabled={editNewsLoading}
              data-ocid="admin.edit_news.save_button"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.6 0.22 24) 0%, oklch(0.55 0.25 20) 100%)",
              }}
            >
              {editNewsLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── DELETE NEWS CONFIRM DIALOG ── */}
      <Dialog
        open={!!deleteNewsId}
        onOpenChange={(open) => {
          if (!open) setDeleteNewsId(null);
        }}
      >
        <DialogContent data-ocid="admin.delete_news.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">
              Delete News Post?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone. The news post will be permanently
            removed.
          </p>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteNewsId(null)}
              data-ocid="admin.delete_news.cancel_button"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDeleteNews}
              disabled={deleteNewsLoading}
              data-ocid="admin.delete_news.confirm_button"
            >
              {deleteNewsLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog
        open={!!editingUser}
        onOpenChange={(open) => {
          if (!open) setEditingUser(null);
        }}
      >
        <DialogContent data-ocid="admin.user.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs mb-1 block">Full Name</Label>
              <Input
                value={editUserName}
                onChange={(e) => setEditUserName(e.target.value)}
                className="h-9 text-sm"
                data-ocid="admin.user.input"
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Role</Label>
              <Select value={editUserRole} onValueChange={setEditUserRole}>
                <SelectTrigger
                  className="h-9 text-sm"
                  data-ocid="admin.user.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin" className="text-sm">
                    Admin
                  </SelectItem>
                  <SelectItem value="coach" className="text-sm">
                    Coach
                  </SelectItem>
                  <SelectItem value="player" className="text-sm">
                    Player
                  </SelectItem>
                  <SelectItem value="fan" className="text-sm">
                    Fan
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1 block">Area</Label>
              <Select value={editUserArea} onValueChange={setEditUserArea}>
                <SelectTrigger
                  className="h-9 text-sm"
                  data-ocid="admin.user.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AREAS.map((area) => (
                    <SelectItem key={area} value={area} className="text-sm">
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingUser(null)}
              data-ocid="admin.user.cancel_button"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveUser}
              disabled={loading}
              data-ocid="admin.user.save_button"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.6 0.22 24) 0%, oklch(0.55 0.25 20) 100%)",
              }}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Team Dialog */}
      <Dialog
        open={!!editingTeam}
        onOpenChange={(open) => {
          if (!open) {
            setEditingTeam(null);
            setEditLogoPreview(null);
          }
        }}
      >
        <DialogContent data-ocid="admin.team.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Edit Team</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs mb-1 block">Team Name</Label>
              <Input
                value={editTeamName}
                onChange={(e) => setEditTeamName(e.target.value)}
                className="h-9 text-sm"
                data-ocid="admin.team.input"
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Area</Label>
              <Select value={editTeamArea} onValueChange={setEditTeamArea}>
                <SelectTrigger
                  className="h-9 text-sm"
                  data-ocid="admin.team.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AREAS.map((area) => (
                    <SelectItem key={area} value={area} className="text-sm">
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Logo Upload */}
            <div>
              <Label className="text-xs mb-1 block">Team Logo</Label>
              <input
                type="file"
                accept="image/*"
                ref={editLogoInputRef}
                className="hidden"
                onChange={handleEditLogoChange}
              />
              {editLogoPreview ? (
                <div className="relative rounded-lg overflow-hidden w-20 h-20">
                  <img
                    src={editLogoPreview}
                    alt="Team logo"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    className="absolute top-1 right-1 bg-black/60 rounded-full p-1 text-white hover:bg-black/80"
                    onClick={() => {
                      if (editingTeam) {
                        setTeamLogo(editingTeam.teamId, "");
                        setTeamLogosState(getTeamLogos());
                      }
                      setEditLogoPreview(null);
                    }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="w-full h-16 rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-1.5 text-muted-foreground"
                  onClick={() => editLogoInputRef.current?.click()}
                  data-ocid="admin.edit_team.upload_button"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span className="text-xs">Upload logo</span>
                </button>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingTeam(null);
                setEditLogoPreview(null);
              }}
              data-ocid="admin.team.cancel_button"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveTeam}
              disabled={loading}
              data-ocid="admin.team.save_button"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.6 0.22 24) 0%, oklch(0.55 0.25 20) 100%)",
              }}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Team Confirm */}
      <Dialog
        open={!!deletingTeamId}
        onOpenChange={(o) => {
          if (!o) {
            setDeletingTeamId(null);
            setDeletingTeamName("");
          }
        }}
      >
        <DialogContent data-ocid="admin.delete_team.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Remove Team?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Remove <strong>{deletingTeamName}</strong> from the list? This
            cannot be undone.
          </p>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeletingTeamId(null)}
              data-ocid="admin.delete_team.cancel_button"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDeleteTeam}
              disabled={deleteTeamLoading}
              data-ocid="admin.delete_team.confirm_button"
            >
              {deleteTeamLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Remove"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Match Dialog */}
      <Dialog
        open={!!editingMatch}
        onOpenChange={(open) => {
          if (!open) setEditingMatch(null);
        }}
      >
        <DialogContent data-ocid="admin.match.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Edit Match</DialogTitle>
          </DialogHeader>
          {editingMatch &&
            (() => {
              const home = backendTeamsForMatch.find(
                (t) => t.teamId === editingMatch.homeTeam,
              );
              const away = backendTeamsForMatch.find(
                (t) => t.teamId === editingMatch.awayTeam,
              );
              return (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground text-center font-semibold">
                    {home?.name} <span className="text-foreground">vs</span>{" "}
                    {away?.name}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs mb-1 block">
                        {home?.name} Score
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        value={editHomeScore}
                        onChange={(e) => setEditHomeScore(e.target.value)}
                        className="h-9 text-sm text-center"
                        data-ocid="admin.match.input"
                      />
                    </div>
                    <div>
                      <Label className="text-xs mb-1 block">
                        {away?.name} Score
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        value={editAwayScore}
                        onChange={(e) => setEditAwayScore(e.target.value)}
                        className="h-9 text-sm text-center"
                        data-ocid="admin.match.input"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">Status</Label>
                    <Select
                      value={editMatchStatus}
                      onValueChange={(v) =>
                        setEditMatchStatus(v as "scheduled" | "live" | "played")
                      }
                    >
                      <SelectTrigger
                        className="h-9 text-sm"
                        data-ocid="admin.match.select"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scheduled" className="text-sm">
                          Scheduled
                        </SelectItem>
                        <SelectItem value="live" className="text-sm">
                          Live
                        </SelectItem>
                        <SelectItem value="played" className="text-sm">
                          Played
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">Referee</Label>
                    <Select
                      value={editMatchRefereeId || "__none__"}
                      onValueChange={(v) =>
                        setEditMatchRefereeId(v === "__none__" ? "" : v)
                      }
                    >
                      <SelectTrigger
                        className="h-9 text-sm"
                        data-ocid="admin.match.referee_edit.select"
                      >
                        <SelectValue placeholder="Assign a referee..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          value="__none__"
                          className="text-sm text-muted-foreground"
                        >
                          — No referee assigned —
                        </SelectItem>
                        {getReferees()
                          .filter((r) => r.isActive)
                          .map((r) => (
                            <SelectItem
                              key={r.refereeId}
                              value={r.refereeId}
                              className="text-sm"
                            >
                              {r.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">Pitch</Label>
                    <Select
                      value={editMatchPitchId || "__none__"}
                      onValueChange={(v) =>
                        setEditMatchPitchId(v === "__none__" ? "" : v)
                      }
                    >
                      <SelectTrigger
                        className="h-9 text-sm"
                        data-ocid="admin.match.pitch_edit.select"
                      >
                        <SelectValue placeholder="Select a pitch..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          value="__none__"
                          className="text-sm text-muted-foreground"
                        >
                          — No pitch assigned —
                        </SelectItem>
                        {getPitches().map((p) => (
                          <SelectItem
                            key={p.pitchId}
                            value={p.pitchId}
                            className="text-sm"
                          >
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              );
            })()}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingMatch(null)}
              data-ocid="admin.match.cancel_button"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveMatch}
              disabled={loading}
              data-ocid="admin.match.save_button"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.6 0.22 24) 0%, oklch(0.55 0.25 20) 100%)",
              }}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hidden file input for team logo */}
      <input
        type="file"
        accept="image/*"
        ref={teamLogoInputRef}
        className="hidden"
        onChange={handleTeamLogoChange}
      />

      {/* Create Match Dialog */}
      <Dialog
        open={showCreateMatch}
        onOpenChange={(open) => {
          setShowCreateMatch(open);
          if (!open) {
            setMatchRefereeId("");
            setMatchPitchId("");
          }
        }}
      >
        <DialogContent data-ocid="admin.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">
              Schedule New Match
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {backendTeamsForMatch.length === 0 &&
              !backendTeamsForMatchLoading && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-amber-500/40 bg-amber-500/10 text-xs text-amber-400">
                  <Info className="w-3 h-3 flex-shrink-0" />
                  No teams on-chain yet. Add a team in the Teams tab first.
                </div>
              )}
            <div>
              <Label className="text-xs mb-1 block">Home Team *</Label>
              {backendTeamsForMatchLoading ? (
                <div className="flex items-center gap-2 h-9 px-3 rounded-md border border-border bg-muted/20 text-xs text-muted-foreground">
                  <Loader2 className="w-3 h-3 animate-spin" /> Loading teams...
                </div>
              ) : (
                <Select value={homeTeam} onValueChange={setHomeTeam}>
                  <SelectTrigger
                    className="h-9 text-sm"
                    data-ocid="admin.select"
                  >
                    <SelectValue placeholder="Select home team..." />
                  </SelectTrigger>
                  <SelectContent>
                    {backendTeamsForMatch.map((t) => (
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
              )}
            </div>
            <div>
              <Label className="text-xs mb-1 block">Away Team *</Label>
              {backendTeamsForMatchLoading ? (
                <div className="flex items-center gap-2 h-9 px-3 rounded-md border border-border bg-muted/20 text-xs text-muted-foreground">
                  <Loader2 className="w-3 h-3 animate-spin" /> Loading teams...
                </div>
              ) : (
                <Select value={awayTeam} onValueChange={setAwayTeam}>
                  <SelectTrigger
                    className="h-9 text-sm"
                    data-ocid="admin.select"
                  >
                    <SelectValue placeholder="Select away team..." />
                  </SelectTrigger>
                  <SelectContent>
                    {backendTeamsForMatch.map((t) => (
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
              )}
            </div>
            <div>
              <Label className="text-xs mb-1 block">Match Date & Time *</Label>
              <Input
                type="datetime-local"
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
                className="h-9 text-sm"
                data-ocid="admin.input"
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Referee (optional)</Label>
              <Select
                value={matchRefereeId || "__none__"}
                onValueChange={(v) =>
                  setMatchRefereeId(v === "__none__" ? "" : v)
                }
              >
                <SelectTrigger
                  className="h-9 text-sm"
                  data-ocid="admin.match.referee.select"
                >
                  <SelectValue placeholder="Assign a referee..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="__none__"
                    className="text-sm text-muted-foreground"
                  >
                    — No referee assigned —
                  </SelectItem>
                  {getReferees()
                    .filter((r) => r.isActive)
                    .map((r) => (
                      <SelectItem
                        key={r.refereeId}
                        value={r.refereeId}
                        className="text-sm"
                      >
                        {r.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1 block">Pitch (optional)</Label>
              <Select
                value={matchPitchId || "__none__"}
                onValueChange={(v) =>
                  setMatchPitchId(v === "__none__" ? "" : v)
                }
              >
                <SelectTrigger
                  className="h-9 text-sm"
                  data-ocid="admin.match.pitch.select"
                >
                  <SelectValue placeholder="Select a pitch..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="__none__"
                    className="text-sm text-muted-foreground"
                  >
                    — No pitch assigned —
                  </SelectItem>
                  {getPitches().map((p) => (
                    <SelectItem
                      key={p.pitchId}
                      value={p.pitchId}
                      className="text-sm"
                    >
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreateMatch(false)}
              data-ocid="admin.cancel_button"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleCreateMatch}
              disabled={loading}
              data-ocid="admin.confirm_button"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.6 0.22 24) 0%, oklch(0.55 0.25 20) 100%)",
              }}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Schedule Match"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Match Events Dialog */}
      <Dialog
        open={showMatchEvents}
        onOpenChange={(o) => {
          if (!o) setShowMatchEvents(false);
        }}
      >
        <DialogContent
          data-ocid="admin.match_events.dialog"
          className="max-w-lg max-h-[85vh] overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle className="font-display">Match Events</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            {/* Goals */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                ⚽ Goal Events
              </p>
              <div className="space-y-1.5 mb-3">
                {currentEvents.goals.map((g, i) => (
                  <div
                    key={`goal-${i}-${g.playerName}`}
                    className="flex items-center gap-2 text-xs bg-green-500/10 rounded-lg px-2 py-1.5 border border-green-500/20"
                  >
                    <span className="text-green-400 font-bold">
                      {g.minute}'
                    </span>
                    <span className="font-semibold">{g.playerName}</span>
                    <span className="text-muted-foreground capitalize">
                      ({g.team})
                    </span>
                    <button
                      type="button"
                      className="ml-auto text-muted-foreground hover:text-red-400"
                      onClick={() => {
                        const updated = {
                          ...currentEvents,
                          goals: currentEvents.goals.filter((_, j) => j !== i),
                        };
                        setCurrentEvents(updated);
                        setMatchEvents(matchEventsMatchId, updated);
                      }}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {currentEvents.goals.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    No goals yet
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Select
                  value={newGoalTeam}
                  onValueChange={(v) => setNewGoalTeam(v as "home" | "away")}
                >
                  <SelectTrigger className="h-8 text-xs w-20 flex-shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home" className="text-xs">
                      Home
                    </SelectItem>
                    <SelectItem value="away" className="text-xs">
                      Away
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  value={newGoalPlayer}
                  onChange={(e) => setNewGoalPlayer(e.target.value)}
                  placeholder="Player name"
                  className="h-8 text-xs flex-1"
                  data-ocid="admin.match_events.goal_player.input"
                />
                <Input
                  value={newGoalMinute}
                  onChange={(e) => setNewGoalMinute(e.target.value)}
                  placeholder="Min"
                  type="number"
                  className="h-8 text-xs w-16 flex-shrink-0"
                />
                <Button
                  size="sm"
                  className="h-8 px-2"
                  onClick={addGoalEvent}
                  disabled={!newGoalPlayer.trim()}
                  data-ocid="admin.match_events.add_goal.button"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
            {/* Cards */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                🟨 Card Events
              </p>
              <div className="space-y-1.5 mb-3">
                {currentEvents.cards.map((c, i) => (
                  <div
                    key={`card-${i}-${c.playerName}`}
                    className={`flex items-center gap-2 text-xs rounded-lg px-2 py-1.5 border ${c.cardType === "red" ? "bg-red-500/10 border-red-500/20" : "bg-yellow-500/10 border-yellow-500/20"}`}
                  >
                    <span
                      className={`font-bold ${c.cardType === "red" ? "text-red-400" : "text-yellow-400"}`}
                    >
                      {c.minute}'
                    </span>
                    <span className="font-semibold">{c.playerName}</span>
                    <span className="capitalize text-muted-foreground">
                      {c.cardType}
                    </span>
                    <button
                      type="button"
                      className="ml-auto text-muted-foreground hover:text-red-400"
                      onClick={() => {
                        const updated = {
                          ...currentEvents,
                          cards: currentEvents.cards.filter((_, j) => j !== i),
                        };
                        setCurrentEvents(updated);
                        setMatchEvents(matchEventsMatchId, updated);
                      }}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {currentEvents.cards.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    No cards yet
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Select
                  value={newCardType}
                  onValueChange={(v) => setNewCardType(v as "yellow" | "red")}
                >
                  <SelectTrigger className="h-8 text-xs w-20 flex-shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yellow" className="text-xs">
                      Yellow
                    </SelectItem>
                    <SelectItem value="red" className="text-xs">
                      Red
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  value={newCardPlayer}
                  onChange={(e) => setNewCardPlayer(e.target.value)}
                  placeholder="Player name"
                  className="h-8 text-xs flex-1"
                  data-ocid="admin.match_events.card_player.input"
                />
                <Input
                  value={newCardMinute}
                  onChange={(e) => setNewCardMinute(e.target.value)}
                  placeholder="Min"
                  type="number"
                  className="h-8 text-xs w-16 flex-shrink-0"
                />
                <Button
                  size="sm"
                  className="h-8 px-2"
                  onClick={addCardEvent}
                  disabled={!newCardPlayer.trim()}
                  data-ocid="admin.match_events.add_card.button"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              size="sm"
              onClick={() => setShowMatchEvents(false)}
              data-ocid="admin.match_events.close_button"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.6 0.22 24) 0%, oklch(0.55 0.25 20) 100%)",
              }}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const adminPositionMap: Record<string, Position> = {
  goalkeeper: Position.goalkeeper,
  defender: Position.defender,
  midfielder: Position.midfielder,
  forward: Position.forward,
};

// ─── TEAMS TAB CONTENT (real backend teams only) ─────────────────────────────
function TeamsTabContent({
  setShowAddTeam,
  teamLogos,
  teamLogoInputRef,
  setLogoUploadTeamId,
  openEditTeam,
  activeTab,
  refreshTrigger,
  onDeleteTeam,
}: {
  setShowAddTeam: (v: boolean) => void;
  teamLogos: Record<string, string>;
  teamLogoInputRef: React.RefObject<HTMLInputElement | null>;
  setLogoUploadTeamId: (id: string) => void;
  openEditTeam: (team: BackendTeam) => void;
  activeTab: string;
  refreshTrigger?: number;
  onDeleteTeam: (teamId: string, teamName: string) => void;
}) {
  const { actor } = useActor();
  const [backendTeams, setBackendTeams] = useState<BackendTeam[]>([]);
  const [backendTeamsLoading, setBackendTeamsLoading] = useState(false);
  const [deletedTeamIds, setDeletedTeamIds] =
    useState<string[]>(getDeletedTeamIds);

  const fetchTeams = () => {
    // Apply overrides optimistically to current state for instant visual update
    const overrides = getTeamOverrides();
    setBackendTeams((prev) =>
      prev.map((t) => {
        const ov = overrides[t.teamId];
        return ov ? { ...t, name: ov.name, area: ov.area } : t;
      }),
    );
    // Always load local teams first, applying overrides
    const localTeams = getLocalTeams();
    const localAsBE = localTeams.map(
      (lt) =>
        ({
          teamId: lt.teamId,
          name: overrides[lt.teamId]?.name ?? lt.name,
          area: overrides[lt.teamId]?.area ?? lt.area,
          coachId: lt.coachName,
          logoUrl: "",
          wins: BigInt(0),
          losses: BigInt(0),
          draws: BigInt(0),
          goalsFor: BigInt(0),
          goalsAgainst: BigInt(0),
          isApproved: false,
        }) as BackendTeam,
    );

    if (!actor) {
      setBackendTeams(localAsBE);
      return;
    }
    setBackendTeamsLoading(true);
    actor
      .getAllTeams()
      .then((teams) => {
        // Apply overrides to backend teams too
        const processedBackend = teams.map((t) => {
          const ov = overrides[t.teamId];
          return ov ? { ...t, name: ov.name, area: ov.area } : t;
        });
        const backendIds = new Set(teams.map((t) => t.teamId));
        const extra = localAsBE.filter((lt) => !backendIds.has(lt.teamId));
        setBackendTeams([...processedBackend, ...extra]);
      })
      .catch(() => {
        setBackendTeams(localAsBE);
      })
      .finally(() => setBackendTeamsLoading(false));
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshTrigger is intentional — it signals the parent created a new team
  useEffect(() => {
    if (activeTab !== "teams") return;
    // Re-read soft-deleted ids on each refresh so deletions are immediately reflected
    setDeletedTeamIds(getDeletedTeamIds());
    fetchTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, actor, refreshTrigger]);

  const teamOverrides = getTeamOverrides();
  const visibleTeams = backendTeams.filter(
    (t) => !deletedTeamIds.includes(t.teamId),
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          className="text-[10px] text-primary hover:underline"
          onClick={fetchTeams}
          data-ocid="admin.teams.refresh.button"
        >
          Refresh
        </button>
        <Button
          size="sm"
          className="text-xs gap-1"
          onClick={() => setShowAddTeam(true)}
          data-ocid="admin.add_team.open_modal_button"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.6 0.22 24) 0%, oklch(0.55 0.25 20) 100%)",
          }}
        >
          <Plus className="w-3 h-3" />
          Add Team
        </Button>
      </div>

      {backendTeamsLoading ? (
        <div
          className="flex items-center justify-center py-10 text-muted-foreground"
          data-ocid="admin.teams.loading_state"
        >
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          <span className="text-sm">Loading teams...</span>
        </div>
      ) : visibleTeams.length === 0 ? (
        <div
          className="rounded-xl border border-border bg-card py-10 flex flex-col items-center gap-3 text-center"
          data-ocid="admin.teams.empty_state"
        >
          <Trophy className="w-10 h-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            No teams registered yet.
          </p>
          <p className="text-xs text-muted-foreground/60">
            Use the "Add Team" button above to create your first team.
          </p>
        </div>
      ) : (
        <div
          className="rounded-xl border border-border overflow-hidden bg-card"
          data-ocid="admin.teams.table"
        >
          <div className="px-3 py-2 border-b border-border bg-muted/20">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              All Teams ({visibleTeams.length})
            </span>
          </div>
          {visibleTeams.map((team, i) => {
            const overrideName = teamOverrides[team.teamId]?.name ?? team.name;
            const overrideArea = teamOverrides[team.teamId]?.area ?? team.area;
            return (
              <div
                key={team.teamId}
                className="flex items-center gap-3 px-3 py-3 border-b border-border/50 last:border-0"
                data-ocid={`admin.team.row.${i + 1}`}
              >
                <TeamBadge
                  team={{
                    teamId: team.teamId,
                    name: overrideName,
                    area: overrideArea,
                  }}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs text-foreground">
                    {overrideName}
                  </div>
                  <AreaBadge area={overrideArea} className="mt-0.5" />
                </div>
                <div className="flex items-center gap-1">
                  {team.isApproved ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400 font-bold">
                      Approved
                    </span>
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold">
                      Pending
                    </span>
                  )}
                </div>
                {/* Logo upload button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className={`w-6 h-6 transition-colors ${teamLogos[team.teamId] ? "text-green-400 hover:text-green-300" : "text-muted-foreground hover:text-foreground"}`}
                  data-ocid={`admin.team.upload_button.${i + 1}`}
                  onClick={() => {
                    setLogoUploadTeamId(team.teamId);
                    teamLogoInputRef.current?.click();
                  }}
                  title="Upload team logo"
                >
                  <ImageIcon className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6 text-muted-foreground hover:text-foreground"
                  data-ocid={`admin.team.edit_button.${i + 1}`}
                  onClick={() => openEditTeam(team)}
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6 text-red-400 hover:text-red-300"
                  data-ocid={`admin.team.delete_button.${i + 1}`}
                  onClick={() => onDeleteTeam(team.teamId, overrideName)}
                  title="Remove team"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── ADMIN PLAYERS TAB ────────────────────────────────────────────────────────
function AdminPlayersTab({ autoOpenDialog }: { autoOpenDialog?: boolean }) {
  const { actor } = useActor();
  const [confirmations, setConfirmations] = useState<Record<string, boolean>>(
    getPlayerConfirmations,
  );

  // Bulk Import state
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkCsvText, setBulkCsvText] = useState("");
  const [bulkPreview, setBulkPreview] = useState<
    Array<{
      name: string;
      position: string;
      jerseyNumber: string;
      teamId: string;
    }>
  >([]);
  const [bulkParsed, setBulkParsed] = useState(false);

  const parseBulkCsv = () => {
    const lines = bulkCsvText.trim().split("\n").filter(Boolean);
    const parsed = lines.slice(1).map((line) => {
      const [name, position, jerseyNumber, teamId] = line
        .split(",")
        .map((s) => s.trim());
      return {
        name: name ?? "",
        position: position ?? "forward",
        jerseyNumber: jerseyNumber ?? "0",
        teamId: teamId ?? "",
      };
    });
    setBulkPreview(parsed);
    setBulkParsed(true);
  };

  const confirmBulkImport = () => {
    for (const row of bulkPreview) {
      if (!row.name) continue;
      addLocalPlayer({
        playerId: `LOCAL-PLAYER-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: row.name,
        nickname: "",
        teamId: row.teamId,
        position: row.position,
        jerseyNumber: Number.parseInt(row.jerseyNumber) || 0,
        isConfirmed: false,
        createdAt: Date.now(),
      });
    }
    toast.success(`${bulkPreview.length} players imported!`);
    setShowBulkImport(false);
    setBulkCsvText("");
    setBulkPreview([]);
    setBulkParsed(false);
  };

  const downloadSampleCsv = () => {
    const csv =
      "name,position,jerseyNumber,teamId\nAhmed Hassan,forward,9,YOUR-TEAM-ID\nOmar Said,goalkeeper,1,YOUR-TEAM-ID";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lsh_players_import_sample.csv";
    a.click();
    URL.revokeObjectURL(url);
  };
  const [photos, setPhotos] = useState<Record<string, string>>(getPlayerPhotos);
  const photoInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Backend players state
  const [backendPlayers, setBackendPlayers] = useState<PlayerT[]>([]);
  const [backendPlayersLoading, setBackendPlayersLoading] = useState(false);

  // Delete player state
  const [deletingPlayerId, setDeletingPlayerId] = useState<string | null>(null);
  const [deletingPlayerName, setDeletingPlayerName] = useState<string>("");
  const [deletePlayerLoading, setDeletePlayerLoading] = useState(false);
  const [deletedPlayerIds, setDeletedPlayerIds] =
    useState<string[]>(getDeletedPlayerIds);

  const handleDeletePlayer = () => {
    if (!deletingPlayerId) return;
    setDeletePlayerLoading(true);
    if (deletingPlayerId.startsWith("LOCAL-PLAYER-")) {
      deleteLocalPlayer(deletingPlayerId);
      // Re-merge players after local deletion
      setBackendPlayers((prev) =>
        prev.filter((p) => p.playerId !== deletingPlayerId),
      );
    } else {
      softDeletePlayer(deletingPlayerId);
    }
    setDeletedPlayerIds(getDeletedPlayerIds());
    setDeletingPlayerId(null);
    setDeletingPlayerName("");
    setDeletePlayerLoading(false);
    toast.success("Player removed.");
  };

  // Backend teams state (for the team selector in Add Player dialog)
  const [backendTeams, setBackendTeams] = useState<BackendTeam[]>([]);
  const [backendTeamsLoading, setBackendTeamsLoading] = useState(false);

  // Add player dialog state — auto-open when triggered from Quick Actions
  const [showAddPlayer, setShowAddPlayer] = useState(
    () => autoOpenDialog ?? false,
  );
  const [addPlayerLoading, setAddPlayerLoading] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerNickname, setNewPlayerNickname] = useState("");
  const [newPlayerTeamId, setNewPlayerTeamId] = useState<string>("");
  const [newPlayerPosition, setNewPlayerPosition] = useState<string>("forward");
  const [newPlayerJersey, setNewPlayerJersey] = useState("");

  // Helper: merge backend + local players, deduplicating by playerId
  const mergeWithLocalPlayers = (backendList: PlayerT[]): PlayerT[] => {
    const localList = getLocalPlayers();
    const backendIds = new Set(backendList.map((p) => p.playerId));
    const extra = localList
      .filter((lp) => !backendIds.has(lp.playerId))
      .map(
        (lp) =>
          ({
            playerId: lp.playerId,
            name: lp.name,
            nickname: lp.nickname,
            teamId: lp.teamId,
            position: { [lp.position]: null } as unknown as PlayerT["position"],
            jerseyNumber: BigInt(lp.jerseyNumber),
            matchesPlayed: BigInt(0),
            goals: BigInt(0),
            assists: BigInt(0),
            yellowCards: BigInt(0),
            redCards: BigInt(0),
            userId: "official",
            isVerified: lp.isConfirmed,
          }) as PlayerT,
      );
    return [...backendList, ...extra];
  };

  const fetchBackendPlayers = async () => {
    setBackendPlayersLoading(true);
    try {
      if (!actor) {
        setBackendPlayers(mergeWithLocalPlayers([]));
        setBackendPlayersLoading(false);
        return;
      }
      const players = await actor.getAllPlayers();
      setBackendPlayers(mergeWithLocalPlayers(players));
    } catch {
      setBackendPlayers(mergeWithLocalPlayers([]));
    } finally {
      setBackendPlayersLoading(false);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: fetchBackendPlayers wraps actor safely
  useEffect(() => {
    fetchBackendPlayers();
  }, [actor]);

  // Load backend teams + local teams for the Add Player team selector.
  // Re-fetch whenever the dialog opens so teams added just before are included.
  // biome-ignore lint/correctness/useExhaustiveDependencies: showAddPlayer is intentional — re-fetch teams when dialog opens
  useEffect(() => {
    const localTeams = getLocalTeams();
    const localAsBE = localTeams.map(
      (lt) =>
        ({
          teamId: lt.teamId,
          name: lt.name,
          area: lt.area,
          coachId: lt.coachName,
          logoUrl: "",
          wins: BigInt(0),
          losses: BigInt(0),
          draws: BigInt(0),
          goalsFor: BigInt(0),
          goalsAgainst: BigInt(0),
          isApproved: false,
        }) as BackendTeam,
    );

    if (!actor) {
      setBackendTeams(localAsBE);
      return;
    }
    setBackendTeamsLoading(true);
    actor
      .getAllTeams()
      .then((teams) => {
        const backendIds = new Set(teams.map((t) => t.teamId));
        const extra = localAsBE.filter((lt) => !backendIds.has(lt.teamId));
        setBackendTeams([...teams, ...extra]);
      })
      .catch(() => setBackendTeams(localAsBE))
      .finally(() => setBackendTeamsLoading(false));
  }, [actor, showAddPlayer]);

  const toggle = (playerId: string, checked: boolean) => {
    const updated = { ...confirmations, [playerId]: checked };
    setConfirmations(updated);
    setLocalStore(LSH_PLAYER_CONFIRMATIONS_KEY, updated);
    toast.success(checked ? "Player confirmed ✓" : "Confirmation removed");
  };

  const handlePhoto = (playerId: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const updated = { ...photos, [playerId]: dataUrl };
      setPhotos(updated);
      setLocalStore(LSH_PLAYER_PHOTOS_KEY, updated);
      toast.success("Player photo uploaded!");
    };
    reader.readAsDataURL(file);
  };

  const handleAddPlayer = async () => {
    if (!newPlayerName.trim() || !newPlayerTeamId) {
      toast.error("Player name and team are required");
      return;
    }
    const positionEnum = adminPositionMap[newPlayerPosition];
    if (!positionEnum) {
      toast.error("Invalid position");
      return;
    }
    setAddPlayerLoading(true);
    try {
      let backendOk = false;
      try {
        await actor?.adminAddPlayer(
          newPlayerTeamId,
          newPlayerNickname.trim(),
          newPlayerName.trim(),
          positionEnum,
          BigInt(newPlayerJersey || 0),
        );
        backendOk = true;
      } catch {
        backendOk = false;
      }

      if (!backendOk) {
        // Local fallback for PIN-session officials
        const localId = `LOCAL-PLAYER-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        addLocalPlayer({
          playerId: localId,
          name: newPlayerName.trim(),
          nickname: newPlayerNickname.trim(),
          teamId: newPlayerTeamId,
          position: newPlayerPosition,
          jerseyNumber: Number(newPlayerJersey) || 0,
          isConfirmed: false,
          createdAt: Date.now(),
        });
        toast.warning(
          "Saved locally — log in as an Official to save permanently to the league.",
        );
      }

      toast.success(`Player "${newPlayerName}" registered!`);
      setShowAddPlayer(false);
      setNewPlayerName("");
      setNewPlayerNickname("");
      setNewPlayerTeamId("");
      setNewPlayerPosition("forward");
      setNewPlayerJersey("");
      await fetchBackendPlayers();
    } catch {
      toast.error("Failed to register player. Please try again.");
    } finally {
      setAddPlayerLoading(false);
    }
  };

  return (
    <div className="space-y-4" data-ocid="admin.players.panel">
      {/* Add Player button */}
      <div className="flex justify-end gap-2">
        <Button
          size="sm"
          variant="outline"
          className="text-xs gap-1"
          onClick={() => setShowBulkImport(true)}
          data-ocid="admin.bulk_import.open_modal_button"
        >
          <Upload className="w-3 h-3" />
          Bulk Import
        </Button>
        <Button
          size="sm"
          className="text-xs gap-1"
          onClick={() => setShowAddPlayer(true)}
          data-ocid="admin.add_player.open_modal_button"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.6 0.22 24) 0%, oklch(0.55 0.25 20) 100%)",
          }}
        >
          <Plus className="w-3 h-3" />
          Add Player
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Confirm player registrations and upload player photos.
      </p>

      {/* Backend registered players */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Registered Players
        </span>
        <button
          type="button"
          className="text-[10px] text-primary hover:underline"
          onClick={fetchBackendPlayers}
        >
          Refresh
        </button>
      </div>

      {backendPlayersLoading ? (
        <div
          className="flex items-center justify-center py-10 text-muted-foreground"
          data-ocid="admin.backend_players.loading_state"
        >
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          <span className="text-sm">Loading...</span>
        </div>
      ) : backendPlayers.length === 0 ? (
        <div
          className="rounded-xl border border-border bg-card py-10 flex flex-col items-center gap-3 text-center"
          data-ocid="admin.backend_players.empty_state"
        >
          <UserCheck className="w-10 h-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            No players registered on-chain yet.
          </p>
          <p className="text-xs text-muted-foreground/60">
            Use "Add Player" above to register the first player.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {backendPlayers
            .filter((p) => !deletedPlayerIds.includes(p.playerId))
            .map((player, i) => {
              const isConfirmed = confirmations[player.playerId] ?? false;
              const photo = photos[player.playerId];
              return (
                <div
                  key={player.playerId}
                  className="rounded-xl border bg-card px-3 py-2.5 flex items-center gap-3"
                  style={{
                    borderColor: isConfirmed
                      ? "oklch(0.55 0.18 145 / 0.4)"
                      : "oklch(0.3 0.02 252)",
                  }}
                  data-ocid={`admin.player.row.${i + 1}`}
                >
                  {photo ? (
                    <img
                      src={photo}
                      alt={player.name}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                      style={{
                        background: "oklch(0.22 0.06 252)",
                        color: "oklch(0.82 0.08 82)",
                      }}
                    >
                      {String(player.jerseyNumber)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs text-foreground">
                      {player.name}
                      {player.nickname ? (
                        <span className="text-muted-foreground font-normal">
                          {" "}
                          "{player.nickname}"
                        </span>
                      ) : null}
                    </p>
                    <p className="text-[10px] text-muted-foreground capitalize">
                      {String(player.position)} · #{String(player.jerseyNumber)}
                    </p>
                  </div>
                  {isConfirmed && (
                    <span className="text-[9px] font-bold text-green-400 px-1.5 py-0.5 rounded-full bg-green-500/10 flex-shrink-0">
                      ✓ Card
                    </span>
                  )}
                  {/* Photo upload */}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={(el) => {
                      photoInputRefs.current[player.playerId] = el;
                    }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePhoto(player.playerId, file);
                    }}
                  />
                  <button
                    type="button"
                    className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                    onClick={() =>
                      photoInputRefs.current[player.playerId]?.click()
                    }
                    data-ocid={`admin.player.upload_button.${i + 1}`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                  </button>
                  <Checkbox
                    checked={isConfirmed}
                    onCheckedChange={(v) => toggle(player.playerId, !!v)}
                    data-ocid={`admin.player.checkbox.${i + 1}`}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6 text-red-400 hover:text-red-300 flex-shrink-0"
                    data-ocid={`admin.player.delete_button.${i + 1}`}
                    onClick={() => {
                      setDeletingPlayerId(player.playerId);
                      setDeletingPlayerName(player.name);
                    }}
                    title="Remove player"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              );
            })}
        </div>
      )}

      {/* Delete Player Confirm */}
      <Dialog
        open={!!deletingPlayerId}
        onOpenChange={(o) => {
          if (!o) {
            setDeletingPlayerId(null);
            setDeletingPlayerName("");
          }
        }}
      >
        <DialogContent data-ocid="admin.delete_player.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Remove Player?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Remove <strong>{deletingPlayerName}</strong> from the registered
            list?
          </p>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeletingPlayerId(null)}
              data-ocid="admin.delete_player.cancel_button"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDeletePlayer}
              disabled={deletePlayerLoading}
              data-ocid="admin.delete_player.confirm_button"
            >
              {deletePlayerLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Remove"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Import Dialog */}
      <Dialog
        open={showBulkImport}
        onOpenChange={(o) => {
          if (!o) {
            setShowBulkImport(false);
            setBulkCsvText("");
            setBulkPreview([]);
            setBulkParsed(false);
          }
        }}
      >
        <DialogContent
          data-ocid="admin.bulk_import.dialog"
          className="max-w-lg max-h-[80vh] overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              Bulk Player Import
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Paste a CSV with columns:{" "}
              <code className="text-xs bg-muted/30 px-1 rounded">
                name,position,jerseyNumber,teamId
              </code>
            </p>
            <Button
              size="sm"
              variant="outline"
              className="text-xs gap-1 w-full"
              onClick={downloadSampleCsv}
              data-ocid="admin.bulk_import.download_button"
            >
              <Download className="w-3 h-3" />
              Download Sample CSV
            </Button>
            <div>
              <Label className="text-xs mb-1 block">CSV Data</Label>
              <Textarea
                value={bulkCsvText}
                onChange={(e) => {
                  setBulkCsvText(e.target.value);
                  setBulkParsed(false);
                }}
                placeholder={
                  "name,position,jerseyNumber,teamId\nAhmed Hassan,forward,9,TEAM-ID"
                }
                className="text-xs font-mono min-h-[120px]"
                data-ocid="admin.bulk_import.textarea"
              />
            </div>
            <Button
              size="sm"
              variant="outline"
              className="text-xs gap-1 w-full"
              onClick={parseBulkCsv}
              disabled={!bulkCsvText.trim()}
              data-ocid="admin.bulk_import.parse_button"
            >
              Preview ({bulkPreview.length} players)
            </Button>
            {bulkParsed && bulkPreview.length > 0 && (
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="px-2 py-1.5 text-left text-muted-foreground">
                        Name
                      </th>
                      <th className="px-2 py-1.5 text-left text-muted-foreground">
                        Pos
                      </th>
                      <th className="px-2 py-1.5 text-center text-muted-foreground">
                        #
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkPreview.map((row, i) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: preview table
                      <tr key={i} className="border-t border-border/40">
                        <td className="px-2 py-1.5 font-medium">
                          {row.name || (
                            <span className="text-red-400">missing</span>
                          )}
                        </td>
                        <td className="px-2 py-1.5 capitalize text-muted-foreground">
                          {row.position}
                        </td>
                        <td className="px-2 py-1.5 text-center text-muted-foreground">
                          {row.jerseyNumber}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBulkImport(false)}
              data-ocid="admin.bulk_import.cancel_button"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!bulkParsed || bulkPreview.length === 0}
              onClick={confirmBulkImport}
              data-ocid="admin.bulk_import.confirm_button"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.6 0.22 24) 0%, oklch(0.55 0.25 20) 100%)",
              }}
            >
              Import {bulkPreview.length} Players
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Player Dialog */}
      <Dialog
        open={showAddPlayer}
        onOpenChange={(o) => {
          if (!o) {
            setShowAddPlayer(false);
            setNewPlayerName("");
            setNewPlayerNickname("");
            setNewPlayerTeamId("");
            setNewPlayerPosition("forward");
            setNewPlayerJersey("");
          }
        }}
      >
        <DialogContent data-ocid="admin.add_player.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">
              Register New Player
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs mb-1 block">Full Name *</Label>
              <Input
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder="e.g. Hassan Mwende"
                className="h-9 text-sm"
                data-ocid="admin.add_player.input"
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Nickname (optional)</Label>
              <Input
                value={newPlayerNickname}
                onChange={(e) => setNewPlayerNickname(e.target.value)}
                placeholder="e.g. Rocket"
                className="h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Team *</Label>
              {backendTeamsLoading ? (
                <div className="flex items-center gap-2 h-9 px-3 rounded-md border border-border bg-muted/20 text-xs text-muted-foreground">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Loading teams...
                </div>
              ) : backendTeams.length === 0 ? (
                <div className="flex items-center gap-2 h-9 px-3 rounded-md border border-amber-500/40 bg-amber-500/10 text-xs text-amber-400">
                  <Info className="w-3 h-3 flex-shrink-0" />
                  No teams registered yet. Add a team first in the Teams tab.
                </div>
              ) : (
                <Select
                  value={newPlayerTeamId || "__none__"}
                  onValueChange={(v) =>
                    setNewPlayerTeamId(v === "__none__" ? "" : v)
                  }
                >
                  <SelectTrigger
                    className="h-9 text-sm"
                    data-ocid="admin.add_player.select"
                  >
                    <SelectValue placeholder="Select team..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value="__none__"
                      className="text-sm text-muted-foreground"
                    >
                      — Select a team —
                    </SelectItem>
                    {backendTeams.map((t) => (
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
              )}
            </div>
            <div>
              <Label className="text-xs mb-1 block">Position *</Label>
              <Select
                value={newPlayerPosition}
                onValueChange={setNewPlayerPosition}
              >
                <SelectTrigger
                  className="h-9 text-sm"
                  data-ocid="admin.add_player.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="goalkeeper" className="text-sm">
                    Goalkeeper
                  </SelectItem>
                  <SelectItem value="defender" className="text-sm">
                    Defender
                  </SelectItem>
                  <SelectItem value="midfielder" className="text-sm">
                    Midfielder
                  </SelectItem>
                  <SelectItem value="forward" className="text-sm">
                    Forward
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1 block">Jersey Number</Label>
              <Input
                type="number"
                value={newPlayerJersey}
                onChange={(e) => setNewPlayerJersey(e.target.value)}
                placeholder="e.g. 9"
                className="h-9 text-sm"
                min={1}
                max={99}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddPlayer(false)}
              data-ocid="admin.add_player.cancel_button"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAddPlayer}
              disabled={addPlayerLoading}
              data-ocid="admin.add_player.submit_button"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.6 0.22 24) 0%, oklch(0.55 0.25 20) 100%)",
              }}
            >
              {addPlayerLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Register Player"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── ADMIN REFEREES TAB ────────────────────────────────────────────────────────
function AdminRefereesTab() {
  const [referees, setReferees] = useState<Referee[]>(getReferees);
  const [showAdd, setShowAdd] = useState(false);
  const [editingRef, setEditingRef] = useState<Referee | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [isActive, setIsActive] = useState(true);

  const save = (refs: Referee[]) => {
    setReferees(refs);
    setLocalStore(LSH_REFEREES_KEY, refs);
  };

  const openAdd = () => {
    setName("");
    setContact("");
    setLicenseNumber("");
    setIsActive(true);
    setShowAdd(true);
  };

  const openEdit = (ref: Referee) => {
    setEditingRef(ref);
    setName(ref.name);
    setContact(ref.contact);
    setLicenseNumber(ref.licenseNumber);
    setIsActive(ref.isActive);
  };

  const handleAdd = () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    const newRef: Referee = {
      refereeId: `ref-${Date.now()}`,
      name: name.trim(),
      contact: contact.trim(),
      licenseNumber: licenseNumber.trim(),
      isActive,
    };
    save([...referees, newRef]);
    setShowAdd(false);
    toast.success("Referee added!");
  };

  const handleEdit = () => {
    if (!editingRef || !name.trim()) return;
    save(
      referees.map((r) =>
        r.refereeId === editingRef.refereeId
          ? {
              ...r,
              name: name.trim(),
              contact: contact.trim(),
              licenseNumber: licenseNumber.trim(),
              isActive,
            }
          : r,
      ),
    );
    setEditingRef(null);
    toast.success("Referee updated!");
  };

  const handleDelete = () => {
    if (!deleteId) return;
    save(referees.filter((r) => r.refereeId !== deleteId));
    setDeleteId(null);
    toast.success("Referee removed.");
  };

  return (
    <div data-ocid="admin.referees.panel">
      <div className="flex justify-end mb-3">
        <Button
          size="sm"
          className="text-xs gap-1"
          onClick={openAdd}
          data-ocid="admin.referees.open_modal_button"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.6 0.22 24) 0%, oklch(0.55 0.25 20) 100%)",
          }}
        >
          <Plus className="w-3 h-3" /> Add Referee
        </Button>
      </div>
      {referees.length === 0 ? (
        <div
          className="rounded-xl border border-border bg-card py-10 text-center text-sm text-muted-foreground"
          data-ocid="admin.referees.empty_state"
        >
          No referees yet.
        </div>
      ) : (
        <div className="space-y-2">
          {referees.map((ref, i) => (
            <div
              key={ref.refereeId}
              className="rounded-xl border border-border bg-card px-3 py-2.5 flex items-center gap-3"
              data-ocid={`admin.referee.row.${i + 1}`}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                style={{
                  background: "oklch(0.22 0.06 252)",
                  color: "oklch(0.82 0.08 82)",
                }}
              >
                {ref.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-xs text-foreground">
                  {ref.name}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {ref.licenseNumber} · {ref.contact}
                </p>
              </div>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${ref.isActive ? "bg-green-500/20 text-green-400" : "bg-muted text-muted-foreground"}`}
              >
                {ref.isActive ? "Active" : "Inactive"}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6"
                onClick={() => openEdit(ref)}
                data-ocid={`admin.referee.edit_button.${i + 1}`}
              >
                <Edit className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 text-red-400"
                onClick={() => setDeleteId(ref.refereeId)}
                data-ocid={`admin.referee.delete_button.${i + 1}`}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent data-ocid="admin.add_referee.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Add Referee</DialogTitle>
          </DialogHeader>
          <RefereeForm
            name={name}
            setName={setName}
            contact={contact}
            setContact={setContact}
            licenseNumber={licenseNumber}
            setLicenseNumber={setLicenseNumber}
            isActive={isActive}
            setIsActive={setIsActive}
          />
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdd(false)}
              data-ocid="admin.add_referee.cancel_button"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAdd}
              data-ocid="admin.add_referee.submit_button"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.6 0.22 24) 0%, oklch(0.55 0.25 20) 100%)",
              }}
            >
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingRef}
        onOpenChange={(o) => {
          if (!o) setEditingRef(null);
        }}
      >
        <DialogContent data-ocid="admin.edit_referee.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Edit Referee</DialogTitle>
          </DialogHeader>
          <RefereeForm
            name={name}
            setName={setName}
            contact={contact}
            setContact={setContact}
            licenseNumber={licenseNumber}
            setLicenseNumber={setLicenseNumber}
            isActive={isActive}
            setIsActive={setIsActive}
          />
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingRef(null)}
              data-ocid="admin.edit_referee.cancel_button"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleEdit}
              data-ocid="admin.edit_referee.save_button"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.6 0.22 24) 0%, oklch(0.55 0.25 20) 100%)",
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog
        open={!!deleteId}
        onOpenChange={(o) => {
          if (!o) setDeleteId(null);
        }}
      >
        <DialogContent data-ocid="admin.delete_referee.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Remove Referee?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone.
          </p>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteId(null)}
              data-ocid="admin.delete_referee.cancel_button"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDelete}
              data-ocid="admin.delete_referee.confirm_button"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RefereeForm({
  name,
  setName,
  contact,
  setContact,
  licenseNumber,
  setLicenseNumber,
  isActive,
  setIsActive,
}: {
  name: string;
  setName: (v: string) => void;
  contact: string;
  setContact: (v: string) => void;
  licenseNumber: string;
  setLicenseNumber: (v: string) => void;
  isActive: boolean;
  setIsActive: (v: boolean) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs mb-1 block">Full Name *</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-9 text-sm"
          data-ocid="admin.referee.input"
        />
      </div>
      <div>
        <Label className="text-xs mb-1 block">Contact</Label>
        <Input
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="+254 7XX XXX XXX"
          className="h-9 text-sm"
        />
      </div>
      <div>
        <Label className="text-xs mb-1 block">License Number</Label>
        <Input
          value={licenseNumber}
          onChange={(e) => setLicenseNumber(e.target.value)}
          placeholder="KFF-2024-XXX"
          className="h-9 text-sm"
        />
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-xs">Active</Label>
        <Switch
          checked={isActive}
          onCheckedChange={setIsActive}
          data-ocid="admin.referee.switch"
        />
      </div>
    </div>
  );
}

// ─── ADMIN AWARDS TAB ─────────────────────────────────────────────────────────
function AdminAwardsTab() {
  const [awards, setAwards] = useState<Award[]>(getAwards);
  const [showAdd, setShowAdd] = useState(false);
  const [editingAward, setEditingAward] = useState<Award | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientType, setRecipientType] = useState<"player" | "team">(
    "player",
  );
  const [season, setSeason] = useState("2025/26");
  const [description, setDescription] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);

  const save = (a: Award[]) => {
    setAwards(a);
    setLocalStore(LSH_AWARDS_KEY, a);
  };

  const resetForm = () => {
    setTitle("");
    setRecipientName("");
    setRecipientType("player");
    setSeason("2025/26");
    setDescription("");
    setIsConfirmed(false);
  };

  const openEdit = (a: Award) => {
    setEditingAward(a);
    setTitle(a.title);
    setRecipientName(a.recipientName);
    setRecipientType(a.recipientType);
    setSeason(a.season);
    setDescription(a.description);
    setIsConfirmed(a.isConfirmed);
  };

  const handleAdd = () => {
    if (!title.trim() || !recipientName.trim()) {
      toast.error("Title and recipient are required");
      return;
    }
    const award: Award = {
      awardId: `award-${Date.now()}`,
      title: title.trim(),
      recipientName: recipientName.trim(),
      recipientType,
      season,
      description: description.trim(),
      isConfirmed,
      awardDate: new Date().toISOString().split("T")[0],
    };
    save([...awards, award]);
    setShowAdd(false);
    resetForm();
    toast.success("Award added!");
  };

  const handleEdit = () => {
    if (!editingAward) return;
    save(
      awards.map((a) =>
        a.awardId === editingAward.awardId
          ? {
              ...a,
              title: title.trim(),
              recipientName: recipientName.trim(),
              recipientType,
              season,
              description: description.trim(),
              isConfirmed,
            }
          : a,
      ),
    );
    setEditingAward(null);
    toast.success("Award updated!");
  };

  const handleConfirm = (awardId: string) => {
    save(
      awards.map((a) =>
        a.awardId === awardId ? { ...a, isConfirmed: true } : a,
      ),
    );
    toast.success("Award confirmed! 🏆");
  };

  const handleDelete = () => {
    if (!deleteId) return;
    save(awards.filter((a) => a.awardId !== deleteId));
    setDeleteId(null);
    toast.success("Award removed.");
  };

  return (
    <div data-ocid="admin.awards.panel">
      <div className="flex justify-end mb-3">
        <Button
          size="sm"
          className="text-xs gap-1"
          onClick={() => {
            resetForm();
            setShowAdd(true);
          }}
          data-ocid="admin.awards.open_modal_button"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.6 0.22 24) 0%, oklch(0.55 0.25 20) 100%)",
          }}
        >
          <Plus className="w-3 h-3" /> Add Award
        </Button>
      </div>

      {awards.length === 0 ? (
        <div
          className="rounded-xl border border-border bg-card py-10 text-center text-sm text-muted-foreground"
          data-ocid="admin.awards.empty_state"
        >
          No awards yet.
        </div>
      ) : (
        <div className="space-y-2">
          {awards.map((award, i) => (
            <div
              key={award.awardId}
              className="rounded-xl border border-border bg-card px-3 py-2.5 flex items-center gap-3"
              data-ocid={`admin.award.row.${i + 1}`}
            >
              <div className="text-xl flex-shrink-0">🏆</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-xs text-foreground">
                  {award.title}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {award.recipientName} · {award.season}
                </p>
              </div>
              {award.isConfirmed ? (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 flex-shrink-0">
                  ✓ Confirmed
                </span>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-[9px] px-1.5 flex-shrink-0"
                  onClick={() => handleConfirm(award.awardId)}
                  data-ocid={`admin.award.confirm_button.${i + 1}`}
                >
                  Confirm
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6"
                onClick={() => openEdit(award)}
                data-ocid={`admin.award.edit_button.${i + 1}`}
              >
                <Edit className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 text-red-400"
                onClick={() => setDeleteId(award.awardId)}
                data-ocid={`admin.award.delete_button.${i + 1}`}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent
          className="max-h-[90vh] overflow-y-auto"
          data-ocid="admin.add_award.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">Add Award</DialogTitle>
          </DialogHeader>
          <AwardForm
            title={title}
            setTitle={setTitle}
            recipientName={recipientName}
            setRecipientName={setRecipientName}
            recipientType={recipientType}
            setRecipientType={setRecipientType}
            season={season}
            setSeason={setSeason}
            description={description}
            setDescription={setDescription}
            isConfirmed={isConfirmed}
            setIsConfirmed={setIsConfirmed}
          />
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdd(false)}
              data-ocid="admin.add_award.cancel_button"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAdd}
              data-ocid="admin.add_award.submit_button"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.6 0.22 24) 0%, oklch(0.55 0.25 20) 100%)",
              }}
            >
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingAward}
        onOpenChange={(o) => {
          if (!o) setEditingAward(null);
        }}
      >
        <DialogContent
          className="max-h-[90vh] overflow-y-auto"
          data-ocid="admin.edit_award.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">Edit Award</DialogTitle>
          </DialogHeader>
          <AwardForm
            title={title}
            setTitle={setTitle}
            recipientName={recipientName}
            setRecipientName={setRecipientName}
            recipientType={recipientType}
            setRecipientType={setRecipientType}
            season={season}
            setSeason={setSeason}
            description={description}
            setDescription={setDescription}
            isConfirmed={isConfirmed}
            setIsConfirmed={setIsConfirmed}
          />
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingAward(null)}
              data-ocid="admin.edit_award.cancel_button"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleEdit}
              data-ocid="admin.edit_award.save_button"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.6 0.22 24) 0%, oklch(0.55 0.25 20) 100%)",
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <Dialog
        open={!!deleteId}
        onOpenChange={(o) => {
          if (!o) setDeleteId(null);
        }}
      >
        <DialogContent data-ocid="admin.delete_award.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Delete Award?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This cannot be undone.
          </p>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteId(null)}
              data-ocid="admin.delete_award.cancel_button"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDelete}
              data-ocid="admin.delete_award.confirm_button"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AwardForm({
  title,
  setTitle,
  recipientName,
  setRecipientName,
  recipientType,
  setRecipientType,
  season,
  setSeason,
  description,
  setDescription,
  isConfirmed,
  setIsConfirmed,
}: {
  title: string;
  setTitle: (v: string) => void;
  recipientName: string;
  setRecipientName: (v: string) => void;
  recipientType: "player" | "team";
  setRecipientType: (v: "player" | "team") => void;
  season: string;
  setSeason: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  isConfirmed: boolean;
  setIsConfirmed: (v: boolean) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs mb-1 block">Award Title *</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Golden Boot"
          className="h-9 text-sm"
          data-ocid="admin.award.input"
        />
      </div>
      <div>
        <Label className="text-xs mb-1 block">Recipient Name *</Label>
        <Input
          value={recipientName}
          onChange={(e) => setRecipientName(e.target.value)}
          placeholder="Player or team name"
          className="h-9 text-sm"
        />
      </div>
      <div>
        <Label className="text-xs mb-1 block">Type</Label>
        <Select
          value={recipientType}
          onValueChange={(v) => setRecipientType(v as "player" | "team")}
        >
          <SelectTrigger className="h-9 text-sm" data-ocid="admin.award.select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="player" className="text-sm">
              Player Award
            </SelectItem>
            <SelectItem value="team" className="text-sm">
              Team Award
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs mb-1 block">Season</Label>
        <Input
          value={season}
          onChange={(e) => setSeason(e.target.value)}
          placeholder="2025/26"
          className="h-9 text-sm"
        />
      </div>
      <div>
        <Label className="text-xs mb-1 block">Description</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="text-sm min-h-[70px] resize-none"
          data-ocid="admin.award.textarea"
        />
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-xs">Confirmed</Label>
        <Switch
          checked={isConfirmed}
          onCheckedChange={setIsConfirmed}
          data-ocid="admin.award.switch"
        />
      </div>
    </div>
  );
}

// ─── ADMINS LIST TAB ──────────────────────────────────────────────────────────
function AdminsListTab() {
  const { actor } = useActor();
  const [adminUsers, setAdminUsers] = useState<
    Array<{ userId: string; name: string; area: string; email: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [myPrincipal, setMyPrincipal] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!actor) return;
    setLoading(true);
    Promise.all([actor.getAllUserProfiles(), actor.getUserIdFromCaller()])
      .then(([profiles, principalId]) => {
        const admins = profiles
          .filter((p) => {
            // Role enum: check string value
            return String(p.role).toLowerCase() === "admin";
          })
          .map((p) => ({
            userId: p.userId,
            name: p.name,
            area: p.area,
            email: p.email,
          }));
        setAdminUsers(admins);
        setMyPrincipal(principalId as string);
      })
      .catch(() => {
        setAdminUsers([]);
      })
      .finally(() => setLoading(false));
  }, [actor]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div data-ocid="admin.admins.panel" className="space-y-4">
      {/* Your Principal ID */}
      {myPrincipal && (
        <div
          className="rounded-xl border p-3"
          style={{
            borderColor: "oklch(0.55 0.18 252 / 0.4)",
            background: "oklch(0.16 0.05 252 / 0.3)",
          }}
        >
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
            Your Principal ID
          </p>
          <div className="flex items-center gap-2">
            <code className="text-[10px] text-primary font-mono flex-1 truncate">
              {myPrincipal}
            </code>
            <button
              type="button"
              onClick={() => copyToClipboard(myPrincipal, "mine")}
              className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
              data-ocid="admin.admins.copy_button"
              title="Copy your Principal ID"
            >
              <ClipboardCopy
                className={`w-3.5 h-3.5 ${copiedId === "mine" ? "text-green-400" : "text-muted-foreground"}`}
              />
            </button>
          </div>
        </div>
      )}

      {/* Admins List */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-primary" />
          <h3 className="font-display font-bold text-sm text-foreground">
            Verified Admins
          </h3>
        </div>

        {loading ? (
          <div
            className="flex items-center justify-center py-8 gap-2 text-muted-foreground"
            data-ocid="admin.admins.loading_state"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs">Loading admins...</span>
          </div>
        ) : adminUsers.length === 0 ? (
          <div
            className="rounded-xl border border-border bg-card py-10 text-center text-sm text-muted-foreground"
            data-ocid="admin.admins.empty_state"
          >
            No admin profiles found yet.
          </div>
        ) : (
          <div className="space-y-2" data-ocid="admin.admins.list">
            {adminUsers.map((user, i) => (
              <div
                key={user.userId}
                className="rounded-xl border border-border bg-card px-3 py-2.5 flex items-center gap-3"
                data-ocid={`admin.admins.item.${i + 1}`}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                  style={{
                    background: "oklch(0.22 0.06 252)",
                    color: "oklch(0.82 0.15 85)",
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-xs text-foreground">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {user.area} {user.email ? `· ${user.email}` : ""}
                  </p>
                  <code className="text-[9px] text-muted-foreground/60 font-mono truncate block">
                    {user.userId.slice(0, 30)}...
                  </code>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(user.userId, user.userId)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted transition-colors flex-shrink-0"
                  title="Copy Principal ID"
                  data-ocid={`admin.admins.copy_button.${i + 1}`}
                >
                  <ClipboardCopy
                    className={`w-3.5 h-3.5 ${copiedId === user.userId ? "text-green-400" : "text-muted-foreground"}`}
                  />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info box */}
      <div
        className="rounded-xl p-3 flex gap-2.5"
        style={{
          background: "oklch(0.18 0.05 252 / 0.4)",
          border: "1px solid oklch(0.55 0.18 252 / 0.25)",
        }}
      >
        <Info
          className="w-4 h-4 flex-shrink-0 mt-0.5"
          style={{ color: "oklch(0.72 0.18 252)" }}
        />
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          To grant admin access to a new person: they must log in with Internet
          Identity first. Then go to{" "}
          <strong className="text-foreground">Admin Panel &gt; Settings</strong>{" "}
          and use the Access Control section to authorize their Principal ID.
        </p>
      </div>
    </div>
  );
}

// ─── ADMIN OFFICIALS TAB ──────────────────────────────────────────────────────
function AdminOfficialsTab() {
  const [officials, setOfficials] = useState<Official[]>(getOfficials);
  const [showAdd, setShowAdd] = useState(false);
  const [editingOfficial, setEditingOfficial] = useState<Official | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");

  const save = (o: Official[]) => {
    setOfficials(o);
    setLocalStore(LSH_OFFICIALS_KEY, o);
  };
  const resetForm = () => {
    setName("");
    setTitle("");
    setContact("");
    setEmail("");
  };

  const openEdit = (o: Official) => {
    setEditingOfficial(o);
    setName(o.name);
    setTitle(o.title);
    setContact(o.contact);
    setEmail(o.email);
  };

  const handleAdd = () => {
    if (!name.trim() || !title.trim()) {
      toast.error("Name and title are required");
      return;
    }
    save([
      ...officials,
      {
        officialId: `off-${Date.now()}`,
        name: name.trim(),
        title: title.trim(),
        contact: contact.trim(),
        email: email.trim(),
        displayOrder: officials.length + 1,
      },
    ]);
    setShowAdd(false);
    resetForm();
    toast.success("Official added!");
  };

  const handleEdit = () => {
    if (!editingOfficial) return;
    save(
      officials.map((o) =>
        o.officialId === editingOfficial.officialId
          ? {
              ...o,
              name: name.trim(),
              title: title.trim(),
              contact: contact.trim(),
              email: email.trim(),
            }
          : o,
      ),
    );
    setEditingOfficial(null);
    toast.success("Official updated!");
  };

  const handleDelete = () => {
    if (!deleteId) return;
    save(officials.filter((o) => o.officialId !== deleteId));
    setDeleteId(null);
    toast.success("Official removed.");
  };

  return (
    <div data-ocid="admin.officials.panel">
      <div className="flex justify-end mb-3">
        <Button
          size="sm"
          className="text-xs gap-1"
          onClick={() => {
            resetForm();
            setShowAdd(true);
          }}
          data-ocid="admin.officials.open_modal_button"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.6 0.22 24) 0%, oklch(0.55 0.25 20) 100%)",
          }}
        >
          <Plus className="w-3 h-3" /> Add Official
        </Button>
      </div>
      <div className="space-y-2">
        {officials
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map((o, i) => (
            <div
              key={o.officialId}
              className="rounded-xl border border-border bg-card px-3 py-3 flex items-start gap-3"
              data-ocid={`admin.official.row.${i + 1}`}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.45 0.18 252) 0%, oklch(0.35 0.14 252) 100%)",
                  color: "oklch(0.9 0.05 82)",
                }}
              >
                {o.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-xs text-foreground">
                  {o.name}
                </p>
                <p
                  className="text-[10px]"
                  style={{ color: "oklch(0.6 0.22 24)" }}
                >
                  {o.title}
                </p>
                {o.contact && (
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3" />
                    {o.contact}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6"
                onClick={() => openEdit(o)}
                data-ocid={`admin.official.edit_button.${i + 1}`}
              >
                <Edit className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 text-red-400"
                onClick={() => setDeleteId(o.officialId)}
                data-ocid={`admin.official.delete_button.${i + 1}`}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
      </div>

      {/* Add */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent data-ocid="admin.add_official.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Add Official</DialogTitle>
          </DialogHeader>
          <OfficialForm
            name={name}
            setName={setName}
            title={title}
            setTitle={setTitle}
            contact={contact}
            setContact={setContact}
            email={email}
            setEmail={setEmail}
          />
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdd(false)}
              data-ocid="admin.add_official.cancel_button"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAdd}
              data-ocid="admin.add_official.submit_button"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.6 0.22 24) 0%, oklch(0.55 0.25 20) 100%)",
              }}
            >
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit */}
      <Dialog
        open={!!editingOfficial}
        onOpenChange={(o) => {
          if (!o) setEditingOfficial(null);
        }}
      >
        <DialogContent data-ocid="admin.edit_official.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Edit Official</DialogTitle>
          </DialogHeader>
          <OfficialForm
            name={name}
            setName={setName}
            title={title}
            setTitle={setTitle}
            contact={contact}
            setContact={setContact}
            email={email}
            setEmail={setEmail}
          />
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingOfficial(null)}
              data-ocid="admin.edit_official.cancel_button"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleEdit}
              data-ocid="admin.edit_official.save_button"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.6 0.22 24) 0%, oklch(0.55 0.25 20) 100%)",
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <Dialog
        open={!!deleteId}
        onOpenChange={(o) => {
          if (!o) setDeleteId(null);
        }}
      >
        <DialogContent data-ocid="admin.delete_official.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Remove Official?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This cannot be undone.
          </p>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteId(null)}
              data-ocid="admin.delete_official.cancel_button"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDelete}
              data-ocid="admin.delete_official.confirm_button"
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OfficialForm({
  name,
  setName,
  title,
  setTitle,
  contact,
  setContact,
  email,
  setEmail,
}: {
  name: string;
  setName: (v: string) => void;
  title: string;
  setTitle: (v: string) => void;
  contact: string;
  setContact: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs mb-1 block">Full Name *</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-9 text-sm"
          data-ocid="admin.official.input"
        />
      </div>
      <div>
        <Label className="text-xs mb-1 block">Title / Role *</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Chairman"
          className="h-9 text-sm"
        />
      </div>
      <div>
        <Label className="text-xs mb-1 block">Contact</Label>
        <Input
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="+254 7XX XXX XXX"
          className="h-9 text-sm"
        />
      </div>
      <div>
        <Label className="text-xs mb-1 block">Email</Label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="official@lamu.ke"
          className="h-9 text-sm"
        />
      </div>
    </div>
  );
}

// ─── ADMIN SUGGESTIONS INBOX TAB ─────────────────────────────────────────────
function AdminSuggestionsInboxTab({
  onUnreadChange,
}: {
  onUnreadChange: (count: number) => void;
}) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>(() =>
    getLocalStore<Suggestion[]>(LSH_SUGGESTIONS_KEY, []).sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    ),
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  const unread = suggestions.filter((s) => !s.isRead).length;

  const markRead = (id: string) => {
    const updated = suggestions.map((s) =>
      s.suggestionId === id ? { ...s, isRead: true } : s,
    );
    setSuggestions(updated);
    setLocalStore(LSH_SUGGESTIONS_KEY, updated);
    const newUnread = updated.filter((s) => !s.isRead).length;
    onUnreadChange(newUnread);
  };

  const markAllRead = () => {
    const updated = suggestions.map((s) => ({ ...s, isRead: true }));
    setSuggestions(updated);
    setLocalStore(LSH_SUGGESTIONS_KEY, updated);
    onUnreadChange(0);
  };

  const saveReply = (id: string) => {
    const reply = (replyDrafts[id] ?? "").trim();
    const updated = suggestions.map((s) =>
      s.suggestionId === id ? { ...s, officialReply: reply, isRead: true } : s,
    );
    setSuggestions(updated);
    setLocalStore(LSH_SUGGESTIONS_KEY, updated);
    const newUnread = updated.filter((s) => !s.isRead).length;
    onUnreadChange(newUnread);
    toast.success("Reply saved!");
    setExpandedId(null);
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
    // Pre-fill draft if reply already exists
    const s = suggestions.find((x) => x.suggestionId === id);
    if (s?.officialReply && !replyDrafts[id]) {
      setReplyDrafts((prev) => ({ ...prev, [id]: s.officialReply }));
    }
  };

  return (
    <div className="space-y-4" data-ocid="admin.inbox.panel">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-display font-bold text-sm text-foreground flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-primary" />
            Suggestions Inbox
          </h3>
          {unread > 0 && (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-accent/20 text-accent">
              {unread} unread
            </span>
          )}
        </div>
        {unread > 0 && (
          <Button
            size="sm"
            variant="ghost"
            className="h-6 text-[10px] text-muted-foreground"
            onClick={markAllRead}
            data-ocid="admin.inbox.mark_all.button"
          >
            Mark all read
          </Button>
        )}
      </div>

      {suggestions.length === 0 ? (
        <div
          className="rounded-xl border border-border bg-card py-10 flex flex-col items-center gap-3 text-center"
          data-ocid="admin.inbox.empty_state"
        >
          <MessageSquare className="w-8 h-8 text-muted-foreground/30" />
          <p className="text-xs text-muted-foreground">
            No submissions yet. Players & fans can submit from the Suggestions
            page.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {suggestions.map((s, i) => {
            const isExpanded = expandedId === s.suggestionId;
            const draft = replyDrafts[s.suggestionId] ?? s.officialReply ?? "";
            return (
              <motion.div
                key={s.suggestionId}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`rounded-xl border bg-card overflow-hidden transition-all ${
                  s.isRead
                    ? "border-border/40 opacity-60"
                    : "border-l-4 border-l-primary border-border/60"
                }`}
                data-ocid={`admin.suggestion.row.${i + 1}`}
              >
                <div className="px-3 py-3">
                  {/* Type + date row */}
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        s.suggestionType === "problem_report"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-blue-500/20 text-blue-400"
                      }`}
                    >
                      {s.suggestionType === "problem_report"
                        ? "⚠ Problem"
                        : "💡 Suggestion"}
                    </span>
                    {!s.isRead && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    )}
                    <span className="text-[9px] text-muted-foreground ml-auto">
                      {new Date(s.timestamp).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {/* Message */}
                  <p className="text-xs text-foreground leading-relaxed mb-2">
                    {s.message}
                  </p>

                  {/* Existing reply preview */}
                  {s.officialReply && !isExpanded && (
                    <div
                      className="rounded-lg px-3 py-2 mb-2 flex items-start gap-2"
                      style={{
                        background: "oklch(0.2 0.06 155 / 0.4)",
                        borderLeft: "3px solid oklch(0.55 0.15 155)",
                      }}
                    >
                      <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0 mt-0.5" />
                      <p className="text-[11px] text-green-300 leading-relaxed">
                        <span className="font-bold">Official reply: </span>
                        {s.officialReply}
                      </p>
                    </div>
                  )}

                  {/* Action row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-[10px] px-2 text-primary border border-primary/20"
                      onClick={() => toggleExpand(s.suggestionId)}
                      data-ocid={`admin.suggestion.expand_button.${i + 1}`}
                    >
                      {isExpanded
                        ? "Cancel"
                        : s.officialReply
                          ? "Edit Reply"
                          : "Reply"}
                    </Button>
                    {!s.isRead && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 text-[10px] px-2 text-muted-foreground"
                        onClick={() => markRead(s.suggestionId)}
                        data-ocid={`admin.suggestion.mark_read.${i + 1}`}
                      >
                        Mark read
                      </Button>
                    )}
                  </div>
                </div>

                {/* Reply composer (expanded) */}
                {isExpanded && (
                  <div
                    className="px-3 pb-3 pt-2 space-y-2 border-t border-border/40"
                    style={{ background: "oklch(0.14 0.03 252 / 0.5)" }}
                  >
                    <Label className="text-[10px] font-semibold text-muted-foreground block">
                      Official Reply
                    </Label>
                    <Textarea
                      value={draft}
                      onChange={(e) =>
                        setReplyDrafts((prev) => ({
                          ...prev,
                          [s.suggestionId]: e.target.value,
                        }))
                      }
                      placeholder="Write a reply that will be visible on the submission..."
                      className="text-xs min-h-[80px] resize-none"
                      data-ocid={`admin.suggestion.reply.textarea.${i + 1}`}
                    />
                    <Button
                      size="sm"
                      className="w-full text-xs h-7"
                      onClick={() => saveReply(s.suggestionId)}
                      disabled={!draft.trim()}
                      data-ocid={`admin.suggestion.reply.save_button.${i + 1}`}
                      style={{
                        background:
                          "linear-gradient(135deg, oklch(0.55 0.15 155) 0%, oklch(0.45 0.12 155) 100%)",
                      }}
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Save Reply
                    </Button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── ADMIN SETTINGS TAB ───────────────────────────────────────────────────────
function AdminSettingsTab() {
  const [settings, setSettings] = useState<SeasonSettings>(getSeasonSettings);
  const [pitches] = useState<Pitch[]>(getPitches);
  const [systemStatus, setSystemStatusState] = useState<SystemStatus>(() =>
    getLocalStore<SystemStatus>(LSH_SYSTEM_STATUS_KEY, {
      isActive: false,
      message: "",
    }),
  );
  const [statusMessage, setStatusMessage] = useState(systemStatus.message);
  const [savingSettings, setSavingSettings] = useState(false);
  const [appLogo, setAppLogoState] = useState<string | null>(getAppLogo);
  const appLogoInputRef = useRef<HTMLInputElement>(null);

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    await new Promise((r) => setTimeout(r, 400));
    setLocalStore(LSH_SEASON_SETTINGS_KEY, settings);
    setSavingSettings(false);
    toast.success("Season settings saved!");
  };

  const handleSaveStatus = () => {
    const updated = { ...systemStatus, message: statusMessage };
    setSystemStatusState(updated);
    setLocalStore(LSH_SYSTEM_STATUS_KEY, updated);
    toast.success("System status updated!");
  };

  const handleAppLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setAppLogo(dataUrl);
      setAppLogoState(dataUrl);
      toast.success("App logo updated! Reload the page to see it everywhere.");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-5" data-ocid="admin.settings.panel">
      {/* App Logo */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <h3 className="font-display font-bold text-sm text-foreground flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-primary" />
          App Logo
        </h3>
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-border flex-shrink-0">
            <img
              src={
                appLogo ??
                "/assets/generated/lamu-sports-hub-logo-transparent.dim_400x400.png"
              }
              alt="App Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex-1 space-y-2">
            <p className="text-xs text-muted-foreground">
              Upload a new logo for the app. It will appear in the top bar and
              login screen.
            </p>
            <div className="flex gap-2">
              <input
                type="file"
                accept="image/*"
                ref={appLogoInputRef}
                className="hidden"
                onChange={handleAppLogoChange}
              />
              <Button
                size="sm"
                variant="outline"
                className="text-xs gap-1"
                onClick={() => appLogoInputRef.current?.click()}
                data-ocid="admin.app_logo.upload_button"
              >
                <ImageIcon className="w-3 h-3" />
                Upload Logo
              </Button>
              {appLogo && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs text-red-400 hover:text-red-300"
                  onClick={() => {
                    clearAppLogo();
                    setAppLogoState(null);
                    toast.success("App logo reset to default.");
                  }}
                  data-ocid="admin.app_logo.delete_button"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Season Settings */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <h3 className="font-display font-bold text-sm text-foreground">
          Season Settings
        </h3>
        <div>
          <Label className="text-xs mb-1 block">Tournament Name</Label>
          <Input
            value={settings.tournamentName}
            onChange={(e) =>
              setSettings((p) => ({ ...p, tournamentName: e.target.value }))
            }
            className="h-9 text-sm"
            data-ocid="admin.season.tournament.input"
          />
        </div>
        <div>
          <Label className="text-xs mb-1 block">Season Name</Label>
          <Input
            value={settings.seasonName}
            onChange={(e) =>
              setSettings((p) => ({ ...p, seasonName: e.target.value }))
            }
            className="h-9 text-sm"
            data-ocid="admin.season.name.input"
          />
        </div>
        <div>
          <Label className="text-xs mb-1 block">Current Year</Label>
          <Input
            value={settings.currentYear}
            onChange={(e) =>
              setSettings((p) => ({ ...p, currentYear: e.target.value }))
            }
            className="h-9 text-sm"
            data-ocid="admin.season.year.input"
          />
        </div>
        <Button
          size="sm"
          className="w-full text-xs"
          onClick={handleSaveSettings}
          disabled={savingSettings}
          data-ocid="admin.season.save_button"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.6 0.22 24) 0%, oklch(0.55 0.25 20) 100%)",
          }}
        >
          {savingSettings ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            "Save Season Settings"
          )}
        </Button>
      </div>

      {/* System Status */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <h3 className="font-display font-bold text-sm text-foreground">
          System Status Banner
        </h3>
        <div className="flex items-center justify-between">
          <Label className="text-xs">Show banner on homepage</Label>
          <Switch
            checked={systemStatus.isActive}
            onCheckedChange={(v) => {
              const updated = { ...systemStatus, isActive: v };
              setSystemStatusState(updated);
              setLocalStore(LSH_SYSTEM_STATUS_KEY, updated);
            }}
            data-ocid="admin.system_status.switch"
          />
        </div>
        <div>
          <Label className="text-xs mb-1 block">Banner Message</Label>
          <Textarea
            value={statusMessage}
            onChange={(e) => setStatusMessage(e.target.value)}
            placeholder="e.g. Matchday 7 has been postponed due to weather..."
            className="text-sm min-h-[60px] resize-none"
            data-ocid="admin.system_status.textarea"
          />
        </div>
        <Button
          size="sm"
          className="w-full text-xs"
          onClick={handleSaveStatus}
          data-ocid="admin.system_status.save_button"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.55 0.18 252) 0%, oklch(0.45 0.16 252) 100%)",
          }}
        >
          Save Status
        </Button>
      </div>

      {/* Pitches */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="font-display font-bold text-sm text-foreground mb-3">
          Pitches
        </h3>
        <div className="space-y-2">
          {pitches.map((pitch, i) => (
            <div
              key={pitch.pitchId}
              className="flex items-center gap-3 py-2 border-b border-border/40 last:border-0"
              data-ocid={`admin.pitch.row.${i + 1}`}
            >
              <span className="text-lg">🏟️</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-xs text-foreground">
                  {pitch.name}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {pitch.surface} · Cap. {pitch.capacity}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inbox note */}
      <div
        className="rounded-xl border border-primary/20 p-3 flex items-center gap-3"
        style={{ background: "oklch(0.18 0.05 252 / 0.4)" }}
      >
        <MessageSquare className="w-4 h-4 text-primary flex-shrink-0" />
        <p className="text-xs text-muted-foreground">
          Player & fan submissions are in the{" "}
          <span className="text-primary font-semibold">Suggestions Inbox</span>{" "}
          tab above.
        </p>
      </div>

      {/* Security — Official Access Code */}
      <AdminAccessCodeSection />
    </div>
  );
}

// ── OFFICIAL ACCESS CODE SECTION ─────────────────────────────────────────────
function AdminAccessCodeSection() {
  const [currentCode] = useState<string>(getOfficialCode);
  const [showEdit, setShowEdit] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [confirmCode, setConfirmCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);

  const handleSave = async () => {
    if (!newCode.trim()) {
      toast.error("Code cannot be empty.");
      return;
    }
    if (newCode.length < 4 || newCode.length > 12) {
      toast.error("Code must be 4–12 characters.");
      return;
    }
    if (!/^[a-zA-Z0-9]+$/.test(newCode)) {
      toast.error("Code must be alphanumeric (letters and numbers only).");
      return;
    }
    if (newCode !== confirmCode) {
      toast.error("Codes do not match.");
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 350));
    setOfficialCode(newCode);
    setSaving(false);
    setShowEdit(false);
    setNewCode("");
    setConfirmCode("");
    toast.success("Official access code updated!", {
      description: "Share the new code privately with officials only.",
    });
  };

  return (
    <div
      className="rounded-xl border p-4 space-y-3"
      style={{
        borderColor: "oklch(0.35 0.08 252)",
        background: "oklch(0.12 0.04 252 / 0.5)",
      }}
      data-ocid="admin.security.panel"
    >
      <div className="flex items-center gap-2">
        <KeyRound
          className="w-4 h-4"
          style={{ color: "oklch(0.65 0.12 252)" }}
        />
        <h3 className="font-display font-bold text-sm text-foreground">
          Official Access Code
        </h3>
      </div>

      <div
        className="rounded-lg px-3 py-2.5 flex items-center justify-between"
        style={{ background: "oklch(0.1 0.03 248 / 0.6)" }}
      >
        <div>
          <p className="text-[10px] text-muted-foreground mb-0.5">
            Current code
          </p>
          <p className="font-mono font-bold text-sm tracking-widest text-foreground">
            {showCurrent ? currentCode : "•".repeat(currentCode.length)}
          </p>
        </div>
        <button
          type="button"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded"
          onClick={() => setShowCurrent((v) => !v)}
          data-ocid="admin.security.toggle_code.button"
        >
          {showCurrent ? "Hide" : "Show"}
        </button>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Current access code is known only to officials. Share it privately.
      </p>

      {!showEdit ? (
        <Button
          size="sm"
          variant="outline"
          className="w-full text-xs"
          onClick={() => setShowEdit(true)}
          data-ocid="admin.security.edit_code.button"
          style={{
            borderColor: "oklch(0.35 0.08 252)",
            color: "oklch(0.65 0.12 252)",
          }}
        >
          <Edit className="w-3 h-3 mr-1.5" />
          Change Access Code
        </Button>
      ) : (
        <div className="space-y-3">
          <div>
            <Label className="text-xs mb-1 block">
              New Code (4–12 alphanumeric chars)
            </Label>
            <Input
              type="password"
              placeholder="New code…"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              className="h-9 text-sm font-mono tracking-widest"
              maxLength={12}
              data-ocid="admin.security.new_code.input"
            />
          </div>
          <div>
            <Label className="text-xs mb-1 block">Confirm New Code</Label>
            <Input
              type="password"
              placeholder="Confirm code…"
              value={confirmCode}
              onChange={(e) => setConfirmCode(e.target.value)}
              className="h-9 text-sm font-mono tracking-widest"
              maxLength={12}
              data-ocid="admin.security.confirm_code.input"
            />
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs"
              onClick={() => {
                setShowEdit(false);
                setNewCode("");
                setConfirmCode("");
              }}
              data-ocid="admin.security.cancel_code.button"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="flex-1 text-xs"
              onClick={handleSave}
              disabled={saving}
              data-ocid="admin.security.save_code.button"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.55 0.18 252) 0%, oklch(0.45 0.16 252) 100%)",
              }}
            >
              {saving ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                "Save Code"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ADMIN RECOVERY TAB ────────────────────────────────────────────────────────
function AdminRecoveryTab({
  requests,
  onUpdate,
}: {
  requests: RecoveryRequest[];
  onUpdate: () => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>(() =>
    requests.reduce<Record<string, string>>((acc, r) => {
      acc[r.ticketId] = r.adminReply;
      return acc;
    }, {}),
  );
  const [savingId, setSavingId] = useState<string | null>(null);

  const handleSaveReply = async (ticketId: string) => {
    setSavingId(ticketId);
    await new Promise((r) => setTimeout(r, 400));
    updateRecoveryRequest(ticketId, {
      adminReply: replyDrafts[ticketId] ?? "",
    });
    onUpdate();
    setSavingId(null);
    toast.success("Reply saved!");
  };

  const handleResolve = (ticketId: string) => {
    updateRecoveryRequest(ticketId, { status: "resolved" });
    onUpdate();
    toast.success("Request marked as resolved.");
  };

  const handleReject = (ticketId: string) => {
    updateRecoveryRequest(ticketId, { status: "rejected" });
    onUpdate();
    toast.success("Request marked as rejected.");
  };

  const statusBadge = (status: RecoveryRequest["status"]) => {
    if (status === "pending")
      return (
        <span
          className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
          style={{
            background: "oklch(0.75 0.18 82 / 0.2)",
            color: "oklch(0.65 0.18 82)",
          }}
        >
          Pending
        </span>
      );
    if (status === "resolved")
      return (
        <span
          className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
          style={{
            background: "oklch(0.65 0.15 155 / 0.2)",
            color: "oklch(0.65 0.15 155)",
          }}
        >
          Resolved
        </span>
      );
    return (
      <span
        className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
        style={{
          background: "oklch(0.6 0.22 24 / 0.15)",
          color: "oklch(0.6 0.22 24)",
        }}
      >
        Rejected
      </span>
    );
  };

  if (requests.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-12 rounded-xl border border-border text-center gap-3"
        data-ocid="admin.recovery.empty_state"
        style={{ background: "oklch(0.14 0.04 255 / 0.5)" }}
      >
        <KeyRound className="w-8 h-8 text-muted-foreground opacity-50" />
        <p className="text-sm font-medium text-muted-foreground">
          No recovery requests yet
        </p>
        <p className="text-xs text-muted-foreground/60 max-w-[200px]">
          Requests submitted by users at /recovery will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Recovery Requests ({requests.length})
        </span>
        <span
          className="text-[9px] font-bold px-2 py-0.5 rounded-full"
          style={{
            background: "oklch(0.75 0.18 82 / 0.2)",
            color: "oklch(0.65 0.18 82)",
          }}
        >
          {requests.filter((r) => r.status === "pending").length} pending
        </span>
      </div>

      {requests.map((req, i) => (
        <div
          key={req.ticketId}
          className="rounded-xl border overflow-hidden"
          data-ocid={`admin.recovery.item.${i + 1}`}
          style={{
            background: "oklch(0.14 0.04 255 / 0.7)",
            borderColor:
              req.status === "pending"
                ? "oklch(0.75 0.18 82 / 0.3)"
                : req.status === "resolved"
                  ? "oklch(0.65 0.15 155 / 0.3)"
                  : "oklch(0.6 0.22 24 / 0.3)",
          }}
        >
          {/* Row header */}
          <button
            type="button"
            className="w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-white/5 transition-colors"
            onClick={() =>
              setExpandedId(expandedId === req.ticketId ? null : req.ticketId)
            }
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "oklch(0.55 0.18 252 / 0.15)" }}
            >
              <KeyRound
                className="w-3.5 h-3.5"
                style={{ color: "oklch(0.55 0.18 252)" }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[10px] font-bold text-foreground">
                  {req.ticketId}
                </span>
                {statusBadge(req.status)}
              </div>
              <p className="text-[10px] text-muted-foreground truncate">
                {req.name} · {req.contact}
              </p>
            </div>
            <span className="text-[9px] text-muted-foreground flex-shrink-0">
              {new Date(req.submittedAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
              })}
            </span>
          </button>

          {/* Expanded section */}
          {expandedId === req.ticketId && (
            <div
              className="px-3 pb-4 pt-2 space-y-3 border-t"
              style={{ borderColor: "oklch(0.25 0.05 252)" }}
            >
              {/* Details */}
              <div
                className="rounded-lg p-2.5 space-y-1.5"
                style={{ background: "oklch(0.1 0.03 248 / 0.5)" }}
              >
                {req.lastPrincipalId && (
                  <div className="flex gap-2">
                    <span className="text-[9px] text-muted-foreground w-16 flex-shrink-0 pt-0.5">
                      Principal
                    </span>
                    <span className="text-[9px] font-mono text-foreground break-all">
                      {req.lastPrincipalId}
                    </span>
                  </div>
                )}
                <div className="flex gap-2">
                  <span className="text-[9px] text-muted-foreground w-16 flex-shrink-0 pt-0.5">
                    Issue
                  </span>
                  <span className="text-[9px] text-foreground leading-relaxed">
                    {req.issueDescription}
                  </span>
                </div>
              </div>

              {/* Admin reply */}
              <div>
                <Label className="text-[9px] mb-1 block text-muted-foreground uppercase tracking-wide">
                  Official Reply
                </Label>
                <Textarea
                  data-ocid={`admin.recovery.reply_textarea.${i + 1}`}
                  value={replyDrafts[req.ticketId] ?? ""}
                  onChange={(e) =>
                    setReplyDrafts((prev) => ({
                      ...prev,
                      [req.ticketId]: e.target.value,
                    }))
                  }
                  placeholder="Type your reply to this user..."
                  className="text-xs min-h-[60px] resize-none"
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  className="text-[9px] h-7 px-2 gap-1"
                  onClick={() => handleSaveReply(req.ticketId)}
                  disabled={savingId === req.ticketId}
                  data-ocid={`admin.recovery.save_reply_button.${i + 1}`}
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.55 0.18 252) 0%, oklch(0.45 0.16 252) 100%)",
                  }}
                >
                  {savingId === req.ticketId ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <CheckCircle className="w-3 h-3" />
                  )}
                  Save Reply
                </Button>
                {req.status !== "resolved" && (
                  <Button
                    size="sm"
                    className="text-[9px] h-7 px-2 gap-1"
                    onClick={() => handleResolve(req.ticketId)}
                    data-ocid={`admin.recovery.resolve_button.${i + 1}`}
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.65 0.15 155) 0%, oklch(0.55 0.13 155) 100%)",
                    }}
                  >
                    <CheckCircle className="w-3 h-3" />
                    Mark Resolved
                  </Button>
                )}
                {req.status !== "rejected" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-[9px] h-7 px-2 gap-1 border-border/50"
                    onClick={() => handleReject(req.ticketId)}
                    data-ocid={`admin.recovery.reject_button.${i + 1}`}
                    style={{ color: "oklch(0.6 0.22 24)" }}
                  >
                    <XCircle className="w-3 h-3" />
                    Reject
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
