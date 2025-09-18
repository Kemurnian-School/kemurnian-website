"use client";
import { useParams } from "next/navigation";
import schoolsData from "./schools.json";
import SectionHeader from "../../components/SectionHeader";

export default function SchoolsGeneralLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const schoolId = params.sekolah as string;

  const data = schoolsData[schoolId as keyof typeof schoolsData];

  return (
    <>
      <div className="flex items-center justify-center mb-8 w-full h-56 md:h-86 bg-red-primary text-white text-3xl md:text-6xl font-raleway font-bold text-center uppercase">
        {data?.title}
      </div>
      <SectionHeader title="UNIT SEKOLAH" />
      {children}
    </>
  );
}
