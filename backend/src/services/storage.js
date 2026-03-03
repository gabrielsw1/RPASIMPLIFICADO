import supabase from './supabase.js'

const BUCKETS = {
  videos: 'videos',
  thumbnails: 'thumbnails',
  covers: 'covers',
}

/**
 * Faz upload de um buffer para o Supabase Storage.
 * Retorna a URL pública do arquivo.
 */
async function uploadFile(bucket, filename, buffer, mimeType, isPrivate = false) {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(filename, buffer, { contentType: mimeType, upsert: true })

  if (error) throw new Error(`Erro no upload (${bucket}): ${error.message}`)

  // Bucket privado — gera signed URL válida por 1 ano (para salvar na aula)
  if (isPrivate) {
    const { data, error: signErr } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filename, 60 * 60 * 24 * 365)
    if (signErr) throw new Error(`Erro ao gerar URL assinada: ${signErr.message}`)
    return data.signedUrl
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filename)
  return data.publicUrl
}

/**
 * Upload de vídeo de aula.
 * @param {Buffer} buffer
 * @param {string} filename  — ex: "cursos/slug-do-curso/aula-1.mp4"
 * @param {string} mimeType  — ex: "video/mp4"
 */
export async function uploadVideo(buffer, filename, mimeType = 'video/mp4') {
  return uploadFile(BUCKETS.videos, filename, buffer, mimeType, true)
}

/**
 * Upload de thumbnail de curso.
 */
export async function uploadThumbnail(buffer, filename, mimeType = 'image/jpeg') {
  return uploadFile(BUCKETS.thumbnails, filename, buffer, mimeType)
}

/**
 * Upload de imagem de capa de post.
 */
export async function uploadCover(buffer, filename, mimeType = 'image/jpeg') {
  return uploadFile(BUCKETS.covers, filename, buffer, mimeType)
}

/**
 * Gera URL assinada (acesso temporário) para um arquivo privado.
 * @param {string} bucket
 * @param {string} path
 * @param {number} expiresIn  — segundos (default: 1 hora)
 */
export async function getSignedUrl(bucket, path, expiresIn = 3600) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)

  if (error) throw new Error(`Erro ao gerar URL assinada: ${error.message}`)
  return data.signedUrl
}

export { BUCKETS }
