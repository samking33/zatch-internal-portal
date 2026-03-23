import { z } from 'zod';

const isPlaceholderValue = (value: string): boolean =>
  /replace-me|<[^>]+>|mongodb\+srv:\/\/<username>/i.test(value);

const strongSecretSchema = z
  .string()
  .min(32, 'Secret must be at least 32 characters')
  .refine((value) => !isPlaceholderValue(value), 'Secret must not use a placeholder value');

const mongodbUriSchema = z
  .string()
  .min(1, 'MONGODB_URI is required')
  .refine(
    (value) => value.startsWith('mongodb://') || value.startsWith('mongodb+srv://'),
    'MONGODB_URI must be a valid MongoDB connection string',
  )
  .refine((value) => !isPlaceholderValue(value), 'MONGODB_URI must not use a placeholder value');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: mongodbUriSchema,
  JWT_ACCESS_SECRET: strongSecretSchema,
  JWT_REFRESH_SECRET: strongSecretSchema,
  JWT_ACCESS_EXPIRES_IN: z.string().min(1).default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().min(1).default('7d'),
  SESSION_SECRET: strongSecretSchema,
  CORS_ORIGIN: z.string().url('CORS_ORIGIN must be a valid URL'),
  COOKIE_DOMAIN: z.string().trim().min(1).optional(),
  SENTRY_DSN: z.string().optional(),
  MOBILE_API_KEY: z
    .string()
    .min(24, 'MOBILE_API_KEY must be at least 24 characters')
    .refine((value) => !isPlaceholderValue(value), 'MOBILE_API_KEY must not use a placeholder value'),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export const getEnv = (): Env => {
  if (cachedEnv) {
    return cachedEnv;
  }

  cachedEnv = envSchema.parse(process.env);
  return cachedEnv;
};
