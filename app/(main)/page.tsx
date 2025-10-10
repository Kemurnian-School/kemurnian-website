export const revalidate = 86400;

import { Metadata } from "next";
import Image from "next/image";

import HeroSliders from "@component/HeroSliders";
import SchoolsInfo from "@component/SchoolsInfo";
import KurikulumList from "@component/KurikulumList";
import NewsPreview from "@component/NewsPreview";
import ButtonPrimary from "@component/ButtonPrimary";
import SectionHeader from "@component/SectionHeader";

// data fetches import
import { getHeroData } from "@/utils/supabase/fetch/hero"
import { getKurikulumData } from "@/utils/supabase/fetch/kurikulum"
import { getLatestNewsData } from "@/utils/supabase/fetch/news"
import { getEnrollmentData } from "@/utils/supabase/fetch/enrollment"

export const metadata: Metadata = {
  title: "Sekolah Kemurnian",
  description:
    "Sekolah Kemurnian pertama didirikan dengan nama TK Kemurnian, pada tanggal 2 Januari 1978 di Jalan Kemurnian V No. 209, Jakarta Barat. Sampai saat ini, Sekolah Kemurnian telah berkembang sehingga mendirikan jenjang pendidikan dari Sekolah Dasar (SD), Sekolah Menengah Pertama (SMP), sampai pada Sekolah Menengah Atas (SMA) dan berekspansi hingga mendirikan 2 unit cabang sekolah, yaitu Sekolah Kemurnian II di Greenville dan Sekolah Kemurnian III di Citra.",
  keywords:
    "Sekolah Kemurnian, TK Kemurnian, SD Kemurnian, SMP Kemurnian, SMA Kemurnian, Jakarta Barat, Greenville, Citra, pendidikan",
};

export default async function Home() {

  // data fetches
  const fromHero = await getHeroData();
  const fromKurikulum = await getKurikulumData();
  const fromLatestNews = await getLatestNewsData();
  const fromEnrollment = await getEnrollmentData();

  const socialMediaStyles: string =
    "bg-[#818FAB] px-4 py-4 rounded-sm text-white font-raleway font-bold";

  return (
    <>
      {/* Hero Section */}
      <div id="hero">
        <HeroSliders images={fromHero} />
      </div>

      {/* Schools Info Section */}
      <div id="schools-info">
        <SchoolsInfo />
      </div>

      {/* About Section */}
      <section
        id="about"
        className="flex flex-col justify-center items-center px-4"
      >
        <SectionHeader title="TENTANG KAMI" as="h2" />
        <p className="mx-4 max-w-4xl mt-6 font-merriweather font-[100] leading-loose tracking-wider text-xs md:text-lg text-justify md:text-center">
          Sekolah Kemurnian pertama didirikan dengan nama TK Kemurnian, pada
          tanggal 2 Januari 1978 di Jalan Kemurnian V No. 209, Jakarta Barat.
          Sampai saat ini, Sekolah Kemurnian telah berkembang sehingga
          mendirikan jenjang pendidikan dari Sekolah Dasar (SD), Sekolah
          Menengah Pertama (SMP), sampai pada Sekolah Menengah Atas (SMA) dan
          berekspansi hingga mendirikan 2 unit cabang sekolah, yaitu Sekolah
          Kemurnian II di Greenville dan Sekolah Kemurnian III di Citra.
        </p>
        <ButtonPrimary text="READ ON" href="/about" />
      </section>

      <div className="bg-[#e6e6e6]">
        {/* Kurikulum Section */}
        <section id="kurikulum" className="px-4 py-20 mt-12">
          <SectionHeader title="KURIKULUM" as="h2" />
          <KurikulumList kurikulum={fromKurikulum} />
        </section>

        {/* News Section */}
        <section id="news" className="px-4 py-16">
          <SectionHeader title="NEWS AND EVENTS" as="h2" />
          <NewsPreview news={fromLatestNews} />
          <ButtonPrimary text="MORE NEWS" href="/news" />
        </section>

        {/* Enrollment Section */}
        <section
          id="enrollment"
          className="py-38 bg-btn-primary flex flex-col justify-center items-center"
        >
          <SectionHeader
            title="PENERMAAN PESERTA DIDIK BARU"
            h2ClassName="text-white tracking-widest"
            hrClassName="border-white"
            as="h2"
          />

          <div className="mx-10">
            <Image
              src={fromEnrollment?.image_url || "/placeholder-image.png"}
              alt="Enrollment"
              width={460}
              height={0}
              className="mx-auto mt-6 mb-10 rounded shadow-lg w-auto h-auto"
            />
          </div>
          <a
            href="/enrollment"
            className="bg-[#818FAB] py-3 px-5 rounded-lg font-bold text-white"
          >
            Pelajari Selengkapnya
          </a>
        </section>

        <section
          id="contact"
          className="flex flex-col justify-center items-center gap-4 py-16"
        >
          <h2 className="font-raleway font-black tracking-widest text-md">
            COME GET CLOSER WITH US
          </h2>
          <div className="flex gap-2">
            <a
              href="https://linktr.ee/sekolahkemurnian"
              className={socialMediaStyles}
            >
              Whatsapp
            </a>
            <a
              href="https://www.instagram.com/sekolah.kemurnian/"
              className={socialMediaStyles}
            >
              Instagram
            </a>
            <a
              href="https://www.youtube.com/@SekolahKemurnian"
              className={socialMediaStyles}
            >
              Youtube
            </a>
          </div>
          <hr className="clear-both mx-auto my-2 h-0 w-[90px] border-0 border-t-[3px] border-solid border-[#8b0000]" />
        </section>
      </div>
    </>
  );
}
