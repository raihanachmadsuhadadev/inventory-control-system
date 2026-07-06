import { Upload } from "lucide-react"
import { useState } from "react"
import ImportModal from "../components/ui/ImportModal"
import NeumorphicButton from "../components/ui/NeumorphicButton"
import NeumorphicCard from "../components/ui/NeumorphicCard"
import AppLayout from "../layouts/AppLayout"

function UsersPlaceholder() {
  const [importVisible, setImportVisible] = useState(false)

  return (
    <AppLayout>
      <section className="page-header">
        <div>
          <p className="eyebrow">Super Admin</p>
          <h1 className="page-title">User</h1>
          <p className="page-description">
            Modul pengelolaan user belum dibuat pada tahap ini.
          </p>
        </div>
        <div className="page-actions">
          <NeumorphicButton onClick={() => setImportVisible(true)}>
            <Upload size={18} />
            Import Excel
          </NeumorphicButton>
        </div>
      </section>

      <NeumorphicCard>
        <div className="empty-state">Halaman user siap dikembangkan.</div>
      </NeumorphicCard>

      {importVisible ? (
        <ImportModal
          title="Import User"
          templateUrl="/users/template"
          importUrl="/users/import"
          onClose={() => setImportVisible(false)}
        />
      ) : null}
    </AppLayout>
  )
}

export default UsersPlaceholder
