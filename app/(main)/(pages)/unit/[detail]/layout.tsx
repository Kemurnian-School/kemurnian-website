import SectionHeader from "../../../components/SectionHeader";
import schoolsData from "../../schools.json";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ detail: string }>;
}

function findSchoolAndUnit(detailSlug: string) {
  for (const [schoolKey, schoolData] of Object.entries(schoolsData)) {
    const unit = schoolData.units.find(
      (u) => u.nama_sekolah.replace(/\s+/g, "-").toLowerCase() === detailSlug
    );
    if (unit) {
      return { schoolKey, schoolData, unit };
    }
  }
  return null;
}

export default async function ChildSchoolLayout(props: LayoutProps) {
  const params = await props.params;
  const result = findSchoolAndUnit(params.detail);

  if (!result) return <div>Unit Not Found</div>;

  const { unit } = result;

  return (
    <>
      <div className="flex items-center justify-center mb-8 w-full h-56 md:h-86 bg-red-primary text-white text-3xl md:text-6xl font-raleway font-bold text-center uppercase">
        <h1>{unit.nama_sekolah}</h1>
      </div>
      <SectionHeader title="DETAIL UNIT SEKOLAH" as="h2" />
      {props.children}
    </>
  );
}
