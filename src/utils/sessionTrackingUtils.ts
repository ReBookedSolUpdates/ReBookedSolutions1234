import { ActivityService } from "@/services/activityService";
import debugLogger from "@/utils/debugLogger";

const SESSION_START_TIME_KEY = "activity_session_start_time";
const REFERRAL_CODE_KEY = "activity_referral_code";

export class SessionTrackingUtils {
  /**
   * Initialize session on app load
   */
  static initializeSession(): void {
    try {
      const startTime = sessionStorage.getItem(SESSION_START_TIME_KEY);
      if (!startTime) {
        sessionStorage.setItem(SESSION_START_TIME_KEY, Date.now().toString());
      }

      // Check for referral code in URL params
      this.checkReferralCode();

      // Get or create session ID
      ActivityService.getSessionId();
    } catch (error) {
      debugLogger.error("sessionTrackingUtils", "Error initializing session:", error);
    }
  }

  /**
   * Get current session start time
   */
  static getSessionStartTime(): number | null {
    try {
      const startTime = sessionStorage.getItem(SESSION_START_TIME_KEY);
      return startTime ? parseInt(startTime, 10) : null;
    } catch (error) {
      debugLogger.error("sessionTrackingUtils", "Error getting session start time:", error);
      return null;
    }
  }

  /**
   * Get current session duration in milliseconds
   */
  static getSessionDuration(): number {
    try {
      const startTime = this.getSessionStartTime();
      if (!startTime) {
        return 0;
      }
      return Date.now() - startTime;
    } catch (error) {
      debugLogger.error("sessionTrackingUtils", "Error calculating session duration:", error);
      return 0;
    }
  }

  /**
   * Get current session ID
   */
  static getSessionId(): string {
    return ActivityService.getSessionId();
  }

  /**
   * Get current session info
   */
  static getSessionInfo(): {
    sessionId: string;
    startTime: number | null;
    duration: number;
    referralCode: string | null;
  } {
    return {
      sessionId: this.getSessionId(),
      startTime: this.getSessionStartTime(),
      duration: this.getSessionDuration(),
      referralCode: this.getReferralCode(),
    };
  }

  /**
   * Check for referral code in URL params
   */
  private static checkReferralCode(): void {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const referralCode = urlParams.get("ref") || urlParams.get("referral");

      if (referralCode) {
        sessionStorage.setItem(REFERRAL_CODE_KEY, referralCode);
      }
    } catch (error) {
      debugLogger.error("sessionTrackingUtils", "Error checking referral code:", error);
    }
  }

  /**
   * Get stored referral code
   */
  static getReferralCode(): string | null {
    try {
      return sessionStorage.getItem(REFERRAL_CODE_KEY);
    } catch (error) {
      debugLogger.error("sessionTrackingUtils", "Error getting referral code:", error);
      return null;
    }
  }

  /**
   * Clear session (typically on logout)
   */
  static clearSession(): void {
    try {
      sessionStorage.removeItem(SESSION_START_TIME_KEY);
      sessionStorage.removeItem(REFERRAL_CODE_KEY);
      ActivityService.clearSessionId();
    } catch (error) {
      debugLogger.error("sessionTrackingUtils", "Error clearing session:", error);
    }
  }
}
