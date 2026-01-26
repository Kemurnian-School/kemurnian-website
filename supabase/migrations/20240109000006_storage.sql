drop extension if exists "pg_net";

create policy "all 20edv_0" on "storage"."objects" as permissive for insert to authenticated with check ((bucket_id = 'news'::text));
create policy "all 20edv_1" on "storage"."objects" as permissive for select to authenticated using ((bucket_id = 'news'::text));
create policy "all 20edv_2" on "storage"."objects" as permissive for update to authenticated using ((bucket_id = 'news'::text));
create policy "all 20edv_3" on "storage"."objects" as permissive for delete to authenticated using ((bucket_id = 'news'::text));
create policy "read 20edv_0" on "storage"."objects" as permissive for select to public using ((bucket_id = 'news'::text));
create policy "rule" on "storage"."objects" as permissive for all to authenticated;
