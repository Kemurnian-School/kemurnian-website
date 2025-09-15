import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "../../globals.css";
import Sidebar from "../components/Sidebar"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Administration panel",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${poppins.variable} font-sans antialiased`}>
      <div className="min-h-screen flex">
        <Sidebar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
