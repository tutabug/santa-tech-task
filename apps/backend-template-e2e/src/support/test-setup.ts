import * as dotenv from 'dotenv';

import path from 'path';

module.exports = async function () {
  // Load environment variables from .env file at project root
  dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

  // If DATABASE_URL is not set, we can set a fallback or let it fail
  if (!process.env.DATABASE_URL) {
    console.warn(
      'WARNING: DATABASE_URL not found in environment. E2E tests might fail if they rely on real DB.',
    );
  }
};
