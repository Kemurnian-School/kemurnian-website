"use client";
import { useState, useRef, useEffect } from "react";
import ConfirmationModal from "@admin/components/ConfirmationModal";
import Image from "next/image";
import { reorderHeroBanners } from "@server/hero/reorderHeroBanners";
import { deleteHeroBanner } from "@server/hero/deleteHeroBanner";
import { RiDeleteBinLine, RiCheckboxCircleLine } from "@remixicon/react"

interface Hero {
  id: number;
  image_urls: string;
  order: number;
  header_text: string;
}

const icon = "w-4 h-4 text-white";

export default function HeroList({ initialImages }: { initialImages: Hero[] }) {
  const [images, setImages] = useState<Hero[]>(initialImages);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [itemToDelete, setItemToDelete] = useState<Hero | null>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (dragIdx !== null) {
        setDragPos({ x: e.clientX, y: e.clientY });
      }
    }

    function handleMouseUp() {
      if (dragIdx === null) return;

      const draggedItem = images[dragIdx];
      let targetIdx = dragIdx;

      for (let i = 0; i < itemRefs.current.length; i++) {
        const ref = itemRefs.current[i];
        if (!ref) continue;
        const rect = ref.getBoundingClientRect();
        const middle = rect.top + rect.height / 2;
        if (dragPos.y < middle) {
          targetIdx = i;
          break;
        }
        if (i === itemRefs.current.length - 1) {
          targetIdx = i;
        }
      }

      if (targetIdx !== dragIdx) {
        const newImages = [...images];
        newImages.splice(dragIdx, 1);
        newImages.splice(targetIdx, 0, draggedItem);
        setImages(newImages);
      }

      setDragIdx(null);
      document.body.style.userSelect = "";
    }

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
    };
  }, [dragIdx, dragPos, images]);

  function handleMouseDown(e: React.MouseEvent, index: number) {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    dragStartPos.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setDragIdx(index);
    setDragPos({ x: e.clientX, y: e.clientY });
    document.body.style.userSelect = "none";
  }

  function handleDeleteClick(e: React.MouseEvent, hero: Hero) {
    e.stopPropagation();
    setItemToDelete(hero);
  }

  async function handleConfirmDelete() {
    if (!itemToDelete) return;

    const formData = new FormData();
    formData.append("id", itemToDelete.id.toString());

    await deleteHeroBanner(formData);

    // Remove from local state
    setImages(images.filter(img => img.id !== itemToDelete.id));
    setItemToDelete(null);
  }

  function handleCancelDelete() {
    setItemToDelete(null);
  }

  return (
    <div className="relative">
      <div className="space-y-4">
        {images.map((img, idx) => (
          <div
            key={img.id}
            ref={(el) => {
              itemRefs.current[idx] = el;
            }}
            onMouseDown={(e) => handleMouseDown(e, idx)}
            className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-md hover:shadow-lg cursor-grab active:cursor-grabbing"
            style={{ opacity: dragIdx === idx ? 0 : 1 }}
          >
            <div className="flex-shrink-0">
              <div className="flex flex-col gap-1 mr-2">
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              </div>
            </div>
            <Image
              src={img.image_urls}
              width={150}
              height={80}
              alt={`Hero ${img.id}`}
              className="rounded pointer-events-none"
            />
            <div className="flex-1 pointer-events-none">
              <p className="text-sm text-gray-500">Order: {idx + 1}</p>
              <p className="text-gray-700 font-medium mt-1">
                {img.header_text}
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => handleDeleteClick(e, img)}
              onMouseDown={(e) => e.stopPropagation()}
              className="flex items-center px-3 py-2 bg-red-700 hover:bg-red-800 text-white rounded-full hover:bg-red-700 transition-colors pointer-events-auto cursor-pointer gap-1"
            >
              <RiDeleteBinLine
                size={18}
              />
              Delete
            </button>
          </div>
        ))}
      </div>

      {dragIdx !== null && (
        <div
          className="fixed pointer-events-none z-50"
          style={{
            left: dragPos.x - dragStartPos.current.x,
            top: dragPos.y - dragStartPos.current.y,
            width: itemRefs.current[dragIdx]?.offsetWidth,
          }}
        >
          <div className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-2xl">
            <div className="flex-shrink-0">
              <div className="flex flex-col gap-1 mr-2">
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              </div>
            </div>
            <Image
              src={images[dragIdx].image_urls}
              width={150}
              height={80}
              alt={`Hero ${images[dragIdx].id}`}
              className="rounded"
            />
            <div className="flex-1">
              <p className="text-sm text-gray-500">Order: {dragIdx + 1}</p>
              <p className="text-gray-700 font-medium mt-1">
                {images[dragIdx].header_text}
              </p>
            </div>
          </div>
        </div>
      )}

      <form action={reorderHeroBanners} className="mt-6">
        <input
          type="hidden"
          name="order"
          value={JSON.stringify(images.map((img) => img.id))}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <RiCheckboxCircleLine
            size={20}
          />
          Save Order
        </button>
      </form>

      {itemToDelete && (
        <ConfirmationModal
          item={{ title: itemToDelete.header_text }}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
}
