import { useRef, useState } from 'react'
import { UploadCloud, File as FileIcon, X } from 'lucide-react'
import { formatFileSize, classNames } from '../../utils/helpers.js'

// Komponen upload bukti dokumen (drag & drop + klik).
// File belum benar-benar terkirim ke mana pun (backend belum ada) — hanya
// disimpan di state komponen induk lewat onFilesChange. Saat submit form,
// object File aslinya (f.file) dikirim sebagai multipart/form-data oleh
// esgService.submitESGData().
export default function FileUpload({ label, description, files = [], onFilesChange, color = '#0F172A', accept }) {
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFiles = (fileList) => {
    const newFiles = Array.from(fileList).map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: file.name,
      size: file.size,
      file,
    }))
    onFilesChange([...files, ...newFiles])
  }

  const removeFile = (id) => {
    onFilesChange(files.filter((f) => f.id !== id))
  }

  return (
    <div>
      {label && <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>}
      {description && <p className="text-xs text-slate-500 mb-2">{description}</p>}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files)
        }}
        className={classNames(
          'cursor-pointer rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors',
          isDragging ? 'bg-slate-50' : 'bg-white hover:bg-slate-50'
        )}
        style={{ borderColor: isDragging ? color : '#CBD5E1' }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) handleFiles(e.target.files)
            e.target.value = ''
          }}
        />
        <UploadCloud className="mx-auto mb-2" size={28} style={{ color }} />
        <p className="text-sm font-medium text-slate-600">
          <span style={{ color }}>Klik untuk unggah</span> atau seret file ke sini
        </p>
        <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG hingga 10MB</p>
      </div>

      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((f) => (
            <li
              key={f.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <div className="flex items-center gap-2 min-w-0">
                <FileIcon size={16} className="text-slate-400 flex-shrink-0" />
                <span className="truncate text-slate-700">{f.name}</span>
                <span className="text-slate-400 text-xs flex-shrink-0">({formatFileSize(f.size)})</span>
              </div>
              <button
                type="button"
                onClick={() => removeFile(f.id)}
                className="text-slate-400 hover:text-red-500 flex-shrink-0"
                aria-label={`Hapus ${f.name}`}
              >
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
