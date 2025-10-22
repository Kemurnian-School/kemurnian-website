"use server";

import { redirect } from "next/navigation";
import { heroRepository } from "@/utils/supabase/repository/hero";
import { revalidatePath } from "next/cache";

/**
 * Reorders hero banners based on a list of IDs from the client.
 * The first ID in the list becomes order 1, and so on.
 */
export async function reorderHeroBanners(formData: FormData) {
  const orderStr = formData.get("order") as string;
  if (!orderStr) return;

  try {
    const repo = await heroRepository();
    const orderedIds: number[] = JSON.parse(orderStr);

    // Validate IDs
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      throw new Error("Invalid order data");
    }

    // Update each hero banner's order based on its position in the array
    await Promise.all(
      orderedIds.map((id, index) =>
        repo.supabase
          .from("hero_sliders")
          .update({ order: index + 1 })
          .eq("id", id),
      ),
    );

    revalidatePath("/");
    redirect(
      "/admin/hero?success=" +
        encodeURIComponent("Hero banners reordered successfully!"),
    );
  } catch (error) {
    console.error("Reorder failed:", error);
    throw error;
  }
}
