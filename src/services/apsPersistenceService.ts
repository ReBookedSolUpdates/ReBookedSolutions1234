import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { UserAPSProfile } from "@/hooks/useAPSAwareCourseAssignment";

// 📦 PRIMARY STORAGE: localStorage with key "userAPSProfile"
const APS_STORAGE_KEY = "userAPSProfile";
const APS_BACKUP_KEY = "apsProfileBackup";

/**
 * Enhanced APS Persistence Service
 * Dual Storage Strategy: localStorage (primary) + database (backup for authenticated users)
 */

// ✅ PROFILE STRUCTURE VALIDATION - Enhanced to be less aggressive
function isValidAPSProfile(profile: any): profile is UserAPSProfile {
  if (!profile || typeof profile !== "object") {
    return false;
  }

  // Check for required fields with more lenient validation
  if (!("subjects" in profile)) {
    return false;
  }

  if (!Array.isArray(profile.subjects)) {
    return false;
  }

  // More lenient validation - allow missing or default values
  const totalAPS = profile.totalAPS !== undefined ? profile.totalAPS : 0;
  const lastUpdated = profile.lastUpdated || new Date().toISOString();

  // Only validate that subjects is a valid array
  if (typeof totalAPS !== "number" || totalAPS < 0) {
    return false;
  }

  return true;
}

// 🔄 MIGRATION & RECOVERY
export function migrateSessionToLocal(): boolean {
  try {
    const sessionProfile = sessionStorage.getItem(APS_STORAGE_KEY);
    const localProfile = localStorage.getItem(APS_STORAGE_KEY);

    // If session has data but local doesn't, migrate it
    if (sessionProfile && !localProfile) {
      localStorage.setItem(APS_STORAGE_KEY, sessionProfile);
      sessionStorage.removeItem(APS_STORAGE_KEY);
        "✅ Migrated APS profile from sessionStorage to localStorage",
      );
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

// 💾 SAVE FUNCTION - Auto-saves with timestamp
export async function saveAPSProfile(
  profile: UserAPSProfile,
  user?: User,
): Promise<{ success: boolean; source?: string; error?: string }> {
  try {
    // Add timestamp for tracking when saved
    const profileWithTimestamp = {
      ...profile,
      lastUpdated: new Date().toISOString(),
      savedAt: Date.now(),
    };

    // 1️⃣ ALWAYS SAVE TO LOCALSTORAGE FIRST (immediate persistence)
    const profileJson = JSON.stringify(profileWithTimestamp);
    localStorage.setItem(APS_STORAGE_KEY, profileJson);

    // ✅ VERIFY SAVE SUCCESS
    const verification = localStorage.getItem(APS_STORAGE_KEY);
    const savedSuccessfully = !!verification;

    if (user) {
      try {
        // 2️⃣ ALSO SAVE TO DATABASE (cloud backup)
        const { data, error } = await supabase.rpc("save_user_aps_profile", {
          profile_data: profileWithTimestamp,
          user_id: user.id,
        });

        if (error) {
            "⚠️ Database save failed, localStorage still works:",
            error,
          );
          return { success: true, source: "localStorage" };
        }

        return { success: true, source: "database" };
      } catch (dbError) {
        return { success: true, source: "localStorage" };
      }
    }

    // 3️⃣ NON-AUTHENTICATED USERS: localStorage only
    return { success: true, source: "localStorage" };
  } catch (error) {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// 📂 LOAD PROFILE FUNCTION - Enhanced with backup recovery
function getLocalStorageProfile(): UserAPSProfile | null {
  try {
    const stored = localStorage.getItem(APS_STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored);
    const isValid = isValidAPSProfile(parsed);

    if (isValid) {
      return parsed;
    } else {

      // Instead of clearing immediately, try to repair the profile
      if (parsed && typeof parsed === "object" && Array.isArray(parsed.subjects)) {
        const repairedProfile = {
          subjects: parsed.subjects,
          totalAPS: parsed.totalAPS || 0,
          lastUpdated: parsed.lastUpdated || new Date().toISOString(),
          savedAt: parsed.savedAt || Date.now(),
          isValid: true
        };

        // Try to save the repaired profile
        try {
          localStorage.setItem(APS_STORAGE_KEY, JSON.stringify(repairedProfile));
          return repairedProfile;
        } catch (error) {
        }
      }

      // Only clear as last resort
      localStorage.setItem(APS_STORAGE_KEY + "_backup", stored);
      localStorage.removeItem(APS_STORAGE_KEY);
      return null;
    }
  } catch (error) {
    localStorage.removeItem(APS_STORAGE_KEY); // Clear corrupted data
    return null;
  }
}

export function loadAPSProfile(): UserAPSProfile | null {
  try {

    // 🔄 Try migration first
    migrateSessionToLocal();

    const profile = getLocalStorageProfile();
    if (profile) {
      return profile;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
}

// 🗑️ CLEAR FUNCTION - Only triggered by user action (manual clear button)
export async function clearAPSProfile(user?: User): Promise<{success: boolean; source?: string; error?: string}> {
  try {

    // Store initial state for debugging
    const beforeClear = localStorage.getItem(APS_STORAGE_KEY);

    // Clear localStorage and sessionStorage
    localStorage.removeItem(APS_STORAGE_KEY);
    localStorage.removeItem(APS_BACKUP_KEY);
    localStorage.removeItem("apsSearchResults");
    localStorage.removeItem("reBooked-aps-profile"); // Legacy key
    localStorage.removeItem("reBooked-aps-search-results"); // Legacy key
    localStorage.removeItem("rebookedMarketplace-aps-profile"); // Another legacy key
    localStorage.removeItem("userAPSManual");
    sessionStorage.removeItem(APS_STORAGE_KEY);
    sessionStorage.removeItem("apsSearchResults");

    if (user) {
      // For authenticated users, also clear from database
      try {
        const { error } = await supabase.rpc("clear_user_aps_profile", {
          user_id: user.id,
        });

        if (error) {
          return {
            success: true,
            source: "localStorage",
            error: `Database clear failed: ${error.message}`,
          };
        }

        return {
          success: true,
          source: "database",
        };
      } catch (dbError) {
        return {
          success: true,
          source: "localStorage",
          error: "Database unavailable",
        };
      }
    }

    // Verify the clear worked
    const afterClear = localStorage.getItem(APS_STORAGE_KEY);

    // 📡 TRIGGER GLOBAL CLEAR EVENT (for other components)
    window.dispatchEvent(new CustomEvent("apsProfileCleared"));

    const success = afterClear === null;

    return {
      success,
      source: "localStorage",
    };
  } catch (error) {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// 🏛️ FOR AUTHENTICATED USERS: Database + localStorage
export async function loadAPSProfileFromDatabase(
  user: User,
): Promise<UserAPSProfile | null> {
  try {
    const { data, error } = await supabase.rpc("get_user_aps_profile", {
      user_id: user.id,
    });

    if (error || !data) {
      return loadAPSProfile();
    }

    // Validate and save to localStorage for faster future access
    if (isValidAPSProfile(data)) {
      localStorage.setItem(APS_STORAGE_KEY, JSON.stringify(data));
      return data;
    }

    return loadAPSProfile();
  } catch (error) {
      "❌ Database load failed, falling back to localStorage:",
      error,
    );
    return loadAPSProfile();
  }
}

// 🔄 BACKUP CREATION
export function createAPSBackup(): boolean {
  try {
    const profile = loadAPSProfile();
    if (profile) {
      const backup = {
        ...profile,
        backupCreatedAt: new Date().toISOString(),
      };
      localStorage.setItem("apsProfileBackup", JSON.stringify(backup));
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

// 🗑️ SIMPLE CLEAR FUNCTION - Returns boolean for compatibility
export function clearAPSProfileSimple(): boolean {
  try {

    // Clear localStorage and sessionStorage
    localStorage.removeItem(APS_STORAGE_KEY);
    localStorage.removeItem(APS_BACKUP_KEY);
    localStorage.removeItem("apsSearchResults");
    localStorage.removeItem("reBooked-aps-profile");
    localStorage.removeItem("reBooked-aps-search-results");
    localStorage.removeItem("rebookedMarketplace-aps-profile");
    localStorage.removeItem("userAPSManual");
    sessionStorage.removeItem(APS_STORAGE_KEY);
    sessionStorage.removeItem("apsSearchResults");

    // Verify the clear worked
    const afterClear = localStorage.getItem(APS_STORAGE_KEY);
    const success = afterClear === null;

    // Trigger global clear event
    window.dispatchEvent(new CustomEvent("apsProfileCleared"));

    return success;
  } catch (error) {
    return false;
  }
}

// 🔄 RESTORE FROM BACKUP
export function restoreAPSBackup(): UserAPSProfile | null {
  try {
    const backup = localStorage.getItem("apsProfileBackup");
    if (backup) {
      const profile = JSON.parse(backup);
      if (isValidAPSProfile(profile)) {
        localStorage.setItem(APS_STORAGE_KEY, JSON.stringify(profile));
        return profile;
      }
    }
    return null;
  } catch (error) {
    return null;
  }
}
