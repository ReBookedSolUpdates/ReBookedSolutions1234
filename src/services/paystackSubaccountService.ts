import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import debugLogger from "@/utils/debugLogger";

export interface SubaccountDetails {
  business_name: string;
  email: string;
  bank_name: string;
  bank_code: string;
  account_number: string;
}

export interface SubaccountUpdateDetails {
  business_name?: string;
  settlement_bank?: string;
  account_number?: string;
  percentage_charge?: number;
  description?: string;
  primary_contact_email?: string;
  primary_contact_name?: string;
  primary_contact_phone?: string;
  settlement_schedule?: "auto" | "weekly" | "monthly" | "manual";
  metadata?: Record<string, any>;
}

export interface SubaccountData {
  subaccount_code: string;
  business_name: string;
  description?: string;
  primary_contact_email?: string;
  primary_contact_name?: string;
  primary_contact_phone?: string;
  percentage_charge: number;
  settlement_bank: string;
  account_number: string;
  settlement_schedule: string;
  active: boolean;
  migrate?: boolean;
  metadata?: Record<string, any>;
  domain?: string;
  subaccount_id?: number;
  is_verified?: boolean;
  split_ratio?: number;
}

export class PaystackSubaccountService {
  // Helper method to format error messages properly
  private static formatError(error: any): string {
    if (!error) return "Unknown error occurred";

    if (typeof error === "string") return error;

    if (error.message) return error.message;

    if (error.details) return error.details;

    if (error.hint) return error.hint;

    // If it's an object, try to stringify it properly
    try {
      const errorStr = JSON.stringify(error);
      if (errorStr === "{}") return "Unknown error occurred";
      return errorStr;
    } catch {
      return String(error);
    }
  }
  // Note: createOrUpdateSubaccount has been removed in favor of using BankingService directly
  // Banking details are now encrypted and stored locally without Paystack subaccount creation

  // 👤 UPDATE USER PROFILE WITH SUBACCOUNT CODE
  static async updateUserProfileSubaccount(
    userId: string,
    subaccountCode: string,
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ subaccount_code: subaccountCode })
        .eq("id", userId);

      if (error) {
        debugLogger.warn("paystackSubaccountService", "Failed to update profile subaccount:", error);
      }
    } catch (error) {
      debugLogger.warn("paystackSubaccountService", "Error updating profile subaccount:", error);
    }
  }

  // 🔗 LINK ALL USER'S BOOKS TO THEIR SUBACCOUNT
  static async linkBooksToSubaccount(subaccountCode: string): Promise<boolean> {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      if (!userId || !subaccountCode) {
        debugLogger.warn("paystackSubaccountService", "No user ID or subaccount code provided");
        return false;
      }

      // 📚 UPDATE ALL USER'S BOOKS WITH SUBACCOUNT CODE
      // First check if the column exists by trying a minimal select
      debugLogger.info("paystackSubaccountService", "Checking if seller_subaccount_code column exists...");
      let columnExists = true;
      try {
        const { error: checkError } = await supabase
          .from("books")
          .select("seller_subaccount_code")
          .limit(1);

        if (checkError) {
          debugLogger.warn("paystackSubaccountService", "Column check failed:", checkError.message);
          columnExists = false;
        }
      } catch (error) {
        debugLogger.warn("paystackSubaccountService", "seller_subaccount_code column doesn't exist in books table:", error);
        columnExists = false;
      }

      if (!columnExists) {
        debugLogger.warn("paystackSubaccountService", "Skipping book update - seller_subaccount_code column not found in database schema");
        debugLogger.warn("paystackSubaccountService", "This is expected if the database schema hasn't been updated yet");
        return true; // Return success since the main operation completed
      }

      const { data, error } = await supabase
        .from("books")
        .update({ seller_subaccount_code: subaccountCode })
        .eq("seller_id", userId)
        .is("seller_subaccount_code", null) // Only update books that don't already have a subaccount_code
        .select("id");

      if (error) {
        const formattedError = this.formatError(error);
        debugLogger.error(
          "paystackSubaccountService",
          "Error updating books with seller_subaccount_code:",
          formattedError,
        );
        // Don't return false immediately, log the error but continue
        debugLogger.warn("paystackSubaccountService", "Book update failed but continuing with subaccount creation");
        debugLogger.warn("paystackSubaccountService", "This might be because the books table doesn't have the seller_subaccount_code column yet");
        debugLogger.warn("paystackSubaccountService", "Error details:", formattedError);
        // Return true to not fail the subaccount creation process
        return true;
      }

      const updatedCount = data?.length || 0;
      debugLogger.info(
        "paystackSubaccountService",
        `📚 ${updatedCount} books linked to subaccount ${subaccountCode} for user ${userId}`,
      );

      return true;
    } catch (error) {
      debugLogger.error("paystackSubaccountService", "Error linking books to subaccount:", error);
      return false;
    }
  }

  // 📖 GET USER'S SUBACCOUNT CODE
  static async getUserSubaccountCode(userId?: string): Promise<string | null> {
    try {
      if (!userId) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return null;
        userId = user.id;
      }

      // Check profile table for subaccount code
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("subaccount_code")
        .eq("id", userId)
        .single();

      if (!profileError && profileData?.subaccount_code) {
        return profileData.subaccount_code;
      }

      return null;
    } catch (error) {
      debugLogger.error("paystackSubaccountService", "Error getting user subaccount code:", error);
      return null;
    }
  }

  // Note: fetchSubaccountDetails and updateSubaccountDetails have been removed
  // These functions called Paystack edge functions which are no longer needed
  // Banking details are now managed locally with encryption/decryption

  // 📋 GET COMPLETE SUBACCOUNT INFO
  static async getCompleteSubaccountInfo(): Promise<{
    success: boolean;
    data?: {
      subaccount_code: string;
      banking_details: any;
      paystack_data: SubaccountData;
      profile_preferences: any;
    };
    error?: string;
  }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: "User not authenticated" };
      }

      // Get profile and subaccount code
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("subaccount_code, preferences")
        .eq("id", user.id)
        .single();

      if (profileError || !profileData?.subaccount_code) {
        return { success: false, error: "No subaccount code found" };
      }

      // Get banking subaccount details
      const { data: subaccountData, error: subaccountError } = await supabase
        .from("banking_subaccounts")
        .select("*")
        .eq("subaccount_code", profileData.subaccount_code)
        .single();

      if (subaccountError) {
        return { success: false, error: "No banking subaccount found" };
      }

      // Parse encrypted data for display
      const paystackData: SubaccountData = {
        subaccount_code: subaccountData.subaccount_code,
        business_name: profileData.preferences?.business_name || "",
        account_number: "••••••••", // Don't return plaintext
        settlement_bank: subaccountData.bank_code || "",
        percentage_charge: 0,
        settlement_schedule: "auto",
        active: subaccountData.status === "active",
      };

      return {
        success: true,
        data: {
          subaccount_code: profileData.subaccount_code,
          banking_details: subaccountData,
          paystack_data: paystackData,
          profile_preferences: profileData.preferences,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return { success: false, error: errorMessage };
    }
  }

  // 🔄 UPDATE SUBACCOUNT DETAILS
  static async updateSubaccountDetails(
    subaccountCode: string,
    updateData: SubaccountUpdateDetails,
  ): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      // Banking details (account_number, settlement_bank) must be encrypted via BankingDetailsForm
      // This method only updates non-sensitive fields

      if (updateData.account_number && updateData.account_number !== "••••••••") {
        return {
          success: false,
          error: "Cannot update banking details here. Please use the Banking Details section to update account information with proper encryption.",
        };
      }

      // Only allow non-banking fields to be updated
      const safeUpdateData: any = {};
      if (updateData.business_name) safeUpdateData.business_name = updateData.business_name;
      if (updateData.description) safeUpdateData.description = updateData.description;
      if (updateData.primary_contact_email) safeUpdateData.primary_contact_email = updateData.primary_contact_email;
      if (updateData.primary_contact_name) safeUpdateData.primary_contact_name = updateData.primary_contact_name;
      if (updateData.primary_contact_phone) safeUpdateData.primary_contact_phone = updateData.primary_contact_phone;
      if (updateData.percentage_charge !== undefined) safeUpdateData.percentage_charge = updateData.percentage_charge;
      if (updateData.settlement_schedule) safeUpdateData.settlement_schedule = updateData.settlement_schedule;

      // Update profile preferences with safe data
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: "User not authenticated" };
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("preferences")
        .eq("id", user.id)
        .single();

      const currentPrefs = profileData?.preferences || {};
      const updatedPrefs = { ...currentPrefs, ...safeUpdateData };

      const { error } = await supabase
        .from("profiles")
        .update({ preferences: updatedPrefs })
        .eq("id", user.id);

      if (error) {
        return { success: false, error: "Failed to update subaccount details" };
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return { success: false, error: errorMessage };
    }
  }

  // ✅ CHECK IF USER HAS SUBACCOUNT
  static async getUserSubaccountStatus(userId?: string): Promise<{
    hasSubaccount: boolean;
    canEdit: boolean;
    subaccountCode?: string;
    businessName?: string;
    bankName?: string;
    accountNumber?: string;
    email?: string;
  }> {
    try {
      debugLogger.info("paystackSubaccountService", "🔍 getUserSubaccountStatus: Starting check...", { userId });

      if (!userId) {
        debugLogger.info(
          "paystackSubaccountService",
          "📝 getUserSubaccountStatus: No userId provided, getting from auth...",
        );
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          debugLogger.info(
            "paystackSubaccountService",
            "❌ getUserSubaccountStatus: No authenticated user found",
          );
          return { hasSubaccount: false, canEdit: false };
        }
        userId = user.id;
        debugLogger.info("paystackSubaccountService", "getUserSubaccountStatus: Got user from auth:", userId);
      }

      // First, check the profile table for subaccount_code
      console.log("���� getUserSubaccountStatus: Checking profile table...");
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("subaccount_code, preferences")
        .eq("id", userId)
        .single();

      if (profileError) {
        debugLogger.warn(
          "paystackSubaccountService",
          "❌ getUserSubaccountStatus: Error checking profile:",
          profileError,
        );
        return { hasSubaccount: false, canEdit: false };
      }

      debugLogger.info("paystackSubaccountService", "getUserSubaccountStatus: Profile data:", {
        subaccountCode: profileData?.subaccount_code,
        hasPreferences: !!profileData?.preferences,
      });

      const subaccountCode = profileData?.subaccount_code;

      if (!subaccountCode) {
        debugLogger.info(
          "paystackSubaccountService",
          "getUserSubaccountStatus: No subaccount code found in profile",
        );
        return { hasSubaccount: false, canEdit: false };
      }

      debugLogger.info(
        "paystackSubaccountService",
        "getUserSubaccountStatus: Found subaccount code:",
        subaccountCode,
      );

      // If we have a subaccount code, try to get banking details from banking_subaccounts table
      const { data: subaccountData, error: subaccountError } = await supabase
        .from("banking_subaccounts")
        .select("*")
        .eq("subaccount_code", subaccountCode)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (subaccountError) {
        console.warn(
          "Error fetching banking details (table may not exist):",
          subaccountError,
        );

        // Fallback - we have subaccount code but no detailed banking info
        const preferences = profileData?.preferences || {};
        return {
          hasSubaccount: true,
          subaccountCode: subaccountCode,
          businessName:
            preferences.business_name || "Please complete banking setup",
          bankName:
            preferences.bank_details?.bank_name || "Banking details incomplete",
          accountNumber:
            preferences.bank_details?.account_number_masked || "Not available",
          email: profileData?.email || "Please update",
          canEdit: true,
        };
      }

      if (!subaccountData) {
        // We have subaccount code but no banking details record
        const preferences = profileData?.preferences || {};
        return {
          hasSubaccount: true,
          subaccountCode: subaccountCode,
          businessName:
            preferences.business_name || "Please complete banking setup",
          bankName:
            preferences.bank_details?.bank_name || "Banking details incomplete",
          accountNumber:
            preferences.bank_details?.account_number_masked || "Not available",
          email: profileData?.email || "Please update",
          canEdit: true,
        };
      }

      // We have both subaccount code and banking details
      // Note: Don't return plaintext fields - banking data is encrypted
      const preferences = profileData?.preferences || {};
      return {
        hasSubaccount: true,
        subaccountCode: subaccountData.subaccount_code,
        businessName: preferences.business_name || "Banking details setup",
        bankName: preferences.bank_details?.bank_name || "Bank details encrypted",
        accountNumber: preferences.bank_details?.account_number_masked || "••••••••",
        email: profileData?.email || "Not available",
        canEdit: true, // But form will show contact support message
      };
    } catch (error) {
      console.error("Error in getUserSubaccountStatus:", error);
      return { hasSubaccount: false, canEdit: false };
    }
  }
}

export default PaystackSubaccountService;
