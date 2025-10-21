"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { useFacilitiesForm } from "./hooks/useFasilitas";

const sekolahOptions = [
  { label: "Sekolah Kemurnian I", value: "sekolah-kemurnian-1" },
  { label: "Sekolah Kemurnian II", value: "sekolah-kemurnian-2" },
  { label: "Sekolah Kemurnian III", value: "sekolah-kemurnian-3" },
];

export default function NewFacilitiesForm() {
  const router = useRouter();
  const [school, setSchool] = useState(sekolahOptions[0].value);
  const {
    images,
    status,
    message,
    handleImageChange,
    updateTitle,
    removeImage,
    submit,
  } = useFacilitiesForm();

  const handleSubmit = async () => {
    try {
      await submit(school);
      setTimeout(() => router.push("/admin/fasilitas"), 1500);
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-4 space-y-6">
      <Link
        href="/admin/fasilitas"
        className="text-blue-600 hover:text-blue-800 underline"
      >
        ← Back
      </Link>

      {message && (
        <div className="bg-gray-100 text-gray-800 p-2 rounded">{message}</div>
      )}

      <div className="mt-10">
        <label className="block mb-2 font-medium">Select School</label>
        <select
          value={school}
          onChange={(e) => setSchool(e.target.value)}
          className="border rounded p-2 w-full cursor-pointer"
        >
          {sekolahOptions.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-2 font-medium">Upload Images</label>

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleImageChange(e.target.files)}
          className="border-1 w-full p-2 rounded cursor-pointer"
        />
      </div>

      {images.length > 0 && (
        <div className="space-y-3">
          {images.map((img, i) => (
            <div key={img.id} className="border rounded p-3 bg-gray-50">
              <div className="flex justify-between">
                <span>{img.file.name}</span>
                <button
                  onClick={() => removeImage(img.id)}
                  className="text-red-600 font-bold"
                >
                  ×
                </button>
              </div>
              <input
                value={img.title}
                onChange={(e) => updateTitle(img.id, e.target.value)}
                className="mt-2 border p-2 w-full"
                placeholder={`Title for image ${i + 1}`}
              />
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={status === "submitting" || status === "compressing"}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer"
      >
        {status === "compressing"
          ? "Compressing..."
          : status === "submitting"
            ? "Saving..."
            : "Save Facilities"}
      </button>
    </div>
  );
}
