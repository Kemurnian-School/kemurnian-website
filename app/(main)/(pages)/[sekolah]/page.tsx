import Link from "next/link";
import schoolsData from "../schools.json";
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
    .select("image_urls, title")
    .eq("nama_sekolah", params.sekolah);

  const facilityData = facilities ?? [];

  const imageUrls = facilityData.map((f) => f.image_urls);
  const subTitles = facilityData.map((f) => f.title);

  if (!data) return <div>School not found</div>;

  const unitCount = data.units.length;
  const isTwoColumnLayout = unitCount === 2 || unitCount === 4;

  return (
    <>
      <div className="flex justify-center p-4 mx-2">
        <div className={`flex flex-wrap justify-center gap-4 ${isTwoColumnLayout ? 'max-w-[656px]' : 'max-w-[1080]'}`}>
          {data.units.map((unit, index) => (
            <Link
              key={index}
              href={`/unit/${unit.nama_sekolah
                .replace(/\s+/g, "-")
                .toLowerCase()}`}
              className="flex-shrink-0 w-80"
            >
              <SchoolCard title={unit.nama_sekolah} />
            </Link>
          ))}
        </div>
      </div>
      {imageUrls.length > 0 && (
        <section className="mb-16">
          <SectionHeader title="FASILITAS" />
          <div className="flex justify-center">
            <ImageCardSlider
              images={imageUrls}
              alt={`Fasilitas ${data.title}`}
              title={subTitles}  // Pass array instead of single string
            />
          </div>
        </section>
      )}
    </>
  );
}
