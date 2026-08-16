-- 001_init.sql
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name     TEXT,
  role          TEXT NOT NULL CHECK (role IN ('super_admin', 'school_admin')),
  school_id     INTEGER REFERENCES schools(id),   -- NULL untuk super_admin
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE schools (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  npsn       TEXT NOT NULL UNIQUE,
  address    TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE indicators (                     -- framework penilaian (diseed super admin)
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  pillar     TEXT NOT NULL CHECK (pillar IN ('E', 'S', 'G')),
  code       TEXT NOT NULL UNIQUE,            -- mis. 'E-01'
  label      TEXT NOT NULL,
  weight     REAL NOT NULL DEFAULT 1,         -- bobot relatif dalam pilar
  options    TEXT,                            -- JSON array pilihan terstruktur
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE esg_assessments (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  school_id            INTEGER NOT NULL REFERENCES schools(id),
  year                 INTEGER NOT NULL,
  status               TEXT NOT NULL DEFAULT 'draft'
                       CHECK (status IN ('draft', 'submitted', 'reviewed')),
  environmental_score  REAL,
  social_score         REAL,
  governance_score     REAL,
  overall_score        REAL,
  predicate            TEXT,
  submitted_by         INTEGER REFERENCES users(id),
  created_at           TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at           TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (school_id, year)                    -- satu assessment per sekolah per tahun
);

CREATE TABLE evidence_files (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  assessment_id INTEGER NOT NULL REFERENCES esg_assessments(id) ON DELETE CASCADE,
  original_name TEXT NOT NULL,
  stored_name   TEXT NOT NULL,                -- nama unik di disk
  mime          TEXT NOT NULL,
  size          INTEGER NOT NULL,
  uploaded_by   INTEGER REFERENCES users(id),
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE assessment_answers (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  assessment_id    INTEGER NOT NULL REFERENCES esg_assessments(id) ON DELETE CASCADE,
  indicator_id     INTEGER NOT NULL REFERENCES indicators(id),
  value            TEXT,                      -- jawaban (kode opsi / angka)
  score            REAL,                      -- skor indikator hasil scoring
  evidence_file_id INTEGER REFERENCES evidence_files(id),
  UNIQUE (assessment_id, indicator_id)
);

CREATE TABLE recommendations (                -- hasil rule-based per assessment
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  assessment_id INTEGER NOT NULL REFERENCES esg_assessments(id) ON DELETE CASCADE,
  category      TEXT NOT NULL CHECK (category IN ('E', 'S', 'G')),
  title         TEXT NOT NULL,
  text          TEXT NOT NULL,
  priority      TEXT NOT NULL CHECK (priority IN ('Tinggi', 'Sedang', 'Rendah'))
);

CREATE INDEX idx_schools_npsn ON schools(npsn);
CREATE INDEX idx_schools_name ON schools(name);
CREATE INDEX idx_assess_school_year ON esg_assessments(school_id, year);
CREATE INDEX idx_answers_assessment ON assessment_answers(assessment_id);