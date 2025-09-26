import { Metadata } from "next";
import schoolsData from "./schools.json";
import SectionHeader from "../../components/SectionHeader";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ sekolah: string }>;
}

export async function generateMetadata(props: LayoutProps): Promise<Metadata> {
  const params = await props.params;
  const schoolId = params.sekolah;
  const data = schoolsData[schoolId as keyof typeof schoolsData];

  if (!data) {
    return {
      title: "School Not Found",
    };
  }

  return {
    title: data.title,
    description: `Learn about ${data.title} - Unit Sekolah`,
  };
}

export default async function SchoolsGeneralLayout(props: LayoutProps) {
  const params = await props.params;
  const schoolId = params.sekolah;
  const data = schoolsData[schoolId as keyof typeof schoolsData];

  return (
    <>
      <div className="flex items-center justify-center mb-8 w-full h-56 md:h-86 bg-red-primary text-white text-3xl md:text-6xl font-raleway font-bold text-center uppercase">
        <h1>{data?.title}</h1>
      </div>
      <SectionHeader title="UNIT SEKOLAH" as="h2" />
      {props.children}
    </>
  );
}
