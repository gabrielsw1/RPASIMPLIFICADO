import { authenticate } from '../middleware/auth.js'
import supabase from '../services/supabase.js'

export default async function helpRequestsRoutes(fastify) {
  // POST /api/lessons/:id/help — aluno envia dúvida
  fastify.post('/lessons/:id/help', { preHandler: authenticate }, async (request, reply) => {
    const { id: lessonId } = request.params
    const userId = request.userId
    const { description } = request.body || {}

    if (!description?.trim()) return reply.code(400).send({ error: 'Descrição da dúvida é obrigatória' })

    const authorName = request.user.user_metadata?.full_name || request.user.email

    const { data, error } = await supabase
      .from('help_requests')
      .insert({
        lesson_id: lessonId,
        user_id: userId,
        author_name: authorName,
        description: description.trim(),
        status: 'pending',
      })
      .select('id, description, status, created_at')
      .single()

    if (error) return reply.code(500).send({ error: error.message })
    return reply.code(201).send(data)
  })

  // GET /api/me/help-requests — dúvidas do aluno logado (filtro opcional: ?lesson_id=...)
  fastify.get('/me/help-requests', { preHandler: authenticate }, async (request, reply) => {
    const { lesson_id } = request.query

    let query = supabase
      .from('help_requests')
      .select(`
        id, lesson_id, description, status, response, responded_at, created_at,
        lessons (id, title, module_id,
          modules:module_id (id, title, course_id,
            courses:course_id (id, title, slug)
          )
        )
      `)
      .eq('user_id', request.userId)
      .order('created_at', { ascending: false })

    if (lesson_id) query = query.eq('lesson_id', lesson_id)

    const { data, error } = await query
    if (error) return reply.code(500).send({ error: error.message })
    return data
  })
}
