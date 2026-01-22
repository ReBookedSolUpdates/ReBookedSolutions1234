import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, AlertTriangle, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { compressImage } from "@/utils/imageCompression";
import { BookFormData } from "@/types/book";
import { AIPreviewModal } from "./AIPreviewModal";

interface AIAnalysisModalProps {
  open: boolean;
  onClose: () => void;
  onAnalysisComplete: (extractedData: Partial<BookFormData>) => void;
  bookType: "school" | "university" | "reader";
}

interface UploadedImages {
  frontCover: string;
  backCover: string;
  insidePages: string;
}

interface AnalysisState {
  uploadedImages: UploadedImages;
  curriculum?: "CAPS" | "Cambridge" | "IEB";
  grade?: string;
  isAnalyzing: boolean;
  analysisError: string | null;
  showPreview: boolean;
  extractedData: any;
}

const AIAnalysisModal = ({
  open,
  onClose,
  onAnalysisComplete,
  bookType,
}: AIAnalysisModalProps) => {
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [state, setState] = useState<AnalysisState>({
    uploadedImages: {
      frontCover: "",
      backCover: "",
      insidePages: "",
    },
    curriculum: undefined,
    grade: undefined,
    isAnalyzing: false,
    analysisError: null,
    showPreview: false,
    extractedData: null,
  });

  const curricula = ["CAPS", "Cambridge", "IEB"];
  const grades = [
    "N/A",
    "Grade 1",
    "Grade 2",
    "Grade 3",
    "Grade 4",
    "Grade 5",
    "Grade 6",
    "Grade 7",
    "Grade 8",
    "Grade 9",
    "Grade 10",
    "Grade 11",
    "Grade 12",
    "Study Guide",
    "Course Book",
  ];

  const uploadImage = async (file: File): Promise<string> => {
    const compressed = await compressImage(file, {
      maxWidth: 1600,
      maxHeight: 1600,
      quality: 0.8,
      format: "image/webp",
    });

    const fileName = `${Math.random()}.${compressed.extension}`;
    const filePath = `book-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("book-images")
      .upload(filePath, compressed.blob, {
        upsert: false,
        cacheControl: "31536000",
        contentType: compressed.mimeType,
      });

    if (uploadError) {
      throw uploadError;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("book-images").getPublicUrl(filePath);

    return publicUrl;
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    imageKey: keyof UploadedImages,
    label: string
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // File validation
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("File size must be less than 10MB");
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/heic",
      "image/heif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPG, PNG, HEIC, WebP)");
      return;
    }

    const imageIndex = Object.keys(state.uploadedImages).indexOf(imageKey);
    setUploadingIndex(imageIndex);

    try {
      const imageUrl = await uploadImage(file);
      setState((prev) => ({
        ...prev,
        uploadedImages: {
          ...prev.uploadedImages,
          [imageKey]: imageUrl,
        },
      }));
      toast.success(`${label} uploaded successfully!`);
    } catch (error) {
      toast.error(`Failed to upload ${label}. Please try again.`);
    } finally {
      setUploadingIndex(null);
      event.target.value = "";
    }
  };

  const removeImage = (imageKey: keyof UploadedImages, label: string) => {
    setState((prev) => ({
      ...prev,
      uploadedImages: {
        ...prev.uploadedImages,
        [imageKey]: "",
      },
    }));
    toast.success(`${label} removed`);
  };

  const allImagesUploaded =
    state.uploadedImages.frontCover &&
    state.uploadedImages.backCover &&
    state.uploadedImages.insidePages;

  const handleAnalyze = async () => {
    if (!allImagesUploaded) {
      toast.error("All three images must be uploaded");
      return;
    }

    setState((prev) => ({
      ...prev,
      isAnalyzing: true,
      analysisError: null,
    }));

    try {
      const { data, error } = await supabase.functions.invoke(
        "extract-book-details",
        {
          body: {
            frontCoverUrl: state.uploadedImages.frontCover,
            backCoverUrl: state.uploadedImages.backCover,
            insidePagesUrl: state.uploadedImages.insidePages,
            hints: {
              curriculum: state.curriculum,
              grade: state.grade,
            },
          },
        }
      );

      if (error || !data.success) {
        throw new Error(data?.message || "Failed to extract book details");
      }

      setState((prev) => ({
        ...prev,
        extractedData: data.data,
        showPreview: true,
        isAnalyzing: false,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setState((prev) => ({
        ...prev,
        analysisError: errorMessage,
        isAnalyzing: false,
      }));
      toast.error(`AI analysis failed: ${errorMessage}`);
    }
  };

  const handlePreviewAccept = (extractedData: Partial<BookFormData>) => {
    setState((prev) => ({
      ...prev,
      showPreview: false,
      uploadedImages: {
        frontCover: "",
        backCover: "",
        insidePages: "",
      },
      curriculum: undefined,
      grade: undefined,
      analysisError: null,
    }));
    onAnalysisComplete(extractedData);
    onClose();
  };

  const handlePreviewCancel = () => {
    setState((prev) => ({
      ...prev,
      showPreview: false,
      extractedData: null,
    }));
  };

  const handleClose = () => {
    if (!state.isAnalyzing && !state.showPreview) {
      setState({
        uploadedImages: {
          frontCover: "",
          backCover: "",
          insidePages: "",
        },
        curriculum: undefined,
        grade: undefined,
        isAnalyzing: false,
        analysisError: null,
        showPreview: false,
        extractedData: null,
      });
      onClose();
    }
  };

  const ImageUploadSlot = ({
    label,
    imageKey,
    imageUrl,
    isUploading,
  }: {
    label: string;
    imageKey: keyof UploadedImages;
    imageUrl: string;
    isUploading: boolean;
  }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="relative">
        {imageUrl ? (
          <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={imageUrl}
              alt={label}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => removeImage(imageKey, label)}
              disabled={isUploading}
              className="absolute top-2 right-2 p-1 bg-white rounded-lg shadow hover:bg-gray-50 disabled:opacity-50"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        ) : (
          <label className="w-full aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, imageKey, label)}
              disabled={isUploading}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-2 text-center">
              {isUploading ? (
                <>
                  <Loader2 className="h-6 w-6 text-book-600 animate-spin" />
                  <span className="text-xs font-medium text-gray-600">
                    Uploading...
                  </span>
                </>
              ) : (
                <>
                  <Upload className="h-6 w-6 text-gray-400" />
                  <span className="text-xs font-medium text-gray-600">
                    Upload {label}
                  </span>
                </>
              )}
            </div>
          </label>
        )}
      </div>
    </div>
  );

  return (
    <>
      <Dialog open={open && !state.showPreview} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>AI Book Analysis</DialogTitle>
            <DialogDescription>
              Upload photos of your book to extract details automatically. All
              three images are required.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Image Upload Section */}
            <div className="space-y-3">
              <ImageUploadSlot
                label="Front Cover"
                imageKey="frontCover"
                imageUrl={state.uploadedImages.frontCover}
                isUploading={uploadingIndex === 0}
              />
              <ImageUploadSlot
                label="Back Cover"
                imageKey="backCover"
                imageUrl={state.uploadedImages.backCover}
                isUploading={uploadingIndex === 1}
              />
              <ImageUploadSlot
                label="Inside Pages"
                imageKey="insidePages"
                imageUrl={state.uploadedImages.insidePages}
                isUploading={uploadingIndex === 2}
              />
            </div>

            {/* Curriculum and Grade Selection (visible only after images uploaded) */}
            {allImagesUploaded && (
              <div className="border-t pt-4 space-y-3">
                <p className="text-sm font-medium text-gray-700">
                  Optional: Help AI identify details
                </p>
                <div>
                  <Label htmlFor="curriculum" className="text-sm">
                    Curriculum
                  </Label>
                  <Select
                    value={state.curriculum || ""}
                    onValueChange={(value) =>
                      setState((prev) => ({
                        ...prev,
                        curriculum: value as "CAPS" | "Cambridge" | "IEB",
                      }))
                    }
                  >
                    <SelectTrigger id="curriculum" className="mt-1">
                      <SelectValue placeholder="Select curriculum (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {curricula.map((curr) => (
                          <SelectItem key={curr} value={curr}>
                            {curr}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="grade" className="text-sm">
                    Grade
                  </Label>
                  <Select
                    value={state.grade || ""}
                    onValueChange={(value) =>
                      setState((prev) => ({
                        ...prev,
                        grade: value,
                      }))
                    }
                  >
                    <SelectTrigger id="grade" className="mt-1">
                      <SelectValue placeholder="Select grade (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {grades.map((g) => (
                          <SelectItem key={g} value={g}>
                            {g}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Error Message */}
            {state.analysisError && (
              <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-700">{state.analysisError}</p>
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={state.isAnalyzing}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAnalyze}
              disabled={!allImagesUploaded || state.isAnalyzing}
              className="flex-1 bg-book-600 hover:bg-book-700"
            >
              {state.isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <AIPreviewModal
        open={state.showPreview}
        extractedData={state.extractedData}
        isLoading={false}
        onAccept={handlePreviewAccept}
        onCancel={handlePreviewCancel}
      />
    </>
  );
};

export default AIAnalysisModal;
