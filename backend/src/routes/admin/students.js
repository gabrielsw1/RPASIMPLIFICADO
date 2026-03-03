import { adminHook } from '../../middleware/adminHook.js'
import supabase from '../../services/supabase.js'

export default async function adminStudentsRoutes(fastify) {
  // GET /api/admin/courses/:id/students — alunos matriculados em um curso
  fastify.get('/courses/:id/students', { preHandler: adminHook }, async (request, reply) => {
    const { data: enrollments, error } = await supabase
      .from('enrollments')
      .select('id, status, payment_method, enrolled_at, user_id')
      .eq('course_id', request.params.id)
      .order('enrolled_at', { ascending: false })

    if (error) return reply.code(500).send({ error: error.message })
    if (!enrollments?.length) return []

    const userIds = [...new Set(enrollments.map((e) => e.user_id))]
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', userIds)

    const profileMap = Object.fromEntries((profiles || []).map((p) => [p.id, p]))

    return enrollments.map((e) => ({
      ...e,
      profiles: profileMap[e.user_id] || null,
    }))
  })

  // POST /api/admin/enrollments/mark-seen — marca todas as matrículas como vistas
  fastify.post('/enrollments/mark-seen', { preHandler: adminHook }, async (request, reply) => {
    const { error } = await supabase
      .from('enrollments')
      .update({ seen: true })
      .eq('seen', false)

    if (error) return reply.code(500).send({ error: error.message })
    return { success: true }
  })

  // GET /api/admin/students — todos os alunos matriculados (com resumo)
  fastify.get('/students', { preHandler: adminHook }, async (request, reply) => {
    const { data: enrollments, error } = await supabase
      .from('enrollments')
      .select('id, status, payment_method, enrolled_at, user_id, courses:course_id (id, title, slug)')
      .order('enrolled_at', { ascending: false })

    if (error) return reply.code(500).send({ error: error.message })
    if (!enrollments?.length) return []

    const userIds = [...new Set(enrollments.map((e) => e.user_id))]
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', userIds)

    const profileMap = Object.fromEntries((profiles || []).map((p) => [p.id, p]))

    return enrollments.map((e) => ({
      ...e,
      profiles: profileMap[e.user_id] || null,
    }))
  })
}
