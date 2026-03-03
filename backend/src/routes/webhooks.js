import stripe from '../services/stripe.js'
import supabase from '../services/supabase.js'

export default async function webhooksRoutes(fastify) {
  // Parser de body raw para verificação de assinatura do Stripe
  fastify.removeAllContentTypeParsers()
  fastify.addContentTypeParser('application/json', { parseAs: 'buffer' }, (req, body, done) => {
    done(null, body)
  })

  fastify.post('/webhooks/stripe', async (request, reply) => {
    const sig = request.headers['stripe-signature']
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    let event
    try {
      event = stripe.webhooks.constructEvent(request.body, sig, webhookSecret)
    } catch (err) {
      fastify.log.error('Stripe webhook signature inválida:', err.message)
      return reply.code(400).send({ error: `Webhook Error: ${err.message}` })
    }

    // Evento: pagamento confirmado
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object

      const userId = session.metadata?.user_id
      const courseId = session.metadata?.course_id

      if (!userId || !courseId) {
        fastify.log.warn('Webhook sem user_id ou course_id nos metadados:', session.id)
        return reply.send({ received: true })
      }

      // Cria a matrícula
      const { error } = await supabase.from('enrollments').upsert(
        {
          user_id: userId,
          course_id: courseId,
          status: 'active',
          payment_method: 'stripe',
          stripe_session_id: session.id,
        },
        { onConflict: 'user_id,course_id' },
      )

      if (error) {
        fastify.log.error('Erro ao criar matrícula via webhook:', error.message)
        return reply.code(500).send({ error: 'Erro interno ao registrar matrícula' })
      }

      fastify.log.info(`Matrícula criada: user=${userId} course=${courseId}`)
    }

    return reply.send({ received: true })
  })
}
