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
  ZATCH_UPSTREAM_API_URL: z.string().url().optional(),
  ZATCH_UPSTREAM_API_TOKEN: z.string().min(1).optional(),
  ZATCH_UPSTREAM_MONGODB_URI: mongodbUriSchema.optional(),
  ZATCH_UPSTREAM_MONGODB_DB_NAME: z.string().min(1).default('zatch'),
  ZATCH_UPSTREAM_SELLER_DETAIL_PATH: z.string().min(1).default('/api/v1/user/profile/:userId'),
  ZATCH_UPSTREAM_SELLER_APPROVAL_PATH: z.string().min(1).default('/api/v1/user/seller/approve'),
}).superRefine((value, context) => {
  if (!value.ZATCH_UPSTREAM_API_URL) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['ZATCH_UPSTREAM_API_URL'],
      message: 'ZATCH_UPSTREAM_API_URL is required',
    });
  }

  if (!value.ZATCH_UPSTREAM_API_TOKEN) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['ZATCH_UPSTREAM_API_TOKEN'],
      message: 'ZATCH_UPSTREAM_API_TOKEN is required',
    });
  }

  if (!value.ZATCH_UPSTREAM_MONGODB_URI) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['ZATCH_UPSTREAM_MONGODB_URI'],
      message: 'ZATCH_UPSTREAM_MONGODB_URI is required',
    });
  }
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
