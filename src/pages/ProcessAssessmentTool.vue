<template>
  <q-page class="bg-surface padding-y-lg q-pa-md text-dark">
    <div class="max-width-p mx-auto">
      <div class="text-center q-mb-xl">
        <q-icon name="fact_check" size="xl" color="accent" class="q-mb-md" />
        <h2 class="text-h3 text-weight-bold text-primary q-mb-sm">Matriz de Viabilidade (Assessment)</h2>
        <p class="text-h6 text-secondary q-mb-md">Descubra se o seu processo manual tem o "Fit" perfeito para automação RPA.</p>
        <div class="glow-line bg-accent mx-auto"></div>
      </div>

      <div class="row q-col-gutter-xl justify-center">
        <!-- Inputs Column -->
        <div class="col-12 col-md-6">
          <q-card class="clean-card shadow-2">
            <q-card-section class="bg-primary text-white row items-center">
              <q-icon name="quiz" size="sm" class="q-mr-sm" />
              <div class="text-h6 text-weight-bold">Características do Processo</div>
            </q-card-section>
            
            <q-card-section class="q-gutter-md q-py-lg">
              <q-item tag="label" v-ripple class="bg-blue-1 rounded-borders q-mb-md">
                <q-item-section avatar>
                  <q-toggle color="accent" v-model="useAi" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold text-primary">Considerar Agentic Automation (Uso de IA)</q-item-label>
                  <q-item-label caption>Ative se a automação puder usar Agentes Autônomos (LLMs) para tomar decisões, interpretar dados desestruturados e ler e-mails.</q-item-label>
                </q-item-section>
              </q-item>

              <div>
                <div class="text-subtitle1 text-weight-bold">1. O processo é baseado em regras claras?</div>
                <div class="text-caption text-grey-7 q-mb-sm">O funcionário segue um manual exato e repetitivo, sem a necessidade de decisões "emocionais" ou criativas?</div>
                <q-slider v-model="ruleBased" :min="0" :max="10" label color="accent" />
                <div class="row justify-between text-caption text-primary"><span>Não, cheio de exceções</span><span>Totalmente Lógico (Se.. Então)</span></div>
              </div>
              <q-separator class="q-my-md bg-grey-3" />

              <div>
                <div class="text-subtitle1 text-weight-bold">2. Os dados de entrada são digitais e estruturados?</div>
                <div class="text-caption text-grey-7 q-mb-sm">Ex: Planilhas Excel ou via API. Responda '0' se as entradas forem papéis escritos à mão ou áudios do WhatsApp.</div>
                <q-slider v-model="digitalInput" :min="0" :max="10" label color="accent" />
                <div class="row justify-between text-caption text-primary"><span>Muito Papel/Áudio</span><span>Totalmente Digital e Previsível</span></div>
              </div>
              <q-separator class="q-my-md bg-grey-3" />

              <div>
                <div class="text-subtitle1 text-weight-bold">3. Qual a estabilidade dos Sistemas usados?</div>
                <div class="text-caption text-grey-7 q-mb-sm">Interfaces mudam toda semana? Os sistemas caem muito?</div>
                <q-slider v-model="stability" :min="0" :max="10" label color="accent" />
                <div class="row justify-between text-caption text-primary"><span>Mudam muito / Instável</span><span>Nunca muda / Muito Estável</span></div>
              </div>
              <q-separator class="q-my-md bg-grey-3" />
              
              <div>
                <div class="text-subtitle1 text-weight-bold">4. Qual o Volume de Repetição?</div>
                <div class="text-caption text-grey-7 q-mb-sm">Sistemas ou tarefas realizadas centenas de vezes por mês.</div>
                <q-slider v-model="frequency" :min="0" :max="10" label color="accent" />
                <div class="row justify-between text-caption text-primary"><span>1x por Mês (Baixo)</span><span>Centenas de vezes/dia (Alto)</span></div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Results Column -->
        <div class="col-12 col-md-6 flex column">
          <q-card class="clean-card shadow-4 bg-white full-height flex column">
            <q-card-section class="q-pa-xl text-center flex-grow-1 flex column justify-center items-center">
               <q-circular-progress
                  show-value
                  font-size="24px"
                  :value="scorePercentage"
                  size="200px"
                  :thickness="0.15"
                  :color="colorScore"
                  track-color="grey-2"
                  class="q-mb-lg shadow-2 rounded-borders text-weight-bold text-dark"
               >
                 {{ scorePercentage }}%
                 <div class="text-subtitle2" style="position:absolute; bottom:30px; line-height:1; font-weight:normal; width:100%">FIT PARA RPA</div>
               </q-circular-progress>
               
               <h3 class="text-h4 text-weight-bold q-my-md" :class="colorScoreClass">{{ viabilidadeTitulo }}</h3>
               <p class="text-body1 text-grey-8 max-width-p mx-auto">
                 {{ viabilidadeTexto }}
               </p>

               <div class="q-mt-xl bg-orange-1 q-pa-md rounded-borders full-width" style="border-left: 4px solid #ff6500" v-if="scorePercentage >= 50">
                 <div class="text-weight-bold text-dark q-mb-xs">Próximo Passo</div>
                 <div class="text-grey-9 text-caption">Agora que validamos que seu processo tem potencial técnico, calcule o retorno financeiro com ele.</div>
                 <q-btn unelevated color="accent" label="Ir para Calculadora de ROI" to="/tools/calculadora-roi" class="q-mt-md hover-scale text-weight-bold full-width" />
               </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Export Section -->
      <div class="row justify-center q-mt-xl">
        <q-card flat bordered class="export-card">
          <q-card-section class="row items-center justify-center q-gutter-sm q-py-md">
            <div class="col-12 text-center text-caption text-grey-6 text-weight-bold text-uppercase q-mb-xs">Exportar Resultado</div>
            <q-btn outline icon="picture_as_pdf" label="Exportar PDF" color="negative" :loading="exportingPDF" @click="exportToPDF" class="export-btn" />
            <q-btn outline icon="table_chart" label="Exportar Excel" color="positive" :loading="exportingExcel" @click="exportToExcel" class="export-btn" />
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useMeta } from 'quasar'
import { useToolExport } from 'src/composables/useToolExport'

useMeta({
  title: 'Matriz de Viabilidade RPA | RPA Simplificado',
  meta: {
    description: { name: 'description', content: 'Faça o Assessment gratuito do seu processo e descubra se ele tem fit perfeito para ser automatizado com RPA e IA (Agentic Automation).' },
    keywords: { name: 'keywords', content: 'Assessment RPA, Viabilidade RPA, RPA fit, Agentic Automation, Calcular automação' },
    ogTitle: { property: 'og:title', content: 'Matriz de Viabilidade RPA | RPA Simplificado' },
    ogDesc: { property: 'og:description', content: 'Faça o Assessment gratuito do seu processo e descubra se ele tem fit perfeito para ser automatizado com RPA e IA.' }
  }
})

const ruleBased = ref(8)
const digitalInput = ref(7)
const stability = ref(8)
const frequency = ref(9)
const useAi = ref(false)

// Total max points = 40
const scorePercentage = computed(() => {
  let rb = ruleBased.value
  let di = digitalInput.value
  
  if (useAi.value) {
    // Com IA, regras puras e dados estritos não são mais impeditivos tão fortes.
    if (rb < 5) rb = 7 + (rb * 0.5)
    if (di < 5) di = 7 + (di * 0.5)
  }

  const points = rb + di + stability.value + frequency.value
  return Math.round((points / 40) * 100)
})

const colorScore = computed(() => {
  if (scorePercentage.value >= 75) return 'positive'
  if (scorePercentage.value >= 50) return 'warning'
  return 'negative'
})

const colorScoreClass = computed(() => {
  if (scorePercentage.value >= 75) return 'text-positive'
  if (scorePercentage.value >= 50) return 'text-orange-8'
  return 'text-negative'
})

const viabilidadeTitulo = computed(() => {
  if (useAi.value && (ruleBased.value <= 5 || digitalInput.value <= 5)) {
     if (scorePercentage.value >= 60) return 'Fit Ideal para Agentic Automation'
  }
  if (scorePercentage.value >= 80) return 'Automação Perfeita'
  if (scorePercentage.value >= 60) return 'Bom Potencial'
  if (scorePercentage.value >= 40) return 'Alto Risco (Atenção)'
  return 'Inviável para RPA Clássico'
})

function getExportData () {
  return {
    toolName: 'Matriz de Viabilidade (Assessment) RPA',
    subtitle: 'Avaliação do potencial de automação do processo com base em critérios técnicos.',
    params: [
      { label: 'Considerar Agentic Automation (IA)', value: useAi.value ? 'Sim' : 'Não' },
      { label: '1. Baseado em Regras Claras', value: `${ruleBased.value} / 10` },
      { label: '2. Dados de Entrada Digitais/Estruturados', value: `${digitalInput.value} / 10` },
      { label: '3. Estabilidade dos Sistemas', value: `${stability.value} / 10` },
      { label: '4. Volume de Repetição', value: `${frequency.value} / 10` }
    ],
    results: [
      { label: 'Score de Viabilidade', value: `${scorePercentage.value}%` },
      { label: 'Classificação', value: viabilidadeTitulo.value },
      { label: 'Análise e Recomendação', value: viabilidadeTexto.value }
    ]
  }
}

const { exportToPDF, exportToExcel, exportingPDF, exportingExcel } = useToolExport(getExportData)

const viabilidadeTexto = computed(() => {
  if (useAi.value) {
     if (scorePercentage.value >= 80) return 'Com Agentes de IA, este processo não só é automatizável como terá alta resiliência a mudanças, tomando decisões cognitivas que o RPA tradicional não conseguiria.'
     if (scorePercentage.value >= 60) return 'A IA torna possível automatizar este processo que seria difícil para o RPA clássico, lidando com os dados desestruturados e as exceções naturais do fluxo.'
     return 'Mesmo com a flexibilidade da IA, a instabilidade sistêmica grave ou baixo volume não justificam o investimento complexo da automação agêntica.'
  }

  if (scorePercentage.value >= 80) return 'Esse é o clássico processo tipo "Quick-win". Alto volume, estável e regras lógicas puras. Um robô rodará de forma muito previsível e o retorno virá muito rápido.'
  if (scorePercentage.value >= 60) return 'A automação é possível, mas talvez exija alguns contornos como leitura de anexos complexos ou adaptação de ambiente. O retorno continuará sendo bom, e o uso de Agentic Automation pode ajudar.'
  if (scorePercentage.value >= 40) return 'Você possui muita instabilidade ou falta de estruturação nos dados. Tentar colocar um robô "burro" puro aqui trará apenas dor de cabeça com manutenção. Revise a reestruturação do processo antes.'
  return 'Não automatize isso. A subjetividade humana ou papéis físicos e despadronizados impedirão sucesso da automação robótica. Considere digitalizar a área com software transacional antes de pensar em robôs.'
})

</script>

<style scoped>
.max-width-p {
  max-width: 1200px;
}
.mx-auto {
  margin-left: auto;
  margin-right: auto;
}
.glow-line {
  height: 4px;
  width: 80px;
  margin: 0 auto;
  border-radius: 2px;
}
.full-height {
  height: 100%;
}
.flex-grow-1 {
  flex-grow: 1;
}
.export-card {
  width: 100%;
  max-width: 480px;
  border-radius: 12px;
}
.export-btn {
  min-width: 160px;
}
</style>
