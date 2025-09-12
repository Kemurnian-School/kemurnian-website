import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sekolah Kemurnian",
  description: "Home Page - Sekolah Kemurnian",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
