import { z } from 'zod';

import { Role } from '../types/user.types';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const accessTokenPayloadSchema = z.object({
  userId: z.string().min(1),
  email: z.string().email(),
  role: z.nativeEnum(Role),
});

export const authTokensSchema = z.object({
  accessToken: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type AccessTokenPayload = z.infer<typeof accessTokenPayloadSchema>;
export type AuthTokens = z.infer<typeof authTokensSchema>;
