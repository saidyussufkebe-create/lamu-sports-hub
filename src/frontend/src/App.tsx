import { Role } from "@/backend";
import { Toaster } from "@/components/ui/sonner";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

import { AboutPage } from "@/pages/AboutPage";
import { AdminPanelPage } from "@/pages/AdminPanelPage";
import { AwardsPage } from "@/pages/AwardsPage";
import { CoachDashboardPage } from "@/pages/CoachDashboardPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { ExplorePage } from "@/pages/ExplorePage";
import { HistoryPage } from "@/pages/HistoryPage";
import { LandingPage } from "@/pages/LandingPage";
import { LeaderboardPage } from "@/pages/LeaderboardPage";
import { MVPVotePage } from "@/pages/MVPVotePage";
import { MatchdayPage } from "@/pages/MatchdayPage";
import { MatchesPage } from "@/pages/MatchesPage";
import { MonetizePage } from "@/pages/MonetizePage";
import { NewsPage } from "@/pages/NewsPage";
import { NotificationsPage } from "@/pages/NotificationsPage";
import { OfficialsPage } from "@/pages/OfficialsPage";
import { OnboardingPage } from "@/pages/OnboardingPage";
import { PlayerProfilePage } from "@/pages/PlayerProfilePage";
import { PlayersPage } from "@/pages/PlayersPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { RecoveryPage } from "@/pages/RecoveryPage";
import { RecoveryStatusPage } from "@/pages/RecoveryStatusPage";
import { RefereesPage } from "@/pages/RefereesPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { StandingsPage } from "@/pages/StandingsPage";
import { SuggestionsPage } from "@/pages/SuggestionsPage";
import { TeamProfilePage } from "@/pages/TeamProfilePage";
import { TeamsPage } from "@/pages/TeamsPage";

import { BottomNav } from "@/components/layout/BottomNav";
import { TopNav } from "@/components/layout/TopNav";
import {
  clearOfficialSession,
  isOfficialSessionVerified,
} from "@/utils/localStore";
import {
  type SimpleUserProfile,
  clearSimpleSession,
  getActiveSimpleSession,
} from "@/utils/simpleAuth";
import { applyStoredTheme } from "@/utils/themeUtils";

// --- App State ---
type AppRole = "fan" | "player" | "coach" | "admin";

interface AppState {
  role: AppRole;
  favoriteTeamId: string;
  userName: string;
  hasOnboarded: boolean;
}

// Mutable callback refs so the router layout doesn't need to be recreated
// when callbacks change.
interface AppCallbacks {
  onNotificationsClick: () => void;
  onOfficialSessionVerified: () => void;
  onLockOfficialSession: () => void;
  getAppState: () => AppState;
  getIsOfficialSession: () => boolean;
  getSimpleProfile: () => SimpleUserProfile | null;
  onSimpleSignOut: () => void;
}

// --- Root Layout (with nav) ---
function AppLayout({
  callbacksRef,
}: { callbacksRef: React.RefObject<AppCallbacks> }) {
  const year = new Date().getFullYear();
  const footerLink = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`;
  const appState = callbacksRef.current!.getAppState();
  const isOfficialSession = callbacksRef.current!.getIsOfficialSession();

  return (
    <div className="min-h-screen bg-background">
      <TopNav
        onNotificationsClick={() =>
          callbacksRef.current!.onNotificationsClick()
        }
      />
      <main>
        <Outlet />
      </main>
      <footer className="pb-16 pt-6 text-center text-xs text-muted-foreground border-t border-border/40 mt-4">
        <p>
          © {year}.{" "}
          <a
            href={footerLink}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Built with ❤️ using caffeine.ai
          </a>
        </p>
        <p className="mt-1 opacity-60">Island Pride. Island Football. 🏝️</p>
      </footer>
      <BottomNav
        role={appState.role}
        isOfficialSession={isOfficialSession}
        onOfficialSessionVerified={() =>
          callbacksRef.current!.onOfficialSessionVerified()
        }
        onLockOfficialSession={() =>
          callbacksRef.current!.onLockOfficialSession()
        }
      />
    </div>
  );
}

// --- Build router ONCE — never rebuild ---
function buildRouter(callbacksRef: React.RefObject<AppCallbacks>) {
  const rootRoute = createRootRoute({
    component: () => <AppLayout callbacksRef={callbacksRef} />,
  });

  const dashboardRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: () => {
      const appState = callbacksRef.current!.getAppState();
      return (
        <DashboardPage
          favoriteTeamId={appState.favoriteTeamId}
          role={appState.role}
          userName={appState.userName}
        />
      );
    },
  });

  const standingsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/standings",
    component: StandingsPage,
  });

  const teamsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/teams",
    component: TeamsPage,
  });

  const teamProfileRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/teams/$teamId",
    component: TeamProfilePage,
  });

  const playersRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/players",
    component: PlayersPage,
  });

  const playerProfileRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/players/$playerId",
    component: PlayerProfilePage,
  });

  const newsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/news",
    component: NewsPage,
  });

  const matchesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/matches",
    component: MatchesPage,
  });

  const matchdayRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/matchday/$matchId",
    component: MatchdayPage,
  });

  const leaderboardRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/leaderboard",
    component: LeaderboardPage,
  });

  const mvpVoteRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/mvp-vote/$matchId",
    component: MVPVotePage,
  });

  const notificationsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/notifications",
    component: NotificationsPage,
  });

  const profileRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/profile",
    component: () => {
      const appState = callbacksRef.current!.getAppState();
      const simpleProfile = callbacksRef.current!.getSimpleProfile();
      return (
        <ProfilePage
          role={appState.role}
          favoriteTeamId={appState.favoriteTeamId}
          userName={appState.userName}
          simpleProfile={simpleProfile}
          onSimpleSignOut={() => callbacksRef.current!.onSimpleSignOut()}
        />
      );
    },
  });

  const coachRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/coach",
    component: CoachDashboardPage,
  });

  const adminRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/admin",
    component: AdminPanelPage,
  });

  const refereesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/referees",
    component: RefereesPage,
  });

  const awardsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/awards",
    component: AwardsPage,
  });

  const exploreRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/explore",
    component: ExplorePage,
  });

  const aboutRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/about",
    component: AboutPage,
  });

  const historyRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/history",
    component: HistoryPage,
  });

  const suggestionsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/suggestions",
    component: SuggestionsPage,
  });

  const settingsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/settings",
    component: SettingsPage,
  });

  const officialsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/officials",
    component: OfficialsPage,
  });

  const monetizeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/monetize",
    component: MonetizePage,
  });

  const recoveryRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/recovery",
    component: RecoveryPage,
  });

  const recoveryStatusRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/recovery-status",
    component: RecoveryStatusPage,
  });

  const routeTree = rootRoute.addChildren([
    dashboardRoute,
    standingsRoute,
    teamsRoute,
    teamProfileRoute,
    playersRoute,
    playerProfileRoute,
    newsRoute,
    matchesRoute,
    matchdayRoute,
    leaderboardRoute,
    mvpVoteRoute,
    notificationsRoute,
    profileRoute,
    coachRoute,
    adminRoute,
    refereesRoute,
    awardsRoute,
    exploreRoute,
    aboutRoute,
    historyRoute,
    suggestionsRoute,
    settingsRoute,
    officialsRoute,
    monetizeRoute,
    recoveryRoute,
    recoveryStatusRoute,
  ]);

  return createRouter({ routeTree });
}

// --- Main App ---
export default function App() {
  const { identity } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();

  // Apply saved theme on first render
  useEffect(() => {
    applyStoredTheme();
  }, []);

  // Check for existing simple (PIN-based) session on mount
  const initialSimpleSession = getActiveSimpleSession();

  const [appState, setAppState] = useState<AppState>({
    role: (initialSimpleSession?.role as AppRole) ?? "fan",
    favoriteTeamId: "",
    userName: initialSimpleSession?.name ?? "",
    hasOnboarded: !!initialSimpleSession,
  });
  const [roleLoading, setRoleLoading] = useState(false);
  const [profileChecked, setProfileChecked] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loginTriggered, setLoginTriggered] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  // Simple PIN session (fans, players, coaches)
  const [isSimpleUser, setIsSimpleUser] = useState(!!initialSimpleSession);
  const [simpleProfile, setSimpleProfile] = useState<SimpleUserProfile | null>(
    initialSimpleSession,
  );
  // Track official session so re-renders pick up session changes
  const [officialSession, setOfficialSession] = useState(
    isOfficialSessionVerified,
  );

  // Refresh official session state (called from BottomNav after code entry)
  const refreshOfficialSession = () => {
    setOfficialSession(isOfficialSessionVerified());
  };

  const lockOfficialSession = () => {
    clearOfficialSession();
    setOfficialSession(false);
    setAppState((prev) => ({ ...prev, role: "fan" }));
  };

  // Mutable ref so router components always read the latest state
  // without needing the router to be recreated.
  const appStateRef = useRef(appState);
  appStateRef.current = appState;
  const officialSessionRef = useRef(officialSession);
  officialSessionRef.current = officialSession;
  const showNotificationsSetterRef = useRef(setShowNotifications);
  showNotificationsSetterRef.current = setShowNotifications;
  const simpleProfileRef = useRef<SimpleUserProfile | null>(simpleProfile);
  simpleProfileRef.current = simpleProfile;

  // Placeholder — will be replaced with real fn after handleSimpleSignOut is defined
  const callbacksRef = useRef<AppCallbacks>({
    onNotificationsClick: () => showNotificationsSetterRef.current(true),
    onOfficialSessionVerified: refreshOfficialSession,
    onLockOfficialSession: lockOfficialSession,
    getAppState: () => appStateRef.current,
    getIsOfficialSession: () => officialSessionRef.current,
    getSimpleProfile: () => simpleProfileRef.current,
    onSimpleSignOut: () => {},
  });
  // Keep callbacks in sync without recreating the ref object
  callbacksRef.current.onOfficialSessionVerified = refreshOfficialSession;
  callbacksRef.current.onLockOfficialSession = lockOfficialSession;
  // Simple sign out is defined later — we assign it after declaration below

  // Build the router ONCE and never rebuild it (avoids navigation resets)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const router = useMemo(() => buildRouter(callbacksRef), []);

  // Detect role: official session alone grants admin UI access.
  // isCallerAdmin() is checked as a secondary signal but is NOT required.
  // biome-ignore lint/correctness/useExhaustiveDependencies: officialSession intentionally re-runs role check
  useEffect(() => {
    // If official session is already verified, set admin immediately — no backend check needed
    if (isOfficialSessionVerified()) {
      setAppState((prev) => ({ ...prev, role: "admin" }));
      setRoleLoading(false);
      return;
    }

    if (!actor || actorFetching) return;
    setRoleLoading(true);
    actor
      .isCallerAdmin()
      .then((isAdmin) => {
        setAppState((prev) => ({
          ...prev,
          role: isAdmin ? "admin" : "fan",
        }));
      })
      .catch(() => {
        setAppState((prev) => ({ ...prev, role: "fan" }));
      })
      .finally(() => setRoleLoading(false));
  }, [actor, actorFetching, officialSession]);

  // Check user profile when actor becomes ready after login
  // biome-ignore lint/correctness/useExhaustiveDependencies: identity triggers profile re-check on login
  useEffect(() => {
    if (!actor || actorFetching || !identity) return;
    if (profileChecked) return;
    actor
      .getCallerUserProfile()
      .then((profile) => {
        if (profile?.name) {
          setAppState((prev) => ({
            ...prev,
            userName: profile.name,
            favoriteTeamId: profile.favoriteTeamId ?? prev.favoriteTeamId,
            hasOnboarded: true,
          }));
          setProfileChecked(true);
        } else {
          // No profile — trigger onboarding
          setShowOnboarding(true);
          setProfileChecked(true);
        }
      })
      .catch(() => {
        // On error, show onboarding so user can set up their profile
        setShowOnboarding(true);
        setProfileChecked(true);
      });
  }, [actor, actorFetching, identity]);

  const handleLoginClick = () => {
    setLoginTriggered(true);
  };

  // Handle simple (PIN-based) login
  const handleSimpleLogin = (profile: SimpleUserProfile) => {
    setSimpleProfile(profile);
    setIsSimpleUser(true);
    setAppState((prev) => ({
      ...prev,
      role: profile.role as AppRole,
      userName: profile.name,
      hasOnboarded: true,
    }));
    setLoginTriggered(true);
  };

  // Sign out from simple session
  const handleSimpleSignOut = () => {
    clearSimpleSession();
    setIsSimpleUser(false);
    setSimpleProfile(null);
    setLoginTriggered(false);
    setAppState({
      role: "fan",
      favoriteTeamId: "",
      userName: "",
      hasOnboarded: false,
    });
  };
  // Wire simple sign-out into callbacksRef so ProfilePage can trigger it
  callbacksRef.current.onSimpleSignOut = handleSimpleSignOut;

  const handleOnboardingComplete = async (
    teamId: string,
    name?: string,
    email?: string,
    role?: string,
    area?: string,
  ) => {
    try {
      if (actor && name) {
        const roleMap: Record<string, Role> = {
          fan: Role.fan,
          player: Role.player,
          coach: Role.coach,
          admin: Role.admin,
        };
        await actor.createOrUpdateUserProfile(
          name,
          "",
          email ?? "",
          roleMap[role ?? "fan"] ?? Role.fan,
          area ?? "",
          teamId || null,
        );
      }
    } catch {
      // Profile save failed silently — user can update from settings
    }
    setAppState((prev) => ({
      ...prev,
      favoriteTeamId: teamId,
      userName: name ?? prev.userName,
      hasOnboarded: true,
    }));
    setShowOnboarding(false);
  };

  // Recovery pages are standalone — accessible without login
  const currentPath =
    typeof window !== "undefined" ? window.location.pathname : "";
  if (currentPath === "/recovery") {
    return (
      <>
        <RecoveryPage />
        <Toaster position="top-center" />
      </>
    );
  }
  if (currentPath === "/recovery-status") {
    return (
      <>
        <RecoveryStatusPage />
        <Toaster position="top-center" />
      </>
    );
  }

  // If not logged in (no II identity, no simple session, and login not triggered), show landing page
  if (!identity && !loginTriggered && !isSimpleUser) {
    return (
      <>
        <LandingPage
          onLogin={handleLoginClick}
          onOfficialSessionVerified={refreshOfficialSession}
          onSimpleLogin={handleSimpleLogin}
        />
        <Toaster position="top-center" />
      </>
    );
  }

  // Show role detection spinner while checking after login
  if (identity && roleLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          Verifying your access...
        </p>
        <Toaster position="top-center" />
      </div>
    );
  }

  // Show onboarding if needed (simple users skip — they already have their profile)
  if (showOnboarding && !appState.hasOnboarded && !isSimpleUser) {
    return (
      <>
        <OnboardingPage
          onComplete={(teamId, name, email, role, area) =>
            handleOnboardingComplete(teamId, name, email, role, area)
          }
        />
        <Toaster position="top-center" />
      </>
    );
  }

  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors />

      {/* Notifications slide-over */}
      <AnimatePresence>
        {showNotifications && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[60]"
              onClick={() => setShowNotifications(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-80 bg-card border-l border-border z-[70] overflow-y-auto"
            >
              <NotificationsPage />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
