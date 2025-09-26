"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [pages, setPages] = useState<{ title: string; url: string }[]>([]);
  const [suggestions, setSuggestions] = useState<
    { title: string; url: string }[]
  >([]);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const inputRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navItems = [
    { label: "Home", href: "/" },
    { label: "School", href: "/#schools-info" },
    { label: "PPDB", href: "/#enrollment" },
    { label: "Kurikulum", href: "/#kurikulum" },
    { label: "About", href: "/#about" },
    { label: "News", href: "/#news" },
    { label: "Contact", href: "/#contact" },
  ];

  // Fetch search data
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SEARCH_BLOB_URL;
    if (!url) return;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch search data");
        return res.json();
      })
      .then((data) => setPages(data))
      .catch((err) => console.error("Search data fetch error:", err));
  }, []);

  // Debounce query
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(handler);
  }, [query]);

  // Filter suggestions
  useEffect(() => {
    if (!debouncedQuery) {
      setSuggestions([]);
      setHighlightIndex(-1);
      return;
    }
    const matches = pages
      .filter((p) =>
        p.title.toLowerCase().includes(debouncedQuery.toLowerCase()),
      )
      .slice(0, 10);
    setSuggestions(matches);
    setHighlightIndex(-1);
  }, [debouncedQuery, pages]);

  // Close suggestions on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSuggestions([]);
        setHighlightIndex(-1);
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  // Close suggestions when navbar closes
  useEffect(() => {
    if (!isMenuOpen) {
      setSuggestions([]);
      setQuery("");
      setHighlightIndex(-1);
    }
  }, [isMenuOpen]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setSuggestions([]);
        setHighlightIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightIndex >= 0 && highlightIndex < suggestions.length) {
        const selected = suggestions[highlightIndex];
        setQuery("");
        setSuggestions([]);
        setIsMenuOpen(false);
        window.location.href = selected.url;
      }
    }
  };

  return (
    <>
      <nav className="bg-gray-primary sticky top-0 z-50 h-16 w-full">
        <div className="flex h-full items-center justify-between">
          <button
            onClick={toggleMenu}
            className="bg-btn-primary flex h-16 w-16 flex-col items-center justify-center space-y-1 hover:opacity-80 transition-colors duration-200 relative z-[60] focus:outline-none cursor-pointer"
            aria-label="Toggle menu"
          >
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-5 h-[3px] bg-white" />
            ))}
          </button>

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
        <ul className="flex flex-col md:flex-row pt-10 px-2 md:p-8 gap-4 md:gap-10">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-white font-raleway font-bold text-xs border-b border-dotted pb-5 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </ul>

        {/* Search Box with Suggestions */}
        <div ref={inputRef} className="relative flex flex-col gap-1">
          <div className="flex">
            <input
              type="text"
              placeholder="Search"
              className="text-white w-full h-12 bg-[#555454] px-3 py-2 placeholder-gray-300 text-lg rounded-l-md focus:outline-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="bg-btn-primary w-12 h-12 flex justify-center items-center rounded-r-md">
              <Image src="/search.svg" alt="Search" width={20} height={30} />
            </button>
          </div>

          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 w-full bg-white font-merriweather max-h-60 overflow-y-auto z-50 rounded-b-md border border-gray-300 shadow-lg">
              {suggestions.map((s, i) => {
                const startIndex = s.title
                  .toLowerCase()
                  .indexOf(debouncedQuery.toLowerCase());
                const endIndex = startIndex + debouncedQuery.length;

                const isHighlighted = i === highlightIndex;

                return (
                  <Link
                    key={s.url}
                    href={s.url}
                    className={`block px-4 py-2 cursor-pointer transition-colors duration-150 ${
                      isHighlighted
                        ? "bg-btn-primary text-white"
                        : "text-gray-800 hover:bg-btn-primary hover:text-white"
                    }`}
                    onClick={() => {
                      setQuery("");
                      setIsMenuOpen(false);
                      setSuggestions([]);
                    }}
                  >
                    {startIndex > -1 ? (
                      <span>
                        {s.title.substring(0, startIndex)}
                        <strong className="font-bold">
                          {s.title.substring(startIndex, endIndex)}
                        </strong>
                        {s.title.substring(endIndex)}
                      </span>
                    ) : (
                      s.title
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
