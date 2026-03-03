import { authenticate } from './auth.js'
import { requireAdmin } from './adminOnly.js'

export const adminHook = [authenticate, requireAdmin]
