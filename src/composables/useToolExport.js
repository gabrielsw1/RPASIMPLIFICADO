import { ref } from 'vue'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

const BRAND_RGB = [3, 72, 148]   // #034894
const ACCENT_RGB = [255, 101, 0] // #ff6500

/**
 * Composable para exportar resultados das ferramentas em PDF e Excel.
 *
 * @param {Object} getData - Função que retorna o objeto de dados da ferramenta
 * @param {Ref|null} chartRef - Ref do componente apexchart (opcional, apenas ROI)
 *
 * Estrutura de dados esperada:
 * {
 *   toolName: string,
 *   subtitle: string,
 *   params: [{ label: string, value: string }],
 *   results: [{ label: string, value: string }],
 *   chartData: [{ mes: string, manual: number, rpa: number }] // opcional
 * }
 */
export function useToolExport(getData, chartRef = null) {
  const exportingPDF = ref(false)
  const exportingExcel = ref(false)

  function _formatDate() {
    return new Date().toLocaleDateString('pt-BR')
  }

  function _safeFileName(toolName) {
    const date = _formatDate().replace(/\//g, '-')
    return toolName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '') + '-' + date
  }

  async function exportToPDF() {
    exportingPDF.value = true
    try {
      const data = getData()
      const { toolName, subtitle, params, results, chartData } = data

      // Capture chart image if available
      let chartImgUri = null
      if (chartRef?.value) {
        try {
          const result = await chartRef.value.chart.dataURI({ scale: 2 })
          chartImgUri = result.imgURI
        } catch {
          // ignore chart capture errors
        }
      }

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageW = doc.internal.pageSize.getWidth()
      const pageH = doc.internal.pageSize.getHeight()
      const margin = 14

      // ── Header band ──────────────────────────────────────────
      doc.setFillColor(...BRAND_RGB)
      doc.rect(0, 0, pageW, 30, 'F')

      // Brand
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(15)
      doc.text('RPA Simplificado', margin, 12)

      // Generated date
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text(`Gerado em: ${_formatDate()}`, pageW - margin, 12, { align: 'right' })

      // Tool name in header
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      const titleLines = doc.splitTextToSize(toolName, pageW - margin * 2)
      doc.text(titleLines, margin, 23)

      let y = 38

      // Subtitle
      if (subtitle) {
        doc.setTextColor(90, 90, 90)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        const lines = doc.splitTextToSize(subtitle, pageW - margin * 2)
        doc.text(lines, margin, y)
        y += lines.length * 5 + 4
      }

      // Accent divider
      doc.setDrawColor(...ACCENT_RGB)
      doc.setLineWidth(1.5)
      doc.line(margin, y, pageW - margin, y)
      y += 8

      // ── Parâmetros ────────────────────────────────────────────
      doc.setTextColor(...BRAND_RGB)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text('PARÂMETROS INFORMADOS', margin, y)
      y += 3

      autoTable(doc, {
        startY: y,
        head: [['Parâmetro', 'Valor']],
        body: params.map(p => [p.label, String(p.value)]),
        styles: { fontSize: 10, cellPadding: 4, overflow: 'linebreak' },
        headStyles: { fillColor: BRAND_RGB, textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [242, 247, 255] },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 95 },
          1: { cellWidth: 'auto' }
        },
        margin: { left: margin, right: margin },
        tableLineColor: [220, 220, 220],
        tableLineWidth: 0.2
      })

      y = doc.lastAutoTable.finalY + 10

      // ── Resultados ────────────────────────────────────────────
      doc.setTextColor(...BRAND_RGB)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text('RESULTADOS E ANÁLISE', margin, y)
      y += 3

      autoTable(doc, {
        startY: y,
        head: [['Métrica', 'Valor']],
        body: results.map(r => [r.label, String(r.value)]),
        styles: { fontSize: 10, cellPadding: 4, overflow: 'linebreak' },
        headStyles: { fillColor: ACCENT_RGB, textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [255, 248, 240] },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 95 },
          1: { cellWidth: 'auto' }
        },
        margin: { left: margin, right: margin },
        tableLineColor: [220, 220, 220],
        tableLineWidth: 0.2
      })

      y = doc.lastAutoTable.finalY + 12

      // ── Gráfico (imagem capturada do ApexCharts) ───────────────
      if (chartImgUri) {
        const chartH = 82
        if (y + chartH + 18 > pageH - 15) {
          doc.addPage()
          y = 18
        }
        doc.setTextColor(...BRAND_RGB)
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.text('GRÁFICO ACUMULATIVO DE RETORNO', margin, y)
        y += 4
        doc.addImage(chartImgUri, 'PNG', margin, y, pageW - margin * 2, chartH)
        y += chartH + 8
      } else if (chartData && chartData.length > 0) {
        // Fallback: tabela de dados do gráfico (amostra a cada 6 meses)
        if (y + 50 > pageH - 15) {
          doc.addPage()
          y = 18
        }
        doc.setTextColor(...BRAND_RGB)
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.text('DADOS DO GRÁFICO (AMOSTRA A CADA 6 MESES)', margin, y)
        y += 3

        const sample = chartData.filter((_, i) => i % 6 === 0)
        autoTable(doc, {
          startY: y,
          head: [['Período', 'Gasto Manual Acumulado', 'Gasto RPA Acumulado']],
          body: sample.map(d => [d.mes, d.manualFmt ?? d.manual, d.rpaFmt ?? d.rpa]),
          styles: { fontSize: 9, cellPadding: 3 },
          headStyles: { fillColor: BRAND_RGB, textColor: [255, 255, 255] },
          margin: { left: margin, right: margin }
        })
      }

      // ── Footer ────────────────────────────────────────────────
      const footerY = pageH - 8
      doc.setDrawColor(210, 210, 210)
      doc.setLineWidth(0.4)
      doc.line(margin, footerY - 4, pageW - margin, footerY - 4)
      doc.setTextColor(160, 160, 160)
      doc.setFontSize(7.5)
      doc.setFont('helvetica', 'normal')
      doc.text(
        'rpasimplificado.com.br  —  Todos os valores são estimativas baseadas nos parâmetros fornecidos pelo usuário.',
        margin,
        footerY
      )

      doc.save(_safeFileName(toolName) + '.pdf')
    } finally {
      exportingPDF.value = false
    }
  }

  function exportToExcel() {
    exportingExcel.value = true
    try {
      const data = getData()
      const { toolName, params, results, chartData } = data
      const wb = XLSX.utils.book_new()

      // Sheet 1 — Parâmetros
      const paramsRows = [
        ['Parâmetro', 'Valor'],
        ...params.map(p => [p.label, p.value])
      ]
      const wsParams = XLSX.utils.aoa_to_sheet(paramsRows)
      wsParams['!cols'] = [{ wch: 42 }, { wch: 32 }]
      XLSX.utils.book_append_sheet(wb, wsParams, 'Parâmetros')

      // Sheet 2 — Resultados
      const resultsRows = [
        ['Métrica', 'Valor'],
        ...results.map(r => [r.label, r.value])
      ]
      const wsResults = XLSX.utils.aoa_to_sheet(resultsRows)
      wsResults['!cols'] = [{ wch: 42 }, { wch: 32 }]
      XLSX.utils.book_append_sheet(wb, wsResults, 'Resultados')

      // Sheet 3 — Dados do Gráfico (ROI only)
      if (chartData && chartData.length > 0) {
        const chartRows = [
          ['Período', 'Gasto Manual Acumulado (R$)', 'Gasto RPA Acumulado (R$)'],
          ...chartData.map(d => [d.mes, d.manual, d.rpa])
        ]
        const wsChart = XLSX.utils.aoa_to_sheet(chartRows)
        wsChart['!cols'] = [{ wch: 12 }, { wch: 35 }, { wch: 35 }]
        XLSX.utils.book_append_sheet(wb, wsChart, 'Dados do Gráfico')
      }

      XLSX.writeFile(wb, _safeFileName(toolName) + '.xlsx')
    } finally {
      exportingExcel.value = false
    }
  }

  return { exportToPDF, exportToExcel, exportingPDF, exportingExcel }
}
