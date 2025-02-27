import {
    pgTable,
    serial,
    text,
    timestamp,
    varchar,
    boolean,
    integer,
    pgEnum,
    primaryKey
} from 'drizzle-orm/pg-core';


// Define enums for status and priority
export const alertStatusEnum = pgEnum('alert_status', ['new', 'in_progress', 'resolved', 'dismissed']);
export const alertPriorityEnum = pgEnum('alert_priority', ['low', 'medium', 'high']);

// Camera streams table
export const cameraStreams = pgTable('camera_streams', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    streamUrl: text('stream_url').notNull(),
    location: varchar('location', { length: 255 }).notNull(),
    active: boolean('active').default(true),
    latitude: varchar('latitude', { length: 50 }),
    longitude: varchar('longitude', { length: 50 }),
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// Alerts table
export const alerts = pgTable('alerts', {
    id: serial('id').primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description').notNull(),
    location: varchar('location', { length: 255 }).notNull(),
    timestamp: timestamp('timestamp').defaultNow(),
    status: alertStatusEnum('status').default('new'),
    priority: alertPriorityEnum('priority').default('medium'),
    lawReference: varchar('law_reference', { length: 255 }),
    source: varchar('source', { length: 100 }),
    imageUrl: text('image_url'),
    cameraId: integer('camera_id').references(() => cameraStreams.id),
});