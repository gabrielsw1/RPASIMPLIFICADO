<template>
  <q-page class="bg-surface padding-y-lg q-pa-md text-dark">
    <div class="max-width-p mx-auto">
      <div class="text-center q-mb-xl">
        <q-icon name="straighten" size="xl" color="accent" class="q-mb-md" />
        <h2 class="text-h3 text-weight-bold text-primary q-mb-sm">Estimador de Esforço (T-Shirt Sizing)</h2>
        <p class="text-h6 text-secondary q-mb-md">Calcule rapidamente o quão complexa é sua automação e o tempo de desenvolvimento em semanas (Sprint Sizing).</p>
        <div class="glow-line bg-accent mx-auto"></div>
      </div>

      <div class="row q-col-gutter-xl justify-center">
        <!-- Inputs Column -->
        <div class="col-12 col-md-7">
          <q-card class="clean-card shadow-2">
            <q-card-section class="bg-primary text-white row items-center">
              <q-icon name="tune" size="sm" class="q-mr-sm" />
              <div class="text-h6 text-weight-bold">Grau de Complexidade do Robô</div>
            </q-card-section>
            
            <q-card-section class="q-gutter-md q-py-lg row justify-center">
              <div class="col-12 col-sm-6 text-center flex flex-center column">
                 <div class="text-subtitle2 text-primary text-weight-bold q-mb-sm text-center">Telas/Sistemas Navegados</div>
                 <q-knob v-model="screens" :min="1" :max="15" size="100px" color="accent" track-color="orange-1" show-value font-size="20px" class="q-mx-auto text-primary text-weight-bolder" />
                 <div class="text-caption text-grey-6 q-mt-sm text-center">Quantidade</div>
              </div>

              <div class="col-12 col-sm-6 text-center flex flex-center column">
                 <div class="text-subtitle2 text-primary text-weight-bold q-mb-sm text-center">Variações Lógicas (Ifs)</div>
                 <q-knob v-model="businessRules" :min="1" :max="20" size="100px" color="accent" track-color="orange-1" show-value font-size="20px" class="q-mx-auto text-primary text-weight-bolder" />
                 <div class="text-caption text-grey-6 q-mt-sm text-center">Quantidade Média</div>
              </div>

              <q-separator class="col-12 bg-grey-3 q-my-md" />

              <div class="col-12">
                 <div class="text-subtitle1 text-primary text-weight-bold q-mb-md">Tecnologias Envolvidas</div>
                 <q-list bordered separator class="rounded-borders">
                   <q-item tag="label" v-ripple>
                     <q-item-section avatar><q-toggle color="accent" v-model="hasCitrix" /></q-item-section>
                     <q-item-section>
                       <q-item-label class="text-weight-bold">Citrix / Máquina Remota / Mainframe</q-item-label>
                       <q-item-label caption>A automação lidará apenas com imagens da tela, não podendo espiar o código das janelas ativas (Ex: SAP VDI).</q-item-label>
                     </q-item-section>
                   </q-item>
                   
                   <q-item tag="label" v-ripple>
                     <q-item-section avatar><q-toggle color="accent" v-model="hasOcr" /></q-item-section>
                     <q-item-section>
                       <q-item-label class="text-weight-bold">Extração de Texto Complexo (OCR / IA Generativa)</q-item-label>
                       <q-item-label caption>Ler PDFs escaneados, usar LLMs ou visão computacional para interpretar dados visuais.</q-item-label>
                     </q-item-section>
                   </q-item>

                   <q-item tag="label" v-ripple>
                     <q-item-section avatar><q-toggle color="accent" v-model="hasApi" /></q-item-section>
                     <q-item-section>
                       <q-item-label class="text-weight-bold">Interação com Banco de Dados / APIs</q-item-label>
                       <q-item-label caption>O robô atuará no backend interagindo profundamente com banco (SQL) e consumo de APIs Rest (Integração forte).</q-item-label>
                     </q-item-section>
                   </q-item>

                   <q-item tag="label" v-ripple>
                     <q-item-section avatar><q-toggle color="accent" v-model="hasAgentic" /></q-item-section>
                     <q-item-section>
                       <q-item-label class="text-weight-bold text-primary">Agentic Automation (Agentes / LLMs)</q-item-label>
                       <q-item-label caption>O robô tomará decisões dinâmicas não mapeadas, exigindo Prompt Engineering, validação de alucinações e orquestração avançada com IA.</q-item-label>
                     </q-item-section>
                   </q-item>
                 </q-list>
              </div>

            </q-card-section>
          </q-card>
        </div>

        <!-- Results Column -->
        <div class="col-12 col-md-5 flex column">
          <q-card class="clean-card shadow-4 bg-white full-height flex column">
            <q-card-section class="q-pa-xl text-center flex-grow-1 flex column justify-center items-center relative-position">
               
               <div class="text-subtitle1 text-weight-bold text-dark q-mb-md">Classificação "T-Shirt Sizing"</div>
               
               <div class="tshirt-size bg-primary row flex-center shadow-4 q-mb-lg" :class="sizeClass">
                 <span>{{ finalSize }}</span>
               </div>
               
               <h3 class="text-h5 text-weight-bold text-dark q-mb-xs">Esforço: {{ effortCategory }}</h3>
               
               <div class="row items-center justify-center q-my-lg full-width">
                 <div class="q-pa-md bg-blue-1 rounded-borders border-accent full-width text-center">
                    <q-icon name="date_range" size="sm" color="primary" class="q-mb-sm" />
                    <div class="text-caption text-secondary text-weight-bold text-uppercase">Desenvolvimento Estimado</div>
                    <div class="text-h4 text-weight-bolder text-primary q-mt-xs">{{ durationString }}</div>
                 </div>
               </div>

               <p class="text-body2 text-grey-8 text-center q-mt-auto">
                 Esta é uma estimativa bruta focada no tempo de código ágil (PDD à Homologação do Desenvolvedor RPA Pleno) por automação individual.
               </p>

            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useMeta } from 'quasar'

useMeta({
  title: 'Estimador de Esforço RPA (T-Shirt Sizing) | RPA Simplificado',
  meta: {
    description: { name: 'description', content: 'Calcule rapidamente a complexidade do seu robô e o tempo de desenvolvimento em semanas (Sprint Sizing) com nosso Estimador gratuito de Esforço.' },
    keywords: { name: 'keywords', content: 'Estimador de esforço RPA, T-Shirt Sizing RPA, Complexidade robô, Tempo desenvolvimento RPA, Sprint Sizing' },
    ogTitle: { property: 'og:title', content: 'Estimador de Esforço RPA | RPA Simplificado' },
    ogDesc: { property: 'og:description', content: 'Calcule rapidamente a complexidade do seu robô e o tempo de desenvolvimento em semanas.' }
  }
})

const screens = ref(3)
const businessRules = ref(5)
const hasCitrix = ref(false)
const hasOcr = ref(false)
const hasApi = ref(false)
const hasAgentic = ref(false)

const score = computed(() => {
  let points = 0
  
  // Baselines
  points += screens.value * 2
  points += businessRules.value * 1.5
  
  // Multipliers/Addifiers
  if (hasCitrix.value) points += 12 // Citrix immediately turns it complex
  if (hasOcr.value) points += 15 // AI/OCR demands high validation tuning
  if (hasApi.value) points += 5
  if (hasAgentic.value) points += 18 // Agentic requires prompt tuning, eval loops and dynamic handling
  
  return points
})

const tShirtCalc = computed(() => {
  if (score.value <= 15) return { size: 'S', name: 'Simples', weeks: '1 a 2 Semanas', cls: 'size-s' }
  if (score.value <= 35) return { size: 'M', name: 'Médio', weeks: '3 a 4 Semanas', cls: 'size-m' }
  if (score.value <= 60) return { size: 'L', name: 'Complexo', weeks: '5 a 8 Semanas', cls: 'size-l' }
  return { size: 'XL', name: 'Hiper-Automação', weeks: '8+ Semanas', cls: 'size-xl' }
})

const finalSize = computed(() => tShirtCalc.value.size)
const effortCategory = computed(() => tShirtCalc.value.name)
const durationString = computed(() => tShirtCalc.value.weeks)
const sizeClass = computed(() => tShirtCalc.value.cls)

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

.tshirt-size {
  border-radius: 20px;
  color: white;
  font-weight: 900;
  transition: all 0.3s ease;
}
.tshirt-size span {
  font-size: 3rem;
  letter-spacing: -2px;
}
.size-s {
  width: 100px;
  height: 100px;
  background: #4caf50 !important; /* Green */
}
.size-m {
  width: 120px;
  height: 120px;
  background: #2196f3 !important; /* Blue */
}
.size-l {
  width: 140px;
  height: 140px;
  background: #ff9800 !important; /* Orange */
}
.size-xl {
  width: 160px;
  height: 160px;
  background: #f44336 !important; /* Red */
}
.border-accent {
  border-left: 5px solid #ff6500;
}
</style>
