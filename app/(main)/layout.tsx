import "../globals.css";
import { Merriweather, Raleway } from "next/font/google";

import Footer from "@component/Footer";
import FixedBottom from '@component/FixedBottom';
import Navbar from "@component/Navbar";

import { getSearchData } from '@/utils/supabase/fetch/searchSuggestions';

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-merriweather",
});

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  variable: "--font-raleway",
});

export const revalidate = 86400;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const fromSearch = await getSearchData();

  return (
    <div
      className={`${raleway.variable} ${merriweather.variable} antialiased bg-[#e6e6e6] scroll-smooth`}
    >
      <Navbar searchPages={fromSearch || []} />
      {children}
      <Footer />
      <FixedBottom />
    </div>
  );
}
