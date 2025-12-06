CREATE TABLE `progression` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`previous_duration` integer NOT NULL,
	`previous_frequency` integer NOT NULL,
	`new_duration` integer NOT NULL,
	`new_frequency` integer NOT NULL,
	`progression_type` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `progression_user_id_idx` ON `progression` (`user_id`);--> statement-breakpoint
CREATE INDEX `progression_date_idx` ON `progression` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `user_plan` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`focus_duration` integer NOT NULL,
	`days_per_week` integer NOT NULL,
	`work_days_schedule` text NOT NULL,
	`current_progression_week` integer DEFAULT 1 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `user_plan_user_id_idx` ON `user_plan` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_plan_active_idx` ON `user_plan` (`user_id`,`is_active`);--> statement-breakpoint
CREATE TABLE `work_session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`plan_id` text NOT NULL,
	`scheduled_date` text NOT NULL,
	`planned_duration` integer NOT NULL,
	`actual_duration` integer,
	`is_rest_day` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'scheduled' NOT NULL,
	`completed_at` integer,
	`difficulty_rating` text,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`plan_id`) REFERENCES `user_plan`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `work_session_user_id_idx` ON `work_session` (`user_id`);--> statement-breakpoint
CREATE INDEX `work_session_date_idx` ON `work_session` (`user_id`,`scheduled_date`);--> statement-breakpoint
CREATE INDEX `work_session_status_idx` ON `work_session` (`user_id`,`status`);--> statement-breakpoint
CREATE INDEX `work_session_plan_idx` ON `work_session` (`plan_id`);--> statement-breakpoint
DROP TABLE `movies`;