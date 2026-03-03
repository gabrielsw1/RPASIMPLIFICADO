import { adminHook } from '../../middleware/adminHook.js'
import supabase from '../../services/supabase.js'

export default async function adminCommentsRoutes(fastify) {
  // GET /api/admin/comments — todos os comentários de aulas
  fastify.get('/comments', { preHandler: adminHook }, async (request, reply) => {
    const { data, error } = await supabase
      .from('lesson_comments')
      .select(`
        id, author_name, author_avatar, content, admin_reply, admin_replied_at, seen, created_at,
        lessons:lesson_id (id, title,
          modules:module_id (id, title,
            courses:course_id (id, title, slug)
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (error) return reply.code(500).send({ error: error.message })
    return data
  })

  // PUT /api/admin/comments/:id — admin responde um comentário
  fastify.put('/comments/:id', { preHandler: adminHook }, async (request, reply) => {
    const { admin_reply } = request.body || {}
    if (!admin_reply?.trim()) return reply.code(400).send({ error: 'Resposta não pode ser vazia' })

    const { data, error } = await supabase
      .from('lesson_comments')
      .update({
        admin_reply: admin_reply.trim(),
        admin_replied_at: new Date().toISOString(),
        seen: true,
      })
      .eq('id', request.params.id)
      .select('id, admin_reply, admin_replied_at')
      .single()

    if (error) return reply.code(500).send({ error: error.message })
    return data
  })

  // POST /api/admin/comments/mark-seen — marca todos como vistos
  fastify.post('/comments/mark-seen', { preHandler: adminHook }, async (request, reply) => {
    const { error } = await supabase
      .from('lesson_comments')
      .update({ seen: true })
      .eq('seen', false)

    if (error) return reply.code(500).send({ error: error.message })
    return { success: true }
  })

  // DELETE /api/admin/comments/:id — excluir comentário
  fastify.delete('/comments/:id', { preHandler: adminHook }, async (request, reply) => {
    const { error } = await supabase
      .from('lesson_comments')
      .delete()
      .eq('id', request.params.id)

    if (error) return reply.code(500).send({ error: error.message })
    return reply.send({ success: true })
  })
}
