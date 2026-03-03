import { authenticate } from '../middleware/auth.js'
import supabase from '../services/supabase.js'

export default async function progressRoutes(fastify) {
  // GET /api/me/courses/:slug/progress — progresso completo no curso
  fastify.get('/me/courses/:slug/progress', { preHandler: authenticate }, async (request, reply) => {
    const { slug } = request.params
    const userId = request.userId

    // Busca o curso com módulos e aulas
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select(`
        id, title, slug,
        modules (
          id, title, position,
          lessons (id, title, description, video_url, position, duration_seconds, is_preview)
        )
      `)
      .eq('slug', slug)
      .eq('published', true)
      .single()

    if (courseError || !course) return reply.code(404).send({ error: 'Curso não encontrado' })

    // Verifica matrícula
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('id, status')
      .eq('user_id', userId)
      .eq('course_id', course.id)
      .single()

    if (!enrollment || enrollment.status !== 'active') {
      return reply.code(403).send({ error: 'Você não está matriculado neste curso' })
    }

    // Busca progresso do aluno
    const lessonIds = course.modules
      .flatMap((m) => m.lessons)
      .map((l) => l.id)

    const { data: progress } = await supabase
      .from('lesson_progress')
      .select('lesson_id, completed, completed_at')
      .eq('user_id', userId)
      .in('lesson_id', lessonIds)

    const completedSet = new Set((progress || []).filter((p) => p.completed).map((p) => p.lesson_id))

    // Ordena módulos e aulas por position
    course.modules.sort((a, b) => a.position - b.position)
    course.modules.forEach((m) => m.lessons.sort((a, b) => a.position - b.position))

    const totalLessons = lessonIds.length
    const completedCount = completedSet.size
    const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

    return {
      course: { id: course.id, title: course.title, slug: course.slug },
      progress_percent: progressPercent,
      completed_lessons: completedCount,
      total_lessons: totalLessons,
      modules: course.modules.map((m) => ({
        ...m,
        lessons: m.lessons.map((l) => ({
          ...l,
          completed: completedSet.has(l.id),
        })),
      })),
    }
  })

  // GET /api/me/lessons/:id/note — busca anotação do aluno para a aula
  fastify.get('/me/lessons/:id/note', { preHandler: authenticate }, async (request, reply) => {
    const { id: lessonId } = request.params
    const userId = request.userId

    const { data } = await supabase
      .from('lesson_notes')
      .select('content, updated_at')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .single()

    return { content: data?.content || '', updated_at: data?.updated_at || null }
  })

  // PUT /api/me/lessons/:id/note — salva/atualiza anotação
  fastify.put('/me/lessons/:id/note', { preHandler: authenticate }, async (request, reply) => {
    const { id: lessonId } = request.params
    const userId = request.userId
    const { content = '' } = request.body || {}

    const { error } = await supabase
      .from('lesson_notes')
      .upsert(
        { user_id: userId, lesson_id: lessonId, content, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,lesson_id' },
      )

    if (error) return reply.code(500).send({ error: error.message })
    return reply.send({ success: true })
  })

  // POST /api/me/lessons/:id/complete — marcar/desmarcar aula como concluída
  fastify.post('/me/lessons/:id/complete', { preHandler: authenticate }, async (request, reply) => {
    const { id: lessonId } = request.params
    const userId = request.userId
    const { completed = true } = request.body || {}

    const { error } = await supabase.from('lesson_progress').upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      },
      { onConflict: 'user_id,lesson_id' },
    )

    if (error) return reply.code(500).send({ error: error.message })
    return reply.send({ success: true, completed })
  })
}
