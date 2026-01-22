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
              "w-full rounded-lg border border-green-200 bg-green-50 px-4 py-3 flex items-center gap-3 hover:bg-green-100 transition-colors",
              triggerClassName,
            )}
            aria-label={triggerLabel}
          >
            <ShieldCheck className="h-5 w-5 text-green-600 flex-shrink-0" />
            <div className="flex-1 text-left">
              <div className="font-medium text-sm text-gray-900">{triggerLabel}</div>
              <div className="text-xs text-gray-600">Applied to all purchases</div>
            </div>
            <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <DialogContent className="rounded-xl p-4 sm:p-6 w-[calc(100vw-1rem)] sm:w-full max-w-xl sm:max-w-2xl max-h-[85vh] overflow-y-auto mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
            <ShieldCheck className="h-5 w-5 text-green-600 flex-shrink-0" />
            <span>Buyer Protection</span>
          </DialogTitle>
          <DialogDescription className="mt-2 text-xs sm:text-sm text-gray-600">
            Your funds are protected through our secure escrow system.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-5 mt-4 sm:mt-6">
          {/* How It Works Section */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base flex items-center gap-2">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
              How Buyer Protection Works
            </h3>
            <ol className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-700 ml-6">
              <li className="flex gap-2">
                <span className="font-medium text-gray-600 flex-shrink-0">1.</span>
                <span>Payment held securely until you confirm</span>
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-gray-600 flex-shrink-0">2.</span>
                <span>Seller ships with tracking info</span>
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-gray-600 flex-shrink-0">3.</span>
                <span>You verify the book</span>
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-gray-600 flex-shrink-0">4.</span>
                <span>Payment released to seller</span>
              </li>
            </ol>
          </div>

          {/* Key Protections Section */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">What You Get</h3>
            <div className="space-y-2">
              <div className="flex gap-2 sm:gap-3 p-2 sm:p-3 rounded border border-gray-200 bg-white">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-xs sm:text-sm">Secure Escrow</p>
                  <p className="text-xs text-gray-600 mt-0.5">Payment held until you confirm</p>
                </div>
              </div>

              <div className="flex gap-2 sm:gap-3 p-2 sm:p-3 rounded border border-gray-200 bg-white">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-xs sm:text-sm">Refund Guarantee</p>
                  <p className="text-xs text-gray-600 mt-0.5">Full refund if doesn't match</p>
                </div>
              </div>

              <div className="flex gap-2 sm:gap-3 p-2 sm:p-3 rounded border border-gray-200 bg-white">
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-xs sm:text-sm">Dispute Support</p>
                  <p className="text-xs text-gray-600 mt-0.5">We review and resolve issues</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Quick Tips</h3>
            <ul className="space-y-1 text-xs sm:text-sm text-gray-700">
              <li className="flex gap-2">
                <span className="text-gray-400 flex-shrink-0">•</span>
                <span>Save tracking info</span>
              </li>
              <li className="flex gap-2">
                <span className="text-gray-400 flex-shrink-0">•</span>
                <span>Take photos when it arrives</span>
              </li>
              <li className="flex gap-2">
                <span className="text-gray-400 flex-shrink-0">•</span>
                <span>Verify it matches the listing</span>
              </li>
            </ul>
          </div>

          {/* Platform Fee Section */}
          <div className="bg-green-50 rounded border border-green-200 p-2.5 sm:p-3">
            <p className="text-xs sm:text-sm text-gray-700"><span className="font-medium text-green-900">R20 Platform Fee:</span> <span className="text-gray-600">Payment processing & support</span></p>
          </div>
        </div>

        <div className="mt-4 sm:mt-6">
          <DialogClose asChild>
            <Button variant="outline" className="w-full text-sm sm:text-base">
              Got It
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BuyersProtectionDialog;
