import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "../globals.css"; // reuse global styles

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
    <html lang="en">
      <body className={`${poppins.variable} font-sans antialiased`}>
        <div className="min-h-screen flex flex-col">
          {/* Admin navbar/sidebar can go here */}
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
