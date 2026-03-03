<template>
  <q-page class="admin-page q-pa-lg">
    <div style="max-width: 680px; margin: 0 auto;">

      <!-- Header -->
      <div class="q-mb-lg">
        <div class="text-h6 text-weight-bold text-dark">Configurações do Site</div>
        <div class="text-caption text-grey-6 q-mt-xs">Habilite ou desabilite seções do site publicamente.</div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex flex-center q-py-xl">
        <q-spinner color="primary" size="36px" />
      </div>

      <template v-else>
        <!-- Toggles -->
        <q-card flat bordered class="q-mb-md">
          <q-card-section>
            <div class="text-subtitle2 text-weight-bold q-mb-sm">Seções do Site</div>
            <q-list separator>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="school" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">Cursos</q-item-label>
                  <q-item-label caption>Exibe o menu de cursos e permite acesso às páginas de cursos.</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle
                    v-model="form.courses_enabled"
                    color="positive"
                    keep-color
                  />
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="article" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">Blog</q-item-label>
                  <q-item-label caption>Exibe o menu do blog e permite acesso aos posts.</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle
                    v-model="form.blog_enabled"
                    color="positive"
                    keep-color
                  />
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="login" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">Login de Usuário</q-item-label>
                  <q-item-label caption>Permite que alunos acessem a tela de login e criem contas.</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle
                    v-model="form.login_enabled"
                    color="positive"
                    keep-color
                  />
                </q-item-section>
              </q-item>

            </q-list>
          </q-card-section>
        </q-card>

        <!-- Mensagem de manutenção -->
        <q-card flat bordered class="q-mb-lg">
          <q-card-section>
            <div class="text-subtitle2 text-weight-bold q-mb-sm">Mensagem de Manutenção</div>
            <div class="text-caption text-grey-6 q-mb-md">
              Texto exibido ao visitante quando uma seção está desabilitada e a mensagem padrão da seção não se aplica.
            </div>
            <q-input
              v-model="form.maintenance_message"
              type="textarea"
              outlined
              rows="3"
              label="Mensagem"
              counter
              maxlength="500"
            />
          </q-card-section>
        </q-card>

        <!-- Status indicators -->
        <div class="q-mb-lg flex items-center gap-sm" style="gap: 8px; flex-wrap: wrap;">
          <q-chip
            v-if="!form.courses_enabled"
            icon="warning"
            color="warning"
            text-color="dark"
            dense
            label="Cursos desabilitado"
          />
          <q-chip
            v-if="!form.blog_enabled"
            icon="warning"
            color="warning"
            text-color="dark"
            dense
            label="Blog desabilitado"
          />
          <q-chip
            v-if="!form.login_enabled"
            icon="warning"
            color="warning"
            text-color="dark"
            dense
            label="Login desabilitado"
          />
          <q-chip
            v-if="form.courses_enabled && form.blog_enabled && form.login_enabled"
            icon="check_circle"
            color="positive"
            text-color="white"
            dense
            label="Tudo habilitado"
          />
        </div>

        <!-- Save button -->
        <div class="flex items-center" style="gap: 12px;">
          <q-btn
            unelevated
            color="primary"
            label="Salvar Configurações"
            icon="save"
            :loading="saving"
            @click="save"
            style="border-radius: 8px;"
          />
          <q-btn
            flat
            color="grey-7"
            label="Recarregar"
            icon="refresh"
            @click="load"
            style="border-radius: 8px;"
          />
        </div>
      </template>

    </div>

    <!-- Toast -->
    <q-dialog v-model="toastVisible" position="bottom">
      <q-banner
        :class="toastError ? 'bg-negative text-white' : 'bg-positive text-white'"
        rounded
        style="min-width: 300px"
      >
        <template #avatar>
          <q-icon :name="toastError ? 'error' : 'check_circle'" />
        </template>
        {{ toastMsg }}
      </q-banner>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useSettingsStore } from 'stores/settingsStore'
import { getAuthToken } from 'src/composables/useAuthToken'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const settingsStore = useSettingsStore()

const loading = ref(true)
const saving = ref(false)
const toastVisible = ref(false)
const toastMsg = ref('')
const toastError = ref(false)

const form = reactive({
  courses_enabled: true,
  blog_enabled: true,
  login_enabled: true,
  maintenance_message: '',
})

async function load() {
  loading.value = true
  try {
    const token = await getAuthToken()
    const { data } = await axios.get(`${API}/api/admin/settings`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    form.courses_enabled = data.courses_enabled
    form.blog_enabled = data.blog_enabled
    form.login_enabled = data.login_enabled
    form.maintenance_message = data.maintenance_message || ''
  } catch {
    showToast('Erro ao carregar configurações.', true)
  } finally {
    loading.value = false
  }
}

async function save() {
  saving.value = true
  try {
    const token = await getAuthToken()
    await axios.put(
      `${API}/api/admin/settings`,
      {
        courses_enabled: form.courses_enabled,
        blog_enabled: form.blog_enabled,
        login_enabled: form.login_enabled,
        maintenance_message: form.maintenance_message,
      },
      { headers: { Authorization: `Bearer ${token}` } },
    )
    // Sync frontend store so guards work immediately
    await settingsStore.reload()
    showToast('Configurações salvas com sucesso!')
  } catch {
    showToast('Erro ao salvar configurações.', true)
  } finally {
    saving.value = false
  }
}

function showToast(msg, isError = false) {
  toastMsg.value = msg
  toastError.value = isError
  toastVisible.value = true
  setTimeout(() => { toastVisible.value = false }, 3000)
}

onMounted(load)
</script>
