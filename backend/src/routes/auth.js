export default async function authRoutes(fastify) {
  // POST /api/auth/login — autentica via Supabase e retorna o token
  fastify.post('/auth/login', async (request, reply) => {
    const { email, password } = request.body || {}

    if (!email || !password) {
      return reply.code(400).send({ error: 'Email e senha são obrigatórios' })
    }

    const res = await fetch(
      `${process.env.SUPABASE_URL}/auth/v1/token?grant_type=password`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: process.env.SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ email, password }),
      },
    )

    const data = await res.json()

    if (!res.ok) {
      return reply.code(401).send({ error: data.error_description || data.msg || 'Credenciais inválidas' })
    }

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      user: data.user,
    }
  })

  // POST /api/auth/logout — invalida o token no Supabase
  fastify.post('/auth/logout', async (request, reply) => {
    const token = request.headers.authorization?.replace('Bearer ', '')
    if (!token) return { success: true }

    await fetch(`${process.env.SUPABASE_URL}/auth/v1/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: process.env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
      },
    })

    return { success: true }
  })

  // GET /api/auth/me — retorna usuário autenticado a partir do token
  fastify.get('/auth/me', async (request, reply) => {
    const token = request.headers.authorization?.replace('Bearer ', '')
    if (!token) return reply.code(401).send({ error: 'Token não fornecido' })

    const res = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
      headers: {
        apikey: process.env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) return reply.code(401).send({ error: 'Token inválido' })

    const user = await res.json()
    return { user }
  })
}
