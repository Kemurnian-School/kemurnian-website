"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const categories = [
  { name: "General", href: "/news" },
  { name: "Sekolah Kemurnian", href: "/news/category/sekolah-kemurnian" },
  { name: "Sekolah Kemurnian II", href: "/news/category/sekolah-kemurnian-ii" },
  {
    name: "Sekolah Kemurnian III",
    href: "/news/category/sekolah-kemurnian-iii",
  },
];

export default function CategoryFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const [selected, setSelected] = useState(pathname);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const href = e.target.value;
    setSelected(href);
    router.push(href);
  };

  return (
    <div className="ml-12 mb-6">
      <h2 className="mb-4 font-raleway font-extrabold tracking-widest text-2xl">
        KATEGORI BERITA
      </h2>
      <select
        value={selected}
        onChange={handleChange}
        className="block w-[225px] max-w-full font-raleway px-3 py-3 border-3 border-gray-400 rounded text-gray-700 text-sm focus:outline-none"
      >
        {categories.map((cat) => (
          <option key={cat.name} value={cat.href}>
            {cat.name}
          </option>
        ))}
      </select>
    </div>
  );
}
