import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// For server-side usage
const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
export const db = drizzle(client, { schema });

// Export types
export type CameraStream = typeof schema.cameraStreams.$inferSelect;
export type NewCameraStream = typeof schema.cameraStreams.$inferInsert;
export type Alert = typeof schema.alerts.$inferSelect;
export type NewAlert = typeof schema.alerts.$inferInsert;