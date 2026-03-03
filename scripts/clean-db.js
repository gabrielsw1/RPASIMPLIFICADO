/**
 * Script para limpar posts, cursos e dados relacionados do banco.
 * Uso: node scripts/clean-db.js
 *
 * Requer: backend/.env com SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { createInterface } from 'readline'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Carrega .env do backend
const __dir = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dir, '../backend/.env')

try {
  const envFile = readFileSync(envPath, 'utf-8')
  for (const line of envFile.split('\n')) {
    const [key, ...rest] = line.split('=')
    if (key && rest.length) process.env[key.trim()] = rest.join('=').trim()
  }
} catch {
  console.error('\x1b[31m✗ Não encontrei backend/.env — certifique-se de rodar da raiz do projeto\x1b[0m')
  process.exit(1)
}

const C = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m',
  blue: '\x1b[34m', cyan: '\x1b[36m', white: '\x1b[37m',
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
)

// Ordem de deleção respeitando foreign keys (filhos antes dos pais)
const steps = [
  // Blog
  { table: 'post_comments',   label: 'Comentários de posts' },
  { table: 'post_ratings',    label: 'Avaliações de posts' },
  { table: 'posts',           label: 'Posts' },

  // Cursos
  { table: 'lesson_comments', label: 'Comentários de aulas' },
  { table: 'lesson_progress', label: 'Progresso de aulas' },
  { table: 'help_requests',   label: 'Pedidos de ajuda' },
  { table: 'enrollments',     label: 'Matrículas' },
  { table: 'lessons',         label: 'Aulas' },
  { table: 'modules',         label: 'Módulos' },
  { table: 'courses',         label: 'Cursos' },
]

function ask(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => rl.question(question, (ans) => { rl.close(); resolve(ans) }))
}

async function countAll() {
  console.log(`\n${C.cyan}${C.bold}Contando registros...${C.reset}\n`)
  const counts = []
  for (const { table, label } of steps) {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true })
    if (error) {
      console.log(`  ${C.dim}${label.padEnd(30)}${C.reset} ${C.yellow}tabela não existe ou sem acesso${C.reset}`)
      counts.push({ ...{ table, label }, count: null })
    } else {
      const color = count > 0 ? C.yellow : C.dim
      console.log(`  ${label.padEnd(30)} ${color}${count} registro(s)${C.reset}`)
      counts.push({ table, label, count })
    }
  }
  return counts
}

async function deleteTable(table, label) {
  const { error, count } = await supabase
    .from(table)
    .delete({ count: 'exact' })
    .neq('id', '00000000-0000-0000-0000-000000000000') // deleta tudo

  if (error) {
    // Tenta com filtro numérico (tabelas com id integer)
    const { error: error2 } = await supabase.from(table).delete().gte('id', 0)
    if (error2) {
      console.log(`  ${C.red}✗ ${label}${C.reset} — ${error2.message}`)
      return false
    }
  }

  console.log(`  ${C.green}✓ ${label}${C.reset}`)
  return true
}

async function main() {
  console.log(`\n${C.bold}${C.red}╔══════════════════════════════════════╗`)
  console.log(`║   LIMPEZA DO BANCO DE DADOS          ║`)
  console.log(`╚══════════════════════════════════════╝${C.reset}`)
  console.log(`${C.dim}Ambiente: ${process.env.SUPABASE_URL}${C.reset}`)

  const counts = await countAll()
  const total = counts.reduce((s, c) => s + (c.count || 0), 0)

  if (total === 0) {
    console.log(`\n${C.green}✓ Banco já está vazio — nada a deletar.${C.reset}\n`)
    process.exit(0)
  }

  console.log(`\n${C.yellow}${C.bold}⚠ Total de registros que serão deletados: ${total}${C.reset}`)
  console.log(`${C.red}Esta operação é IRREVERSÍVEL.${C.reset}\n`)

  const answer = await ask(`${C.bold}Digite CONFIRMAR para prosseguir: ${C.reset}`)

  if (answer.trim() !== 'CONFIRMAR') {
    console.log(`\n${C.yellow}Operação cancelada.${C.reset}\n`)
    process.exit(0)
  }

  console.log(`\n${C.cyan}${C.bold}Deletando...${C.reset}\n`)

  for (const { table, label, count } of counts) {
    if (count === null || count === 0) {
      console.log(`  ${C.dim}– ${label} (vazio)${C.reset}`)
      continue
    }
    await deleteTable(table, label)
  }

  console.log(`\n${C.green}${C.bold}✓ Limpeza concluída!${C.reset}\n`)
}

main().catch((err) => {
  console.error(`\n${C.red}Erro inesperado:${C.reset}`, err.message)
  process.exit(1)
})
