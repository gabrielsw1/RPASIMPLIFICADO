import Fastify from 'fastify'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import log from './utils/logger.js'

// Auth
import authRoutes from './routes/auth.js'

// Rotas públicas
import coursesRoutes from './routes/courses.js'
import postsRoutes from './routes/posts.js'
import enrollmentsRoutes from './routes/enrollments.js'
import progressRoutes from './routes/progress.js'
import lessonCommentsRoutes from './routes/lessonComments.js'
import helpRequestsRoutes from './routes/helpRequests.js'
import uploadRoutes from './routes/upload.js'
import webhooksRoutes from './routes/webhooks.js'
import settingsRoutes from './routes/settings.js'

// Rotas admin
import adminDashboardRoutes from './routes/admin/dashboard.js'
import adminPostsRoutes from './routes/admin/posts.js'
import adminCoursesRoutes from './routes/admin/courses.js'
import adminStudentsRoutes from './routes/admin/students.js'
import adminHelpRequestsRoutes from './routes/admin/helpRequests.js'
import adminCommentsRoutes from './routes/admin/comments.js'
import adminBadgesRoutes from './routes/admin/badges.js'
import adminSettingsRoutes from './routes/admin/settings.js'

const fastify = Fastify({
  logger: false,
  bodyLimit: 50 * 1024 * 1024,
})

// Log de todas as requisições
fastify.addHook('onRequest', (request, reply, done) => {
  request._startTime = Date.now()
  done()
})

fastify.addHook('onResponse', (request, reply, done) => {
  const duration = Date.now() - (request._startTime || Date.now())
  log.request(request.method, request.url, reply.statusCode)
  if (reply.statusCode >= 400) {
    log.warn('HTTP', `${request.method} ${request.url} — ${duration}ms`)
  }
  done()
})

// Log de erros não tratados
fastify.setErrorHandler((error, request, reply) => {
  log.error('Server', `${request.method} ${request.url}`, error.message)
  reply.code(error.statusCode || 500).send({ error: error.message })
})

// CORS
const allowedOrigins = [
  'http://localhost:9000',
  'http://localhost:9001',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
  ...(process.env.FRONTEND_URL ? [`https://www.${process.env.FRONTEND_URL.replace('https://', '')}`] : []),
]

log.info('CORS', 'Origens permitidas:', allowedOrigins)

await fastify.register(cors, {
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
    log.warn('CORS', `Origem bloqueada: ${origin}`)
    cb(new Error('Not allowed by CORS'))
  },
  credentials: true,
})

// Multipart
await fastify.register(multipart, {
  limits: { fileSize: 500 * 1024 * 1024 },
})

// Auth
fastify.register(authRoutes, { prefix: '/api' })

// Rotas públicas
fastify.register(coursesRoutes, { prefix: '/api' })
fastify.register(postsRoutes, { prefix: '/api' })
fastify.register(enrollmentsRoutes, { prefix: '/api' })
fastify.register(progressRoutes, { prefix: '/api' })
fastify.register(lessonCommentsRoutes, { prefix: '/api' })
fastify.register(helpRequestsRoutes, { prefix: '/api' })
fastify.register(settingsRoutes, { prefix: '/api' })
fastify.register(uploadRoutes, { prefix: '/api' })

// Webhook Stripe
fastify.register(webhooksRoutes, { prefix: '/api' })

// Rotas admin
fastify.register(adminDashboardRoutes, { prefix: '/api/admin' })
fastify.register(adminPostsRoutes, { prefix: '/api/admin' })
fastify.register(adminCoursesRoutes, { prefix: '/api/admin' })
fastify.register(adminStudentsRoutes, { prefix: '/api/admin' })
fastify.register(adminHelpRequestsRoutes, { prefix: '/api/admin' })
fastify.register(adminCommentsRoutes, { prefix: '/api/admin' })
fastify.register(adminBadgesRoutes, { prefix: '/api/admin' })
fastify.register(adminSettingsRoutes, { prefix: '/api/admin' })

// Health check
fastify.get('/health', () => {
  log.info('Health', 'ping')
  return { status: 'ok', timestamp: new Date().toISOString() }
})

// Start
try {
  const port = Number(process.env.PORT) || 3001
  await fastify.listen({ port, host: '0.0.0.0' })
  log.success('Server', `Rodando em http://0.0.0.0:${port}`)
  log.info('Env', `SUPABASE_URL: ${process.env.SUPABASE_URL ? '✓ definida' : '✗ FALTANDO'}`)
  log.info('Env', `SUPABASE_ANON_KEY: ${process.env.SUPABASE_ANON_KEY ? '✓ definida' : '✗ FALTANDO'}`)
  log.info('Env', `SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓ definida' : '✗ FALTANDO'}`)
  log.info('Env', `STRIPE_SECRET_KEY: ${process.env.STRIPE_SECRET_KEY ? '✓ definida' : '✗ FALTANDO'}`)
  log.info('Env', `FRONTEND_URL: ${process.env.FRONTEND_URL || '✗ FALTANDO'}`)
} catch (err) {
  log.error('Server', 'Falha ao iniciar', err.message)
  process.exit(1)
}
