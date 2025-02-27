import type { Config } from 'drizzle-kit';

export default {
    schema: './lib/db/schema.ts',
    out: './lib/db/migrations',
    dialect: 'postgresql',
    dbCredentials: {
        url: "postgresql://postgres:postgres@localhost:5432/city_monitoring",
    }
} satisfies Config;