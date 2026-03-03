/**
 * Returns the current Supabase session access token, or null if not logged in.
 */
export async function getAuthToken() {
  const { supabase } = await import('boot/supabase')
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}
