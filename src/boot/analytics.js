import { defineBoot } from '#q-app/wrappers'
import { inject } from '@vercel/analytics'

export default defineBoot(() => {
  inject()
})
