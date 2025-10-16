"use client";

import { useState } from "react";
import { uploadFacilities } from "@server/fasilitas/createFasilitas";
import { compressMultipleImages } from "@/utils/ImageCompression";

export function useFacilitiesForm() {
  const [images, setImages] = useState<
    { file: File; title: string; id: string }[]
  >([]);
  const [status, setStatus] = useState<
    "idle" | "compressing" | "submitting" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const handleImageChange = async (files: FileList | null) => {
    if (!files?.length) return;

    const validFiles = Array.from(files).filter(
      (f) => f.type.startsWith("image/") && f.size <= 10 * 1024 * 1024,
    );
    if (!validFiles.length)
      return setMessage("Invalid files. Must be images <10MB.");

    setStatus("compressing");
    try {
      const compressed = await compressMultipleImages(validFiles, {
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1080,
      });

      const newImages = compressed.map((file, i) => ({
        file,
        title: "",
        id: `${Date.now()}_${i}`,
      }));

      setImages((prev) => [...prev, ...newImages]);
      setMessage(`Added ${newImages.length} image(s).`);
      setStatus("idle");
    } catch {
      setStatus("error");
      setMessage("Compression failed.");
    }
  };

  const updateTitle = (id: string, title: string) =>
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, title } : img)),
    );

  const removeImage = (id: string) =>
    setImages((prev) => prev.filter((img) => img.id !== id));

  const submit = async (school: string) => {
    if (!images.length) throw new Error("No images uploaded.");

    const invalid = images.filter((i) => !i.title.trim());
    if (invalid.length) throw new Error("All images must have titles.");

    const formData = new FormData();
    formData.append("nama_sekolah", school);
    images.forEach((img) => {
      formData.append("images", img.file);
      formData.append("titles", img.title);
    });

    setStatus("submitting");
    const res = await uploadFacilities(formData);
    setImages([]);
    setMessage(`Uploaded ${res.facilitiesCount} facilities.`);
    setStatus("success");
  };

  return {
    images,
    status,
    message,
    handleImageChange,
    updateTitle,
    removeImage,
    submit,
  };
}
