<template>
  <q-page class="q-pa-lg admin-page">

    <div class="row items-center q-mb-lg">
      <div>
        <div class="text-h5 text-weight-bold text-grey-9">Posts</div>
        <div class="text-caption text-grey-6">Gerencie os artigos do blog</div>
      </div>
      <q-space />
      <q-btn unelevated color="primary" icon="add" label="Novo Post" to="/admin/posts/new" no-caps />
    </div>

    <q-card flat bordered>
      <q-table
        :rows="posts"
        :columns="columns"
        row-key="id"
        :loading="loading"
        flat
        :rows-per-page-options="[10, 20, 50]"
      >
        <template #body-cell-published="props">
          <q-td :props="props">
            <q-chip
              dense
              :color="props.value ? 'positive' : 'grey-4'"
              :text-color="props.value ? 'white' : 'grey-8'"
              :icon="props.value ? 'check_circle' : 'radio_button_unchecked'"
              size="sm"
            >
              {{ props.value ? 'Publicado' : 'Rascunho' }}
            </q-chip>
          </q-td>
        </template>

        <template #body-cell-created_at="props">
          <q-td :props="props">{{ formatDate(props.value) }}</q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props">
            <q-btn flat round dense icon="edit" color="primary" size="sm" :to="`/admin/posts/${props.row.id}/edit`">
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn
              flat round dense size="sm"
              :icon="props.row.published ? 'unpublished' : 'publish'"
              :color="props.row.published ? 'warning' : 'positive'"
              @click="togglePublish(props.row)"
            >
              <q-tooltip>{{ props.row.published ? 'Despublicar' : 'Publicar' }}</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="delete" color="negative" size="sm" @click="confirmDelete(props.row)">
              <q-tooltip>Excluir</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template #no-data>
          <div class="full-width text-center q-pa-xl text-grey-5">
            <q-icon name="article" size="48px" color="grey-4" />
            <div class="q-mt-md">Nenhum post criado ainda.</div>
          </div>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="deleteDialog">
      <q-card style="min-width: 320px">
        <q-card-section class="row items-center q-pb-none">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">Excluir "<strong>{{ postToDelete?.title }}</strong>"?</span>
        </q-card-section>
        <q-card-section class="text-caption text-grey-7">
          Esta ação não pode ser desfeita.
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" no-caps v-close-popup />
          <q-btn color="negative" label="Excluir" unelevated no-caps @click="deletePost" :loading="deleting" />
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
const posts = ref([])
const loading = ref(true)
const deleteDialog = ref(false)
const postToDelete = ref(null)
const deleting = ref(false)

const columns = [
  { name: 'title', label: 'Título', field: 'title', align: 'left', sortable: true },
  { name: 'category', label: 'Categoria', field: 'category', align: 'left', sortable: true },
  { name: 'published', label: 'Status', field: 'published', align: 'center', sortable: true },
  { name: 'created_at', label: 'Data', field: 'created_at', align: 'left', sortable: true },
  { name: 'actions', label: 'Ações', field: 'actions', align: 'center' },
]

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('pt-BR')
}

async function loadPosts() {
  loading.value = true
  try {
    const token = await getAuthToken()
    const { data } = await axios.get(`${API}/api/admin/posts`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    posts.value = data
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao carregar posts' })
  } finally {
    loading.value = false
  }
}

async function togglePublish(post) {
  try {
    const token = await getAuthToken()
    await axios.put(`${API}/api/admin/posts/${post.id}`, { published: !post.published }, {
      headers: { Authorization: `Bearer ${token}` },
    })
    post.published = !post.published
    $q.notify({ type: 'positive', message: post.published ? 'Post publicado!' : 'Post despublicado.' })
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao alterar status' })
  }
}

function confirmDelete(post) {
  postToDelete.value = post
  deleteDialog.value = true
}

async function deletePost() {
  deleting.value = true
  try {
    const token = await getAuthToken()
    await axios.delete(`${API}/api/admin/posts/${postToDelete.value.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    posts.value = posts.value.filter((p) => p.id !== postToDelete.value.id)
    $q.notify({ type: 'positive', message: 'Post excluído.' })
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao excluir post' })
  } finally {
    deleting.value = false
    deleteDialog.value = false
  }
}

onMounted(loadPosts)
</script>
