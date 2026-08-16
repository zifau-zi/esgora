// Akun demo untuk keperluan testing UI Portal Admin (mode mock).
export const mockAdminUser = {
  email: 'admin@sman1cendekia.sch.id',
  password: 'esgsekolah2026',
  profile: {
    id: 'admin-001',
    name: 'Budi Santoso',
    role: 'Admin Sekolah',
    schoolId: 'sch-001',
    schoolName: 'SMA Negeri 1 Cendekia',
  },
}

// Akun demo untuk siswa (pakai NIS + school)
export const mockStudentUser = {
  nis: '12345678',
  password: 'Siswa123!',
  profile: {
    id: 'student-001',
    name: 'Aisyah Putri',
    role: 'Siswa',
    schoolId: 'sch-002',
    schoolName: 'SD Islam Terpadu Nurul Ilmi',
  },
}
