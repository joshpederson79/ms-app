import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';

// Usage: npm run set-password -w backend -- someone@example.com
// Sets a new password for an existing user (the fallback when nobody can reset it in the app).
// The password is typed at a hidden prompt so it never lands in shell history.
const MIN_LENGTH = 8; // same rule as sign-up

const email = process.argv[2];
if (!email) {
  console.error('Usage: npm run set-password -w backend -- <email>');
  process.exit(1);
}

const readHidden = (prompt) =>
  new Promise((resolve) => {
    if (!process.stdin.isTTY) {
      // Piped input (scripts/tests): read everything up to end of stream.
      let data = '';
      process.stdin.on('data', (chunk) => (data += chunk)).on('end', () => resolve(data.trim()));
      return;
    }
    process.stdout.write(prompt);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    let typed = '';
    const onKey = (key) => {
      if (key === '\r' || key === '\n') {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdin.off('data', onKey);
        process.stdout.write('\n');
        resolve(typed);
      } else if (key === '\u0003') {
        process.exit(130); // Ctrl+C
      } else if (key === '\u007f') {
        typed = typed.slice(0, -1); // backspace
      } else {
        typed += key;
      }
    };
    process.stdin.on('data', onKey);
  });

try {
  const password = await readHidden('New password: ');
  if (password.length < MIN_LENGTH) throw new Error(`Password must be at least ${MIN_LENGTH} characters.`);
  if (process.stdin.isTTY && (await readHidden('Confirm password: ')) !== password) throw new Error('Passwords did not match.');

  const { rowCount } = await pool.query('UPDATE users SET password_hash = $1 WHERE email = $2', [
    await bcrypt.hash(password, 10),
    email.trim().toLowerCase(),
  ]);
  if (rowCount === 0) throw new Error(`No user found with email ${email}.`);
  console.log(`Password updated for ${email}. Log in with the new password.`);
} catch (err) {
  console.error(err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
