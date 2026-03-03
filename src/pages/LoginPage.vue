<template>
  <q-page class="flex flex-center login-bg q-pa-md">
    <q-card flat bordered class="q-pa-xl login-card">
      <AuthForm @success="onSuccess" />
    </q-card>
  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/authStore'
import AuthForm from 'src/components/AuthForm.vue'

const router = useRouter()
const authStore = useAuthStore()

function onSuccess() {
  const returnPath = authStore.pendingReturn
  authStore.pendingReturn = null
  router.push(returnPath || '/minha-area')
}
</script>

<style scoped>
.login-bg {
  background: linear-gradient(135deg, #f0f7ff 0%, #e8f4f8 100%);
  min-height: 100vh;
}

.login-card {
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(3, 72, 148, 0.08);
}
</style>
