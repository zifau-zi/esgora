import { Leaf } from 'lucide-react'
import { TextField, TextAreaField, RadioGroupField } from '../ui/FormFields.jsx'
import FileUpload from '../ui/FileUpload.jsx'
import { ESG_COLORS, STATUS_OPTIONS } from '../../utils/constants.js'

const COLOR = ESG_COLORS.environmental

export default function EnvironmentalForm({ data, onChange, files, onFilesChange }) {
  const set = (field) => (e) => onChange(field, e.target.value)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 rounded-xl p-4" style={{ backgroundColor: `${COLOR}14` }}>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg text-white" style={{ backgroundColor: COLOR }}>
          <Leaf size={20} />
        </div>
        <div>
          <h3 className="font-bold text-slate-800">Aspek Lingkungan (Environmental)</h3>
          <p className="text-sm text-slate-500">Data mengenai pengelolaan lingkungan di sekitar sekolah.</p>
        </div>
      </div>

      <RadioGroupField
        label="Apakah sekolah memiliki program pengelolaan sampah (daur ulang / pemilahan)?"
        color={COLOR}
        options={STATUS_OPTIONS}
        value={data.wasteManagement}
        onChange={(v) => onChange('wasteManagement', v)}
      />
      <TextAreaField
        label="Deskripsi singkat program pengelolaan sampah"
        color={COLOR}
        rows={3}
        placeholder="Contoh: Bank sampah sekolah, pemilahan sampah organik & anorganik di setiap kelas..."
        value={data.wasteDescription}
        onChange={set('wasteDescription')}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Estimasi penggunaan energi terbarukan (%)"
          color={COLOR}
          type="number"
          min={0}
          max={100}
          placeholder="Contoh: 25"
          value={data.renewableEnergyPercent}
          onChange={set('renewableEnergyPercent')}
        />
        <TextField
          label="Jumlah pohon / tanaman di lingkungan sekolah"
          color={COLOR}
          type="number"
          min={0}
          placeholder="Contoh: 120"
          value={data.treeCount}
          onChange={set('treeCount')}
        />
      </div>

      <RadioGroupField
        label="Apakah sekolah memiliki program konservasi air?"
        color={COLOR}
        options={STATUS_OPTIONS}
        value={data.waterConservation}
        onChange={(v) => onChange('waterConservation', v)}
      />

      <RadioGroupField
        label="Apakah edukasi lingkungan hidup masuk dalam kurikulum / kegiatan sekolah?"
        color={COLOR}
        options={STATUS_OPTIONS}
        value={data.environmentalEducation}
        onChange={(v) => onChange('environmentalEducation', v)}
      />

      <FileUpload
        label="Unggah Bukti / Dokumen Pendukung"
        description="Contoh: foto program bank sampah, SK program lingkungan, laporan penggunaan energi, dsb."
        color={COLOR}
        files={files}
        onFilesChange={onFilesChange}
        accept=".pdf,.jpg,.jpeg,.png"
      />
    </div>
  )
}
