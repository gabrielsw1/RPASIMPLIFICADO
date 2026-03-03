<template>
  <q-page class="q-pa-lg admin-page">

    <div class="row items-center q-mb-lg">
      <div>
        <div class="text-h5 text-weight-bold text-grey-9">Matrículas</div>
        <div class="text-caption text-grey-6">Alunos matriculados na plataforma</div>
      </div>
      <q-space />
      <q-select
        v-model="selectedCourse"
        :options="courseOptions"
        label="Filtrar por curso"
        clearable
        outlined
        dense
        emit-value
        map-options
        style="min-width: 260px"
        @update:model-value="fetchEnrollments"
      />
    </div>

    <q-card flat bordered>
      <q-table
        :rows="enrollments"
        :columns="columns"
        row-key="id"
        flat
        :loading="loading"
        no-data-label="Nenhum aluno matriculado"
      >
        <template #body-cell-student="props">
          <q-td :props="props">
            <div class="row items-center q-gutter-sm">
              <q-avatar size="32px" color="primary" text-color="white">
                <img v-if="props.row.profiles?.avatar_url" :src="props.row.profiles.avatar_url" />
                <span v-else style="font-size:13px; font-weight:700">
                  {{ (props.row.profiles?.full_name || '?').charAt(0).toUpperCase() }}
                </span>
              </q-avatar>
              <span class="text-weight-medium">{{ props.row.profiles?.full_name || 'Sem nome' }}</span>
            </div>
          </q-td>
        </template>

        <template #body-cell-course="props">
          <q-td :props="props">{{ props.row.courses?.title }}</q-td>
        </template>

        <template #body-cell-payment_method="props">
          <q-td :props="props">
            <q-badge
              :color="props.row.payment_method === 'free' ? 'positive' : 'deep-orange'"
              :label="props.row.payment_method === 'free' ? 'Gratuito' : 'Stripe'"
              rounded
            />
          </q-td>
        </template>

        <template #body-cell-status="props">
          <q-td :props="props">
            <q-chip
              dense
              :color="props.row.status === 'active' ? 'positive' : 'grey-4'"
              :text-color="props.row.status === 'active' ? 'white' : 'grey-8'"
              size="sm"
            >
              {{ props.row.status === 'active' ? 'Ativo' : props.row.status }}
            </q-chip>
          </q-td>
        </template>

        <template #body-cell-enrolled_at="props">
          <q-td :props="props">{{ formatDate(props.row.enrolled_at) }}</q-td>
        </template>

        <template #no-data>
          <div class="full-width text-center q-pa-xl text-grey-5">
            <q-icon name="people" size="48px" color="grey-4" />
            <div class="q-mt-md">Nenhum aluno matriculado.</div>
          </div>
        </template>
      </q-table>
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
const enrollments = ref([])
const selectedCourse = ref(null)
const courseOptions = ref([])

const columns = [
  { name: 'student', label: 'Aluno', field: 'student', align: 'left' },
  { name: 'course', label: 'Curso', field: 'course', align: 'left' },
  { name: 'payment_method', label: 'Pagamento', field: 'payment_method', align: 'center' },
  { name: 'status', label: 'Status', field: 'status', align: 'center' },
  { name: 'enrolled_at', label: 'Data de Matrícula', field: 'enrolled_at', align: 'center' },
]

function formatDate(d) {
  return new Date(d).toLocaleDateString('pt-BR')
}

async function fetchEnrollments() {
  loading.value = true
  try {
    const token = await getAuthToken()
    const url = selectedCourse.value
      ? `${API}/api/admin/courses/${selectedCourse.value}/students`
      : `${API}/api/admin/students`
    const { data } = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } })
    enrollments.value = data
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao carregar alunos' })
  } finally {
    loading.value = false
  }
}

async function fetchCourses() {
  try {
    const token = await getAuthToken()
    const { data } = await axios.get(`${API}/api/admin/courses`, { headers: { Authorization: `Bearer ${token}` } })
    courseOptions.value = data.map((c) => ({ label: c.title, value: c.id }))
  } catch { /* ignore */ }
}

async function markSeen() {
  try {
    const token = await getAuthToken()
    await axios.post(`${API}/api/admin/enrollments/mark-seen`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch { /* silencioso */ }
}

onMounted(async () => {
  await fetchCourses()
  await fetchEnrollments()
  markSeen()
})
</script>
