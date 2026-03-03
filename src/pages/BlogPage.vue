<template>
  <q-page class="blog-page">
    <!-- ── Hero ── -->
    <section class="blog-hero q-py-xl text-center">
      <div class="blog-hero-inner">
        <div class="text-overline text-accent text-weight-bold q-mb-sm" style="letter-spacing: 3px">CONTEÚDO</div>
        <h1 class="text-h3 text-primary text-weight-bold q-mb-sm">Blog</h1>
        <p class="text-body1 text-secondary q-mb-xl">
          Automação, RPA e tecnologia para transformar o seu trabalho
        </p>
        <q-input
          v-model="search"
          outlined
          placeholder="Buscar por título, categoria ou tag..."
          clearable
          class="blog-search"
          bg-color="white"
          @update:model-value="currentPage = 1"
        >
          <template #prepend>
            <q-icon name="search" color="grey-6" />
          </template>
        </q-input>
      </div>
    </section>

    <!-- ── Filters bar ── -->
    <div class="filters-bar">
      <div class="filters-inner">
        <div class="flex items-center q-gutter-xs flex-wrap col">
          <q-chip
            v-for="cat in categories"
            :key="cat"
            clickable
            size="md"
            :color="activeCategory === cat ? 'primary' : 'grey-3'"
            :text-color="activeCategory === cat ? 'white' : 'grey-9'"
            class="category-chip"
            @click="selectCategory(cat)"
          >
            {{ cat }}
          </q-chip>
        </div>

        <div class="sort-wrap">
          <q-select
            v-model="sortBy"
            :options="sortOptions"
            dense
            borderless
            emit-value
            map-options
            style="min-width: 160px"
          >
            <template #prepend>
              <q-icon name="sort" color="grey-6" size="sm" />
            </template>
          </q-select>
        </div>
      </div>
    </div>

    <!-- ── Content ── -->
    <div class="blog-content">
      <!-- Loading -->
      <div v-if="loading" class="flex flex-center q-py-xl">
        <q-spinner-dots color="primary" size="50px" />
      </div>

      <template v-else>
        <!-- Empty -->
        <div v-if="filteredPosts.length === 0" class="text-center q-py-xl">
          <q-icon name="search_off" size="64px" color="grey-3" />
          <p class="text-h6 text-grey-5 q-mt-md">Nenhum post encontrado</p>
          <q-btn flat color="primary" label="Limpar filtros" class="q-mt-sm" @click="resetFilters" />
        </div>

        <template v-else>
          <!-- Featured post -->
          <template v-if="showFeatured">
            <div class="text-overline text-primary text-weight-bold q-mb-sm">Em Destaque</div>
            <q-card
              flat
              bordered
              class="featured-card q-mb-xl cursor-pointer"
              @click="$router.push(`/blog/${featuredPost.slug}`)"
            >
              <div class="row no-wrap">
                <div class="featured-img-side">
                  <q-img
                    v-if="featuredPost.cover_image"
                    :src="featuredPost.cover_image"
                    class="full-height"
                  >
                    <template #error>
                      <div class="absolute-full featured-placeholder flex flex-center">
                        <q-icon name="article" size="48px" color="white" style="opacity:.4" />
                      </div>
                    </template>
                  </q-img>
                  <div v-else class="featured-placeholder full-height flex flex-center">
                    <q-icon name="article" size="48px" color="white" style="opacity:.4" />
                  </div>
                </div>

                <q-card-section class="col flex column justify-center featured-content">
                  <q-chip
                    dense
                    color="primary"
                    text-color="white"
                    style="width: fit-content"
                    class="q-mb-sm"
                  >
                    {{ featuredPost.category || 'RPA' }}
                  </q-chip>
                  <div class="featured-title text-weight-bold text-dark q-mb-sm">
                    {{ featuredPost.title }}
                  </div>
                  <div class="text-body2 text-grey-7 q-mb-md featured-excerpt">
                    {{ featuredPost.excerpt }}
                  </div>
                  <div class="flex items-center q-gutter-sm flex-wrap">
                    <span class="text-caption text-grey-5">
                      <q-icon name="person" size="xs" /> {{ featuredPost.author }}
                    </span>
                    <span class="text-caption text-grey-5">
                      <q-icon name="calendar_today" size="xs" />
                      {{ formatDate(featuredPost.created_at) }}
                    </span>
                    <q-btn
                      flat
                      dense
                      color="primary"
                      label="Ler artigo"
                      icon-right="arrow_forward"
                      class="q-ml-auto"
                    />
                  </div>
                </q-card-section>
              </div>
            </q-card>
          </template>

          <!-- Count -->
          <div class="text-caption text-grey-6 q-mb-md">
            {{ gridPosts.length }} {{ gridPosts.length === 1 ? 'artigo' : 'artigos' }}
          </div>

          <!-- Grid -->
          <div class="row q-col-gutter-lg">
            <div v-for="post in paginatedPosts" :key="post.id" class="col-12 col-sm-6 col-lg-4">
              <q-card
                flat
                bordered
                class="post-card cursor-pointer column full-height"
                @click="$router.push(`/blog/${post.slug}`)"
              >
                <!-- Cover -->
                <q-img v-if="post.cover_image" :src="post.cover_image" :ratio="16 / 9" class="post-cover">
                  <template #error>
                    <div class="absolute-full flex flex-center bg-grey-2">
                      <q-icon name="broken_image" size="32px" color="grey-4" />
                    </div>
                  </template>
                  <div class="absolute-top-right q-ma-sm">
                    <q-chip dense color="primary" text-color="white" class="text-caption shadow-1">
                      {{ post.category || 'RPA' }}
                    </q-chip>
                  </div>
                </q-img>
                <div v-else class="post-cover post-cover--placeholder flex flex-center">
                  <q-icon name="article" size="40px" color="white" style="opacity: 0.35" />
                  <div class="absolute-top-right q-ma-sm">
                    <q-chip dense color="primary" text-color="white" class="text-caption shadow-1">
                      {{ post.category || 'RPA' }}
                    </q-chip>
                  </div>
                </div>

                <!-- Body -->
                <q-card-section class="col q-pb-xs">
                  <div class="text-caption text-grey-5 q-mb-xs">
                    <q-icon name="calendar_today" size="11px" />
                    {{ formatDate(post.created_at) }}
                    <span class="q-mx-xs">·</span>
                    <q-icon name="schedule" size="11px" />
                    {{ readTime(post.excerpt) }} min
                  </div>
                  <div class="text-subtitle1 text-weight-bold text-dark post-title q-mb-xs">
                    {{ post.title }}
                  </div>
                  <div class="text-caption text-grey-6 post-excerpt">{{ post.excerpt }}</div>
                </q-card-section>

                <!-- Footer -->
                <q-card-section class="q-pt-sm q-pb-sm q-px-md">
                  <div class="flex items-center">
                    <div class="flex q-gutter-xs">
                      <q-chip
                        v-for="tag in (post.tags || []).slice(0, 2)"
                        :key="tag"
                        dense
                        outline
                        color="grey-5"
                        size="sm"
                      >
                        {{ tag }}
                      </q-chip>
                    </div>
                    <q-space />
                    <q-icon name="arrow_forward" color="primary" size="sm" />
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="flex flex-center q-mt-xl q-pb-xl">
            <q-pagination
              v-model="currentPage"
              :max="totalPages"
              color="primary"
              direction-links
              boundary-links
            />
          </div>
        </template>
      </template>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMeta } from 'quasar'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

useMeta({
  title: 'Blog — RPA Simplificado',
  meta: {
    description: { name: 'description', content: 'Conteúdos sobre automação, RPA e tecnologia' },
  },
})

const posts = ref([])
const loading = ref(true)
const search = ref('')
const activeCategory = ref('Todos')
const sortBy = ref('newest')
const currentPage = ref(1)
const perPage = 9

const sortOptions = [
  { label: 'Mais recentes', value: 'newest' },
  { label: 'Mais antigos', value: 'oldest' },
  { label: 'A → Z', value: 'az' },
]

const categories = computed(() => {
  const cats = [...new Set(posts.value.map((p) => p.category).filter(Boolean))]
  return ['Todos', ...cats]
})

const filteredPosts = computed(() => {
  let result = [...posts.value]

  if (activeCategory.value !== 'Todos') {
    result = result.filter((p) => p.category === activeCategory.value)
  }

  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.excerpt || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q) ||
        (p.tags || []).some((t) => t.toLowerCase().includes(q)),
    )
  }

  if (sortBy.value === 'oldest') {
    result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  } else if (sortBy.value === 'az') {
    result.sort((a, b) => a.title.localeCompare(b.title))
  } else {
    result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }

  return result
})

const showFeatured = computed(
  () =>
    !search.value &&
    activeCategory.value === 'Todos' &&
    sortBy.value === 'newest' &&
    filteredPosts.value.length > 0,
)

const featuredPost = computed(() => (showFeatured.value ? filteredPosts.value[0] : null))
const gridPosts = computed(() =>
  showFeatured.value ? filteredPosts.value.slice(1) : filteredPosts.value,
)
const totalPages = computed(() => Math.ceil(gridPosts.value.length / perPage))
const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return gridPosts.value.slice(start, start + perPage)
})

function selectCategory(cat) {
  activeCategory.value = cat
  currentPage.value = 1
}

function resetFilters() {
  search.value = ''
  activeCategory.value = 'Todos'
  sortBy.value = 'newest'
  currentPage.value = 1
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function readTime(excerpt) {
  const words = (excerpt || '').split(/\s+/).length
  return Math.max(2, Math.ceil(words * 8 / 200))
}

onMounted(async () => {
  try {
    const { data } = await axios.get(`${API}/api/posts`, { params: { limit: 200, page: 1 } })
    posts.value = data.posts || []
  } catch (e) {
    console.error('Erro ao carregar posts:', e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* ── Page ── */
.blog-page {
  background: #f4f6f9;
  min-height: 100vh;
}

/* ── Hero ── */
.blog-hero {
  background: linear-gradient(135deg, #f0f7ff 0%, #e8f4f8 100%);
  border-bottom: 1px solid #e0e8f0;
}

.blog-hero-inner {
  max-width: 720px;
  margin: 0 auto;
}

.blog-search {
  max-width: 560px;
  margin: 0 auto;
}

.blog-search :deep(.q-field__control) {
  border-radius: 10px;
}

/* ── Filters bar ── */
.filters-bar {
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.07);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 50px;
  z-index: 10;
}

.filters-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.75rem 1.25rem;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.sort-wrap {
  margin-left: auto;
}

.category-chip {
  transition: all 0.2s;
}

/* ── Content ── */
.blog-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2.5rem 1.25rem;
}

/* ── Featured card ── */
.featured-card {
  border-radius: 16px !important;
  overflow: hidden;
  transition: box-shadow 0.2s;
  min-height: 260px;
}

.featured-card:hover {
  box-shadow: 0 8px 32px rgba(3, 72, 148, 0.15) !important;
}

.featured-img-side {
  width: 380px;
  min-height: 260px;
  flex-shrink: 0;
}

.featured-content {
  padding: 2rem;
}

.featured-title {
  font-size: 1.35rem;
  line-height: 1.35;
}

.featured-placeholder {
  background: linear-gradient(135deg, #023878 0%, #0563bf 100%);
}

.featured-excerpt {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ── Post cards ── */
.post-card {
  border-radius: 14px !important;
  transition: transform 0.2s, box-shadow 0.2s;
  background: white;
}

.post-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.1) !important;
}

.post-cover {
  border-radius: 14px 14px 0 0;
}

.post-cover--placeholder {
  height: 180px;
  background: linear-gradient(135deg, #034894 0%, #0563bf 100%);
}

.post-title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-excerpt {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ── Mobile ── */
@media (max-width: 599px) {
  .blog-hero-inner :deep(h1),
  .blog-hero-inner h1 {
    font-size: 1.9rem !important;
    line-height: 1.2;
  }

  .blog-hero-inner p {
    font-size: 0.95rem;
  }

  .filters-inner {
    padding: 0.6rem 1rem;
  }

  .sort-wrap {
    margin-left: 0;
    width: 100%;
  }

  .sort-wrap :deep(.q-field) {
    width: 100%;
  }

  .blog-content {
    padding: 1.5rem 1rem;
  }

  .featured-img-side {
    display: none;
  }

  .featured-content {
    padding: 1.25rem;
  }

  .featured-title {
    font-size: 1.15rem;
  }
}
</style>
