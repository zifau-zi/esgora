import { Users } from 'lucide-react'
import { TextField, TextAreaField, RadioGroupField } from '../ui/FormFields.jsx'
import FileUpload from '../ui/FileUpload.jsx'
import { ESG_COLORS, STATUS_OPTIONS } from '../../utils/constants.js'

const COLOR = ESG_COLORS.social

export default function SocialForm({ data, onChange, files, onFilesChange }) {
  const set = (field) => (e) => onChange(field, e.target.value)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 rounded-xl p-4" style={{ backgroundColor: `${COLOR}14` }}>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg text-white" style={{ backgroundColor: COLOR }}>
          <Users size={20} />
        </div>
        <div>
          <h3 className="font-bold text-slate-800">Aspek Sosial (Social)</h3>
          <p className="text-sm text-slate-500">Data mengenai kesejahteraan siswa, guru, dan masyarakat sekitar.</p>
        </div>
      </div>

      <TextField
        label="Jumlah siswa penerima beasiswa / bantuan pendidikan"
        color={COLOR}
        type="number"
        min={0}
        placeholder="Contoh: 45"
        value={data.scholarshipCount}
        onChange={set('scholarshipCount')}
      />

      <RadioGroupField
        label="Fasilitas untuk siswa berkebutuhan khusus (aksesibilitas, pendampingan, dsb.)"
        color={COLOR}
        options={STATUS_OPTIONS}
        value={data.specialNeedsSupport}
        onChange={(v) => onChange('specialNeedsSupport', v)}
      />

      <RadioGroupField
        label="Program kesehatan siswa (UKS aktif, pemeriksaan berkala, dsb.)"
        color={COLOR}
        options={STATUS_OPTIONS}
        value={data.healthProgram}
        onChange={(v) => onChange('healthProgram', v)}
      />

      <TextAreaField
        label="Program pelatihan & kesejahteraan guru dalam setahun terakhir"
        color={COLOR}
        rows={3}
        placeholder="Contoh: Pelatihan kurikulum merdeka, workshop kesehatan mental guru..."
        value={data.teacherTraining}
        onChange={set('teacherTraining')}
      />

      <RadioGroupField
        label="Apakah sekolah memiliki kebijakan anti-perundungan (anti-bullying) tertulis?"
        color={COLOR}
        options={STATUS_OPTIONS}
        value={data.antiBullyingPolicy}
        onChange={(v) => onChange('antiBullyingPolicy', v)}
      />
      <TextAreaField
        label="Deskripsi singkat implementasi kebijakan tersebut"
        color={COLOR}
        rows={3}
        placeholder="Contoh: Sosialisasi rutin, kanal pengaduan siswa, tim penanganan khusus..."
        value={data.bullyingDescription}
        onChange={set('bullyingDescription')}
      />

      <FileUpload
        label="Unggah Bukti / Dokumen Pendukung"
        description="Contoh: laporan program beasiswa, SK kebijakan anti-perundungan, dokumentasi kegiatan sosial."
        color={COLOR}
        files={files}
        onFilesChange={onFilesChange}
        accept=".pdf,.jpg,.jpeg,.png"
      />
    </div>
  )
}
