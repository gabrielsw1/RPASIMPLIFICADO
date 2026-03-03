<template>
  <q-layout view="lHh Lpr lFf" class="bg-white">
    <q-header class="glass-header text-primary q-py-xs" elevated>
      <q-toolbar class="nav-container">
        <q-toolbar-title
          class="text-weight-bold flex items-center cursor-pointer"
          @click="$router.push('/')"
        >
          <img
            src="~assets/logo_rpa.png"
            alt="RPA Simplificado"
            style="height: 45px; transition: transform 0.3s"
            class="logo-hover"
          />
        </q-toolbar-title>
        <q-space />
        <div class="gt-xs flex items-center">
          <q-btn
            v-if="settingsStore.settings.courses_enabled"
            flat
            label="Cursos"
            to="/cursos"
            class="q-mr-sm text-weight-bold nav-btn"
          />

          <q-btn
            v-if="settingsStore.settings.blog_enabled"
            flat
            label="Blog"
            to="/blog"
            class="q-mr-sm text-weight-bold nav-btn"
          />

          <q-btn-dropdown flat label="Tools (Ferramentas)" class="q-mr-sm text-weight-bold nav-btn">
            <q-list>
              <q-item clickable v-close-popup to="/tools/calculadora-roi">
                <q-item-section avatar>
                  <q-icon name="calculate" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Calculadora de ROI</q-item-label>
                </q-item-section>
              </q-item>

              <q-item clickable v-close-popup to="/tools/viabilidade-processos">
                <q-item-section avatar>
                  <q-icon name="fact_check" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Matriz de Viabilidade</q-item-label>
                </q-item-section>
              </q-item>

              <q-item clickable v-close-popup to="/tools/estimador-esforco">
                <q-item-section avatar>
                  <q-icon name="straighten" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Estimador de Esforço</q-item-label>
                </q-item-section>
              </q-item>

              <q-item clickable v-close-popup to="/tools/calculadora-esg">
                <q-item-section avatar>
                  <q-icon name="eco" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Calculadora ESG</q-item-label>
                </q-item-section>
              </q-item>

              <q-separator />

              <q-item clickable v-close-popup href="https://bpmn.uipath.com/" target="_blank">
                <q-item-section avatar>
                  <q-icon name="schema" color="accent" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold text-accent"
                    >UiPath BPMN Modeler <q-icon name="open_in_new" size="xs"
                  /></q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>

          <q-btn
            unelevated
            color="accent"
            label="Contato"
            @click="scrollTo('contact')"
            class="hover-scale text-weight-bold q-px-md rounded-borders q-mr-sm"
          />

          <!-- Usuário não logado -->
          <q-btn
            v-if="!authStore.user && settingsStore.settings.login_enabled"
            flat
            label="Entrar"
            icon="login"
            class="text-weight-bold nav-btn"
            @click="loginDialog = true"
          />

          <!-- Usuário logado -->
          <q-btn-dropdown v-else flat class="nav-btn text-weight-bold" no-icon-animation>
            <template #label>
              <q-avatar size="28px" color="primary" text-color="white" class="q-mr-xs" style="font-size: 13px">
                {{ userInitial }}
              </q-avatar>
              <span class="gt-sm">{{ userName }}</span>
            </template>
            <q-list>
              <q-item clickable v-close-popup to="/minha-area">
                <q-item-section avatar><q-icon name="school" color="primary" /></q-item-section>
                <q-item-section class="text-weight-bold">Minha Área</q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable v-close-popup @click="handleLogout">
                <q-item-section avatar><q-icon name="logout" color="negative" /></q-item-section>
                <q-item-section class="text-weight-bold text-negative">Sair</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>
        <div class="xs">
          <q-btn
            flat
            round
            dense
            icon="menu"
            class="text-primary"
            @click="leftDrawerOpen = !leftDrawerOpen"
          />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" side="right" bordered overlay class="bg-white">
      <q-list class="q-pt-lg">

        <q-item v-if="settingsStore.settings.courses_enabled" clickable v-ripple @click="routeToAndClose('/cursos')">
          <q-item-section avatar>
            <q-icon name="school" color="primary" />
          </q-item-section>
          <q-item-section class="text-weight-bold text-primary">Cursos</q-item-section>
        </q-item>

        <q-item v-if="settingsStore.settings.blog_enabled" clickable v-ripple @click="routeToAndClose('/blog')">
          <q-item-section avatar>
            <q-icon name="article" color="primary" />
          </q-item-section>
          <q-item-section class="text-weight-bold text-primary">Blog</q-item-section>
        </q-item>

        <q-separator class="q-my-sm" />

        <q-item-label header class="text-weight-bold text-accent">FERRAMENTAS (TOOLS)</q-item-label>

        <q-item clickable v-ripple @click="routeToAndClose('/tools/calculadora-roi')">
          <q-item-section avatar>
            <q-icon name="calculate" color="secondary" />
          </q-item-section>
          <q-item-section>Calculadora de ROI</q-item-section>
        </q-item>

        <q-item clickable v-ripple @click="routeToAndClose('/tools/viabilidade-processos')">
          <q-item-section avatar>
            <q-icon name="fact_check" color="secondary" />
          </q-item-section>
          <q-item-section>Matriz de Viabilidade</q-item-section>
        </q-item>

        <q-item clickable v-ripple @click="routeToAndClose('/tools/estimador-esforco')">
          <q-item-section avatar>
            <q-icon name="straighten" color="secondary" />
          </q-item-section>
          <q-item-section>Estimador de Esforço</q-item-section>
        </q-item>

        <q-item clickable v-ripple @click="routeToAndClose('/tools/calculadora-esg')">
          <q-item-section avatar>
            <q-icon name="eco" color="secondary" />
          </q-item-section>
          <q-item-section>Calculadora ESG</q-item-section>
        </q-item>

        <q-separator />

        <q-item clickable v-ripple href="https://bpmn.uipath.com/" target="_blank">
          <q-item-section avatar>
            <q-icon name="schema" color="accent" />
          </q-item-section>
          <q-item-section class="text-weight-bold text-accent">UiPath BPMN Modeler</q-item-section>
          <q-item-section side>
            <q-icon name="open_in_new" size="xs" color="accent" />
          </q-item-section>
        </q-item>

        <q-separator class="q-my-md" />

        <q-item clickable v-ripple @click="scrollToAndClose('contact')">
          <q-item-section avatar>
            <q-icon name="mail" color="primary" />
          </q-item-section>
          <q-item-section class="text-weight-bold text-primary">Contato</q-item-section>
        </q-item>

        <q-separator class="q-my-md" />

        <!-- Auth no drawer mobile -->
        <template v-if="!authStore.user && settingsStore.settings.login_enabled">
          <q-item clickable v-ripple @click="leftDrawerOpen = false; loginDialog = true">
            <q-item-section avatar><q-icon name="login" color="primary" /></q-item-section>
            <q-item-section class="text-weight-bold text-primary">Entrar / Cadastrar</q-item-section>
          </q-item>
        </template>
        <template v-else>
          <q-item clickable v-ripple @click="routeToAndClose('/minha-area')">
            <q-item-section avatar><q-icon name="school" color="primary" /></q-item-section>
            <q-item-section class="text-weight-bold text-primary">Minha Área</q-item-section>
          </q-item>
          <q-item clickable v-ripple @click="handleLogout">
            <q-item-section avatar><q-icon name="logout" color="negative" /></q-item-section>
            <q-item-section class="text-weight-bold text-negative">Sair</q-item-section>
          </q-item>
        </template>
      </q-list>
    </q-drawer>

    <!-- Dialog de login -->
    <q-dialog v-model="loginDialog">
      <q-card class="q-pa-xl" style="border-radius: 16px">
        <AuthForm @success="loginDialog = false" />
      </q-card>
    </q-dialog>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { scroll } from 'quasar'
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from 'stores/authStore'
import { useSettingsStore } from 'stores/settingsStore'
import AuthForm from 'src/components/AuthForm.vue'

const { getScrollTarget, setVerticalScrollPosition } = scroll
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()

const leftDrawerOpen = ref(false)
const loginDialog = ref(false)

const userName = computed(() => {
  const meta = authStore.user?.user_metadata
  return meta?.full_name?.split(' ')[0] || authStore.user?.email?.split('@')[0] || 'Aluno'
})

const userInitial = computed(() => userName.value.charAt(0).toUpperCase())

async function handleLogout() {
  await authStore.logout()
  router.push('/')
}

function scrollTo(id) {
  if (route.path !== '/') {
    router.push('/').then(() => {
      setTimeout(() => {
        doScroll(id)
      }, 500)
    })
    return
  }
  doScroll(id)
}

function scrollToAndClose(id) {
  leftDrawerOpen.value = false
  scrollTo(id)
}

function routeToAndClose(path) {
  leftDrawerOpen.value = false
  router.push(path)
}

function doScroll(id) {
  const el = document.getElementById(id)
  if (el) {
    const target = getScrollTarget(el)
    const offset = el.offsetTop - 60
    const duration = 500
    setVerticalScrollPosition(target, offset, duration)
  }
}
</script>

<style scoped>
.glass-header {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.nav-btn {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  background: rgba(3, 72, 148, 0.05);
  color: var(--q-accent) !important;
}

.logo-hover:hover {
  transform: scale(1.05);
}
</style>
