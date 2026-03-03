<template>
  <q-layout view="lHh LpR lFf">

    <q-drawer v-model="drawerOpen" show-if-above :width="220" :breakpoint="900">
      <div class="sidebar-wrap">

        <!-- Logo -->
        <div class="sidebar-logo">
          <div class="sidebar-logo-icon">
            <q-icon name="precision_manufacturing" size="18px" color="white" />
          </div>
          <span class="sidebar-logo-text">RPA <span class="sidebar-logo-sub">Admin</span></span>
        </div>

        <!-- Nav -->
        <q-scroll-area style="flex: 1; height: 0">
          <q-list dark dense class="q-py-sm">

            <q-item-label header class="sidebar-section-label">Visão Geral</q-item-label>
            <q-item dark clickable v-ripple :to="'/admin/dashboard'" active-class="sidebar-active" exact class="sidebar-item">
              <q-item-section avatar><q-icon name="dashboard" size="16px" /></q-item-section>
              <q-item-section>Dashboard</q-item-section>
            </q-item>

            <q-item-label header class="sidebar-section-label q-mt-sm">Conteúdo</q-item-label>
            <q-item dark clickable v-ripple :to="'/admin/posts'" active-class="sidebar-active" exact class="sidebar-item">
              <q-item-section avatar><q-icon name="article" size="16px" /></q-item-section>
              <q-item-section>Posts</q-item-section>
            </q-item>
            <q-item dark clickable v-ripple :to="'/admin/posts/new'" active-class="sidebar-active" exact class="sidebar-item">
              <q-item-section avatar><q-icon name="add_circle_outline" size="16px" /></q-item-section>
              <q-item-section>Novo Post</q-item-section>
            </q-item>

            <q-item-label header class="sidebar-section-label q-mt-sm">Cursos</q-item-label>
            <q-item dark clickable v-ripple :to="'/admin/cursos'" active-class="sidebar-active" exact class="sidebar-item">
              <q-item-section avatar><q-icon name="school" size="16px" /></q-item-section>
              <q-item-section>Todos os Cursos</q-item-section>
            </q-item>
            <q-item dark clickable v-ripple :to="'/admin/cursos/novo'" active-class="sidebar-active" exact class="sidebar-item">
              <q-item-section avatar><q-icon name="add_circle_outline" size="16px" /></q-item-section>
              <q-item-section>Novo Curso</q-item-section>
            </q-item>

            <q-item-label header class="sidebar-section-label q-mt-sm">Alunos</q-item-label>
            <q-item dark clickable v-ripple :to="'/admin/alunos'" active-class="sidebar-active" class="sidebar-item">
              <q-item-section avatar><q-icon name="people" size="16px" /></q-item-section>
              <q-item-section>Matrículas</q-item-section>
              <q-item-section side v-if="badges.unseen_enrollments > 0">
                <q-badge color="red" :label="badges.unseen_enrollments" rounded />
              </q-item-section>
            </q-item>
            <q-item dark clickable v-ripple :to="'/admin/ajudas'" active-class="sidebar-active" class="sidebar-item">
              <q-item-section avatar><q-icon name="help_outline" size="16px" /></q-item-section>
              <q-item-section>Pedidos de Ajuda</q-item-section>
              <q-item-section side v-if="badges.pending_help > 0">
                <q-badge color="warning" :label="badges.pending_help" rounded />
              </q-item-section>
            </q-item>
            <q-item dark clickable v-ripple :to="'/admin/comentarios-cursos'" active-class="sidebar-active" class="sidebar-item">
              <q-item-section avatar><q-icon name="forum" size="16px" /></q-item-section>
              <q-item-section>Comentários</q-item-section>
              <q-item-section side v-if="badges.unseen_comments > 0">
                <q-badge color="blue" :label="badges.unseen_comments" rounded />
              </q-item-section>
            </q-item>

            <q-item-label header class="sidebar-section-label q-mt-sm">Sistema</q-item-label>
            <q-item dark clickable v-ripple :to="'/admin/configuracoes'" active-class="sidebar-active" class="sidebar-item">
              <q-item-section avatar><q-icon name="tune" size="16px" /></q-item-section>
              <q-item-section>Configurações</q-item-section>
            </q-item>

          </q-list>
        </q-scroll-area>

        <!-- Bottom -->
        <div class="sidebar-bottom">
          <q-separator dark />
          <q-item dark clickable v-ripple tag="a" href="/" target="_blank" class="sidebar-item q-mt-xs">
            <q-item-section avatar><q-icon name="open_in_new" size="16px" /></q-item-section>
            <q-item-section>Ver Site</q-item-section>
          </q-item>
          <div class="sidebar-user">
            <q-avatar size="28px" color="primary" text-color="white" class="text-weight-bold" style="font-size: 12px">
              {{ userInitial }}
            </q-avatar>
            <div class="sidebar-user-email">{{ authStore.user?.email }}</div>
            <q-btn dark flat round dense icon="logout" size="sm" color="grey-5" @click="handleLogout">
              <q-tooltip>Sair</q-tooltip>
            </q-btn>
          </div>
        </div>

      </div>
    </q-drawer>

    <q-btn
      v-if="!drawerOpen"
      fab-mini
      icon="menu"
      color="primary"
      style="position: fixed; bottom: 16px; left: 16px; z-index: 9000;"
      @click="drawerOpen = true"
    />

    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from 'stores/authStore'
import { getAuthToken } from 'src/composables/useAuthToken'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const drawerOpen = ref(true)

const badges = reactive({ pending_help: 0, unseen_comments: 0, unseen_enrollments: 0 })

const userInitial = computed(() => {
  const email = authStore.user?.email || ''
  return email.charAt(0).toUpperCase()
})

async function fetchBadges() {
  try {
    const token = await getAuthToken()
    const { data } = await axios.get(`${API}/api/admin/badges`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    badges.pending_help = data.pending_help
    badges.unseen_comments = data.unseen_comments
    badges.unseen_enrollments = data.unseen_enrollments
  } catch { /* silencioso */ }
}

watch(() => route.path, fetchBadges)
onMounted(fetchBadges)

async function handleLogout() {
  await authStore.logout()
  router.push('/admin/login')
}
</script>

<!-- Global: sidebar active state + background (não scoped pois active-class é dinâmico) -->
<style>
.sidebar-wrap {
  background: #0f172a;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  flex-shrink: 0;
}

.sidebar-logo-icon {
  width: 30px;
  height: 30px;
  background: #034894;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sidebar-logo-text {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.01em;
}

.sidebar-logo-sub {
  font-weight: 400;
  color: #4a6488;
}

.sidebar-section-label {
  font-size: 10px !important;
  font-weight: 600 !important;
  letter-spacing: 0.1em !important;
  text-transform: uppercase !important;
  color: #2d4a6e !important;
  padding-top: 4px !important;
  padding-bottom: 4px !important;
}

.sidebar-item {
  border-left: 2px solid transparent !important;
  min-height: 36px !important;
  font-size: 13px !important;
}

.sidebar-active {
  background: rgba(3, 72, 148, 0.25) !important;
  border-left-color: #f5a623 !important;
  color: #fff !important;
  font-weight: 600 !important;
}

.sidebar-bottom {
  flex-shrink: 0;
  padding-bottom: 4px;
}

.sidebar-user {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  margin: 4px 8px 8px;
  background: rgba(255,255,255,0.04);
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.06);
}

.sidebar-user-email {
  font-size: 11px;
  color: #4a6488;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Page background for all admin pages */
.q-page.admin-page {
  background: #f0f4fb;
}
</style>
