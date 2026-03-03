import { defineBoot } from '#q-app/wrappers'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('[boot/supabase] URL:', supabaseUrl)
console.log('[boot/supabase] DEBUG_TEST:', import.meta.env.VITE_DEBUG_TEST)

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default defineBoot(({ app }) => {
  app.config.globalProperties.$supabase = supabase
})
