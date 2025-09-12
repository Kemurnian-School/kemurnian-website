import { createClient } from "@/utils/supabase/server";
import EnrollmentEditForm from "./EnrollmentEditForm";

interface PageProps {
  params: { id: string };
}

export default async function EditEnrollmentPage({ params }: PageProps) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("enrollment")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !data) {
    return <div className="p-4 text-red-600">Failed to load enrollment data</div>;
  }

  return <EnrollmentEditForm initialData={data} />;
}