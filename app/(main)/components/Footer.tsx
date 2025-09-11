import Image from "next/image";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { href: "#", alt: "Facebook", src: "/facebook.svg" },
    { href: "#", alt: "Instagram", src: "/instagram.svg" },
    { href: "#", alt: "YouTube", src: "/youtube.svg" },
  ];

  return (
    <footer className="bg-black-primary flex w-full flex-col items-center justify-center p-2 py-4 text-center text-white">
      <div className="mb-4 mt-2 flex gap-6">
        <Image
          src="/cambridge.webp"
          alt="Cambridge Logo"
          width={216}
          height={0}
          className="object-contain"
        />
        <div className="flex flex-col">
          <h3 className="font-raleway font-bold">FOLLOW US</h3>
          <div className="flex gap-3">
            {socialLinks.map((link) => (
              <a
                key={link.alt}
                href={link.href}
                className="group inline-block rounded-lg bg-white p-2 shadow-md transition-colors duration-300 ease-out hover:bg-red-600"
              >
                <Image
                  src={link.src}
                  alt={link.alt}
                  width={28}
                  height={28}
                  className="transition duration-300 ease-out group-hover:brightness-0 group-hover:invert"
                />
              </a>
            ))}
          </div>
        </div>
      </div>
      <span className="font-merriweather text-sm text-gray-400">
        Copyright © {currentYear} Kemurnian School. All rights reserved.
      </span>
    </footer>
  );
}
