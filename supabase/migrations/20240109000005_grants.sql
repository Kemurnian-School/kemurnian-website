ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

-- Table Grants
GRANT ALL ON TABLE "public"."enrollment" TO "anon";
GRANT ALL ON TABLE "public"."enrollment" TO "authenticated";
GRANT ALL ON TABLE "public"."enrollment" TO "service_role";

GRANT ALL ON TABLE "public"."fasilitas" TO "anon";
GRANT ALL ON TABLE "public"."fasilitas" TO "authenticated";
GRANT ALL ON TABLE "public"."fasilitas" TO "service_role";

GRANT ALL ON TABLE "public"."hero_sliders" TO "anon";
GRANT ALL ON TABLE "public"."hero_sliders" TO "authenticated";
GRANT ALL ON TABLE "public"."hero_sliders" TO "service_role";

GRANT ALL ON TABLE "public"."kurikulum" TO "anon";
GRANT ALL ON TABLE "public"."kurikulum" TO "authenticated";
GRANT ALL ON TABLE "public"."kurikulum" TO "service_role";

GRANT ALL ON TABLE "public"."news" TO "anon";
GRANT ALL ON TABLE "public"."news" TO "authenticated";
GRANT ALL ON TABLE "public"."news" TO "service_role";

GRANT ALL ON TABLE "public"."primary_schools" TO "anon";
GRANT ALL ON TABLE "public"."primary_schools" TO "authenticated";
GRANT ALL ON TABLE "public"."primary_schools" TO "service_role";

GRANT ALL ON TABLE "public"."search_static" TO "anon";
GRANT ALL ON TABLE "public"."search_static" TO "authenticated";
GRANT ALL ON TABLE "public"."search_static" TO "service_role";

GRANT ALL ON TABLE "public"."search_index" TO "anon";
GRANT ALL ON TABLE "public"."search_index" TO "authenticated";
GRANT ALL ON TABLE "public"."search_index" TO "service_role";

GRANT ALL ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";

-- Sequence Grants
GRANT ALL ON SEQUENCE "public"."enrollment_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."enrollment_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."enrollment_id_seq" TO "service_role";

GRANT ALL ON SEQUENCE "public"."fasilitas_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."fasilitas_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."fasilitas_id_seq" TO "service_role";

GRANT ALL ON SEQUENCE "public"."hero_sliders_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."hero_sliders_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."hero_sliders_id_seq" TO "service_role";

GRANT ALL ON SEQUENCE "public"."kurkulum_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."kurkulum_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."kurkulum_id_seq" TO "service_role";

GRANT ALL ON SEQUENCE "public"."news_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."news_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."news_id_seq" TO "service_role";

GRANT ALL ON SEQUENCE "public"."primary_schools_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."primary_schools_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."primary_schools_id_seq" TO "service_role";

GRANT ALL ON SEQUENCE "public"."user_roles_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_roles_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_roles_id_seq" TO "service_role";

-- Default Privileges
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";
