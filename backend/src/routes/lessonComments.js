import { authenticate } from '../middleware/auth.js'
import supabase from '../services/supabase.js'

export default async function lessonCommentsRoutes(fastify) {
  // GET /api/lessons/:id/comments — lista comentários da aula
  fastify.get('/lessons/:id/comments', { preHandler: authenticate }, async (request, reply) => {
    const { id: lessonId } = request.params

    const { data, error } = await supabase
      .from('lesson_comments')
      .select('id, author_name, author_avatar, content, admin_reply, admin_replied_at, created_at')
      .eq('lesson_id', lessonId)
      .order('created_at', { ascending: true })

    if (error) return reply.code(500).send({ error: error.message })
    return data
  })

  // POST /api/lessons/:id/comments — novo comentário
  fastify.post('/lessons/:id/comments', { preHandler: authenticate }, async (request, reply) => {
    const { id: lessonId } = request.params
    const userId = request.userId
    const { content } = request.body || {}

    if (!content?.trim()) return reply.code(400).send({ error: 'Conteúdo do comentário é obrigatório' })

    const authorName = request.user.user_metadata?.full_name || request.user.email
    const authorAvatar = request.user.user_metadata?.avatar_url || null

    const { data, error } = await supabase
      .from('lesson_comments')
      .insert({
        lesson_id: lessonId,
        user_id: userId,
        author_name: authorName,
        author_avatar: authorAvatar,
        content: content.trim(),
      })
      .select('id, author_name, author_avatar, content, created_at')
      .single()

    if (error) return reply.code(500).send({ error: error.message })
    return reply.code(201).send(data)
  })

  // DELETE /api/lessons/comments/:id — aluno exclui próprio comentário
  fastify.delete('/lessons/comments/:id', { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params
    const userId = request.userId

    const { error } = await supabase
      .from('lesson_comments')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) return reply.code(500).send({ error: error.message })
    return reply.send({ success: true })
  })
}
