<template>
  <q-page class="q-pa-lg admin-page">

    <div class="row items-center q-mb-lg">
      <div>
        <div class="text-h5 text-weight-bold text-grey-9">Comentários das Aulas</div>
        <div class="text-caption text-grey-6">Comentários dos alunos nas aulas dos cursos</div>
      </div>
    </div>

    <div v-if="loading" class="text-center q-py-xl">
      <q-spinner color="primary" size="40px" />
    </div>

    <div v-else-if="comments.length === 0" class="text-center text-grey-5 q-py-xl">
      <q-icon name="forum" size="48px" color="grey-4" />
      <div class="q-mt-md">Nenhum comentário encontrado.</div>
    </div>

    <q-card
      v-for="c in comments"
      :key="c.id"
      flat bordered
      class="q-mb-md"
      :style="!c.seen ? 'border-left: 3px solid #f5a623' : ''"
    >
      <q-card-section>

        <!-- Header -->
        <div class="row items-start justify-between q-mb-sm">
          <div class="row items-center q-gutter-sm">
            <q-avatar size="32px" color="primary" text-color="white">
              <img v-if="c.author_avatar" :src="c.author_avatar" />
              <span v-else style="font-size:13px; font-weight:700">{{ c.author_name?.charAt(0)?.toUpperCase() }}</span>
            </q-avatar>
            <div>
              <div class="row items-center q-gutter-xs">
                <span class="text-weight-bold text-grey-9">{{ c.author_name }}</span>
                <q-badge v-if="!c.seen" color="orange" label="Novo" rounded dense />
              </div>
              <div class="text-caption text-grey-5">{{ formatDate(c.created_at) }}</div>
            </div>
          </div>
          <q-btn flat round dense icon="delete" color="negative" size="sm" @click="confirmDelete(c)">
            <q-tooltip>Excluir</q-tooltip>
          </q-btn>
        </div>

        <!-- Aula -->
        <div class="text-caption text-grey-6 q-mb-sm">
          <q-icon name="play_lesson" size="12px" class="q-mr-xs" />
          {{ c.lessons?.title }}
          <span class="q-mx-xs text-grey-4">·</span>
          {{ c.lessons?.modules?.courses?.title }}
        </div>

        <!-- Comentário -->
        <div class="q-pa-md q-mb-md bg-grey-1 rounded-borders" style="border-left: 3px solid #e0e0e0">
          <p class="text-body2 text-grey-8 q-mb-none">{{ c.content }}</p>
        </div>

        <!-- Resposta existente -->
        <div v-if="c.admin_reply" class="q-pa-md q-mb-md rounded-borders" style="background: #f1f8e9; border-left: 3px solid #66bb6a">
          <div class="row items-center q-gutter-xs q-mb-xs">
            <q-icon name="check_circle" color="positive" size="14px" />
            <span class="text-caption text-positive text-weight-bold">Respondido em {{ formatDate(c.admin_replied_at) }}</span>
          </div>
          <p class="text-body2 text-grey-8 q-mb-xs">{{ c.admin_reply }}</p>
          <q-btn flat dense no-caps color="primary" label="Editar resposta" size="sm" @click="openReply(c)" />
        </div>

        <!-- Campo de resposta inline -->
        <div v-if="replyingId === c.id" class="q-mt-sm" style="border-top: 1px solid #f0f0f0; padding-top: 12px">
          <q-input
            v-model="replyText"
            type="textarea"
            outlined
            autogrow
            :rows="3"
            label="Escreva sua resposta..."
            class="q-mb-sm"
          />
          <div class="row q-gutter-sm justify-end">
            <q-btn flat dense no-caps label="Cancelar" @click="replyingId = null" />
            <q-btn
              unelevated dense no-caps
              color="positive"
              icon="send"
              label="Enviar Resposta"
              :loading="sending"
              :disable="!replyText.trim()"
              @click="sendReply(c)"
            />
          </div>
        </div>

        <!-- Botão responder -->
        <div v-else-if="!c.admin_reply" class="q-mt-sm">
          <q-btn unelevated dense no-caps color="primary" icon="reply" label="Responder" size="sm" @click="openReply(c)" />
        </div>

      </q-card-section>
    </q-card>

    <q-dialog v-model="deleteDialog">
      <q-card style="min-width: 320px">
        <q-card-section class="row items-center q-pb-none">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">Excluir este comentário?</span>
        </q-card-section>
        <q-card-section class="text-caption text-grey-7">{{ toDelete?.content }}</q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" no-caps v-close-popup />
          <q-btn unelevated color="negative" label="Excluir" no-caps :loading="deleting" @click="deleteComment" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { getAuthToken } from 'src/composables/useAuthToken'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const $q = useQuasar()

const loading = ref(true)
const comments = ref([])
const deleteDialog = ref(false)
const toDelete = ref(null)
const deleting = ref(false)

const replyingId = ref(null)
const replyText = ref('')
const sending = ref(false)

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleString('pt-BR')
}

function openReply(c) {
  replyingId.value = c.id
  replyText.value = c.admin_reply || ''
}

async function fetchComments() {
  loading.value = true
  try {
    const token = await getAuthToken()
    const { data } = await axios.get(`${API}/api/admin/comments`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    comments.value = data
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao carregar comentários' })
  } finally {
    loading.value = false
  }
}

async function markSeen() {
  try {
    const token = await getAuthToken()
    await axios.post(`${API}/api/admin/comments/mark-seen`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch { /* silencioso */ }
}

async function sendReply(c) {
  if (!replyText.value.trim()) return
  sending.value = true
  try {
    const token = await getAuthToken()
    const { data } = await axios.put(
      `${API}/api/admin/comments/${c.id}`,
      { admin_reply: replyText.value.trim() },
      { headers: { Authorization: `Bearer ${token}` } },
    )
    c.admin_reply = data.admin_reply
    c.admin_replied_at = data.admin_replied_at
    c.seen = true
    replyingId.value = null
    replyText.value = ''
    $q.notify({ type: 'positive', message: 'Resposta enviada!' })
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao enviar resposta' })
  } finally {
    sending.value = false
  }
}

function confirmDelete(comment) {
  toDelete.value = comment
  deleteDialog.value = true
}

async function deleteComment() {
  deleting.value = true
  try {
    const token = await getAuthToken()
    await axios.delete(`${API}/api/admin/comments/${toDelete.value.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    comments.value = comments.value.filter((c) => c.id !== toDelete.value.id)
    deleteDialog.value = false
    $q.notify({ type: 'positive', message: 'Comentário excluído' })
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao excluir' })
  } finally {
    deleting.value = false
  }
}

onMounted(async () => {
  await fetchComments()
  await markSeen()
})
</script>
