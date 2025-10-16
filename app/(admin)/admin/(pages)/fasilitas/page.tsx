import FasilitasClient from "./FasilitasClient";
import { fasilitasRepository } from "@repository/fasilitas";

export default async function FasilitasPage() {
  const repo = await fasilitasRepository();
  const schools = [
    "sekolah-kemurnian-1",
    "sekolah-kemurnian-2",
    "sekolah-kemurnian-3",
  ];

  const grouped = Object.fromEntries(
    await Promise.all(
      schools.map(async (school) => [
        school,
        await repo.getAllBySchool(school),
      ]),
    ),
  );

  return <FasilitasClient initialData={grouped} />;
}
