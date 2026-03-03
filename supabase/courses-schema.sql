-- ============================================================
-- RPA Simplificado — Schema: Cursos, Matrículas e Área do Aluno
-- Execute este SQL no Supabase SQL Editor
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- PERFIS DE USUÁRIO (estende auth.users)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name   TEXT,
  avatar_url  TEXT,
  role        TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: cria perfil automaticamente ao cadastrar usuário
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ────────────────────────────────────────────────────────────
-- CURSOS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS courses (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title            TEXT NOT NULL,
  slug             TEXT UNIQUE NOT NULL,
  description      TEXT,
  full_description TEXT,
  thumbnail        TEXT,
  price            DECIMAL(10,2) DEFAULT 0,
  is_free          BOOLEAN DEFAULT false,
  level            TEXT CHECK (level IN ('iniciante', 'intermediario', 'avancado')),
  category         TEXT,
  tags             TEXT[],
  published        BOOLEAN DEFAULT false,
  stripe_price_id  TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- MÓDULOS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS modules (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id   UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  title       TEXT NOT NULL,
  description TEXT,
  position    INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- AULAS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lessons (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id        UUID REFERENCES modules(id) ON DELETE CASCADE NOT NULL,
  title            TEXT NOT NULL,
  description      TEXT,
  video_url        TEXT,
  duration_seconds INTEGER DEFAULT 0,
  position         INTEGER NOT NULL DEFAULT 0,
  is_preview       BOOLEAN DEFAULT false,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- MATRÍCULAS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS enrollments (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id         UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  status            TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled')),
  payment_method    TEXT CHECK (payment_method IN ('free', 'stripe')),
  stripe_session_id TEXT,
  enrolled_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, course_id)
);

-- ────────────────────────────────────────────────────────────
-- PROGRESSO NAS AULAS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lesson_progress (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id    UUID REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  completed    BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  UNIQUE (user_id, lesson_id)
);

-- ────────────────────────────────────────────────────────────
-- COMENTÁRIOS NAS AULAS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lesson_comments (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id     UUID REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  author_name   TEXT,
  author_avatar TEXT,
  content       TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- PEDIDOS DE AJUDA
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS help_requests (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id   UUID REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  author_name TEXT,
  description TEXT NOT NULL,
  status      TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- ANOTAÇÕES DE AULAS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lesson_notes (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id  UUID REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  content    TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- ────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ────────────────────────────────────────────────────────────

-- profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuário vê próprio perfil" ON profiles;
DROP POLICY IF EXISTS "Usuário atualiza próprio perfil" ON profiles;
CREATE POLICY "Usuário vê próprio perfil" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Usuário atualiza próprio perfil" ON profiles FOR UPDATE USING (auth.uid() = id);

-- courses (leitura pública de publicados)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Cursos publicados são públicos" ON courses;
CREATE POLICY "Cursos publicados são públicos" ON courses FOR SELECT USING (published = true);

-- modules (leitura pública via curso publicado)
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Módulos de cursos publicados são públicos" ON modules;
CREATE POLICY "Módulos de cursos publicados são públicos" ON modules FOR SELECT
  USING (EXISTS (SELECT 1 FROM courses WHERE courses.id = modules.course_id AND courses.published = true));

-- lessons (leitura pública via módulo/curso publicado)
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Aulas de cursos publicados são públicas" ON lessons;
CREATE POLICY "Aulas de cursos publicados são públicas" ON lessons FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM modules
    JOIN courses ON courses.id = modules.course_id
    WHERE modules.id = lessons.module_id AND courses.published = true
  ));

-- enrollments (aluno vê próprias matrículas)
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Aluno vê próprias matrículas" ON enrollments;
DROP POLICY IF EXISTS "Aluno cria matrícula" ON enrollments;
CREATE POLICY "Aluno vê próprias matrículas" ON enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Aluno cria matrícula" ON enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- lesson_progress
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Aluno vê próprio progresso" ON lesson_progress;
DROP POLICY IF EXISTS "Aluno registra progresso" ON lesson_progress;
DROP POLICY IF EXISTS "Aluno atualiza progresso" ON lesson_progress;
CREATE POLICY "Aluno vê próprio progresso" ON lesson_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Aluno registra progresso" ON lesson_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Aluno atualiza progresso" ON lesson_progress FOR UPDATE USING (auth.uid() = user_id);

-- lesson_comments
ALTER TABLE lesson_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Comentários visíveis para matriculados" ON lesson_comments;
DROP POLICY IF EXISTS "Aluno comenta" ON lesson_comments;
DROP POLICY IF EXISTS "Aluno exclui próprio comentário" ON lesson_comments;
CREATE POLICY "Comentários visíveis para matriculados" ON lesson_comments FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Aluno comenta" ON lesson_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Aluno exclui próprio comentário" ON lesson_comments FOR DELETE USING (auth.uid() = user_id);

-- help_requests
ALTER TABLE help_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Aluno vê próprias dúvidas" ON help_requests;
DROP POLICY IF EXISTS "Aluno cria dúvida" ON help_requests;
CREATE POLICY "Aluno vê próprias dúvidas" ON help_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Aluno cria dúvida" ON help_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- lesson_notes
ALTER TABLE lesson_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Aluno vê próprias notas" ON lesson_notes;
DROP POLICY IF EXISTS "Aluno cria nota" ON lesson_notes;
DROP POLICY IF EXISTS "Aluno atualiza nota" ON lesson_notes;
CREATE POLICY "Aluno vê próprias notas" ON lesson_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Aluno cria nota" ON lesson_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Aluno atualiza nota" ON lesson_notes FOR UPDATE USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- BUCKETS DO SUPABASE STORAGE
-- (Execute no dashboard: Storage > New Bucket)
-- ────────────────────────────────────────────────────────────
-- Bucket "videos"      — privado (vídeos das aulas)
-- Bucket "thumbnails"  — público (capas dos cursos)
-- Bucket "covers"      — público (capas dos posts)
--
-- Após criar, adicione as policies de storage:
-- thumbnails e covers: INSERT/SELECT para todos (public)
-- videos: INSERT para service_role; SELECT para auth users matriculados
