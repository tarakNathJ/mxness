CREATE TABLE "options_tread" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "options_tread_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"symbol" varchar(50) NOT NULL,
	"user_id" integer,
	"quantity" double precision NOT NULL,
	"open_price" double precision NOT NULL,
	"close_price" double precision NOT NULL,
	"take_profit" double precision NOT NULL,
	"stop_loss" double precision NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "options_tread" ADD CONSTRAINT "options_tread_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;