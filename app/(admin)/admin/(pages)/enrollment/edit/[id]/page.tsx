import { createClientAuth } from "@/utils/supabase/server";
import EnrollmentEditForm from "./EnrollmentEditForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEnrollmentPage(props: PageProps) {
  const params = await props.params;
  const supabase = await createClientAuth();
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
