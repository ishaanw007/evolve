import "dotenv/config"
import { z } from "zod"

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(10),
  JWT_EXPIRES_IN: z.string().default("7d"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_CALLBACK_URL: z.string().default("http://localhost:3000/auth/google/callback"),
  CLIENT_URL: z.string().default("http://localhost:5173"),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data

// --- Typesense environment variable validation ---

export const typesenseEnvSchema = z.object({
  TYPESENSE_HOST: z.string().min(1, "TYPESENSE_HOST is required"),
  TYPESENSE_PORT: z.coerce
    .number({ invalid_type_error: "TYPESENSE_PORT must be a valid integer" })
    .int("TYPESENSE_PORT must be an integer")
    .min(1, "TYPESENSE_PORT must be between 1 and 65535")
    .max(65535, "TYPESENSE_PORT must be between 1 and 65535"),
  TYPESENSE_PROTOCOL: z.enum(["http", "https"], {
    errorMap: () => ({ message: 'TYPESENSE_PROTOCOL must be "http" or "https"' }),
  }),
  TYPESENSE_API_KEY: z.string().min(1, "TYPESENSE_API_KEY is required"),
})

export type TypesenseEnv = z.infer<typeof typesenseEnvSchema>

function validateTypesenseEnv(): { success: true; data: TypesenseEnv } | { success: false; data: null } {
  const result = typesenseEnvSchema.safeParse(process.env)

  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors
    for (const [field, errors] of Object.entries(fieldErrors)) {
      if (errors && errors.length > 0) {
        console.error(`❌ Typesense config error: ${field} - ${errors[0]}`)
      }
    }
    console.error("❌ Search module initialization prevented due to invalid Typesense configuration")
    return { success: false, data: null }
  }

  return { success: true, data: result.data }
}

const typesenseResult = validateTypesenseEnv()

export const typesenseEnv: TypesenseEnv | null = typesenseResult.success ? typesenseResult.data : null
export const isTypesenseConfigured: boolean = typesenseResult.success
