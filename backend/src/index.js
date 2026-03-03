import Fastify from 'fastify'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'

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

const fastify = Fastify({ logger: true })

// CORS
const allowedOrigins = [
  'http://localhost:9000',
  'http://localhost:9001',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
  ...(process.env.FRONTEND_URL ? [`https://www.${process.env.FRONTEND_URL.replace('https://', '')}`] : []),
]

await fastify.register(cors, {
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
    cb(new Error('Not allowed by CORS'))
  },
  credentials: true,
})

// Multipart (upload de arquivos — limite 500MB para vídeos)
await fastify.register(multipart, {
  limits: { fileSize: 500 * 1024 * 1024 },
})

// Rotas públicas
fastify.register(coursesRoutes, { prefix: '/api' })
fastify.register(postsRoutes, { prefix: '/api' })
fastify.register(enrollmentsRoutes, { prefix: '/api' })
fastify.register(progressRoutes, { prefix: '/api' })
fastify.register(lessonCommentsRoutes, { prefix: '/api' })
fastify.register(helpRequestsRoutes, { prefix: '/api' })
fastify.register(settingsRoutes, { prefix: '/api' })
fastify.register(uploadRoutes, { prefix: '/api' })

// Webhook Stripe (body raw — registrado antes do JSON parser global)
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
fastify.get('/health', () => ({ status: 'ok', timestamp: new Date().toISOString() }))

// Start
try {
  await fastify.listen({ port: Number(process.env.PORT) || 3001, host: '0.0.0.0' })
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}
