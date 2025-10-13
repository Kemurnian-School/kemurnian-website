import { createClient } from "@/utils/supabase/client";
const supabase = createClient();

export async function getEnrollmentData() {
  const { data: enrollmentData, error: enrollmentDataError } = await supabase
    .from("enrollment")
    .select("*")
    .single()

  const enrollmentTable = enrollmentDataError ? [] : enrollmentData || [];

  return enrollmentTable;
}
