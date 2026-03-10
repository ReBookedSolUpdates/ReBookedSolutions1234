import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { UserAPSProfile } from "@/hooks/useAPSAwareCourseAssignment";

const APS_STORAGE_KEY = "userAPSProfile";
const APS_BACKUP_KEY = "apsProfileBackup";

const LEGACY_KEYS = [
  "apsSearchResults",
  "reBooked-aps-profile",
  "reBooked-aps-search-results",
  "rebookedMarketplace-aps-profile",
  "userAPSManual",
] as const;

type SaveResult = { success: boolean; source?: string; error?: string };

function isValidAPSProfile(profile: unknown): profile is UserAPSProfile {
  if (!profile || typeof profile !== "object") return false;

  const candidate = profile as Partial<UserAPSProfile>;
  if (!Array.isArray(candidate.subjects)) return false;

  const totalAPS = candidate.totalAPS ?? 0;
  return typeof totalAPS === "number" && totalAPS >= 0;
}

function clearStorageKeys() {
  localStorage.removeItem(APS_STORAGE_KEY);
  localStorage.removeItem(APS_BACKUP_KEY);
  sessionStorage.removeItem(APS_STORAGE_KEY);
  sessionStorage.removeItem("apsSearchResults");

  for (const key of LEGACY_KEYS) {
    localStorage.removeItem(key);
  }
}

export function migrateSessionToLocal(): boolean {
  try {
    const sessionProfile = sessionStorage.getItem(APS_STORAGE_KEY);
    const localProfile = localStorage.getItem(APS_STORAGE_KEY);

    if (sessionProfile && !localProfile) {
      localStorage.setItem(APS_STORAGE_KEY, sessionProfile);
      sessionStorage.removeItem(APS_STORAGE_KEY);
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

export async function saveAPSProfile(
  profile: UserAPSProfile,
  user?: User,
): Promise<SaveResult> {
  try {
    const profileWithTimestamp: UserAPSProfile & { savedAt: number } = {
      ...profile,
      lastUpdated: new Date().toISOString(),
      savedAt: Date.now(),
    };

    localStorage.setItem(APS_STORAGE_KEY, JSON.stringify(profileWithTimestamp));

    if (!user) {
      return { success: true, source: "localStorage" };
    }

    const { error } = await supabase.rpc("save_user_aps_profile", {
      profile_data: profileWithTimestamp,
      user_id: user.id,
    });

    if (error) {
      return {
        success: true,
        source: "localStorage",
        error: error.message,
      };
    }

    return { success: true, source: "database" };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

function getLocalStorageProfile(): UserAPSProfile | null {
  try {
    const stored = localStorage.getItem(APS_STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    if (isValidAPSProfile(parsed)) return parsed;

    localStorage.setItem(APS_BACKUP_KEY, stored);
    localStorage.removeItem(APS_STORAGE_KEY);
    return null;
  } catch {
    localStorage.removeItem(APS_STORAGE_KEY);
    return null;
  }
}

export function loadAPSProfile(): UserAPSProfile | null {
  try {
    migrateSessionToLocal();
    return getLocalStorageProfile();
  } catch {
    return null;
  }
}

export async function clearAPSProfile(user?: User): Promise<SaveResult> {
  try {
    clearStorageKeys();

    if (user) {
      const { error } = await supabase.rpc("clear_user_aps_profile", {
        user_id: user.id,
      });

      window.dispatchEvent(new CustomEvent("apsProfileCleared"));

      if (error) {
        return {
          success: true,
          source: "localStorage",
          error: error.message,
        };
      }

      return { success: true, source: "database" };
    }

    window.dispatchEvent(new CustomEvent("apsProfileCleared"));
    return { success: true, source: "localStorage" };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function loadAPSProfileFromDatabase(
  user: User,
): Promise<UserAPSProfile | null> {
  try {
    const { data, error } = await supabase.rpc("get_user_aps_profile", {
      user_id: user.id,
    });

    if (error || !data || !isValidAPSProfile(data)) {
      return loadAPSProfile();
    }

    localStorage.setItem(APS_STORAGE_KEY, JSON.stringify(data));
    return data;
  } catch {
    return loadAPSProfile();
  }
}

export function createAPSBackup(): boolean {
  try {
    const profile = loadAPSProfile();
    if (!profile) return false;

    const backup = {
      ...profile,
      backupCreatedAt: new Date().toISOString(),
    };

    localStorage.setItem(APS_BACKUP_KEY, JSON.stringify(backup));
    return true;
  } catch {
    return false;
  }
}

export function clearAPSProfileSimple(): boolean {
  try {
    clearStorageKeys();
    window.dispatchEvent(new CustomEvent("apsProfileCleared"));
    return localStorage.getItem(APS_STORAGE_KEY) === null;
  } catch {
    return false;
  }
}

export function restoreAPSBackup(): UserAPSProfile | null {
  try {
    const backup = localStorage.getItem(APS_BACKUP_KEY);
    if (!backup) return null;

    const profile = JSON.parse(backup);
    if (!isValidAPSProfile(profile)) return null;

    localStorage.setItem(APS_STORAGE_KEY, JSON.stringify(profile));
    return profile;
  } catch {
    return null;
  }
}
