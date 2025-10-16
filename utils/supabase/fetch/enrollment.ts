import { createClient } from "@/utils/supabase/client";

export async function getEnrollmentData() {
  const supabase = createClient();
  const { data: enrollmentData, error: enrollmentDataError } = await supabase
    .from("enrollment")
    .select("*")
    .single();

  const enrollmentTable = enrollmentDataError ? [] : enrollmentData || [];

  return enrollmentTable;
}
