import { z } from 'zod';

/**
 * Normalize ISBN by removing hyphens and spaces
 * @param isbn - ISBN string with possible hyphens/spaces
 * @returns Normalized ISBN string
 */
function normalizeISBN(isbn: string): string {
  return isbn.replace(/[-\s]/g, '');
}

/**
 * Validate ISBN-10 format using check digit algorithm
 * @param isbn - 10-digit ISBN (no hyphens)
 * @returns true if valid ISBN-10
 */
function isValidISBN10(isbn: string): boolean {
  if (!/^\d{10}$/.test(isbn)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(isbn[i]) * (10 - i);
  }

  const checkDigit = parseInt(isbn[9]);
  const expectedCheckDigit = (11 - (sum % 11)) % 11;

  return checkDigit === expectedCheckDigit;
}

/**
 * Validate ISBN-13 format using check digit algorithm
 * @param isbn - 13-digit ISBN (no hyphens)
 * @returns true if valid ISBN-13
 */
function isValidISBN13(isbn: string): boolean {
  if (!/^\d{13}$/.test(isbn)) return false;

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(isbn[i]);
    const weight = i % 2 === 0 ? 1 : 3;
    sum += digit * weight;
  }

  const checkDigit = parseInt(isbn[12]);
  const expectedCheckDigit = (10 - (sum % 10)) % 10;

  return checkDigit === expectedCheckDigit;
}

/**
 * Validate ISBN (either ISBN-10 or ISBN-13 format)
 * @param isbn - ISBN string (may contain hyphens/spaces)
 * @returns true if valid ISBN
 */
function isValidISBN(isbn: string): boolean {
  if (!isbn) return true; // Optional field

  const normalized = normalizeISBN(isbn);
  return isValidISBN10(normalized) || isValidISBN13(normalized);
}

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
  isbn: z.string()
    .optional()
    .refine(
      (isbn) => !isbn || isValidISBN(isbn),
      {
        message: 'ISBN must be a valid ISBN-10 or ISBN-13 (with or without hyphens)'
      }
    )
    .transform((isbn) => isbn ? normalizeISBN(isbn) : undefined),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').optional(),
  frontCover: z.string().optional(),
  backCover: z.string().optional(),
  insidePages: z.string().optional(),
  additionalImages: z.array(z.string()).optional(),
});

export type BookInput = z.infer<typeof BookSchema>;
