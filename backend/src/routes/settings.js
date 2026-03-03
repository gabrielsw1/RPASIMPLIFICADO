import supabase from '../services/supabase.js'

export default async function settingsRoutes(fastify) {
  // GET /api/settings — público, retorna configurações visíveis do site
  fastify.get('/settings', async (request, reply) => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('courses_enabled, blog_enabled, login_enabled, maintenance_message')
      .eq('id', 1)
      .single()

    if (error || !data) {
      // fallback: tudo habilitado se tabela não existir ainda
      return { courses_enabled: true, blog_enabled: true, login_enabled: true, maintenance_message: '' }
    }
    return data
  })
}
