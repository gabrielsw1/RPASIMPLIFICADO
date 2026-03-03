<template>
  <q-page class="bg-surface padding-y-lg q-pa-md text-dark">
    <div class="max-width-p mx-auto">
      <div class="text-center q-mb-xl">
        <q-icon name="calculate" size="xl" color="accent" class="q-mb-md" />
        <h2 class="text-h3 text-weight-bold text-primary q-mb-sm">Calculadora de ROI para RPA</h2>
        <p class="text-h6 text-secondary q-mb-md">Descubra os Custos Mensais e Anuais, e o tempo de Payback da sua automação.</p>
        <div class="glow-line bg-accent mx-auto"></div>
      </div>

      <div class="row q-col-gutter-xl justify-center">
        <!-- Inputs Column -->
        <div class="col-12 col-md-5">
          <q-card class="clean-card shadow-2">
            <q-card-section class="bg-primary text-white row items-center">
              <q-icon name="settings" size="sm" class="q-mr-sm" />
              <div class="text-h6 text-weight-bold">Parâmetros do Processo</div>
            </q-card-section>
            
            <q-card-section class="q-gutter-md">
              <div class="text-subtitle1 text-weight-bold text-primary q-mt-sm">Custos do Processo Manual</div>
              
              <q-input outlined v-model.number="volumeM" type="number" label="Volume Mensal de Transações" :rules="[val => val >= 0 || 'Obrigatório']">
                <template v-slot:prepend><q-icon name="repeat" /></template>
                <template v-slot:append>
                  <q-icon name="info" class="cursor-pointer text-grey"><q-tooltip class="text-body2">Quantas vezes essa tarefa/processo é realizada em um mês.</q-tooltip></q-icon>
                </template>
              </q-input>
              
              <q-input outlined v-model.number="tmaMinutos" type="number" label="TMA (Minutos)" :rules="[val => val >= 0 || 'Obrigatório']">
                <template v-slot:prepend><q-icon name="timer" /></template>
                <template v-slot:append>
                  <q-icon name="info" class="cursor-pointer text-grey"><q-tooltip class="text-body2">Tempo Médio de Atendimento EM MINUTOS para CADA transação. Ex: Demora 15 min por cadastro.</q-tooltip></q-icon>
                </template>
              </q-input>

              <q-input outlined v-model.number="qtdPessoas" type="number" label="Pessoas Envolvidas (Qtd)" :rules="[val => val >= 0 || 'Obrigatório']">
                <template v-slot:prepend><q-icon name="groups" /></template>
                <template v-slot:append>
                  <q-icon name="info" class="cursor-pointer text-grey"><q-tooltip class="text-body2">Quantas pessoas trabalham fazendo partes ou executando esse fluxo inteiro de processo.</q-tooltip></q-icon>
                </template>
              </q-input>

              <q-input outlined v-model.number="custoHora" type="number" label="Custo Hora/Homem (R$)" prefix="R$" :rules="[val => val >= 0 || 'Obrigatório']">
                <template v-slot:prepend><q-icon name="monetization_on" /></template>
                <template v-slot:append>
                  <q-icon name="info" class="cursor-pointer text-grey"><q-tooltip class="text-body2">Valor médio da hora do colaborador. Inclua o custo total como CLT/PJ e benefícios para melhor precisão.</q-tooltip></q-icon>
                </template>
              </q-input>

              <q-input outlined v-model.number="custoErrosMes" type="number" label="Custo com Erros/Atrasos Mensal (R$)" prefix="R$" :rules="[val => val >= 0 || 'Obrigatório']">
                <template v-slot:prepend><q-icon name="warning" /></template>
                <template v-slot:append>
                  <q-icon name="info" class="cursor-pointer text-grey"><q-tooltip class="text-body2">Estimativa do prejuízo financeiro causado por falhas humanas ou retrabalho no mês atual.</q-tooltip></q-icon>
                </template>
              </q-input>

              <q-separator class="q-my-md bg-grey-3" />
              <div class="text-subtitle1 text-weight-bold text-primary">Custos da Automação (RPA)</div>

              <q-input outlined v-model.number="custoImplementacao" type="number" label="Investimento de Implantação (R$)" prefix="R$">
                <template v-slot:prepend><q-icon name="build" /></template>
                <template v-slot:append>
                  <q-icon name="info" class="cursor-pointer text-grey"><q-tooltip class="text-body2">Custo único inicial Capex (Desenvolvimento/Consultoria pela RPA Simplificado e infra inicial).</q-tooltip></q-icon>
                </template>
              </q-input>

              <q-input outlined v-model.number="custoLicencaAnual" type="number" label="Licenciamento (Anual R$)" prefix="R$">
                <template v-slot:prepend><q-icon name="vpn_key" /></template>
                <template v-slot:append>
                  <q-icon name="info" class="cursor-pointer text-grey"><q-tooltip class="text-body2">Custo anual geral da plataforma que será usada para programar e licenciar a ferramenta.</q-tooltip></q-icon>
                </template>
              </q-input>
              
              <q-input outlined v-model.number="custoManutencaoMensal" type="number" label="Manutenção / Nuvem (Mensal R$)" prefix="R$">
                <template v-slot:prepend><q-icon name="cloud_sync" /></template>
                <template v-slot:append>
                  <q-icon name="info" class="cursor-pointer text-grey"><q-tooltip class="text-body2">Sustentação dos robôs, custo de monitoramento e hospedagem em cloud todo o mês.</q-tooltip></q-icon>
                </template>
              </q-input>

              <q-input outlined v-model.number="custoLLMMensal" type="number" label="Custo IA / Tokens LLM (Mensal R$)" prefix="R$">
                <template v-slot:prepend><q-icon name="psychology" /></template>
                <template v-slot:append>
                  <q-icon name="info" class="cursor-pointer text-grey"><q-tooltip class="text-body2">Estimativa de gasto mensal com APIs de IA (OpenAI, Anthropic, etc) caso utilize Agentic Automation.</q-tooltip></q-icon>
                </template>
              </q-input>
            </q-card-section>
          </q-card>
        </div>

        <!-- Results Column -->
        <div class="col-12 col-md-7 flex column">
          <!-- Summary Cards -->
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-sm-6">
               <q-card class="bg-blue-1 shadow-1 h-100">
                 <q-card-section>
                   <div class="text-subtitle2 text-primary text-weight-bold">Gastos do Processo MANUAL</div>
                   <div class="text-dark q-mt-sm">Mensal: <strong>{{ formatCurrency(custoManualMes) }}</strong></div>
                   <div class="text-dark">Anual: <strong>{{ formatCurrency(custoManualAno) }}</strong></div>
                   <div class="text-caption q-mt-xs text-grey-7">~{{ (horasManuaisMes).toFixed(0) }} horas gastas no mês (divididas em {{ qtdPessoas }} pessoas)</div>
                 </q-card-section>
               </q-card>
            </div>
            <div class="col-12 col-sm-6">
               <q-card class="bg-orange-1 shadow-1 h-100">
                 <q-card-section>
                   <div class="text-subtitle2 text-accent text-weight-bold">Gastos Recorrentes RPA (OPEX)</div>
                   <div class="text-dark q-mt-sm">Mensal: <strong>{{ formatCurrency(custoRpaMes) }}</strong></div>
                   <div class="text-dark">Anual: <strong>{{ formatCurrency(custoRpaMes * 12) }}</strong></div>
                   <div class="text-caption q-mt-xs text-grey-7">Proporção da licença + manutenção mensal e estrutura recorrente. Exclui a implantação inicial.</div>
                 </q-card-section>
               </q-card>
            </div>
          </div>

          <!-- Payback and ROI -->
          <q-card class="clean-card shadow-4 bg-white q-mb-md">
            <q-card-section class="q-pa-md d-flex justify-around items-center row">
              <div class="col-12 col-sm-6 text-center q-pa-sm border-right">
                <div class="text-subtitle1 text-weight-bold text-dark">Tempo Estimado de Payback</div>
                <div class="text-h3 text-weight-bolder q-mt-sm" :class="paybackMeses && paybackMeses > 0 ? 'text-positive' : 'text-negative'">
                  {{ paybackMeses && paybackMeses > 0 ? paybackMeses.toFixed(1) + ' Meses' : 'Não se paga' }}
                </div>
              </div>
              
              <div class="col-12 col-sm-6 text-center q-pa-sm">
                <div class="text-subtitle1 text-weight-bold text-dark">Economia Anual (Ano 1)</div>
                <div class="text-h3 text-weight-bolder q-mt-sm" :class="economiaAno1 >= 0 ? 'text-positive' : 'text-negative'">
                  {{ formatCurrency(economiaAno1) }}
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Chart -->
          <q-card class="clean-card shadow-2 flex-grow-1">
            <q-card-section class="q-pb-none">
              <div class="text-h6 text-weight-bold text-primary row items-center">
                <q-icon name="show_chart" class="q-mr-sm" size="sm" />
                Gráfico Acumulativo de Retorno
              </div>
              <div class="text-caption text-grey">A Linha Laranja inicia com seu valor inicial de investimento total (Capex).<br/> O ponto exato em que a Linha Laranja (RPA) cruza abaixo da Azul (Manual) é onde a Automação se pagou totalmente e começa a gerar o <b>Lucro Definitivo</b>.</div>
            </q-card-section>
            <q-card-section>
              <apexchart type="line" height="320" :options="chartOptions" :series="chartSeries"></apexchart>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { useMeta } from 'quasar'

useMeta({
  title: 'Calculadora de ROI para RPA | RPA Simplificado',
  meta: {
    description: { name: 'description', content: 'Descubra os Custos Mensais e Anuais, e o tempo de Payback da sua automação RPA ou Agentic Automation com nossa Calculadora de ROI gratuita.' },
    keywords: { name: 'keywords', content: 'ROI RPA, Payback RPA, Custos RPA, Retorno sobre investimento automação, Calculadora RPA' },
    ogTitle: { property: 'og:title', content: 'Calculadora de ROI para RPA | RPA Simplificado' },
    ogDesc: { property: 'og:description', content: 'Descubra os Custos Mensais e Anuais, e o tempo de Payback da sua automação com nossa Calculadora gratuita.' }
  }
})

const apexchart = VueApexCharts

const volumeM = ref(3000)
const tmaMinutos = ref(15)
const qtdPessoas = ref(3)
const custoHora = ref(45)
const custoErrosMes = ref(1500)

const custoImplementacao = ref(25000)
const custoLicencaAnual = ref(12000)
const custoManutencaoMensal = ref(1000)
const custoLLMMensal = ref(0)

const horasManuaisMes = computed(() => {
  return (volumeM.value * tmaMinutos.value) / 60
})

const custoManualMes = computed(() => {
  return (horasManuaisMes.value * custoHora.value) + custoErrosMes.value
})

const custoManualAno = computed(() => {
  return custoManualMes.value * 12
})

const custoRpaMes = computed(() => {
  return (custoLicencaAnual.value / 12) + custoManutencaoMensal.value + custoLLMMensal.value
})

const custoRpaAno1 = computed(() => {
  return custoImplementacao.value + custoLicencaAnual.value + (custoManutencaoMensal.value * 12) + (custoLLMMensal.value * 12)
})

const economiaAno1 = computed(() => {
  return custoManualAno.value - custoRpaAno1.value
})

const paybackMeses = computed(() => {
  const savingsPerMonth = custoManualMes.value - custoRpaMes.value
  if (savingsPerMonth <= 0) return 0
  return custoImplementacao.value / savingsPerMonth
})

const chartOptions = computed(() => ({
  chart: {
    type: 'line',
    toolbar: { show: false },
    fontFamily: 'Inter, sans-serif'
  },
  colors: ['#034894', '#ff6500'],
  stroke: { curve: 'straight', width: 3 },
  xaxis: {
    categories: Array.from({ length: 25 }, (_, i) => `Mês ${i}`),
    title: { text: 'Período Contínuo (Mêses)', style: { fontWeight: 'bold' } }
  },
  yaxis: {
    title: { text: 'Impacto Financeiro (R$)', style: { fontWeight: 'bold' } },
    labels: {
      formatter: (val) => formatCurrency(val)
    }
  },
  legend: { position: 'top' },
  tooltip: {
    y: {
      formatter: function (val) {
        return formatCurrency(val)
      }
    }
  }
}))

const chartSeries = computed(() => {
  const man = []
  const rpa = []
  for (let idx = 0; idx <= 24; idx++) {
    man.push(custoManualMes.value * idx)
    // Custo Acumulado RPA: O mês 0 é pago a implementação à vista de cara (Capex)
    // Subsequente se soma ao Capex anterior o que é gasto Mês a Mês.
    rpa.push(custoImplementacao.value + (custoRpaMes.value * idx))
  }
  return [
    { name: 'Gasto Acumulado com Formato Manual', data: man },
    { name: 'Gasto Acumulado com Formato RPA', data: rpa }
  ]
})

function formatCurrency (value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0)
}
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
.border-right {
  border-right: 1px solid #e0e0e0;
}
.h-100 {
  height: 100%;
}
.flex-grow-1 {
  flex-grow: 1;
}
@media (max-width: 599px) {
  .border-right {
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
  }
}
</style>
