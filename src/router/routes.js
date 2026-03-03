import { useAuthStore } from 'stores/authStore'
import { useSettingsStore } from 'stores/settingsStore'

const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'tools/calculadora-roi', component: () => import('pages/RoiCalculatorPage.vue') },
      {
        path: 'tools/viabilidade-processos',
        component: () => import('pages/ProcessAssessmentTool.vue'),
      },
      { path: 'tools/estimador-esforco', component: () => import('pages/EffortEstimatorTool.vue') },
      { path: 'tools/calculadora-esg', component: () => import('pages/EsgCalculatorTool.vue') },
      { path: 'blog', component: () => import('pages/BlogPage.vue') },
      { path: 'blog/:slug', component: () => import('pages/BlogPostPage.vue') },
      // Cursos (público)
      { path: 'cursos', component: () => import('pages/CoursesPage.vue') },
      { path: 'cursos/:slug', component: () => import('pages/CourseDetailPage.vue') },
      { path: 'entrar', component: () => import('pages/LoginPage.vue') },
      { path: 'manutencao', component: () => import('pages/MaintenancePage.vue') },
    ],
  },

  // Área do aluno (requer login de estudante)
  {
    path: '/minha-area',
    component: () => import('layouts/StudentLayout.vue'),
    meta: { requiresStudentAuth: true },
    children: [
      { path: '', component: () => import('pages/StudentDashboardPage.vue') },
      { path: 'cursos/:slug', component: () => import('pages/CoursePlayerPage.vue') },
    ],
  },

  // Admin login (no layout)
  {
    path: '/admin/login',
    component: () => import('pages/admin/AdminLoginPage.vue'),
  },

  // Admin panel (protected)
  {
    path: '/admin',
    component: () => import('layouts/AdminLayout.vue'),
    redirect: '/admin/dashboard',
    meta: { requiresAuth: true },
    children: [
      { path: 'dashboard', component: () => import('pages/admin/DashboardPage.vue') },
      { path: 'posts', component: () => import('pages/admin/PostsListPage.vue') },
      { path: 'posts/new', component: () => import('pages/admin/PostEditorPage.vue') },
      { path: 'posts/:id/edit', component: () => import('pages/admin/PostEditorPage.vue') },
      // Cursos (admin)
      { path: 'cursos', component: () => import('pages/admin/CoursesListPage.vue') },
      { path: 'cursos/novo', component: () => import('pages/admin/CourseEditorPage.vue') },
      { path: 'cursos/:id/editar', component: () => import('pages/admin/CourseEditorPage.vue') },
      { path: 'alunos', component: () => import('pages/admin/StudentsPage.vue') },
      { path: 'ajudas', component: () => import('pages/admin/HelpRequestsPage.vue') },
      { path: 'comentarios-cursos', component: () => import('pages/admin/CommentsPage.vue') },
      { path: 'configuracoes', component: () => import('pages/admin/SiteSettingsPage.vue') },
    ],
  },

  // Always leave this as last one
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes

export function setupRouterGuards(router) {
  router.beforeEach(async (to) => {
    const authStore = useAuthStore()
    const settingsStore = useSettingsStore()

    if (authStore.loading) {
      await authStore.init()
    }

    if (!settingsStore.loaded) {
      await settingsStore.init()
    }

    // Admin: redireciona para /admin/login se não autenticado
    if (to.meta.requiresAuth) {
      if (!authStore.user) return '/admin/login'
    }

    // Área do aluno: redireciona para /entrar se não autenticado
    if (to.meta.requiresStudentAuth) {
      if (!authStore.user) {
        authStore.pendingReturn = to.fullPath
        return '/entrar'
      }
    }

    // Admin não é bloqueado pelas settings
    if (to.path.startsWith('/admin') || to.path.startsWith('/minha-area')) {
      return true
    }

    const s = settingsStore.settings

    // Blog desabilitado
    if (!s.blog_enabled && (to.path === '/blog' || to.path.startsWith('/blog/'))) {
      return '/manutencao?secao=blog'
    }

    // Cursos desabilitado
    if (!s.courses_enabled && (to.path === '/cursos' || to.path.startsWith('/cursos/'))) {
      return '/manutencao?secao=cursos'
    }

    // Login desabilitado
    if (!s.login_enabled && to.path === '/entrar') {
      return '/'
    }

    return true
  })
}
