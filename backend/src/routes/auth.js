import log from '../utils/logger.js'

export default async function authRoutes(fastify) {
  // POST /api/auth/login
  fastify.post('/auth/login', async (request, reply) => {
    const { email, password } = request.body || {}

    if (!email || !password) {
      log.warn('Auth', 'Login sem email ou senha')
      return reply.code(400).send({ error: 'Email e senha são obrigatórios' })
    }

    log.info('Auth', `Tentativa de login: ${email}`)

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
      log.error('Auth', `Login falhou para ${email}`, {
        status: res.status,
        error: data.error,
        error_description: data.error_description,
        msg: data.msg,
        raw: data,
      })
      return reply.code(401).send({ error: data.error_description || data.msg || 'Credenciais inválidas' })
    }

    log.success('Auth', `Login OK: ${email}`)
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      user: data.user,
    }
  })

  // POST /api/auth/logout
  fastify.post('/auth/logout', async (request, reply) => {
    const token = request.headers.authorization?.replace('Bearer ', '')
    if (!token) return { success: true }

    log.info('Auth', 'Logout')

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

  // GET /api/auth/me
  fastify.get('/auth/me', async (request, reply) => {
    const token = request.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      log.warn('Auth', '/me sem token')
      return reply.code(401).send({ error: 'Token não fornecido' })
    }

    const res = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
      headers: {
        apikey: process.env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) {
      log.warn('Auth', '/me token inválido', { status: res.status })
      return reply.code(401).send({ error: 'Token inválido' })
    }

    const user = await res.json()
    log.info('Auth', `/me OK: ${user.email}`)
    return { user }
  })
}
