import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { useToast } from '../composables/useToast';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue'),
    meta: { title: 'Trang chủ - Thư viện Tri thức' }
  },
  {
    path: '/books',
    name: 'Books',
    component: () => import('../views/BooksView.vue'),
    meta: { title: 'Tra cứu ấn phẩm - Thư viện Tri thức' }
  },
  {
    path: '/books/:id',
    name: 'BookDetail',
    component: () => import('../views/BookDetailView.vue'),
    meta: { title: 'Chi tiết ấn phẩm - Thư viện Tri thức' }
  },
  {
    path: '/my-borrows',
    name: 'MyBorrows',
    component: () => import('../views/MyBorrowsView.vue'),
    meta: { requiresAuth: true, title: 'Tủ sách của tôi - Thư viện Tri thức' }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/ProfileView.vue'),
    meta: { requiresAuth: true, title: 'Hồ sơ bạn đọc - Thư viện Tri thức' }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { guestOnly: true, title: 'Đăng nhập - Thư viện Tri thức' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterView.vue'),
    meta: { guestOnly: true, title: 'Đăng ký thẻ bạn đọc - Thư viện Tri thức' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0, behavior: 'smooth' };
  }
});

// Navigation Guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const toast = useToast();

  // Đổi title trang
  if (to.meta.title) {
    document.title = to.meta.title;
  }

  // Kiểm tra quyền truy cập
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    toast.warning('Vui lòng đăng nhập tài khoản bạn đọc để tiếp tục.');
    return next({
      name: 'Login',
      query: { redirect: to.fullPath }
    });
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return next({ name: 'Home' });
  }

  next();
});

export default router;


