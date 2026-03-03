import { adminHook } from '../../middleware/adminHook.js'
import supabase from '../../services/supabase.js'

export default async function adminBadgesRoutes(fastify) {
  // GET /api/admin/badges — contadores para o menu
  fastify.get('/badges', { preHandler: adminHook }, async (request, reply) => {
    const [helpRes, commentsRes, enrollmentsRes] = await Promise.all([
      supabase.from('help_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('lesson_comments').select('id', { count: 'exact', head: true }).eq('seen', false),
      supabase.from('enrollments').select('id', { count: 'exact', head: true }).eq('seen', false),
    ])

    return {
      pending_help: helpRes.count || 0,
      unseen_comments: commentsRes.count || 0,
      unseen_enrollments: enrollmentsRes.count || 0,
    }
  })
}
