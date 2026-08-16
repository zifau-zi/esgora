import { ShieldCheck } from 'lucide-react'
import { TextAreaField, SelectField, RadioGroupField } from '../ui/FormFields.jsx'
import FileUpload from '../ui/FileUpload.jsx'
import { ESG_COLORS, STATUS_OPTIONS, ACCREDITATION_OPTIONS } from '../../utils/constants.js'

const COLOR = ESG_COLORS.governance

export default function GovernanceForm({ data, onChange, files, onFilesChange }) {
  const set = (field) => (e) => onChange(field, e.target.value)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 rounded-xl p-4" style={{ backgroundColor: `${COLOR}14` }}>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg text-white" style={{ backgroundColor: COLOR }}>
          <ShieldCheck size={20} />
        </div>
        <div>
          <h3 className="font-bold text-slate-800">Aspek Tata Kelola (Governance)</h3>
          <p className="text-sm text-slate-500">Data mengenai transparansi, akuntabilitas, dan kepatuhan sekolah.</p>
        </div>
      </div>

      <SelectField
        label="Status akreditasi sekolah saat ini"
        color={COLOR}
        options={ACCREDITATION_OPTIONS}
        value={data.accreditation}
        onChange={set('accreditation')}
      />

      <RadioGroupField
        label="Transparansi laporan keuangan sekolah kepada wali murid / komite"
        color={COLOR}
        options={STATUS_OPTIONS}
        value={data.financialTransparency}
        onChange={(v) => onChange('financialTransparency', v)}
      />
      <TextAreaField
        label="Deskripsi singkat mekanisme pelaporan keuangan"
        color={COLOR}
        rows={3}
        placeholder="Contoh: Laporan keuangan dipaparkan pada rapat komite setiap semester..."
        value={data.financialDescription}
        onChange={set('financialDescription')}
      />

      <RadioGroupField
        label="Keberadaan & aktivitas Komite Sekolah"
        color={COLOR}
        options={STATUS_OPTIONS}
        value={data.schoolCommittee}
        onChange={(v) => onChange('schoolCommittee', v)}
      />

      <RadioGroupField
        label="Kebijakan kode etik / anti-korupsi tertulis"
        color={COLOR}
        options={STATUS_OPTIONS}
        value={data.codeOfConduct}
        onChange={(v) => onChange('codeOfConduct', v)}
      />

      <RadioGroupField
        label="Perlindungan data pribadi siswa & staf"
        color={COLOR}
        options={STATUS_OPTIONS}
        value={data.dataProtection}
        onChange={(v) => onChange('dataProtection', v)}
      />

      <FileUpload
        label="Unggah Bukti / Dokumen Pendukung"
        description="Contoh: SK akreditasi, laporan keuangan, kode etik sekolah, SK komite sekolah."
        color={COLOR}
        files={files}
        onFilesChange={onFilesChange}
        accept=".pdf,.jpg,.jpeg,.png"
      />
    </div>
  )
}
