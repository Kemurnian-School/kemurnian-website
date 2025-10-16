"use server";

import { getAuthorizedClient } from "@/utils/supabase/auth";
import type { HeroBannerFetch, HeroBannerRecord } from "@models/hero";

/**
 * Represents a single record in the "hero_sliders" table.
 */

/**
 * Provides safe and authenticated access to the "hero_sliders" table.
 * This wraps Supabase operations into clearly named methods.
 */
export async function heroRepository() {
  const { supabase, user } = await getAuthorizedClient();

  return {
    supabase,
    user,

    /**
     * Fetch a all hero banners.
     * Returns null if the record is not found.
     */
    async getAllImages(): Promise<HeroBannerFetch[]> {
      const { data, error } = await supabase
        .from("hero_sliders")
        .select("id, image_urls, order, header_text")
        .order("order", { ascending: true });

      if (error) throw error;
      return data || [];
    },

    /**
     * Fetch a single hero banner by ID.
     * Returns null if the record is not found.
     */
    async getById(id: string): Promise<HeroBannerRecord | null> {
      const { data, error } = await supabase
        .from("hero_sliders")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null; // no rows found
        throw error;
      }

      return data;
    },

    /**
     * Returns the next available "order" number for a new hero banner.
     */
    async getNextOrderNumber(): Promise<number> {
      const { data, error } = await supabase
        .from("hero_sliders")
        .select("order")
        .order("order", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data ? data.order + 1 : 1;
    },

    /**
     * Inserts a new hero banner record into the database.
     */
    async createHeroBanner(record: HeroBannerRecord): Promise<void> {
      const { error } = await supabase.from("hero_sliders").insert(record);
      if (error) throw error;
    },

    /**
     * Deletes a hero banner by ID.
     */
    async deleteById(id: string): Promise<void> {
      const { error } = await supabase
        .from("hero_sliders")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },

    /**
     * Ensures all hero banners have a consistent sequential "order" value.
     */
    async normalizeOrder(): Promise<void> {
      const { data: banners, error } = await supabase
        .from("hero_sliders")
        .select("id")
        .order("order", { ascending: true });

      if (error) throw error;
      if (!banners) return;

      await Promise.all(
        banners.map((banner, index) =>
          supabase
            .from("hero_sliders")
            .update({ order: index + 1 })
            .eq("id", banner.id),
        ),
      );
    },
  };
}
