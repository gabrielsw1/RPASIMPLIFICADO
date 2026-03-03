import supabase from '../services/supabase.js'

export async function requireAdmin(request, reply) {
  if (!request.userId) {
    return reply.code(401).send({ error: 'Não autenticado' })
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', request.userId)
    .single()

  if (error || !data || data.role !== 'admin') {
    return reply.code(403).send({ error: 'Acesso restrito a administradores' })
  }
}
