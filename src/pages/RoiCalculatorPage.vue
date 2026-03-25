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
              <!-- Calculadora Auxiliar -->
              <q-expansion-item
                v-model="showAuxiliar"
                icon="auto_fix_high"
                label="Calculadora Auxiliar"
                caption="Preencha para auto-calcular Volume e Custo Hora"
                header-class="text-accent text-weight-bold bg-orange-1 rounded-borders"
                class="q-mb-md"
              >
                <div class="q-pa-md bg-grey-1 rounded-borders">
                  <div class="text-caption text-weight-bold text-grey-8 q-mb-sm">Volume de Transações</div>
                  <div class="row q-col-gutter-md q-mb-md">
                    <div class="col-6">
                      <q-input outlined v-model.number="execucoesDia" type="number" label="Execuções / Dia">
                        <template v-slot:prepend><q-icon name="today" size="xs" /></template>
                      </q-input>
                    </div>
                    <div class="col-6">
                      <q-input outlined v-model.number="diasUteis" type="number" label="Dias Úteis / Mês">
                        <template v-slot:prepend><q-icon name="date_range" size="xs" /></template>
                      </q-input>
                    </div>
                  </div>

                  <div class="text-caption text-weight-bold text-grey-8 q-mb-sm">Custo do Colaborador</div>
                  <div class="row q-col-gutter-md q-mb-sm">
                    <div class="col-6">
                      <q-input outlined v-model.number="salarioMedio" type="number" label="Salário Médio (R$)" prefix="R$">
                        <template v-slot:prepend><q-icon name="payments" size="xs" /></template>
                      </q-input>
                    </div>
                    <div class="col-6">
                      <q-input outlined v-model.number="jornadaDiaria" type="number" label="Jornada (h/dia)">
                        <template v-slot:prepend><q-icon name="schedule" size="xs" /></template>
                      </q-input>
                    </div>
                  </div>

                  <!-- Resumo calculado -->
                  <div v-if="execucoesDia && execucoesDia > 0 || salarioMedio && salarioMedio > 0 || horasTimeMes > 0" class="q-mt-md q-pa-sm bg-white rounded-borders">
                    <div class="text-caption text-weight-bold text-primary q-mb-xs">Resultado Auxiliar</div>
                    <div v-if="execucoesDia && execucoesDia > 0" class="text-caption text-grey-8 q-mb-xs">
                      Volume mensal: {{ execucoesDia }} × {{ diasUteis }} = <strong class="text-primary">{{ (execucoesDia * diasUteis).toLocaleString('pt-BR') }} transações/mês</strong>
                    </div>
                    <div v-if="salarioMedio && salarioMedio > 0" class="text-caption text-grey-8 q-mb-xs">
                      Custo hora: {{ formatCurrency(salarioMedio) }} ÷ ({{ jornadaDiaria }}h × {{ diasUteis }}d) = <strong class="text-primary">{{ formatCurrency(salarioMedio / (jornadaDiaria * diasUteis)) }}/h</strong>
                    </div>
                    <div v-if="horasTimeMes > 0" class="text-caption text-grey-8">
                      Tempo do time: <strong class="text-primary">{{ horasTimeMes.toFixed(1) }}h/mês</strong>
                      <span v-if="qtdPessoas > 0"> (~{{ horasPorPessoaDia.toFixed(1) }}h/dia por pessoa)</span>
                    </div>
                  </div>
                </div>
              </q-expansion-item>

              <div class="text-subtitle1 text-weight-bold text-primary q-mt-sm">Custos do Processo Manual</div>

              <q-input outlined v-model.number="volumeM" type="number" label="Volume Mensal de Transações" :rules="[val => val >= 0 || 'Obrigatório']" :hint="execucoesDia && execucoesDia > 0 ? (auxiliarVolumeAtivo ? 'Auto-calculado pela auxiliar' : 'Modo manual — auxiliar desacoplado') : ''" @focus="onVolumeManualEdit">
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

              <q-input outlined v-model.number="qtdPessoas" type="number" label="Pessoas no Time (Qtd)" :rules="[val => val >= 0 || 'Obrigatório']">
                <template v-slot:prepend><q-icon name="groups" /></template>
                <template v-slot:append>
                  <q-icon name="info" class="cursor-pointer text-grey"><q-tooltip class="text-body2">Quantas pessoas participam desse processo. Usado para calcular carga por pessoa e validar capacidade. Não altera o custo financeiro (que é baseado em Volume × TMA × Custo Hora).</q-tooltip></q-icon>
                </template>
              </q-input>

              <q-input outlined v-model.number="custoHora" type="number" label="Custo Hora/Homem (R$)" prefix="R$" :rules="[val => val >= 0 || 'Obrigatório']" :hint="salarioMedio && salarioMedio > 0 ? (auxiliarCustoHoraAtivo ? 'Auto-calculado pela auxiliar' : 'Modo manual — auxiliar desacoplado') : ''" @focus="onCustoHoraManualEdit">
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

              <q-separator class="q-my-md bg-grey-3" />
              <div class="text-subtitle1 text-weight-bold text-primary">Estimativas de Redução</div>

              <q-input outlined v-model.number="reducaoTempo" type="number" label="Redução de Tempo Prevista (%)" suffix="%" :rules="[val => val >= 0 && val <= 100 || '0-100%']">
                <template v-slot:prepend><q-icon name="speed" /></template>
                <template v-slot:append>
                  <q-icon name="info" class="cursor-pointer text-grey"><q-tooltip class="text-body2">Percentual do tempo manual que o RPA elimina. 100% = automação total. 80% = padrão conservador. 65% = processos complexos com muitas exceções.</q-tooltip></q-icon>
                </template>
              </q-input>

              <q-input outlined v-model.number="reducaoErros" type="number" label="Redução de Erros Prevista (%)" suffix="%" :rules="[val => val >= 0 && val <= 100 || '0-100%']">
                <template v-slot:prepend><q-icon name="verified" /></template>
                <template v-slot:append>
                  <q-icon name="info" class="cursor-pointer text-grey"><q-tooltip class="text-body2">Percentual dos custos com erros/retrabalho que o RPA elimina. Robôs não erram em tarefas repetitivas. 90% = padrão. 100% = processo totalmente determinístico.</q-tooltip></q-icon>
                </template>
              </q-input>
            </q-card-section>
          </q-card>

          <!-- Alerta de Capacidade -->
          <q-banner v-if="capacidadeExcedida" class="bg-warning text-dark q-mt-md rounded-borders" dense>
            <template v-slot:avatar><q-icon name="warning" color="dark" /></template>
            As horas necessárias (<strong>{{ horasManuaisMes.toFixed(0) }}h/mês</strong>) excedem a capacidade do time
            (<strong>{{ capacidadeDisponivelMes.toFixed(0) }}h/mês</strong> = {{ qtdPessoas }} pessoas × {{ jornadaDiaria }}h × {{ diasUteis }} dias).
            Verifique se o volume ou TMA informados estão corretos, ou se há horas extras envolvidas.
          </q-banner>
        </div>

        <!-- Results Column -->
        <div class="col-12 col-md-7 flex column">
          <!-- Summary Cards -->
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-sm-4">
               <q-card class="bg-blue-1 shadow-1 full-height">
                 <q-card-section>
                   <div class="text-subtitle2 text-primary text-weight-bold row items-center no-wrap">
                     Gastos Processo MANUAL
                     <q-icon name="info_outline" size="16px" class="q-ml-xs cursor-pointer text-grey-6">
                       <q-tooltip class="text-body2" max-width="320px">
                         <b>Custo Mensal:</b> (Volume × TMA ÷ 60) × Custo Hora + Custo Erros<br/>
                         <b>Custo Anual:</b> Custo Mensal × 12
                       </q-tooltip>
                     </q-icon>
                   </div>
                   <div class="text-dark q-mt-sm">Mensal: <strong>{{ formatCurrency(custoManualMes) }}</strong></div>
                   <div class="text-dark">Anual: <strong>{{ formatCurrency(custoManualAno) }}</strong></div>
                   <div class="text-caption q-mt-xs text-grey-7">~{{ (horasManuaisMes).toFixed(0) }}h gastas/mês ({{ qtdPessoas }} pessoas)</div>
                 </q-card-section>
               </q-card>
            </div>
            <div class="col-12 col-sm-4">
               <q-card class="bg-orange-1 shadow-1 full-height">
                 <q-card-section>
                   <div class="text-subtitle2 text-accent text-weight-bold row items-center no-wrap">
                     Gastos Recorrentes RPA
                     <q-icon name="info_outline" size="16px" class="q-ml-xs cursor-pointer text-grey-6">
                       <q-tooltip class="text-body2" max-width="320px">
                         <b>OPEX Mensal:</b> (Licença Anual ÷ 12) + Manutenção + Custo LLM<br/>
                         <b>OPEX Anual:</b> OPEX Mensal × 12<br/>
                         <i>Não inclui o investimento de implantação (Capex).</i>
                       </q-tooltip>
                     </q-icon>
                   </div>
                   <div class="text-dark q-mt-sm">Mensal: <strong>{{ formatCurrency(custoRpaMes) }}</strong></div>
                   <div class="text-dark">Anual: <strong>{{ formatCurrency(custoRpaMes * 12) }}</strong></div>
                   <div class="text-caption q-mt-xs text-grey-7">Licença + manutenção recorrente. Exclui implantação.</div>
                 </q-card-section>
               </q-card>
            </div>
            <div class="col-12 col-sm-4">
               <q-card class="bg-green-1 shadow-1 full-height">
                 <q-card-section>
                   <div class="text-subtitle2 text-positive text-weight-bold row items-center no-wrap">
                     Horas Liberadas do Time
                     <q-icon name="info_outline" size="16px" class="q-ml-xs cursor-pointer text-grey-6">
                       <q-tooltip class="text-body2" max-width="320px">
                         <b>Mensal:</b> (Volume × TMA ÷ 60) × Redução Tempo %<br/>
                         <b>Anual:</b> Horas Mensal × 12<br/>
                         <b>Por pessoa:</b> Horas Mensal ÷ Qtd Pessoas<br/>
                         <i>Aplica o fator de redução ({{ reducaoTempo }}%). Não assume automação total.</i>
                       </q-tooltip>
                     </q-icon>
                   </div>
                   <div class="text-dark q-mt-sm">Mensal: <strong>{{ horasLiberadasMes.toFixed(0) }}h</strong></div>
                   <div class="text-dark">Anual: <strong>{{ horasLiberadasAno.toFixed(0) }}h</strong></div>
                   <div class="text-caption q-mt-xs text-grey-7">~{{ horasLiberadasPorPessoa.toFixed(0) }}h/mês por pessoa para atividades estratégicas</div>
                 </q-card-section>
               </q-card>
            </div>
          </div>

          <!-- Payback and ROI -->
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-sm-4">
              <q-card class="clean-card shadow-4 bg-white full-height">
                <q-card-section class="text-center q-pa-md">
                  <div class="text-subtitle2 text-weight-bold text-dark row items-center justify-center no-wrap">
                    Tempo Estimado de Payback
                    <q-icon name="info_outline" size="16px" class="q-ml-xs cursor-pointer text-grey-6">
                      <q-tooltip class="text-body2" max-width="320px">
                        <b>Fórmula:</b> Implantação ÷ Economia Líquida Mensal<br/>
                        <b>Economia Líquida:</b> (Horas × CustoHora × Red.Tempo%) + (Erros × Red.Erros%) − OPEX RPA<br/>
                        <i>Quantos meses até o investimento inicial ser recuperado pela economia mensal.</i>
                      </q-tooltip>
                    </q-icon>
                  </div>
                  <div class="text-h5 text-weight-bolder q-mt-sm" :class="paybackMeses !== null ? 'text-positive' : 'text-negative'">
                    {{ paybackMeses !== null ? paybackMeses.toFixed(1) + ' Meses' : 'Inviável' }}
                  </div>
                  <div v-if="paybackMeses === null" class="text-caption text-negative q-mt-xs">OPEX RPA supera a economia mensal</div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-sm-4">
              <q-card class="clean-card shadow-4 bg-white full-height">
                <q-card-section class="text-center q-pa-md">
                  <div class="text-subtitle2 text-weight-bold text-dark row items-center justify-center no-wrap">
                    Economia Anual (Ano 1)
                    <q-icon name="info_outline" size="16px" class="q-ml-xs cursor-pointer text-grey-6">
                      <q-tooltip class="text-body2" max-width="320px">
                        <b>Fórmula:</b> (Economia Bruta Mensal × 12) − Custo RPA Ano 1<br/>
                        <b>Economia Bruta:</b> (Horas × CustoHora × {{ reducaoTempo }}%) + (Erros × {{ reducaoErros }}%)<br/>
                        <b>Custo RPA Ano 1:</b> Implantação + Licença + (Manutenção × 12) + (LLM × 12)<br/>
                        <i>Inclui o investimento de implantação (Capex) no primeiro ano.</i>
                      </q-tooltip>
                    </q-icon>
                  </div>
                  <div class="text-h5 text-weight-bolder q-mt-sm" :class="economiaAno1 >= 0 ? 'text-positive' : 'text-negative'">
                    {{ formatCurrency(economiaAno1) }}
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-sm-4">
              <q-card class="clean-card shadow-4 bg-white full-height">
                <q-card-section class="text-center q-pa-md">
                  <div class="text-subtitle2 text-weight-bold text-dark row items-center justify-center no-wrap">
                    ROI Acumulado (2 Anos)
                    <q-icon name="info_outline" size="16px" class="q-ml-xs cursor-pointer text-grey-6">
                      <q-tooltip class="text-body2" max-width="320px">
                        <b>Economia:</b> (Economia Bruta × 24) − (Custo RPA Ano1 + Ano2)<br/>
                        <b>ROI%:</b> Economia Acumulada ÷ Investimento Total × 100<br/>
                        <b>Ano 1:</b> Implantação + Licença + (Manutenção × 12) + (LLM × 12)<br/>
                        <b>Ano 2:</b> Licença + (Manutenção × 12) + (LLM × 12)<br/>
                        <i>No 2º ano o custo de implantação não se repete.</i>
                      </q-tooltip>
                    </q-icon>
                  </div>
                  <div class="text-h5 text-weight-bolder q-mt-sm" :class="economiaAcumulada2Anos >= 0 ? 'text-positive' : 'text-negative'">
                    {{ formatCurrency(economiaAcumulada2Anos) }}
                  </div>
                  <div class="text-weight-bold q-mt-xs" :class="roiPercentual2Anos >= 0 ? 'text-positive' : 'text-negative'" style="font-size: 1.1rem;">
                    ROI: {{ roiPercentual2Anos.toFixed(0) }}%
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

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
              <apexchart ref="chartRef" type="line" height="320" :options="chartOptions" :series="chartSeries"></apexchart>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Export Section -->
      <div class="row justify-center q-mt-xl">
        <q-card flat bordered class="export-card">
          <q-card-section class="row items-center justify-center q-gutter-sm q-py-md">
            <div class="col-12 text-center text-caption text-grey-6 text-weight-bold text-uppercase q-mb-xs">Exportar Resultado</div>
            <q-btn
              outline
              icon="picture_as_pdf"
              label="Exportar PDF"
              color="negative"
              :loading="exportingPDF"
              @click="exportToPDF"
              class="export-btn"
            />
            <q-btn
              outline
              icon="table_chart"
              label="Exportar Excel"
              color="positive"
              :loading="exportingExcel"
              @click="exportToExcel"
              class="export-btn"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { useMeta } from 'quasar'
import { useToolExport } from 'src/composables/useToolExport'

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
const chartRef = ref(null)

const volumeM = ref(3000)
const tmaMinutos = ref(15)
const qtdPessoas = ref(3)
const custoHora = ref(45)
const custoErrosMes = ref(1500)

// Campos auxiliares (opcionais)
const showAuxiliar = ref(false)
const execucoesDia = ref(null)
const diasUteis = ref(21)
const jornadaDiaria = ref(8)
const salarioMedio = ref(null)

// Flags para desacoplar auxiliar quando usuário edita manualmente
const auxiliarVolumeAtivo = ref(true)
const auxiliarCustoHoraAtivo = ref(true)

// Auto-preenche Volume Mensal quando auxiliar preenchido
watch([execucoesDia, diasUteis], ([exec, dias]) => {
  if (auxiliarVolumeAtivo.value && exec && exec > 0 && dias && dias > 0) {
    volumeM.value = exec * dias
  }
})

// Auto-preenche Custo Hora quando salário informado
watch([salarioMedio, jornadaDiaria, diasUteis], ([salario, jornada, dias]) => {
  if (auxiliarCustoHoraAtivo.value && salario && salario > 0 && jornada && jornada > 0 && dias && dias > 0) {
    custoHora.value = Math.round((salario / (jornada * dias)) * 100) / 100
  }
})

function onVolumeManualEdit () {
  if (execucoesDia.value && execucoesDia.value > 0) auxiliarVolumeAtivo.value = false
}
function onCustoHoraManualEdit () {
  if (salarioMedio.value && salarioMedio.value > 0) auxiliarCustoHoraAtivo.value = false
}

const custoImplementacao = ref(25000)
const custoLicencaAnual = ref(12000)
const custoManutencaoMensal = ref(1000)
const custoLLMMensal = ref(0)
const reducaoTempo = ref(80)
const reducaoErros = ref(90)

const horasTimeMes = computed(() => {
  if (!execucoesDia.value || !diasUteis.value || !tmaMinutos.value) return 0
  return (execucoesDia.value * diasUteis.value * tmaMinutos.value) / 60
})

const horasPorPessoaDia = computed(() => {
  if (!horasTimeMes.value || !qtdPessoas.value || !diasUteis.value) return 0
  return horasTimeMes.value / qtdPessoas.value / diasUteis.value
})

// === CUSTO MANUAL (AS-IS) ===
const horasManuaisMes = computed(() => {
  return (volumeM.value * tmaMinutos.value) / 60
})

const custoManualMes = computed(() => {
  return (horasManuaisMes.value * custoHora.value) + custoErrosMes.value
})

const custoManualAno = computed(() => {
  return custoManualMes.value * 12
})

// === CAPACIDADE DO TIME ===
const capacidadeDisponivelMes = computed(() => {
  return qtdPessoas.value * jornadaDiaria.value * diasUteis.value
})

const capacidadeExcedida = computed(() => {
  return horasManuaisMes.value > capacidadeDisponivelMes.value && capacidadeDisponivelMes.value > 0
})

// === CUSTO RPA ===
const custoRpaMes = computed(() => {
  return (custoLicencaAnual.value / 12) + custoManutencaoMensal.value + custoLLMMensal.value
})

const custoRpaAno1 = computed(() => {
  return custoImplementacao.value + custoLicencaAnual.value + (custoManutencaoMensal.value * 12) + (custoLLMMensal.value * 12)
})

const custoRpaAno2 = computed(() => {
  return custoLicencaAnual.value + (custoManutencaoMensal.value * 12) + (custoLLMMensal.value * 12)
})

// === ECONOMIA (com fatores de redução) ===
const economiaBrutaMes = computed(() => {
  const savingTempo = horasManuaisMes.value * custoHora.value * (reducaoTempo.value / 100)
  const savingErros = custoErrosMes.value * (reducaoErros.value / 100)
  return savingTempo + savingErros
})

const economiaLiquidaMes = computed(() => {
  return economiaBrutaMes.value - custoRpaMes.value
})

const economiaAno1 = computed(() => {
  return (economiaBrutaMes.value * 12) - custoRpaAno1.value
})

const economiaAno2 = computed(() => {
  return (economiaBrutaMes.value * 12) - custoRpaAno2.value
})

const economiaAcumulada2Anos = computed(() => {
  return economiaAno1.value + economiaAno2.value
})

const roiPercentual2Anos = computed(() => {
  const investimentoTotal = custoRpaAno1.value + custoRpaAno2.value
  if (investimentoTotal <= 0) return 0
  return (economiaAcumulada2Anos.value / investimentoTotal) * 100
})

// === HORAS LIBERADAS (com fator de redução) ===
const horasLiberadasMes = computed(() => {
  return horasManuaisMes.value * (reducaoTempo.value / 100)
})

const horasLiberadasAno = computed(() => {
  return horasLiberadasMes.value * 12
})

const horasLiberadasPorPessoa = computed(() => {
  if (!qtdPessoas.value || qtdPessoas.value <= 0) return 0
  return horasLiberadasMes.value / qtdPessoas.value
})

// === PAYBACK ===
const paybackMeses = computed(() => {
  if (economiaLiquidaMes.value <= 0) return null
  return custoImplementacao.value / economiaLiquidaMes.value
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

function getExportData () {
  const chartRawData = []
  for (let i = 0; i <= 24; i++) {
    chartRawData.push({
      mes: `Mês ${i}`,
      manual: custoManualMes.value * i,
      manualFmt: formatCurrency(custoManualMes.value * i),
      rpa: custoImplementacao.value + custoRpaMes.value * i,
      rpaFmt: formatCurrency(custoImplementacao.value + custoRpaMes.value * i)
    })
  }
  return {
    toolName: 'Calculadora de ROI para RPA',
    subtitle: 'Descubra os Custos Mensais e Anuais, e o tempo de Payback da sua automação.',
    params: [
      { label: 'Volume Mensal de Transações', value: `${volumeM.value.toLocaleString('pt-BR')} transações` },
      { label: 'TMA por Transação', value: `${tmaMinutos.value} minutos` },
      { label: 'Pessoas Envolvidas', value: `${qtdPessoas.value} pessoas` },
      { label: 'Custo Hora/Homem', value: formatCurrency(custoHora.value) },
      { label: 'Custo com Erros/Atrasos Mensal', value: formatCurrency(custoErrosMes.value) },
      { label: 'Investimento de Implantação (Capex)', value: formatCurrency(custoImplementacao.value) },
      { label: 'Licenciamento Anual', value: formatCurrency(custoLicencaAnual.value) },
      { label: 'Manutenção / Nuvem Mensal', value: formatCurrency(custoManutencaoMensal.value) },
      { label: 'Custo IA / Tokens LLM Mensal', value: formatCurrency(custoLLMMensal.value) },
      { label: 'Redução de Tempo Prevista', value: `${reducaoTempo.value}%` },
      { label: 'Redução de Erros Prevista', value: `${reducaoErros.value}%` }
    ],
    results: [
      { label: 'Horas Manuais por Mês', value: `${horasManuaisMes.value.toFixed(0)} horas (entre ${qtdPessoas.value} pessoas)` },
      { label: 'Custo Manual Mensal (AS-IS)', value: formatCurrency(custoManualMes.value) },
      { label: 'Custo Manual Anual (AS-IS)', value: formatCurrency(custoManualAno.value) },
      { label: 'Economia Bruta Mensal (com reduções)', value: formatCurrency(economiaBrutaMes.value) },
      { label: 'Custo RPA Mensal (OPEX recorrente)', value: formatCurrency(custoRpaMes.value) },
      { label: 'Economia Líquida Mensal', value: formatCurrency(economiaLiquidaMes.value) },
      { label: 'Custo RPA Total Ano 1', value: formatCurrency(custoRpaAno1.value) },
      { label: 'Custo RPA Ano 2 (somente recorrente)', value: formatCurrency(custoRpaAno2.value) },
      { label: 'Tempo Estimado de Payback', value: paybackMeses.value !== null ? `${paybackMeses.value.toFixed(1)} meses` : 'Inviável — OPEX supera economia' },
      { label: 'Economia Anual (Ano 1)', value: formatCurrency(economiaAno1.value) },
      { label: 'Economia Acumulada (2 Anos)', value: formatCurrency(economiaAcumulada2Anos.value) },
      { label: 'ROI 2 Anos (%)', value: `${roiPercentual2Anos.value.toFixed(1)}%` },
      { label: 'Horas Liberadas do Time (Mensal)', value: `${horasLiberadasMes.value.toFixed(0)} horas (~${horasLiberadasPorPessoa.value.toFixed(0)}h por pessoa)` },
      { label: 'Horas Liberadas do Time (Anual)', value: `${horasLiberadasAno.value.toFixed(0)} horas` }
    ],
    chartData: chartRawData
  }
}

const { exportToPDF, exportToExcel, exportingPDF, exportingExcel } = useToolExport(getExportData, chartRef)
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
.export-card {
  width: 100%;
  max-width: 480px;
  border-radius: 12px;
}
.export-btn {
  min-width: 160px;
}
@media (max-width: 599px) {
  .border-right {
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
  }
}
</style>
