const TOKEN_KEY = 'auth_token'

/**
 * Retorna o token de autenticação.
 * Admin: armazenado no localStorage via login pelo backend.
 * Aluno/OAuth: obtido via sessão Supabase.
 */
export async function getAuthToken() {
  // Token do login admin (backend)
  const localToken = localStorage.getItem(TOKEN_KEY)
  if (localToken) return localToken

  // Fallback: sessão Supabase (OAuth/aluno)
  const { supabase } = await import('boot/supabase')
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}
