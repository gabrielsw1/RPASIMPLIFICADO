import { authenticate } from '../middleware/auth.js'
import supabase from '../services/supabase.js'
import stripe from '../services/stripe.js'

export default async function enrollmentsRoutes(fastify) {
  // POST /api/courses/:id/enroll — matrícula gratuita
  fastify.post('/courses/:id/enroll', { preHandler: authenticate }, async (request, reply) => {
    const { id: courseId } = request.params
    const userId = request.userId

    // Verifica se o curso existe e é gratuito
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, title, is_free, price, published')
      .eq('id', courseId)
      .single()

    if (courseError || !course) return reply.code(404).send({ error: 'Curso não encontrado' })
    if (!course.published) return reply.code(400).send({ error: 'Curso indisponível' })
    if (!course.is_free && course.price > 0) {
      return reply.code(400).send({ error: 'Este curso é pago. Use o endpoint de checkout.' })
    }

    const { error } = await supabase.from('enrollments').upsert(
      { user_id: userId, course_id: courseId, status: 'active', payment_method: 'free' },
      { onConflict: 'user_id,course_id' },
    )

    if (error) return reply.code(500).send({ error: error.message })
    return reply.code(201).send({ message: 'Matrícula realizada com sucesso' })
  })

  // POST /api/courses/:id/checkout — cria Stripe Checkout Session
  fastify.post('/courses/:id/checkout', { preHandler: authenticate }, async (request, reply) => {
    const { id: courseId } = request.params
    const userId = request.userId

    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, title, slug, price, published')
      .eq('id', courseId)
      .single()

    if (courseError || !course) return reply.code(404).send({ error: 'Curso não encontrado' })
    if (!course.published) return reply.code(400).send({ error: 'Curso indisponível' })
    if (!course.price || course.price <= 0) {
      return reply.code(400).send({ error: 'Curso gratuito. Use o endpoint de matrícula.' })
    }

    // Verifica se já está matriculado
    const { data: existing } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single()

    if (existing) return reply.code(400).send({ error: 'Você já está matriculado neste curso' })

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:9000'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: { name: course.title },
            unit_amount: Math.round(course.price * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${frontendUrl}/#/minha-area?success=1&course=${course.slug}`,
      cancel_url: `${frontendUrl}/#/cursos/${course.slug}`,
      metadata: { user_id: userId, course_id: courseId },
    })

    return reply.send({ url: session.url })
  })

  // GET /api/me/enrollments — lista cursos matriculados do aluno
  fastify.get('/me/enrollments', { preHandler: authenticate }, async (request, reply) => {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        id, status, payment_method, enrolled_at,
        courses (id, title, slug, thumbnail, level, category)
      `)
      .eq('user_id', request.userId)
      .eq('status', 'active')
      .order('enrolled_at', { ascending: false })

    if (error) return reply.code(500).send({ error: error.message })
    return data
  })
}
