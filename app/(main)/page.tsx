import HeroSliders from "../components/HeroSliders";
import SchoolsInfo from "../components/SchoolsInfo";
import SectionHeader from "../components/SectionHeader";
import ButtonPrimary from "../components/ButtonPrimary";

import { createClient } from "@/utils/supabase/client";

export default function Home() {
  return (
    <>
      <HeroSliders />
      <SchoolsInfo />
      <section className="flex flex-col justify-center items-center">
        <SectionHeader title="TENTANG KAMI" />
        <p className="max-w-4xl mt-6 font-merriweather font-[100] leading-loose tracking-wider text-md text-center">
          Sekolah Kemurnian pertama didirikan dengan nama TK Kemurnian, pada
          tanggal 2 Januari 1978 di Jalan Kemurnian V No. 209, Jakarta Barat.
          Sampai saat ini, Sekolah Kemurnian telah berkembang sehingga
          mendirikan jenjang pendidikan dari Sekolah Dasar (SD), Sekolah
          Menengah Pertama (SMP), sampai pada Sekolah Menengah Atas (SMA) dan
          berekspansi hingga mendirikan 2 unit cabang sekolah, yaitu Sekolah
          Kemurnian II di Greenville dan Sekolah Kemurnian III di Citra.
        </p>
        <ButtonPrimary text="READ ON" />
      </section>
    </>
  );
}
