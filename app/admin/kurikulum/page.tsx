import KurikulumList from "@/app/admin/components/KurikulumList";
import { createClient } from "@/utils/supabase/server";

export default async function AdminKurikulum() {
  const supabase = await createClient();
  const { data: kurikulums, error } = await supabase
    .from("kurikulum")
    .select("*")
    .order("created_at", { ascending: false });
  
  if (error) {
    throw new Error("Failed to load kurikulums");
  }
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Hero Slider Admin</h1>
      <KurikulumList initialKurikulums={kurikulums} />
    </div>
  )
}