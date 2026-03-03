<template>
  <q-page class="dashboard-page">

    <!-- Hero -->
    <div class="dashboard-hero">
      <div class="dash-container">
        <div class="hero-greeting">
          Olá, <span class="hero-name">{{ authStore.user?.user_metadata?.full_name?.split(' ')[0] || 'Aluno' }}</span>
        </div>
        <p class="hero-sub">Continue de onde parou. Seu próximo nível está a uma aula de distância.</p>

        <q-banner
          v-if="successMsg"
          rounded
          dense
          class="success-banner q-mt-lg"
        >
          <template #avatar><q-icon name="check_circle" color="positive" size="20px" /></template>
          <span class="text-weight-bold text-positive">{{ successMsg }}</span>
        </q-banner>
      </div>
    </div>

    <!-- Body -->
    <div class="dash-container dash-body">

      <!-- Loading -->
      <div v-if="loading" class="row q-col-gutter-lg">
        <div v-for="n in 3" :key="n" class="col-12 col-sm-6 col-md-4">
          <q-card flat bordered class="skeleton-card">
            <q-skeleton height="168px" square />
            <q-card-section>
              <q-skeleton type="text" width="80%" class="q-mb-xs" />
              <q-skeleton type="text" width="50%" />
              <q-skeleton type="QLinearProgress" class="q-mt-lg" />
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Empty -->
      <div v-else-if="enrollments.length === 0" class="empty-state">
        <div class="empty-ring">
          <q-icon name="school" size="36px" color="primary" />
        </div>
        <h3 class="empty-title">Nenhum curso ainda</h3>
        <p class="empty-desc">Explore nosso catálogo e dê o primeiro passo na automação RPA</p>
        <q-btn
          unelevated
          color="primary"
          label="Explorar Cursos"
          icon="explore"
          to="/cursos"
          no-caps
          class="empty-btn"
        />
      </div>

      <!-- Grid -->
      <template v-else>
        <div class="section-header">
          <span class="section-title">Meus Cursos</span>
          <q-chip dense color="primary" text-color="white" size="sm">
            {{ enrollments.length }}
          </q-chip>
        </div>

        <div class="row q-col-gutter-lg">
          <div
            v-for="enrollment in enrollments"
            :key="enrollment.id"
            class="col-12 col-sm-6 col-md-4"
          >
            <q-card
              flat
              class="course-card"
              @click="$router.push(`/minha-area/cursos/${enrollment.courses?.slug}`)"
            >
              <!-- Thumb -->
              <div class="thumb-wrap">
                <q-img
                  :src="enrollment.courses?.thumbnail || '/rpa_simplificado_thumb.png'"
                  height="168px"
                  fit="cover"
                  class="course-thumb"
                />
                <div v-if="enrollment.courses?.level" class="level-badge">
                  {{ enrollment.courses.level }}
                </div>
                <div v-if="getProgress(enrollment.courses?.slug) === 100" class="completed-badge">
                  <q-icon name="verified" size="14px" />
                  Concluído
                </div>
              </div>

              <!-- Info -->
              <q-card-section class="course-info q-pb-sm">
                <div class="course-category">{{ enrollment.courses?.category }}</div>
                <div class="course-title">{{ enrollment.courses?.title }}</div>

                <div class="progress-area q-mt-md">
                  <div class="progress-row">
                    <span class="progress-label">Progresso</span>
                    <span class="progress-pct">{{ getProgress(enrollment.courses?.slug) }}%</span>
                  </div>
                  <q-linear-progress
                    :value="getProgress(enrollment.courses?.slug) / 100"
                    color="accent"
                    track-color="grey-2"
                    rounded
                    size="5px"
                    class="q-mt-xs"
                  />
                </div>
              </q-card-section>

              <q-card-actions class="q-px-md q-pb-md q-pt-xs">
                <q-btn
                  unelevated
                  :color="getProgress(enrollment.courses?.slug) > 0 ? 'primary' : 'accent'"
                  :label="getProgress(enrollment.courses?.slug) > 0 ? 'Continuar' : 'Começar'"
                  :icon="getProgress(enrollment.courses?.slug) > 0 ? 'play_arrow' : 'play_circle_outline'"
                  class="full-width action-btn"
                  no-caps
                  :to="`/minha-area/cursos/${enrollment.courses?.slug}`"
                  @click.stop
                />
              </q-card-actions>
            </q-card>
          </div>
        </div>

        <div class="explore-row q-mt-xl">
          <q-btn
            flat
            no-caps
            color="primary"
            icon-right="arrow_forward"
            label="Explorar mais cursos"
            to="/cursos"
            class="explore-link"
          />
        </div>
      </template>

    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from 'stores/authStore'
import { getAuthToken } from 'src/composables/useAuthToken'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const authStore = useAuthStore()
const route = useRoute()

const loading = ref(true)
const enrollments = ref([])
const progressMap = ref({})
const successMsg = ref('')

function getProgress(slug) {
  return progressMap.value[slug] ?? 0
}

async function fetchData() {
  loading.value = true
  try {
    const token = await getAuthToken()
    if (!token) return

    const headers = { Authorization: `Bearer ${token}` }
    const { data } = await axios.get(`${API}/api/me/enrollments`, { headers })
    enrollments.value = data

    await Promise.all(
      data.map(async (e) => {
        try {
          const slug = e.courses?.slug
          if (!slug) return
          const { data: prog } = await axios.get(`${API}/api/me/courses/${slug}/progress`, { headers })
          progressMap.value[slug] = prog.progress_percent
        } catch {
          // ignore
        }
      }),
    )
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (route.query.success) {
    successMsg.value = 'Pagamento confirmado! Seu acesso já está disponível.'
  }
  fetchData()
})
</script>

<style scoped>
.dashboard-page {
  background: #f8fafc;
  min-height: 100vh;
}

/* Hero */
.dashboard-hero {
  background: linear-gradient(135deg, #034894 0%, #0560c9 60%, #0471f0 100%);
  padding: 40px 0 48px;
  position: relative;
  overflow: hidden;
}
.dashboard-hero::after {
  content: '';
  position: absolute;
  right: -60px;
  top: -60px;
  width: 320px;
  height: 320px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.04);
  pointer-events: none;
}

.dash-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px;
}

.hero-greeting {
  font-size: 28px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.2;
}

.hero-name {
  color: #fff;
  font-size: 32px;
}

.hero-sub {
  color: rgba(255, 255, 255, 0.55);
  font-size: 14px;
  margin: 8px 0 0;
  font-weight: 400;
}

.success-banner {
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  border-radius: 10px;
}

/* Body */
.dash-body {
  padding-top: 36px;
  padding-bottom: 60px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.01em;
}

/* Cards */
.course-card {
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  background: #fff;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  overflow: hidden;
}
.course-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(3, 72, 148, 0.1);
  border-color: #bfdbfe;
}

.thumb-wrap {
  position: relative;
  overflow: hidden;
}

.course-thumb {
  transition: transform 0.3s ease;
}
.course-card:hover .course-thumb {
  transform: scale(1.03);
}

.level-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(3, 72, 148, 0.85);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 3px 8px;
  border-radius: 20px;
  backdrop-filter: blur(4px);
}

.completed-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(22, 163, 74, 0.9);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 3px;
}

.course-info {
  padding: 14px 16px 8px;
}

.course-category {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #6b7280;
  margin-bottom: 4px;
}

.course-title {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.progress-area {
  padding-top: 2px;
}

.progress-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-label {
  font-size: 11px;
  color: #9ca3af;
  font-weight: 500;
}

.progress-pct {
  font-size: 11px;
  font-weight: 700;
  color: #374151;
}

.action-btn {
  border-radius: 8px;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.02em;
}

.skeleton-card {
  border-radius: 14px;
  overflow: hidden;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-ring {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(3, 72, 148, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  border: 2px dashed rgba(3, 72, 148, 0.15);
}

.empty-title {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px;
}

.empty-desc {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 24px;
}

.empty-btn {
  border-radius: 10px;
  font-weight: 700;
  font-size: 14px;
  padding: 10px 28px;
}

/* Explore link */
.explore-row {
  display: flex;
  justify-content: center;
}

.explore-link {
  font-size: 14px;
  font-weight: 600;
  opacity: 0.7;
  transition: opacity 0.2s;
}
.explore-link:hover { opacity: 1; }
</style>
