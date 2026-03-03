<template>
  <router-view />
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/authStore'
import { useSettingsStore } from 'stores/settingsStore'

const router = useRouter()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()

onMounted(() => {
  authStore.init()
  settingsStore.init()
})

watch(
  () => authStore.pendingReturn,
  (path) => {
    if (path) {
      router.push(path)
      authStore.pendingReturn = null
    }
  },
)
</script>
