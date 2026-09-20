import 'dotenv/config';

// Trailing slash removed so a pasted URL like "https://app.vercel.app/" still matches the browser's Origin header.
const stripSlash = (url) => url.replace(/\/+$/, '');

// FRONTEND_URL may list several comma-separated origins, e.g. the Vercel production domain plus its alias.
const parseOrigins = (value) => value.split(',').map((url) => stripSlash(url.trim())).filter(Boolean);

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiration: process.env.JWT_EXPIRATION || '7d',
  frontendUrls: parseOrigins(process.env.FRONTEND_URL || 'http://localhost:5173'),
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    bucket: process.env.SUPABASE_STORAGE_BUCKET || 'recordings',
  },
};
