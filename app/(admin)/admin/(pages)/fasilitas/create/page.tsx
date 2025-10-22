"use client";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const titleRefs = useRef<Record<string, HTMLInputElement>>({});
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
    const newErrors: Record<string, string> = {};

    // Validate images uploaded
    if (images.length === 0) {
      newErrors.images = "Field is required";
      setErrors(newErrors);
      fileInputRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    // Validate each title
    images.forEach((img) => {
      if (!img.title.trim()) {
        newErrors[img.id] = "Field is required";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll to first error
      const firstErrorId = Object.keys(newErrors)[0];
      if (firstErrorId !== "images") {
        titleRefs.current[firstErrorId]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
      return;
    }

    setErrors({});
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
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => {
            handleImageChange(e.target.files);
            setErrors((prev) => {
              const { images, ...rest } = prev;
              return rest;
            });
          }}
          className={`border-1 w-full p-2 rounded cursor-pointer ${
            errors.images ? "border-red-500 border-2" : ""
          }`}
        />
        {errors.images && (
          <p className="text-red-500 text-sm mt-1">{errors.images}</p>
        )}
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
                ref={(el) => {
                  if (el) titleRefs.current[img.id] = el;
                }}
                value={img.title}
                onChange={(e) => {
                  updateTitle(img.id, e.target.value);
                  if (e.target.value.trim()) {
                    setErrors((prev) => {
                      const { [img.id]: _, ...rest } = prev;
                      return rest;
                    });
                  }
                }}
                className={`mt-2 border p-2 w-full ${
                  errors[img.id] ? "border-red-500 border-2" : ""
                }`}
                placeholder={`Title for image ${i + 1}`}
              />
              {errors[img.id] && (
                <p className="text-red-500 text-sm mt-1">{errors[img.id]}</p>
              )}
            </div>
          ))}
        </div>
      )}
      <button
        onClick={handleSubmit}
        disabled={status === "submitting" || status === "compressing"}
        className="bg-btn-primary hover:bg-red-primary text-white px-4 py-2 rounded cursor-pointer"
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
