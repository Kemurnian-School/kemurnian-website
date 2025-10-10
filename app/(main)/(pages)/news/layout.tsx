import { Metadata } from "next";
import CategoryFilter from "@component/NewsCategoryFilter";

export const metadata: Metadata = {
  title: "News",
  description: "Berita terbaru dari Sekolah Kemurnian",
};

export default function NewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="#ecf0f1">
      <div className="flex items-center justify-center mb-8 w-full h-86 bg-red-primary text-white text-6xl font-raleway font-bold text-center uppercase">
        NEWS & EVENTS
      </div>
      <CategoryFilter />
      <div>{children}</div>
    </div>
  );
}

