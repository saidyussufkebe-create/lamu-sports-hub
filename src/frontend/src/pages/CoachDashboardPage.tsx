import { Position } from "@/backend";
import { PlayerCard } from "@/components/shared/PlayerCard";
import {
  AreaBadge,
  IslandPrideBadge,
  TeamBadge,
} from "@/components/shared/TeamBadge";
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
import { Textarea } from "@/components/ui/textarea";
import {
  MOCK_MATCHES,
  MOCK_PLAYERS,
  MOCK_TEAMS,
  type MockPlayer,
} from "@/data/mockData";
import { useActor } from "@/hooks/useActor";
import {
  LSH_PLAYER_CONFIRMATIONS_KEY,
  getPlayerConfirmations,
  getPlayerPhotos,
  setLocalStore,
} from "@/utils/localStore";
import {
  BarChart2,
  CheckSquare,
  CreditCard,
  Loader2,
  Plus,
  Printer,
  Shield,
  UserPlus,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const coachPositionMap: Record<string, Position> = {
  goalkeeper: Position.goalkeeper,
  defender: Position.defender,
  midfielder: Position.midfielder,
  forward: Position.forward,
};

const POSITIONS = ["goalkeeper", "defender", "midfielder", "forward"];

export function CoachDashboardPage() {
  const { actor } = useActor();
  // Assume coach manages team-001 (Shela United)
  const team = MOCK_TEAMS[0];
  const players = MOCK_PLAYERS.filter((p) => p.teamId === team.teamId);
  const teamMatches = MOCK_MATCHES.filter(
    (m) => m.homeTeamId === team.teamId || m.awayTeamId === team.teamId,
  );

  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [showMatchStats, setShowMatchStats] = useState(false);
  const [showBulkRegister, setShowBulkRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewCardPlayer, setViewCardPlayer] = useState<MockPlayer | null>(null);

  const [nickname, setNickname] = useState("");
  const [position, setPosition] = useState("forward");
  const [jerseyNumber, setJerseyNumber] = useState("");

  const [selectedMatch, setSelectedMatch] = useState("");
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");

  const [bulkText, setBulkText] = useState("");

  // Player confirmations
  const [confirmations, setConfirmations] = useState<Record<string, boolean>>(
    getPlayerConfirmations,
  );

  const toggleConfirmation = (playerId: string, checked: boolean) => {
    const updated = { ...confirmations, [playerId]: checked };
    setConfirmations(updated);
    setLocalStore(LSH_PLAYER_CONFIRMATIONS_KEY, updated);
    toast.success(
      checked ? "Player confirmed ✓" : "Player confirmation removed",
    );
  };

  const handleBulkRegister = async () => {
    if (!bulkText.trim()) {
      toast.error("Please enter at least one player");
      return;
    }
    const lines = bulkText
      .trim()
      .split("\n")
      .filter((l) => l.trim());
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setShowBulkRegister(false);
    setBulkText("");
    toast.success(
      `${lines.length} player${lines.length > 1 ? "s" : ""} registered to squad!`,
    );
  };

  const handleAddPlayer = async () => {
    if (!nickname || !jerseyNumber) {
      toast.error("Please fill all required fields");
      return;
    }
    const positionEnum = coachPositionMap[position];
    if (!positionEnum) {
      toast.error("Invalid position selected");
      return;
    }
    setLoading(true);
    try {
      await actor?.adminAddPlayer(
        team.teamId,
        nickname.trim(),
        nickname.trim(),
        positionEnum,
        BigInt(jerseyNumber),
      );
      toast.success("Player added to squad!");
      setShowAddPlayer(false);
      setNickname("");
      setJerseyNumber("");
    } catch {
      toast.error("Failed to add player. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitStats = async () => {
    if (!selectedMatch || !homeScore || !awayScore) {
      toast.error("Please fill all fields");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setShowMatchStats(false);
    toast.success("Match stats submitted!");
  };

  // Inject print styles
  useEffect(() => {
    const style = document.createElement("style");
    style.id = "lsh-player-card-print";
    style.textContent = `
      @media print {
        body > * { display: none !important; }
        #player-card-print { display: block !important; }
      }
      #player-card-print { display: none; }
    `;
    document.head.appendChild(style);
    return () => {
      document.getElementById("lsh-player-card-print")?.remove();
    };
  }, []);

  return (
    <div data-ocid="coach.page" className="min-h-screen pb-24 pt-14">
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
          <h1 className="font-display font-black text-2xl text-foreground">
            Coach Dashboard
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your squad and match stats
          </p>
        </motion.div>
      </div>

      {/* Officials-only notice */}
      <div
        className="mx-4 mt-3 mb-1 rounded-xl px-3 py-2 flex items-center gap-2 text-xs"
        style={{
          background: "oklch(0.55 0.18 252 / 0.12)",
          border: "1px solid oklch(0.55 0.18 252 / 0.25)",
        }}
      >
        <Shield
          className="w-3.5 h-3.5 flex-shrink-0"
          style={{ color: "oklch(0.7 0.15 252)" }}
        />
        <span style={{ color: "oklch(0.7 0.15 252)" }}>
          Player registration is managed by officials only.
        </span>
      </div>

      <div className="px-4 mt-4 space-y-5">
        {/* My Team Card */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          data-ocid="coach.team.card"
        >
          <h2 className="font-display font-bold text-sm text-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            My Team
          </h2>
          <div
            className="rounded-xl p-4 border border-border relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${team.color}33 0%, oklch(0.16 0.04 255) 70%)`,
            }}
          >
            <div className="flex items-center gap-4">
              <TeamBadge team={team} size="xl" />
              <div className="flex-1">
                <h3 className="font-display font-black text-lg text-foreground">
                  {team.name}
                </h3>
                <AreaBadge area={team.area} />
                <div className="flex gap-3 mt-2">
                  <div className="text-center">
                    <div className="font-black font-stats text-xl text-green-400">
                      {team.wins}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Wins
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-black font-stats text-xl text-yellow-400">
                      {team.draws}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Draws
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-black font-stats text-xl text-red-400">
                      {team.losses}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Losses
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-black font-stats text-xl text-foreground">
                      {players.length}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Players
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action buttons */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            className="h-16 flex-col gap-1.5 text-xs font-semibold border-primary/40 hover:border-primary text-primary"
            onClick={() => setShowAddPlayer(true)}
            data-ocid="coach.add_player.button"
          >
            <Plus className="w-5 h-5" />
            Add Player
          </Button>
          <Button
            variant="outline"
            className="h-16 flex-col gap-1.5 text-xs font-semibold border-green-400/40 hover:border-green-400 text-green-400"
            onClick={() => setShowBulkRegister(true)}
            data-ocid="coach.bulk_register.button"
          >
            <UserPlus className="w-5 h-5" />
            Bulk Register
          </Button>
          <Button
            variant="outline"
            className="h-16 flex-col gap-1.5 text-xs font-semibold border-accent/40 hover:border-accent text-accent"
            onClick={() => setShowMatchStats(true)}
            data-ocid="coach.match_stats.button"
          >
            <BarChart2 className="w-5 h-5" />
            Match Stats
          </Button>
        </div>

        {/* Squad with confirmation */}
        <div>
          <h2 className="font-display font-bold text-sm text-foreground uppercase tracking-wide mb-1 flex items-center gap-1.5">
            <CheckSquare className="w-4 h-4 text-green-400" />
            Squad — Confirm Players
          </h2>
          <p className="text-[11px] text-muted-foreground mb-3">
            Tick to confirm player registration. Confirmed players receive their
            registration card.
          </p>
          <div className="space-y-2">
            {players.map((player, i) => {
              const isConfirmed = confirmations[player.playerId] ?? false;
              return (
                <motion.div
                  key={player.playerId}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl border bg-card px-4 py-3 flex items-center gap-3"
                  style={{
                    borderColor: isConfirmed
                      ? "oklch(0.55 0.18 145 / 0.4)"
                      : "oklch(0.3 0.02 252)",
                    background: isConfirmed
                      ? "oklch(0.16 0.04 145 / 0.2)"
                      : undefined,
                  }}
                  data-ocid={`coach.player.item.${i + 1}`}
                >
                  {/* Jersey badge */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black font-stats flex-shrink-0"
                    style={{
                      backgroundColor: team.color,
                      color: team.secondaryColor,
                    }}
                  >
                    {player.jerseyNumber}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs text-foreground">
                      {player.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground capitalize">
                      {player.position} · #{player.jerseyNumber}
                    </p>
                  </div>
                  {/* Confirm + View Card */}
                  <div className="flex items-center gap-2">
                    {isConfirmed && (
                      <span className="text-[9px] font-bold text-green-400 px-1.5 py-0.5 rounded-full bg-green-500/10">
                        Confirmed
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6 text-primary hover:text-primary/80"
                      onClick={() => setViewCardPlayer(player)}
                      data-ocid={`coach.player.card.${i + 1}`}
                      title="View Player Card"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                    </Button>
                    <Checkbox
                      checked={isConfirmed}
                      onCheckedChange={(v) =>
                        toggleConfirmation(player.playerId, !!v)
                      }
                      data-ocid={`coach.player.checkbox.${i + 1}`}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Player Dialog */}
      <Dialog open={showAddPlayer} onOpenChange={setShowAddPlayer}>
        <DialogContent data-ocid="coach.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Add New Player</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs mb-1 block">Nickname / Name *</Label>
              <Input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="e.g. Rocket"
                className="h-9 text-sm"
                data-ocid="coach.input"
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Position *</Label>
              <Select value={position} onValueChange={setPosition}>
                <SelectTrigger className="h-9 text-sm" data-ocid="coach.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {POSITIONS.map((p) => (
                    <SelectItem
                      key={p}
                      value={p}
                      className="text-sm capitalize"
                    >
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1 block">Jersey Number *</Label>
              <Input
                type="number"
                value={jerseyNumber}
                onChange={(e) => setJerseyNumber(e.target.value)}
                placeholder="e.g. 9"
                className="h-9 text-sm"
                data-ocid="coach.input"
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
              data-ocid="coach.cancel_button"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAddPlayer}
              disabled={loading}
              data-ocid="coach.confirm_button"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Add Player"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Register Dialog */}
      <Dialog open={showBulkRegister} onOpenChange={setShowBulkRegister}>
        <DialogContent data-ocid="coach.bulk_register.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">
              Bulk Player Registration
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Enter one player per line in the format:{" "}
              <code className="bg-muted px-1 rounded">
                Name, Position, Jersey#
              </code>
            </p>
            <div>
              <Label className="text-xs mb-1 block">Players *</Label>
              <Textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={
                  "Hassan Mwende, forward, 9\nOmar Kiprotich, midfielder, 8\nAli Ndegwa, defender, 4"
                }
                className="text-sm min-h-[120px] font-mono resize-none"
                data-ocid="coach.bulk_register.textarea"
              />
            </div>
            <p className="text-[10px] text-muted-foreground">
              {
                bulkText
                  .trim()
                  .split("\n")
                  .filter((l) => l.trim()).length
              }{" "}
              player(s) to register
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBulkRegister(false)}
              data-ocid="coach.bulk_register.cancel_button"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleBulkRegister}
              disabled={loading}
              data-ocid="coach.bulk_register.submit_button"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.55 0.18 145) 0%, oklch(0.45 0.16 145) 100%)",
              }}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Register All"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Player ID Card Dialog */}
      <Dialog
        open={!!viewCardPlayer}
        onOpenChange={(o) => {
          if (!o) setViewCardPlayer(null);
        }}
      >
        <DialogContent
          className="max-w-sm"
          data-ocid="coach.player_card.dialog"
        >
          {viewCardPlayer &&
            (() => {
              const isConfirmed =
                confirmations[viewCardPlayer.playerId] ?? false;
              const photo = getPlayerPhotos()[viewCardPlayer.playerId];
              return (
                <>
                  {/* Printable card */}
                  <div id="player-card-print" />
                  <DialogHeader>
                    <DialogTitle className="font-display text-center">
                      Player ID Card
                    </DialogTitle>
                  </DialogHeader>
                  <div
                    className="rounded-2xl overflow-hidden border-2 mx-auto w-full"
                    style={{
                      background: `linear-gradient(135deg, ${team.color} 0%, ${team.color}bb 60%, oklch(0.14 0.06 252) 100%)`,
                      borderColor: team.secondaryColor,
                    }}
                  >
                    {/* Header bar */}
                    <div
                      className="px-4 py-2 flex items-center justify-between"
                      style={{ backgroundColor: `${team.secondaryColor}33` }}
                    >
                      <span
                        className="text-[10px] font-black uppercase tracking-widest"
                        style={{ color: team.secondaryColor }}
                      >
                        Lamu Sports Hub
                      </span>
                      <span
                        className="text-[10px] font-bold"
                        style={{ color: team.secondaryColor }}
                      >
                        {team.name}
                      </span>
                    </div>
                    {/* Body */}
                    <div className="px-5 py-4 flex gap-4 items-center">
                      {/* Photo or Jersey */}
                      {photo ? (
                        <img
                          src={photo}
                          alt={viewCardPlayer.name}
                          className="w-20 h-20 rounded-xl object-cover border-2 flex-shrink-0"
                          style={{ borderColor: team.secondaryColor }}
                        />
                      ) : (
                        <div
                          className="w-20 h-20 rounded-xl flex items-center justify-center text-3xl font-black font-stats border-2 flex-shrink-0"
                          style={{
                            backgroundColor: `${team.secondaryColor}22`,
                            color: team.secondaryColor,
                            borderColor: `${team.secondaryColor}66`,
                          }}
                        >
                          {viewCardPlayer.jerseyNumber}
                        </div>
                      )}
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p
                          className="font-display font-black text-lg leading-tight"
                          style={{ color: team.secondaryColor }}
                        >
                          {viewCardPlayer.name}
                        </p>
                        {viewCardPlayer.nickname && (
                          <p className="text-xs text-white/70">
                            "{viewCardPlayer.nickname}"
                          </p>
                        )}
                        <p className="text-xs text-white/80 capitalize mt-1">
                          {viewCardPlayer.position} · #
                          {viewCardPlayer.jerseyNumber}
                        </p>
                        <p className="text-xs text-white/60 mt-0.5">
                          {team.area} Area
                        </p>
                        {viewCardPlayer.isVerified && (
                          <IslandPrideBadge className="mt-1.5" />
                        )}
                      </div>
                    </div>
                    {/* Status stamp */}
                    <div
                      className="px-4 py-2 flex items-center justify-between border-t"
                      style={{ borderColor: `${team.secondaryColor}33` }}
                    >
                      <span
                        className={`text-xs font-black tracking-widest uppercase ${isConfirmed ? "text-green-400" : "text-yellow-400"}`}
                      >
                        {isConfirmed ? "✓ CONFIRMED" : "⏳ PENDING"}
                      </span>
                      <span className="text-[10px] text-white/40">
                        Season 2025/26
                      </span>
                    </div>
                  </div>
                  <DialogFooter className="gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewCardPlayer(null)}
                      data-ocid="coach.player_card.close_button"
                    >
                      Close
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => window.print()}
                      data-ocid="coach.player_card.print_button"
                      style={{
                        background:
                          "linear-gradient(135deg, oklch(0.6 0.22 24) 0%, oklch(0.55 0.25 20) 100%)",
                      }}
                    >
                      <Printer className="w-4 h-4 mr-1.5" />
                      Print Card
                    </Button>
                  </DialogFooter>
                </>
              );
            })()}
        </DialogContent>
      </Dialog>

      {/* Match Stats Dialog */}
      <Dialog open={showMatchStats} onOpenChange={setShowMatchStats}>
        <DialogContent data-ocid="coach.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">
              Enter Match Stats
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs mb-1 block">Select Match *</Label>
              <Select value={selectedMatch} onValueChange={setSelectedMatch}>
                <SelectTrigger className="h-9 text-sm" data-ocid="coach.select">
                  <SelectValue placeholder="Choose a match..." />
                </SelectTrigger>
                <SelectContent>
                  {teamMatches.map((m) => {
                    const home = MOCK_TEAMS.find(
                      (t) => t.teamId === m.homeTeamId,
                    )!;
                    const away = MOCK_TEAMS.find(
                      (t) => t.teamId === m.awayTeamId,
                    )!;
                    return (
                      <SelectItem
                        key={m.matchId}
                        value={m.matchId}
                        className="text-sm"
                      >
                        {home.name} vs {away.name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1 block">Home Score *</Label>
                <Input
                  type="number"
                  value={homeScore}
                  onChange={(e) => setHomeScore(e.target.value)}
                  className="h-9 text-sm"
                  data-ocid="coach.input"
                  min={0}
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Away Score *</Label>
                <Input
                  type="number"
                  value={awayScore}
                  onChange={(e) => setAwayScore(e.target.value)}
                  className="h-9 text-sm"
                  data-ocid="coach.input"
                  min={0}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMatchStats(false)}
              data-ocid="coach.cancel_button"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmitStats}
              disabled={loading}
              data-ocid="coach.confirm_button"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Submit Stats"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
