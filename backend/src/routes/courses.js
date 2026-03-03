import supabase from '../services/supabase.js'

export default async function coursesRoutes(fastify) {
  // GET /api/courses — lista cursos publicados
  fastify.get('/courses', async (request, reply) => {
    const { category, level, search } = request.query

    let query = supabase
      .from('courses')
      .select(`
        id, title, slug, description, thumbnail, price, is_free, level, category, tags, created_at,
        modules (id, lessons (id))
      `)
      .eq('published', true)
      .order('created_at', { ascending: false })

    if (category) query = query.eq('category', category)
    if (level) query = query.eq('level', level)
    if (search) query = query.ilike('title', `%${search}%`)

    const { data, error } = await query
    if (error) return reply.code(500).send({ error: error.message })

    return data.map((c) => ({
      ...c,
      module_count: c.modules?.length ?? 0,
      lesson_count: c.modules?.reduce((acc, m) => acc + (m.lessons?.length ?? 0), 0) ?? 0,
      modules: undefined,
    }))
  })

  // GET /api/courses/:slug — detalhe com módulos e aulas
  // Aulas bloqueadas (video_url omitido) se curso pago e sem matrícula
  fastify.get('/courses/:slug', async (request, reply) => {
    const { slug } = request.params

    const { data, error } = await supabase
      .from('courses')
      .select(`
        id, title, slug, description, full_description, thumbnail, price, is_free, level, category, tags, created_at,
        modules (
          id, title, description, position,
          lessons (id, title, description, video_url, duration_seconds, position, is_preview)
        )
      `)
      .eq('slug', slug)
      .eq('published', true)
      .single()

    if (error || !data) return reply.code(404).send({ error: 'Curso não encontrado' })

    // Ordena por position
    data.modules?.sort((a, b) => a.position - b.position)
    data.modules?.forEach((m) => m.lessons?.sort((a, b) => a.position - b.position))

    // Verifica se usuário está matriculado (opcional — header Authorization)
    let enrolled = false
    const authHeader = request.headers.authorization
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7)
      const { data: userData } = await supabase.auth.getUser(token)
      if (userData?.user) {
        const { data: enrollment } = await supabase
          .from('enrollments')
          .select('id')
          .eq('user_id', userData.user.id)
          .eq('course_id', data.id)
          .single()
        enrolled = !!enrollment
      }
    }

    // Oculta video_url de aulas não-preview se pago e não matriculado
    const isPaid = !data.is_free && data.price > 0
    if (isPaid && !enrolled) {
      data.modules?.forEach((m) => {
        m.lessons?.forEach((l) => {
          if (!l.is_preview) l.video_url = null
        })
      })
    }

    return { ...data, enrolled }
  })
}
