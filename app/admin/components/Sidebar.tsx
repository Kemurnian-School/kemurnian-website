"use client";

import Link from "next/link";
import Image from "next/image";

const linkStyle =
  "block w-full py-4 pl-6 hover:bg-btn-hover cursor-pointer text-left border-b border-red-800";

const menuLinks = [
  { href: "/admin/", label: "Dashboard", borderTop: true },
  { href: "/admin/hero", label: "Hero Section" },
  { href: "/admin/kurikulum", label: "Kurikulum Section" },
  { href: "/admin/news", label: "News" },
];

export default function AdminSidebar() {
  return (
    <nav className="sticky top-0 w-64 bg-btn-primary h-screen text-white flex-shrink-0">
      <div className="my-8 mx-4 h-12 relative">
        <Image
          src="/nav_logo.webp"
          alt="Logo"
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* Menu Links */}
      <div className="flex flex-col">
        {menuLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`${linkStyle} ${link.borderTop ? "border-t" : ""}`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
