import { adminHook } from '../../middleware/adminHook.js'
import supabase from '../../services/supabase.js'

export default async function adminSettingsRoutes(fastify) {
  // GET /api/admin/settings — retorna todas as configurações
  fastify.get('/settings', { preHandler: adminHook }, async (request, reply) => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .single()

    if (error) return reply.code(500).send({ error: error.message })
    return data
  })

  // PUT /api/admin/settings — atualiza configurações
  fastify.put('/settings', { preHandler: adminHook }, async (request, reply) => {
    const { courses_enabled, blog_enabled, login_enabled, maintenance_message } = request.body || {}

    const updates = { updated_at: new Date().toISOString() }
    if (courses_enabled !== undefined) updates.courses_enabled = courses_enabled
    if (blog_enabled !== undefined) updates.blog_enabled = blog_enabled
    if (login_enabled !== undefined) updates.login_enabled = login_enabled
    if (maintenance_message !== undefined) updates.maintenance_message = maintenance_message

    const { data, error } = await supabase
      .from('site_settings')
      .update(updates)
      .eq('id', 1)
      .select('*')
      .single()

    if (error) return reply.code(500).send({ error: error.message })
    return data
  })
}
