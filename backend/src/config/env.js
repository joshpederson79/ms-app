import 'dotenv/config';

// Trailing slash removed so a pasted URL like "https://app.vercel.app/" still matches the browser's Origin header.
const stripSlash = (url) => url.replace(/\/+$/, '');

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiration: process.env.JWT_EXPIRATION || '7d',
  frontendUrl: stripSlash(process.env.FRONTEND_URL || 'http://localhost:5173'),
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    bucket: process.env.SUPABASE_STORAGE_BUCKET || 'recordings',
  },
};
