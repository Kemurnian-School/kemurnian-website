// app/admin/enrollment/page.tsx
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function EnrollmentManagement() {
  const supabase = await createClient();
  const { data: enrollment, error } = await supabase
    .from("enrollment")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Failed to load enrollment data");
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Enrollment Management</h1>

      {enrollment && enrollment.length > 0 ? (
        <div className="space-y-4">
          {enrollment.map(e => (
            <div key={e.id} className="p-4 bg-white rounded shadow flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">{e.title}</h2>
                <p className="text-sm text-gray-600">{e.date}</p>
              </div>
              <Link
                href={`/admin/enrollment/edit/${e.id}`}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Edit
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p>No enrollment data found.</p>
      )}
    </div>
  );
}