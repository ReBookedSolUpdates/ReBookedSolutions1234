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

        <div className="space-y-5 mt-6">
          {/* How It Works Section */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-700" />
              How Buyer Protection Works
            </h3>
            <ol className="space-y-2 text-sm text-gray-700 ml-7">
              <li className="flex gap-2">
                <span className="font-medium text-gray-600 flex-shrink-0">1.</span>
                <span>Payment is held securely until you confirm receipt</span>
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-gray-600 flex-shrink-0">2.</span>
                <span>Seller ships the book with tracking information</span>
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-gray-600 flex-shrink-0">3.</span>
                <span>You verify the book matches the listing</span>
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-gray-600 flex-shrink-0">4.</span>
                <span>Payment releases to seller after confirmation</span>
              </li>
            </ol>
          </div>

          {/* Key Protections Section */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">What You Get</h3>
            <div className="space-y-2">
              <div className="flex gap-3 p-3 rounded border border-gray-200 bg-white">
                <CheckCircle2 className="h-5 w-5 text-gray-700 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 text-sm">Secure Escrow Payment</p>
                  <p className="text-xs text-gray-600 mt-0.5">Payment held until you confirm satisfaction</p>
                </div>
              </div>

              <div className="flex gap-3 p-3 rounded border border-gray-200 bg-white">
                <AlertCircle className="h-5 w-5 text-gray-700 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 text-sm">Refund Guarantee</p>
                  <p className="text-xs text-gray-600 mt-0.5">Full refund if book doesn't match description or isn't received</p>
                </div>
              </div>

              <div className="flex gap-3 p-3 rounded border border-gray-200 bg-white">
                <MessageCircle className="h-5 w-5 text-gray-700 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 text-sm">Dispute Resolution</p>
                  <p className="text-xs text-gray-600 mt-0.5">Our team reviews issues fairly and quickly</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">For a Smooth Transaction</h3>
            <ul className="space-y-1 text-sm text-gray-700">
              <li className="flex gap-2">
                <span className="text-gray-400">•</span>
                <span>Save the seller's tracking information</span>
              </li>
              <li className="flex gap-2">
                <span className="text-gray-400">•</span>
                <span>Take photos of the book when it arrives</span>
              </li>
              <li className="flex gap-2">
                <span className="text-gray-400">•</span>
                <span>Verify it matches the listing description</span>
              </li>
              <li className="flex gap-2">
                <span className="text-gray-400">•</span>
                <span>Report any issues with evidence</span>
              </li>
            </ul>
          </div>

          {/* Platform Fee Section */}
          <div className="bg-gray-50 rounded border border-gray-200 p-3">
            <p className="text-sm text-gray-700"><span className="font-medium">R20 Platform Fee:</span> Covers payment processing, protection, and support</p>
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
