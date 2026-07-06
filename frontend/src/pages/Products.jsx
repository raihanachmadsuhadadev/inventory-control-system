import { useEffect, useMemo, useState } from "react"
import api from "../lib/api"
import MasterDataPage from "./master/MasterDataPage"

const baseFields = [
  { name: "code", label: "Kode Produk", placeholder: "PRD-001", required: true },
  { name: "name", label: "Nama Produk", placeholder: "Kopi Arabica 1kg", required: true },
  { name: "category_id", label: "Kategori", type: "select", placeholder: "Pilih kategori", required: true },
  { name: "supplier_id", label: "Supplier", type: "select", placeholder: "Tanpa supplier" },
  { name: "unit", label: "Satuan", placeholder: "pcs / kg / liter", required: true },
  { name: "minimum_stock", label: "Minimum Stok", type: "number", placeholder: "0" },
  { name: "description", label: "Deskripsi", type: "textarea", placeholder: "Catatan produk" },
  { name: "is_active", label: "Status aktif", type: "checkbox" },
]

const columns = [
  { key: "code", label: "Kode" },
  { key: "name", label: "Nama Produk" },
  {
    key: "category",
    label: "Kategori",
    render: (item) => item.category?.name,
  },
  {
    key: "supplier",
    label: "Supplier",
    render: (item) => item.supplier?.name,
  },
  { key: "unit", label: "Satuan" },
  { key: "minimum_stock", label: "Minimum Stok" },
]

function Products() {
  const [categories, setCategories] = useState([])
  const [suppliers, setSuppliers] = useState([])

  useEffect(() => {
    const fetchOptions = async () => {
      const [categoryResponse, supplierResponse] = await Promise.all([
        api.get("/categories"),
        api.get("/suppliers"),
      ])

      setCategories(categoryResponse.data?.data || [])
      setSuppliers(supplierResponse.data?.data || [])
    }

    fetchOptions().catch(() => {
      setCategories([])
      setSuppliers([])
    })
  }, [])

  const fields = useMemo(
    () =>
      baseFields.map((field) => {
        if (field.name === "category_id") {
          return {
            ...field,
            options: categories.map((category) => ({
              value: category.id,
              label: `${category.name}${category.code ? ` (${category.code})` : ""}`,
            })),
          }
        }

        if (field.name === "supplier_id") {
          return {
            ...field,
            options: suppliers.map((supplier) => ({
              value: supplier.id,
              label: `${supplier.name}${supplier.code ? ` (${supplier.code})` : ""}`,
            })),
          }
        }

        return field
      }),
    [categories, suppliers],
  )

  return (
    <MasterDataPage
      title="Produk"
      subtitle="Kelola data produk, kategori, supplier, satuan, dan minimum stok."
      endpoint="/products"
      detailBasePath="/products"
      templateUrl="/products/template"
      importUrl="/products/import"
      fields={fields}
      columns={columns}
      manageRoles={["super_admin", "admin_gudang"]}
    />
  )
}

export default Products
