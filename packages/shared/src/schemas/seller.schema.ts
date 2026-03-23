import { z } from 'zod';

const httpsUrlSchema = z
  .string()
  .url()
  .refine((value) => {
    try {
      return new URL(value).protocol === 'https:';
    } catch {
      return false;
    }
  }, 'Document URL must use HTTPS');

export const sellerDocumentSchema = z.object({
  type: z.enum(['pan', 'aadhaar', 'gst_certificate', 'other']),
  url: httpsUrlSchema,
  publicId: z.string().min(1).max(200),
});

export const sellerLocationSchema = z.preprocess(
  (value) => value ?? {},
  z.object({
    street: z.string().min(1, 'Street is required').max(300).trim(),
    city: z.string().min(1, 'City is required').max(100).trim(),
    state: z.string().min(1, 'State is required').max(100).trim(),
    pincode: z.string().regex(/^\d{6}$/, 'Pincode must be exactly 6 digits'),
  }),
);

export const sellerIntakeSchema = z.object({
  sellerName: z.string().min(1).max(200).trim(),
  businessName: z.string().min(1).max(200).trim(),
  email: z.string().email().toLowerCase(),
  phone: z.string().min(10).max(15),
  gstOrEnrollmentId: z.string().min(1).max(50).trim(),
  location: sellerLocationSchema,
  documents: z.array(sellerDocumentSchema).min(1, 'At least one document is required'),
  metadata: z.record(z.unknown()).optional(),
});

export const updateSellerStatusSchema = z.object({
  action: z.enum(['approve', 'reject']),
  note: z.string().max(500).optional(),
});

export type SellerIntakeInput = z.infer<typeof sellerIntakeSchema>;
export type UpdateSellerStatusInput = z.infer<typeof updateSellerStatusSchema>;
