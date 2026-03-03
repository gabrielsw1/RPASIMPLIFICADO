import { adminHook } from '../middleware/adminHook.js'
import { uploadVideo, uploadThumbnail, uploadCover } from '../services/storage.js'
import { randomUUID } from 'crypto'
import path from 'path'

export default async function uploadRoutes(fastify) {
  // POST /api/admin/upload/video — upload de vídeo de aula
  fastify.post('/admin/upload/video', { preHandler: adminHook }, async (request, reply) => {
    const data = await request.file()
    if (!data) return reply.code(400).send({ error: 'Nenhum arquivo enviado' })

    const ext = path.extname(data.filename) || '.mp4'
    const filename = `${randomUUID()}${ext}`
    const buffer = await data.toBuffer()

    try {
      const url = await uploadVideo(buffer, filename, data.mimetype)
      return reply.code(201).send({ url, filename })
    } catch (err) {
      fastify.log.error(err)
      return reply.code(500).send({ error: err.message })
    }
  })

  // POST /api/admin/upload/thumbnail — upload de thumbnail de curso
  fastify.post('/admin/upload/thumbnail', { preHandler: adminHook }, async (request, reply) => {
    const data = await request.file()
    if (!data) return reply.code(400).send({ error: 'Nenhum arquivo enviado' })

    const ext = path.extname(data.filename) || '.jpg'
    const filename = `${randomUUID()}${ext}`
    const buffer = await data.toBuffer()

    try {
      const url = await uploadThumbnail(buffer, filename, data.mimetype)
      return reply.code(201).send({ url, filename })
    } catch (err) {
      fastify.log.error(err)
      return reply.code(500).send({ error: err.message })
    }
  })

  // POST /api/admin/upload/cover — upload de capa de post de blog
  fastify.post('/admin/upload/cover', { preHandler: adminHook }, async (request, reply) => {
    const data = await request.file()
    if (!data) return reply.code(400).send({ error: 'Nenhum arquivo enviado' })

    const ext = path.extname(data.filename) || '.jpg'
    const filename = `${randomUUID()}${ext}`
    const buffer = await data.toBuffer()

    try {
      const url = await uploadCover(buffer, filename, data.mimetype)
      return reply.code(201).send({ url, filename })
    } catch (err) {
      fastify.log.error(err)
      return reply.code(500).send({ error: err.message })
    }
  })
}
