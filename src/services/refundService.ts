import { supabase } from "@/integrations/supabase/client";

export interface RefundRequest {
  orderId: string;
  transactionReference: string;
  amount: number;
  reason: string;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  refundReference?: string;
  amount?: number;
  status?: "pending" | "processing" | "success" | "failed";
  expectedDate?: string;
  error?: string;
}

export class RefundService {
  /**
   * Process a full refund for an order
   */
  static async processRefund(
    orderId: string,
    transactionReference: string,
    amount: number,
    reason: string,
  ): Promise<RefundResult> {
    try {

      // Get the original transaction from our database
      const { data: transaction, error: transactionError } = await supabase
        .from("payment_transactions")
        .select("*")
        .eq("reference", transactionReference)
        .single();

      if (transactionError || !transaction) {
        throw new Error("Original transaction not found");
      }

      // Check if refund already exists
      const { data: existingRefund } = await supabase
        .from("refund_transactions")
        .select("*")
        .eq("order_id", orderId)
        .single();

      if (existingRefund && existingRefund.status === "success") {
        return {
          success: true,
          refundId: existingRefund.id,
          refundReference: existingRefund.refund_reference,
          amount: existingRefund.amount,
          status: "success",
          expectedDate: existingRefund.completed_at,
        };
      }

      // Create refund record
      const refundId = `refund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const refundReference = `REF-${Date.now()}`;

      // Store refund in database
      const refundData = {
        id: refundId,
        order_id: orderId,
        transaction_reference: transactionReference,
        refund_reference: refundReference,
        amount: amount,
        reason: reason,
        status: "pending",
        created_at: new Date().toISOString(),
      };

      const { error: insertError } = await supabase
        .from("refund_transactions")
        .insert(refundData);

      if (insertError) {
        throw new Error("Failed to record refund");
      }

      // Update order status
      await supabase
        .from("orders")
        .update({
          status: "refunded",
          refund_status: "pending",
          refund_reference: refundReference,
          refunded_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      // Calculate expected refund date (usually 3-5 business days)
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + 5);

      return {
        success: true,
        refundId: refundId,
        refundReference: refundReference,
        amount: amount,
        status: "pending",
        expectedDate: expectedDate.toISOString(),
      };
    } catch (error) {

      // Store failed refund attempt
      try {
        await supabase.from("refund_transactions").insert({
          id: `refund_fail_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          order_id: orderId,
          transaction_reference: transactionReference,
          amount: amount,
          reason: reason,
          status: "failed",
          error_message:
            error instanceof Error ? error.message : "Unknown error",
          created_at: new Date().toISOString(),
        });
      } catch (dbError) {
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown refund error",
      };
    }
  }

  /**
   * Check refund status from database
   */
  static async checkRefundStatus(refundId: string): Promise<{
    success: boolean;
    status?: string;
    amount?: number;
    processedAt?: string;
    error?: string;
  }> {
    try {
      const { data: refund, error } = await supabase
        .from("refund_transactions")
        .select("*")
        .eq("id", refundId)
        .single();

      if (error || !refund) {
        throw new Error("Refund not found");
      }

      return {
        success: true,
        status: refund.status,
        amount: refund.amount,
        processedAt: refund.created_at,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Status check failed",
      };
    }
  }

  /**
   * Get all refunds for a user
   */
  static async getUserRefunds(userId: string): Promise<{
    success: boolean;
    refunds?: any[];
    error?: string;
  }> {
    try {
      const { data: refunds, error } = await supabase
        .from("refund_transactions")
        .select(
          `
          *,
          order:orders(
            id,
            total_amount,
            buyer_id,
            seller_id,
            created_at
          )
        `,
        )
        .eq("order.buyer_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        refunds: refunds || [],
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch refunds",
      };
    }
  }
}
