"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { uploadFacilities } from "./actions";
import { compressMultipleImages } from "@/utils/ImageCompression";

const sekolahOptions = [
  { label: "Sekolah Kemurnian I", value: "sekolah-kemurnian-1" },
  { label: "Sekolah Kemurnian II", value: "sekolah-kemurnian-2" },
  { label: "Sekolah Kemurnian III", value: "sekolah-kemurnian-3" },
];

interface ImageWithTitle {
  file: File;
  title: string;
  id: string;
}

export default function NewFacilitiesForm() {
  const [namaSekolah, setNamaSekolah] = useState(sekolahOptions[0].value);
  const [images, setImages] = useState<ImageWithTitle[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Filter valid image files
    const validFiles = Array.from(files).filter((file) => {
      const isValidType = file.type.startsWith("image/");
      const isValidSize = file.size <= 10 * 1024 * 1024;
      return isValidType && isValidSize;
    });

    if (validFiles.length === 0) {
      setErrorMessage("Please select valid image files (max 10MB each)");
      return;
    }

    if (validFiles.length !== files.length) {
      setErrorMessage(
        "Some files were skipped. Please only upload images under 10MB.",
      );
    } else {
      setErrorMessage("");
    }

    setIsCompressing(true);
    setSuccessMessage(`Compressing ${validFiles.length} image(s)...`);

    try {
      const compressedFiles = await compressMultipleImages(validFiles, {
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1080,
      });

      const originalSize = validFiles.reduce((sum, file) => sum + file.size, 0);
      const compressedSize = compressedFiles.reduce(
        (sum, file) => sum + file.size,
        0,
      );
      const savings = (
        ((originalSize - compressedSize) / originalSize) *
        100
      ).toFixed(1);

      // Create ImageWithTitle objects
      const newImages: ImageWithTitle[] = compressedFiles.map(
        (file, index) => ({
          file,
          title: "",
          id: `${Date.now()}_${index}`,
        }),
      );

      setImages((prev) => [...prev, ...newImages]);
      setSuccessMessage(
        `Images compressed successfully! Saved ${savings}% in file size.`,
      );

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Compression failed:", error);
      setErrorMessage(
        "Failed to compress images. Adding original files instead.",
      );

      // Create ImageWithTitle objects with original files
      const newImages: ImageWithTitle[] = validFiles.map((file, index) => ({
        file,
        title: "",
        id: `${Date.now()}_${index}`,
      }));

      setImages((prev) => [...prev, ...newImages]);
    } finally {
      setIsCompressing(false);
    }

    e.target.value = "";
  };

  const updateImageTitle = (id: string, title: string) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, title } : img)),
    );
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (images.length === 0) {
      setErrorMessage("Please upload at least one image.");
      return;
    }

    // Check if all images have titles
    const imagesWithoutTitles = images.filter((img) => !img.title.trim());
    if (imagesWithoutTitles.length > 0) {
      setErrorMessage("Please provide titles for all images.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("Saving facilities...");

    try {
      const formData = new FormData();
      formData.append("nama_sekolah", namaSekolah);

      images.forEach((img, index) => {
        formData.append(
          `images`,
          img.file,
          `facility_${index}_${img.file.name}`,
        );
        formData.append(`titles`, img.title);
      });

      const result = await uploadFacilities(formData);

      setSuccessMessage(
        `Facilities saved successfully! ${result.facilitiesCount} facilities added.`,
      );
      setImages([]);

      setTimeout(() => router.push("/admin/facilities"), 2000);
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to save facilities.");
      setSuccessMessage("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedSekolahLabel =
    sekolahOptions.find((opt) => opt.value === namaSekolah)?.label || "";

  return (
    <div className="mx-auto max-w-4xl p-4">
      <Link
        href="/admin/facilities"
        className="mb-4 inline-block text-blue-600 hover:text-blue-800 underline"
      >
        ← back
      </Link>

      {successMessage && (
        <div className="mb-4 bg-green-100 text-green-800 p-2 rounded">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="mb-4 bg-red-100 text-red-800 p-2 rounded">
          {errorMessage}
        </div>
      )}

      <form className="space-y-6">
        <div>
          <label className="block mb-2 font-medium text-lg">
            School Selection
          </label>
          <select
            value={namaSekolah}
            onChange={(e) => setNamaSekolah(e.target.value)}
            className="border rounded p-3 w-full focus:border-blue-500 focus:outline-none text-lg"
          >
            {sekolahOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2 font-medium text-lg">
            Upload Facility Images
          </label>
          <p className="text-sm text-gray-600 mb-3">
            Images will be automatically compressed to WebP format (max
            1920×1080, 80% quality). Each image will be saved as a separate
            facility record.
          </p>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            disabled={isCompressing}
            className={`border p-3 w-full rounded focus:border-blue-500 focus:outline-none ${
              isCompressing ? "bg-gray-100" : ""
            }`}
          />
        </div>

        {/* Image Preview and Title Input */}
        {images.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-4">
              Facilities for {selectedSekolahLabel} ({images.length} images)
            </h3>
            <div className="space-y-4">
              {images.map((image, index) => (
                <div
                  key={image.id}
                  className="border rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">
                        Image {index + 1}
                      </p>
                      <p className="text-sm text-gray-600">{image.file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(image.file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="text-red-500 hover:text-red-700 ml-4 text-lg font-bold px-2"
                      title="Remove image"
                    >
                      ×
                    </button>
                  </div>

                  <div>
                    <label className="block mb-1 font-medium text-sm">
                      Facility Title*
                    </label>
                    <input
                      type="text"
                      value={image.title}
                      onChange={(e) =>
                        updateImageTitle(image.id, e.target.value)
                      }
                      className="w-full border rounded p-2 focus:border-blue-500 focus:outline-none"
                      placeholder="Enter facility title (e.g., Main Library, Basketball Court, etc.)"
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || isCompressing || images.length === 0}
            className={`px-6 py-3 rounded text-white font-medium transition-colors ${
              isSubmitting || isCompressing || images.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isSubmitting
              ? "Saving..."
              : isCompressing
                ? "Compressing..."
                : `Save ${images.length} Facilities`}
          </button>
        </div>
      </form>
    </div>
  );
}
