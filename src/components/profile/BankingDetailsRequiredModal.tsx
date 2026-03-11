import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Shield,
  AlertTriangle,
  ArrowRight,
  Lock,
  Eye,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useBanking } from "@/hooks/useBanking";
import { toast } from "sonner";

interface BankingDetailsRequiredModalProps {
  open: boolean;
  onClose: () => void;
  onBankingDetailsAdded: () => void;
}

const BankingDetailsRequiredModal: React.FC<BankingDetailsRequiredModalProps> = ({
  open,
  onClose,
  onBankingDetailsAdded,
}) => {
  const { bankingDetails, isLoading: bankingLoading } = useBanking();
  const [isNavigating, setIsNavigating] = useState(false);

  const hasBankingDetails = !!bankingDetails && bankingDetails.status === "active";

  const handleNavigateToBanking = () => {
    setIsNavigating(true);
    // Navigate to banking setup page
    window.location.href = "/banking-setup";
  };

  const handleClose = () => {
    if (hasBankingDetails) {
      onBankingDetailsAdded();
    } else {
      onClose();
    }
  };

  if (bankingLoading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // If banking details are already set up, show success and proceed
  if (hasBankingDetails) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Banking Details Confirmed
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Your banking details are all set and verified. Your payout will be sent to your registered account.
              </AlertDescription>
            </Alert>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              <p className="font-semibold mb-2">💬 About Your Payment:</p>
              <ul className="space-y-2">
                <li>✓ Payouts are processed within 2-3 business days</li>
                <li>✓ Funds go directly to your registered bank account</li>
                <li>✓ All banking details are encrypted and secure</li>
                <li>✓ You can remove your details anytime after receiving the payout confirmation email</li>
              </ul>
            </div>

            <DialogFooter>
              <Button
                onClick={handleClose}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                Continue to Payout Request
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Banking Details Required
          </DialogTitle>
          <DialogDescription>
            Add your bank account details to receive payouts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Main explanation */}
          <Alert className="border-blue-200 bg-blue-50">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              We need your banking information to process your payout. This is a one-time setup that takes just a few minutes.
            </AlertDescription>
          </Alert>

          {/* Security reassurance */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              Your Data is Safe
            </h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Lock className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Bank-level encryption:</strong> All banking details are encrypted using industry-standard security protocols
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Eye className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Private & Secure:</strong> Only our payment processor sees your details, never stored in plain text
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>You Have Control:</strong> Remove your details anytime after your payout is confirmed
                </span>
              </li>
            </ul>
          </div>

          {/* What happens next */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 text-sm mb-3">How It Works:</h4>
            <ol className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-3">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-xs font-bold flex-shrink-0">
                  1
                </span>
                <span>Add your banking details (account number, bank name, etc.)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-xs font-bold flex-shrink-0">
                  2
                </span>
                <span>Submit your payout request</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-xs font-bold flex-shrink-0">
                  3
                </span>
                <span>We may request bank statements to verify your account (for security)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-xs font-bold flex-shrink-0">
                  4
                </span>
                <span>Receive confirmation email when payout is being processed (2-3 business days)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-xs font-bold flex-shrink-0">
                  5
                </span>
                <span>Remove your banking details anytime after receiving confirmation</span>
              </li>
            </ol>
          </div>

          {/* Call to action */}
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 text-sm">
              <strong>It takes 2-3 minutes:</strong> Complete your banking setup and come back to request your payout.
            </AlertDescription>
          </Alert>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isNavigating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleNavigateToBanking}
              disabled={isNavigating}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              {isNavigating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Setting Up...
                </>
              ) : (
                <>
                  Add Banking Details
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BankingDetailsRequiredModal;
