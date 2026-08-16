import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Leaf, Users, ShieldCheck, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import Stepper from '../../components/ui/Stepper.jsx'
import Card from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import EnvironmentalForm from '../../components/forms/EnvironmentalForm.jsx'
import SocialForm from '../../components/forms/SocialForm.jsx'
import GovernanceForm from '../../components/forms/GovernanceForm.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { submitESGData } from '../../services/esgService.js'
import { ESG_COLORS } from '../../utils/constants.js'

const STEPS = [
  { key: 'environmental', label: 'Lingkungan', color: ESG_COLORS.environmental, icon: Leaf },
  { key: 'social', label: 'Sosial', color: ESG_COLORS.social, icon: Users },
  { key: 'governance', label: 'Tata Kelola', color: ESG_COLORS.governance, icon: ShieldCheck },
]

const INITIAL_DATA = {
  environmental: {
    wasteManagement: '',
    wasteDescription: '',
    renewableEnergyPercent: '',
    treeCount: '',
    waterConservation: '',
    environmentalEducation: '',
  },
  social: {
    scholarshipCount: '',
    specialNeedsSupport: '',
    healthProgram: '',
    teacherTraining: '',
    antiBullyingPolicy: '',
    bullyingDescription: '',
  },
  governance: {
    accreditation: '',
    financialTransparency: '',
    financialDescription: '',
    schoolCommittee: '',
    codeOfConduct: '',
    dataProtection: '',
  },
}

const INITIAL_FILES = { environmental: [], social: [], governance: [] }

export default function ESGFormPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState(INITIAL_DATA)
  const [files, setFiles] = useState(INITIAL_FILES)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const currentKey = STEPS[step].key

  const updateField = (section) => (field, value) => {
    setFormData((prev) => ({ ...prev, [section]: { ...prev[section], [field]: value } }))
  }

  const updateFiles = (section) => (newFiles) => {
    setFiles((prev) => ({ ...prev, [section]: newFiles }))
  }

  const handleNext = () => setStep((s) => Math.min(s + 1, STEPS.length - 1))
  const handleBack = () => setStep((s) => Math.max(s - 1, 0))

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await submitESGData(user.schoolId, formData, files)
      setSubmitted(true)
      const resultsPath = user?.role === 'Siswa' ? '/student/hasil-analisis' : '/admin/hasil-analisis'
      setTimeout(() => navigate(resultsPath), 1200)
    } catch (err) {
      alert(err.message || 'Gagal mengirim data. Silakan coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 size={32} className="text-emerald-600" />
        </div>
        <h2 className="font-display text-xl font-bold text-slate-900">Data Berhasil Dikirim!</h2>
        <p className="mt-1 text-slate-500">Mengarahkan Anda ke halaman Hasil Analisis...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Formulir Data ESG</h1>
        <p className="mt-1 text-slate-500">Lengkapi data secara bertahap untuk sekolah {user.schoolName}.</p>
      </div>

      <Card className="p-5 sm:p-6">
        <Stepper steps={STEPS} currentStep={step} />
      </Card>

      <Card className="p-5 sm:p-8">
        {currentKey === 'environmental' && (
          <EnvironmentalForm
            data={formData.environmental}
            onChange={updateField('environmental')}
            files={files.environmental}
            onFilesChange={updateFiles('environmental')}
          />
        )}
        {currentKey === 'social' && (
          <SocialForm
            data={formData.social}
            onChange={updateField('social')}
            files={files.social}
            onFilesChange={updateFiles('social')}
          />
        )}
        {currentKey === 'governance' && (
          <GovernanceForm
            data={formData.governance}
            onChange={updateField('governance')}
            files={files.governance}
            onFilesChange={updateFiles('governance')}
          />
        )}
      </Card>

      <div className="flex items-center justify-between">
        {step > 0 ? (
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft size={16} /> Sebelumnya
          </Button>
        ) : (
          <span />
        )}

        {step < STEPS.length - 1 ? (
          <Button color={STEPS[step].color} onClick={handleNext}>
            Selanjutnya <ArrowRight size={16} />
          </Button>
        ) : (
          <Button color={STEPS[step].color} onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Mengirim...' : 'Kirim Data'} <CheckCircle2 size={16} />
          </Button>
        )}
      </div>
    </div>
  )
}
