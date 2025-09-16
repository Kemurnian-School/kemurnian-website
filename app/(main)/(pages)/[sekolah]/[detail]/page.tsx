import schoolsData from "../schools.json";

interface Props {
  params: { sekolah: string; detail: string };
}

export default function SchoolDetailPage({ params }: Props) {
  const schoolData = schoolsData[params.sekolah as keyof typeof schoolsData];
  if (!schoolData) return <div>School not found</div>;

  const unit = schoolData.units.find(
    u => u.nama_sekolah.replace(/\s+/g, "-").toLowerCase() === params.detail
  );

  if (!unit) return <div>Unit not found</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">{unit.nama_sekolah}</h1>
      <div className="mb-2"><strong>Status:</strong> {unit.status_sekolah}</div>
      <div className="mb-2"><strong>Akreditasi:</strong> {unit.akreditasi.jenjang} ({unit.akreditasi.tahun})</div>
      <div className="mb-2"><strong>Alamat:</strong> {unit.alamat.jalan}, {unit.alamat.desa_kelurahan}, {unit.alamat.kecamatan}, {unit.alamat.kotamadya}, {unit.alamat.provinsi} - {unit.alamat.kode_pos}</div>
      <div className="mb-2"><strong>Telepon:</strong> {unit.kontak.telepon}</div>
      <div className="mb-2"><strong>Fax:</strong> {unit.kontak.fax}</div>
      <div className="mb-2"><strong>Waktu Penyelenggaraan:</strong> {unit.waktu_penyelenggaraan}</div>
      <div className="mb-2"><strong>Tanggal Berdiri:</strong> {unit.tanggal_berdiri}</div>
      <div className="mb-2"><strong>Status Tanah Bangunan:</strong> {unit.status_tanah_bangunan}</div>
    </div>
  );
}
