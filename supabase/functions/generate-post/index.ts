const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { topic, tone = 'profissional e didático' } = await req.json()

    if (!topic?.trim()) {
      return new Response(JSON.stringify({ error: 'topic é obrigatório' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY não configurada')

    const prompt = `Você é um especialista em RPA, automação de processos e tecnologia corporativa. Crie um post completo para o blog "RPA Simplificado" sobre: "${topic}".

Tom: ${tone}
Idioma: Português brasileiro
Público: profissionais de TI, gestores e empresários interessados em automação

Retorne APENAS um objeto JSON válido, sem markdown, sem blocos de código, sem texto antes ou depois. Apenas o JSON puro:

{
  "title": "Título atraente com no máximo 80 caracteres",
  "slug": "titulo-em-kebab-case-sem-acentos-sem-caracteres-especiais-apenas-letras-minusculas-numeros-e-hifens-nunca-use-o-caractere—",
  "excerpt": "Resumo curto e atraente com no máximo 180 caracteres",
  "category": "Exatamente uma de: RPA | Automação | Power Automate | UiPath | Python | Tutoriais | Cases | Gestão | ESG | Tendências | Boas Práticas",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "content": "HTML completo usando <h2>, <h3>, <p>, <ul>, <li>, <strong>, <blockquote>. Mínimo 600 palavras. Inclua: introdução, 3-5 seções com h2, conclusão com call-to-action."
}`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`Claude API error ${response.status}: ${errText}`)
    }

    const result = await response.json()
    const text: string = result.content?.[0]?.text ?? ''

    // Strip any accidental markdown fences
    const clean = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim()
    const parsed = JSON.parse(clean)

    // Sanitize slug regardless of what Claude returned
    if (parsed.slug) {
      parsed.slug = parsed.slug
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[—–]/g, '-')
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-{2,}/g, '-')
        .replace(/^-|-$/g, '')
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('generate-post error:', msg)
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
