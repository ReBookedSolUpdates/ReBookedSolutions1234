import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookFormData } from "@/types/book";
import { AlertCircle, CheckCircle } from "lucide-react";

interface ExtractedBookData {
  title: string;
  author: string;
  isbn?: string;
  description: string;
  condition: "New" | "Good" | "Better" | "Average" | "Below Average";
  grade?: string;
  curriculum?: "CAPS" | "Cambridge" | "IEB";
  category?: string;
  estimatedPrice?: number;
  quantity: number;
  confidence?: Record<string, number>;
}

interface AIPreviewModalProps {
  open: boolean;
  extractedData: ExtractedBookData | null;
  isLoading?: boolean;
  onAccept: (data: Partial<BookFormData>) => void;
  onCancel: () => void;
  onRetry?: () => void;
}

const ConfidenceIndicator = ({ value }: { value: number | undefined }) => {
  if (!value) return null;

  const percentage = Math.round(value);
  let colorClass = "text-green-600";
  
  if (percentage < 70) {
    colorClass = "text-orange-600";
  } else if (percentage < 85) {
    colorClass = "text-yellow-600";
  }

  return (
    <span className={`text-xs font-medium ${colorClass}`}>
      {percentage}% confidence
    </span>
  );
};

const PreviewField = ({
  label,
  value,
  confidence,
  isEmpty = false,
}: {
  label: string;
  value: string | number | undefined;
  confidence?: number;
  isEmpty?: boolean;
}) => {
  return (
    <div className="py-3 border-b last:border-b-0">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {label}
          </p>
          {isEmpty ? (
            <p className="text-sm text-gray-400 italic mt-1">Not detected</p>
          ) : (
            <p className="text-sm font-medium text-gray-900 mt-1 break-words">
              {value}
            </p>
          )}
        </div>
        {!isEmpty && confidence && (
          <div className="ml-4 flex-shrink-0">
            <ConfidenceIndicator value={confidence} />
          </div>
        )}
        {isEmpty && (
          <AlertCircle className="h-4 w-4 text-orange-500 ml-2 flex-shrink-0 mt-1" />
        )}
      </div>
    </div>
  );
};

export const AIPreviewModal = ({
  open,
  extractedData,
  isLoading = false,
  onAccept,
  onCancel,
  onRetry,
}: AIPreviewModalProps) => {
  const [adjustedPrice, setAdjustedPrice] = useState<string>("");

  const displayPrice = adjustedPrice ? parseFloat(adjustedPrice) : (extractedData?.estimatedPrice || 0);

  const handleAccept = () => {
    if (!extractedData) return;

    const formDataUpdate: Partial<BookFormData> = {
      title: extractedData.title,
      author: extractedData.author,
      description: extractedData.description,
      price: adjustedPrice ? parseFloat(adjustedPrice) : (extractedData.estimatedPrice || 0),
      condition: extractedData.condition,
      quantity: extractedData.quantity,
    };

    if (extractedData.isbn) {
      (formDataUpdate as any).isbn = extractedData.isbn;
    }
    if (extractedData.grade) {
      formDataUpdate.grade = extractedData.grade;
    }
    if (extractedData.curriculum) {
      (formDataUpdate as any).curriculum = extractedData.curriculum;
    }
    if (extractedData.category) {
      (formDataUpdate as any).category = extractedData.category;
    }
    if ((extractedData as any).frontCover) {
      formDataUpdate.frontCover = (extractedData as any).frontCover;
    }
    if ((extractedData as any).backCover) {
      formDataUpdate.backCover = (extractedData as any).backCover;
    }
    if ((extractedData as any).insidePages) {
      formDataUpdate.insidePages = (extractedData as any).insidePages;
    }
    if ((extractedData as any).curriculum) {
      (formDataUpdate as any).curriculum = (extractedData as any).curriculum;
    }
    if ((extractedData as any).genre) {
      (formDataUpdate as any).genre = (extractedData as any).genre;
    }
    if ((extractedData as any).university) {
      formDataUpdate.university = (extractedData as any).university;
    }
    if ((extractedData as any).universityYear) {
      formDataUpdate.universityYear = (extractedData as any).universityYear;
    }

    onAccept(formDataUpdate);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="sm:max-w-sm rounded-2xl p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Review AI-Extracted Details
          </DialogTitle>
          <DialogDescription>
            Please verify the extracted book information before accepting. You can always
            edit these details in the form.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center">
            <div className="inline-flex items-center justify-center">
              <div className="h-8 w-8 border-4 border-gray-200 border-t-book-600 rounded-full animate-spin" />
            </div>
            <p className="text-sm text-gray-600 mt-4">Processing images...</p>
          </div>
        ) : extractedData ? (
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-gray-50">
              <PreviewField
                label="Title"
                value={extractedData.title}
                confidence={extractedData.confidence?.title}
                isEmpty={!extractedData.title}
              />
              <PreviewField
                label="Author"
                value={extractedData.author}
                confidence={extractedData.confidence?.author}
                isEmpty={!extractedData.author}
              />
              <PreviewField
                label="ISBN"
                value={extractedData.isbn}
                confidence={extractedData.confidence?.isbn}
                isEmpty={!extractedData.isbn}
              />
              <PreviewField
                label="Condition"
                value={extractedData.condition}
                confidence={extractedData.confidence?.condition}
              />
              {extractedData.grade && (
                <PreviewField
                  label="Grade"
                  value={extractedData.grade}
                />
              )}
              {extractedData.curriculum && (
                <PreviewField
                  label="Curriculum"
                  value={extractedData.curriculum}
                />
              )}
              {extractedData.category && (
                <PreviewField
                  label="Category"
                  value={extractedData.category}
                />
              )}
              {(extractedData as any).universityYear && (
                <PreviewField
                  label="University Year"
                  value={(extractedData as any).universityYear}
                />
              )}
              {(extractedData as any).genre && (
                <PreviewField
                  label="Genre"
                  value={(extractedData as any).genre}
                />
              )}
              {((extractedData as any).frontCover || (extractedData as any).backCover || (extractedData as any).insidePages) && (
                <div className="py-3 border-b">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Book Images
                  </p>
                  <div className="flex gap-2 mt-2">
                    {(extractedData as any).frontCover && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-green-50 border border-green-200 rounded text-xs">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span className="text-green-700">Front Cover</span>
                      </div>
                    )}
                    {(extractedData as any).backCover && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-green-50 border border-green-200 rounded text-xs">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span className="text-green-700">Back Cover</span>
                      </div>
                    )}
                    {(extractedData as any).insidePages && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-green-50 border border-green-200 rounded text-xs">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span className="text-green-700">Inside Pages</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="py-3 border-b">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Estimated Price (ZAR)
                </p>
                <div className="flex items-end gap-2 mt-2">
                  <div className="flex-1">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={adjustedPrice || extractedData.estimatedPrice || ""}
                      onChange={(e) => setAdjustedPrice(e.target.value)}
                      placeholder={`R${extractedData.estimatedPrice?.toFixed(2)}`}
                      className="text-sm"
                    />
                  </div>
                  {extractedData.confidence?.price && (
                    <div className="text-xs font-medium text-gray-500">
                      {Math.round(extractedData.confidence.price)}% confidence
                    </div>
                  )}
                </div>
              </div>
              <div className="py-3 border-b last:border-b-0">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Description
                </p>
                <p className="text-sm text-gray-700 mt-1 line-clamp-4">
                  {extractedData.description}
                </p>
                {extractedData.condition && (
                  <p className="text-xs text-gray-600 mt-2 pt-2 border-t">
                    <span className="font-medium">Overall Condition:</span> {extractedData.condition}
                  </p>
                )}
              </div>
            </div>

            {Object.values(extractedData.confidence || {}).some((c) => c < 70) && (
              <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                  Some fields have low confidence. Please review carefully and edit as needed.
                </p>
              </div>
            )}
          </div>
        ) : null}

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          {onRetry && !isLoading && (
            <Button
              variant="outline"
              onClick={onRetry}
              className="flex-1"
            >
              Try Again
            </Button>
          )}
          <Button
            onClick={handleAccept}
            disabled={isLoading || !extractedData}
            className="flex-1 bg-book-600 hover:bg-book-700"
          >
            Accept & Auto-Fill
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
