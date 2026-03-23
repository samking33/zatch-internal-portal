import { z } from 'zod';

export const updateSellerStatusSchema = z.object({
  action: z.enum(['approve', 'reject']),
  note: z.string().max(500).optional(),
});

export type UpdateSellerStatusInput = z.infer<typeof updateSellerStatusSchema>;
