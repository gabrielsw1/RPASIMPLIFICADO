<template>
  <q-page class="bg-surface padding-y-lg q-pa-md text-dark">
    <div class="max-width-p mx-auto">
      <div class="text-center q-mb-xl">
        <q-icon name="calculate" size="xl" color="accent" class="q-mb-md" />
        <h2 class="text-h3 text-weight-bold text-primary q-mb-sm">Calculadora de ROI para RPA</h2>
        <p class="text-h6 text-secondary q-mb-md">Descubra os Custos Mensais e Anuais, e o tempo de Payback da sua automação.</p>
        <div class="glow-line bg-accent mx-auto"></div>
      </div>

      <!-- Banner Indicadores de Retorno (FULL WIDTH) -->
      <q-card class="roi-banner q-mb-xl shadow-4">
        <q-card-section class="q-pa-lg">
          <div class="row items-center q-col-gutter-lg">
            <div class="col-6 col-md-3 text-center">
              <div class="roi-metric">
                <q-icon name="replay" size="28px" class="roi-icon q-mb-xs" />
                <div class="roi-value" :class="paybackMeses !== null ? '' : 'roi-negative'">
                  {{ paybackMeses !== null ? paybackMeses.toFixed(1) : '—' }}
                </div>
                <div class="roi-label">{{ paybackMeses !== null ? 'meses de payback' : 'Inviável' }}</div>
                <q-tooltip class="text-body2" max-width="300px">
                  <b>Fórmula:</b> {{ formatCurrency(custoImplementacao) }} ÷ {{ formatCurrency(economiaLiquidaMes) }}/mês<br/>
                  <i>Meses até recuperar o investimento.</i>
                </q-tooltip>
              </div>
            </div>
            <div class="col-6 col-md-3 text-center">
              <div class="roi-metric">
                <q-icon name="looks_one" size="28px" class="roi-icon q-mb-xs" />
                <div class="roi-value">{{ formatCurrency(economiaAno1) }}</div>
                <div class="roi-percent" :class="roiPercentualAno1 >= 0 ? '' : 'roi-negative'">ROI {{ roiPercentualAno1.toFixed(0) }}%</div>
                <div class="roi-label">economia ano 1</div>
                <q-tooltip class="text-body2" max-width="300px">
                  <b>Economia Bruta × 12 − Custo RPA Ano 1</b><br/>
                  <i>Inclui implantação (Capex).</i>
                </q-tooltip>
              </div>
            </div>
            <div class="col-6 col-md-3 text-center">
              <div class="roi-metric">
                <q-icon name="looks_two" size="28px" class="roi-icon q-mb-xs" />
                <div class="roi-value">{{ formatCurrency(economiaAno2) }}</div>
                <div class="roi-label">economia ano 2 <span class="roi-tag">sem capex</span></div>
                <q-tooltip class="text-body2" max-width="300px">
                  <b>Economia Bruta × 12 − OPEX Ano 2</b><br/>
                  <i>Sem custo de implantação.</i>
                </q-tooltip>
              </div>
            </div>
            <div class="col-6 col-md-3 text-center">
              <div class="roi-metric roi-highlight">
                <q-icon name="emoji_events" size="28px" class="roi-icon-gold q-mb-xs" />
                <div class="roi-value-lg">{{ formatCurrency(economiaAcumulada2Anos) }}</div>
                <div class="roi-percent-lg">ROI {{ roiPercentual2Anos.toFixed(0) }}%</div>
                <div class="roi-label">total em 2 anos</div>
                <q-tooltip class="text-body2" max-width="300px">
                  <b>Ano 1 + Ano 2</b> = {{ formatCurrency(economiaAno1) }} + {{ formatCurrency(economiaAno2) }}<br/>
                  <b>ROI%:</b> Economia ÷ Investimento × 100
                </q-tooltip>
              </div>
            </div>
          </div>
          <!-- Ações: Gráficos + Export -->
          <div class="row justify-center items-center q-mt-lg q-gutter-sm">
            <q-btn unelevated rounded icon="analytics" label="Ver Análises Gráficas" class="roi-btn" @click="showGraficos = true" />
            <q-btn flat round icon="picture_as_pdf" class="roi-btn-icon" :loading="exportingPDF" @click="exportToPDF">
              <q-tooltip>Exportar PDF</q-tooltip>
            </q-btn>
            <q-btn flat round icon="table_chart" class="roi-btn-icon" :loading="exportingExcel" @click="exportToExcel">
              <q-tooltip>Exportar Excel</q-tooltip>
            </q-btn>
            <div class="roi-separator"></div>
            <q-btn flat round icon="file_download" class="roi-btn-icon" @click="exportToJSON">
              <q-tooltip>Exportar Parâmetros (JSON)</q-tooltip>
            </q-btn>
            <q-btn flat round icon="file_upload" class="roi-btn-icon" @click="importFromJSON">
              <q-tooltip>Importar Parâmetros (JSON)</q-tooltip>
            </q-btn>
          </div>
        </q-card-section>
      </q-card>

      <div class="row q-col-gutter-xl justify-center">
        <!-- Inputs Column -->
        <div class="col-12 col-md-5">
          <q-card class="clean-card shadow-2">
            <q-card-section class="bg-primary text-white row items-center">
              <q-icon name="settings" size="sm" class="q-mr-sm" />
              <div class="text-h6 text-weight-bold">Parâmetros do Processo</div>
            </q-card-section>
            
            <q-card-section class="q-gutter-sm q-pa-md">
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

              <q-input outlined v-model.number="outrosCustosRecorrentes" type="number" label="Outros Custos Recorrentes (Mensal R$)" prefix="R$">
                <template v-slot:prepend><q-icon name="add_circle_outline" /></template>
                <template v-slot:append>
                  <q-icon name="info" class="cursor-pointer text-grey"><q-tooltip class="text-body2">Outros custos mensais recorrentes do RPA: horas de suporte N2, treinamento, infra dedicada, etc.</q-tooltip></q-icon>
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

        </div>

        <!-- Results Column -->
        <div class="col-12 col-md-7 flex column">
          <!-- Análise de Capacidade -->
          <q-card v-if="capacidadeExcedida" class="q-mb-md shadow-3 capacidade-card">
            <q-card-section class="capacidade-header q-py-sm q-px-md">
              <div class="row items-center no-wrap">
                <q-icon name="warning_amber" size="sm" class="q-mr-sm" style="color: #e65100;" />
                <div class="text-subtitle1 text-weight-bold" style="color: #e65100;">Demanda Excede Capacidade do Time</div>
                <q-icon name="info_outline" size="16px" class="q-ml-xs cursor-pointer" style="color: #bf360c;">
                  <q-tooltip class="text-body2" max-width="360px">
                    <b>Capacidade:</b> {{ qtdPessoas }} pessoas × {{ jornadaDiaria }}h × {{ diasUteis }} dias = {{ capacidadeDisponivelMes.toFixed(0) }}h/mês<br/>
                    <b>Demanda:</b> {{ volumeM.toLocaleString('pt-BR') }} × {{ tmaMinutos }}min ÷ 60 = {{ horasDemandaTotalMes.toFixed(0) }}h/mês<br/>
                    <b>Pessoas necessárias:</b> {{ horasDemandaTotalMes.toFixed(0) }}h ÷ ({{ jornadaDiaria }}h × {{ diasUteis }}d) = {{ pessoasNecessarias }} pessoas<br/>
                    <i>O robô absorve tanto o volume atual quanto o represado.</i>
                  </q-tooltip>
                </q-icon>
              </div>
            </q-card-section>

            <q-card-section class="q-pt-sm q-pb-md">
              <!-- Barra de progresso visual da capacidade -->
              <div class="q-mb-md">
                <div class="row items-center justify-between q-mb-xs">
                  <span class="text-caption text-weight-bold text-grey-8">Utilização da capacidade</span>
                  <span class="text-caption text-weight-bold text-negative">{{ Math.round((horasDemandaTotalMes / capacidadeDisponivelMes) * 100) }}%</span>
                </div>
                <q-linear-progress
                  :value="Math.min(capacidadeDisponivelMes / horasDemandaTotalMes, 1)"
                  color="negative"
                  track-color="red-1"
                  size="10px"
                  rounded
                  class="q-mb-xs"
                />
                <div class="row justify-between" style="flex-wrap: wrap; gap: 2px;">
                  <span class="text-caption text-grey-6">0h</span>
                  <span class="text-caption text-positive text-weight-bold">{{ capacidadeDisponivelMes.toFixed(0) }}h capacidade</span>
                  <span class="text-caption text-negative text-weight-bold">{{ horasDemandaTotalMes.toFixed(0) }}h demanda</span>
                </div>
              </div>

              <!-- Métricas em breakdown items -->
              <div class="row q-col-gutter-sm">
                <div class="col-6 col-sm-3">
                  <div class="breakdown-item">
                    <div class="row items-center no-wrap q-mb-xs">
                      <q-icon name="groups" size="16px" color="primary" class="q-mr-xs" />
                      <span class="text-caption text-weight-bold text-grey-8">Time atual</span>
                    </div>
                    <div class="text-subtitle1 text-weight-bolder text-primary">{{ qtdPessoas }} pessoas</div>
                    <div class="text-caption text-grey-6">{{ capacidadeDisponivelMes.toFixed(0) }}h/mês disponíveis</div>
                  </div>
                </div>

                <div class="col-6 col-sm-3">
                  <div class="breakdown-item">
                    <div class="row items-center no-wrap q-mb-xs">
                      <q-icon name="check_circle" size="16px" color="positive" class="q-mr-xs" />
                      <span class="text-caption text-weight-bold text-grey-8">Atendido</span>
                    </div>
                    <div class="text-subtitle1 text-weight-bolder text-positive">{{ volumeAtendidoMes.toLocaleString('pt-BR') }}</div>
                    <div class="text-caption text-grey-6">{{ percentualAtendido.toFixed(0) }}% da demanda</div>
                  </div>
                </div>

                <div class="col-6 col-sm-3">
                  <div class="breakdown-item">
                    <div class="row items-center no-wrap q-mb-xs">
                      <q-icon name="block" size="16px" color="negative" class="q-mr-xs" />
                      <span class="text-caption text-weight-bold text-grey-8">Represado</span>
                    </div>
                    <div class="text-subtitle1 text-weight-bolder text-negative">{{ volumeRepresadoMes.toLocaleString('pt-BR') }}</div>
                    <div class="text-caption text-grey-6">{{ horasRepresadasMes.toFixed(0) }}h/mês sem atender</div>
                  </div>
                </div>

                <div class="col-6 col-sm-3">
                  <div class="breakdown-item" style="background: rgba(244,67,54,0.06); border: 1px dashed #ef9a9a;">
                    <div class="row items-center no-wrap q-mb-xs">
                      <q-icon name="person_add" size="16px" color="negative" class="q-mr-xs" />
                      <span class="text-caption text-weight-bold text-grey-8">Precisaria de</span>
                      <q-icon name="info_outline" size="13px" class="q-ml-xs cursor-pointer text-grey-5">
                        <q-tooltip class="text-body2" max-width="300px">
                          <b>Para atender 100%:</b> {{ pessoasNecessarias }} pessoas<br/>
                          <b>Faltam:</b> +{{ pessoasFaltantes }} pessoas<br/>
                          <b>Custo adicional:</b> ~{{ formatCurrency(custoContratarFaltantes) }}/mês<br/>
                          <i>Ou automatizar com RPA sem contratar ninguém.</i>
                        </q-tooltip>
                      </q-icon>
                    </div>
                    <div class="text-subtitle1 text-weight-bolder text-negative">+{{ pessoasFaltantes }} pessoas</div>
                    <div class="text-caption text-grey-6">~{{ formatCurrency(custoContratarFaltantes) }}/mês a mais</div>
                  </div>
                </div>
              </div>

              <!-- Toggle de cálculo -->
              <div class="q-mt-md q-pa-sm rounded-borders" style="background: rgba(3,72,148,0.06); border: 1px solid rgba(3,72,148,0.15);">
                <q-toggle
                  v-model="usarVolumeTotalNoCalculo"
                  color="primary"
                  dense
                  class="q-mb-xs"
                >
                  <template v-slot:default>
                    <div class="q-ml-sm">
                      <div class="text-caption text-weight-bold text-dark">
                        {{ usarVolumeTotalNoCalculo ? 'Calculando com demanda total' : 'Calculando só o que o time atende' }}
                      </div>
                      <div class="text-caption text-grey-7">
                        {{ usarVolumeTotalNoCalculo
                          ? `Usando ${volumeM.toLocaleString('pt-BR')} transações (${horasDemandaTotalMes.toFixed(0)}h) — inclui volume represado no custo`
                          : `Usando ${volumeAtendidoMes.toLocaleString('pt-BR')} transações (${capacidadeDisponivelMes.toFixed(0)}h) — apenas o que o time consegue fazer`
                        }}
                      </div>
                    </div>
                  </template>
                </q-toggle>
              </div>

              <!-- Conclusão -->
              <div class="q-mt-sm q-pa-sm rounded-borders row items-center" style="background: rgba(76,175,80,0.08); border: 1px solid rgba(76,175,80,0.2);">
                <q-icon name="smart_toy" color="positive" size="sm" class="q-mr-sm" />
                <div class="text-caption text-grey-8">
                  <strong class="text-positive">Com RPA:</strong> o robô absorve as {{ volumeM.toLocaleString('pt-BR') }} transações/mês sem precisar contratar +{{ pessoasFaltantes }} pessoas
                  (<strong class="text-positive">economia de {{ formatCurrency(custoContratarFaltantes) }}/mês</strong> em contratação).
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Gastos Processo Manual — Breakdown Visual -->
          <q-card class="bg-blue-1 shadow-1 q-mb-md">
            <q-card-section class="q-pb-sm">
              <div class="text-subtitle1 text-primary text-weight-bold row items-center">
                <q-icon name="account_balance_wallet" class="q-mr-sm" size="sm" />
                Gastos do Processo Manual (AS-IS)
              </div>
            </q-card-section>
            <q-card-section class="q-pt-none">
              <div class="row q-col-gutter-md">
                <!-- Custo do Time -->
                <div class="col-12 col-md-4">
                  <div class="breakdown-item">
                    <div class="row items-center no-wrap q-mb-xs">
                      <q-icon name="groups" size="18px" color="primary" class="q-mr-xs" />
                      <span class="text-caption text-weight-bold text-grey-8">Custo do Time</span>
                      <q-icon name="info_outline" size="14px" class="q-ml-xs cursor-pointer text-grey-5">
                        <q-tooltip class="text-body2" max-width="300px">
                          <b>Fórmula:</b> {{ qtdPessoas }} pessoas × {{ jornadaDiaria }}h/dia × {{ diasUteis }} dias × {{ formatCurrency(custoHora) }}/h<br/>
                          <i>Quanto custa manter esse time dedicado ao processo, considerando jornada integral.</i>
                        </q-tooltip>
                      </q-icon>
                    </div>
                    <div class="text-h6 text-weight-bolder text-primary">{{ formatCurrency(custoTimeMes) }}</div>
                    <div class="text-caption text-grey-7">{{ formatCurrency(custoTimeAno) }} / ano</div>
                    <div class="text-caption text-grey-6 q-mt-xs">{{ qtdPessoas }} pessoas × {{ jornadaDiaria }}h × {{ diasUteis }}d × {{ formatCurrency(custoHora) }}/h</div>
                  </div>
                </div>

                <!-- Custo do Processo (Horas) -->
                <div class="col-12 col-md-4">
                  <div class="breakdown-item">
                    <div class="row items-center no-wrap q-mb-xs">
                      <q-icon name="timer" size="18px" color="primary" class="q-mr-xs" />
                      <span class="text-caption text-weight-bold text-grey-8">Custo por Esforço</span>
                      <q-icon name="info_outline" size="14px" class="q-ml-xs cursor-pointer text-grey-5">
                        <q-tooltip class="text-body2" max-width="300px">
                          <b>Fórmula:</b> {{ volumeM.toLocaleString('pt-BR') }} transações × {{ tmaMinutos }}min ÷ 60 × {{ formatCurrency(custoHora) }}/h<br/>
                          <b>= {{ horasManuaisMes.toFixed(0) }}h</b> de trabalho efetivo no processo<br/>
                          <i>Tempo real produtivo gasto nas transações. Pode ser menor que o custo do time se há ociosidade, ou maior se há demanda reprimida.</i>
                        </q-tooltip>
                      </q-icon>
                    </div>
                    <div class="text-h6 text-weight-bolder text-primary">{{ formatCurrency(custoProcessoHoras) }}</div>
                    <div class="text-caption text-grey-7">{{ formatCurrency(custoProcessoHoras * 12) }} / ano</div>
                    <div class="text-caption text-grey-6 q-mt-xs">{{ horasManuaisMes.toFixed(0) }}h/mês efetivas ({{ volumeM.toLocaleString('pt-BR') }} × {{ tmaMinutos }}min)</div>
                  </div>
                </div>

                <!-- Custo com Erros -->
                <div class="col-12 col-md-4">
                  <div class="breakdown-item">
                    <div class="row items-center no-wrap q-mb-xs">
                      <q-icon name="error_outline" size="18px" color="negative" class="q-mr-xs" />
                      <span class="text-caption text-weight-bold text-grey-8">Custo com Erros</span>
                      <q-icon name="info_outline" size="14px" class="q-ml-xs cursor-pointer text-grey-5">
                        <q-tooltip class="text-body2" max-width="300px">
                          <b>Valor informado:</b> {{ formatCurrency(custoErrosMes) }}/mês<br/>
                          <i>Prejuízo mensal com falhas humanas, retrabalho, multas e atrasos. O RPA reduz {{ reducaoErros }}% desse custo.</i>
                        </q-tooltip>
                      </q-icon>
                    </div>
                    <div class="text-h6 text-weight-bolder text-negative">{{ formatCurrency(custoErrosMes) }}</div>
                    <div class="text-caption text-grey-7">{{ formatCurrency(custoErrosMes * 12) }} / ano</div>
                    <div class="text-caption text-grey-6 q-mt-xs">Retrabalho, multas e falhas humanas</div>
                  </div>
                </div>
              </div>

              <!-- Total -->
              <q-separator class="q-my-sm" />
              <div class="row items-center justify-between" style="gap: 8px; flex-wrap: wrap;">
                <div>
                  <span class="text-weight-bold text-dark" style="font-size: 0.85rem;">Total do Processo (Esforço + Erros):</span>
                  <q-icon name="info_outline" size="14px" class="q-ml-xs cursor-pointer text-grey-5">
                    <q-tooltip class="text-body2" max-width="300px">
                      <b>Custo Mensal:</b> Custo por Esforço + Custo com Erros<br/>
                      <b>{{ formatCurrency(custoProcessoHoras) }} + {{ formatCurrency(custoErrosMes) }} = {{ formatCurrency(custoManualMes) }}</b><br/>
                      <i>Este é o valor usado nos cálculos de ROI. O "Custo do Time" é exibido como referência para comparação.</i>
                    </q-tooltip>
                  </q-icon>
                </div>
                <div class="text-right">
                  <div class="text-weight-bolder text-primary" style="font-size: clamp(0.95rem, 2.5vw, 1.25rem);">{{ formatCurrency(custoManualMes) }}/mês</div>
                  <div class="text-caption text-grey-7">({{ formatCurrency(custoManualAno) }}/ano)</div>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Gastos Recorrentes RPA — Breakdown -->
          <q-card class="bg-orange-1 shadow-1 q-mb-md">
            <q-card-section class="q-pb-sm">
              <div class="text-subtitle1 text-accent text-weight-bold row items-center">
                <q-icon name="smart_toy" class="q-mr-sm" size="sm" />
                Gastos da Automação RPA
              </div>
            </q-card-section>
            <q-card-section class="q-pt-none">
              <div class="row q-col-gutter-md">
                <!-- Implantação -->
                <div class="col-6 col-md-3">
                  <div class="breakdown-item">
                    <div class="row items-center no-wrap q-mb-xs">
                      <q-icon name="build" size="18px" color="accent" class="q-mr-xs" />
                      <span class="text-caption text-weight-bold text-grey-8">Implantação</span>
                      <q-icon name="info_outline" size="14px" class="q-ml-xs cursor-pointer text-grey-5">
                        <q-tooltip class="text-body2" max-width="280px">
                          Investimento único (Capex). Pago apenas no Ano 1.<br/>
                          <i>Desenvolvimento, consultoria e infra inicial.</i>
                        </q-tooltip>
                      </q-icon>
                    </div>
                    <div class="text-h6 text-weight-bolder text-accent">{{ formatCurrency(custoImplementacao) }}</div>
                    <div class="text-caption text-grey-6 q-mt-xs">Capex — somente Ano 1</div>
                  </div>
                </div>

                <!-- Licença -->
                <div class="col-6 col-md-3">
                  <div class="breakdown-item">
                    <div class="row items-center no-wrap q-mb-xs">
                      <q-icon name="vpn_key" size="18px" color="accent" class="q-mr-xs" />
                      <span class="text-caption text-weight-bold text-grey-8">Licença</span>
                      <q-icon name="info_outline" size="14px" class="q-ml-xs cursor-pointer text-grey-5">
                        <q-tooltip class="text-body2" max-width="280px">
                          <b>Mensal:</b> {{ formatCurrency(custoLicencaAnual) }} ÷ 12 = {{ formatCurrency(custoLicencaMes) }}<br/>
                          <i>Custo da plataforma RPA, cobrado anualmente.</i>
                        </q-tooltip>
                      </q-icon>
                    </div>
                    <div class="text-h6 text-weight-bolder text-accent">{{ formatCurrency(custoLicencaMes) }}</div>
                    <div class="text-caption text-grey-7">{{ formatCurrency(custoLicencaAnual) }} / ano</div>
                    <div class="text-caption text-grey-6 q-mt-xs">Plataforma RPA</div>
                  </div>
                </div>

                <!-- Manutenção + Nuvem -->
                <div class="col-6 col-md-3">
                  <div class="breakdown-item">
                    <div class="row items-center no-wrap q-mb-xs">
                      <q-icon name="cloud_sync" size="18px" color="accent" class="q-mr-xs" />
                      <span class="text-caption text-weight-bold text-grey-8">Manutenção</span>
                      <q-icon name="info_outline" size="14px" class="q-ml-xs cursor-pointer text-grey-5">
                        <q-tooltip class="text-body2" max-width="280px">
                          Sustentação dos robôs, monitoramento e cloud.<br/>
                          <b>{{ formatCurrency(custoManutencaoMensal) }}/mês</b>
                        </q-tooltip>
                      </q-icon>
                    </div>
                    <div class="text-h6 text-weight-bolder text-accent">{{ formatCurrency(custoManutencaoMensal) }}</div>
                    <div class="text-caption text-grey-7">{{ formatCurrency(custoManutencaoMensal * 12) }} / ano</div>
                    <div class="text-caption text-grey-6 q-mt-xs">Sustentação e cloud</div>
                  </div>
                </div>

                <!-- IA / LLM -->
                <div class="col-6 col-md-3">
                  <div class="breakdown-item">
                    <div class="row items-center no-wrap q-mb-xs">
                      <q-icon name="psychology" size="18px" color="accent" class="q-mr-xs" />
                      <span class="text-caption text-weight-bold text-grey-8">IA / LLM</span>
                      <q-icon name="info_outline" size="14px" class="q-ml-xs cursor-pointer text-grey-5">
                        <q-tooltip class="text-body2" max-width="280px">
                          APIs de IA (OpenAI, Anthropic, etc).<br/>
                          <b>{{ formatCurrency(custoLLMMensal) }}/mês</b><br/>
                          <i>Apenas se utilizar Agentic Automation.</i>
                        </q-tooltip>
                      </q-icon>
                    </div>
                    <div class="text-h6 text-weight-bolder text-accent">{{ formatCurrency(custoLLMMensal) }}</div>
                    <div class="text-caption text-grey-7">{{ formatCurrency(custoLLMMensal * 12) }} / ano</div>
                    <div class="text-caption text-grey-6 q-mt-xs">Tokens e APIs de IA</div>
                  </div>
                </div>

                <!-- Outros Custos -->
                <div v-if="outrosCustosRecorrentes > 0" class="col-6 col-md-3">
                  <div class="breakdown-item">
                    <div class="row items-center no-wrap q-mb-xs">
                      <q-icon name="add_circle_outline" size="18px" color="accent" class="q-mr-xs" />
                      <span class="text-caption text-weight-bold text-grey-8">Outros</span>
                    </div>
                    <div class="text-h6 text-weight-bolder text-accent">{{ formatCurrency(outrosCustosRecorrentes) }}</div>
                    <div class="text-caption text-grey-7">{{ formatCurrency(outrosCustosRecorrentes * 12) }} / ano</div>
                    <div class="text-caption text-grey-6 q-mt-xs">Suporte, treinamento, etc</div>
                  </div>
                </div>
              </div>

              <!-- Totais Ano 1 vs Ano 2 -->
              <q-separator class="q-my-sm" />
              <div class="row q-col-gutter-sm items-center" style="flex-wrap: wrap;">
                <div class="col-12 col-md-6">
                  <div class="row items-center justify-between" style="gap: 4px; flex-wrap: wrap;">
                    <span class="text-weight-bold text-dark" style="font-size: 0.85rem;">OPEX Mensal:</span>
                    <span class="text-weight-bolder text-accent" style="font-size: 0.95rem;">{{ formatCurrency(custoRpaMes) }}/mês</span>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="text-caption text-weight-bold text-grey-7">Ano 1: <span class="text-dark">{{ formatCurrency(custoRpaAno1) }}</span></div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="text-caption text-weight-bold text-grey-7">Ano 2: <span class="text-dark">{{ formatCurrency(custoRpaAno2) }}</span></div>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Horas Liberadas — Breakdown -->
          <q-card class="bg-green-1 shadow-1 q-mb-md">
            <q-card-section class="q-pb-sm">
              <div class="text-subtitle1 text-positive text-weight-bold row items-center">
                <q-icon name="rocket_launch" class="q-mr-sm" size="sm" />
                Horas Liberadas do Time
              </div>
            </q-card-section>
            <q-card-section class="q-pt-none">
              <div class="row q-col-gutter-md">
                <!-- Horas manuais atuais -->
                <div class="col-6 col-md-3">
                  <div class="breakdown-item">
                    <div class="row items-center no-wrap q-mb-xs">
                      <q-icon name="hourglass_full" size="18px" color="negative" class="q-mr-xs" />
                      <span class="text-caption text-weight-bold text-grey-8">Esforço Atual</span>
                      <q-icon name="info_outline" size="14px" class="q-ml-xs cursor-pointer text-grey-5">
                        <q-tooltip class="text-body2" max-width="280px">
                          <b>Fórmula:</b> {{ volumeM.toLocaleString('pt-BR') }} × {{ tmaMinutos }}min ÷ 60<br/>
                          <i>Total de horas que o processo consome hoje.</i>
                        </q-tooltip>
                      </q-icon>
                    </div>
                    <div class="text-h6 text-weight-bolder text-negative">{{ horasManuaisMes.toFixed(0) }}h/mês</div>
                    <div class="text-caption text-grey-7">{{ (horasManuaisMes * 12).toFixed(0) }}h / ano</div>
                    <div class="text-caption text-grey-6 q-mt-xs">Tempo total do processo hoje</div>
                  </div>
                </div>

                <!-- Horas liberadas -->
                <div class="col-6 col-md-3">
                  <div class="breakdown-item">
                    <div class="row items-center no-wrap q-mb-xs">
                      <q-icon name="trending_up" size="18px" color="positive" class="q-mr-xs" />
                      <span class="text-caption text-weight-bold text-grey-8">Liberadas</span>
                      <q-icon name="info_outline" size="14px" class="q-ml-xs cursor-pointer text-grey-5">
                        <q-tooltip class="text-body2" max-width="280px">
                          <b>Fórmula:</b> {{ horasManuaisMes.toFixed(0) }}h × {{ reducaoTempo }}% = {{ horasLiberadasMes.toFixed(0) }}h<br/>
                          <i>Horas que o robô assume, liberando o time.</i>
                        </q-tooltip>
                      </q-icon>
                    </div>
                    <div class="text-h6 text-weight-bolder text-positive">{{ horasLiberadasMes.toFixed(0) }}h/mês</div>
                    <div class="text-caption text-grey-7">{{ horasLiberadasAno.toFixed(0) }}h / ano</div>
                    <div class="text-caption text-grey-6 q-mt-xs">~{{ diasLiberadosMes.toFixed(0) }} dias de trabalho/mês</div>
                  </div>
                </div>

                <!-- Horas residuais -->
                <div class="col-6 col-md-3">
                  <div class="breakdown-item">
                    <div class="row items-center no-wrap q-mb-xs">
                      <q-icon name="person_search" size="18px" color="grey-7" class="q-mr-xs" />
                      <span class="text-caption text-weight-bold text-grey-8">Residual</span>
                      <q-icon name="info_outline" size="14px" class="q-ml-xs cursor-pointer text-grey-5">
                        <q-tooltip class="text-body2" max-width="280px">
                          <b>Fórmula:</b> {{ horasManuaisMes.toFixed(0) }}h − {{ horasLiberadasMes.toFixed(0) }}h = {{ horasResiduaisMes.toFixed(0) }}h<br/>
                          <i>Supervisão, exceções e validação que ainda requerem humanos ({{ 100 - reducaoTempo }}% do processo).</i>
                        </q-tooltip>
                      </q-icon>
                    </div>
                    <div class="text-h6 text-weight-bolder text-grey-7">{{ horasResiduaisMes.toFixed(0) }}h/mês</div>
                    <div class="text-caption text-grey-7">{{ (horasResiduaisMes * 12).toFixed(0) }}h / ano</div>
                    <div class="text-caption text-grey-6 q-mt-xs">Supervisão e exceções ({{ 100 - reducaoTempo }}%)</div>
                  </div>
                </div>

                <!-- Por pessoa -->
                <div class="col-6 col-md-3">
                  <div class="breakdown-item">
                    <div class="row items-center no-wrap q-mb-xs">
                      <q-icon name="person" size="18px" color="positive" class="q-mr-xs" />
                      <span class="text-caption text-weight-bold text-grey-8">Por Pessoa</span>
                      <q-icon name="info_outline" size="14px" class="q-ml-xs cursor-pointer text-grey-5">
                        <q-tooltip class="text-body2" max-width="280px">
                          <b>Fórmula:</b> {{ horasLiberadasMes.toFixed(0) }}h ÷ {{ qtdPessoas }} pessoas = {{ horasLiberadasPorPessoa.toFixed(0) }}h<br/>
                          <i>Horas que cada pessoa ganha para atividades estratégicas.</i>
                        </q-tooltip>
                      </q-icon>
                    </div>
                    <div class="text-h6 text-weight-bolder text-positive">{{ horasLiberadasPorPessoa.toFixed(0) }}h/mês</div>
                    <div class="text-caption text-grey-7">{{ (horasLiberadasPorPessoa * 12).toFixed(0) }}h / ano por pessoa</div>
                    <div class="text-caption text-grey-6 q-mt-xs">Tempo livre por colaborador</div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>

        </div>
      </div>

      <!-- Dialog Análises Gráficas -->
      <q-dialog v-model="showGraficos" maximized transition-show="slide-up" transition-hide="slide-down">
        <q-card class="bg-grey-1">
          <q-card-section class="bg-primary text-white row items-center q-py-sm">
            <q-icon name="analytics" size="sm" class="q-mr-sm" />
            <div class="text-h6 text-weight-bold">Análises Gráficas — Business Case RPA</div>
            <q-space />
            <q-btn flat round icon="close" color="white" v-close-popup />
          </q-card-section>

          <q-card-section class="q-pa-md" style="max-width: 1200px; margin: 0 auto;">
            <!-- Gráfico 1: Custo Acumulativo -->
            <q-card class="clean-card shadow-2 q-mb-md">
              <q-card-section class="q-pb-none">
                <div class="text-subtitle1 text-weight-bold text-primary row items-center">
                  <q-icon name="show_chart" class="q-mr-sm" size="sm" />
                  Custo Acumulativo: Manual vs RPA
                </div>
                <div class="text-caption text-grey">O cruzamento das linhas marca o ponto de payback — a partir dele, cada mês gera lucro definitivo.</div>
              </q-card-section>
              <q-card-section>
                <apexchart ref="chartRef" type="line" height="350" :options="chartOptions" :series="chartSeries"></apexchart>
              </q-card-section>
            </q-card>

            <!-- Gráfico 2: Comparativo Ano 1 vs Ano 2 -->
            <q-card class="clean-card shadow-2 q-mb-md">
              <q-card-section class="q-pb-none">
                <div class="text-subtitle1 text-weight-bold text-primary row items-center">
                  <q-icon name="bar_chart" class="q-mr-sm" size="sm" />
                  Comparativo de Custos: Ano 1 vs Ano 2
                </div>
                <div class="text-caption text-grey">No Ano 2 o custo RPA cai significativamente sem a implantação, ampliando a economia.</div>
              </q-card-section>
              <q-card-section>
                <apexchart type="bar" height="350" :options="chartComparativoOptions" :series="chartComparativoSeries"></apexchart>
              </q-card-section>
            </q-card>

            <!-- Gráfico 3: Donuts lado a lado -->
            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-12 col-md-6">
                <q-card class="clean-card shadow-2 full-height">
                  <q-card-section class="q-pb-none">
                    <div class="text-subtitle1 text-weight-bold text-primary row items-center">
                      <q-icon name="donut_large" class="q-mr-sm" size="sm" />
                      Para Onde Vai o Investimento
                    </div>
                    <div class="text-caption text-grey">Composição do custo total RPA no Ano 1.</div>
                  </q-card-section>
                  <q-card-section>
                    <apexchart type="donut" height="300" :options="chartDonutOptions" :series="chartDonutSeries"></apexchart>
                  </q-card-section>
                </q-card>
              </div>
              <div class="col-12 col-md-6">
                <q-card class="clean-card shadow-2 full-height">
                  <q-card-section class="q-pb-none">
                    <div class="text-subtitle1 text-weight-bold text-primary row items-center">
                      <q-icon name="schedule" class="q-mr-sm" size="sm" />
                      Redistribuição do Tempo
                    </div>
                    <div class="text-caption text-grey">Horas que o robô assume vs supervisão humana residual.</div>
                  </q-card-section>
                  <q-card-section>
                    <apexchart type="donut" height="300" :options="chartHorasDonutOptions" :series="chartHorasDonutSeries"></apexchart>
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <!-- Gráfico 4: Economia Acumulada -->
            <q-card class="clean-card shadow-2 q-mb-md">
              <q-card-section class="q-pb-none">
                <div class="text-subtitle1 text-weight-bold text-primary row items-center">
                  <q-icon name="area_chart" class="q-mr-sm" size="sm" />
                  Economia Líquida Acumulada
                </div>
                <div class="text-caption text-grey">Evolução mês a mês da economia real. A linha vertical laranja marca o payback — a partir dali, é lucro.</div>
              </q-card-section>
              <q-card-section>
                <apexchart type="area" height="350" :options="chartEconomiaOptions" :series="chartEconomiaSeries"></apexchart>
              </q-card-section>
            </q-card>
          </q-card-section>
        </q-card>
      </q-dialog>
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
const showGraficos = ref(false)

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
const outrosCustosRecorrentes = ref(0)
const reducaoTempo = ref(80)
const reducaoErros = ref(90)
const usarVolumeTotalNoCalculo = ref(true)

const horasTimeMes = computed(() => {
  if (!execucoesDia.value || !diasUteis.value || !tmaMinutos.value) return 0
  return (execucoesDia.value * diasUteis.value * tmaMinutos.value) / 60
})

const horasPorPessoaDia = computed(() => {
  if (!horasTimeMes.value || !qtdPessoas.value || !diasUteis.value) return 0
  return horasTimeMes.value / qtdPessoas.value / diasUteis.value
})

// === CUSTO MANUAL (AS-IS) ===
// Horas totais da demanda (sempre calculado, usado em capacidade e gráficos)
const horasDemandaTotalMes = computed(() => {
  return (volumeM.value * tmaMinutos.value) / 60
})

// Horas usadas no cálculo financeiro (depende do toggle)
const horasManuaisMes = computed(() => {
  if (!usarVolumeTotalNoCalculo.value && capacidadeExcedida.value) {
    return capacidadeDisponivelMes.value
  }
  return horasDemandaTotalMes.value
})

const custoManualMes = computed(() => {
  return (horasManuaisMes.value * custoHora.value) + custoErrosMes.value
})

const custoManualAno = computed(() => {
  return custoManualMes.value * 12
})

// Custo do time dedicado (pessoas × jornada × dias × custoHora)
const custoTimeMes = computed(() => {
  return capacidadeDisponivelMes.value * custoHora.value
})

const custoTimeAno = computed(() => {
  return custoTimeMes.value * 12
})

// Decomposição do custo manual
const custoProcessoHoras = computed(() => {
  return horasManuaisMes.value * custoHora.value
})

// === CAPACIDADE DO TIME ===
const capacidadeDisponivelMes = computed(() => {
  return qtdPessoas.value * jornadaDiaria.value * diasUteis.value
})

const capacidadeExcedida = computed(() => {
  return horasDemandaTotalMes.value > capacidadeDisponivelMes.value && capacidadeDisponivelMes.value > 0
})

// Volume que o time consegue atender vs demanda real
const volumeAtendidoMes = computed(() => {
  if (!capacidadeExcedida.value || !tmaMinutos.value || tmaMinutos.value <= 0) return volumeM.value
  return Math.floor((capacidadeDisponivelMes.value * 60) / tmaMinutos.value)
})

const volumeRepresadoMes = computed(() => {
  if (!capacidadeExcedida.value) return 0
  return volumeM.value - volumeAtendidoMes.value
})

const percentualAtendido = computed(() => {
  if (!volumeM.value || volumeM.value <= 0) return 100
  return (volumeAtendidoMes.value / volumeM.value) * 100
})

const horasRepresadasMes = computed(() => {
  return (volumeRepresadoMes.value * tmaMinutos.value) / 60
})

// Pessoas necessárias para atender 100% da demanda
const pessoasNecessarias = computed(() => {
  if (!jornadaDiaria.value || !diasUteis.value || jornadaDiaria.value <= 0 || diasUteis.value <= 0) return qtdPessoas.value
  return Math.ceil(horasDemandaTotalMes.value / (jornadaDiaria.value * diasUteis.value))
})

const pessoasFaltantes = computed(() => {
  return Math.max(0, pessoasNecessarias.value - qtdPessoas.value)
})

const custoContratarFaltantes = computed(() => {
  if (!salarioMedio.value || salarioMedio.value <= 0) {
    return pessoasFaltantes.value * custoHora.value * jornadaDiaria.value * diasUteis.value
  }
  return pessoasFaltantes.value * salarioMedio.value
})

// === CUSTO RPA ===
const custoRpaMes = computed(() => {
  return (custoLicencaAnual.value / 12) + custoManutencaoMensal.value + custoLLMMensal.value + outrosCustosRecorrentes.value
})

const custoRpaAno1 = computed(() => {
  return custoImplementacao.value + custoLicencaAnual.value + ((custoManutencaoMensal.value + custoLLMMensal.value + outrosCustosRecorrentes.value) * 12)
})

const custoRpaAno2 = computed(() => {
  return custoLicencaAnual.value + ((custoManutencaoMensal.value + custoLLMMensal.value + outrosCustosRecorrentes.value) * 12)
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

const roiPercentualAno1 = computed(() => {
  if (custoRpaAno1.value <= 0) return 0
  return (economiaAno1.value / custoRpaAno1.value) * 100
})

const roiPercentual2Anos = computed(() => {
  const investimentoTotal = custoRpaAno1.value + custoRpaAno2.value
  if (investimentoTotal <= 0) return 0
  return (economiaAcumulada2Anos.value / investimentoTotal) * 100
})

// Decomposição OPEX RPA
const custoLicencaMes = computed(() => {
  return custoLicencaAnual.value / 12
})

// Horas residuais (o que sobra para o time após automação)
const horasResiduaisMes = computed(() => {
  return horasManuaisMes.value - horasLiberadasMes.value
})

const diasLiberadosMes = computed(() => {
  if (!jornadaDiaria.value || jornadaDiaria.value <= 0) return 0
  return horasLiberadasMes.value / jornadaDiaria.value
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

// === GRÁFICO 2: Comparativo Ano 1 vs Ano 2 ===
const chartComparativoOptions = computed(() => ({
  chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
  colors: ['#034894', '#ff6500', '#4caf50'],
  plotOptions: { bar: { borderRadius: 4, columnWidth: '60%', dataLabels: { position: 'top' } } },
  dataLabels: { enabled: true, formatter: (val) => formatCurrency(val), style: { fontSize: '10px', colors: ['#333'] }, offsetY: -20 },
  xaxis: { categories: ['Ano 1', 'Ano 2'] },
  yaxis: { labels: { formatter: (val) => formatCurrency(val) } },
  legend: { position: 'top' },
  tooltip: { y: { formatter: (val) => formatCurrency(val) } }
}))

const chartComparativoSeries = computed(() => [
  { name: 'Custo Manual', data: [custoManualAno.value, custoManualAno.value] },
  { name: 'Custo RPA', data: [custoRpaAno1.value, custoRpaAno2.value] },
  { name: 'Economia', data: [economiaAno1.value, economiaAno2.value] }
])

// === GRÁFICO 3: Donut Composição Investimento ===
const chartDonutOptions = computed(() => ({
  chart: { type: 'donut', fontFamily: 'Inter, sans-serif' },
  labels: outrosCustosRecorrentes.value > 0 ? ['Implantação', 'Licença', 'Manutenção', 'IA / LLM', 'Outros'] : ['Implantação', 'Licença', 'Manutenção', 'IA / LLM'],
  colors: outrosCustosRecorrentes.value > 0 ? ['#034894', '#ff6500', '#2196f3', '#9c27b0', '#607d8b'] : ['#034894', '#ff6500', '#2196f3', '#9c27b0'],
  legend: { position: 'bottom' },
  dataLabels: { enabled: true, formatter: (val) => val.toFixed(0) + '%' },
  tooltip: { y: { formatter: (val) => formatCurrency(val) } },
  plotOptions: { pie: { donut: { size: '55%', labels: { show: true, total: { show: true, label: 'Total Ano 1', formatter: () => formatCurrency(custoRpaAno1.value) } } } } }
}))

const chartDonutSeries = computed(() => {
  const series = [
    custoImplementacao.value,
    custoLicencaAnual.value,
    custoManutencaoMensal.value * 12,
    custoLLMMensal.value * 12
  ]
  if (outrosCustosRecorrentes.value > 0) series.push(outrosCustosRecorrentes.value * 12)
  return series
})

// === GRÁFICO 4: Donut Horas ===
const chartHorasDonutOptions = computed(() => ({
  chart: { type: 'donut', fontFamily: 'Inter, sans-serif' },
  labels: ['Liberadas pelo RPA', 'Supervisão/Exceções'],
  colors: ['#4caf50', '#bdbdbd'],
  legend: { position: 'bottom' },
  dataLabels: { enabled: true, formatter: (val) => val.toFixed(0) + '%' },
  tooltip: { y: { formatter: (val) => val.toFixed(0) + 'h/mês' } },
  plotOptions: { pie: { donut: { size: '55%', labels: { show: true, total: { show: true, label: 'Total', formatter: () => horasManuaisMes.value.toFixed(0) + 'h' } } } } }
}))

const chartHorasDonutSeries = computed(() => [
  Math.round(horasLiberadasMes.value),
  Math.round(horasResiduaisMes.value)
])

// === GRÁFICO 5: Economia Acumulada (Area) ===
const chartEconomiaOptions = computed(() => ({
  chart: { type: 'area', toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
  colors: ['#4caf50'],
  stroke: { curve: 'smooth', width: 3 },
  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.5, opacityTo: 0.05 } },
  xaxis: {
    categories: Array.from({ length: 25 }, (_, i) => `Mês ${i}`),
    title: { text: 'Meses', style: { fontWeight: 'bold' } }
  },
  yaxis: {
    title: { text: 'Economia Acumulada (R$)', style: { fontWeight: 'bold' } },
    labels: { formatter: (val) => formatCurrency(val) }
  },
  tooltip: { y: { formatter: (val) => formatCurrency(val) } },
  annotations: paybackMeses.value !== null ? {
    xaxis: [{
      x: `Mês ${Math.ceil(paybackMeses.value)}`,
      borderColor: '#ff6500',
      label: { text: 'Payback', style: { color: '#fff', background: '#ff6500' } }
    }]
  } : {}
}))

const chartEconomiaSeries = computed(() => {
  const data = []
  for (let idx = 0; idx <= 24; idx++) {
    const economiaAcum = (economiaLiquidaMes.value * idx) - custoImplementacao.value
    data.push(Math.round(economiaAcum))
  }
  return [{ name: 'Economia Líquida Acumulada', data }]
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
      { label: 'Outros Custos Recorrentes Mensal', value: formatCurrency(outrosCustosRecorrentes.value) },
      { label: 'Redução de Tempo Prevista', value: `${reducaoTempo.value}%` },
      { label: 'Redução de Erros Prevista', value: `${reducaoErros.value}%` }
    ],
    results: [
      { label: 'Custo do Time (Mensal)', value: `${formatCurrency(custoTimeMes.value)} (${qtdPessoas.value} pessoas × ${jornadaDiaria.value}h × ${diasUteis.value}d × ${formatCurrency(custoHora.value)}/h)` },
      { label: 'Custo do Time (Anual)', value: formatCurrency(custoTimeAno.value) },
      { label: 'Custo por Esforço (Mensal)', value: `${formatCurrency(custoProcessoHoras.value)} (${horasManuaisMes.value.toFixed(0)}h efetivas)` },
      { label: 'Custo com Erros (Mensal)', value: formatCurrency(custoErrosMes.value) },
      { label: 'Total Processo Manual (Mensal)', value: formatCurrency(custoManualMes.value) },
      { label: 'Total Processo Manual (Anual)', value: formatCurrency(custoManualAno.value) },
      { label: 'Economia Bruta Mensal (com reduções)', value: formatCurrency(economiaBrutaMes.value) },
      { label: 'Custo RPA Mensal (OPEX recorrente)', value: formatCurrency(custoRpaMes.value) },
      { label: 'Economia Líquida Mensal', value: formatCurrency(economiaLiquidaMes.value) },
      { label: 'Custo RPA Total Ano 1', value: formatCurrency(custoRpaAno1.value) },
      { label: 'Custo RPA Ano 2 (somente recorrente)', value: formatCurrency(custoRpaAno2.value) },
      { label: 'Tempo Estimado de Payback', value: paybackMeses.value !== null ? `${paybackMeses.value.toFixed(1)} meses` : 'Inviável — OPEX supera economia' },
      { label: 'Economia Ano 1', value: `${formatCurrency(economiaAno1.value)} (ROI: ${roiPercentualAno1.value.toFixed(0)}%)` },
      { label: 'Economia Ano 2 (sem implantação)', value: formatCurrency(economiaAno2.value) },
      { label: 'Economia Acumulada (2 Anos)', value: `${formatCurrency(economiaAcumulada2Anos.value)} (ROI: ${roiPercentual2Anos.value.toFixed(0)}%)` },
      { label: 'Horas Residuais (supervisão/exceções)', value: `${horasResiduaisMes.value.toFixed(0)}h/mês (${(100 - reducaoTempo.value)}% do processo)` },
      { label: 'Horas Liberadas do Time (Mensal)', value: `${horasLiberadasMes.value.toFixed(0)} horas (~${horasLiberadasPorPessoa.value.toFixed(0)}h por pessoa)` },
      { label: 'Horas Liberadas do Time (Anual)', value: `${horasLiberadasAno.value.toFixed(0)} horas` },
      ...(capacidadeExcedida.value ? [
        { label: 'Capacidade do Time', value: `${capacidadeDisponivelMes.value.toFixed(0)}h/mês (${qtdPessoas.value} pessoas × ${jornadaDiaria.value}h × ${diasUteis.value} dias)` },
        { label: 'Volume Atendido pelo Time', value: `${volumeAtendidoMes.value.toLocaleString('pt-BR')} de ${volumeM.value.toLocaleString('pt-BR')} (${percentualAtendido.value.toFixed(0)}%)` },
        { label: 'Volume Represado (não atendido)', value: `${volumeRepresadoMes.value.toLocaleString('pt-BR')} transações/mês (${horasRepresadasMes.value.toFixed(0)}h)` },
        { label: 'Pessoas necessárias (100% demanda)', value: `${pessoasNecessarias.value} pessoas (faltam +${pessoasFaltantes.value})` },
        { label: 'Custo de contratar +' + pessoasFaltantes.value + ' pessoas', value: `${formatCurrency(custoContratarFaltantes.value)}/mês` }
      ] : [])
    ],
    chartData: chartRawData
  }
}

const { exportToPDF, exportToExcel, exportingPDF, exportingExcel } = useToolExport(getExportData, chartRef)

// === IMPORT / EXPORT JSON ===
function exportToJSON () {
  const params = {
    _version: 1,
    _exportedAt: new Date().toISOString(),
    volumeM: volumeM.value,
    tmaMinutos: tmaMinutos.value,
    qtdPessoas: qtdPessoas.value,
    custoHora: custoHora.value,
    custoErrosMes: custoErrosMes.value,
    custoImplementacao: custoImplementacao.value,
    custoLicencaAnual: custoLicencaAnual.value,
    custoManutencaoMensal: custoManutencaoMensal.value,
    custoLLMMensal: custoLLMMensal.value,
    outrosCustosRecorrentes: outrosCustosRecorrentes.value,
    reducaoTempo: reducaoTempo.value,
    reducaoErros: reducaoErros.value,
    execucoesDia: execucoesDia.value,
    diasUteis: diasUteis.value,
    jornadaDiaria: jornadaDiaria.value,
    salarioMedio: salarioMedio.value,
    usarVolumeTotalNoCalculo: usarVolumeTotalNoCalculo.value
  }
  const blob = new Blob([JSON.stringify(params, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `roi-params-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function importFromJSON () {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (data.volumeM !== undefined) volumeM.value = data.volumeM
        if (data.tmaMinutos !== undefined) tmaMinutos.value = data.tmaMinutos
        if (data.qtdPessoas !== undefined) qtdPessoas.value = data.qtdPessoas
        if (data.custoHora !== undefined) custoHora.value = data.custoHora
        if (data.custoErrosMes !== undefined) custoErrosMes.value = data.custoErrosMes
        if (data.custoImplementacao !== undefined) custoImplementacao.value = data.custoImplementacao
        if (data.custoLicencaAnual !== undefined) custoLicencaAnual.value = data.custoLicencaAnual
        if (data.custoManutencaoMensal !== undefined) custoManutencaoMensal.value = data.custoManutencaoMensal
        if (data.custoLLMMensal !== undefined) custoLLMMensal.value = data.custoLLMMensal
        if (data.outrosCustosRecorrentes !== undefined) outrosCustosRecorrentes.value = data.outrosCustosRecorrentes
        if (data.reducaoTempo !== undefined) reducaoTempo.value = data.reducaoTempo
        if (data.reducaoErros !== undefined) reducaoErros.value = data.reducaoErros
        if (data.execucoesDia !== undefined) execucoesDia.value = data.execucoesDia
        if (data.diasUteis !== undefined) diasUteis.value = data.diasUteis
        if (data.jornadaDiaria !== undefined) jornadaDiaria.value = data.jornadaDiaria
        if (data.salarioMedio !== undefined) salarioMedio.value = data.salarioMedio
        if (data.usarVolumeTotalNoCalculo !== undefined) usarVolumeTotalNoCalculo.value = data.usarVolumeTotalNoCalculo
        if (data.outrosCustosRecorrentes !== undefined) outrosCustosRecorrentes.value = data.outrosCustosRecorrentes
      } catch {
        alert('Arquivo JSON inválido.')
      }
    }
    reader.readAsText(file)
  }
  input.click()
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
/* ROI Banner */
.roi-banner {
  background: linear-gradient(135deg, #034894 0%, #0d47a1 40%, #1565c0 100%);
  color: white;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}
.roi-banner::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%);
  border-radius: 50%;
}
.roi-metric {
  position: relative;
  cursor: default;
}
.roi-icon {
  color: rgba(255,255,255,0.7);
}
.roi-icon-gold {
  color: #ffd740;
}
.roi-value {
  font-size: clamp(1rem, 2.5vw, 1.4rem);
  font-weight: 800;
  color: white;
  line-height: 1.2;
  word-break: break-word;
}
.roi-value-lg {
  font-size: clamp(1.1rem, 3vw, 1.6rem);
  font-weight: 900;
  color: #ffd740;
  line-height: 1.2;
  word-break: break-word;
}
.roi-percent {
  font-size: 0.85rem;
  font-weight: 700;
  color: rgba(255,255,255,0.9);
}
.roi-percent-lg {
  font-size: clamp(0.9rem, 2vw, 1.2rem);
  font-weight: 800;
  color: #ffd740;
}
.roi-negative {
  color: #ef9a9a !important;
}
.roi-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(255,255,255,0.6);
  font-weight: 600;
  margin-top: 2px;
}
.roi-tag {
  background: rgba(255,255,255,0.15);
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 0.6rem;
}
.roi-highlight {
  background: rgba(255,255,255,0.08);
  border-radius: 10px;
  padding: 12px 8px;
  border: 1px solid rgba(255,215,64,0.2);
}
.roi-btn {
  background: rgba(255,255,255,0.15) !important;
  color: white !important;
  font-weight: 700;
  letter-spacing: 0.5px;
  padding: 8px 28px;
  border: 1px solid rgba(255,255,255,0.25);
  backdrop-filter: blur(4px);
  transition: all 0.2s ease;
}
.roi-btn:hover {
  background: rgba(255,255,255,0.25) !important;
  border-color: rgba(255,255,255,0.4);
}
.roi-btn-icon {
  color: rgba(255,255,255,0.6) !important;
  transition: all 0.2s ease;
}
.roi-separator {
  width: 1px;
  height: 24px;
  background: rgba(255,255,255,0.2);
  margin: 0 4px;
}
.roi-btn-icon:hover {
  color: white !important;
  background: rgba(255,255,255,0.12) !important;
}

.capacidade-card {
  border-left: 4px solid #e65100;
  overflow: hidden;
}
.capacidade-header {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
}
.breakdown-item {
  background: rgba(255,255,255,0.7);
  border-radius: 8px;
  padding: 12px;
  height: 100%;
  min-width: 0;
  overflow: hidden;
}
.breakdown-item .text-h5,
.breakdown-item .text-h6,
.breakdown-item .text-subtitle1 {
  font-size: clamp(0.85rem, 2vw, 1.15rem);
  line-height: 1.3;
  word-break: break-word;
  overflow-wrap: break-word;
}
@media (max-width: 599px) {
  .border-right {
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
  }
  .breakdown-item {
    padding: 10px;
  }
  .breakdown-item .text-h5,
  .breakdown-item .text-h6,
  .breakdown-item .text-subtitle1 {
    font-size: 0.9rem;
  }
}
</style>
