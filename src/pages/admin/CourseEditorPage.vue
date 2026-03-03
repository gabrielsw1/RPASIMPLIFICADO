<template>
  <q-page class="q-pa-lg">
    <!-- Header -->
    <div class="row items-center q-mb-xl">
      <q-btn flat round dense icon="arrow_back" to="/admin/cursos" class="q-mr-md" />
      <h1 class="text-h5 text-weight-bold text-primary q-mb-none">
        {{ isEditing ? 'Editar Curso' : 'Novo Curso' }}
      </h1>
      <q-space />
      <q-btn unelevated color="primary" icon="save" label="Salvar" :loading="saving" @click="save" />
    </div>

    <div class="row q-col-gutter-xl">
      <!-- Formulário principal -->
      <div class="col-12 col-md-8">
        <q-card flat bordered class="q-mb-lg">
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold q-mb-md">Informações do Curso</div>

            <q-input v-model="form.title" label="Título *" outlined class="q-mb-md" @update:model-value="generateSlug" />
            <q-input v-model="form.slug" label="Slug (URL)" outlined class="q-mb-md" />
            <q-input v-model="form.description" label="Descrição curta" outlined type="textarea" :rows="3" class="q-mb-md" />
            <q-input v-model="form.full_description" label="Descrição completa (HTML aceito)" outlined type="textarea" :rows="6" class="q-mb-md" />

            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-select v-model="form.level" :options="levelOptions" label="Nível" outlined emit-value map-options />
              </div>
              <div class="col-12 col-sm-6">
                <q-input v-model="form.category" label="Categoria" outlined />
              </div>
            </div>

            <q-input v-model="tagsInput" label="Tags (separadas por vírgula)" outlined class="q-mt-md"
              hint="Ex: rpa, uipath, automação" />
          </q-card-section>
        </q-card>

        <!-- Preço -->
        <q-card flat bordered class="q-mb-lg">
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold q-mb-md">Preço e Acesso</div>
            <div class="row items-center q-gutter-md">
              <q-toggle v-model="form.is_free" label="Curso Gratuito" color="positive" />
              <q-input
                v-if="!form.is_free"
                v-model.number="form.price"
                label="Preço (R$)"
                type="number"
                outlined
                prefix="R$"
                style="max-width: 200px"
              />
            </div>
          </q-card-section>
        </q-card>

        <!-- Thumbnail -->
        <q-card flat bordered class="q-mb-lg">
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold q-mb-md">Thumbnail do Curso</div>
            <div class="row items-center q-gutter-md">
              <q-img v-if="form.thumbnail" :src="form.thumbnail" height="120px" width="200px" fit="cover" class="rounded-borders" />
              <div>
                <q-file
                  v-model="thumbnailFile"
                  label="Upload de imagem"
                  outlined
                  accept="image/*"
                  class="q-mb-sm"
                  style="max-width: 300px"
                />
                <q-btn unelevated color="secondary" label="Enviar" :loading="uploadingThumb" :disable="!thumbnailFile" @click="uploadThumbnail" dense />
                <div class="text-caption text-grey-6 q-mt-xs">ou</div>
                <q-input v-model="form.thumbnail" label="URL da imagem" outlined dense style="max-width: 300px" />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Módulos e Aulas -->
        <q-card flat bordered v-if="isEditing">
          <q-card-section>
            <div class="row items-center q-mb-md">
              <div class="text-subtitle1 text-weight-bold">Módulos e Aulas</div>
              <q-space />
              <q-btn unelevated color="primary" icon="add" label="Adicionar Módulo" dense @click="addModule" />
            </div>

            <div v-if="modules.length === 0" class="text-center text-grey-5 q-py-md">
              Nenhum módulo ainda. Adicione o primeiro módulo.
            </div>

            <q-expansion-item
              v-for="(mod, mi) in modules"
              :key="mod.id || `new-${mi}`"
              :label="mod.title || 'Novo módulo'"
              icon="folder"
              default-opened
              class="module-editor q-mb-md"
              header-class="text-weight-bold text-primary bg-blue-1"
            >
              <q-card flat class="q-pa-md">
                <div class="row q-col-gutter-sm q-mb-md">
                  <div class="col">
                    <q-input v-model="mod.title" label="Título do módulo" outlined dense @blur="saveModule(mod, mi)" />
                  </div>
                  <div class="col-auto">
                    <q-input v-model.number="mod.position" label="Pos." type="number" outlined dense style="width: 80px" />
                  </div>
                  <div class="col-auto">
                    <q-btn flat round dense icon="delete" color="negative" @click="deleteModule(mod, mi)" />
                  </div>
                </div>

                <!-- Aulas do módulo -->
                <div v-for="(lesson, li) in (mod.lessons || [])" :key="lesson.id || `new-lesson-${li}`" class="lesson-editor row q-col-gutter-sm items-center q-mb-sm">
                  <div class="col-4">
                    <q-input v-model="lesson.title" label="Título" outlined dense />
                  </div>
                  <div class="col-2">
                    <q-input v-model.number="lesson.position" label="Pos." type="number" outlined dense />
                  </div>
                  <div class="col-2">
                    <q-input v-model.number="lesson.duration_seconds" label="Seg." type="number" outlined dense />
                  </div>
                  <div class="col-2">
                    <q-toggle v-model="lesson.is_preview" label="Preview" dense color="positive" />
                  </div>
                  <div class="col-auto row q-gutter-xs">
                    <!-- Upload de vídeo -->
                    <q-btn flat round dense icon="upload" color="secondary" @click="openVideoUpload(lesson, mod)" title="Upload de vídeo">
                      <q-tooltip>Upload de vídeo</q-tooltip>
                    </q-btn>
                    <q-btn flat round dense icon="save" color="primary" @click="saveLesson(lesson, mod)" title="Salvar aula" />
                    <q-btn flat round dense icon="delete" color="negative" @click="deleteLesson(lesson, mod, li)" />
                  </div>
                  <div class="col-12" v-if="lesson.video_url">
                    <video
                      :src="lesson.video_url"
                      controls
                      style="width: 100%; aspect-ratio: 16/9; object-fit: contain; border-radius: 6px; background: #000; display: block; margin-top: 6px"
                    />
                  </div>
                </div>

                <q-btn flat icon="add" label="Adicionar Aula" dense color="primary" @click="addLesson(mod)" class="q-mt-sm" />
              </q-card>
            </q-expansion-item>
          </q-card-section>
        </q-card>

        <q-banner v-else class="bg-blue-1 text-primary q-mt-md rounded-borders">
          <template #avatar><q-icon name="info" /></template>
          Salve o curso primeiro para adicionar módulos e aulas.
        </q-banner>
      </div>

      <!-- Sidebar de publicação -->
      <div class="col-12 col-md-4">
        <q-card flat bordered class="sticky-card">
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold q-mb-md">Publicação</div>
            <q-toggle v-model="form.published" label="Publicado (visível ao público)" color="positive" />
          </q-card-section>
          <q-separator />
          <q-card-actions>
            <q-btn unelevated color="primary" label="Salvar" class="full-width" :loading="saving" @click="save" />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- Dialog upload de vídeo -->
    <q-dialog v-model="videoUploadDialog" persistent>
      <q-card style="min-width: 440px">
        <q-card-section>
          <div class="text-h6">Upload de Vídeo</div>
          <div class="text-caption text-grey-6 q-mb-md">Aula: {{ uploadingForLesson?.title }}</div>

          <!-- Seleção do arquivo (só aparece antes de enviar) -->
          <q-file
            v-if="!uploadingVideo"
            v-model="videoFile"
            label="Selecione o vídeo"
            outlined
            accept="video/*"
          >
            <template #append>
              <q-icon name="videocam" />
            </template>
          </q-file>

          <!-- Progresso do upload -->
          <div v-if="uploadingVideo" class="q-mt-sm">
            <div class="row justify-between items-center q-mb-xs">
              <span class="text-subtitle2 text-weight-bold text-primary">
                {{ uploadPercent }}%
              </span>
              <span class="text-caption text-grey-6">
                {{ uploadedMB }} / {{ totalMB }} MB
              </span>
            </div>

            <q-linear-progress
              :value="uploadPercent / 100"
              color="primary"
              track-color="grey-3"
              rounded
              size="14px"
              class="q-mb-md"
            />

            <div class="row justify-between text-caption text-grey-7">
              <div class="row items-center q-gutter-xs">
                <q-icon name="speed" size="14px" color="grey-6" />
                <span>{{ uploadSpeedMBps }} MB/s</span>
              </div>
              <div class="row items-center q-gutter-xs">
                <q-icon name="schedule" size="14px" color="grey-6" />
                <span>{{ uploadTimeLeft }}</span>
              </div>
            </div>

            <div v-if="uploadPercent === 100" class="text-center q-mt-md text-positive text-caption">
              <q-icon name="cloud_done" size="18px" class="q-mr-xs" />
              Processando no servidor...
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" :disable="uploadingVideo" v-close-popup />
          <q-btn
            unelevated
            color="primary"
            label="Enviar"
            icon="upload"
            :loading="uploadingVideo"
            :disable="!videoFile"
            @click="uploadVideo"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { getAuthToken } from 'src/composables/useAuthToken'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const route = useRoute()
const router = useRouter()
const $q = useQuasar()

const isEditing = computed(() => !!route.params.id)
const saving = ref(false)
const modules = ref([])

const form = ref({
  title: '', slug: '', description: '', full_description: '',
  thumbnail: '', price: 0, is_free: false,
  level: 'iniciante', category: '', published: false,
})
const tagsInput = ref('')

const levelOptions = [
  { label: 'Iniciante', value: 'iniciante' },
  { label: 'Intermediário', value: 'intermediario' },
  { label: 'Avançado', value: 'avancado' },
]

// Upload
const thumbnailFile = ref(null)
const uploadingThumb = ref(false)
const videoFile = ref(null)
const uploadingVideo = ref(false)
const videoUploadDialog = ref(false)
const uploadingForLesson = ref(null)
const uploadingForModule = ref(null)

// Progresso do upload de vídeo
const uploadPercent = ref(0)
const uploadedMB = ref('0')
const totalMB = ref('0')
const uploadSpeedMBps = ref('0')
const uploadTimeLeft = ref('calculando...')
let _uploadLastLoaded = 0
let _uploadLastTime = 0

function onUploadProgress(evt) {
  if (!evt.total) return
  const now = Date.now()
  const percent = Math.round((evt.loaded / evt.total) * 100)
  uploadPercent.value = percent
  uploadedMB.value = (evt.loaded / 1024 / 1024).toFixed(1)
  totalMB.value = (evt.total / 1024 / 1024).toFixed(1)

  // Calcula velocidade instantânea desde a última leitura
  const dtMs = now - _uploadLastTime
  if (dtMs > 300) {
    const deltaBytes = evt.loaded - _uploadLastLoaded
    const speedBps = (deltaBytes / dtMs) * 1000
    const speedMB = speedBps / 1024 / 1024
    uploadSpeedMBps.value = speedMB.toFixed(1)

    const remaining = evt.total - evt.loaded
    const secsLeft = speedBps > 0 ? remaining / speedBps : 0
    uploadTimeLeft.value = secsLeft < 5
      ? 'quase pronto'
      : secsLeft < 60
        ? `${Math.round(secsLeft)}s restantes`
        : `${Math.round(secsLeft / 60)}min restantes`

    _uploadLastLoaded = evt.loaded
    _uploadLastTime = now
  }
}

function generateSlug(val) {
  form.value.slug = val
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

async function save() {
  saving.value = true
  try {
    const token = await getAuthToken()
    const payload = {
      ...form.value,
      tags: tagsInput.value ? tagsInput.value.split(',').map((t) => t.trim()).filter(Boolean) : [],
    }

    if (isEditing.value) {
      await axios.put(`${API}/api/admin/courses/${route.params.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
      $q.notify({ type: 'positive', message: 'Curso atualizado!' })
    } else {
      const { data } = await axios.post(`${API}/api/admin/courses`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
      $q.notify({ type: 'positive', message: 'Curso criado!' })
      router.push(`/admin/cursos/${data.id}/editar`)
    }
  } catch (e) {
    $q.notify({ type: 'negative', message: e.response?.data?.error || 'Erro ao salvar' })
  } finally {
    saving.value = false
  }
}

async function uploadThumbnail() {
  uploadingThumb.value = true
  try {
    const token = await getAuthToken()
    const fd = new FormData()
    fd.append('file', thumbnailFile.value)
    const { data } = await axios.post(`${API}/api/admin/upload/thumbnail`, fd, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
    })
    form.value.thumbnail = data.url
    thumbnailFile.value = null
    $q.notify({ type: 'positive', message: 'Thumbnail enviada!' })
  } catch {
    $q.notify({ type: 'negative', message: 'Erro no upload' })
  } finally {
    uploadingThumb.value = false
  }
}

// Módulos
function addModule() {
  modules.value.push({ title: '', description: '', position: modules.value.length, lessons: [], _new: true })
}

async function saveModule(mod, mi) {
  if (!mod.title.trim()) return
  try {
    const token = await getAuthToken()
    if (mod._new) {
      const { data } = await axios.post(`${API}/api/admin/courses/${route.params.id}/modules`, {
        title: mod.title, description: mod.description, position: mod.position,
      }, { headers: { Authorization: `Bearer ${token}` } })
      modules.value[mi].id = data.id
      modules.value[mi]._new = false
    } else {
      await axios.put(`${API}/api/admin/modules/${mod.id}`, {
        title: mod.title, description: mod.description, position: mod.position,
      }, { headers: { Authorization: `Bearer ${token}` } })
    }
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao salvar módulo' })
  }
}

async function deleteModule(mod, mi) {
  if (mod._new) { modules.value.splice(mi, 1); return }
  try {
    const token = await getAuthToken()
    await axios.delete(`${API}/api/admin/modules/${mod.id}`, { headers: { Authorization: `Bearer ${token}` } })
    modules.value.splice(mi, 1)
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao excluir módulo' })
  }
}

// Aulas
function addLesson(mod) {
  if (!mod.lessons) mod.lessons = []
  mod.lessons.push({ title: '', description: '', video_url: null, duration_seconds: 0, position: mod.lessons.length, is_preview: false, _new: true })
}

async function saveLesson(lesson, mod) {
  if (!lesson.title.trim()) return
  try {
    const token = await getAuthToken()
    if (lesson._new) {
      if (!mod.id) {
        $q.notify({ type: 'warning', message: 'Salve o módulo antes de adicionar aulas' }); return
      }
      const { data } = await axios.post(`${API}/api/admin/modules/${mod.id}/lessons`, lesson, {
        headers: { Authorization: `Bearer ${token}` },
      })
      lesson.id = data.id
      lesson._new = false
    } else {
      await axios.put(`${API}/api/admin/lessons/${lesson.id}`, lesson, { headers: { Authorization: `Bearer ${token}` } })
    }
    $q.notify({ type: 'positive', message: 'Aula salva!' })
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao salvar aula' })
  }
}

async function deleteLesson(lesson, mod, li) {
  if (lesson._new) { mod.lessons.splice(li, 1); return }
  try {
    const token = await getAuthToken()
    await axios.delete(`${API}/api/admin/lessons/${lesson.id}`, { headers: { Authorization: `Bearer ${token}` } })
    mod.lessons.splice(li, 1)
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao excluir aula' })
  }
}

function openVideoUpload(lesson, mod) {
  uploadingForLesson.value = lesson
  uploadingForModule.value = mod
  videoFile.value = null
  uploadPercent.value = 0
  uploadTimeLeft.value = 'calculando...'
  videoUploadDialog.value = true
}

async function uploadVideo() {
  // Reseta estado de progresso
  uploadPercent.value = 0
  uploadedMB.value = '0'
  totalMB.value = '0'
  uploadSpeedMBps.value = '0'
  uploadTimeLeft.value = 'calculando...'
  _uploadLastLoaded = 0
  _uploadLastTime = Date.now()

  uploadingVideo.value = true
  try {
    const token = await getAuthToken()
    const fd = new FormData()
    fd.append('file', videoFile.value)
    const { data } = await axios.post(`${API}/api/admin/upload/video`, fd, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    })
    uploadingForLesson.value.video_url = data.url
    await saveLesson(uploadingForLesson.value, uploadingForModule.value)
    videoUploadDialog.value = false
    $q.notify({ type: 'positive', message: 'Vídeo enviado!' })
  } catch {
    $q.notify({ type: 'negative', message: 'Erro no upload do vídeo' })
  } finally {
    uploadingVideo.value = false
  }
}

async function fetchCourse() {
  if (!isEditing.value) return
  try {
    const token = await getAuthToken()
    const { data } = await axios.get(`${API}/api/admin/courses/${route.params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const { modules: mods, tags, ...rest } = data
    form.value = { ...form.value, ...rest }
    tagsInput.value = (tags || []).join(', ')
    modules.value = mods || []
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao carregar curso' })
  }
}

onMounted(fetchCourse)
</script>

<style scoped>
.sticky-card {
  position: sticky;
  top: 80px;
}

.module-editor {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.lesson-editor {
  background: #fafafa;
  border-radius: 6px;
  padding: 8px;
}
</style>
