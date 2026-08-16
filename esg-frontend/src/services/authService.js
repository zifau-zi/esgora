// ============================================================================
// Layer autentikasi Admin Sekolah.
// USE_MOCK true -> login dicocokkan dengan /src/mock/auth.js (akun demo).
// USE_MOCK false -> POST ke /auth/login backend asli, menyimpan token JWT asli.
// ============================================================================
import apiClient from './apiClient.js'
import { USE_MOCK } from '../config.js'
import { delay } from '../utils/helpers.js'
import { mockAdminUser, mockStudentUser } from '../mock/auth.js'
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from '../utils/constants.js'
import { getSchoolById } from './schoolService.js'

const ROLE_LABEL = { super_admin: 'Super Admin', school_admin: 'Admin Sekolah' }

// Backend mengembalikan user { id, email, fullName, role, schoolId }.
// Frontend memakai { name, schoolName, role, roleLabel, schoolId }.
async function enrichUser(rawUser) {
  let schoolName = ''
  if (rawUser.schoolId != null) {
    const school = await getSchoolById(rawUser.schoolId).catch(() => null)
    schoolName = school?.name || ''
  }
  return {
    id: rawUser.id,
    email: rawUser.email,
    name: rawUser.fullName || rawUser.email,
    role: rawUser.role,
    roleLabel: ROLE_LABEL[rawUser.role] || rawUser.role,
    schoolId: rawUser.schoolId,
    schoolName,
  }
}

export async function loginRequest({ email, password, schoolId }) {
  const emailLower = email?.trim().toLowerCase() || ''

  if (USE_MOCK) {
    // Coba login siswa pakai NIS (case-insensitive)
    const studentMatch = mockStudentUser.nis?.trim().toLowerCase() === emailLower
    const studentPasswordMatch = password === mockStudentUser.password
    if (studentMatch && studentPasswordMatch) {
      await delay(700)
      const token = `mock-jwt-token-student-${Date.now()}`
      // Pakai schoolId yang dipilih siswa; fallback ke profil demo bila kosong.
      const resolvedSchoolId = schoolId || mockStudentUser.profile.schoolId
      const school = await getSchoolById(resolvedSchoolId).catch(() => null)
      const studentProfile = {
        ...mockStudentUser.profile,
        schoolId: resolvedSchoolId,
        schoolName: school?.name || mockStudentUser.profile.schoolName,
      }
      localStorage.setItem(AUTH_TOKEN_KEY, token)
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(studentProfile))
      return { user: studentProfile, token }
    }

    // Coba login admin
    if (emailLower === mockAdminUser.email?.trim().toLowerCase() && password === mockAdminUser.password) {
      await delay(700)
      const token = `mock-jwt-token-${Date.now()}`
      localStorage.setItem(AUTH_TOKEN_KEY, token)
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(mockAdminUser.profile))
      return { user: mockAdminUser.profile, token }
    }

    throw new Error('Email atau kata sandi salah. Gunakan tombol akun demo untuk mencoba.')
  }

  // Jika bukan mock, ke backend
  const { data } = await apiClient.post('/auth/login', { email, password })
  const user = await enrichUser(data.user)
  localStorage.setItem(AUTH_TOKEN_KEY, data.token)
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
  return { token: data.token, user }
}

export function logoutRequest() {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(AUTH_USER_KEY)
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
