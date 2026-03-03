<template>
  <q-page v-if="course" class="course-detail-page">
    <!-- Hero do curso -->
    <section class="course-hero q-py-xl">
      <div class="container q-px-md">
        <div class="row q-col-gutter-xl items-center">
          <!-- Info -->
          <div class="col-12 col-md-7">
            <q-breadcrumbs class="q-mb-md">
              <q-breadcrumbs-el label="Cursos" to="/cursos" />
              <q-breadcrumbs-el :label="course.title" />
            </q-breadcrumbs>

            <div class="row q-gutter-xs q-mb-md">
              <q-chip v-if="course.level" color="blue-1" text-color="primary" :label="levelLabel(course.level)" dense />
              <q-chip v-if="course.category" color="grey-2" text-color="grey-8" :label="course.category" dense />
              <q-chip v-for="tag in (course.tags || [])" :key="tag" color="grey-1" text-color="grey-7" :label="tag" dense />
            </div>

            <h1 class="text-h3 text-weight-bold text-primary q-mb-md">{{ course.title }}</h1>
            <p class="text-body1 text-grey-7 q-mb-xl">{{ course.description }}</p>

            <!-- Stats -->
            <div class="row q-gutter-lg q-mb-xl">
              <div class="stat-item">
                <q-icon name="menu_book" color="accent" size="24px" />
                <div class="text-h6 text-weight-bold">{{ moduleCount }}</div>
                <div class="text-caption text-grey-6">Módulos</div>
              </div>
              <div class="stat-item">
                <q-icon name="play_circle" color="accent" size="24px" />
                <div class="text-h6 text-weight-bold">{{ lessonCount }}</div>
                <div class="text-caption text-grey-6">Aulas</div>
              </div>
              <div class="stat-item">
                <q-icon name="access_time" color="accent" size="24px" />
                <div class="text-h6 text-weight-bold">{{ totalDuration }}</div>
                <div class="text-caption text-grey-6">Duração</div>
              </div>
            </div>

            <!-- CTA -->
            <div v-if="course.enrolled">
              <q-btn unelevated color="positive" label="Continuar Curso" icon="play_arrow" size="lg" class="text-weight-bold q-px-xl" :to="`/minha-area/cursos/${course.slug}`" />
            </div>
            <div v-else-if="course.is_free">
              <q-btn
                unelevated
                color="positive"
                label="Matricular-se Gratuitamente"
                icon="school"
                size="lg"
                class="text-weight-bold q-px-xl"
                :loading="enrolling"
                @click="enrollFree"
              />
            </div>
            <div v-else>
              <div class="text-h4 text-weight-bold text-accent q-mb-md">
                R$ {{ Number(course.price).toFixed(2) }}
              </div>
              <q-btn
                unelevated
                color="accent"
                label="Comprar Agora"
                icon="payment"
                size="lg"
                class="text-weight-bold q-px-xl"
                :loading="enrolling"
                @click="checkout"
              />
            </div>
          </div>

          <!-- Thumbnail -->
          <div class="col-12 col-md-5">
            <q-img
              :src="course.thumbnail || '/rpa_simplificado_thumb.png'"
              class="course-thumbnail-img"
              fit="cover"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Conteúdo do curso -->
    <section class="q-py-xl bg-grey-1">
      <div class="container q-px-md">
        <div class="row q-col-gutter-xl">
          <!-- Módulos e aulas -->
          <div class="col-12 col-md-8">
            <h2 class="text-h5 text-weight-bold text-primary q-mb-lg">Conteúdo do Curso</h2>

            <q-expansion-item
              v-for="mod in course.modules"
              :key="mod.id"
              :label="mod.title"
              :caption="`${mod.lessons?.length || 0} aulas`"
              icon="folder"
              class="q-mb-sm course-module"
              default-opened
              header-class="text-weight-bold text-primary"
            >
              <q-list separator>
                <q-item
                  v-for="lesson in mod.lessons"
                  :key="lesson.id"
                  class="lesson-item"
                >
                  <q-item-section avatar>
                    <q-icon
                      :name="lesson.is_preview ? 'play_circle' : 'lock'"
                      :color="lesson.is_preview ? 'accent' : 'grey-5'"
                      size="20px"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-medium">{{ lesson.title }}</q-item-label>
                    <q-item-label caption v-if="lesson.description">{{ lesson.description }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <div class="row items-center q-gutter-xs">
                      <q-chip v-if="lesson.is_preview" dense color="positive" text-color="white" label="Preview" />
                      <span v-if="lesson.duration_seconds" class="text-caption text-grey-6">
                        {{ formatDuration(lesson.duration_seconds) }}
                      </span>
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-expansion-item>

            <!-- Descrição completa -->
            <div v-if="course.full_description" class="q-mt-xl">
              <h2 class="text-h5 text-weight-bold text-primary q-mb-md">Sobre o Curso</h2>
              <div class="text-body1 text-grey-8" v-html="course.full_description" />
            </div>
          </div>

          <!-- Sidebar -->
          <div class="col-12 col-md-4">
            <q-card flat bordered class="sticky-card">
              <q-card-section>
                <div class="text-h5 text-weight-bold text-primary q-mb-sm">
                  <span v-if="course.is_free" class="text-positive">Gratuito</span>
                  <span v-else>R$ {{ Number(course.price).toFixed(2) }}</span>
                </div>

                <q-list dense class="q-mb-lg">
                  <q-item>
                    <q-item-section avatar><q-icon name="menu_book" color="primary" /></q-item-section>
                    <q-item-section>{{ moduleCount }} módulos</q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section avatar><q-icon name="play_circle" color="primary" /></q-item-section>
                    <q-item-section>{{ lessonCount }} aulas</q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section avatar><q-icon name="access_time" color="primary" /></q-item-section>
                    <q-item-section>{{ totalDuration }} de conteúdo</q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section avatar><q-icon name="signal_cellular_alt" color="primary" /></q-item-section>
                    <q-item-section>{{ levelLabel(course.level) }}</q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section avatar><q-icon name="all_inclusive" color="primary" /></q-item-section>
                    <q-item-section>Acesso vitalício</q-item-section>
                  </q-item>
                </q-list>

                <div v-if="course.enrolled">
                  <q-btn unelevated color="positive" label="Continuar Curso" icon="play_arrow" class="full-width text-weight-bold" :to="`/minha-area/cursos/${course.slug}`" />
                </div>
                <div v-else-if="course.is_free">
                  <q-btn unelevated color="positive" label="Matricular Grátis" icon="school" class="full-width text-weight-bold" :loading="enrolling" @click="enrollFree" />
                </div>
                <div v-else>
                  <q-btn unelevated color="accent" label="Comprar Agora" icon="payment" class="full-width text-weight-bold" :loading="enrolling" @click="checkout" />
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </section>
  </q-page>

  <!-- Loading state -->
  <q-page v-else-if="loading" class="flex flex-center">
    <q-spinner color="primary" size="48px" />
  </q-page>

  <!-- Not found -->
  <q-page v-else class="flex flex-center">
    <div class="text-center">
      <q-icon name="school" size="64px" color="grey-4" />
      <p class="text-h6 text-grey-6 q-mt-md">Curso não encontrado</p>
      <q-btn flat color="primary" label="Ver todos os cursos" to="/cursos" />
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'stores/authStore'
import { getAuthToken } from 'src/composables/useAuthToken'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()

const course = ref(null)
const loading = ref(true)
const enrolling = ref(false)

const moduleCount = computed(() => course.value?.modules?.length ?? 0)
const lessonCount = computed(() => course.value?.modules?.reduce((acc, m) => acc + (m.lessons?.length ?? 0), 0) ?? 0)
const totalDuration = computed(() => {
  const secs = course.value?.modules?.reduce((acc, m) => acc + m.lessons?.reduce((a, l) => a + (l.duration_seconds ?? 0), 0), 0) ?? 0
  const h = Math.floor(secs / 3600)
  const min = Math.floor((secs % 3600) / 60)
  return h > 0 ? `${h}h ${min}min` : `${min}min`
})

function levelLabel(level) {
  const map = { iniciante: 'Iniciante', intermediario: 'Intermediário', avancado: 'Avançado' }
  return map[level] || level
}

function formatDuration(secs) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

async function fetchCourse() {
  loading.value = true
  try {
    const token = await getAuthToken()
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    const { data } = await axios.get(`${API}/api/courses/${route.params.slug}`, { headers })
    course.value = data
  } catch {
    course.value = null
  } finally {
    loading.value = false
  }
}

async function enrollFree() {
  if (!authStore.user) {
    authStore.pendingReturn = route.fullPath
    router.push('/entrar')
    return
  }
  enrolling.value = true
  try {
    const token = await getAuthToken()
    await axios.post(`${API}/api/courses/${course.value.id}/enroll`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    })
    $q.notify({ type: 'positive', message: 'Matrícula realizada! Bom estudo!' })
    router.push(`/minha-area/cursos/${course.value.slug}`)
  } catch (e) {
    $q.notify({ type: 'negative', message: e.response?.data?.error || 'Erro ao realizar matrícula' })
  } finally {
    enrolling.value = false
  }
}

async function checkout() {
  if (!authStore.user) {
    authStore.pendingReturn = route.fullPath
    router.push('/entrar')
    return
  }
  enrolling.value = true
  try {
    const token = await getAuthToken()
    const { data } = await axios.post(`${API}/api/courses/${course.value.id}/checkout`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    })
    window.location.href = data.url
  } catch (e) {
    $q.notify({ type: 'negative', message: e.response?.data?.error || 'Erro ao iniciar pagamento' })
    enrolling.value = false
  }
}

onMounted(fetchCourse)
</script>

<style scoped>
.course-hero {
  background: linear-gradient(135deg, #f0f7ff 0%, #e8f4f8 100%);
  border-bottom: 1px solid #e0e8f0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.course-thumbnail-img {
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 80px;
}

.course-module {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.lesson-item {
  background: white;
}

.sticky-card {
  position: sticky;
  top: 80px;
  border-radius: 12px;
}
</style>
