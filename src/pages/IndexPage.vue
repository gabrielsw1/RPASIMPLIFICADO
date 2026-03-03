<template>
  <q-page class="landing-page bg-white text-dark">
    <!-- HERO SECTION -->
    <section id="hero" class="hero-section flex flex-center text-center q-pa-md bg-surface relative-position overflow-hidden hero-min-height">
      <!-- Decor abstract shapes -->
      <div class="abstract-shape shape-1"></div>
      <div class="abstract-shape shape-2"></div>
      <div class="abstract-shape shape-3"></div>

      <div class="hero-content z-content">
        <h1 class="text-h2 text-weight-bolder q-mb-md text-primary animate-fade-in-up">
          O Portal Brasileiro de Automação Inteligente
        </h1>
        <h2 class="text-h5 text-weight-medium q-mb-lg text-secondary animate-fade-in-up delay-1">
          RPA, IA e Agentic Automation aplicados à realidade das empresas.
        </h2>
        <p class="text-body1 q-mb-xl text-dark max-width-p mx-auto animate-fade-in-up delay-2">
          Automação não é tendência. É estratégia.<br/>
          O RPA Simplificado nasce para profissionalizar o mercado brasileiro e elevar o nível técnico da automação.
        </p>
        <div class="row q-gutter-sm justify-center animate-fade-in-up delay-3 mobile-stack-btns">
          <q-btn unelevated color="accent" label="Conheça o Portal" size="lg" class="hover-scale btn-glow text-weight-bold" @click="scrollTo('about')" />
          <q-btn outline color="primary" label="Cursos" size="lg" class="hover-scale text-weight-bold bg-white" to="/cursos" />
          <q-btn flat color="secondary" label="Fale Comigo" size="lg" class="hover-scale text-weight-bold" @click="scrollTo('contact')" />
        </div>
      </div>
    </section>

    <!-- CREDENTIALS BAR -->
    <section class="credentials-bar q-py-lg q-px-md">
      <div class="row justify-center items-center q-gutter-xl credentials-row">
        <div v-for="cred in credentials" :key="cred.label" class="credential-item text-center">
          <q-icon :name="cred.icon" size="sm" color="accent" class="q-mb-xs" />
          <div class="text-weight-bold text-primary credential-value">{{ cred.value }}</div>
          <div class="text-caption text-secondary">{{ cred.label }}</div>
        </div>
      </div>
    </section>

    <!-- QUEM ESTÁ POR TRÁS -->
    <section id="profile" class="section-container row items-center q-col-gutter-xl q-pa-xl q-my-xl">
      <div class="col-12 col-md-5 text-center">
        <q-avatar size="250px" class="profile-avatar shadow-10 q-mb-md bg-white">
          <img src="~assets/FotoPerfil.png" alt="Gabriel Moreno" class="avatar-gradient" style="object-fit: cover;" />
        </q-avatar>
        <div class="text-h4 text-weight-bold text-primary">Gabriel Moreno da Luz</div>
        <div class="text-subtitle1 text-accent q-mt-sm text-weight-bold">UiPath Community MVP</div>
        <div class="text-subtitle2 text-secondary">Especialista em RPA e Agentic Automation</div>
      </div>
      <div class="col-12 col-md-7">
        <h3 class="text-h3 text-weight-bold q-mb-lg text-primary">Quem Está por Trás do RPA Simplificado</h3>
        <p class="text-body1 text-dark q-mb-md text-justify">
          Sou Analista de Sistemas com mais de 10 anos de experiência em automação, integração de sistemas e arquitetura de soluções corporativas. Atuo em projetos reais de mercado, aplicando RPA e Inteligência Artificial para gerar eficiência, escalabilidade e inteligência operacional.
        </p>
        <p class="text-body1 text-dark q-mb-md border-left-accent q-pl-md bg-orange-1 q-py-sm rounded-borders-right">
          O RPA Simplificado nasce da prática, não da teoria.<br/>
          Aqui, automação é aplicada à realidade das empresas.
        </p>
        <p class="text-body1 text-dark text-justify">
          Minha missão é simplificar o que é complexo e preparar profissionais para o que realmente acontece no mercado.
        </p>
      </div>
    </section>

    <!-- O QUE É O RPA SIMPLIFICADO -->
    <section id="about" class="section-container bg-surface q-pa-xl rounded-borders q-my-xl relative-position">
      <div class="z-content relative-position">
        <h3 class="text-h3 text-weight-bold text-center q-mb-md text-primary">Mais do que conteúdo. Um movimento de profissionalização.</h3>
        <p class="text-h6 text-center text-secondary q-mb-xl max-width-p mx-auto">
          O RPA Simplificado é uma iniciativa focada em elevar o nível da automação no Brasil. Não se trata apenas de ensinar ferramentas, mas formar profissionais capazes de construir soluções estratégicas.
        </p>

        <div class="row q-col-gutter-lg justify-center q-mb-xl">
          <div class="col-12 col-sm-6 col-md-4" v-for="(item, i) in aboutItems" :key="i">
            <q-card class="clean-card full-height hover-translate">
              <q-card-section>
                <q-icon :name="item.icon" size="md" color="accent" class="q-mb-md" />
                <div class="text-h6 text-weight-bold text-primary">{{ item.title }}</div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <div class="text-center text-h5 text-weight-medium text-accent">
          <q-icon name="warning" class="q-mr-sm" />
          Automação não é apertar botão. É transformar processos em vantagem competitiva.
        </div>
      </div>
    </section>

    <!-- O QUE EU OFEREÇO -->
    <section id="services" class="section-container q-pa-xl q-my-xl">
      <div class="text-center q-mb-xl">
        <q-badge color="accent" class="q-mb-sm q-pa-sm text-weight-bold text-white rounded-borders">O QUE EU OFEREÇO</q-badge>
        <h3 class="text-h3 text-weight-bold text-primary">Soluções em Educação, Estratégia e Execução</h3>
      </div>

      <div class="row q-col-gutter-xl">
        <!-- Educação -->
        <div class="col-12 col-md-4">
          <q-card class="clean-card feature-card full-height flex column">
            <q-card-section class="text-center q-pt-xl col-grow">
               <div class="icon-wrapper q-mx-auto q-mb-md bg-blue-1">
                 <q-icon name="school" size="xl" color="primary" />
               </div>
               <div class="text-h5 text-weight-bold q-mb-md text-primary">Educação</div>
               <p class="text-body1 text-dark">Cursos e treinamentos estruturados para formar profissionais preparados para o mercado real.</p>
               <q-separator class="q-my-md bg-grey-3" />
               <p class="text-body2 text-secondary">Formação técnica, prática e orientada à arquitetura moderna de automação.</p>
            </q-card-section>
            <q-card-actions class="q-px-lg q-pb-lg">
              <q-btn unelevated color="primary" label="Ver Cursos" class="full-width text-weight-bold" icon="school" to="/cursos" />
            </q-card-actions>
          </q-card>
        </div>

        <!-- Consultoria -->
        <div class="col-12 col-md-4">
          <q-card class="clean-card feature-card full-height flex column">
            <q-card-section class="text-center q-pt-xl col-grow">
               <div class="icon-wrapper q-mx-auto q-mb-md bg-blue-1">
                 <q-icon name="business_center" size="xl" color="primary" />
               </div>
               <div class="text-h5 text-weight-bold q-mb-md text-primary">Consultoria</div>
               <p class="text-body1 text-dark">Implantação de RPA, estruturação de COE, arquitetura de automação e projetos estratégicos com foco em resultado.</p>
               <q-separator class="q-my-md bg-grey-3" />
               <p class="text-body2 text-secondary">Automação com visão de longo prazo.</p>
            </q-card-section>
            <q-card-actions class="q-px-lg q-pb-lg">
              <q-btn unelevated color="accent" label="Solicitar Proposta" class="full-width text-weight-bold" icon="fa-brands fa-whatsapp" href="https://wa.me/5551994533154" target="_blank" />
            </q-card-actions>
          </q-card>
        </div>

        <!-- Comunidade -->
        <div class="col-12 col-md-4">
          <q-card class="clean-card feature-card full-height flex column">
            <q-card-section class="text-center q-pt-xl col-grow">
               <div class="icon-wrapper q-mx-auto q-mb-md bg-blue-1">
                 <q-icon name="people" size="xl" color="primary" />
               </div>
               <div class="text-h5 text-weight-bold q-mb-md text-primary">Comunidade</div>
               <p class="text-body1 text-dark">Eventos, conteúdos técnicos, networking e troca de experiências para desenvolvedores e líderes de automação.</p>
               <q-separator class="q-my-md bg-grey-3" />
               <p class="text-body2 text-secondary">Crescimento profissional com base sólida.</p>
            </q-card-section>
            <q-card-actions class="q-px-lg q-pb-lg">
              <q-btn outline color="primary" label="Participar" class="full-width text-weight-bold" icon="fa-brands fa-youtube" href="https://www.youtube.com/@RPA_Simplificado" target="_blank" />
            </q-card-actions>
          </q-card>
        </div>
      </div>
    </section>

    <!-- POR QUE AUTOMAÇÃO INTELIGENTE -->
    <section class="section-container bg-surface q-pa-xl rounded-borders q-my-xl text-center">
      <h3 class="text-h3 text-weight-bold q-mb-md text-primary">Automação é ampliação de capacidade</h3>
      <p class="text-h6 text-secondary q-mb-xl max-width-p mx-auto">
        Automação não substitui pessoas. Amplia a capacidade das empresas.
      </p>

      <div class="row q-gutter-md justify-center q-mb-xl">
        <q-chip size="lg" color="white" text-color="primary" class="clean-chip shadow-2" icon="trending_up">Escalabilidade</q-chip>
        <q-chip size="lg" color="white" text-color="primary" class="clean-chip shadow-2" icon="verified">Redução de erros</q-chip>
        <q-chip size="lg" color="white" text-color="primary" class="clean-chip shadow-2" icon="tips_and_updates">Agilidade operacional</q-chip>
        <q-chip size="lg" color="white" text-color="primary" class="clean-chip shadow-2" icon="insights">Inteligência de dados</q-chip>
        <q-chip size="lg" color="white" text-color="primary" class="clean-chip shadow-2" icon="lightbulb">Melhor tomada de decisão</q-chip>
      </div>

      <div class="text-h5 text-weight-medium text-accent">
        O futuro da automação é agêntico, orquestrado e orientado a dados. E esse futuro já começou.
      </div>
    </section>

    <!-- BLOG PREVIEW -->
    <section class="section-container bg-surface q-pa-xl rounded-borders q-my-xl">
      <div class="text-center q-mb-xl">
        <q-badge color="primary" class="q-mb-sm q-pa-sm text-weight-bold text-white rounded-borders">CONHECIMENTO APLICADO</q-badge>
        <h3 class="text-h3 text-weight-bold text-primary q-mb-sm">Últimos Artigos</h3>
        <p class="text-h6 text-secondary max-width-p mx-auto">
          Análises técnicas, estudos de caso e estratégias de automação diretamente da prática de mercado.
        </p>
      </div>

      <!-- Loading state -->
      <div v-if="blogLoading" class="row justify-center q-py-xl">
        <q-spinner-dots color="primary" size="48px" />
      </div>

      <!-- Posts grid -->
      <div v-else-if="blogPosts.length" class="row q-col-gutter-lg">
        <div class="col-12 col-sm-6 col-md-4" v-for="post in blogPosts" :key="post.id">
          <q-card flat bordered class="blog-preview-card full-height flex column cursor-pointer" @click="$router.push(`/blog/${post.slug}`)">
            <!-- Cover image -->
            <q-img
              :src="post.cover_image || '/rpa_simplificado_thumb.png'"
              :ratio="16/9"
              class="blog-preview-img"
            >
              <div v-if="post.category" class="absolute-top-right q-ma-sm">
                <q-chip dense color="accent" text-color="white" class="text-weight-bold text-caption">
                  {{ post.category }}
                </q-chip>
              </div>
            </q-img>

            <q-card-section class="col-grow">
              <div class="text-caption text-secondary q-mb-sm">
                {{ formatDate(post.created_at) }}
              </div>
              <div class="text-h6 text-weight-bold text-primary q-mb-sm blog-title-clamp">
                {{ post.title }}
              </div>
              <p class="text-body2 text-dark blog-excerpt-clamp">
                {{ post.excerpt }}
              </p>
            </q-card-section>

            <q-card-actions class="q-px-md q-pb-md">
              <q-btn flat color="primary" label="Ler artigo" icon-right="arrow_forward" class="text-weight-bold" :to="`/blog/${post.slug}`" />
            </q-card-actions>
          </q-card>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="text-center q-py-xl text-secondary">
        <q-icon name="article" size="48px" color="grey-4" class="q-mb-md" />
        <p class="text-body1">Em breve novos artigos. Fique ligado!</p>
      </div>

      <div class="text-center q-mt-xl">
        <q-btn unelevated color="primary" label="Ver todos os artigos" icon-right="arrow_forward" size="lg" class="hover-scale text-weight-bold" to="/blog" />
      </div>
    </section>

    <!-- DEPOIMENTOS -->
    <section class="section-container q-pa-xl q-my-xl">
      <div class="text-center q-mb-xl">
        <q-badge color="accent" class="q-mb-sm q-pa-sm text-weight-bold text-white rounded-borders">PROVA SOCIAL</q-badge>
        <h3 class="text-h3 text-weight-bold text-primary">O que dizem sobre o trabalho</h3>
      </div>

      <div class="row q-col-gutter-lg">
        <div class="col-12 col-md-4" v-for="(t, i) in testimonials" :key="i">
          <q-card flat bordered class="testimonial-card full-height q-pa-lg">
            <q-icon name="format_quote" size="xl" color="accent" class="q-mb-md" style="opacity:0.4" />
            <p class="text-body1 text-dark q-mb-lg testimonial-text">{{ t.text }}</p>
            <div class="row items-center q-gutter-md">
              <q-avatar size="48px" color="primary" text-color="white" class="text-weight-bold">
                {{ t.initials }}
              </q-avatar>
              <div>
                <div class="text-weight-bold text-primary">{{ t.name }}</div>
                <div class="text-caption text-secondary">{{ t.role }}</div>
              </div>
            </div>
          </q-card>
        </div>
      </div>
    </section>

    <!-- CONTEÚDO YOUTUBE -->
    <section id="youtube" class="section-container bg-surface q-pa-xl rounded-borders q-my-xl text-center">
      <div class="row items-center justify-center q-mb-xl">
        <q-icon name="fa-brands fa-youtube" size="xl" color="red" class="q-mr-md" />
        <h3 class="text-h3 text-weight-bold text-primary q-my-none">RPA Simplificado no YouTube</h3>
      </div>

      <p class="text-h6 text-secondary q-mb-xl max-width-p mx-auto">
        Acompanhe tutoriais práticos, análises de mercado e muito conteúdo técnico focado em RPA e Agentic Automation.
      </p>

      <q-btn
        color="red-7"
        icon="fa-brands fa-youtube"
        label="Conhecer o Canal"
        size="lg"
        class="hover-scale text-weight-bold q-px-xl"
        href="https://www.youtube.com/@RPA_Simplificado"
        target="_blank"
      />
    </section>

    <!-- CHAMADA FINAL — 2 TRILHAS -->
    <section id="contact" class="section-container q-pa-xl q-mt-xl">
      <div class="text-center q-mb-xl">
        <h2 class="text-h2 text-weight-bolder q-mb-md text-primary">Por onde você quer começar?</h2>
        <p class="text-h6 text-secondary max-width-p mx-auto">
          Escolha o caminho que faz sentido para o seu momento.
        </p>
      </div>

      <div class="row q-col-gutter-lg">
        <!-- Trilha: Cursos -->
        <div class="col-12 col-md-6">
          <q-card class="cta-card cta-courses full-height text-center q-pa-xl">
            <q-icon name="school" size="64px" color="white" class="q-mb-md" />
            <div class="text-h4 text-weight-bold text-white q-mb-sm">Quero me especializar</div>
            <p class="text-body1 q-mb-xl" style="color: rgba(255,255,255,0.85)">
              Acesse cursos e treinamentos práticos desenvolvidos para o mercado real de automação.
            </p>
            <q-btn unelevated color="white" text-color="accent" label="Ver Cursos" size="lg" class="hover-scale text-weight-bold q-px-xl" to="/cursos" />
          </q-card>
        </div>

        <!-- Trilha: Consultoria -->
        <div class="col-12 col-md-6">
          <q-card flat bordered class="cta-card cta-consulting full-height text-center q-pa-xl">
            <q-icon name="business_center" size="64px" color="primary" class="q-mb-md" />
            <div class="text-h4 text-weight-bold text-primary q-mb-sm">Preciso de consultoria</div>
            <p class="text-body1 text-secondary q-mb-xl">
              Vamos conversar sobre o seu projeto de automação. Da estratégia à implementação, com visão de longo prazo.
            </p>
            <q-btn unelevated color="accent" label="Falar no WhatsApp" icon="fa-brands fa-whatsapp" size="lg" class="hover-scale btn-glow text-white text-weight-bold q-px-xl" href="https://wa.me/5551994533154" target="_blank" />
          </q-card>
        </div>
      </div>

      <!-- Links sociais secundários -->
      <div class="row q-gutter-sm justify-center q-mt-xl mobile-stack-btns">
        <q-btn outline color="primary" label="LinkedIn" icon="fa-brands fa-linkedin" class="hover-scale" href="https://www.linkedin.com/in/gabrieldaluz23/" target="_blank" />
        <q-btn outline color="primary" label="YouTube" icon="fa-brands fa-youtube" class="hover-scale" href="https://www.youtube.com/@RPA_Simplificado" target="_blank" />
      </div>
    </section>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { scroll, useMeta } from 'quasar'
import { supabase } from 'src/boot/supabase'

const metaData = {
  title: 'RPA Simplificado | O Portal Brasileiro de Automação Inteligente',
  meta: {
    description: { name: 'description', content: 'Descubra ferramentas gratuitas de RPA: Calculadora de ROI, Estimador de Esforço e Assessment de Processos.' },
    keywords: { name: 'keywords', content: 'RPA, Automação, Agentic Automation, UIPath, Gabriel Moreno, ROI RPA' },
    equiv: { 'http-equiv': 'Content-Type', content: 'text/html; charset=UTF-8' }
  }
}

useMeta(metaData)

const { getScrollTarget, setVerticalScrollPosition } = scroll

// Credentials bar data
const credentials = [
  { icon: 'emoji_events', value: 'UiPath Community MVP', label: 'Reconhecimento global UiPath' },
  { icon: 'schedule', value: '10+ anos', label: 'de experiência em automação' },
  { icon: 'business', value: '50+ empresas', label: 'atendidas em consultoria' },
  { icon: 'verified', value: 'Referência nacional', label: 'em RPA e Agentic Automation' },
]

const aboutItems = [
  { title: 'RPA com foco em arquitetura', icon: 'architecture' },
  { title: 'Agentic Automation', icon: 'smart_toy' },
  { title: 'Orquestração com Maestro', icon: 'account_tree' },
  { title: 'Integrações corporativas', icon: 'integration_instructions' },
  { title: 'IA aplicada a processos', icon: 'psychology' },
  { title: 'Visão estratégica de mercado', icon: 'visibility' }
]

const testimonials = [
  {
    text: 'Gabriel tem uma visão única de automação corporativa. A consultoria transformou nossa operação — saímos de processos manuais para um COE estruturado em poucos meses.',
    name: 'Diretor de TI',
    role: 'Empresa do setor financeiro',
    initials: 'DT'
  },
  {
    text: 'O treinamento foi o mais prático e direto ao ponto que já fiz em RPA. Aplicamos o conteúdo no mesmo dia. Recomendo para qualquer profissional que queira se destacar.',
    name: 'Analista de Automação',
    role: 'Indústria de manufatura',
    initials: 'AA'
  },
  {
    text: 'Implementamos o COE de automação em 3 meses com a metodologia do Gabriel. A estrutura entregue foi muito além do esperado — técnica, governança e pessoas.',
    name: 'CTO',
    role: 'Empresa de logística',
    initials: 'CT'
  }
]

// Blog preview
const blogLoading = ref(true)
const blogPosts = ref([])

async function loadBlogPosts() {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('id, title, slug, excerpt, cover_image, category, created_at')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(3)

    if (!error && data) {
      blogPosts.value = data
    }
  } catch {
    // silently fail — empty state shown
  } finally {
    blogLoading.value = false
  }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function scrollTo(id) {
  const el = document.getElementById(id)
  if (el) {
    const target = getScrollTarget(el)
    const offset = el.offsetTop - 60
    const duration = 500
    setVerticalScrollPosition(target, offset, duration)
  }
}

onMounted(() => {
  loadBlogPosts()
})
</script>

<style scoped lang="scss">
.max-width-p {
  max-width: 800px;
}
.mx-auto {
  margin-left: auto;
  margin-right: auto;
}
.relative-position {
  position: relative;
}
.z-content {
  z-index: 10;
}
.overflow-hidden {
  overflow: hidden;
}

/* Animations */
.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out forwards;
  opacity: 0;
  transform: translateY(30px);
}
.delay-1 { animation-delay: 0.2s; }
.delay-2 { animation-delay: 0.4s; }
.delay-3 { animation-delay: 0.6s; }

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Decorative Shapes for Light Theme */
.abstract-shape {
  position: absolute;
  border-radius: 50%;
  z-index: 0;
  pointer-events: none;
  opacity: 0.1;
}
.shape-1 {
  width: 600px;
  height: 600px;
  background: #034894;
  top: -20%;
  left: -10%;
  filter: blur(80px);
}
.shape-2 {
  width: 500px;
  height: 500px;
  background: #ff6500;
  bottom: -10%;
  right: -10%;
  filter: blur(80px);
}
.shape-3 {
  width: 300px;
  height: 300px;
  background: #034894;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  filter: blur(60px);
}

.avatar-gradient {
  background: #f8fafc;
  border: 4px solid #034894;
  border-radius: 50%;
}

.border-left-accent {
  border-left: 4px solid var(--q-accent);
}

.rounded-borders-right {
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
}

.icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(-5deg);
  transition: transform 0.3s;
}

.feature-card:hover .icon-wrapper {
  transform: rotate(0deg) scale(1.1);
  background: #034894 !important;
}
.feature-card:hover .icon-wrapper .q-icon {
  color: #ffffff !important;
}

.bg-surface {
  background: #f8fafc;
  border: 1px solid rgba(0,0,0,0.03);
}

.clean-chip {
  border: 1px solid rgba(3, 72, 148, 0.1);
}

.hero-min-height {
  min-height: 100vh;
  padding-top: 60px;
}

/* Credentials Bar */
.credentials-bar {
  background: #fff;
  border-top: 1px solid rgba(3, 72, 148, 0.08);
  border-bottom: 1px solid rgba(3, 72, 148, 0.08);
}
.credential-item {
  min-width: 160px;
}
.credential-value {
  font-size: 1rem;
  line-height: 1.3;
}

/* Blog Preview Cards */
.blog-preview-card {
  border-radius: 14px !important;
  transition: box-shadow 0.25s, transform 0.25s;
  border-color: rgba(3, 72, 148, 0.1) !important;
}
.blog-preview-card:hover {
  box-shadow: 0 8px 32px rgba(3, 72, 148, 0.12) !important;
  transform: translateY(-4px);
}
.blog-preview-img {
  border-radius: 14px 14px 0 0 !important;
}
.blog-title-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.blog-excerpt-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Testimonials */
.testimonial-card {
  border-radius: 14px !important;
  border-color: rgba(3, 72, 148, 0.1) !important;
  transition: box-shadow 0.25s;
}
.testimonial-card:hover {
  box-shadow: 0 8px 32px rgba(3, 72, 148, 0.1) !important;
}
.testimonial-text {
  font-style: italic;
  line-height: 1.7;
}

/* CTA Final Cards */
.cta-card {
  border-radius: 20px !important;
  transition: transform 0.25s, box-shadow 0.25s;
}
.cta-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 48px rgba(0,0,0,0.12) !important;
}
.cta-courses {
  background: linear-gradient(135deg, #034894 0%, #0561c8 100%);
}
.cta-consulting {
  border-color: rgba(3, 72, 148, 0.15) !important;
  background: #fff;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .hero-min-height {
    padding-top: 100px;
    padding-bottom: 60px;
  }

  :deep(.text-h2) {
    font-size: 2.5rem !important;
    line-height: 1.2 !important;
  }
  :deep(.text-h3) {
    font-size: 2rem !important;
    line-height: 1.2 !important;
  }
  :deep(.text-h4) {
    font-size: 1.6rem !important;
    line-height: 1.2 !important;
  }
  :deep(.text-h5) {
    font-size: 1.2rem !important;
    line-height: 1.4 !important;
  }

  .section-container {
    padding-left: 1rem !important;
    padding-right: 1rem !important;
    padding-top: 2.5rem !important;
    padding-bottom: 2.5rem !important;
    margin-top: 1rem !important;
    margin-bottom: 1rem !important;
  }

  .profile-avatar {
    font-size: 180px !important;
    width: 180px !important;
    height: 180px !important;
  }

  .credentials-row {
    display: grid !important;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    justify-items: center;
  }
}

@media (max-width: 599px) {
  .mobile-stack-btns {
    flex-direction: column;
    margin-left: 0 !important;
    width: 100%;
  }
  .mobile-stack-btns > * {
    margin-left: 0 !important;
    margin-top: 12px !important;
    width: 100%;
  }

  :deep(.text-h2) {
    font-size: 2.2rem !important;
  }
}
</style>
