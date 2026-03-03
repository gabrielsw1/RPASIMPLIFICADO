<template>
  <div class="row" style="min-height: 100vh">

    <!-- Painel esquerdo -->
    <div class="col-auto login-brand-panel gt-sm">
      <div class="login-brand-inner">
        <div class="login-brand-logo">
          <q-icon name="precision_manufacturing" size="28px" color="white" />
        </div>
        <div class="text-h5 text-weight-bold text-white q-mt-md">RPA Simplificado</div>
        <div class="text-caption text-blue-3 q-mb-xl">Painel de Administração</div>
        <q-item dark class="q-px-none q-mb-sm">
          <q-item-section avatar><q-icon name="school" size="16px" color="blue-3" /></q-item-section>
          <q-item-section class="text-blue-2 text-caption">Gerencie cursos e alunos</q-item-section>
        </q-item>
        <q-item dark class="q-px-none q-mb-sm">
          <q-item-section avatar><q-icon name="forum" size="16px" color="blue-3" /></q-item-section>
          <q-item-section class="text-blue-2 text-caption">Responda dúvidas em tempo real</q-item-section>
        </q-item>
        <q-item dark class="q-px-none">
          <q-item-section avatar><q-icon name="article" size="16px" color="blue-3" /></q-item-section>
          <q-item-section class="text-blue-2 text-caption">Publique conteúdo no blog</q-item-section>
        </q-item>
      </div>
    </div>

    <!-- Painel direito: formulário -->
    <div class="col flex flex-center bg-grey-1">
      <q-card flat bordered style="width: 100%; max-width: 400px" class="q-pa-lg q-ma-md">

        <q-card-section class="q-pb-sm">
          <div class="text-caption text-primary text-weight-bold q-mb-xs" style="letter-spacing: 0.1em; text-transform: uppercase">Área restrita</div>
          <div class="text-h5 text-weight-bold text-grey-9">Entrar no painel</div>
          <div class="text-caption text-grey-6 q-mt-xs">Acesso exclusivo para administradores</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="handleLogin">
            <q-input
              v-model="email"
              type="email"
              label="E-mail"
              outlined
              dense
              class="q-mb-md"
              :rules="[(v) => !!v || 'Informe o e-mail']"
            >
              <template #prepend><q-icon name="mail_outline" /></template>
            </q-input>

            <q-input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              label="Senha"
              outlined
              dense
              class="q-mb-lg"
              :rules="[(v) => !!v || 'Informe a senha']"
            >
              <template #prepend><q-icon name="lock_outline" /></template>
              <template #append>
                <q-icon
                  :name="showPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>

            <q-banner v-if="errorMsg" class="bg-negative text-white rounded-borders q-mb-md" dense>
              <template #avatar><q-icon name="error_outline" /></template>
              {{ errorMsg }}
            </q-banner>

            <q-btn
              type="submit"
              label="Entrar"
              color="primary"
              unelevated
              no-caps
              class="full-width"
              size="md"
              :loading="loading"
            />
          </q-form>
        </q-card-section>

      </q-card>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMsg = ref('')

async function handleLogin() {
  errorMsg.value = ''
  loading.value = true
  try {
    await authStore.login(email.value, password.value)
    router.push('/admin/posts')
  } catch {
    errorMsg.value = 'Credenciais inválidas. Verifique o e-mail e senha.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-brand-panel {
  width: 380px;
  background: #0f172a;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.login-brand-inner {
  width: 100%;
}

.login-brand-logo {
  width: 52px;
  height: 52px;
  background: #034894;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
