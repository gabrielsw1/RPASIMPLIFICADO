import { authenticate } from '../middleware/auth.js'
import supabase from '../services/supabase.js'

export default async function postsRoutes(fastify) {
  // GET /api/posts — lista posts publicados com filtros e paginação
  fastify.get('/posts', async (request, reply) => {
    const { category, search, page = 1, limit = 9 } = request.query
    const offset = (Number(page) - 1) * Number(limit)

    let query = supabase
      .from('posts')
      .select('id, title, slug, excerpt, cover_image, category, tags, author, created_at', { count: 'exact' })
      .eq('published', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1)

    if (category) query = query.eq('category', category)
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,excerpt.ilike.%${search}%,category.ilike.%${search}%`,
      )
    }

    const { data, error, count } = await query

    if (error) return reply.code(500).send({ error: error.message })
    return { posts: data, total: count, page: Number(page), limit: Number(limit) }
  })

  // GET /api/posts/categories — categorias disponíveis
  fastify.get('/posts/categories', async (request, reply) => {
    const { data, error } = await supabase
      .from('posts')
      .select('category')
      .eq('published', true)
      .not('category', 'is', null)

    if (error) return reply.code(500).send({ error: error.message })
    const unique = [...new Set(data.map((p) => p.category))].filter(Boolean).sort()
    return unique
  })

  // GET /api/posts/:slug — detalhe do post
  fastify.get('/posts/:slug', async (request, reply) => {
    const { slug } = request.params

    const { data, error } = await supabase
      .from('posts')
      .select('id, title, slug, content, excerpt, cover_image, category, tags, author, created_at, updated_at')
      .eq('slug', slug)
      .eq('published', true)
      .single()

    if (error || !data) return reply.code(404).send({ error: 'Post não encontrado' })
    return data
  })

  // GET /api/posts/:id/comments — comentários do post
  fastify.get('/posts/:id/comments', async (request, reply) => {
    const { id } = request.params

    const { data, error } = await supabase
      .from('post_comments')
      .select('id, author_name, author_avatar, author_profile_url, content, created_at')
      .eq('post_id', id)
      .order('created_at', { ascending: true })

    if (error) return reply.code(500).send({ error: error.message })
    return data
  })

  // POST /api/posts/:id/comments — novo comentário (auth)
  fastify.post('/posts/:id/comments', { preHandler: authenticate }, async (request, reply) => {
    const { id: postId } = request.params
    const { content } = request.body || {}

    if (!content?.trim()) return reply.code(400).send({ error: 'Comentário vazio' })

    const meta = request.user.user_metadata || {}
    const authorName = meta.full_name || meta.name || request.user.email
    // LinkedIn OIDC exposes the photo as 'picture' (OIDC standard); Supabase may also map it to 'avatar_url'
    const authorAvatar = meta.avatar_url || meta.picture || null
    const authorProfileUrl = request.body?.author_profile_url || null

    const { data, error } = await supabase
      .from('post_comments')
      .insert({
        post_id: postId,
        user_id: request.userId,
        author_name: authorName,
        author_avatar: authorAvatar,
        author_profile_url: authorProfileUrl,
        content: content.trim(),
      })
      .select('id, author_name, author_avatar, author_profile_url, content, created_at')
      .single()

    if (error) return reply.code(500).send({ error: error.message })
    return reply.code(201).send(data)
  })

  // POST /api/posts/:id/ratings — avaliação por fingerprint
  fastify.post('/posts/:id/ratings', async (request, reply) => {
    const { id: postId } = request.params
    const { fingerprint, rating } = request.body || {}

    if (!fingerprint || !rating || rating < 1 || rating > 5) {
      return reply.code(400).send({ error: 'Dados de avaliação inválidos' })
    }

    const { error } = await supabase
      .from('post_ratings')
      .upsert({ post_id: postId, fingerprint, rating }, { onConflict: 'post_id,fingerprint' })

    if (error) return reply.code(500).send({ error: error.message })

    const { data: stats } = await supabase
      .from('post_ratings')
      .select('rating')
      .eq('post_id', postId)

    const count = stats?.length || 0
    const avg = count > 0 ? stats.reduce((s, r) => s + r.rating, 0) / count : 0

    return { average: Math.round(avg * 10) / 10, count }
  })

  // GET /api/posts/:id/ratings — média de avaliações
  fastify.get('/posts/:id/ratings', async (request) => {
    const { id: postId } = request.params
    const { fingerprint } = request.query

    const { data: stats } = await supabase
      .from('post_ratings')
      .select('rating, fingerprint')
      .eq('post_id', postId)

    const count = stats?.length || 0
    const avg = count > 0 ? stats.reduce((s, r) => s + r.rating, 0) / count : 0
    const userRating = fingerprint ? (stats?.find((r) => r.fingerprint === fingerprint)?.rating || null) : null

    return { average: Math.round(avg * 10) / 10, count, user_rating: userRating }
  })
}
