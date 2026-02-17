// Re-exporting the persistence schema (Prisma Model) to keep infrastructure details isolated
import { User as PrismaUser } from '@prisma/client';

export type UserSchema = PrismaUser;
