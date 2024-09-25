import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';


dotenv.config({ path: path.join(process.cwd(), '.env') });

const envVarsSchema = z.object({
  NODE_ENV: z.enum(['production', 'development', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  JWT_SECRET: z.string(),
  JWT_ACCESS_EXPIRATION_MINUTES: z.coerce.number().default(30),
  JWT_REFRESH_EXPIRATION_DAYS: z.coerce.number().default(30),
  JWT_RESET_PASSWORD_EXPIRATION_MINUTES: z.coerce.number().default(10),
  JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: z.coerce.number().default(10),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.coerce.number(),
  SMTP_USERNAME: z.string(),
  SMTP_PASSWORD: z.string(),
  EMAIL_FROM: z.string(),
  FAST2SMS_API_KEY: z.string(),
  CLOUDFLARE_TURNSTILE_SECRET_KEY: z.string(),
  SERVER_URL: z.string().default('http://localhost:4000'),
  CLIENT_URL: z.string().default('http://localhost:3000'),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_CALLBACK_URL: z.string(),
  REDIS_URL: z.string(),
  LOGTAIL_API_KEY: z.string(),
})

const parsedSchema = envVarsSchema.safeParse(process.env);
if (parsedSchema.success === false) {
  console.error(parsedSchema.error.errors);
  process.exit(1);
}
const envVars = parsedSchema.data;
export const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  serverUrl: envVars.SERVER_URL,
  clientUrl: envVars.CLIENT_URL,
  redisUrl: envVars.REDIS_URL,
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES
  },
  oauth: {
    google: {
      clientId: envVars.GOOGLE_CLIENT_ID,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET,
      callbackURL: envVars.GOOGLE_CALLBACK_URL
    }
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
    fast2sms: envVars.FAST2SMS_API_KEY,
    logtail: envVars.LOGTAIL_API_KEY
  },
  cloudflare: {
    turnstile: {
      secretKey: envVars.CLOUDFLARE_TURNSTILE_SECRET_KEY
    }
  },
  logs: {
    level: process.env.LOG_LEVEL || 'silly',
  },
  allowedOrigins: ['http://localhost:3000','http://localhost:4000', 'https://okdm.me'],
  
};
