-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "news_from" AS ENUM ('TK Kemurnian', 'SD Kemurnian', 'SMP Kemurnian', 'Kemurnian', 'TK Kemurnian II', 'SD Kemurnian II', 'SMP Kemurnian II', 'SMA Kemurnian II', 'Kemurnian II', 'TK Kemurnian III', 'SD Kemurnian III', 'Kemurnian III', 'General');

-- CreateEnum
CREATE TYPE "role_enum" AS ENUM ('TK Kemurnian', 'SD Kemurnian', 'SMP Kemurnian', 'Kemurnian', 'TK Kemurnian II', 'SD Kemurnian II', 'SMP Kemurnian II', 'SMA Kemurnian II', 'Kemurnian II', 'TK Kemurnian III', 'SD Kemurnian III', 'Kemurnian III', 'Admin', 'Editor');

-- CreateTable
CREATE TABLE "enrollment" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" VARCHAR,
    "image_url" TEXT,
    "date" DATE,
    "body" TEXT,
    "image_path" TEXT,

    CONSTRAINT "enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fasilitas" (
    "id" BIGSERIAL NOT NULL,
    "title" TEXT,
    "image_urls" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nama_sekolah" TEXT NOT NULL,
    "storage_path" TEXT,
    "order" SMALLINT,

    CONSTRAINT "fasilitas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hero_sliders" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "image_urls" TEXT,
    "order" INTEGER,
    "header_text" TEXT,
    "href_text" TEXT,
    "mobile_image_urls" TEXT,
    "tablet_image_urls" TEXT,
    "button_text" TEXT,

    CONSTRAINT "hero_sliders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kurikulum" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" VARCHAR,
    "body" TEXT,
    "order" SMALLINT,
    "preview" TEXT,

    CONSTRAINT "kurkulum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" VARCHAR NOT NULL,
    "date" DATE NOT NULL,
    "image_urls" TEXT[],
    "body" TEXT NOT NULL,
    "embed" TEXT,
    "from" "news_from" NOT NULL,
    "storage_paths" TEXT[],

    CONSTRAINT "news_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "primary_schools" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nama_sekolah" TEXT,

    CONSTRAINT "primary_schools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_static" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "search_static_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" UUID NOT NULL DEFAULT auth.uid(),
    "roles" "role_enum",

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id","user_id")
);

