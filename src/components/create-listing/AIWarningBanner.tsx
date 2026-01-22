import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";

interface AIWarningBannerProps {
  visible: boolean;
  onDismiss?: () => void;
}

export const AIWarningBanner = ({ visible, onDismiss }: AIWarningBannerProps) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (!visible || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  return (
    <div className="mb-6">
      <Alert className="border-amber-200 bg-amber-50 text-amber-900 relative">
        <AlertTriangle className="h-5 w-5 text-amber-600" />
        <AlertTitle className="text-amber-900 font-semibold flex items-center gap-2">
          Review AI-Generated Details
        </AlertTitle>
        <AlertDescription className="text-amber-800 mt-2">
          <p className="mb-2">
            AI-generated details may not always be 100% accurate. Please double-check:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>ISBN numbers</li>
            <li>Book titles and authors</li>
            <li>Book editions and condition assessment</li>
            <li>Pricing before publishing</li>
          </ul>
        </AlertDescription>
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-amber-600 hover:text-amber-700 transition-colors"
          aria-label="Dismiss warning"
        >
          <X className="h-4 w-4" />
        </button>
      </Alert>
    </div>
  );
};
