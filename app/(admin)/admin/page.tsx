"use client";
import { useState } from "react";

const WEB_PAGE = process.env.NEXT_PUBLIC_SITE_DOMAIN!;

export default function AdminHome() {
  const [width, setWidth] = useState(1040);

  const handleWidthChange = (value: number) => {
    if (value < 320) value = 320;
    if (value > 1920) value = 1920;
    setWidth(value);
  };

  return (
    <div className="p-6 h-screen flex flex-col">
      <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-gray-600 mb-4">Responsive Website Preview</p>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <label className="text-sm font-medium text-gray-700">Width:</label>

        {/* Slider */}
        <input
          type="range"
          min={320}
          max={1920}
          value={width}
          onChange={(e) => handleWidthChange(Number(e.target.value))}
          className="w-48 accent-red-primary"
        />

        {/* Typable input */}
        <input
          type="number"
          min={320}
          max={1920}
          value={width}
          onChange={(e) => handleWidthChange(Number(e.target.value))}
          className="w-20 border rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-600">px</span>

        {/* Presets */}
        <div className="flex items-center gap-2">
          {[
            { label: "Mobile", value: 375 },
            { label: "Tablet", value: 768 },
            { label: "Laptop", value: 1280 },
            { label: "Desktop", value: 1920 },
          ].map((preset) => (
            <button
              key={preset.label}
              onClick={() => handleWidthChange(preset.value)}
              className={`px-3 py-1 text-sm rounded border transition-colors ${
                width === preset.value
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Iframe Preview */}
      <div className="flex-1 flex justify-center items-start overflow-auto bg-gray-100 p-4 rounded-lg">
        <div
          className="border rounded-lg shadow-lg bg-white"
          style={{ width: `${width}px`, height: "100%" }}
        >
          <iframe
            src={WEB_PAGE}
            className="w-full h-full border-none"
            loading="lazy"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
