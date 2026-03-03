<template>
  <div style="width: 360px; max-width: 100%">
    <div class="text-center q-mb-lg">
      <img src="~assets/logo_rpa.png" style="height: 40px" />
      <div class="text-subtitle1 text-weight-bold text-primary q-mt-sm">
        {{ tab === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta' }}
      </div>
    </div>

    <q-tabs v-model="tab" dense align="justify" active-color="primary" indicator-color="accent" class="q-mb-lg">
      <q-tab name="login" label="Entrar" />
      <q-tab name="signup" label="Criar Conta" />
    </q-tabs>

    <q-tab-panels v-model="tab" animated>
      <!-- LOGIN -->
      <q-tab-panel name="login" class="q-pa-none">
        <q-form @submit.prevent="handleLogin">
          <q-input
            v-model="email"
            type="email"
            label="E-mail"
            outlined
            dense
            class="q-mb-sm"
            :rules="[v => !!v || 'Obrigatório']"
            lazy-rules
          />
          <q-input
            v-model="password"
            :type="showPwd ? 'text' : 'password'"
            label="Senha"
            outlined
            dense
            class="q-mb-md"
            :rules="[v => !!v || 'Obrigatório']"
            lazy-rules
          >
            <template #append>
              <q-icon
                :name="showPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showPwd = !showPwd"
              />
            </template>
          </q-input>
          <q-btn
            type="submit"
            unelevated
            color="primary"
            label="Entrar"
            class="full-width text-weight-bold"
            :loading="loading"
          />
        </q-form>
      </q-tab-panel>

      <!-- CADASTRO -->
      <q-tab-panel name="signup" class="q-pa-none">
        <div v-if="signupDone" class="text-center q-py-lg">
          <q-icon name="mark_email_read" size="56px" color="positive" />
          <p class="text-body1 text-weight-bold q-mt-md">Conta criada!</p>
          <p class="text-body2 text-grey-7">Verifique seu e-mail para confirmar antes de entrar.</p>
          <q-btn
            flat
            dense
            color="primary"
            label="Ir para Login"
            @click="tab = 'login'; signupDone = false"
          />
        </div>
        <q-form v-else @submit.prevent="handleSignup">
          <q-input
            v-model="name"
            label="Nome completo"
            outlined
            dense
            class="q-mb-sm"
            :rules="[v => !!v || 'Obrigatório']"
            lazy-rules
          />
          <q-input
            v-model="email"
            type="email"
            label="E-mail"
            outlined
            dense
            class="q-mb-sm"
            :rules="[v => !!v || 'Obrigatório']"
            lazy-rules
          />
          <q-input
            v-model="password"
            :type="showPwd ? 'text' : 'password'"
            label="Senha"
            outlined
            dense
            class="q-mb-sm"
            :rules="[v => (v?.length >= 6) || 'Mínimo 6 caracteres']"
            lazy-rules
          >
            <template #append>
              <q-icon
                :name="showPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showPwd = !showPwd"
              />
            </template>
          </q-input>
          <q-input
            v-model="confirmPassword"
            :type="showPwd ? 'text' : 'password'"
            label="Confirmar senha"
            outlined
            dense
            class="q-mb-md"
            :rules="[v => v === password || 'Senhas não conferem']"
            lazy-rules
          />
          <q-btn
            type="submit"
            unelevated
            color="primary"
            label="Criar Conta"
            class="full-width text-weight-bold"
            :loading="loading"
          />
        </q-form>
      </q-tab-panel>
    </q-tab-panels>

    <div v-if="errorMsg" class="text-negative text-caption text-center q-mt-sm">
      {{ errorMsg }}
    </div>

    <div class="row items-center q-my-md">
      <div class="col"><q-separator /></div>
      <div class="text-caption text-grey-5 q-px-sm">ou</div>
      <div class="col"><q-separator /></div>
    </div>

    <q-btn
      outline
      class="full-width text-weight-bold linkedin-btn"
      :loading="linkedinLoading"
      @click="handleLinkedIn"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="#0A66C2" class="q-mr-sm">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
      Continuar com LinkedIn
    </q-btn>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from 'stores/authStore'

const emit = defineEmits(['success'])

const route = useRoute()
const authStore = useAuthStore()

const tab = ref('login')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const name = ref('')
const showPwd = ref(false)
const loading = ref(false)
const linkedinLoading = ref(false)
const errorMsg = ref('')
const signupDone = ref(false)

async function handleLogin() {
  errorMsg.value = ''
  loading.value = true
  try {
    await authStore.login(email.value, password.value)
    emit('success')
  } catch (e) {
    errorMsg.value = e.message || 'E-mail ou senha incorretos'
  } finally {
    loading.value = false
  }
}

async function handleSignup() {
  errorMsg.value = ''
  loading.value = true
  try {
    const data = await authStore.signup(email.value, password.value, name.value)
    // Se confirmação de email está desativada, Supabase já retorna a sessão
    if (data?.session) {
      emit('success')
    } else {
      signupDone.value = true
    }
  } catch (e) {
    errorMsg.value = e.message || 'Erro ao criar conta'
  } finally {
    loading.value = false
  }
}

async function handleLinkedIn() {
  linkedinLoading.value = true
  const returnPath = authStore.pendingReturn || (route.path !== '/entrar' ? route.fullPath : '/minha-area')
  await authStore.loginWithLinkedIn(returnPath)
}
</script>

<style scoped>
.linkedin-btn {
  color: #0a66c2;
  border-color: #0a66c2;
}
.linkedin-btn:hover {
  background: rgba(10, 102, 194, 0.05);
}
</style>
