import Login from '@/views/login.vue'
import homePage from '@/views/homePage.vue'
import { createRouter, createWebHistory } from 'vue-router'
import ClientsView from '@/views/ClientsView.vue'
import AgendaView from '@/views/AgendaView.vue'
import GalleryView from '@/views/GalleryView.vue'
import ProceduresView from '@/views/ProceduresView.vue'
import FinancialsView from '@/views/FinancialsView.vue'
import StockView from '@/views/StockView.vue'
import BudgetsView from '@/views/BudgetsView.vue'
import { API_BASE_URL } from '@/config/api'

const routes = [
  {
    path: '/',
    name: 'login',
    component: Login,
    meta: { requiresAuth: false, hideForAuth: true } // Esconde login se já estiver autenticado
  },
  {
    path: '/home',
    name: 'home',
    component: homePage,
    meta: { requiresAuth: true }
  }, 
  {
    path: '/clients',
    name: 'clients',
    component: ClientsView,
    meta: { requiresAuth: true }
  }, 
  {
    path: '/appointments',
    name: 'appointments',
    component: AgendaView,
    meta: { requiresAuth: true }
  }, 
  {
    path: '/gallery',
    name: 'gallery',
    component: GalleryView,
    meta: { requiresAuth: true }
  }, 
  {
    path: '/procedures',
    name: 'procedures',
    component: ProceduresView,
    meta: { requiresAuth: true }
  }, 
  {
    path: '/financials',
    name: 'financials',
    component: FinancialsView,
    meta: { requiresAuth: true }
  }, 
  {
    path: '/stock',
    name: 'stock',
    component: StockView,
    meta: { requiresAuth: true }
  },
  {
    path: '/budgets',
    name: 'budgets',
    component: BudgetsView,
    meta: { requiresAuth: true }
  },
  // Rota 404 - redireciona para login
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Função para verificar se o token é válido
async function isTokenValid(token) {
  if (!token) return false;

  try {
    // Faz uma requisição para verificar se o token é válido
    const response = await fetch(`${API_BASE_URL}/auth/validate`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return response.ok;
  } catch (error) {
    console.error('Erro ao validar token:', error);
    return false;
  }
}

// Navigation Guard Global - Protege as rotas
router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('jwt_token');
  const requiresAuth = to.meta.requiresAuth;
  const hideForAuth = to.meta.hideForAuth;

  // Se a rota requer autenticação
  if (requiresAuth) {
    if (!token) {
      // Não tem token, redireciona para login
      return next('/');
    }

    // Verifica se o token é válido
    const valid = await isTokenValid(token);
    
    if (!valid) {
      // Token inválido ou expirado
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user_id');
      return next('/');
    }

    // Token válido, permite acesso
    return next();
  }

  // Se a rota deve ser escondida para usuários autenticados (como login)
  if (hideForAuth && token) {
    const valid = await isTokenValid(token);
    
    if (valid) {
      // Já está autenticado, redireciona para home
      return next('/home');
    } else {
      // Token inválido, limpa e permite acesso ao login
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user_id');
      return next();
    }
  }

  // Rota pública, permite acesso
  next();
});

export default router