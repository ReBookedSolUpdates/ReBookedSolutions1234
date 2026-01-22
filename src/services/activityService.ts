import { supabase } from "@/integrations/supabase/client";

// Define comprehensive activity types
export type ActivityType =
  | "login"
  | "logout"
  | "signup"
  | "page_view"
  | "book_view"
  | "book_add_to_cart"
  | "book_remove_from_cart"
  | "share_mini_link"
  | "share_book_link"
  | "share_social_media"
  | "checkout_started"
  | "checkout_product_viewed"
  | "checkout_cart_viewed"
  | "checkout_payment_initiated"
  | "checkout_completed"
  | "checkout_abandoned"
  | "profile_updated"
  | "banking_updated"
  | "listing_created"
  | "order_paid"
  | "order_committed";

export type EntityType =
  | "authentication"
  | "page"
  | "book"
  | "order"
  | "referral"
  | "profile"
  | "banking"
  | "listing"
  | "cart";

export interface ActivityLogEntry {
  user_id?: string;
  action: ActivityType;
  entity_type: EntityType;
  entity_id?: string;
  metadata?: Record<string, unknown>;
}

const SESSION_STORAGE_KEY = "activity_session_id";

export class ActivityService {
  /**
   * Generate a unique session ID
   */
  private static generateSessionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `session_${timestamp}_${random}`;
  }

  /**
   * Get or create session ID
   */
  static getSessionId(): string {
    try {
      let sessionId = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (!sessionId) {
        sessionId = this.generateSessionId();
        sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
      }
      return sessionId;
    } catch (e) {
      // Fallback if sessionStorage is unavailable
      return this.generateSessionId();
    }
  }

  /**
   * Clear session ID (typically on logout)
   */
  static clearSessionId(): void {
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (e) {
      // Ignore errors
    }
  }

  /**
   * Main method to log an activity
   */
  static async logActivity(
    action: ActivityType,
    entityType: EntityType,
    userId?: string,
    entityId?: string,
    metadata?: Record<string, unknown>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const sessionId = this.getSessionId();

      const activityLog: ActivityLogEntry = {
        action,
        entity_type: entityType,
        entity_id: entityId,
        user_id: userId,
        metadata: {
          session_id: sessionId,
          ...metadata,
        },
      };

      // Remove undefined/null fields
      const cleanLog = Object.fromEntries(
        Object.entries(activityLog).filter(
          ([, v]) => v !== undefined && v !== null
        )
      );

      const { error } = await supabase
        .from("activity_logs")
        .insert([cleanLog]);

      if (error) {
        console.error("Activity logging error:", error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error("Exception during activity logging:", error);
      return { success: false, error: String(error) };
    }
  }

  // ==================== Authentication Events ====================

  /**
   * Track user login
   */
  static async trackLogin(userId: string): Promise<void> {
    await this.logActivity("login", "authentication", userId);
  }

  /**
   * Track user logout
   */
  static async trackLogout(userId: string, sessionDurationMs?: number): Promise<void> {
    await this.logActivity("logout", "authentication", userId, undefined, {
      session_duration_ms: sessionDurationMs,
    });
    this.clearSessionId();
  }

  /**
   * Track user signup
   */
  static async trackSignup(userId: string): Promise<void> {
    await this.logActivity("signup", "authentication", userId);
  }

  // ==================== Page Navigation ====================

  /**
   * Track page view
   */
  static async trackPageView(
    userId: string | undefined,
    pagePath: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await this.logActivity("page_view", "page", userId, pagePath, {
      path: pagePath,
      referrer: document.referrer || undefined,
      ...metadata,
    });
  }

  // ==================== Book Interactions ====================

  /**
   * Track book view
   */
  static async trackBookView(
    bookId: string,
    userId: string | undefined,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await this.logActivity("book_view", "book", userId, bookId, metadata);
  }

  /**
   * Track time spent on book page
   */
  static async trackBookPageTimeSpent(
    bookId: string,
    userId: string | undefined,
    timeSpentMs: number
  ): Promise<void> {
    await this.logActivity("book_view", "book", userId, bookId, {
      time_spent_ms: timeSpentMs,
    });
  }

  /**
   * Track add to cart
   */
  static async trackAddToCart(
    bookId: string,
    userId: string | undefined,
    quantity: number = 1,
    price?: number
  ): Promise<void> {
    await this.logActivity("book_add_to_cart", "cart", userId, bookId, {
      quantity,
      price,
    });
  }

  /**
   * Track remove from cart
   */
  static async trackRemoveFromCart(
    bookId: string,
    userId: string | undefined,
    quantity: number = 1
  ): Promise<void> {
    await this.logActivity("book_remove_from_cart", "cart", userId, bookId, {
      quantity,
    });
  }

  // ==================== Share & Referral Tracking ====================

  /**
   * Track mini link share
   */
  static async trackMiniLinkShare(
    miniLinkId: string,
    userId: string | undefined,
    platform?: string
  ): Promise<void> {
    await this.logActivity("share_mini_link", "referral", userId, miniLinkId, {
      platform,
    });
  }

  /**
   * Track book share
   */
  static async trackBookShare(
    bookId: string,
    userId: string | undefined,
    platform?: string
  ): Promise<void> {
    await this.logActivity("share_book_link", "referral", userId, bookId, {
      platform,
    });
  }

  /**
   * Track social media share
   */
  static async trackSocialShare(
    entityId: string,
    userId: string | undefined,
    platform: string
  ): Promise<void> {
    await this.logActivity("share_social_media", "referral", userId, entityId, {
      platform,
    });
  }

  /**
   * Track referral visit
   */
  static async trackReferralVisit(
    referralCode: string,
    userId: string | undefined
  ): Promise<void> {
    await this.logActivity("page_view", "referral", userId, referralCode, {
      referral_code: referralCode,
    });
  }

  // ==================== Checkout Funnel ====================

  /**
   * Track checkout started
   */
  static async trackCheckoutStarted(
    userId: string | undefined,
    cartValue?: number,
    itemCount?: number
  ): Promise<void> {
    await this.logActivity("checkout_started", "order", userId, undefined, {
      cart_value: cartValue,
      item_count: itemCount,
    });
  }

  /**
   * Track checkout step
   */
  static async trackCheckoutStep(
    userId: string | undefined,
    step: "cart_viewed" | "payment_initiated" | "product_viewed",
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const actionMap = {
      cart_viewed: "checkout_cart_viewed",
      payment_initiated: "checkout_payment_initiated",
      product_viewed: "checkout_product_viewed",
    } as const;

    await this.logActivity(
      actionMap[step],
      "order",
      userId,
      undefined,
      metadata
    );
  }

  /**
   * Track purchase completion
   */
  static async trackPurchase(
    userId: string | undefined,
    orderId: string,
    orderValue: number,
    itemCount: number,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await this.logActivity("checkout_completed", "order", userId, orderId, {
      order_value: orderValue,
      item_count: itemCount,
      ...metadata,
    });
  }

  /**
   * Track checkout abandoned
   */
  static async trackCheckoutAbandoned(
    userId: string | undefined,
    lastStep?: string,
    cartValue?: number
  ): Promise<void> {
    await this.logActivity(
      "checkout_abandoned",
      "order",
      userId,
      undefined,
      {
        last_step: lastStep,
        cart_value: cartValue,
      }
    );
  }

  // ==================== Profile & Account ====================

  /**
   * Track profile update
   */
  static async trackProfileUpdate(
    userId: string,
    updateType?: string
  ): Promise<void> {
    await this.logActivity("profile_updated", "profile", userId, undefined, {
      update_type: updateType,
    });
  }

  /**
   * Track banking update
   */
  static async trackBankingUpdate(
    userId: string,
    isUpdate: boolean = true
  ): Promise<void> {
    await this.logActivity("banking_updated", "banking", userId, undefined, {
      action: isUpdate ? "update" : "create",
    });
  }

  /**
   * Track listing created
   */
  static async trackListingCreated(
    userId: string,
    listingId: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await this.logActivity("listing_created", "listing", userId, listingId, metadata);
  }

  /**
   * Track order paid
   */
  static async trackOrderPaid(
    userId: string,
    orderId: string,
    amount: number
  ): Promise<void> {
    await this.logActivity("order_paid", "order", userId, orderId, {
      amount,
    });
  }

  /**
   * Track order committed
   */
  static async trackOrderCommitted(
    userId: string,
    orderId: string
  ): Promise<void> {
    await this.logActivity("order_committed", "order", userId, orderId);
  }

  // ==================== Analytics & Reporting ====================

  /**
   * Get user activities
   */
  static async getUserActivities(
    userId: string,
    limit: number = 50,
    action?: ActivityType
  ): Promise<any[]> {
    try {
      let query = supabase
        .from("activity_logs")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (action) {
        query = query.eq("action", action);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching user activities:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Exception fetching user activities:", error);
      return [];
    }
  }

  /**
   * Get user analytics summary
   */
  static async getUserAnalytics(userId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("action, entity_type, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1000);

      if (error) {
        console.error("Error fetching user analytics:", error);
        return null;
      }

      if (!data || data.length === 0) {
        return null;
      }

      // Calculate basic analytics
      const actionCounts: Record<string, number> = {};
      const entityCounts: Record<string, number> = {};
      
      data.forEach((log) => {
        actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
        entityCounts[log.entity_type] = (entityCounts[log.entity_type] || 0) + 1;
      });

      return {
        total_events: data.length,
        action_counts: actionCounts,
        entity_counts: entityCounts,
        first_activity: data[data.length - 1]?.created_at,
        last_activity: data[0]?.created_at,
      };
    } catch (error) {
      console.error("Exception calculating user analytics:", error);
      return null;
    }
  }
}
