export interface BookMetadata {
  ai_assisted?: boolean;
  [key: string]: unknown;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  price: number;
  category: string;
  condition: "New" | "Good" | "Better" | "Average" | "Below Average";
  imageUrl: string;
  frontCover?: string;
  backCover?: string;
  insidePages?: string;
  additionalImages?: string[];
  sold: boolean;
  createdAt: string;
  itemType: "textbook" | "reader";
  grade?: string;
  universityYear?: string;
  university?: string;
  curriculum?: 'CAPS' | 'Cambridge' | 'IEB';
  isbn?: string;
  universityBookType?: 'Study Guide' | 'Course Book';
  genre?: string;
  province?: string;
  // Quantity fields
  initialQuantity?: number;
  availableQuantity?: number;
  soldQuantity?: number;
  metadata?: BookMetadata;
  seller: {
    id: string;
    name: string;
    email: string;
  };
}

export interface BookFormData {
  title: string;
  author: string;
  description: string;
  price: number;
  category: string;
  condition: "New" | "Good" | "Better" | "Average" | "Below Average";
  imageUrl: string;
  frontCover?: string;
  backCover?: string;
  insidePages?: string;
  additionalImages?: string[];
  itemType: "textbook" | "reader";
  grade?: string;
  universityYear?: string;
  university?: string;
  curriculum?: 'CAPS' | 'Cambridge' | 'IEB';
  isbn?: string;
  universityBookType?: 'Study Guide' | 'Course Book';
  genre?: string;
  province?: string;
  // Quantity to create listing with
  quantity?: number;
}
