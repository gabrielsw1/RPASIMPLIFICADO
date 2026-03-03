import { adminHook } from '../../middleware/adminHook.js'
import supabase from '../../services/supabase.js'

export default async function adminPostsRoutes(fastify) {
  // GET /api/admin/posts — lista todos os posts (publicados e rascunhos)
  fastify.get('/posts', { preHandler: adminHook }, async (request, reply) => {
    const { data, error } = await supabase
      .from('posts')
      .select('id, title, slug, category, published, author, created_at, updated_at')
      .order('created_at', { ascending: false })

    if (error) return reply.code(500).send({ error: error.message })
    return data
  })

  // GET /api/admin/posts/:id — detalhe completo para edição
  fastify.get('/posts/:id', { preHandler: adminHook }, async (request, reply) => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', request.params.id)
      .single()

    if (error || !data) return reply.code(404).send({ error: 'Post não encontrado' })
    return data
  })

  // POST /api/admin/posts — criar post
  fastify.post('/posts', { preHandler: adminHook }, async (request, reply) => {
    const { title, slug, excerpt, content, cover_image, category, tags, author, published } = request.body || {}

    if (!title || !slug) return reply.code(400).send({ error: 'Título e slug são obrigatórios' })

    const { data, error } = await supabase
      .from('posts')
      .insert({ title, slug, excerpt, content, cover_image, category, tags, author: author || 'RPA Simplificado', published: published ?? false })
      .select('id, slug')
      .single()

    if (error) return reply.code(500).send({ error: error.message })
    return reply.code(201).send(data)
  })

  // PUT /api/admin/posts/:id — atualizar post
  fastify.put('/posts/:id', { preHandler: adminHook }, async (request, reply) => {
    const { id } = request.params
    const updates = request.body || {}
    delete updates.id

    const { data, error } = await supabase
      .from('posts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('id, slug, published')
      .single()

    if (error) return reply.code(500).send({ error: error.message })
    return data
  })

  // DELETE /api/admin/posts/:id — excluir post
  fastify.delete('/posts/:id', { preHandler: adminHook }, async (request, reply) => {
    const { error } = await supabase.from('posts').delete().eq('id', request.params.id)
    if (error) return reply.code(500).send({ error: error.message })
    return reply.send({ success: true })
  })
}
