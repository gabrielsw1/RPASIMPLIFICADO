<template>
  <q-page class="q-pa-lg admin-page">

    <div class="row items-center q-mb-lg">
      <div>
        <div class="text-h5 text-weight-bold text-grey-9">Pedidos de Ajuda</div>
        <div class="text-caption text-grey-6">Dúvidas enviadas pelos alunos</div>
      </div>
      <q-space />
      <div class="row q-gutter-sm">
        <q-btn
          v-for="opt in statusOptions"
          :key="opt.value"
          :outline="selectedStatus !== opt.value"
          :unelevated="selectedStatus === opt.value"
          :color="opt.color"
          :label="opt.label"
          dense
          no-caps
          size="sm"
          @click="selectedStatus = opt.value; fetchHelp()"
        />
      </div>
    </div>

    <div v-if="loading" class="text-center q-py-xl">
      <q-spinner color="primary" size="40px" />
    </div>

    <div v-else-if="helpRequests.length === 0" class="text-center text-grey-5 q-py-xl">
      <q-icon name="help_outline" size="48px" color="grey-4" />
      <div class="q-mt-md">Nenhum pedido de ajuda encontrado.</div>
    </div>

    <q-card
      v-for="hr in helpRequests"
      :key="hr.id"
      flat bordered
      class="q-mb-md"
    >
      <q-card-section>

        <!-- Header -->
        <div class="row items-start justify-between q-mb-sm">
          <div class="col">
            <div class="row items-center q-gutter-sm q-mb-xs">
              <q-badge :color="statusColor(hr.status)" :label="statusLabel(hr.status)" rounded />
              <span class="text-caption text-grey-5">{{ formatDate(hr.created_at) }}</span>
            </div>
            <div class="text-subtitle2 text-weight-bold text-grey-9">{{ hr.author_name }}</div>
            <div class="text-caption text-grey-6 q-mt-xs">
              <q-icon name="play_lesson" size="12px" class="q-mr-xs" />
              {{ hr.lessons?.title }}
              <span class="q-mx-xs text-grey-4">·</span>
              {{ hr.lessons?.modules?.title }}
              <span class="q-mx-xs text-grey-4">·</span>
              {{ hr.lessons?.modules?.courses?.title }}
            </div>
          </div>
          <div v-if="hr.status !== 'resolved'" class="col-auto">
            <q-btn
              outline dense no-caps size="sm"
              color="warning"
              label="Marcar em análise"
              :disable="hr.status === 'in_progress'"
              @click="updateStatus(hr, 'in_progress')"
            />
          </div>
        </div>

        <!-- Pergunta -->
        <div class="q-pa-md q-mb-md bg-grey-1 rounded-borders" style="border-left: 3px solid #e0e0e0">
          <div class="text-caption text-grey-5 q-mb-xs">Dúvida do aluno:</div>
          <p class="text-body2 text-grey-8 q-mb-none">{{ hr.description }}</p>
        </div>

        <!-- Resposta existente -->
        <div v-if="hr.response" class="q-pa-md q-mb-md rounded-borders" style="background: #f1f8e9; border-left: 3px solid #66bb6a">
          <div class="row items-center q-gutter-xs q-mb-xs">
            <q-icon name="check_circle" color="positive" size="14px" />
            <span class="text-caption text-positive text-weight-bold">Respondida em {{ formatDate(hr.responded_at) }}</span>
          </div>
          <p class="text-body2 text-grey-8 q-mb-xs">{{ hr.response }}</p>
          <q-btn flat dense no-caps color="primary" label="Editar resposta" size="sm" @click="openReply(hr)" />
        </div>

        <!-- Campo de resposta inline -->
        <div v-if="replyingId === hr.id" class="q-mt-sm" style="border-top: 1px solid #f0f0f0; padding-top: 12px">
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
              @click="sendReply(hr)"
            />
          </div>
        </div>

        <!-- Botão responder -->
        <div v-else-if="hr.status !== 'resolved'" class="q-mt-sm">
          <q-btn unelevated dense no-caps color="positive" icon="reply" label="Responder Dúvida" size="sm" @click="openReply(hr)" />
        </div>
        <div v-else-if="!hr.response" class="q-mt-sm">
          <q-btn unelevated dense no-caps color="positive" icon="reply" label="Adicionar Resposta" size="sm" @click="openReply(hr)" />
        </div>

      </q-card-section>
    </q-card>

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
const helpRequests = ref([])
const selectedStatus = ref(null)

const replyingId = ref(null)
const replyText = ref('')
const sending = ref(false)

const statusOptions = [
  { label: 'Todos', value: null, color: 'grey' },
  { label: 'Aguardando', value: 'pending', color: 'warning' },
  { label: 'Em análise', value: 'in_progress', color: 'info' },
  { label: 'Respondidas', value: 'resolved', color: 'positive' },
]

function statusLabel(s) {
  return { pending: 'Aguardando', in_progress: 'Em análise', resolved: 'Respondida' }[s] || s
}

function statusColor(s) {
  return { pending: 'warning', in_progress: 'info', resolved: 'positive' }[s] || 'grey'
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleString('pt-BR')
}

function openReply(hr) {
  replyingId.value = hr.id
  replyText.value = hr.response || ''
}

async function fetchHelp() {
  loading.value = true
  try {
    const token = await getAuthToken()
    const params = selectedStatus.value ? { status: selectedStatus.value } : {}
    const { data } = await axios.get(`${API}/api/admin/help-requests`, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    })
    helpRequests.value = data
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao carregar pedidos de ajuda' })
  } finally {
    loading.value = false
  }
}

async function updateStatus(hr, status) {
  try {
    const token = await getAuthToken()
    const { data } = await axios.put(`${API}/api/admin/help-requests/${hr.id}`, { status }, {
      headers: { Authorization: `Bearer ${token}` },
    })
    hr.status = data.status
    $q.notify({ type: 'positive', message: 'Status atualizado' })
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao atualizar status' })
  }
}

async function sendReply(hr) {
  if (!replyText.value.trim()) return
  sending.value = true
  try {
    const token = await getAuthToken()
    const { data } = await axios.put(
      `${API}/api/admin/help-requests/${hr.id}`,
      { response: replyText.value.trim() },
      { headers: { Authorization: `Bearer ${token}` } },
    )
    hr.status = data.status
    hr.response = data.response
    hr.responded_at = data.responded_at
    replyingId.value = null
    replyText.value = ''
    $q.notify({ type: 'positive', message: 'Resposta enviada!' })
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao enviar resposta' })
  } finally {
    sending.value = false
  }
}

onMounted(fetchHelp)
</script>
