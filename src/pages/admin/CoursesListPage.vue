<template>
  <q-page class="q-pa-lg admin-page">

    <div class="row items-center q-mb-lg">
      <div>
        <div class="text-h5 text-weight-bold text-grey-9">Cursos</div>
        <div class="text-caption text-grey-6">Gerencie os cursos da plataforma</div>
      </div>
      <q-space />
      <q-btn unelevated color="primary" icon="add" label="Novo Curso" to="/admin/cursos/novo" no-caps />
    </div>

    <q-card flat bordered>
      <q-table
        :rows="courses"
        :columns="columns"
        row-key="id"
        flat
        :loading="loading"
        no-data-label="Nenhum curso cadastrado"
      >
        <template #body-cell-thumbnail="props">
          <q-td :props="props">
            <q-avatar square size="48px" rounded>
              <img :src="props.row.thumbnail || '/rpa_simplificado_thumb.png'" />
            </q-avatar>
          </q-td>
        </template>

        <template #body-cell-title="props">
          <q-td :props="props">
            <div class="text-weight-medium text-grey-9">{{ props.row.title }}</div>
            <div class="text-caption text-grey-5">{{ props.row.slug }}</div>
          </q-td>
        </template>

        <template #body-cell-price="props">
          <q-td :props="props">
            <q-badge
              :color="props.row.is_free ? 'positive' : 'deep-orange'"
              :label="props.row.is_free ? 'Gratuito' : `R$ ${Number(props.row.price).toFixed(2)}`"
              rounded
            />
          </q-td>
        </template>

        <template #body-cell-published="props">
          <q-td :props="props">
            <q-toggle
              :model-value="props.row.published"
              color="positive"
              @update:model-value="togglePublish(props.row)"
            />
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props">
            <q-btn flat round dense icon="edit" color="primary" size="sm" :to="`/admin/cursos/${props.row.id}/editar`">
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="delete" color="negative" size="sm" @click="confirmDelete(props.row)">
              <q-tooltip>Excluir</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template #no-data>
          <div class="full-width text-center q-pa-xl text-grey-5">
            <q-icon name="school" size="48px" color="grey-4" />
            <div class="q-mt-md">Nenhum curso cadastrado ainda.</div>
          </div>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="deleteDialog">
      <q-card style="min-width: 340px">
        <q-card-section class="row items-center q-pb-none">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">Excluir <strong>{{ toDelete?.title }}</strong>?</span>
        </q-card-section>
        <q-card-section class="text-caption text-grey-7">
          Todos os módulos e aulas serão removidos permanentemente.
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" no-caps v-close-popup />
          <q-btn unelevated color="negative" label="Excluir" no-caps :loading="deleting" @click="deleteCourse" />
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
const courses = ref([])
const deleteDialog = ref(false)
const toDelete = ref(null)
const deleting = ref(false)

const columns = [
  { name: 'thumbnail', label: '', field: 'thumbnail', align: 'center' },
  { name: 'title', label: 'Título', field: 'title', align: 'left', sortable: true },
  { name: 'level', label: 'Nível', field: 'level', align: 'center' },
  { name: 'module_count', label: 'Módulos', field: 'module_count', align: 'center' },
  { name: 'lesson_count', label: 'Aulas', field: 'lesson_count', align: 'center' },
  { name: 'price', label: 'Preço', field: 'price', align: 'center' },
  { name: 'published', label: 'Publicado', field: 'published', align: 'center' },
  { name: 'actions', label: 'Ações', field: 'actions', align: 'center' },
]

async function fetchCourses() {
  loading.value = true
  try {
    const token = await getAuthToken()
    const { data } = await axios.get(`${API}/api/admin/courses`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    courses.value = data
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao carregar cursos' })
  } finally {
    loading.value = false
  }
}

async function togglePublish(course) {
  try {
    const token = await getAuthToken()
    await axios.put(`${API}/api/admin/courses/${course.id}`, { published: !course.published }, {
      headers: { Authorization: `Bearer ${token}` },
    })
    course.published = !course.published
    $q.notify({ type: 'positive', message: course.published ? 'Curso publicado' : 'Curso despublicado' })
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao alterar status' })
  }
}

function confirmDelete(course) {
  toDelete.value = course
  deleteDialog.value = true
}

async function deleteCourse() {
  deleting.value = true
  try {
    const token = await getAuthToken()
    await axios.delete(`${API}/api/admin/courses/${toDelete.value.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    courses.value = courses.value.filter((c) => c.id !== toDelete.value.id)
    deleteDialog.value = false
    $q.notify({ type: 'positive', message: 'Curso excluído' })
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao excluir' })
  } finally {
    deleting.value = false
  }
}

onMounted(fetchCourses)
</script>
