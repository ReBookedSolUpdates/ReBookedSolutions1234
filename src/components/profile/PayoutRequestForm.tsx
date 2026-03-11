import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  AlertTriangle,
  CheckCircle2,
  X,
} from "lucide-react";
import { PayoutService } from "@/services/payoutService";
import { useBanking } from "@/hooks/useBanking";
import BankingDetailsRequiredModal from "./BankingDetailsRequiredModal";
import { toast } from "sonner";

interface PayoutRequestFormProps {
  availableBalance: number;
  onSubmitted: () => void;
  onCancel: () => void;
}

const PayoutRequestForm: React.FC<PayoutRequestFormProps> = ({
  availableBalance,
  onSubmitted,
  onCancel,
}) => {
  const { bankingDetails, isLoading: bankingLoading } = useBanking();
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showBankingModal, setShowBankingModal] = useState(false);
  const [bankingCheckComplete, setBankingCheckComplete] = useState(false);

  const hasBankingDetails = !!bankingDetails && bankingDetails.status === "active";

  // Check banking details on mount
  useEffect(() => {
    if (!bankingLoading) {
      // If no banking details, show modal
      if (!hasBankingDetails) {
        setShowBankingModal(true);
      } else {
        setBankingCheckComplete(true);
      }
    }
  }, [bankingLoading, hasBankingDetails]);

  const amountValue = amount ? parseFloat(amount) : 0;
  const isValid = amountValue > 0 && amountValue <= (availableBalance || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      toast.error("Invalid amount");
      return;
    }

    if (!hasBankingDetails) {
      setShowBankingModal(true);
      toast.error("Please add banking details first");
      return;
    }

    try {
      setLoading(true);
      const result = await PayoutService.createPayoutRequest({
        amount: amountValue,
        notes: notes || undefined,
      });

      if (result.success) {
        setSubmitted(true);
        toast.success("Payout request created successfully!");
        setTimeout(() => {
          onSubmitted();
        }, 2000);
      } else {
        toast.error(result.error || "Failed to create payout request");
      }
    } catch (error) {
      toast.error("An error occurred while creating the payout request");
    } finally {
      setLoading(false);
    }
  };

  const handleBankingDetailsAdded = () => {
    setShowBankingModal(false);
    setBankingCheckComplete(true);
  };

  // Show loading state while checking banking details
  if (!bankingCheckComplete && bankingLoading) {
    return (
      <Dialog open={true} onOpenChange={onCancel}>
        <DialogContent className="sm:max-w-md">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (submitted) {
    return (
      <Dialog open={true} onOpenChange={onCancel}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Payout Request Submitted
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center py-4">
              <div className="bg-green-100 rounded-full p-4 mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-gray-600 text-center text-sm mb-2">
                Your payout request for <strong>{PayoutService.formatZAR(amountValue)}</strong> has been submitted.
              </p>
            </div>

            {/* What happens next */}
            <Alert className="border-blue-200 bg-blue-50">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 text-sm">
                <strong>What happens next:</strong> Our team will verify your details and process your payout within 2-3 business days.
              </AlertDescription>
            </Alert>

            {/* Bank statement info */}
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 text-sm">
                <strong>Verification:</strong> For larger payouts, we may request bank statements to verify account ownership. This is a standard security measure.
              </AlertDescription>
            </Alert>

            {/* Reassurance about data removal */}
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 text-sm">
                <strong>Your Privacy:</strong> Once you receive a confirmation email that your payout is being processed, you can safely remove your banking details from your account anytime.
              </AlertDescription>
            </Alert>

            {/* Notification info */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700">
              <p className="font-semibold mb-2">📧 You'll receive emails at each step:</p>
              <ul className="space-y-1 text-xs">
                <li>✓ Confirmation of payout request received</li>
                <li>✓ Status updates as we process your request</li>
                <li>✓ Final notification when payment is sent to your bank</li>
              </ul>
            </div>

            <Button
              onClick={onCancel}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      {/* Banking Details Required Modal */}
      <BankingDetailsRequiredModal
        open={showBankingModal}
        onClose={() => {
          setShowBankingModal(false);
          onCancel();
        }}
        onBankingDetailsAdded={handleBankingDetailsAdded}
      />

      {/* Payout Request Form */}
      <Dialog open={!showBankingModal} onOpenChange={onCancel}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Payout</DialogTitle>
            <DialogDescription>
              Withdraw funds from your available balance
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Balance Info */}
            <Alert className="bg-blue-50 border-blue-200">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 text-sm">
                <strong>Available Balance:</strong> {PayoutService.formatZAR(availableBalance)}
              </AlertDescription>
            </Alert>

            {/* Amount Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Amount (ZAR)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max={availableBalance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                disabled={loading}
                className="border-gray-300"
              />
              {amount && !isValid && (
                <p className="text-sm text-red-600">
                  Amount must be between R0 and {PayoutService.formatZAR(availableBalance)}
                </p>
              )}
              {amount && isValid && (
                <p className="text-sm text-green-600">
                  ✓ Valid amount
                </p>
              )}
            </div>

            {/* Notes Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Notes (optional)
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this payout request..."
                disabled={loading}
                className="border-gray-300 resize-none"
                rows={3}
              />
            </div>

            {/* Processing Info */}
            <Alert className="bg-amber-50 border-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 text-sm">
                Payouts are processed within 2-3 business days to your registered banking account.
              </AlertDescription>
            </Alert>

            {/* Security & Privacy Info */}
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 text-sm">
                <strong>Secure & Private:</strong> Your banking details are encrypted. Once your payout is confirmed, you can remove them anytime.
              </AlertDescription>
            </Alert>

            {/* Submit Button */}
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                disabled={!isValid || loading || !hasBankingDetails}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Submit Request
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PayoutRequestForm;
