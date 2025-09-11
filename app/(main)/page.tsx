import HeroSliders from "./components/HeroSliders"
import SchoolsInfo from "./components/SchoolsInfo"
import KurikulumList from "./components/KurikulumList"
import NewsPreview from "./components/NewsPreview"

import ButtonPrimary from "./components/ButtonPrimary"
import SectionHeader from "./components/SectionHeader"
import Footer from "./components/Footer"
import { createClient } from "@/utils/supabase/server"
import Image from "next/image"

export default async function Home() {
  const supabase = await createClient()

  // Fetch hero sliders
  const { data: heroImages, error: heroImagesError } = await supabase
    .from("hero_sliders")
    .select("*")
    .order("order", { ascending: true })
  const images = heroImagesError ? [] : heroImages || []

  // Fetch kurikulum
  const { data: kurikulums, error: kurikulumsError } = await supabase
    .from("kurikulum")
    .select("*")
    .order("order", { ascending: true })
  const kurikulumList = kurikulumsError ? [] : kurikulums || []

  // Fetch latest 3 news
  const { data: newsData, error: newsError } = await supabase
    .from("news")
    .select("*")
    .order("date", { ascending: false })
    .limit(3)
  const news = newsError ? [] : newsData || []

  // Fetch enrollment (always 1 row)
  const { data: enrollmentData, error: enrollmentError } = await supabase
    .from("enrollment")
    .select("*")
    .single()
  const enrollment = enrollmentError ? null : enrollmentData

  return (
    <>
      <HeroSliders images={images} />
      <SchoolsInfo />

      <section className="flex flex-col justify-center items-center px-4">
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

      <div className="bg-[#e6e6e6]">
        <section className="px-4 py-20 mt-12">
          <SectionHeader title="KURIKULUM" />
          <KurikulumList kurikulum={kurikulumList} />
        </section>

        <section className="px-4 py-16">
          <SectionHeader title="NEWS AND EVENTS" />
          <NewsPreview news={news} />
          <ButtonPrimary text="MORE NEWS" href="/news" />
        </section>

        <section className="py-38 bg-btn-primary flex flex-col justify-center items-center">
          <SectionHeader
            title="PENERMAAN PESERTA DIDIK BARU"
            h2ClassName="text-white tracking-widest"
            hrClassName="border-white"
          />

          <Image
            src={enrollment?.image_url || "/placeholder-image.png"}
            alt="Enrollment"
            width={460}
            height={0}
            className="mx-auto mt-6 mb-10 rounded shadow-lg"
          />
          <a href="/enrollment" className="bg-[#818FAB] py-3 px-5 rounded-lg font-bold text-white">Pelajari Selengkapnya</a>
        </section>
      </div>

      <Footer />
    </>
  )
}
