import Link from "next/link";
import SchoolCard from "../../components/SchoolCard";
import schoolsData from "./schools.json";

interface Props {
  params: { sekolah: string };
}

export default function SchoolPage({ params }: Props) {
  const data = schoolsData[params.sekolah as keyof typeof schoolsData];

  if (!data) return <div>School not found</div>;

  return (
    <div className="flex flex-wrap justify-center gap-6">
        {data.units.map((unit, index) => (
            <Link
            key={index}
            href={`/${params.sekolah}/${unit.nama_sekolah.replace(/\s+/g, "-").toLowerCase()}`}
            >
            <SchoolCard title={unit.nama_sekolah} />
            </Link>
        ))}
    </div>

    
  );
}
