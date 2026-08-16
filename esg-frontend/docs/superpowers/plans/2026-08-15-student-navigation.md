# Student Navigation & Public Links Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Provide clear public navigation between Admin & Student portals on the homepage/header, and create a dedicated responsive `StudentLayout` with sidebar navigation for logged-in students.

**Architecture:** 
1. `PublicLayout.jsx` will be updated to display explicit links to Portal Siswa and Portal Admin.
2. `StudentLayout.jsx` will be created to provide sidebar navigation and student session details for all student sub-pages.
3. `App.jsx` will wrap student routes inside `ProtectedRoute` and `StudentLayout`.

**Tech Stack:** React 18, React Router v6, Tailwind CSS, Lucide React icons.

---

### Task 1: Public Header Navigation & Homepage Student Links

**Files:**
- Modify: `src/components/layout/PublicLayout.jsx`
- Modify: `src/pages/public/HomePage.jsx`

- [ ] **Step 1: Update `PublicLayout.jsx` with Portal Siswa & Portal Admin links**
  Add explicit navigation buttons for "Portal Siswa" (`/student/login`) and "Portal Admin" (`/admin/login`).

- [ ] **Step 2: Update `HomePage.jsx` with Student & Admin Portal Cards**
  Add quick-action portal cards in the Hero section or bottom section for instant role selection.

---

### Task 2: Create StudentLayout Component & Integrate Routes in App.jsx

**Files:**
- Create: `src/components/layout/StudentLayout.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create `StudentLayout.jsx`**
  Implement responsive sidebar layout with navigation items (`Dashboard`, `Isi Data ESG`, `Hasil Analisis`), student profile summary, and logout button.

- [ ] **Step 2: Wrap student routes in `App.jsx`**
  Nest `/student/dashboard`, `/student/form-esg`, and `/student/hasil-analisis` inside `ProtectedRoute` and `StudentLayout`.

---

### Task 3: Build Verification

- [ ] **Step 1: Run `npm run build`**
  Ensure zero syntax or compilation errors.
