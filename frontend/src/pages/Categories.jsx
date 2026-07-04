import MasterDataPage from "./master/MasterDataPage"

const fields = [
  { name: "name", label: "Nama Kategori", placeholder: "Bahan Baku", required: true },
  { name: "code", label: "Kode", placeholder: "BB" },
  { name: "description", label: "Deskripsi", type: "textarea", placeholder: "Catatan kategori" },
  { name: "is_active", label: "Status aktif", type: "checkbox" },
]

const columns = [
  { key: "name", label: "Nama" },
  { key: "code", label: "Kode" },
  { key: "description", label: "Deskripsi" },
]

function Categories() {
  return (
    <MasterDataPage
      title="Kategori"
      subtitle="Kelola pengelompokan barang untuk produk dan inventaris."
      endpoint="/categories"
      fields={fields}
      columns={columns}
    />
  )
}

export default Categories
