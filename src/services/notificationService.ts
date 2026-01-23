import { supabase } from "@/lib/supabase";
import { getSafeErrorMessage } from "@/utils/errorMessageUtils";
import debugLogger from "@/utils/debugLogger";

// Utility to properly serialize errors for logging (prevents [object Object])
const serializeError = (error: any): any => {
  if (!error) return { message: 'Unknown error' };

  if (typeof error === 'string') return { message: error };

  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack,
    };
  }

  // Handle Supabase error objects
  if (typeof error === 'object') {
    return {
      message: error.message || error.error_description || error.msg || 'Unknown error',
      code: error.code || error.error || error.status,
      details: error.details || error.error_description,
      hint: error.hint,
      timestamp: new Date().toISOString(),
      originalError: error // Include full original object
    };
  }

  return { message: String(error) };
};

export interface CreateNotificationData {
  userId: string;
  type: string;
  title: string;
  message: string;
  metadata?: Record<string, any>; // Will be ignored for now
  priority?: 'high' | 'medium' | 'low'; // Will be ignored for now
}

type Notification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
};

// Simple cache to store notifications for users
const notificationCache = new Map<string, { data: Notification[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get notifications for a user with caching (from both notifications and order_notifications tables)
 */
export async function getNotifications(userId: string): Promise<Notification[]> {
  try {
    debugLogger.info("notificationService", "Getting notifications", { userId });

    // Check cache first
    const cached = notificationCache.get(userId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      debugLogger.info("notificationService", "Using cached notifications", { count: cached.data.length });
      return cached.data;
    }

    // Fetch from both tables in parallel
    const [regularNotif, orderNotif] = await Promise.all([
      supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('order_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50),
    ]);

    if (regularNotif.error) {
      // Error fetching regular notifications
    }

    if (orderNotif.error) {
      // Error fetching order notifications
    }

    const regularData = regularNotif.data || [];
    const orderData = orderNotif.data || [];

    debugLogger.info("notificationService", "Fetched notifications from database", {
      regularNotifications: regularData.length,
      orderNotifications: orderData.length
    });

    // Merge both notification arrays and sort by created_at
    const allNotifications = [...regularData, ...orderData]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 100); // Limit to 100 total notifications

    debugLogger.info("notificationService", `Merged and cached ${allNotifications.length} notifications`);

    // Update cache
    notificationCache.set(userId, {
      data: allNotifications,
      timestamp: Date.now()
    });

    return allNotifications;
  } catch (error) {
    const safeMessage = getSafeErrorMessage(error, 'Failed to get notifications');
    throw new Error(safeMessage);
  }
}

/**
 * Clear notification cache for a user
 */
export function clearNotificationCache(userId: string): void {
  notificationCache.delete(userId);
}

/**
 * Add a notification (wrapper around NotificationService.createNotification)
 */
export async function addNotification(data: CreateNotificationData): Promise<boolean> {
  debugLogger.info("notificationService", "Adding notification", {
    userId: data.userId,
    type: data.type,
    title: data.title
  });
  const result = await NotificationService.createNotification(data);
  if (result) {
    debugLogger.info("notificationService", "Notification created successfully");
  }
  return result;
}

/**
 * Mark a notification as read (tries both notifications and order_notifications tables)
 */
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  try {
    // Try to update in notifications table first
    const { error: notifError } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (!notifError) {
      return true;
    }

    // If it fails, try order_notifications table
    const { error: orderNotifError } = await supabase
      .from('order_notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (!orderNotifError) {
      return true;
    }

    // If both fail, return false
    return false;
  } catch (error) {
    return false;
  }
}

export class NotificationService {
  /**
   * Create a notification for a user with retry logic
   */
  static async createNotification(data: CreateNotificationData, retryCount = 0) {
    const maxRetries = 2;

    try {
      // Validate required fields
      if (!data.userId || !data.type || !data.title || !data.message) {
        throw new Error('Missing required notification data: userId, type, title, and message are required');
      }

      // Validate userId format (should be UUID)
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.userId)) {
        throw new Error(`Invalid userId format: ${data.userId}`);
      }

      const { data: insertedData, error } = await supabase
        .from('notifications')
        .insert({
          user_id: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
          read: false,
        })
        .select('id')
        .single();

      if (error) {
        // Retry on certain errors (network issues, temporary database errors)
        if (retryCount < maxRetries &&
            (error.message?.includes('network') ||
             error.message?.includes('timeout') ||
             error.message?.includes('connection'))) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
          return this.createNotification(data, retryCount + 1);
        }

        return false;
      }

      // Clear cache for this user so they get fresh notifications
      clearNotificationCache(data.userId);

      return true;
    } catch (error) {
      // Retry on network errors
      if (retryCount < maxRetries && error instanceof Error &&
          (error.message.includes('network') || error.message.includes('fetch'))) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return this.createNotification(data, retryCount + 1);
      }

      return false;
    }
  }

  /**
   * Create commit reminder notification
   */
  static async createCommitReminder(userId: string, orderId: string, bookTitle: string, hoursRemaining: number) {
    return this.createNotification({
      userId,
      type: 'warning',
      title: '⏰ Commit to Sale Reminder',
      message: `You have ${hoursRemaining} hours remaining to commit to selling "${bookTitle}". Please complete your commitment to avoid order cancellation. Order ID: ${orderId}`,
    });
  }

  /**
   * Create delivery update notification
   */
  static async createDeliveryUpdate(userId: string, orderId: string, status: string, message: string) {
    return this.createNotification({
      userId,
      type: 'info',
      title: '📦 Delivery Update',
      message: `${message} (Order: ${orderId}, Status: ${status})`,
    });
  }

  /**
   * Create order confirmation notification with deduplication
   * Prevents duplicate notifications for the same order within a short time window (60 seconds)
   */
  static async createOrderConfirmation(userId: string, orderId: string, bookTitle: string, isForSeller = false) {
    try {
      // Check for duplicate notifications created in the last 60 seconds
      const sixtySecondsAgo = new Date(Date.now() - 60 * 1000).toISOString();
      const notificationType = isForSeller ? 'info' : 'success';
      const orderIdInMessage = `Order ID: ${orderId}`;

      const { data: existingNotifications } = await supabase
        .from('notifications')
        .select('id, created_at')
        .eq('user_id', userId)
        .eq('type', notificationType)
        .gt('created_at', sixtySecondsAgo)
        .like('message', `%${orderId}%`)
        .limit(1);

      // If we found a recent notification for this order, skip creating a duplicate
      if (existingNotifications && existingNotifications.length > 0) {
        return true; // Return success to prevent errors, but skip creation
      }
    } catch (dedupeError) {
      // If dedupe check fails, continue with notification creation
      // (better to create a duplicate than to fail)
    }

    if (isForSeller) {
      return this.createNotification({
        userId,
        type: 'info',
        title: '📦 New Order Received',
        message: `Great news! You've received a new order for "${bookTitle}". Please commit to this sale within 48 hours. Order ID: ${orderId}`,
      });
    } else {
      return this.createNotification({
        userId,
        type: 'success',
        title: '✅ Order Confirmed',
        message: `Your order for "${bookTitle}" has been confirmed. The seller will commit to the sale within 48 hours. Order ID: ${orderId}`,
      });
    }
  }

  /**
   * Create payment confirmation notification
   */
  static async createPaymentConfirmation(userId: string, orderId: string, amount: number, bookTitle: string) {
    return this.createNotification({
      userId,
      type: 'success',
      title: '💳 Payment Successful',
      message: `Payment of R${amount.toFixed(2)} for "${bookTitle}" has been processed successfully. Your order is now confirmed. Order ID: ${orderId}`,
    });
  }

  /**
   * Test notification creation for debugging
   */
  static async createTestNotification(userId: string) {
    const testData = {
      userId,
      type: 'info',
      title: '🧪 Test Notification',
      message: `This is a test notification created at ${new Date().toISOString()} to verify the notification system is working correctly.`,
    };

    const result = await this.createNotification(testData);

    if (result) {
      return { success: true, message: 'Test notification created successfully' };
    } else {
      return { success: false, message: 'Test notification creation failed' };
    }
  }

  /**
   * Verify notification system health
   */
  static async verifyNotificationSystem(userId: string) {
    try {
      // Test 1: Check if we can read notifications
      const notifications = await getNotifications(userId);

      // Test 2: Try to create a test notification
      const testResult = await this.createTestNotification(userId);

      // Test 3: Check if notification was actually created
      if (testResult.success) {
        const updatedNotifications = await getNotifications(userId);
        const notificationCreated = updatedNotifications.length > notifications.length;

        if (notificationCreated) {
          return {
            success: true,
            message: 'Notification system is working correctly',
            details: {
              initialCount: notifications.length,
              finalCount: updatedNotifications.length,
              testNotificationCreated: true
            }
          };
        } else {
          return {
            success: false,
            message: 'Test notification creation appeared successful but notification not found',
            details: {
              initialCount: notifications.length,
              finalCount: updatedNotifications.length,
              testNotificationCreated: false
            }
          };
        }
      }

      return testResult;
    } catch (error) {
      return {
        success: false,
        message: 'Notification system verification failed',
        error: serializeError(error)
      };
    }
  }
}
