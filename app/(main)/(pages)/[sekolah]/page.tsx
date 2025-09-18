import Link from "next/link";
import schoolsData from "./schools.json";
import SchoolCard from "../../components/SchoolCard";
import ImageCardSlider from "../../components/ImageCardSlider";
import { createClient } from "@/utils/supabase/server";
import SectionHeader from "../../components/SectionHeader";

interface Props {
  params: Promise<{ sekolah: string }>;
}

export default async function SchoolPage(props: Props) {
  const params = await props.params;
  const data = schoolsData[params.sekolah as keyof typeof schoolsData];

  const supabase = await createClient();
  const { data: facilities, error } = await supabase
    .from("fasilitas")
    .select("image_urls")
    .eq("nama_sekolah", params.sekolah);

  const imageUrls =
    error || !facilities ? [] : facilities.map((f) => f.image_urls);

  if (!data) return <div>School not found</div>;

  const unitCount = data.units.length;

  const isTwoColumnLayout = unitCount === 2 || unitCount === 4;

  const gridColsClass = isTwoColumnLayout ? "md:grid-cols-2" : "md:grid-cols-3";
  const containerWidthClass = isTwoColumnLayout ? "md:max-w-3xl" : "max-w-5xl";

  return (
    <>
      <div
        className={`grid grid-cols-1 ${gridColsClass} gap-4 p-4 mx-auto ${containerWidthClass}`}
      >
        {data.units.map((unit, index) => (
          <Link
            key={index}
            href={`/${params.sekolah}/${unit.nama_sekolah
              .replace(/\s+/g, "-")
              .toLowerCase()}`}
            className="justify-self-center"
          >
            <SchoolCard title={unit.nama_sekolah} />
          </Link>
        ))}
      </div>

      {imageUrls.length > 0 && (
        <section className="mb-16">
          <SectionHeader title="FASILITAS" />
          <div className="flex justify-center">
            <ImageCardSlider
              images={imageUrls}
              alt={`Fasilitas ${data.title}`}
            />
          </div>
        </section>
      )}
    </>
  );
}
