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
        <AlertDescription className="text-amber-800 text-sm">
          ⚠️ Please double-check ISBN numbers, editions, and pricing. AI-generated data may contain inaccuracies.
        </AlertDescription>
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-4 text-amber-600 hover:text-amber-700 transition-colors"
          aria-label="Dismiss warning"
        >
          <X className="h-4 w-4" />
        </button>
      </Alert>
    </div>
  );
};
