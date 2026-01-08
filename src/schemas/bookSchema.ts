import { z } from 'zod';

export const BookSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(0, 'Price must be positive'),
  category: z.string().min(1, 'Category is required'),
  universityYear: z.string().optional(),
  university: z.string().optional(),
  grade: z.string().optional(),
  curriculum: z.enum(['CAPS', 'Cambridge', 'IEB']).optional(),
  isbn: z.string().optional(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').optional(),
  frontCover: z.string().optional(),
  backCover: z.string().optional(),
  insidePages: z.string().optional(),
  additionalImages: z.array(z.string()).optional(),
});

export type BookInput = z.infer<typeof BookSchema>;
