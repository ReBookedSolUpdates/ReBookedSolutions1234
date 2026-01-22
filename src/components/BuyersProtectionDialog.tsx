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
      <DialogContent className="rounded-2xl p-2 sm:p-6 w-[calc(100vw-1rem)] sm:w-full max-w-xs sm:max-w-2xl max-h-[85vh] sm:max-h-[85vh] overflow-y-auto custom-scrollbar mx-auto">
        <DialogHeader className="pb-3 sm:pb-4">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-xl">
            <ShieldCheck className="h-4 w-4 sm:h-6 sm:w-6 text-green-600 flex-shrink-0" />
            <span>Buyer Protection</span>
          </DialogTitle>
          <DialogDescription className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">
            How your money is kept safe on every purchase.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4">
          {/* How It Works Section */}
          <div className="pb-3 border-b">
            <h3 className="font-semibold text-gray-900 mb-2 text-xs sm:text-base flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-green-600 flex-shrink-0" />
              How It Works
            </h3>
            <ol className="space-y-1 text-[11px] sm:text-sm text-gray-700 ml-5">
              <li><span className="font-medium text-gray-600">1.</span> You buy, we hold your payment</li>
              <li><span className="font-medium text-gray-600">2.</span> Seller ships the book with tracking</li>
              <li><span className="font-medium text-gray-600">3.</span> You verify it matches the listing</li>
              <li><span className="font-medium text-gray-600">4.</span> You confirm, we release payment</li>
            </ol>
          </div>

          {/* Key Protections Section */}
          <div className="pb-3 border-b">
            <h3 className="font-semibold text-gray-900 mb-1.5 text-xs sm:text-base">Your Protections</h3>
            <div className="space-y-1.5">
              <div className="flex gap-2 p-2 rounded border border-gray-200 bg-white">
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="min-w-0 text-[11px] sm:text-sm">
                  <p className="font-medium text-gray-900">Safe Payment Hold</p>
                  <p className="text-gray-600">Your money stays with us until you're happy with the book</p>
                </div>
              </div>

              <div className="flex gap-2 p-2 rounded border border-gray-200 bg-white">
                <AlertCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="min-w-0 text-[11px] sm:text-sm">
                  <p className="font-medium text-gray-900">Money-Back Guarantee</p>
                  <p className="text-gray-600">Get refunded if the book doesn't match the description or doesn't arrive</p>
                </div>
              </div>

              <div className="flex gap-2 p-2 rounded border border-gray-200 bg-white">
                <MessageCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="min-w-0 text-[11px] sm:text-sm">
                  <p className="font-medium text-gray-900">Dispute Help</p>
                  <p className="text-gray-600">We step in to help resolve any disagreements between you and the seller</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div className="pb-3 border-b">
            <h3 className="font-semibold text-gray-900 mb-1.5 text-xs sm:text-base">To Protect Yourself</h3>
            <ul className="space-y-1 text-[11px] sm:text-sm text-gray-700">
              <li>• Keep the seller's tracking number</li>
              <li>• Take photos of the book when it arrives</li>
              <li>• Check it matches the listing details</li>
              <li>• Report issues within 48 hours with photos</li>
            </ul>
          </div>

          {/* Info Section */}
          <div className="space-y-2 text-[11px] sm:text-sm text-gray-600">
            <p className="text-center"><span className="font-medium text-green-900">R20 Platform Fee</span> per purchase covers payment processing, protection service, and support.</p>
            <p className="text-center">Having payment issues? Email <a href="mailto:payments@rebookedsolutions.co.za" className="font-medium text-blue-600 hover:underline">payments@rebookedsolutions.co.za</a></p>
          </div>
        </div>

        <div className="mt-3 sm:mt-4 pt-3 border-t">
          <DialogClose asChild>
            <Button variant="outline" className="w-full text-xs sm:text-sm py-2 sm:py-2.5">
              I Understand
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BuyersProtectionDialog;
