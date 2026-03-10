"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { kurikulumRepository } from "@repository/kurikulum";

export async function uploadKurikulum(formData: FormData) {
  const title = formData.get("title") as string;
  const body = formData.get("body") as string;
  const preview = (formData.get("preview") as string) || null;

  if (!title || !body) throw new Error("Title and body are required");

  try {
    const repo = await kurikulumRepository();
    const nextOrder = await repo.getNextOrder();

    await repo.createKurikulum({
      title,
      body,
      preview,
      order: nextOrder,
    });

    revalidatePath("/");
    redirect(
      "/admin/kurikulum?success=" +
        encodeURIComponent("Kurikulum created successfully"),
    );
  } catch (error) {
    console.error("Failed to upload kurikulum:", error);
    throw error;
  }
}
