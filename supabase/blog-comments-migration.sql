-- ============================================================
-- Migração: adiciona author_profile_url na tabela post_comments
-- Execute este SQL no Supabase SQL Editor
-- ============================================================

ALTER TABLE post_comments
  ADD COLUMN IF NOT EXISTS author_profile_url TEXT;
