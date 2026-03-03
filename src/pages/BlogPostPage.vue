<template>
  <q-page class="post-page">
    <div class="post-container">
      <!-- Loading -->
      <div v-if="loading" class="flex flex-center q-py-xl">
        <q-spinner-dots color="primary" size="50px" />
      </div>

      <!-- Not found -->
      <div v-else-if="!post" class="text-center q-py-xl">
        <q-icon name="search_off" size="64px" color="grey-4" />
        <p class="text-h6 text-grey-6 q-mt-md">Post não encontrado.</p>
        <q-btn color="primary" label="Voltar ao Blog" to="/blog" class="q-mt-md" />
      </div>

      <!-- Post -->
      <template v-else>
        <!-- Breadcrumb -->
        <q-breadcrumbs class="q-mb-lg text-grey-6">
          <q-breadcrumbs-el label="Home" to="/" icon="home" />
          <q-breadcrumbs-el label="Blog" to="/blog" />
          <q-breadcrumbs-el :label="post.title" />
        </q-breadcrumbs>

        <!-- Cover -->
        <q-img
          v-if="post.cover_image"
          :src="post.cover_image"
          :ratio="$q.screen.lt.sm ? 16 / 9 : 21 / 9"
          class="post-cover q-mb-lg"
        />

        <!-- Header -->
        <div class="q-mb-lg">
          <div class="flex items-center q-gutter-xs q-mb-md flex-wrap">
            <q-chip v-if="post.category" color="primary" text-color="white">
              {{ post.category }}
            </q-chip>
            <q-chip v-for="tag in post.tags" :key="tag" dense outline color="grey-5">
              {{ tag }}
            </q-chip>
          </div>
          <h1 class="post-title-h1 text-weight-bold text-dark q-mb-sm">{{ post.title }}</h1>
          <div class="flex items-center q-gutter-md text-caption text-grey-6 flex-wrap">
            <span><q-icon name="person" size="xs" /> {{ post.author }}</span>
            <span><q-icon name="calendar_today" size="xs" /> {{ formatDate(post.created_at) }}</span>
            <span><q-icon name="schedule" size="xs" /> {{ readTime }} min de leitura</span>
          </div>
        </div>

        <!-- Content -->
        <div class="post-content ql-editor" v-html="post.content" />

        <q-separator class="q-my-xl" />

        <!-- ── Actions row: Share + Rating ── -->
        <div class="row q-col-gutter-lg q-mb-xl">
          <!-- Share -->
          <div class="col-12 col-sm-6">
            <div class="text-subtitle2 text-weight-bold q-mb-md">Compartilhar</div>
            <div class="flex q-gutter-sm">
              <q-btn
                unelevated
                color="blue-8"
                icon="fab fa-linkedin"
                label="LinkedIn"
                @click="shareLinkedIn"
              />
              <q-btn outline color="grey-7" icon="link" label="Copiar link" @click="copyLink" />
            </div>
          </div>

          <!-- Rating -->
          <div class="col-12 col-sm-6">
            <div class="text-subtitle2 text-weight-bold q-mb-sm">Avalie este post</div>
            <div class="rating-row">
              <div class="flex">
                <q-btn
                  v-for="star in 5"
                  :key="star"
                  flat
                  round
                  dense
                  :icon="star <= (hoverRating || userRating) ? 'star' : 'star_border'"
                  :color="star <= (hoverRating || userRating) ? 'amber' : 'grey-4'"
                  size="lg"
                  @click="ratePost(star)"
                  @mouseenter="hoverRating = star"
                  @mouseleave="hoverRating = 0"
                />
              </div>
              <span v-if="ratingCount > 0" class="text-caption text-grey-6">
                {{ averageRating.toFixed(1) }}
                ({{ ratingCount }} {{ ratingCount === 1 ? 'avaliação' : 'avaliações' }})
              </span>
            </div>
            <div v-if="userRating" class="text-caption text-positive q-mt-xs">
              <q-icon name="check_circle" size="xs" /> Você avaliou este post
            </div>
          </div>
        </div>

        <!-- ── Comments ── -->
        <div class="q-mb-xl">
          <div class="text-h6 text-weight-bold q-mb-lg">
            Comentários
            <q-badge v-if="comments.length" color="primary" class="q-ml-sm">
              {{ comments.length }}
            </q-badge>
          </div>

          <!-- Comment box -->
          <q-card flat bordered class="q-pa-md q-mb-lg comment-box">
            <!-- Not logged in -->
            <template v-if="!authStore.user">
              <div class="login-prompt">
                <div class="flex items-center q-gutter-sm q-mb-sm">
                  <q-avatar color="grey-2" size="44px">
                    <q-icon name="fab fa-linkedin" color="blue-8" size="26px" />
                  </q-avatar>
                  <div>
                    <div class="text-subtitle2 text-weight-bold">
                      Entre com LinkedIn para comentar
                    </div>
                    <div class="text-caption text-grey-6">
                      Seu nome e foto pública do LinkedIn serão exibidos
                    </div>
                  </div>
                </div>
                <q-btn
                  unelevated
                  color="blue-8"
                  icon="fab fa-linkedin"
                  label="Entrar com LinkedIn"
                  class="full-width"
                  :loading="linkedinLoading"
                  @click="loginLinkedIn"
                />
              </div>
            </template>

            <!-- Logged in -->
            <template v-else>
              <div class="flex items-center q-gutter-sm q-mb-md">
                <q-avatar size="40px">
                  <img
                    v-if="userAvatar"
                    :src="userAvatar"
                    @error="(e) => e.target.style.display = 'none'"
                  />
                  <q-icon v-else name="person" color="white" class="bg-primary" />
                </q-avatar>
                <div class="col">
                  <div class="text-weight-bold text-dark text-body2">
                    {{ authStore.user.user_metadata?.full_name || authStore.user.user_metadata?.name || authStore.user.email }}
                  </div>
                  <div class="text-caption text-grey-5 flex items-center q-gutter-xs">
                    <q-icon name="fab fa-linkedin" color="blue-8" size="12px" />
                    <span>Logado via LinkedIn</span>
                  </div>
                </div>
                <q-btn flat dense size="sm" color="grey-6" label="Sair" @click="logoutLinkedIn" />
              </div>

              <q-input
                v-model="newComment"
                type="textarea"
                outlined
                placeholder="Escreva seu comentário..."
                rows="3"
                class="q-mb-md"
                autogrow
              />

              <!-- Perfil LinkedIn (opcional, salvo no navegador) -->
              <q-input
                v-model="linkedinProfileUrl"
                outlined
                dense
                class="q-mb-md"
                placeholder="https://www.linkedin.com/in/seu-perfil (opcional)"
                hint="Cole o link do seu perfil LinkedIn para que outros possam te encontrar"
              >
                <template #prepend>
                  <q-icon name="fab fa-linkedin" color="blue-8" />
                </template>
              </q-input>

              <div class="flex justify-end">
                <q-btn
                  unelevated
                  color="primary"
                  label="Publicar comentário"
                  icon="send"
                  :loading="commentLoading"
                  :disable="!newComment.trim()"
                  @click="submitComment"
                />
              </div>
            </template>
          </q-card>

          <!-- Comments list -->
          <div v-if="comments.length === 0" class="text-center text-grey-5 q-py-lg">
            <q-icon name="chat_bubble_outline" size="48px" color="grey-3" />
            <div class="q-mt-sm">Seja o primeiro a comentar!</div>
          </div>

          <div v-else class="q-gutter-md">
            <q-card
              v-for="comment in comments"
              :key="comment.id"
              flat
              bordered
              class="q-pa-md comment-card"
            >
              <div class="flex items-start q-gutter-md">
                <q-avatar size="44px" class="comment-avatar">
                  <img
                    v-if="comment.author_avatar"
                    :src="comment.author_avatar"
                    @error="(e) => e.target.style.display = 'none'"
                  />
                  <q-icon v-else name="person" color="white" class="bg-primary" />
                </q-avatar>
                <div class="col">
                  <div class="flex items-center q-gutter-xs q-mb-xs">
                    <component
                      :is="comment.author_profile_url ? 'a' : 'span'"
                      :href="comment.author_profile_url || undefined"
                      :target="comment.author_profile_url ? '_blank' : undefined"
                      :rel="comment.author_profile_url ? 'noopener noreferrer' : undefined"
                      class="text-weight-bold text-dark"
                      :class="{ 'author-link': comment.author_profile_url }"
                    >{{ comment.author_name }}</component>
                    <q-icon name="fab fa-linkedin" color="blue-8" size="14px" />
                    <q-space />
                    <span class="text-caption text-grey-5">
                      {{ formatDate(comment.created_at) }}
                    </span>
                  </div>
                  <div class="text-body2 text-grey-8 comment-text">{{ comment.content }}</div>
                </div>
              </div>
            </q-card>
          </div>
        </div>

        <q-btn flat color="primary" icon="arrow_back" label="Voltar ao Blog" to="/blog" />
      </template>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar, useMeta } from 'quasar'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'
import { useAuthStore } from 'stores/authStore'

const route = useRoute()
const $q = useQuasar()
const authStore = useAuthStore()

const post = ref(null)
const loading = ref(true)

// Rating
const userRating = ref(0)
const hoverRating = ref(0)
const averageRating = ref(0)
const ratingCount = ref(0)

// Comments
const comments = ref([])
const newComment = ref('')
const commentLoading = ref(false)
const linkedinLoading = ref(false)
const linkedinProfileUrl = ref('')

// Computed avatar — LinkedIn OIDC may use 'picture' instead of 'avatar_url'
const userAvatar = computed(() => {
  const meta = authStore.user?.user_metadata
  return meta?.avatar_url || meta?.picture || null
})

// Persist LinkedIn profile URL in localStorage per user
watch(() => authStore.user, (u) => {
  if (u) {
    const saved = localStorage.getItem(`linkedin_url_${u.id}`)
    if (saved) linkedinProfileUrl.value = saved
  }
}, { immediate: true })

watch(linkedinProfileUrl, (url) => {
  if (authStore.user) {
    localStorage.setItem(`linkedin_url_${authStore.user.id}`, url)
  }
})

const readTime = computed(() => {
  if (!post.value?.content) return 3
  const words = post.value.content.replace(/<[^>]+>/g, '').split(/\s+/).length
  return Math.max(2, Math.ceil(words / 200))
})

useMeta(() => ({
  title: post.value ? `${post.value.title} — RPA Simplificado` : 'Blog — RPA Simplificado',
  meta: {
    description: { name: 'description', content: post.value?.excerpt || '' },
    ogTitle: { property: 'og:title', content: post.value?.title || '' },
    ogDescription: { property: 'og:description', content: post.value?.excerpt || '' },
    ogImage: { property: 'og:image', content: post.value?.cover_image || '' },
  },
}))

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

// ── Share ──
function shareLinkedIn() {
  const url = encodeURIComponent(window.location.href)
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank')
}

async function copyLink() {
  await navigator.clipboard.writeText(window.location.href)
  $q.notify({ type: 'positive', message: 'Link copiado!', timeout: 2000 })
}

// ── Rating (fingerprint — sem login) ──
function getFingerprint() {
  let fp = localStorage.getItem('blog_fp')
  if (!fp) {
    fp = Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem('blog_fp', fp)
  }
  return fp
}

async function loadRatings() {
  try {
    const { data } = await axios.get(`${API}/api/posts/${post.value.id}/ratings`, {
      params: { fingerprint: getFingerprint() },
    })
    ratingCount.value = data.count
    averageRating.value = data.average
    if (data.user_rating) userRating.value = data.user_rating
  } catch { /* ignore */ }
}

async function ratePost(star) {
  try {
    const { data } = await axios.post(`${API}/api/posts/${post.value.id}/ratings`, {
      fingerprint: getFingerprint(),
      rating: star,
    })
    userRating.value = star
    averageRating.value = data.average
    ratingCount.value = data.count
    $q.notify({ type: 'positive', message: 'Avaliação registrada!', timeout: 2000 })
  } catch { /* ignore */ }
}

// ── Comments (LinkedIn OAuth) ──
async function loginLinkedIn() {
  linkedinLoading.value = true
  await authStore.loginWithLinkedIn(route.fullPath)
  // page will redirect — loading persists until then
}

async function logoutLinkedIn() {
  await authStore.logout()
}

async function loadComments() {
  try {
    const { supabase } = await import('boot/supabase')
    const session = await supabase.auth.getSession()
    const token = session.data.session?.access_token
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    const { data } = await axios.get(`${API}/api/posts/${post.value.id}/comments`, { headers })
    comments.value = data
  } catch { /* ignore */ }
}

async function submitComment() {
  if (!newComment.value.trim() || !authStore.user) return
  commentLoading.value = true
  try {
    const { supabase } = await import('boot/supabase')
    const session = await supabase.auth.getSession()
    const token = session.data.session?.access_token
    const { data } = await axios.post(
      `${API}/api/posts/${post.value.id}/comments`,
      {
        content: newComment.value.trim(),
        author_profile_url: linkedinProfileUrl.value.trim() || null,
      },
      { headers: { Authorization: `Bearer ${token}` } },
    )
    newComment.value = ''
    comments.value.push(data)
    $q.notify({ type: 'positive', message: 'Comentário publicado!' })
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao publicar comentário' })
  } finally {
    commentLoading.value = false
  }
}

onMounted(async () => {
  try {
    const { data } = await axios.get(`${API}/api/posts/${route.params.slug}`)
    post.value = data
    await Promise.all([loadRatings(), loadComments()])
  } catch { /* 404 handled by v-if */ }
  finally { loading.value = false }
})
</script>

<style>
/* Quill content — unscoped for v-html */
.post-content.ql-editor {
  font-size: 1.05rem;
  line-height: 1.85;
  color: #2d3748;
  padding: 0;
}
.post-content h2,
.post-content h3 {
  color: #034894;
  margin-top: 2rem;
  margin-bottom: 0.75rem;
}
.post-content img {
  max-width: 100%;
  border-radius: 10px;
}
.post-content blockquote {
  border-left: 4px solid #034894;
  margin: 1.5rem 0;
  padding: 0.75rem 1rem;
  color: #555;
  font-style: italic;
  background: #f0f6ff;
  border-radius: 0 8px 8px 0;
}
.post-content pre {
  background: #1a1a2e;
  color: #e2e8f0;
  padding: 1.25rem;
  border-radius: 10px;
  overflow-x: auto;
  font-size: 0.9rem;
}
.post-content a {
  color: #034894;
}
</style>

<style scoped>
.post-page {
  padding: 1.5rem 1rem;
}

.post-container {
  max-width: 820px;
  margin: 0 auto;
}

.post-title-h1 {
  font-size: 2rem;
  line-height: 1.25;
}

.post-cover {
  border-radius: 14px;
}

.rating-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.login-prompt {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comment-box {
  border-radius: 12px !important;
}

.comment-card {
  border-radius: 12px !important;
}

.comment-text {
  white-space: pre-wrap;
  line-height: 1.7;
}

.author-link {
  text-decoration: none;
  color: #034894;
}

.author-link:hover {
  text-decoration: underline;
}

.comment-avatar {
  background: #e3eaf5;
  flex-shrink: 0;
}

/* ── Mobile ── */
@media (max-width: 599px) {
  .post-page {
    padding: 1rem 0.75rem;
  }

  .post-title-h1 {
    font-size: 1.5rem;
    line-height: 1.25;
  }

  .post-cover {
    border-radius: 10px;
    margin-bottom: 1.25rem;
  }

  .post-content.ql-editor {
    font-size: 1rem;
    line-height: 1.75;
  }
}

@media (min-width: 600px) {
  .post-page {
    padding: 2rem 1.5rem;
  }

  .post-title-h1 {
    font-size: 2.1rem;
  }
}
</style>
