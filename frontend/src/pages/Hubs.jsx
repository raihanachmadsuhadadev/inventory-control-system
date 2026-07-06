import MasterDataPage from "./master/MasterDataPage"

const fields = [
  { name: "name", label: "Nama Hub", placeholder: "Gudang Pusat", required: true },
  { name: "code", label: "Kode", placeholder: "HUB-PST" },
  { name: "address", label: "Alamat", type: "textarea", placeholder: "Alamat hub" },
  { name: "description", label: "Deskripsi", type: "textarea", placeholder: "Catatan hub" },
  { name: "is_active", label: "Status aktif", type: "checkbox" },
]

const columns = [
  { key: "name", label: "Nama" },
  { key: "code", label: "Kode" },
  { key: "address", label: "Alamat" },
  { key: "description", label: "Deskripsi" },
]

function Hubs() {
  return (
    <MasterDataPage
      title="Hub"
      subtitle="Kelola lokasi gudang atau titik distribusi inventaris."
      endpoint="/hubs"
      detailBasePath="/hubs"
      templateUrl="/hubs/template"
      importUrl="/hubs/import"
      fields={fields}
      columns={columns}
    />
  )
}

export default Hubs
