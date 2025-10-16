"use server";

import { getAuthorizedClient } from "@/utils/supabase/auth";
import type { FasilitasRecord } from "@/utils/supabase/models/fasilitas";

export async function fasilitasRepository() {
  const { supabase, user } = await getAuthorizedClient();

  return {
    supabase,
    user,

    async createMany(records: FasilitasRecord[]): Promise<void> {
      const { error } = await supabase.from("fasilitas").insert(records);
      if (error) throw error;
    },

    async getAllBySchool(school: string): Promise<FasilitasRecord[]> {
      const { data, error } = await supabase
        .from("fasilitas")
        .select("*")
        .eq("nama_sekolah", school)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },

    async deleteById(id: number): Promise<{ storage_path: string | null }> {
      const { data, error } = await supabase
        .from("fasilitas")
        .select("storage_path")
        .eq("id", id)
        .single();

      if (error) throw error;
      if (!data) throw new Error("Facility not found");

      const { error: deleteError } = await supabase
        .from("fasilitas")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      return { storage_path: data.storage_path };
    },
  };
}
