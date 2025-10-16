import { createClient } from "@/utils/supabase/client";

export async function getKurikulumData() {
  const supabase = createClient();
  const { data: kurikulumData, error: kurikulumDataError } = await supabase
    .from("kurikulum")
    .select("*")
    .order("order", { ascending: true });

  const kurikulumTable = kurikulumDataError ? [] : kurikulumData || [];

  return kurikulumTable;
}
