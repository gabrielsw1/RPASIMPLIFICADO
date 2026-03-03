import { adminHook } from '../../middleware/adminHook.js'
import supabase from '../../services/supabase.js'

export default async function adminHelpRequestsRoutes(fastify) {
  // GET /api/admin/help-requests — todas as dúvidas com filtro por status
  fastify.get('/help-requests', { preHandler: adminHook }, async (request, reply) => {
    const { status } = request.query

    let query = supabase
      .from('help_requests')
      .select(`
        id, author_name, description, status, response, responded_at, created_at,
        lessons (id, title,
          modules:module_id (id, title,
            courses:course_id (id, title, slug)
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (status) query = query.eq('status', status)

    const { data, error } = await query
    if (error) return reply.code(500).send({ error: error.message })
    return data
  })

  // PUT /api/admin/help-requests/:id — atualiza status e/ou resposta
  fastify.put('/help-requests/:id', { preHandler: adminHook }, async (request, reply) => {
    const { status, response } = request.body || {}
    const allowed = ['pending', 'in_progress', 'resolved']

    if (status && !allowed.includes(status)) {
      return reply.code(400).send({ error: 'Status inválido' })
    }

    const updates = {}
    if (status) updates.status = status
    if (response !== undefined) {
      updates.response = response
      updates.responded_at = new Date().toISOString()
      updates.status = 'resolved'
    }

    const { data, error } = await supabase
      .from('help_requests')
      .update(updates)
      .eq('id', request.params.id)
      .select('id, status, response, responded_at')
      .single()

    if (error) return reply.code(500).send({ error: error.message })
    return data
  })
}
