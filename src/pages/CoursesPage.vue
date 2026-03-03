<template>
  <q-page class="courses-page">
    <!-- Hero -->
    <section class="courses-hero q-py-xl text-center">
      <div class="container q-px-md">
        <div class="text-overline text-accent text-weight-bold q-mb-sm">FORMAÇÃO PROFISSIONAL</div>
        <h1 class="text-h3 text-weight-bold text-primary q-mb-md">Cursos de Automação Inteligente</h1>
        <p class="text-body1 text-secondary q-mb-xl" style="max-width: 600px; margin: 0 auto">
          Aprenda RPA, IA e Agentic Automation com quem atua no mercado. Cursos práticos, objetivos e aplicados à realidade brasileira.
        </p>

        <!-- Filtros -->
        <div class="row q-gutter-sm justify-center q-mb-lg">
          <q-select
            v-model="filters.category"
            :options="categoryOptions"
            label="Categoria"
            clearable
            dense
            outlined
            style="min-width: 180px"
            bg-color="white"
          />
          <q-select
            v-model="filters.level"
            :options="levelOptions"
            label="Nível"
            clearable
            dense
            outlined
            style="min-width: 160px"
            bg-color="white"
          />
          <q-input
            v-model="filters.search"
            label="Buscar curso"
            clearable
            dense
            outlined
            style="min-width: 220px"
            bg-color="white"
          >
            <template #append><q-icon name="search" /></template>
          </q-input>
        </div>
      </div>
    </section>

    <!-- Lista de cursos -->
    <section class="q-py-xl">
      <div class="container q-px-md">
        <!-- Loading -->
        <div v-if="loading" class="row q-gutter-md">
          <div v-for="n in 6" :key="n" class="col-12 col-sm-6 col-md-4">
            <q-card flat bordered>
              <q-skeleton height="200px" />
              <q-card-section>
                <q-skeleton type="text" width="60%" />
                <q-skeleton type="text" class="q-mt-sm" />
                <q-skeleton type="text" width="40%" />
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- Vazio -->
        <div v-else-if="courses.length === 0" class="text-center q-py-xl">
          <q-icon name="school" size="64px" color="grey-4" />
          <p class="text-h6 text-grey-6 q-mt-md">Nenhum curso encontrado</p>
          <q-btn flat color="primary" label="Limpar filtros" @click="clearFilters" />
        </div>

        <!-- Grid de cursos -->
        <div v-else class="row q-col-gutter-lg">
          <div
            v-for="course in courses"
            :key="course.id"
            class="col-12 col-sm-6 col-md-4"
          >
            <q-card class="course-card full-height cursor-pointer hover-lift" flat bordered @click="$router.push(`/cursos/${course.slug}`)">
              <!-- Thumbnail -->
              <div class="course-thumbnail">
                <q-img
                  :src="course.thumbnail || '/rpa_simplificado_thumb.png'"
                  height="200px"
                  fit="cover"
                />
                <q-badge
                  :color="course.is_free ? 'positive' : 'accent'"
                  class="course-price-badge"
                  :label="course.is_free ? 'GRATUITO' : `R$ ${Number(course.price).toFixed(2)}`"
                />
              </div>

              <q-card-section>
                <!-- Chips -->
                <div class="row q-gutter-xs q-mb-sm">
                  <q-chip v-if="course.level" dense color="blue-1" text-color="primary" :label="levelLabel(course.level)" />
                  <q-chip v-if="course.category" dense color="grey-2" text-color="grey-8" :label="course.category" />
                </div>

                <div class="text-h6 text-weight-bold text-primary q-mb-sm ellipsis-2-lines">{{ course.title }}</div>
                <p class="text-body2 text-grey-7 ellipsis-2-lines">{{ course.description }}</p>

                <!-- Stats -->
                <div class="row q-gutter-sm q-mt-md">
                  <div class="row items-center">
                    <q-icon name="menu_book" size="16px" color="grey-6" class="q-mr-xs" />
                    <span class="text-caption text-grey-6">{{ course.module_count }} módulos</span>
                  </div>
                  <div class="row items-center">
                    <q-icon name="play_circle" size="16px" color="grey-6" class="q-mr-xs" />
                    <span class="text-caption text-grey-6">{{ course.lesson_count }} aulas</span>
                  </div>
                </div>
              </q-card-section>

              <q-card-actions class="q-px-md q-pb-md">
                <q-btn
                  unelevated
                  :color="course.is_free ? 'positive' : 'accent'"
                  :label="course.is_free ? 'Acessar Gratuitamente' : 'Ver Detalhes'"
                  class="full-width text-weight-bold"
                  :to="`/cursos/${course.slug}`"
                />
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </div>
    </section>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const loading = ref(true)
const allCourses = ref([])
const filters = ref({ category: null, level: null, search: '' })

const levelOptions = [
  { label: 'Iniciante', value: 'iniciante' },
  { label: 'Intermediário', value: 'intermediario' },
  { label: 'Avançado', value: 'avancado' },
]

const categoryOptions = computed(() => {
  const cats = [...new Set(allCourses.value.map((c) => c.category).filter(Boolean))]
  return cats.map((c) => ({ label: c, value: c }))
})

const courses = computed(() => {
  let list = allCourses.value
  if (filters.value.category) list = list.filter((c) => c.category === filters.value.category?.value)
  if (filters.value.level) list = list.filter((c) => c.level === filters.value.level?.value)
  if (filters.value.search) {
    const q = filters.value.search.toLowerCase()
    list = list.filter((c) => c.title.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q))
  }
  return list
})

function levelLabel(level) {
  const map = { iniciante: 'Iniciante', intermediario: 'Intermediário', avancado: 'Avançado' }
  return map[level] || level
}

function clearFilters() {
  filters.value = { category: null, level: null, search: '' }
}

async function fetchCourses() {
  loading.value = true
  try {
    const { data } = await axios.get(`${API}/api/courses`)
    allCourses.value = data
  } catch (e) {
    console.error('Erro ao carregar cursos:', e)
  } finally {
    loading.value = false
  }
}

onMounted(fetchCourses)
</script>

<style scoped>
.courses-hero {
  background: linear-gradient(135deg, #f0f7ff 0%, #e8f4f8 100%);
  border-bottom: 1px solid #e0e8f0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.course-card {
  transition: transform 0.2s, box-shadow 0.2s;
  border-radius: 12px;
}

.course-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(3, 72, 148, 0.12);
}

.course-thumbnail {
  position: relative;
}

.course-price-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
}

.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
