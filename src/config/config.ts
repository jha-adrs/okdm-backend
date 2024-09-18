import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';


dotenv.config({ path: path.join(process.cwd(), '.env') });

const envVarsSchema = z.object({
  NODE_ENV: z.enum(['production', 'development', 'test']),
  PORT: z.number().default(3000),
  JWT_SECRET: z.string(),
  JWT_ACCESS_EXPIRATION_MINUTES: z.number().default(30),
  JWT_REFRESH_EXPIRATION_DAYS: z.number().default(30),
  JWT_RESET_PASSWORD_EXPIRATION_MINUTES: z.number().default(10),
  JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: z.number().default(10),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.number(),
  SMTP_USERNAME: z.string(),
  SMTP_PASSWORD: z.string(),
  EMAIL_FROM: z.string(),
  FAST2SMS_API_KEY: z.string(),
  CLOUDFLARE_TURNSTILE_SECRET_KEY: z.string(),
  SERVER_URL: z.string().default('http://localhost:3000')
})

const envVars = envVarsSchema.parse(process.env);

export default {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  serverUrl: envVars.SERVER_URL,
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES
  },
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD
      }
    },
    from: envVars.EMAIL_FROM
  },
  api_keys: {
    fast2sms: envVars.FAST2SMS_API_KEY
  },
  cloudflare: {
    turnstile: {
      secretKey: envVars.CLOUDFLARE_TURNSTILE_SECRET_KEY
    }
  }
};
