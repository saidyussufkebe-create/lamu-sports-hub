/**
 * Simple PIN-based authentication for fans, players, and coaches.
 * Data is stored in localStorage (device-local by design).
 * Officials always use Internet Identity + LSH2026 code — never this flow.
 */

export interface SimpleUserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: "fan" | "player" | "coach";
  area: string;
  pinHash: string;
  createdAt: string;
}

const SIMPLE_PROFILES_KEY = "lsh_simple_profiles";
const SIMPLE_SESSION_KEY = "lsh_simple_session";

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function hashPin(id: string, pin: string): string {
  return btoa(`${pin}:${id}`);
}

function verifyPinHash(id: string, pin: string, hash: string): boolean {
  return hashPin(id, pin) === hash;
}

// ── CRUD ──────────────────────────────────────────────────────────────────────

export function getAllSimpleProfiles(): SimpleUserProfile[] {
  try {
    const raw = localStorage.getItem(SIMPLE_PROFILES_KEY);
    return raw ? (JSON.parse(raw) as SimpleUserProfile[]) : [];
  } catch {
    return [];
  }
}

function saveAllProfiles(profiles: SimpleUserProfile[]): void {
  localStorage.setItem(SIMPLE_PROFILES_KEY, JSON.stringify(profiles));
}

export function createSimpleUser(
  name: string,
  phone: string,
  email: string,
  role: "fan" | "player" | "coach",
  area: string,
  pin: string,
): SimpleUserProfile {
  const id = generateId();
  const profile: SimpleUserProfile = {
    id,
    name: name.trim(),
    phone: phone.trim(),
    email: email.trim(),
    role,
    area,
    pinHash: hashPin(id, pin),
    createdAt: new Date().toISOString(),
  };
  const all = getAllSimpleProfiles();
  all.push(profile);
  saveAllProfiles(all);
  return profile;
}

export function verifySimpleUser(
  id: string,
  pin: string,
): SimpleUserProfile | null {
  const all = getAllSimpleProfiles();
  const profile = all.find((p) => p.id === id);
  if (!profile) return null;
  if (!verifyPinHash(id, pin, profile.pinHash)) return null;
  return profile;
}

export function updateSimpleProfile(
  id: string,
  updates: Partial<
    Pick<SimpleUserProfile, "name" | "phone" | "email" | "area" | "role">
  >,
): SimpleUserProfile | null {
  const all = getAllSimpleProfiles();
  const idx = all.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...updates };
  saveAllProfiles(all);
  return all[idx];
}

// ── Session ───────────────────────────────────────────────────────────────────

export function getActiveSimpleSession(): SimpleUserProfile | null {
  try {
    const raw = localStorage.getItem(SIMPLE_SESSION_KEY);
    if (!raw) return null;
    const stored = JSON.parse(raw) as SimpleUserProfile;
    // Verify the profile still exists in storage (not deleted)
    const all = getAllSimpleProfiles();
    const exists = all.find((p) => p.id === stored.id);
    return exists ?? null;
  } catch {
    return null;
  }
}

export function setActiveSimpleSession(profile: SimpleUserProfile): void {
  localStorage.setItem(SIMPLE_SESSION_KEY, JSON.stringify(profile));
}

export function clearSimpleSession(): void {
  localStorage.removeItem(SIMPLE_SESSION_KEY);
}
