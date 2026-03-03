import { adminHook } from '../../middleware/adminHook.js'
import supabase from '../../services/supabase.js'

export default async function adminCoursesRoutes(fastify) {
  // ── CURSOS ──────────────────────────────────────────────────

  // GET /api/admin/courses
  fastify.get('/courses', { preHandler: adminHook }, async (request, reply) => {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        id, title, slug, price, is_free, level, category, published, created_at,
        modules (id, lessons (id))
      `)
      .order('created_at', { ascending: false })

    if (error) return reply.code(500).send({ error: error.message })

    return data.map((c) => ({
      ...c,
      module_count: c.modules?.length ?? 0,
      lesson_count: c.modules?.reduce((acc, m) => acc + (m.lessons?.length ?? 0), 0) ?? 0,
      modules: undefined,
    }))
  })

  // GET /api/admin/courses/:id — detalhe com módulos e aulas para o editor
  fastify.get('/courses/:id', { preHandler: adminHook }, async (request, reply) => {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        modules (
          id, title, description, position,
          lessons (id, title, description, video_url, duration_seconds, position, is_preview)
        )
      `)
      .eq('id', request.params.id)
      .single()

    if (error || !data) return reply.code(404).send({ error: 'Curso não encontrado' })

    data.modules?.sort((a, b) => a.position - b.position)
    data.modules?.forEach((m) => m.lessons?.sort((a, b) => a.position - b.position))

    return data
  })

  // POST /api/admin/courses — criar curso
  fastify.post('/courses', { preHandler: adminHook }, async (request, reply) => {
    const { title, slug, description, full_description, thumbnail, price, is_free, level, category, tags, published } = request.body || {}

    if (!title || !slug) return reply.code(400).send({ error: 'Título e slug são obrigatórios' })

    const { data, error } = await supabase
      .from('courses')
      .insert({ title, slug, description, full_description, thumbnail, price: price ?? 0, is_free: is_free ?? false, level, category, tags, published: published ?? false })
      .select('id, slug')
      .single()

    if (error) return reply.code(500).send({ error: error.message })
    return reply.code(201).send(data)
  })

  // PUT /api/admin/courses/:id
  fastify.put('/courses/:id', { preHandler: adminHook }, async (request, reply) => {
    const updates = { ...request.body }
    delete updates.id

    const { data, error } = await supabase
      .from('courses')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', request.params.id)
      .select('id, slug, published')
      .single()

    if (error) return reply.code(500).send({ error: error.message })
    return data
  })

  // DELETE /api/admin/courses/:id
  fastify.delete('/courses/:id', { preHandler: adminHook }, async (request, reply) => {
    const { error } = await supabase.from('courses').delete().eq('id', request.params.id)
    if (error) return reply.code(500).send({ error: error.message })
    return reply.send({ success: true })
  })

  // ── MÓDULOS ──────────────────────────────────────────────────

  // POST /api/admin/courses/:id/modules
  fastify.post('/courses/:id/modules', { preHandler: adminHook }, async (request, reply) => {
    const { title, description, position } = request.body || {}
    if (!title) return reply.code(400).send({ error: 'Título do módulo é obrigatório' })

    const { data, error } = await supabase
      .from('modules')
      .insert({ course_id: request.params.id, title, description, position: position ?? 0 })
      .select('id, title, description, position')
      .single()

    if (error) return reply.code(500).send({ error: error.message })
    return reply.code(201).send(data)
  })

  // PUT /api/admin/modules/:id
  fastify.put('/modules/:id', { preHandler: adminHook }, async (request, reply) => {
    const updates = { ...request.body }
    delete updates.id
    delete updates.course_id

    const { data, error } = await supabase
      .from('modules')
      .update(updates)
      .eq('id', request.params.id)
      .select('id, title, description, position')
      .single()

    if (error) return reply.code(500).send({ error: error.message })
    return data
  })

  // DELETE /api/admin/modules/:id
  fastify.delete('/modules/:id', { preHandler: adminHook }, async (request, reply) => {
    const { error } = await supabase.from('modules').delete().eq('id', request.params.id)
    if (error) return reply.code(500).send({ error: error.message })
    return reply.send({ success: true })
  })

  // ── AULAS ──────────────────────────────────────────────────

  // POST /api/admin/modules/:id/lessons
  fastify.post('/modules/:id/lessons', { preHandler: adminHook }, async (request, reply) => {
    const { title, description, video_url, duration_seconds, position, is_preview } = request.body || {}
    if (!title) return reply.code(400).send({ error: 'Título da aula é obrigatório' })

    const { data, error } = await supabase
      .from('lessons')
      .insert({
        module_id: request.params.id,
        title,
        description,
        video_url,
        duration_seconds: duration_seconds ?? 0,
        position: position ?? 0,
        is_preview: is_preview ?? false,
      })
      .select('id, title, description, video_url, duration_seconds, position, is_preview')
      .single()

    if (error) return reply.code(500).send({ error: error.message })
    return reply.code(201).send(data)
  })

  // PUT /api/admin/lessons/:id
  fastify.put('/lessons/:id', { preHandler: adminHook }, async (request, reply) => {
    const updates = { ...request.body }
    delete updates.id
    delete updates.module_id

    const { data, error } = await supabase
      .from('lessons')
      .update(updates)
      .eq('id', request.params.id)
      .select('id, title, description, video_url, duration_seconds, position, is_preview')
      .single()

    if (error) return reply.code(500).send({ error: error.message })
    return data
  })

  // DELETE /api/admin/lessons/:id
  fastify.delete('/lessons/:id', { preHandler: adminHook }, async (request, reply) => {
    const { error } = await supabase.from('lessons').delete().eq('id', request.params.id)
    if (error) return reply.code(500).send({ error: error.message })
    return reply.send({ success: true })
  })
}
