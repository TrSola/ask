import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('../views/FrontView.vue'),
    children: [
      {
        path: '',
        name: '首頁',
        component: () => import('../views/HomeView.vue')
      },
      {
        path: 'about',
        name: '關於我們頁面',
        component: () => import('../views/AboutView.vue')
      },
      {
        path: 'product',
        name: '產品頁面',
        component: () => import('../views/ProductsView.vue')
      },
      {
        path: 'cart',
        name: '購物車頁面',
        component: () => import('../views/CartView.vue')
      }
    ]
  },
  {
    path: '/login',
    name: '登入頁面',
    component: () => import('../views/LoginView.vue')
  },
  {
    path: '/admin',
    name: '後台首頁',
    component: () => import('../views/dashboard/DashboardView.vue'),
    children: [
      {
        path: 'order',
        name: '訂單頁面',
        component: () => import('../views/dashboard/OrderView.vue')
      },
      {
        path: 'backProducts',
        name: '產品管理頁面',
        component: () => import('../views/dashboard/BackProductsView.vue')
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: {
      path: '/'
    }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  linkActiveClass: 'active',
  routes
})

export default router
