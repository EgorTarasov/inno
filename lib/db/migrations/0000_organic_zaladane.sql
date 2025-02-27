CREATE TYPE "public"."alert_priority" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."alert_status" AS ENUM('new', 'in_progress', 'resolved', 'dismissed');--> statement-breakpoint
CREATE TABLE "alerts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"location" varchar(255) NOT NULL,
	"timestamp" timestamp DEFAULT now(),
	"status" "alert_status" DEFAULT 'new',
	"priority" "alert_priority" DEFAULT 'medium',
	"law_reference" varchar(255),
	"source" varchar(100),
	"image_url" text,
	"camera_id" integer
);
--> statement-breakpoint
CREATE TABLE "camera_streams" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"stream_url" text NOT NULL,
	"location" varchar(255) NOT NULL,
	"active" boolean DEFAULT true,
	"latitude" varchar(50),
	"longitude" varchar(50),
	"description" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_camera_id_camera_streams_id_fk" FOREIGN KEY ("camera_id") REFERENCES "public"."camera_streams"("id") ON DELETE no action ON UPDATE no action;