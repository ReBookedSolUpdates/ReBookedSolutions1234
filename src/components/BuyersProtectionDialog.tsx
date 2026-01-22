import React from "react";
import { ShieldCheck, CheckCircle2, AlertCircle, Clock, HelpCircle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface BuyersProtectionDialogProps {
  triggerClassName?: string;
  triggerVariant?: "link" | "ghost" | "secondary" | "outline" | "default" | "destructive";
  triggerLabel?: string;
  triggerProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  triggerType?: "button" | "banner";
}

const BuyersProtectionDialog = ({
  triggerClassName,
  triggerVariant = "outline",
  triggerLabel = "Buyer Protection",
  triggerProps,
  triggerType = "button",
}: BuyersProtectionDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {triggerType === "banner" ? (
          <button
            type="button"
            {...(triggerProps as any)}
            className={cn(
              "w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 flex items-center gap-3 hover:bg-gray-100 transition-colors",
              triggerClassName,
            )}
            aria-label={triggerLabel}
          >
            <ShieldCheck className="h-5 w-5 text-gray-700 flex-shrink-0" />
            <div className="flex-1 text-left">
              <div className="font-medium text-sm text-gray-900">{triggerLabel}</div>
              <div className="text-xs text-gray-600">Applied to all purchases</div>
            </div>
            <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <Button
            variant={triggerVariant}
            size="sm"
            className={cn("rounded-md px-3 py-1 gap-2", triggerClassName)}
            {...triggerProps}
          >
            <ShieldCheck className="h-4 w-4" />
            {triggerLabel}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="rounded-xl p-4 sm:p-8 shadow-2xl w-[calc(100vw-2rem)] sm:w-full max-w-sm sm:max-w-2xl max-h-[90vh] overflow-y-auto mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="flex-shrink-0 p-2 bg-emerald-100 rounded-lg">
              <ShieldCheck className="h-6 w-6 text-emerald-600" />
            </div>
            <span>Buyer Protection</span>
          </DialogTitle>
          <DialogDescription className="mt-2 text-base">
            Your funds are protected on every purchase. We ensure safe, secure transactions for all ReBooked Solutions customers.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* How It Works Section */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-900 flex items-center gap-2 mb-3">
              <Clock className="h-5 w-5 text-blue-600" />
              How Buyer Protection Works
            </h3>
            <ol className="space-y-2 text-sm text-blue-900">
              <li className="flex gap-3">
                <span className="font-semibold text-blue-600 flex-shrink-0">1.</span>
                <span>You purchase a book and payment is securely held in escrow</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-blue-600 flex-shrink-0">2.</span>
                <span>The seller ships your book and provides tracking information</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-blue-600 flex-shrink-0">3.</span>
                <span>You receive and verify the book condition and details</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-blue-600 flex-shrink-0">4.</span>
                <span>Payment is released to the seller after your buyer confirmation</span>
              </li>
            </ol>
          </div>

          {/* Key Protections Section */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 text-lg">Your Protections</h3>
            <div className="space-y-3">
              <div className="flex gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-900 text-sm mb-0.5">Secure Escrow Payment</p>
                  <p className="text-xs text-green-800">Your payment is held securely and not released until you confirm receipt and satisfaction</p>
                </div>
              </div>

              <div className="flex gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900 text-sm mb-0.5">Refund Guarantee</p>
                  <p className="text-xs text-amber-800">If the book doesn't match the listing or isn't received, you're eligible for a full refund after review</p>
                </div>
              </div>

              <div className="flex gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <MessageCircle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-purple-900 text-sm mb-0.5">Dispute Resolution</p>
                  <p className="text-xs text-purple-800">Our support team reviews disputes fairly and works to resolve issues quickly</p>
                </div>
              </div>
            </div>
          </div>

          {/* What to Do Section */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-gray-600" />
              Tips for a Smooth Transaction
            </h3>
            <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside">
              <li>Save tracking information from the seller</li>
              <li>Take photos when the book arrives to document its condition</li>
              <li>Check that the book matches the listing description (title, author, condition)</li>
              <li>Report any issues promptly with photographic evidence</li>
            </ul>
          </div>

          {/* Platform Fee Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">About Our Platform Fee</h3>
            <p className="text-sm text-blue-900 leading-relaxed">
              A R20 platform fee is applied to each purchase. This covers secure payment processing, buyer protection, dispute resolution, and platform maintenance to ensure a safe experience for all users.
            </p>
          </div>

          {/* Payment Issues Section */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="font-semibold text-amber-900 mb-2">Payment Issues?</h3>
            <p className="text-sm text-amber-900 leading-relaxed">
              If you experience any payment-related issues, please email us at <a href="mailto:payments@rebookedsolutions.co.za" className="underline font-semibold">payments@rebookedsolutions.co.za</a> with details of your concern and we'll help resolve it promptly.
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-3 justify-end">
          <DialogClose asChild>
            <Button variant="outline" size="sm">
              Close
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
              I Understand
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BuyersProtectionDialog;
