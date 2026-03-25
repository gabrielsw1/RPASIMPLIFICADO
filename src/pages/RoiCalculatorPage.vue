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

        </div>

        <!-- Results Column -->
        <div class="col-12 col-md-7 flex column">
          <!-- Análise de Capacidade -->
          <q-card v-if="capacidadeExcedida" class="q-mb-md shadow-2" style="border-left: 4px solid #ff9800;">
            <q-card-section class="q-pa-md">
              <div class="row items-center q-mb-sm">
                <q-icon name="warning" color="warning" size="sm" class="q-mr-sm" />
                <div class="text-subtitle2 text-weight-bold text-dark">Demanda Excede Capacidade do Time</div>
                <q-icon name="info_outline" size="16px" class="q-ml-xs cursor-pointer text-grey-6">
                  <q-tooltip class="text-body2" max-width="360px">
                    <b>Capacidade:</b> {{ qtdPessoas }} pessoas × {{ jornadaDiaria }}h × {{ diasUteis }} dias = {{ capacidadeDisponivelMes.toFixed(0) }}h/mês<br/>
                    <b>Demanda:</b> {{ volumeM.toLocaleString('pt-BR') }} × {{ tmaMinutos }}min ÷ 60 = {{ horasManuaisMes.toFixed(0) }}h/mês<br/>
                    <b>Volume atendido:</b> Capacidade × 60 ÷ TMA<br/>
                    <b>Represado:</b> Volume total − Volume atendido<br/>
                    <i>O robô absorve tanto o volume atual quanto o represado.</i>
                  </q-tooltip>
                </q-icon>
              </div>

              <div class="row q-col-gutter-md">
                <div class="col-6 col-sm-3">
                  <div class="text-caption text-grey-7">Capacidade do time</div>
                  <div class="text-weight-bold">{{ capacidadeDisponivelMes.toFixed(0) }}h/mês</div>
                </div>
                <div class="col-6 col-sm-3">
                  <div class="text-caption text-grey-7">Demanda real</div>
                  <div class="text-weight-bold text-negative">{{ horasManuaisMes.toFixed(0) }}h/mês</div>
                </div>
                <div class="col-6 col-sm-3">
                  <div class="text-caption text-grey-7">O time atende</div>
                  <div class="text-weight-bold text-primary">{{ volumeAtendidoMes.toLocaleString('pt-BR') }} de {{ volumeM.toLocaleString('pt-BR') }} <span class="text-caption">({{ percentualAtendido.toFixed(0) }}%)</span></div>
                </div>
                <div class="col-6 col-sm-3">
                  <div class="text-caption text-grey-7">Volume represado</div>
                  <div class="text-weight-bold text-negative">{{ volumeRepresadoMes.toLocaleString('pt-BR') }}/mês <span class="text-caption">({{ horasRepresadasMes.toFixed(0) }}h)</span></div>
                </div>
              </div>

              <div class="text-caption text-grey-8 q-mt-sm" style="border-top: 1px solid #eee; padding-top: 8px;">
                O robô absorve 100% da demanda — tanto as {{ volumeAtendidoMes.toLocaleString('pt-BR') }} transações que o time faz hoje quanto as {{ volumeRepresadoMes.toLocaleString('pt-BR') }} que ficam represadas.
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
                <div class="col-12 col-sm-4">
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
                <div class="col-12 col-sm-4">
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
                <div class="col-12 col-sm-4">
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
              <div class="row items-center justify-between">
                <div>
                  <span class="text-weight-bold text-dark">Total do Processo (Esforço + Erros):</span>
                  <q-icon name="info_outline" size="14px" class="q-ml-xs cursor-pointer text-grey-5">
                    <q-tooltip class="text-body2" max-width="300px">
                      <b>Custo Mensal:</b> Custo por Esforço + Custo com Erros<br/>
                      <b>{{ formatCurrency(custoProcessoHoras) }} + {{ formatCurrency(custoErrosMes) }} = {{ formatCurrency(custoManualMes) }}</b><br/>
                      <i>Este é o valor usado nos cálculos de ROI. O "Custo do Time" é exibido como referência para comparação.</i>
                    </q-tooltip>
                  </q-icon>
                </div>
                <div class="text-right">
                  <span class="text-h6 text-weight-bolder text-primary">{{ formatCurrency(custoManualMes) }}/mês</span>
                  <span class="text-caption text-grey-7 q-ml-sm">({{ formatCurrency(custoManualAno) }}/ano)</span>
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
                <div class="col-12 col-sm-3">
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
                <div class="col-12 col-sm-3">
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
                <div class="col-12 col-sm-3">
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
                <div class="col-12 col-sm-3">
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
              </div>

              <!-- Totais Ano 1 vs Ano 2 -->
              <q-separator class="q-my-sm" />
              <div class="row q-col-gutter-sm">
                <div class="col-12 col-sm-6">
                  <div class="row items-center justify-between">
                    <span class="text-weight-bold text-dark">OPEX Mensal (recorrente):</span>
                    <span class="text-weight-bolder text-accent">{{ formatCurrency(custoRpaMes) }}/mês</span>
                  </div>
                </div>
                <div class="col-12 col-sm-3">
                  <div class="row items-center justify-between">
                    <span class="text-caption text-weight-bold text-grey-7">Total Ano 1:</span>
                    <span class="text-weight-bold text-dark">{{ formatCurrency(custoRpaAno1) }}</span>
                  </div>
                </div>
                <div class="col-12 col-sm-3">
                  <div class="row items-center justify-between">
                    <span class="text-caption text-weight-bold text-grey-7">Total Ano 2:</span>
                    <span class="text-weight-bold text-dark">{{ formatCurrency(custoRpaAno2) }}</span>
                  </div>
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
                <div class="col-12 col-sm-3">
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
                <div class="col-12 col-sm-3">
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
                <div class="col-12 col-sm-3">
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
                <div class="col-12 col-sm-3">
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

          <!-- Indicadores de ROI — Breakdown -->
          <q-card class="shadow-4 bg-white q-mb-md">
            <q-card-section class="q-pb-sm">
              <div class="text-subtitle1 text-weight-bold text-dark row items-center">
                <q-icon name="trending_up" class="q-mr-sm" size="sm" color="primary" />
                Indicadores de Retorno
              </div>
            </q-card-section>
            <q-card-section class="q-pt-none">
              <div class="row q-col-gutter-md">
                <!-- Payback -->
                <div class="col-12 col-sm-3">
                  <div class="breakdown-item text-center">
                    <div class="row items-center no-wrap justify-center q-mb-xs">
                      <q-icon name="replay" size="18px" color="primary" class="q-mr-xs" />
                      <span class="text-caption text-weight-bold text-grey-8">Payback</span>
                      <q-icon name="info_outline" size="14px" class="q-ml-xs cursor-pointer text-grey-5">
                        <q-tooltip class="text-body2" max-width="320px">
                          <b>Fórmula:</b> {{ formatCurrency(custoImplementacao) }} ÷ {{ formatCurrency(economiaLiquidaMes) }}/mês<br/>
                          <b>Economia Líquida:</b> Economia Bruta − OPEX RPA<br/>
                          <i>Meses até recuperar o investimento inicial.</i>
                        </q-tooltip>
                      </q-icon>
                    </div>
                    <div class="text-h5 text-weight-bolder q-mt-xs" :class="paybackMeses !== null ? 'text-positive' : 'text-negative'">
                      {{ paybackMeses !== null ? paybackMeses.toFixed(1) : '—' }}
                    </div>
                    <div class="text-caption" :class="paybackMeses !== null ? 'text-positive' : 'text-negative'">
                      {{ paybackMeses !== null ? 'meses' : 'Inviável' }}
                    </div>
                  </div>
                </div>

                <!-- ROI Ano 1 -->
                <div class="col-12 col-sm-3">
                  <div class="breakdown-item text-center">
                    <div class="row items-center no-wrap justify-center q-mb-xs">
                      <q-icon name="looks_one" size="18px" color="primary" class="q-mr-xs" />
                      <span class="text-caption text-weight-bold text-grey-8">ROI Ano 1</span>
                      <q-icon name="info_outline" size="14px" class="q-ml-xs cursor-pointer text-grey-5">
                        <q-tooltip class="text-body2" max-width="320px">
                          <b>Economia:</b> ({{ formatCurrency(economiaBrutaMes) }} × 12) − {{ formatCurrency(custoRpaAno1) }}<br/>
                          <b>ROI%:</b> {{ formatCurrency(economiaAno1) }} ÷ {{ formatCurrency(custoRpaAno1) }} × 100<br/>
                          <i>Inclui implantação (Capex) + custos recorrentes (OPEX).</i>
                        </q-tooltip>
                      </q-icon>
                    </div>
                    <div class="text-h5 text-weight-bolder q-mt-xs" :class="economiaAno1 >= 0 ? 'text-positive' : 'text-negative'">
                      {{ formatCurrency(economiaAno1) }}
                    </div>
                    <div class="text-caption text-weight-bold" :class="roiPercentualAno1 >= 0 ? 'text-positive' : 'text-negative'">
                      ROI: {{ roiPercentualAno1.toFixed(0) }}%
                    </div>
                  </div>
                </div>

                <!-- ROI Ano 2 -->
                <div class="col-12 col-sm-3">
                  <div class="breakdown-item text-center">
                    <div class="row items-center no-wrap justify-center q-mb-xs">
                      <q-icon name="looks_two" size="18px" color="primary" class="q-mr-xs" />
                      <span class="text-caption text-weight-bold text-grey-8">ROI Ano 2</span>
                      <q-icon name="info_outline" size="14px" class="q-ml-xs cursor-pointer text-grey-5">
                        <q-tooltip class="text-body2" max-width="320px">
                          <b>Economia:</b> ({{ formatCurrency(economiaBrutaMes) }} × 12) − {{ formatCurrency(custoRpaAno2) }}<br/>
                          <b>Custo Ano 2:</b> Apenas OPEX (sem implantação)<br/>
                          <i>No 2º ano não se paga implantação novamente.</i>
                        </q-tooltip>
                      </q-icon>
                    </div>
                    <div class="text-h5 text-weight-bolder q-mt-xs" :class="economiaAno2 >= 0 ? 'text-positive' : 'text-negative'">
                      {{ formatCurrency(economiaAno2) }}
                    </div>
                    <div class="text-caption text-grey-6">Sem custo de implantação</div>
                  </div>
                </div>

                <!-- ROI Acumulado 2 Anos -->
                <div class="col-12 col-sm-3">
                  <div class="breakdown-item text-center" style="background: rgba(76,175,80,0.08);">
                    <div class="row items-center no-wrap justify-center q-mb-xs">
                      <q-icon name="emoji_events" size="18px" color="positive" class="q-mr-xs" />
                      <span class="text-caption text-weight-bold text-grey-8">Total 2 Anos</span>
                      <q-icon name="info_outline" size="14px" class="q-ml-xs cursor-pointer text-grey-5">
                        <q-tooltip class="text-body2" max-width="320px">
                          <b>Economia:</b> Ano 1 + Ano 2 = {{ formatCurrency(economiaAno1) }} + {{ formatCurrency(economiaAno2) }}<br/>
                          <b>ROI%:</b> {{ formatCurrency(economiaAcumulada2Anos) }} ÷ ({{ formatCurrency(custoRpaAno1) }} + {{ formatCurrency(custoRpaAno2) }}) × 100
                        </q-tooltip>
                      </q-icon>
                    </div>
                    <div class="text-h5 text-weight-bolder q-mt-xs" :class="economiaAcumulada2Anos >= 0 ? 'text-positive' : 'text-negative'">
                      {{ formatCurrency(economiaAcumulada2Anos) }}
                    </div>
                    <div class="text-weight-bold" :class="roiPercentual2Anos >= 0 ? 'text-positive' : 'text-negative'" style="font-size: 1.1rem;">
                      ROI: {{ roiPercentual2Anos.toFixed(0) }}%
                    </div>
                  </div>
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
  return horasManuaisMes.value > capacidadeDisponivelMes.value && capacidadeDisponivelMes.value > 0
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
        { label: 'Volume Represado (não atendido)', value: `${volumeRepresadoMes.value.toLocaleString('pt-BR')} transações/mês (${horasRepresadasMes.value.toFixed(0)}h)` }
      ] : [])
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
.breakdown-item {
  background: rgba(255,255,255,0.7);
  border-radius: 8px;
  padding: 12px;
  height: 100%;
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
