import { adminHook } from '../../middleware/adminHook.js'
import supabase from '../../services/supabase.js'

export default async function adminDashboardRoutes(fastify) {
  fastify.get('/dashboard', { preHandler: adminHook }, async (request, reply) => {
    const [
      enrollmentsResult,
      coursesResult,
      modulesResult,
      lessonsResult,
      postsResult,
      helpResult,
      commentsUnseenResult,
      settingsResult,
      recentEnrollmentsResult,
    ] = await Promise.all([
      supabase.from('enrollments').select('id, user_id, course_id, payment_method, enrolled_at'),
      supabase.from('courses').select('id, title, price, published'),
      supabase.from('modules').select('*', { count: 'exact', head: true }),
      supabase.from('lessons').select('*', { count: 'exact', head: true }),
      supabase.from('posts').select('id, published, created_at'),
      supabase.from('help_requests').select('id, status, created_at, responded_at'),
      supabase.from('lesson_comments').select('*', { count: 'exact', head: true }).eq('seen', false),
      supabase.from('site_settings').select('*').eq('id', 1).single(),
      supabase
        .from('enrollments')
        .select('id, user_id, course_id, payment_method, enrolled_at')
        .order('enrolled_at', { ascending: false })
        .limit(5),
    ])

    const enrollments = enrollmentsResult.data || []
    const courses = coursesResult.data || []
    const posts = postsResult.data || []
    const helpAll = helpResult.data || []
    const settings = settingsResult.data || {}
    const recentEnrollmentsRaw = recentEnrollmentsResult.data || []

    // --- Overview ---
    const courseMap = Object.fromEntries(courses.map((c) => [c.id, c]))

    const total_students = new Set(enrollments.map((e) => e.user_id)).size

    const total_revenue_estimated = enrollments
      .filter((e) => e.payment_method === 'stripe')
      .reduce((sum, e) => sum + (courseMap[e.course_id]?.price || 0), 0)

    const total_courses_published = courses.filter((c) => c.published).length
    const total_posts_published = posts.filter((p) => p.published).length
    const pending_help_requests = helpAll.filter((h) => h.status === 'pending').length
    const unseen_comments = commentsUnseenResult.count || 0

    // --- Enrollments by month (last 6) ---
    const now = new Date()
    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = d
        .toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
        .replace('.', '')
        .replace(' de ', '/')
      months.push({ month: key, label, count: 0 })
    }

    for (const e of enrollments) {
      const d = new Date(e.enrolled_at)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const m = months.find((m) => m.month === key)
      if (m) m.count++
    }

    // --- Enrollments by type ---
    const typeMap = {}
    for (const e of enrollments) {
      typeMap[e.payment_method] = (typeMap[e.payment_method] || 0) + 1
    }
    const typeLabels = { free: 'Gratuito', stripe: 'Pago (Stripe)' }
    const enrollments_by_type = Object.entries(typeMap).map(([type, count]) => ({
      type,
      label: typeLabels[type] || type,
      count,
    }))

    // --- Enrollments by course ---
    const courseEnrollMap = {}
    for (const e of enrollments) {
      if (!courseEnrollMap[e.course_id]) courseEnrollMap[e.course_id] = { count: 0, revenue: 0 }
      courseEnrollMap[e.course_id].count++
      if (e.payment_method === 'stripe') {
        courseEnrollMap[e.course_id].revenue += courseMap[e.course_id]?.price || 0
      }
    }
    const enrollments_by_course = Object.entries(courseEnrollMap)
      .map(([course_id, { count, revenue }]) => ({
        course_id,
        title: courseMap[course_id]?.title || 'Curso desconhecido',
        count,
        revenue,
      }))
      .sort((a, b) => b.count - a.count)

    // --- Help by status ---
    const helpStatusMap = {}
    for (const h of helpAll) {
      helpStatusMap[h.status] = (helpStatusMap[h.status] || 0) + 1
    }
    const helpLabels = { pending: 'Pendente', in_progress: 'Em Andamento', resolved: 'Resolvido' }
    const help_by_status = Object.entries(helpStatusMap).map(([status, count]) => ({
      status,
      label: helpLabels[status] || status,
      count,
    }))

    // --- Blog stats ---
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const blog_stats = {
      total: posts.length,
      published: posts.filter((p) => p.published).length,
      draft: posts.filter((p) => !p.published).length,
      this_month: posts.filter((p) => p.created_at >= thisMonthStart).length,
    }

    // --- Course stats ---
    const course_stats = {
      total: courses.length,
      published: courses.filter((c) => c.published).length,
      total_modules: modulesResult.count || 0,
      total_lessons: lessonsResult.count || 0,
    }

    // --- Average response hours ---
    const resolved = helpAll.filter(
      (h) => h.status === 'resolved' && h.responded_at && h.created_at,
    )
    const avg_response_hours =
      resolved.length > 0
        ? resolved.reduce((sum, h) => {
            const diff = new Date(h.responded_at) - new Date(h.created_at)
            return sum + diff / (1000 * 60 * 60)
          }, 0) / resolved.length
        : 0

    // --- Recent enrollments (with profile join) ---
    let recent_enrollments = []
    if (recentEnrollmentsRaw.length) {
      const userIds = [...new Set(recentEnrollmentsRaw.map((e) => e.user_id))]
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds)
      const profileMap = Object.fromEntries((profiles || []).map((p) => [p.id, p]))
      recent_enrollments = recentEnrollmentsRaw.map((e) => ({
        student_name: profileMap[e.user_id]?.full_name || 'Aluno',
        course_title: courseMap[e.course_id]?.title || 'Curso',
        payment_method: e.payment_method,
        enrolled_at: e.enrolled_at,
      }))
    }

    // --- Platform status ---
    const platform_status = {
      courses_enabled: settings.courses_enabled ?? true,
      blog_enabled: settings.blog_enabled ?? true,
      login_enabled: settings.login_enabled ?? true,
      maintenance_message: settings.maintenance_message || '',
    }

    return {
      overview: {
        total_students,
        total_revenue_estimated,
        total_courses_published,
        total_posts_published,
        pending_help_requests,
        unseen_comments,
      },
      enrollments_by_month: months,
      enrollments_by_type,
      enrollments_by_course,
      help_by_status,
      blog_stats,
      course_stats,
      recent_enrollments,
      platform_status,
      avg_response_hours: Math.round(avg_response_hours * 10) / 10,
    }
  })
}
