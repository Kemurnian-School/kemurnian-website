"use client";

import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  const mainHeight = "h-16";
  const hamburgerLine = "w-5 h-[3px] bg-white";

  return (
    <nav
      className={`bg-gray-primary sticky top-0 z-50 m-0 ${mainHeight} w-full p-0`}
    >
      <div className="flex h-full flex-row items-center justify-between">
        {/* Hamburger Menu Button (Left) */}
        <button
          className={`bg-btn-primary flex ${mainHeight} w-16 flex-col items-center justify-center space-y-1 cursor-pointer`}
          aria-label="Toggle menu"
        >
          <div className={hamburgerLine}></div>
          <div className={hamburgerLine}></div>
          <div className={hamburgerLine}></div>
        </button>

        {/* Center Logo */}
        <div className="absolute left-1/2 -translate-x-1/2 transform">
          <Link href="/">
            <Image
              src="/nav_logo.webp"
              alt="Logo"
              width={245}
              height={245}
              className="object-contain w-auto h-auto"
              priority
            />
          </Link>
        </div>

        {/* Empty space to balance layout (Right) */}
        <div className="w-10"></div>
      </div>
    </nav>
  );
}
