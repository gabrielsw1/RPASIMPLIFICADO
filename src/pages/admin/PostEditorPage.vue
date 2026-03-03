<template>
  <q-page class="q-pa-lg">
    <!-- Page header -->
    <div class="flex items-center q-mb-lg">
      <q-btn flat round icon="arrow_back" color="primary" to="/admin/posts" class="q-mr-sm" />
      <div>
        <div class="text-h5 text-weight-bold">{{ isEdit ? 'Editar Post' : 'Novo Post' }}</div>
        <div class="text-caption text-grey-6">
          {{ isEdit ? `ID: ${route.params.id}` : 'Criando novo artigo' }}
        </div>
      </div>
      <q-space />
      <div class="q-gutter-sm">
        <q-btn
          unelevated
          color="purple-7"
          icon="auto_awesome"
          label="Gerar com IA"
          @click="aiDialog = true"
        />
        <q-btn
          outline
          color="grey-7"
          label="Salvar Rascunho"
          icon="save"
          :loading="saving"
          @click="save(false)"
        />
        <q-btn
          unelevated
          color="primary"
          label="Publicar"
          icon="publish"
          :loading="saving"
          @click="save(true)"
        />
      </div>
    </div>

    <q-banner v-if="errorMsg" class="bg-negative text-white rounded-borders q-mb-md">
      {{ errorMsg }}
    </q-banner>

    <div class="row q-col-gutter-lg">
      <!-- Left: main content -->
      <div class="col-12 col-md-8">
        <q-card flat bordered class="q-pa-md q-mb-md">
          <q-input
            v-model="form.title"
            label="Título"
            outlined
            class="q-mb-md"
            :rules="[(v) => !!v || 'Título obrigatório']"
            @update:model-value="autoSlug"
          />
          <q-input
            v-model="form.slug"
            label="Slug (URL)"
            outlined
            hint="/blog/seu-slug"
            class="q-mb-md"
            :rules="[(v) => !!v || 'Slug obrigatório']"
          />
          <q-input
            v-model="form.excerpt"
            label="Resumo (excerpt)"
            type="textarea"
            outlined
            autogrow
            class="q-mb-md"
          />
        </q-card>

        <!-- Quill editor -->
        <q-card flat bordered class="q-pa-md">
          <div class="text-caption text-grey-6 q-mb-sm">Conteúdo</div>
          <QuillEditor
            v-model:content="form.content"
            content-type="html"
            theme="snow"
            :toolbar="quillToolbar"
            style="min-height: 400px"
          />
        </q-card>
      </div>

      <!-- Right: settings -->
      <div class="col-12 col-md-4">
        <q-card flat bordered class="q-pa-md q-mb-md">
          <div class="text-subtitle2 text-weight-bold q-mb-md">Configurações</div>

          <q-toggle v-model="form.published" label="Publicado" color="positive" class="q-mb-md" />

          <q-select
            v-model="form.category"
            label="Categoria"
            outlined
            use-input
            input-debounce="0"
            :options="categoryOptions"
            new-value-mode="add-unique"
            class="q-mb-md"
          />

          <q-select
            v-model="form.tags"
            label="Tags"
            outlined
            multiple
            use-input
            use-chips
            input-debounce="0"
            new-value-mode="add-unique"
            class="q-mb-md"
          />

          <q-input v-model="form.author" label="Autor" outlined class="q-mb-md" />
        </q-card>

        <q-card flat bordered class="q-pa-md">
          <div class="text-subtitle2 text-weight-bold q-mb-md">Imagem de Capa</div>
          <q-input v-model="form.cover_image" label="URL da imagem" outlined class="q-mb-md" />
          <q-img v-if="form.cover_image" :src="form.cover_image" :ratio="16 / 9" class="rounded-borders">
            <template #error>
              <div class="absolute-full flex flex-center bg-grey-2 text-grey-5 text-caption">
                URL inválida
              </div>
            </template>
          </q-img>
        </q-card>
      </div>
    </div>

    <!-- ── AI Generation Dialog ── -->
    <q-dialog v-model="aiDialog" persistent>
      <q-card style="min-width: 480px; max-width: 560px">
        <!-- Header -->
        <q-card-section class="row items-center q-pb-none">
          <q-avatar color="purple-7" text-color="white" icon="auto_awesome" />
          <div class="q-ml-md">
            <div class="text-h6 text-weight-bold">Gerar Post com IA</div>
            <div class="text-caption text-grey-6">Claude vai criar o post completo para você</div>
          </div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup :disable="aiLoading" />
        </q-card-section>

        <q-card-section class="q-pt-lg">
          <q-input
            v-model="aiTopic"
            label="Tema do post *"
            outlined
            placeholder='Ex: "Como automatizar relatórios no Excel com Power Automate"'
            autofocus
            :disable="aiLoading"
            hint="Seja específico — quanto mais detalhes, melhor o resultado"
            class="q-mb-md"
          />

          <q-select
            v-model="aiTone"
            label="Tom do conteúdo"
            outlined
            :options="toneOptions"
            emit-value
            map-options
            :disable="aiLoading"
          />
        </q-card-section>

        <!-- Loading state -->
        <q-card-section v-if="aiLoading" class="text-center q-py-lg">
          <q-spinner-dots color="purple-7" size="48px" />
          <div class="text-subtitle2 text-grey-7 q-mt-md">Gerando conteúdo...</div>
          <div class="text-caption text-grey-5">Isso pode levar alguns segundos</div>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat label="Cancelar" v-close-popup :disable="aiLoading" />
          <q-btn
            unelevated
            color="purple-7"
            icon="auto_awesome"
            label="Gerar Post"
            :loading="aiLoading"
            :disable="!aiTopic.trim()"
            @click="generateWithAI"
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
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { getAuthToken } from 'src/composables/useAuthToken'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()

const isEdit = computed(() => !!route.params.id)
const saving = ref(false)
const errorMsg = ref('')

const form = ref({
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  cover_image: '',
  category: '',
  tags: [],
  author: 'RPA Simplificado',
  published: false,
})

// ── AI ──
const aiDialog = ref(false)
const aiLoading = ref(false)
const aiTopic = ref('')
const aiTone = ref('profissional e didático')

const toneOptions = [
  { label: 'Profissional e didático', value: 'profissional e didático' },
  { label: 'Técnico e detalhado', value: 'técnico e detalhado, voltado a desenvolvedores' },
  { label: 'Simples e acessível', value: 'simples e acessível, sem jargões técnicos' },
  { label: 'Comercial e persuasivo', value: 'comercial e persuasivo, focado em benefícios de negócio' },
]

async function generateWithAI() {
  if (!aiTopic.value.trim()) return
  aiLoading.value = true

  try {
    const { supabase } = await import('boot/supabase')
    const { data, error } = await supabase.functions.invoke('generate-post', {
      body: { topic: aiTopic.value.trim(), tone: aiTone.value },
    })

    if (error) throw new Error(error.message)

    // Populate form with AI result
    form.value.title = data.title || ''
    form.value.slug = data.slug || ''
    form.value.excerpt = data.excerpt || ''
    form.value.category = data.category || ''
    form.value.tags = data.tags || []
    form.value.content = data.content || ''

    aiDialog.value = false
    aiTopic.value = ''

    $q.notify({
      type: 'positive',
      message: 'Post gerado com sucesso! Revise antes de publicar.',
      timeout: 4000,
    })
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: `Erro ao gerar: ${err.message}`,
    })
  } finally {
    aiLoading.value = false
  }
}

// ── Form ──
const categoryOptions = [
  'RPA', 'Automação', 'Power Automate', 'UiPath',
  'Python', 'Tutoriais', 'Cases', 'Gestão', 'ESG', 'Tendências', 'Boas Práticas',
]

const quillToolbar = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  ['blockquote', 'code-block'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ indent: '-1' }, { indent: '+1' }],
  ['link', 'image'],
  ['clean'],
]

function autoSlug(val) {
  if (!isEdit.value) {
    form.value.slug = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
  }
}

async function save(publish) {
  if (!form.value.title || !form.value.slug) {
    errorMsg.value = 'Título e slug são obrigatórios.'
    return
  }
  errorMsg.value = ''
  saving.value = true

  const payload = { ...form.value, published: publish, updated_at: new Date().toISOString() }

  try {
    const token = await getAuthToken()
    const headers = { Authorization: `Bearer ${token}` }
    if (isEdit.value) {
      await axios.put(`${API}/api/admin/posts/${route.params.id}`, payload, { headers })
    } else {
      await axios.post(`${API}/api/admin/posts`, payload, { headers })
    }
    $q.notify({ type: 'positive', message: publish ? 'Post publicado!' : 'Rascunho salvo.' })
    router.push('/admin/posts')
  } catch (e) {
    errorMsg.value = e.response?.data?.error || 'Erro ao salvar post'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  if (isEdit.value) {
    try {
      const token = await getAuthToken()
      const { data } = await axios.get(`${API}/api/admin/posts/${route.params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (data) form.value = { ...form.value, ...data }
    } catch { /* ignore */ }
  }
})
</script>
