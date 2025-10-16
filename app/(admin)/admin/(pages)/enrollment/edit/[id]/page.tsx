import EnrollmentEditForm from "./EnrollmentEditForm";
import { enrollmentRepository } from "@repository/enrollment";

export default async function EditEnrollmentPage() {
  const repo = await enrollmentRepository();
  const data = await repo.get();

  return <EnrollmentEditForm initialData={data} />;
}
