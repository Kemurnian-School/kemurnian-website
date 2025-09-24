import Image from "next/image";
export default async function AboutPage() {
  return (
    <section className="bg-btn-primary pb-16">
      <h1 className="flex items-center justify-center mb-8 w-full h-40 md:h-86 bg-red-primary text-white text-4xl md:text-6xl font-raleway font-bold text-center uppercase">
        ABOUT US
      </h1>
      <div className="max-w-4xl mx-auto px-4">
        <Image
          src="/about-us.avif"
          alt="about-us"
          width={800} // safe intrinsic width
          height={500} // keep aspect ratio
          className="w-full h-auto rounded-lg"
          priority
        />
      </div>
    </section>
  );
}
