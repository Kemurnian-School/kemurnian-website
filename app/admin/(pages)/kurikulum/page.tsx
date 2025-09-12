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
      <KurikulumList initialKurikulums={kurikulums} />
    </div>
  )
}