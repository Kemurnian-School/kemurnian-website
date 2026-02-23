"use client";

import Link from "next/link";
import Image from "next/image";
import {
  RiHome9Fill,
  RiImageFill,
  RiBookMarkedFill,
  RiNewsFill,
  RiMegaphone2Fill,
  RiSettings6Fill,
} from "@remixicon/react";

const linkStyle =
  "block w-full py-4 pl-6 hover:bg-btn-hover cursor-pointer text-left border-b border-red-800";

const menuLinks = [
  {
    href: "/admin/",
    label: "Dashboard",
    borderTop: true,
    icon: <RiHome9Fill className="inline-block mr-3 size-5" />
  },
  {
    href: "/admin/hero",
    label: "Hero Section",
    icon: <RiImageFill className="inline-block mr-3 size-5" />
  },
  {
    href: "/admin/kurikulum",
    label: "Kurikulum Section",
    icon: <RiBookMarkedFill className="inline-block mr-3 size-5" />
  },
  {
    href: "/admin/news",
    label: "News",
    icon: <RiNewsFill className="inline-block mr-3 size-5" />
  },
  { href: "/admin/enrollment",
    label: "Enrollment",
    icon: <RiMegaphone2Fill className="inline-block mr-3 size-5" />
  },
  { href: "/admin/fasilitas",
    label: "Fasilitas",
    icon: <RiSettings6Fill className="inline-block mr-3 size-5" />
  },
];

export default function AdminSidebar() {
  return (
    <nav className="sticky top-0 w-64 bg-red-primary h-screen text-white flex-shrink-0">
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
            className={`flex items-center ${linkStyle} ${link.borderTop ? "border-t" : ""}`}
          >
            {link.icon && link.icon}
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
