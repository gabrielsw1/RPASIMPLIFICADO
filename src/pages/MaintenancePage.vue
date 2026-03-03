<template>
  <q-page class="maintenance-page flex flex-center">
    <div class="maintenance-content text-center">
      <div class="maintenance-icon-wrap q-mb-lg">
        <q-icon name="build_circle" size="72px" color="primary" />
      </div>
      <h1 class="maintenance-title">Em Manutenção</h1>
      <p class="maintenance-msg">{{ message }}</p>
      <q-btn
        unelevated
        color="primary"
        label="Voltar ao Início"
        icon="home"
        to="/"
        class="q-mt-lg"
        style="border-radius: 8px;"
      />
    </div>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSettingsStore } from 'stores/settingsStore'

const route = useRoute()
const settingsStore = useSettingsStore()

const message = computed(() => {
  const secao = route.query.secao
  if (secao) {
    const sectionMessages = {
      blog: 'O Blog está temporariamente desabilitado. Volte em breve!',
      cursos: 'A área de Cursos está temporariamente desabilitada. Volte em breve!',
    }
    if (sectionMessages[secao]) return sectionMessages[secao]
  }
  return settingsStore.settings.maintenance_message || 'Esta seção está temporariamente indisponível. Volte em breve!'
})
</script>

<style scoped>
.maintenance-page {
  background: linear-gradient(135deg, #f0f4fb 0%, #e8eef8 100%);
  min-height: 100vh;
}

.maintenance-content {
  max-width: 480px;
  padding: 48px 32px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 32px rgba(3, 72, 148, 0.08);
  border: 1px solid rgba(3, 72, 148, 0.07);
}

.maintenance-icon-wrap {
  display: flex;
  justify-content: center;
}

.maintenance-title {
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 12px;
}

.maintenance-msg {
  font-size: 16px;
  color: #64748b;
  margin: 0;
  line-height: 1.6;
}
</style>
