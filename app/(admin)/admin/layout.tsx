import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "../../globals.css";
import Sidebar from "../components/Sidebar"
import Snackbar from "../components/Snackbar"
import { Suspense } from 'react'

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
        <Suspense fallback={<div>Loading...</div>}>
          <Sidebar />
          <Snackbar success={true} message="message" />
          <main className="flex-1">{children}</main>
        </Suspense>
      </div>
    </div>
  );
}
