import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';

import { Pool } from 'pg';
import { PrismaService } from '@backend-template/src/database/prisma.service';
import fs from 'fs';
import path from 'path';

export const createMemDb = async (): Promise<{
  prismaService: PrismaService;
  cleanup: () => Promise<void>;
}> => {
  console.log('[E2E] Starting isolated PostgreSQL container...');
  const container: StartedPostgreSqlContainer = await new PostgreSqlContainer(
    'postgres:15-alpine',
  )
    .withDatabase('test_db')
    .withUsername('test_user')
    .withPassword('test_pass')
    .start();

  const connectionString = container.getConnectionUri();
  console.log(`[E2E] Container started at: ${connectionString}`);

  // Create a pool connected to the container
  const pool = new Pool({ connectionString });

  // Run migrations
  console.log('[E2E] Applying migrations...');
  const migrationsDir = path.join(__dirname, '../../../../prisma/migrations');

  if (fs.existsSync(migrationsDir)) {
    const entries = fs.readdirSync(migrationsDir, { withFileTypes: true });
    const migrationFolders = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();

    for (const folder of migrationFolders) {
      const migrationFile = path.join(migrationsDir, folder, 'migration.sql');
      if (fs.existsSync(migrationFile)) {
        const sql = fs.readFileSync(migrationFile, 'utf-8');
        const client = await pool.connect();
        try {
          await client.query(sql);
        } finally {
          client.release();
        }
      }
    }
  }
  console.log('[E2E] Migrations applied.');

  // Inject the pool into PrismaService
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prismaService = new PrismaService(pool as any);

  return {
    prismaService,
    cleanup: async () => {
      console.log('[E2E] Stopping container...');
      await pool.end();
      await container.stop();
      console.log('[E2E] Container stopped.');
    },
  };
};
