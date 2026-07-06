import MasterDataPage from "./master/MasterDataPage"

const fields = [
  { name: "code", label: "Kode", placeholder: "SUP-001" },
  { name: "name", label: "Nama Supplier", placeholder: "Nusa Agro", required: true },
  { name: "contact_person", label: "Kontak", placeholder: "Nama kontak" },
  { name: "phone", label: "Telepon", placeholder: "08123456789" },
  { name: "email", label: "Email", type: "email", placeholder: "supplier@example.com" },
  { name: "address", label: "Alamat", type: "textarea", placeholder: "Alamat supplier" },
  { name: "lead_time_days", label: "Lead Time (hari)", type: "number", placeholder: "5" },
  { name: "description", label: "Deskripsi", type: "textarea", placeholder: "Catatan supplier" },
  { name: "is_active", label: "Status aktif", type: "checkbox" },
]

const columns = [
  { key: "code", label: "Kode" },
  { key: "name", label: "Nama Supplier" },
  { key: "contact_person", label: "Kontak" },
  { key: "phone", label: "Telepon" },
  {
    key: "lead_time_days",
    label: "Lead Time",
    render: (item) =>
      item.lead_time_days === null || item.lead_time_days === undefined
        ? "-"
        : `${item.lead_time_days} hari`,
  },
]

function Suppliers() {
  return (
    <MasterDataPage
      title="Supplier"
      subtitle="Kelola pemasok dan lead time sebagai fondasi perhitungan ROP."
      endpoint="/suppliers"
      detailBasePath="/suppliers"
      templateUrl="/suppliers/template"
      importUrl="/suppliers/import"
      fields={fields}
      columns={columns}
      manageRoles={["super_admin", "admin_gudang"]}
    />
  )
}

export default Suppliers
