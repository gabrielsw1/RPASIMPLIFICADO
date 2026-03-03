<template>
  <q-page class="q-pa-lg admin-page">

    <!-- Header -->
    <div class="row items-center q-mb-lg">
      <div>
        <div class="text-h5 text-weight-bold text-grey-9">Dashboard</div>
        <div class="text-caption text-grey-6">Última atualização: {{ lastUpdated }}</div>
      </div>
      <q-space />
      <q-btn outline color="primary" icon="refresh" label="Atualizar" @click="fetchDashboard" :loading="loading" />
    </div>

    <!-- Skeleton while loading -->
    <template v-if="loading">
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12 col-sm-6 col-md-3" v-for="i in 4" :key="i">
          <q-card flat bordered><q-card-section><q-skeleton type="rect" height="80px" /></q-card-section></q-card>
        </div>
      </div>
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-8">
          <q-card flat bordered><q-card-section><q-skeleton type="rect" height="260px" /></q-card-section></q-card>
        </div>
        <div class="col-12 col-md-4">
          <q-card flat bordered><q-card-section><q-skeleton type="rect" height="260px" /></q-card-section></q-card>
        </div>
      </div>
    </template>

    <template v-else>

      <!-- KPI Cards -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="kpi-card">
            <q-card-section>
              <div class="row items-center no-wrap">
                <div class="kpi-icon-wrap bg-blue-1">
                  <q-icon name="school" color="primary" size="24px" />
                </div>
                <div class="q-ml-md">
                  <div class="text-h4 text-weight-bold text-primary">{{ data.overview.total_students }}</div>
                  <div class="text-caption text-grey-6">Alunos cadastrados</div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="kpi-card">
            <q-card-section>
              <div class="row items-center no-wrap">
                <div class="kpi-icon-wrap bg-green-1">
                  <q-icon name="payments" color="green-7" size="24px" />
                </div>
                <div class="q-ml-md">
                  <div class="text-h4 text-weight-bold text-green-7">{{ formatCurrency(data.overview.total_revenue_estimated) }}</div>
                  <div class="text-caption text-grey-6">Receita estimada</div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="kpi-card">
            <q-card-section>
              <div class="row items-center no-wrap">
                <div class="kpi-icon-wrap bg-orange-1">
                  <q-icon name="play_circle" color="orange-7" size="24px" />
                </div>
                <div class="q-ml-md">
                  <div class="text-h4 text-weight-bold text-orange-7">{{ data.overview.total_courses_published }}</div>
                  <div class="text-caption text-grey-6">Cursos ativos</div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="kpi-card">
            <q-card-section>
              <div class="row items-center no-wrap">
                <div class="kpi-icon-wrap bg-purple-1">
                  <q-icon name="article" color="purple-7" size="24px" />
                </div>
                <div class="q-ml-md">
                  <div class="text-h4 text-weight-bold text-purple-7">{{ data.overview.total_posts_published }}</div>
                  <div class="text-caption text-grey-6">Posts publicados</div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Charts row 1: area + donut -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12 col-md-8">
          <q-card flat bordered>
            <q-card-section class="q-pb-none">
              <div class="text-subtitle1 text-weight-bold text-grey-8">Matrículas por Mês</div>
              <div class="text-caption text-grey-5">Últimos 6 meses</div>
            </q-card-section>
            <q-card-section>
              <apexchart type="area" height="220" :options="monthChartOptions" :series="monthSeries" />
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-4">
          <q-card flat bordered style="height: 100%">
            <q-card-section class="q-pb-none">
              <div class="text-subtitle1 text-weight-bold text-grey-8">Gratuito vs Pago</div>
              <div class="text-caption text-grey-5">Distribuição de matrículas</div>
            </q-card-section>
            <q-card-section class="flex flex-center">
              <apexchart
                v-if="typeSeries.length"
                type="donut"
                height="220"
                :options="typeChartOptions"
                :series="typeSeries"
              />
              <div v-else class="text-grey-4 text-caption text-center q-py-xl">Sem matrículas ainda</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Chart row 2: horizontal bar -->
      <div class="row q-col-gutter-md q-mb-lg" v-if="data.enrollments_by_course.length">
        <div class="col-12">
          <q-card flat bordered>
            <q-card-section class="q-pb-none">
              <div class="text-subtitle1 text-weight-bold text-grey-8">Matrículas por Curso</div>
            </q-card-section>
            <q-card-section>
              <apexchart
                type="bar"
                :height="Math.max(160, data.enrollments_by_course.length * 44)"
                :options="courseChartOptions"
                :series="courseSeries"
              />
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Row 3: suporte + atividade recente -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12 col-md-6">
          <q-card flat bordered style="height: 100%">
            <q-card-section class="q-pb-none">
              <div class="text-subtitle1 text-weight-bold text-grey-8">Suporte</div>
            </q-card-section>
            <q-card-section>
              <div class="row q-col-gutter-md q-mb-md">
                <div class="col-4 text-center" v-for="s in helpStats" :key="s.status">
                  <div class="text-h5 text-weight-bold" :class="s.color">{{ s.count }}</div>
                  <div class="text-caption text-grey-6">{{ s.label }}</div>
                </div>
              </div>
              <apexchart
                v-if="helpSeries.some(v => v > 0)"
                type="donut"
                height="180"
                :options="helpChartOptions"
                :series="helpSeries"
              />
              <div v-else class="text-grey-4 text-caption text-center q-py-md">Nenhum pedido de ajuda ainda</div>
              <div class="text-center q-mt-sm text-caption text-grey-6">
                Tempo médio de resposta: <strong>{{ data.avg_response_hours }}h</strong>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-6">
          <q-card flat bordered style="height: 100%">
            <q-card-section class="q-pb-none">
              <div class="text-subtitle1 text-weight-bold text-grey-8">Atividade Recente</div>
              <div class="text-caption text-grey-5">Últimas matrículas</div>
            </q-card-section>
            <q-list separator>
              <q-item v-if="!data.recent_enrollments.length" class="q-py-lg">
                <q-item-section class="text-grey-4 text-caption text-center">Nenhuma matrícula ainda</q-item-section>
              </q-item>
              <q-item v-for="(e, i) in data.recent_enrollments" :key="i" class="q-py-sm">
                <q-item-section avatar>
                  <q-avatar
                    size="36px"
                    :color="e.payment_method === 'stripe' ? 'primary' : 'green-6'"
                    text-color="white"
                    style="font-size: 14px; font-weight: 700"
                  >
                    {{ e.student_name.charAt(0).toUpperCase() }}
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ e.student_name }}</q-item-label>
                  <q-item-label caption>{{ e.course_title }}</q-item-label>
                </q-item-section>
                <q-item-section side class="items-end">
                  <q-badge
                    :color="e.payment_method === 'stripe' ? 'primary' : 'green-6'"
                    :label="e.payment_method === 'stripe' ? 'Pago' : 'Gratuito'"
                    rounded
                  />
                  <div class="text-caption text-grey-5 q-mt-xs">{{ formatDate(e.enrolled_at) }}</div>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </div>
      </div>

      <!-- Row 4: plataforma + divulgação -->
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-6">
          <q-card flat bordered>
            <q-card-section class="q-pb-sm">
              <div class="row items-center">
                <div class="text-subtitle1 text-weight-bold text-grey-8">Status da Plataforma</div>
                <q-space />
                <q-btn flat dense size="sm" color="primary" label="Configurações" icon-right="arrow_forward" to="/admin/configuracoes" />
              </div>
            </q-card-section>
            <q-card-section class="row q-col-gutter-sm q-pt-none">
              <div class="col-6" v-for="s in platformItems" :key="s.label">
                <div class="platform-status-item" :class="s.enabled ? 'status-on' : 'status-off'">
                  <q-icon :name="s.enabled ? 'check_circle' : 'cancel'" :color="s.enabled ? 'green-6' : 'red-5'" size="18px" />
                  <span class="q-ml-xs text-caption text-weight-medium">{{ s.label }}</span>
                  <q-badge :color="s.enabled ? 'green-6' : 'red-5'" :label="s.badge" class="q-ml-auto" rounded />
                </div>
              </div>
            </q-card-section>
            <q-card-section v-if="data.platform_status.maintenance_message" class="q-pt-none">
              <q-banner class="bg-amber-1 text-amber-9 rounded-borders" dense>
                <template #avatar><q-icon name="warning" color="amber-7" /></template>
                {{ data.platform_status.maintenance_message }}
              </q-banner>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-6">
          <q-card flat bordered>
            <q-card-section class="q-pb-sm">
              <div class="text-subtitle1 text-weight-bold text-grey-8">Divulgação & Tração</div>
              <div class="text-caption text-grey-5">Proxies de crescimento disponíveis na plataforma</div>
            </q-card-section>
            <q-card-section class="q-pt-none">
              <div class="row q-col-gutter-md">
                <div class="col-6">
                  <div class="traction-item">
                    <div class="text-caption text-grey-6 q-mb-xs">Taxa de Conversão</div>
                    <div class="text-h5 text-weight-bold text-primary">{{ conversionRate }}%</div>
                    <div class="text-caption text-grey-5">Gratuito → Pago</div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="traction-item">
                    <div class="text-caption text-grey-6 q-mb-xs">Crescimento M/M</div>
                    <div class="text-h5 text-weight-bold" :class="momGrowth >= 0 ? 'text-green-7' : 'text-red-5'">
                      {{ momGrowth >= 0 ? '+' : '' }}{{ momGrowth }}%
                    </div>
                    <div class="text-caption text-grey-5">vs mês anterior</div>
                  </div>
                </div>
                <div class="col-12" v-if="topCourse">
                  <div class="traction-item">
                    <div class="text-caption text-grey-6 q-mb-xs">Curso mais popular</div>
                    <div class="text-weight-bold text-grey-9 ellipsis">{{ topCourse.title }}</div>
                    <div class="text-caption text-grey-5">{{ topCourse.count }} matrícula(s)</div>
                  </div>
                </div>
              </div>
            </q-card-section>
            <q-separator />
            <q-item clickable tag="a" href="https://analytics.google.com" target="_blank" class="text-caption">
              <q-item-section avatar><q-icon name="bar_chart" color="blue-5" size="18px" /></q-item-section>
              <q-item-section class="text-blue-7">Conecte o Google Analytics para dados de tráfego reais</q-item-section>
              <q-item-section side><q-icon name="open_in_new" size="14px" color="blue-5" /></q-item-section>
            </q-item>
          </q-card>
        </div>
      </div>

    </template>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { getAuthToken } from 'src/composables/useAuthToken'
import axios from 'axios'
import VueApexCharts from 'vue3-apexcharts'

const apexchart = VueApexCharts

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const $q = useQuasar()

const loading = ref(true)
const lastUpdated = ref('—')

const emptyData = {
  overview: {
    total_students: 0,
    total_revenue_estimated: 0,
    total_courses_published: 0,
    total_posts_published: 0,
    pending_help_requests: 0,
    unseen_comments: 0,
  },
  enrollments_by_month: [],
  enrollments_by_type: [],
  enrollments_by_course: [],
  help_by_status: [],
  blog_stats: { total: 0, published: 0, draft: 0, this_month: 0 },
  course_stats: { total: 0, published: 0, total_modules: 0, total_lessons: 0 },
  recent_enrollments: [],
  platform_status: { courses_enabled: true, blog_enabled: true, login_enabled: true, maintenance_message: '' },
  avg_response_hours: 0,
}

const data = ref({ ...emptyData })

// --- Chart: Matrículas por Mês ---
const monthChartOptions = computed(() => ({
  chart: { id: 'enrollments-month', toolbar: { show: false } },
  colors: ['#034894'],
  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05 } },
  stroke: { curve: 'smooth', width: 2 },
  xaxis: {
    categories: data.value.enrollments_by_month.map((m) => m.label),
    labels: { style: { fontSize: '12px' } },
  },
  yaxis: { min: 0, labels: { formatter: (v) => Math.round(v) } },
  dataLabels: { enabled: false },
  grid: { borderColor: '#f0f0f0' },
  tooltip: { y: { formatter: (v) => `${v} matrícula(s)` } },
}))

const monthSeries = computed(() => [
  { name: 'Matrículas', data: data.value.enrollments_by_month.map((m) => m.count) },
])

// --- Chart: Gratuito vs Pago ---
const typeChartOptions = computed(() => ({
  chart: { type: 'donut' },
  colors: ['#22c55e', '#034894'],
  labels: data.value.enrollments_by_type.map((t) => t.label),
  legend: { position: 'bottom', fontSize: '12px' },
  dataLabels: { enabled: true, formatter: (val) => `${Math.round(val)}%` },
  plotOptions: { pie: { donut: { size: '65%' } } },
}))

const typeSeries = computed(() => data.value.enrollments_by_type.map((t) => t.count))

// --- Chart: Matrículas por Curso ---
const courseChartOptions = computed(() => ({
  chart: { type: 'bar', toolbar: { show: false } },
  colors: ['#034894'],
  plotOptions: { bar: { horizontal: true, borderRadius: 4 } },
  xaxis: {
    categories: data.value.enrollments_by_course.map((c) => c.title),
    labels: { style: { fontSize: '12px' }, formatter: (v) => Math.round(v) },
  },
  dataLabels: { enabled: false },
  grid: { borderColor: '#f0f0f0' },
  tooltip: { y: { formatter: (v) => `${v} matrícula(s)` } },
}))

const courseSeries = computed(() => [
  { name: 'Matrículas', data: data.value.enrollments_by_course.map((c) => c.count) },
])

// --- Chart: Suporte por Status ---
const helpChartOptions = computed(() => ({
  chart: { type: 'donut' },
  colors: ['#ef4444', '#f59e0b', '#22c55e'],
  labels: ['Pendente', 'Em Andamento', 'Resolvido'],
  legend: { position: 'bottom', fontSize: '11px' },
  dataLabels: { enabled: false },
  plotOptions: { pie: { donut: { size: '60%' } } },
}))

const helpSeries = computed(() => {
  const s = data.value.help_by_status
  const get = (status) => s.find((h) => h.status === status)?.count || 0
  return [get('pending'), get('in_progress'), get('resolved')]
})

const helpStats = computed(() => {
  const s = data.value.help_by_status
  const get = (status) => s.find((h) => h.status === status)?.count || 0
  return [
    { status: 'pending', label: 'Pendente', count: get('pending'), color: 'text-red-5' },
    { status: 'in_progress', label: 'Em Andamento', count: get('in_progress'), color: 'text-amber-7' },
    { status: 'resolved', label: 'Resolvido', count: get('resolved'), color: 'text-green-6' },
  ]
})

// --- Platform status ---
const platformItems = computed(() => {
  const p = data.value.platform_status
  const maintenanceOn = !!p.maintenance_message
  return [
    { label: 'Cursos', enabled: p.courses_enabled, badge: p.courses_enabled ? 'ATIVO' : 'INATIVO' },
    { label: 'Blog', enabled: p.blog_enabled, badge: p.blog_enabled ? 'ATIVO' : 'INATIVO' },
    { label: 'Login', enabled: p.login_enabled, badge: p.login_enabled ? 'ATIVO' : 'INATIVO' },
    { label: 'Manutenção', enabled: !maintenanceOn, badge: maintenanceOn ? 'ATIVA' : 'OFF' },
  ]
})

// --- Divulgação ---
const conversionRate = computed(() => {
  const types = data.value.enrollments_by_type
  const paid = types.find((t) => t.type === 'stripe')?.count || 0
  const total = types.reduce((s, t) => s + t.count, 0)
  if (!total) return '0.0'
  return ((paid / total) * 100).toFixed(1)
})

const momGrowth = computed(() => {
  const months = data.value.enrollments_by_month
  if (months.length < 2) return 0
  const prev = months[months.length - 2].count
  const curr = months[months.length - 1].count
  if (prev === 0) return curr > 0 ? 100 : 0
  return Math.round(((curr - prev) / prev) * 100)
})

const topCourse = computed(() => {
  if (!data.value.enrollments_by_course.length) return null
  return data.value.enrollments_by_course[0]
})

// --- Utils ---
function formatCurrency(v) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('pt-BR')
}

// --- Data fetch ---
async function fetchDashboard() {
  loading.value = true
  try {
    const token = await getAuthToken()
    const { data: res } = await axios.get(`${API}/api/admin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    data.value = res
    lastUpdated.value = new Date().toLocaleTimeString('pt-BR')
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao carregar dashboard' })
  } finally {
    loading.value = false
  }
}

onMounted(fetchDashboard)
</script>

<style scoped>
.kpi-card {
  transition: box-shadow 0.2s;
}
.kpi-card:hover {
  box-shadow: 0 4px 16px rgba(3, 72, 148, 0.1);
}
.kpi-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.platform-status-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  font-size: 13px;
}
.status-on {
  background: #f0fdf4;
  border-color: #bbf7d0;
}
.status-off {
  background: #fef2f2;
  border-color: #fecaca;
}
.traction-item {
  padding: 10px 12px;
  background: #f8faff;
  border-radius: 8px;
  border: 1px solid #e8f0fe;
}
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
