// Bootstrap entry point — loads .env BEFORE any module is evaluated
// Dynamic import guarantees dotenv runs first (static imports are hoisted; this avoids that)
import { config } from 'dotenv'
config()
await import('./src/index.js')
