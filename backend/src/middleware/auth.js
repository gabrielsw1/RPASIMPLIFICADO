import supabase from '../services/supabase.js'

export async function authenticate(request, reply) {
  const authHeader = request.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.code(401).send({ error: 'Token de autenticação não fornecido' })
  }

  const token = authHeader.slice(7)
  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data.user) {
    return reply.code(401).send({ error: 'Token inválido ou expirado' })
  }

  request.user = data.user
  request.userId = data.user.id
}
