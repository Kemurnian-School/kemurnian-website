"use server";

import { revalidatePath } from "next/cache";
import { uploadToStorage } from "@/utils/storage/upload";
import { heroRepository } from "@repository/hero";

/**
 * Creates a new hero banner entry in the database.
 * Uploads the provided desktop/tablet/mobile images to storage,
 * assigns the next available display order,
 * and revalidates the admin pages.
 */
export async function uploadHeroBanner(formData: FormData) {
  const headerText = formData.get("headerText") as string;
  const buttonText = formData.get("buttonText") as string;
  const hrefText = formData.get("hrefText") as string;

  const desktopFile = formData.get("desktopImage") as File;
  const tabletFile = formData.get("tabletImage") as File | null;
  const mobileFile = formData.get("mobileImage") as File | null;

  if (!desktopFile) throw new Error("A desktop image is required");

  try {
    const repo = await heroRepository();

    const desktopUrl = await uploadToStorage(desktopFile, "hero-banners", {
      subfolder: "desktop",
    });
    const tabletUrl = await uploadToStorage(tabletFile, "hero-banners", {
      subfolder: "tablet",
    });
    const mobileUrl = await uploadToStorage(mobileFile, "hero-banners", {
      subfolder: "mobile",
    });

    const nextOrder = await repo.getNextOrderNumber();

    await repo.createHero({
      header_text: headerText,
      href_text: hrefText,
      button_text: buttonText,
      image_urls: desktopUrl ?? "",
      tablet_image_urls: tabletUrl,
      mobile_image_urls: mobileUrl,
      order: nextOrder,
    });

    revalidatePath("/");
  } catch (error) {
    console.error("Upload failed:", error);
    throw error;
  }
}
