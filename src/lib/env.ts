import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  REDIS_URL: z.string().min(1, "REDIS_URL is required"),
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),
  WHATSAPP_SESSION_SECRET: z.string().min(1, "WHATSAPP_SESSION_SECRET is required"),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  VITE_APP_URL: z.string().url().optional(),
  WEBHOOK_SECRET: z.string().optional(),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  REDIS_URL: process.env.REDIS_URL,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  WHATSAPP_SESSION_SECRET: process.env.WHATSAPP_SESSION_SECRET,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  VITE_APP_URL: process.env.VITE_APP_URL,
  WEBHOOK_SECRET: process.env.WEBHOOK_SECRET,
});
