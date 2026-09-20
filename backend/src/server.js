import app from './app.js';
import { env } from './config/env.js';

if (!env.jwtSecret) {
  console.warn('JWT_SECRET is not set; auth endpoints will fail. Copy .env.example to .env.');
}

app.listen(env.port, () => console.log(`API listening on http://localhost:${env.port}`));
