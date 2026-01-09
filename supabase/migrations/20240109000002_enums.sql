CREATE TYPE "public"."news_from" AS ENUM (
    'TK Kemurnian',
    'SD Kemurnian',
    'SMP Kemurnian',
    'Kemurnian',
    'TK Kemurnian II',
    'SD Kemurnian II',
    'SMP Kemurnian II',
    'SMA Kemurnian II',
    'Kemurnian II',
    'TK Kemurnian III',
    'SD Kemurnian III',
    'Kemurnian III',
    'General'
);

ALTER TYPE "public"."news_from" OWNER TO "postgres";

CREATE TYPE "public"."role_enum" AS ENUM (
    'TK Kemurnian',
    'SD Kemurnian',
    'SMP Kemurnian',
    'Kemurnian',
    'TK Kemurnian II',
    'SD Kemurnian II',
    'SMP Kemurnian II',
    'SMA Kemurnian II',
    'Kemurnian II',
    'TK Kemurnian III',
    'SD Kemurnian III',
    'Kemurnian III',
    'Admin',
    'Editor'
);

ALTER TYPE "public"."role_enum" OWNER TO "postgres";
