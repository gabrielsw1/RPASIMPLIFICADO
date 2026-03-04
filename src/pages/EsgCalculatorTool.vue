<template>
  <q-page class="bg-surface padding-y-lg q-pa-md text-dark">
    <div class="max-width-p mx-auto">
      <div class="text-center q-mb-xl">
        <q-icon name="eco" size="xl" color="green-6" class="q-mb-md" />
        <h2 class="text-h3 text-weight-bold text-primary q-mb-sm">Calculadora de Impacto ESG</h2>
        <p class="text-h6 text-secondary q-mb-md">Robôs não apenas salvam dinheiro, salvam o planeta. Descubra a sustentabilidade via automação (Green IT).</p>
        <div class="glow-line bg-green-5 mx-auto"></div>
      </div>

      <div class="row q-col-gutter-xl justify-center">
        <!-- Inputs Column -->
        <div class="col-12 col-md-5">
          <q-card class="clean-card shadow-2">
            <q-card-section class="bg-primary text-white row items-center">
              <q-icon name="park" size="sm" class="q-mr-sm" />
              <div class="text-h6 text-weight-bold">Esforço Operacional Reduzido</div>
            </q-card-section>
            
            <q-card-section class="q-gutter-md q-py-lg">
              <div class="text-caption text-grey-8 q-mb-md">Preencha com dados gerados **apenas se a atividade fosse manual**.</div>
              
              <q-input outlined v-model.number="volumeAno" type="number" label="Transações ANUAIS" :rules="[val => val >= 0 || 'Obrigatório']">
                <template v-slot:prepend><q-icon name="repeat" /></template>
              </q-input>

              <q-separator class="q-my-md bg-grey-3" />
              <div class="text-subtitle2 text-primary text-weight-bold">Papel (Desmaterialização)</div>

              <q-input outlined v-model.number="folhasPorTrans" type="number" label="Folhas impressas por transação" hint="Se era um processo digital deixe em zero.">
                <template v-slot:prepend><q-icon name="description" /></template>
              </q-input>

              <q-separator class="q-my-md bg-grey-3" />
              <div class="text-subtitle2 text-primary text-weight-bold">Sinergia e Eletricidade</div>

              <q-input outlined v-model.number="tmaMinutos" type="number" label="TMA em minutos (Humano)" hint="Computador ligado desperdiçando energia">
                <template v-slot:prepend><q-icon name="timer" /></template>
              </q-input>
              <q-input outlined v-model.number="coletaLixo" type="number" label="KM de Viagem / Transporte (Mês)" hint="Gasolina gasta mensalmente evitada (Transporte de contrato/Office)">
                <template v-slot:prepend><q-icon name="directions_car" /></template>
              </q-input>

              <q-separator class="q-my-md bg-grey-3" />
              <div class="text-subtitle2 text-primary text-weight-bold">Social & Agentic Automation</div>
              <q-item tag="label" v-ripple class="q-px-none">
                <q-item-section avatar><q-toggle color="accent" v-model="useAgentic" /></q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold text-dark">Automação Agêntica (IA)</q-item-label>
                  <q-item-label caption>A automação removerá o peso da tomada de decisão e leitura crítica, liberando a carga cognitiva dos funcionários.</q-item-label>
                </q-item-section>
              </q-item>
            </q-card-section>
          </q-card>
        </div>

        <!-- Results Column -->
        <div class="col-12 col-md-7 flex column">
          <q-card class="clean-card shadow-4 bg-white full-height flex column">
            <q-card-section class="q-pa-xl text-center flex-grow-1 flex column">
               <div class="text-h4 text-weight-bold text-dark q-mb-xl">Impacto Ambiental Salvo (Ao Ano)</div>

               <div class="row q-col-gutter-lg justify-center flex-grow-1">
                 
                 <!-- Árvores -->
                 <div class="col-12 col-sm-6">
                   <q-card class="bg-green-1 shadow-2 text-center q-pa-md h-100">
                     <q-icon name="forest" size="xl" color="green-7" />
                     <div class="text-h3 text-weight-bolder text-green-7 q-my-sm">{{ treesSaved }}</div>
                     <div class="text-subtitle1 text-weight-bold text-dark">Árvores Salvas</div>
                     <div class="text-caption text-grey-7 q-mt-xs">Evitou-se a produção de {{ folhasPorAno }} folhas de papel virgem. Extinção da burocracia física.</div>
                   </q-card>
                 </div>

                 <!-- Água -->
                 <div class="col-12 col-sm-6">
                   <q-card class="bg-light-blue-1 shadow-2 text-center q-pa-md h-100">
                     <q-icon name="water_drop" size="xl" color="light-blue-7" />
                     <div class="text-h3 text-weight-bolder text-light-blue-7 q-my-sm">{{ waterSavedStr }}</div>
                     <div class="text-subtitle1 text-weight-bold text-dark">Litros de Água Preservados</div>
                     <div class="text-caption text-grey-7 q-mt-xs">Redução no consumo da indústria fabril (10L de água desperdiçados a cada folha de papel nova).</div>
                   </q-card>
                 </div>

                 <!-- Carbono / Eletricidade -->
                 <div class="col-12 mt-md q-mt-md">
                   <q-card class="bg-orange-1 shadow-2 text-center q-pa-lg">
                     <div class="row items-center">
                       <div class="col-4 text-center">
                         <q-icon name="co2" size="xl" color="deep-orange-7" />
                         <div class="text-subtitle1 text-weight-bold text-dark q-mt-sm">Carbono Prevenido</div>
                       </div>
                       <div class="col-8 text-left border-left-lg q-pl-lg">
                         <div class="text-h3 text-weight-bolder text-deep-orange-7 q-mb-xs">{{ co2SavedStr }} kg</div>
                         <div class="text-caption text-grey-8">Devido ao maquinário desktop desligado ({{ hoursSavedStr }} horas otimizadas via automação headless) e redução de quilometragem fóssil da frota. Menos luz e poluição.</div>
                       </div>
                     </div>
                   </q-card>
                 </div>

                 <!-- Carga Cognitiva (Agentic) -->
                 <div class="col-12 q-mt-md" v-if="useAgentic">
                   <q-card class="bg-purple-1 shadow-2 text-center q-pa-lg">
                     <div class="row items-center">
                       <div class="col-4 text-center">
                         <q-icon name="psychology" size="xl" color="purple-7" />
                         <div class="text-subtitle1 text-weight-bold text-dark q-mt-sm">Decisões Cognitivas Poupadas</div>
                       </div>
                       <div class="col-8 text-left border-left-purple q-pl-lg">
                         <div class="text-h3 text-weight-bolder text-purple-7 q-mb-xs">{{ volumeAnoStr }}</div>
                         <div class="text-caption text-grey-8">Impacto direto no "S" (Social) do ESG: Burnout evitado. A IA tomou decisões complexas que geravam fadiga mental, liberando o intelecto humano para inovação e empatia.</div>
                       </div>
                     </div>
                   </q-card>
                 </div>

               </div>
               
               <p class="text-body2 text-grey-6 text-center q-mt-xl">
                 Os cálculos são medianas globais padrão ESG. 1 Árvore = ~8333 folhas de papel. 1 Folha = ~10 Litros de Água. Eletricidade PC: ~60g CO2/Hora. Gasolina: ~2.3kg CO2/Litro.
               </p>

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
  title: 'Calculadora de Impacto ESG em Automação | RPA Simplificado',
  meta: {
    description: { name: 'description', content: 'Robôs não salvam apenas dinheiro, salvam o planeta. Descubra o impacto ESG da sua automação (Green IT e Burnout reduzido).' },
    keywords: { name: 'keywords', content: 'ESG RPA, Green IT, Sustentabilidade automação, Impacto ambiental RPA, Automação Agentic ESG' },
    ogTitle: { property: 'og:title', content: 'Calculadora de Impacto ESG em Automação | RPA Simplificado' },
    ogDesc: { property: 'og:description', content: 'Robôs não salvam apenas dinheiro, salvam o planeta. Descubra o impacto ESG da sua automação.' }
  }
})

const volumeAno = ref(12000)
const folhasPorTrans = ref(3)
const tmaMinutos = ref(20)
const coletaLixo = ref(50) // km transporte
const useAgentic = ref(false)

const folhasPorAno = computed(() => volumeAno.value * folhasPorTrans.value)
const treesSaved = computed(() => (folhasPorAno.value / 8333).toFixed(1))
const waterSaved = computed(() => folhasPorAno.value * 10)

const hoursSaved = computed(() => {
  return (volumeAno.value * tmaMinutos.value) / 60
})

const co2Saved = computed(() => {
  // 60g de carbono por hora de PC rodando (0.06 kg)
  const pcEmission = hoursSaved.value * 0.06
  // Transporte. Supondo 10km = 1L. 1L = 2.3Kg co2. -> 0.23 kg/km. x12 is anual
  const carEmission = (coletaLixo.value * 12) * 0.23
  return pcEmission + carEmission
})

const waterSavedStr = computed(() => new Intl.NumberFormat('pt-BR').format(waterSaved.value))
const co2SavedStr = computed(() => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(co2Saved.value))
const hoursSavedStr = computed(() => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(hoursSaved.value))
const volumeAnoStr = computed(() => new Intl.NumberFormat('pt-BR').format(volumeAno.value))

function getExportData () {
  const results = [
    { label: 'Folhas de Papel por Ano (evitadas)', value: `${new Intl.NumberFormat('pt-BR').format(folhasPorAno.value)} folhas` },
    { label: 'Árvores Salvas', value: `${treesSaved.value} árvores` },
    { label: 'Água Preservada', value: `${waterSavedStr.value} litros` },
    { label: 'Horas de PC Otimizadas', value: `${hoursSavedStr.value} horas` },
    { label: 'Carbono Prevenido', value: `${co2SavedStr.value} kg de CO₂` }
  ]
  if (useAgentic.value) {
    results.push({ label: 'Decisões Cognitivas Poupadas (Agentic)', value: `${volumeAnoStr.value} decisões` })
  }
  return {
    toolName: 'Calculadora de Impacto ESG em Automação',
    subtitle: 'Impacto ambiental e social gerado pela automação de processos (Green IT + Burnout reduzido).',
    params: [
      { label: 'Transações Anuais', value: new Intl.NumberFormat('pt-BR').format(volumeAno.value) },
      { label: 'Folhas Impressas por Transação', value: folhasPorTrans.value },
      { label: 'TMA em Minutos (Humano)', value: `${tmaMinutos.value} minutos` },
      { label: 'KM de Transporte por Mês', value: `${coletaLixo.value} km` },
      { label: 'Automação Agêntica (IA)', value: useAgentic.value ? 'Sim' : 'Não' }
    ],
    results
  }
}

const { exportToPDF, exportToExcel, exportingPDF, exportingExcel } = useToolExport(getExportData)

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
.h-100 {
  height: 100%;
}
.border-left-lg {
  border-left: 2px solid #ffcc80;
}
.border-left-purple {
  border-left: 2px solid #ce93d8;
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
