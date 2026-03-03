<template>
  <q-page class="player-page">

    <!-- Loading -->
    <div v-if="loading" class="flex flex-center" style="height: calc(100vh - 54px)">
      <div class="text-center">
        <q-spinner color="primary" size="40px" />
        <p class="text-caption text-grey-5 q-mt-md">Carregando curso...</p>
      </div>
    </div>

    <div v-else-if="courseData" class="player-root">

      <!-- ─── SIDEBAR ─── -->
      <aside class="player-sidebar" :class="{ 'sidebar-collapsed': !sidebarOpen }">

        <!-- Sidebar header -->
        <div class="sidebar-top">
          <div class="sidebar-course-title">{{ courseData.course.title }}</div>
          <div class="sidebar-progress-row">
            <div class="sidebar-progress-info">
              <span class="sidebar-progress-pct">{{ courseData.progress_percent }}%</span>
              <span class="sidebar-progress-label">concluído</span>
            </div>
            <q-btn
              flat round dense
              icon="close"
              size="xs"
              color="grey-5"
              class="hidden-md-and-up"
              @click="sidebarOpen = false"
            />
          </div>
          <q-linear-progress
            :value="courseData.progress_percent / 100"
            color="accent"
            track-color="grey-2"
            rounded
            size="4px"
            class="q-mt-xs"
          />
        </div>

        <!-- Module list -->
        <q-scroll-area class="sidebar-scroll">
          <q-expansion-item
            v-for="mod in courseData.modules"
            :key="mod.id"
            :label="mod.title"
            default-opened
            class="module-group"
            header-class="module-header"
            expand-icon-class="text-grey-5"
          >
            <template #header>
              <q-item-section class="module-header-section">
                <div class="module-title">{{ mod.title }}</div>
                <div class="module-meta">{{ completedInModule(mod) }}/{{ mod.lessons.length }} aulas</div>
              </q-item-section>
            </template>

            <div
              v-for="lesson in mod.lessons"
              :key="lesson.id"
              class="lesson-row"
              :class="{
                'lesson-active': currentLesson?.id === lesson.id,
                'lesson-done': lesson.completed && currentLesson?.id !== lesson.id
              }"
              @click="selectLesson(lesson)"
            >
              <div class="lesson-icon-wrap">
                <q-icon
                  :name="lesson.completed ? 'check_circle' : 'radio_button_unchecked'"
                  :color="lesson.completed ? 'positive' : (currentLesson?.id === lesson.id ? 'primary' : 'grey-4')"
                  size="16px"
                />
              </div>
              <div class="lesson-row-info">
                <div class="lesson-row-title">{{ lesson.title }}</div>
                <div v-if="lesson.duration_seconds" class="lesson-row-dur">
                  {{ formatDuration(lesson.duration_seconds) }}
                </div>
              </div>
            </div>
          </q-expansion-item>
        </q-scroll-area>
      </aside>

      <!-- ─── MAIN ─── -->
      <main class="player-main">

        <!-- Toolbar -->
        <div class="player-toolbar">
          <q-btn
            flat round dense
            icon="menu"
            size="sm"
            color="grey-6"
            class="q-mr-xs"
            @click="sidebarOpen = !sidebarOpen"
          />
          <q-btn
            flat no-caps dense
            icon="arrow_back"
            label="Minha Área"
            size="sm"
            color="primary"
            to="/minha-area"
            class="back-btn q-mr-sm gt-xs"
          />
          <q-icon name="chevron_right" size="14px" color="grey-4" class="gt-xs" />
          <div class="toolbar-lesson-title">
            {{ currentLesson?.title || 'Selecione uma aula' }}
          </div>
          <q-space />
          <q-btn
            v-if="currentLesson"
            flat no-caps dense
            :icon="currentLesson.completed ? 'check_circle' : 'radio_button_unchecked'"
            :color="currentLesson.completed ? 'positive' : 'grey-4'"
            :label="currentLesson.completed ? 'Concluída' : 'Marcar concluída'"
            class="complete-btn gt-xs"
            size="sm"
            :loading="completingLesson"
            @click="toggleComplete"
          />
          <q-btn
            v-if="currentLesson"
            flat round dense
            :icon="currentLesson.completed ? 'check_circle' : 'radio_button_unchecked'"
            :color="currentLesson.completed ? 'positive' : 'grey-4'"
            class="xs"
            size="sm"
            :loading="completingLesson"
            @click="toggleComplete"
          />
        </div>

        <!-- Video -->
        <div v-if="currentLesson?.video_url" class="video-wrap">
          <video
            ref="videoEl"
            :src="currentLesson.video_url"
            controls
            class="course-video"
            @ended="onVideoEnded"
          />
        </div>
        <div v-else-if="currentLesson" class="no-video-wrap">
          <q-icon name="article" size="48px" color="grey-3" />
          <p class="text-body2 text-grey-5 q-mt-md">{{ currentLesson.title }}</p>
          <p class="text-caption text-grey-4">Aula em formato de texto</p>
        </div>
        <div v-else class="no-video-wrap">
          <q-icon name="play_lesson" size="48px" color="grey-3" />
          <p class="text-body2 text-grey-5 q-mt-md">Selecione uma aula na barra lateral</p>
        </div>

        <!-- Content below video -->
        <div v-if="currentLesson" class="lesson-content">

          <!-- Mobile: mark complete -->
          <q-btn
            v-if="currentLesson"
            unelevated
            no-caps
            :color="currentLesson.completed ? 'positive' : 'grey-2'"
            :text-color="currentLesson.completed ? 'white' : 'grey-7'"
            :icon="currentLesson.completed ? 'check_circle' : 'radio_button_unchecked'"
            :label="currentLesson.completed ? 'Aula concluída' : 'Marcar como concluída'"
            class="full-width complete-mobile-btn hidden-md-and-up q-mb-lg"
            :loading="completingLesson"
            @click="toggleComplete"
          />

          <div class="content-columns">
            <!-- Coluna esquerda: descrição + tabs -->
            <div class="content-left">
              <p v-if="currentLesson.description" class="lesson-description">
                {{ currentLesson.description }}
              </p>

              <!-- Tabs -->
              <div class="tabs-area">
                <q-tabs
                  v-model="tab"
                  align="left"
                  active-color="primary"
                  indicator-color="primary"
                  dense
                  class="tabs-bar"
                >
                  <q-tab name="comments" label="Comentários" />
                  <q-tab name="help" label="Pedir Ajuda" />
                </q-tabs>

                <q-separator />

                <q-tab-panels v-model="tab" animated class="tab-panels">

              <!-- Comments -->
              <q-tab-panel name="comments" class="q-pa-none q-pt-lg">
                <div class="comment-input-area q-mb-lg">
                  <q-input
                    v-model="newComment"
                    label="Escreva um comentário..."
                    type="textarea"
                    outlined
                    autogrow
                    :rows="2"
                    dense
                    class="comment-input"
                  />
                  <div class="flex justify-end q-mt-sm">
                    <q-btn
                      unelevated no-caps
                      color="primary"
                      label="Comentar"
                      icon="send"
                      size="sm"
                      :loading="sendingComment"
                      :disable="!newComment.trim()"
                      @click="postComment"
                      style="border-radius: 8px"
                    />
                  </div>
                </div>

                <div v-if="loadingComments" class="text-center q-py-lg">
                  <q-spinner color="grey-4" size="24px" />
                </div>
                <div v-else-if="comments.length === 0" class="empty-comments">
                  <q-icon name="chat_bubble_outline" size="28px" color="grey-3" />
                  <p class="text-caption text-grey-4 q-mt-sm">Nenhum comentário ainda. Seja o primeiro!</p>
                </div>
                <div v-else class="comments-list">
                  <div v-for="c in comments" :key="c.id" class="comment-item">
                    <q-avatar size="34px" color="primary" text-color="white" class="comment-avatar">
                      <img v-if="c.author_avatar" :src="c.author_avatar" />
                      <span v-else style="font-size: 12px; font-weight: 700">
                        {{ c.author_name?.charAt(0)?.toUpperCase() }}
                      </span>
                    </q-avatar>
                    <div class="comment-body">
                      <div class="comment-meta">
                        <span class="comment-author">{{ c.author_name }}</span>
                        <span class="comment-date">{{ formatDate(c.created_at) }}</span>
                      </div>
                      <p class="comment-text">{{ c.content }}</p>
                      <div v-if="c.admin_reply" class="comment-admin-reply">
                        <div class="comment-admin-reply-header">
                          <q-icon name="support_agent" size="12px" />
                          <span>Resposta do instrutor</span>
                        </div>
                        <p class="comment-admin-reply-text">{{ c.admin_reply }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </q-tab-panel>

              <!-- Help -->
              <q-tab-panel name="help" class="q-pa-none q-pt-lg">
                <p class="help-desc">
                  Ficou com dúvida nesta aula? Descreva abaixo e responderemos o mais breve possível.
                </p>
                <q-input
                  v-model="helpText"
                  label="Descreva sua dúvida..."
                  type="textarea"
                  outlined
                  autogrow
                  :rows="4"
                  dense
                  class="q-mb-sm"
                />
                <div class="flex justify-end q-mb-xl">
                  <q-btn
                    unelevated no-caps
                    color="accent"
                    label="Enviar Dúvida"
                    icon="send"
                    size="sm"
                    :loading="sendingHelp"
                    :disable="!helpText.trim()"
                    @click="sendHelp"
                    style="border-radius: 8px"
                  />
                </div>

                <div v-if="myHelpRequests.length > 0">
                  <div class="help-history-title">Dúvidas enviadas</div>
                  <div v-for="hr in myHelpRequests" :key="hr.id" class="help-card">
                    <div class="help-card-meta">
                      <q-badge
                        :color="statusColor(hr.status)"
                        :label="statusLabel(hr.status)"
                        rounded
                      />
                      <span class="help-card-date">{{ formatDate(hr.created_at) }}</span>
                    </div>
                    <p class="help-card-text">{{ hr.description }}</p>
                    <div v-if="hr.response" class="help-response">
                      <div class="help-response-header">
                        <q-icon name="check_circle" color="positive" size="13px" />
                        <span>Respondida em {{ formatDate(hr.responded_at) }}</span>
                      </div>
                      <p class="help-response-text">{{ hr.response }}</p>
                    </div>
                  </div>
                </div>
              </q-tab-panel>

                </q-tab-panels>
              </div>
            </div>

            <!-- Coluna direita: anotações -->
            <aside class="notes-panel">
              <div class="notes-header">
                <q-icon name="edit_note" size="18px" color="primary" />
                <span class="notes-title">Anotações</span>
                <q-space />
                <transition name="fade">
                  <span v-if="noteSaved" class="note-saved-label">
                    <q-icon name="check" size="12px" />
                    Salvo
                  </span>
                </transition>
                <q-spinner v-if="savingNote" size="14px" color="grey-4" class="q-ml-xs" />
              </div>

              <div class="notes-body">
                <textarea
                  v-model="noteText"
                  class="notes-textarea"
                  placeholder="Escreva suas anotações desta aula aqui..."
                  @input="onNoteInput"
                />
                <div class="notes-footer">
                  <span class="notes-char">{{ noteText.length }} caracteres</span>
                  <span class="notes-hint">Salvo automaticamente</span>
                </div>
              </div>
            </aside>
          </div>
        </div>

      </main>
    </div>

  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { getAuthToken } from 'src/composables/useAuthToken'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const route = useRoute()
const $q = useQuasar()

const loading = ref(true)
const courseData = ref(null)
const currentLesson = ref(null)
const sidebarOpen = ref(true)
const tab = ref('comments')
const videoEl = ref(null)

const comments = ref([])
const loadingComments = ref(false)
const newComment = ref('')
const sendingComment = ref(false)

const helpText = ref('')
const sendingHelp = ref(false)
const myHelpRequests = ref([])

const completingLesson = ref(false)

// Anotações
const noteText = ref('')
const noteSaved = ref(false)
const savingNote = ref(false)
let _noteTimer = null

async function loadNote(lessonId) {
  noteSaved.value = false
  noteText.value = ''
  try {
    const token = await getAuthToken()
    const { data } = await axios.get(`${API}/api/me/lessons/${lessonId}/note`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    noteText.value = data.content || ''
  } catch { /* ignore */ }
}

function onNoteInput() {
  noteSaved.value = false
  clearTimeout(_noteTimer)
  _noteTimer = setTimeout(saveNote, 1000)
}

async function saveNote() {
  if (!currentLesson.value) return
  savingNote.value = true
  try {
    const token = await getAuthToken()
    await axios.put(
      `${API}/api/me/lessons/${currentLesson.value.id}/note`,
      { content: noteText.value },
      { headers: { Authorization: `Bearer ${token}` } },
    )
    noteSaved.value = true
    setTimeout(() => { noteSaved.value = false }, 2000)
  } catch { /* ignore */ }
  finally { savingNote.value = false }
}

function completedInModule(mod) {
  return mod.lessons.filter((l) => l.completed).length
}

function formatDuration(secs) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function statusLabel(s) {
  return { pending: 'Aguardando', in_progress: 'Em análise', resolved: 'Respondida' }[s] || s
}

function statusColor(s) {
  return { pending: 'warning', in_progress: 'info', resolved: 'positive' }[s] || 'grey'
}

async function fetchCourse() {
  loading.value = true
  try {
    const token = await getAuthToken()
    const { data } = await axios.get(`${API}/api/me/courses/${route.params.slug}/progress`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    courseData.value = data

    let firstLesson = null
    for (const mod of data.modules) {
      for (const lesson of mod.lessons) {
        if (!firstLesson) firstLesson = lesson
        if (!lesson.completed) { selectLesson(lesson); return }
      }
    }
    if (firstLesson) selectLesson(firstLesson)
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao carregar curso' })
  } finally {
    loading.value = false
  }
}

async function selectLesson(lesson) {
  currentLesson.value = lesson
  tab.value = 'comments'
  comments.value = []
  myHelpRequests.value = []
  await Promise.all([fetchComments(), fetchMyHelp(), loadNote(lesson.id)])
}

async function fetchComments() {
  loadingComments.value = true
  try {
    const token = await getAuthToken()
    const { data } = await axios.get(`${API}/api/lessons/${currentLesson.value.id}/comments`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    comments.value = data
  } catch { /* ignore */ }
  finally { loadingComments.value = false }
}

async function fetchMyHelp() {
  try {
    const token = await getAuthToken()
    const { data } = await axios.get(`${API}/api/me/help-requests`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { lesson_id: currentLesson.value.id },
    })
    myHelpRequests.value = data
  } catch { /* ignore */ }
}

async function postComment() {
  if (!newComment.value.trim()) return
  sendingComment.value = true
  try {
    const token = await getAuthToken()
    const { data } = await axios.post(
      `${API}/api/lessons/${currentLesson.value.id}/comments`,
      { content: newComment.value.trim() },
      { headers: { Authorization: `Bearer ${token}` } },
    )
    comments.value.push(data)
    newComment.value = ''
    $q.notify({ type: 'positive', message: 'Comentário enviado!' })
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao comentar' })
  } finally {
    sendingComment.value = false
  }
}

async function sendHelp() {
  if (!helpText.value.trim()) return
  sendingHelp.value = true
  try {
    const token = await getAuthToken()
    const { data } = await axios.post(
      `${API}/api/lessons/${currentLesson.value.id}/help`,
      { description: helpText.value.trim() },
      { headers: { Authorization: `Bearer ${token}` } },
    )
    myHelpRequests.value.unshift(data)
    helpText.value = ''
    $q.notify({ type: 'positive', message: 'Dúvida enviada! Responderemos em breve.' })
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao enviar dúvida' })
  } finally {
    sendingHelp.value = false
  }
}

async function toggleComplete() {
  if (!currentLesson.value) return
  completingLesson.value = true
  try {
    const token = await getAuthToken()
    const newState = !currentLesson.value.completed
    await axios.post(
      `${API}/api/me/lessons/${currentLesson.value.id}/complete`,
      { completed: newState },
      { headers: { Authorization: `Bearer ${token}` } },
    )
    currentLesson.value.completed = newState
    for (const mod of courseData.value.modules) {
      const l = mod.lessons.find((x) => x.id === currentLesson.value.id)
      if (l) l.completed = newState
    }
    const total = courseData.value.total_lessons
    const done = courseData.value.modules.reduce((acc, m) => acc + m.lessons.filter((l) => l.completed).length, 0)
    courseData.value.progress_percent = total > 0 ? Math.round((done / total) * 100) : 0
    courseData.value.completed_lessons = done
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao atualizar progresso' })
  } finally {
    completingLesson.value = false
  }
}

function onVideoEnded() {
  if (currentLesson.value && !currentLesson.value.completed) {
    toggleComplete()
  }
}

onMounted(fetchCourse)
</script>

<style scoped>
/* ── Root layout ── */
.player-page {
  background: #f8fafc;
  padding: 0 !important;
}

.player-root {
  display: flex;
  height: calc(100vh - 54px);
  overflow: hidden;
}

/* ── Sidebar ── */
.player-sidebar {
  width: 288px;
  min-width: 288px;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  transition: width 0.25s ease, min-width 0.25s ease;
  overflow: hidden;
}

.sidebar-collapsed {
  width: 0;
  min-width: 0;
}

.sidebar-top {
  padding: 16px 16px 12px;
  border-bottom: 1px solid #f3f4f6;
  flex-shrink: 0;
}

.sidebar-course-title {
  font-size: 13px;
  font-weight: 700;
  color: #111827;
  line-height: 1.4;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.sidebar-progress-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.sidebar-progress-info {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.sidebar-progress-pct {
  font-size: 18px;
  font-weight: 800;
  color: #034894;
  line-height: 1;
}

.sidebar-progress-label {
  font-size: 11px;
  color: #9ca3af;
  font-weight: 500;
}

.sidebar-scroll {
  flex: 1;
  height: 0; /* force scroll-area to fill remaining space */
}

/* Modules */
.module-group {
  border-bottom: 1px solid #f3f4f6;
}

.module-header-section {
  padding: 10px 0;
}

.module-title {
  font-size: 12px;
  font-weight: 700;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.module-meta {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 2px;
}

/* Lessons */
.lesson-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 16px 8px 20px;
  cursor: pointer;
  transition: background 0.15s;
  border-left: 2px solid transparent;
}

.lesson-row:hover {
  background: #f9fafb;
}

.lesson-active {
  background: #eff6ff !important;
  border-left-color: #034894 !important;
}

.lesson-done {
  opacity: 0.7;
}

.lesson-icon-wrap {
  flex-shrink: 0;
  margin-top: 1px;
}

.lesson-row-info {
  flex: 1;
  min-width: 0;
}

.lesson-row-title {
  font-size: 12.5px;
  font-weight: 500;
  color: #374151;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lesson-active .lesson-row-title {
  font-weight: 700;
  color: #034894;
}

.lesson-row-dur {
  font-size: 10px;
  color: #9ca3af;
  margin-top: 1px;
}

/* ── Main area ── */
.player-main {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* Toolbar */
.player-toolbar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 12px;
  height: 48px;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}

.back-btn {
  font-size: 12px;
  font-weight: 600;
  border-radius: 6px;
}

.toolbar-lesson-title {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 280px;
  margin-left: 4px;
}

.complete-btn {
  font-size: 12px;
  font-weight: 600;
  border-radius: 8px;
  white-space: nowrap;
}

/* Video */
.video-wrap {
  background: #000;
  width: 100%;
  flex-shrink: 0;
}

.course-video {
  width: 100%;
  max-height: 58vh;
  display: block;
}

.no-video-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 240px;
  background: #f1f5f9;
  color: #9ca3af;
}

/* Lesson content */
.lesson-content {
  padding: 24px 28px 40px;
  flex: 1;
  max-width: 860px;
}

.lesson-description {
  font-size: 14px;
  color: #4b5563;
  line-height: 1.7;
  margin-bottom: 28px;
}

.complete-mobile-btn {
  border-radius: 10px;
  font-weight: 700;
  font-size: 13px;
}

/* Tabs */
.tabs-area {
  border-top: 1px solid #f3f4f6;
  padding-top: 4px;
}

.tabs-bar {
  margin-bottom: 0;
}

.tab-panels {
  background: transparent !important;
}

/* Comments */
.comment-input {
  border-radius: 10px;
}

.empty-comments {
  text-align: center;
  padding: 32px 0;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.comment-avatar {
  flex-shrink: 0;
}

.comment-body {
  flex: 1;
  background: #f9fafb;
  border-radius: 10px;
  padding: 10px 14px;
}

.comment-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.comment-author {
  font-size: 12px;
  font-weight: 700;
  color: #111827;
}

.comment-date {
  font-size: 11px;
  color: #9ca3af;
}

.comment-text {
  font-size: 13px;
  color: #374151;
  line-height: 1.6;
  margin: 0;
}

.comment-admin-reply {
  margin-top: 10px;
  background: #eff6ff;
  border-left: 3px solid #034894;
  border-radius: 0 6px 6px 0;
  padding: 8px 12px;
}

.comment-admin-reply-header {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
  color: #034894;
  margin-bottom: 4px;
}

.comment-admin-reply-text {
  font-size: 13px;
  color: #374151;
  margin: 0;
  line-height: 1.5;
}

/* Help */
.help-desc {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 12px;
  line-height: 1.6;
}

.help-history-title {
  font-size: 12px;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 12px;
}

.help-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 12px 14px;
  margin-bottom: 8px;
}

.help-card-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.help-card-date {
  font-size: 11px;
  color: #9ca3af;
}

.help-card-text {
  font-size: 13px;
  color: #374151;
  margin: 0;
  line-height: 1.5;
}

.help-response {
  margin-top: 10px;
  background: #f0fdf4;
  border-left: 3px solid #16a34a;
  border-radius: 0 8px 8px 0;
  padding: 10px 12px;
}

.help-response-header {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 600;
  color: #16a34a;
  margin-bottom: 6px;
}

.help-response-text {
  font-size: 13px;
  color: #374151;
  margin: 0;
  line-height: 1.6;
}

/* ── Two-column content layout ── */
.content-columns {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.content-left {
  flex: 1;
  min-width: 0;
}

/* ── Notes panel ── */
.notes-panel {
  width: 280px;
  min-width: 280px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  position: sticky;
  top: 60px;
  display: flex;
  flex-direction: column;
}

.notes-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 14px;
  border-bottom: 1px solid #f3f4f6;
  background: #fafafa;
}

.notes-title {
  font-size: 13px;
  font-weight: 700;
  color: #374151;
}

.note-saved-label {
  font-size: 11px;
  color: #16a34a;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 2px;
}

.notes-body {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.notes-textarea {
  width: 100%;
  min-height: 280px;
  padding: 12px 14px;
  font-size: 13px;
  line-height: 1.6;
  color: #374151;
  border: none;
  outline: none;
  resize: vertical;
  font-family: inherit;
  background: transparent;
}

.notes-textarea::placeholder {
  color: #d1d5db;
}

.notes-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 14px;
  border-top: 1px solid #f3f4f6;
  background: #fafafa;
}

.notes-char {
  font-size: 10px;
  color: #9ca3af;
}

.notes-hint {
  font-size: 10px;
  color: #9ca3af;
  font-style: italic;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ── Responsive ── */
@media (max-width: 768px) {
  .player-root {
    flex-direction: column;
    height: auto;
    overflow: visible;
  }

  .player-sidebar {
    width: 100%;
    min-width: 100%;
    height: auto;
    max-height: 50vh;
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
  }

  .sidebar-collapsed {
    height: 0;
    max-height: 0;
  }

  .player-main {
    overflow-y: visible;
  }

  .lesson-content {
    padding: 16px 16px 32px;
  }

  .content-columns {
    flex-direction: column;
  }

  .notes-panel {
    width: 100%;
    min-width: 100%;
    position: static;
  }

  .toolbar-lesson-title {
    max-width: 140px;
  }
}
</style>
