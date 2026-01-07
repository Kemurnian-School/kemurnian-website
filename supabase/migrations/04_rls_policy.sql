-- Enable RLS
ALTER TABLE "public"."enrollment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."fasilitas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."hero_sliders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."kurikulum" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."news" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."primary_schools" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."search_static" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;

-- Hero Sliders
CREATE POLICY "Allow authenticated users to delete hero sliders" ON "public"."hero_sliders" FOR DELETE TO "authenticated" USING (true);
CREATE POLICY "Allow authenticated users to insert hero sliders" ON "public"."hero_sliders" FOR INSERT TO "authenticated" WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update hero sliders" ON "public"."hero_sliders" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);
CREATE POLICY "Allow everyone to view hero sliders" ON "public"."hero_sliders" FOR SELECT USING (true);

-- Kurikulum
CREATE POLICY "Allow public select on kurikulum" ON "public"."kurikulum" FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON "public"."kurikulum" FOR INSERT TO "authenticated" WITH CHECK (true);
CREATE POLICY "delete perm" ON "public"."kurikulum" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);
CREATE POLICY "permission" ON "public"."kurikulum" TO "authenticated" USING (true);

-- Fasilitas
CREATE POLICY "crud" ON "public"."fasilitas" TO "authenticated" USING (true);
CREATE POLICY "public" ON "public"."fasilitas" FOR SELECT USING (true);

-- News
CREATE POLICY "permission" ON "public"."news" TO "authenticated" USING (true);
CREATE POLICY "read" ON "public"."news" FOR SELECT USING (true);

-- Enrollment
CREATE POLICY "read" ON "public"."enrollment" FOR SELECT USING (true);
CREATE POLICY "update" ON "public"."enrollment" FOR UPDATE TO "authenticated" USING (true);

-- Search Static
CREATE POLICY "read public" ON "public"."search_static" FOR SELECT TO "anon" USING (true);
