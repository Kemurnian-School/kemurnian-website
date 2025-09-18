import schoolsData from "../schools.json";
import Image from "next/image";

interface Props {
  params: Promise<{ sekolah: string; detail: string }>;
}

export default async function SchoolDetailPage(props: Props) {
  const params = await props.params;
  const schoolData = schoolsData[params.sekolah as keyof typeof schoolsData];
  if (!schoolData) return <div>School not found</div>;

  const unit = schoolData.units.find(
    (u) => u.nama_sekolah.replace(/\s+/g, "-").toLowerCase() === params.detail,
  );

  if (!unit) return <div>Unit not found</div>;

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
        src={`${schoolData.image_path}`} // Assuming images are in the /public folder
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
