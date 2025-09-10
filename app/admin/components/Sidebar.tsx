"use client";

import Link from "next/link";
import Image from "next/image";

const linkStyle =
  "block w-full py-4 pl-6 hover:bg-btn-hover cursor-pointer text-left border-b border-red-800";

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
      <ul className="flex flex-col">
        <li>
          <Link href="/admin/" className={`${linkStyle} border-t`}>
            Dashboard
          </Link>
        </li>
        <li>
          <Link href="/admin/hero" className={linkStyle}>
            Hero Section
          </Link>
        </li>
        <li>
          <Link href="/admin/kurikulum" className={linkStyle}>
            Kurikulum Section
          </Link>
        </li>
        <li>
          <Link href="/admin/news" className={linkStyle}>
            News Approval
          </Link>
        </li>
      </ul>
    </nav>
  );
}
