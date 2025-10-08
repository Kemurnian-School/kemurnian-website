import "../globals.css";
import { Merriweather, Raleway } from "next/font/google";
import Footer from "./components/Footer";
import FixedBottom from "./components/FixedBottom";
import Navbar from "./components/Navbar";
import { createClient } from "@/utils/supabase/client";

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
  const supabase = await createClient();

  const { data: searchData, error } = await supabase
    .from("search_index")
    .select("title, url");

  if (error) {
    console.error("Failed to fetch search data:", error);
  }

  return (
    <div
      className={`${raleway.variable} ${merriweather.variable} antialiased bg-[#e6e6e6] scroll-smooth`}
    >
      <Navbar searchPages={searchData || []} />
      {children}
      <Footer />
      <FixedBottom />
    </div>
  );
}
