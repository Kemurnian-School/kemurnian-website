"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    setIsMenuOpen(false);
  };

  const navItems = [
    { id: "hero", label: "Home", href: "/" },
    { id: "schools-info", label: "School", href: "/#schools-info" },
    { id: "enrollment", label: "PPDB", href: "/#enrollment" },
    { id: "kurikulum", label: "Kurikulum", href: "/#kurikulum" },
    { id: "about", label: "About", href: "/#about" },
    { id: "news", label: "News", href: "/#news" },
    { id: "contact", label: "Contact", href: "/#contact" },
  ];

  const NavItem = ({ item }: { item: (typeof navItems)[0] }) => {
    const className =
      "text-white font-raleway font-bold text-xs border-b border-dotted pb-5 cursor-pointer hover:opacity-80 transition-opacity";

    if (isHomePage) {
      return (
        <li className={className} onClick={() => scrollToSection(item.id)}>
          {item.label}
        </li>
      );
    }

    return (
      <Link href={item.href} className={className} onClick={toggleMenu}>
        {item.label}
      </Link>
    );
  };

  return (
    <>
      <nav className="bg-gray-primary sticky top-0 z-50 h-16 w-full">
        <div className="flex h-full items-center justify-between">
          {/* Hamburger Menu */}
          <button
            onClick={toggleMenu}
            className="bg-btn-primary flex h-16 w-16 flex-col items-center justify-center space-y-1 hover:opacity-80 transition-colors duration-200 relative z-[60] focus:outline-none"
            aria-label="Toggle menu"
          >
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-5 h-[3px] bg-white" />
            ))}
          </button>

          {/* Logo */}
          <div className="absolute left-1/2 -translate-x-1/2 z-[60]">
            <Link href="/">
              <Image
                src="/nav_logo.webp"
                alt="Logo"
                width={245}
                height={245}
                className="w-auto h-auto"
                priority
              />
            </Link>
          </div>
          <div className="w-10" />
        </div>
      </nav>

      <section
        className={`fixed top-16 left-0 w-full px-12 pb-7 pt-4 bg-gray-primary z-40 transition-transform duration-300 ease-out flex flex-col-reverse md:flex-col ${
          isMenuOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        {/* Navigation Items */}
        <ul className="flex flex-col md:flex-row pt-10 px-2 md:p-8 gap-4 md:gap-10">
          {navItems.map((item) => (
            <NavItem key={item.id} item={item} />
          ))}
        </ul>

        {/* Search Bar */}
        <div className="flex gap-1">
          <input
            type="text"
            placeholder="Search"
            className="w-full h-12 bg-[#555454] px-3 py-6 placeholder-white text-lg rounded-l-md focus:outline-none"
          />
          <button className="bg-btn-primary w-12 h-12 flex justify-center items-center rounded-r-md">
            <Image src="/search.svg" alt="Search" width={20} height={30} />
          </button>
        </div>
      </section>
    </>
  );
}
