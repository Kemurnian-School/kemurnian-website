import { Metadata } from "next";
import schoolsData from "../../schools.json";
import Image from "next/image";

interface Props {
  params: Promise<{ detail: string }>;
}

// Helper function to find school and unit by detail slug
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

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const result = findSchoolAndUnit(params.detail);

  if (!result) {
    return {
      title: "Unit Not Found",
    };
  }

  const { schoolData, unit } = result;

  return {
    title: `${unit.nama_sekolah}`,
    description: `Detail informasi ${unit.nama_sekolah}, ${schoolData.title}. Akreditasi: ${unit.akreditasi.jenjang}, Status: ${unit.status_sekolah}`,
  };
}

export default async function SchoolDetailPage(props: Props) {
  const params = await props.params;
  const result = findSchoolAndUnit(params.detail);

  if (!result) return <div>Unit not found</div>;

  const { schoolData, unit } = result;

  const DetailRow = ({
    label,
    value,
    isChild = false,
  }: {
    label: string;
    value: string | number;
    isChild?: boolean;
  }) => (
    <>
      <div
        className={
          isChild
            ? "relative pl-5 before:content-['•'] before:absolute before:left-2"
            : "font-bold"
        }
      >
        {label}
      </div>
      <div>:</div>
      <div>{value}</div>
    </>
  );

  return (
    <div className="flex flex-col items-center p-6 font-merriweather">
      <Image
        src={`${schoolData.image_path}`}
        alt={`Foto ${schoolData.title}`}
        width={200}
        height={200}
        className="mb-8 h-auto w-52 object-cover shadow-md md:w-68"
        priority
      />
      <div className="grid grid-cols-[max-content_max-content_1fr] items-start ml-2 gap-x-2 md:gap-x-4 gap-y-1 md:gap-y-4 text-sm md:text-xl">
        {/* Nama Sekolah */}
        <DetailRow label="Nama Sekolah" value={unit.nama_sekolah} />
        {/* Akreditasi (Parent row now has the 'jenjang' value) */}
        <DetailRow label="Akreditasi" value={unit.akreditasi.jenjang} />
        <DetailRow
          label="No. SK Akreditasi"
          value={unit.akreditasi.no_sk}
          isChild
        />
        <DetailRow
          label="Tahun Akreditasi"
          value={unit.akreditasi.tahun}
          isChild
        />
        {/* Izin Operasional */}
        <DetailRow label="Izin Operasional" value={unit.izin_operasional} />
        {/* Alamat Sekolah (Parent row now has the 'jalan' value) */}
        <DetailRow label="Alamat Sekolah" value={unit.alamat.jalan} />
        <DetailRow label="Nomor Telepon" value={unit.kontak.telepon} isChild />
        <DetailRow label="Nomor Fax" value={unit.kontak.fax} isChild />
        <DetailRow
          label="Desa / Kelurahan"
          value={unit.alamat.desa_kelurahan}
          isChild
        />
        <DetailRow label="Kecamatan" value={unit.alamat.kecamatan} isChild />
        <DetailRow label="Kotamadya" value={unit.alamat.kotamadya} isChild />
        <DetailRow label="Provinsi" value={unit.alamat.provinsi} isChild />
        <DetailRow label="Kode Pos" value={unit.alamat.kode_pos} isChild />
        {/* Other Details */}
        <DetailRow label="Status Sekolah" value={unit.status_sekolah} />
        <DetailRow label="Nama Yayasan" value={unit.nama_yayasan} />
        <DetailRow
          label="Tanggal Berdirinya Sekolah"
          value={unit.tanggal_berdiri}
        />
        <DetailRow
          label="Status Tanah dan Bangunan"
          value={unit.status_tanah_bangunan}
        />
        <DetailRow
          label="Waktu Penyelenggaraan"
          value={unit.waktu_penyelenggaraan}
        />
      </div>
    </div>
  );
}
