CREATE TABLE "public"."article_media" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "article_id" uuid NOT NULL,
    "media_url" text NOT NULL,
    "media_type" text NOT NULL
);

ALTER TABLE "public"."article_media" ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX article_media_pkey ON public.article_media USING btree (id);

ALTER TABLE "public"."article_media" ADD CONSTRAINT "article_media_pkey" PRIMARY KEY USING INDEX "article_media_pkey";

ALTER TABLE "public"."article_media" ADD CONSTRAINT "article_media_article_id_fkey" FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE NOT VALID;

ALTER TABLE "public"."article_media" VALIDATE CONSTRAINT "article_media_article_id_fkey";

GRANT ALL ON TABLE "public"."article_media" TO "anon";
GRANT ALL ON TABLE "public"."article_media" TO "authenticated";
GRANT ALL ON TABLE "public"."article_media" TO "service_role";

ALTER TABLE "public"."articles" DROP COLUMN "image_url";

ALTER TABLE "public"."article_media" ADD COLUMN IF NOT EXISTS display_order integer NOT NULL DEFAULT 0; 