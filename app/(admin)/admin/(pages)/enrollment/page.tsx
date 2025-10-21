import { enrollmentRepository } from "@repository/enrollment";
import Link from "next/link";

export default async function EnrollmentManagement() {
  const repo = await enrollmentRepository();
  const enrollment = await repo.get();

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Enrollment Management</h1>

      {!enrollment ? (
        <div className="p-6 bg-white rounded shadow text-gray-600">
          No enrollment data found.
        </div>
      ) : (
        <div className="p-6 bg-white rounded shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {enrollment.title}
            </h2>
            <p className="text-sm text-gray-600">{enrollment.date}</p>
            {enrollment.image_url && (
              <img
                src={enrollment.image_url}
                alt={enrollment.title}
                className="mt-3 w-48 h-32 object-cover rounded"
              />
            )}
          </div>

          <Link
            href={`/admin/enrollment/edit/${enrollment.id}`}
            className="px-4 py-2 bg-btn-primary text-white rounded hover:bg-red-primary transition-colors"
          >
            Edit
          </Link>
        </div>
      )}
    </div>
  );
}
