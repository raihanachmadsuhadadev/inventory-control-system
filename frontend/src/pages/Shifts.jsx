import MasterDataPage from "./master/MasterDataPage"

const fields = [
  { name: "name", label: "Nama Shift", placeholder: "Shift Pagi", required: true },
  { name: "code", label: "Kode", placeholder: "PAGI" },
  { name: "start_time", label: "Jam Mulai", type: "time" },
  { name: "end_time", label: "Jam Selesai", type: "time" },
  { name: "description", label: "Deskripsi", type: "textarea", placeholder: "Catatan shift" },
  { name: "is_active", label: "Status aktif", type: "checkbox" },
]

const columns = [
  { key: "name", label: "Nama" },
  { key: "code", label: "Kode" },
  { key: "start_time", label: "Mulai" },
  { key: "end_time", label: "Selesai" },
  { key: "description", label: "Deskripsi" },
]

function Shifts() {
  return (
    <MasterDataPage
      title="Shift"
      subtitle="Kelola jadwal kerja untuk operasional gudang."
      endpoint="/shifts"
      fields={fields}
      columns={columns}
    />
  )
}

export default Shifts
