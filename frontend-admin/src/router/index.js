import { createRouter, createWebHistory } from 'vue-router';
import { useAdminAuthStore } from '../stores/adminAuthStore';
import { useToast } from '../composables/useToast';
import { ADMIN_FEATURES } from '../config/features';

const routes = [
  {
    path: '/login',
    name: 'AdminLogin',
    component: () => import('../views/LoginView.vue'),
    meta: { guestOnly: true, title: 'Đăng nhập Quản trị & Thủ thư' }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { requiresAuth: true, title: 'Bảng điều khiển Tổng quan - Quản trị Thư viện' }
  },
  {
    path: '/books',
    name: 'BooksManage',
    component: () => import('../views/BooksManageView.vue'),
    meta: { requiresAuth: true, title: 'Quản lý Kho ấn phẩm - Quản trị Thư viện' }
  },
  {
    path: '/borrows',
    name: 'BorrowQueue',
    component: () => import('../views/BorrowQueueView.vue'),
    meta: { requiresAuth: true, title: 'Hàng đợi & Xuất sách - Quản trị Thư viện' }
  },
  {
    path: '/returns',
    name: 'Returns',
    component: () => import('../views/ReturnsView.vue'),
    meta: { requiresAuth: true, title: 'Nhận trả sách & Sự cố - Quản trị Thư viện' }
  },
  {
    path: '/fines',
    name: 'Fines',
    component: () => import('../views/FinesView.vue'),
    meta: { requiresAuth: true, title: 'Quản lý Biên bản Bồi thường - Quản trị Thư viện' }
  },
  {
    path: '/users',
    name: 'UsersManage',
    component: () => import('../views/UsersManageView.vue'),
    meta: { requiresAuth: true, roles: ['ADMIN'], title: 'Quản lý Tài khoản & Phân quyền' }
  },
  ...(ADMIN_FEATURES.ENABLE_SETTINGS_PAGE
    ? [
        {
          path: '/settings',
          name: 'Settings',
          component: () => import('../views/SettingsView.vue'),
          meta: { requiresAuth: true, roles: ['ADMIN'], title: 'Cấu hình Quy chế Thư viện' }
        }
      ]
    : []),
  {
    path: '/audit-logs',
    name: 'AuditLogs',
    component: () => import('../views/AuditLogsView.vue'),
    meta: { requiresAuth: true, roles: ['ADMIN'], title: 'Nhật ký Kiểm toán Tác nghiệp' }
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

// RBAC Navigation Guards
router.beforeEach((to, from, next) => {
  const authStore = useAdminAuthStore();

  if (to.meta.title) {
    document.title = `${to.meta.title} - Thư viện Tri thức`;
  }

  // Yêu cầu đăng nhập
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ name: 'AdminLogin', query: { redirect: to.fullPath } });
  }

  // Khách chỉ vào trang login
  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return next({ name: 'Dashboard' });
  }

  // Kiểm tra phân quyền RBAC cụ thể
  if (to.meta.roles && !to.meta.roles.includes(authStore.role)) {
    useToast().warning('Thao tác bị từ chối: Trang này yêu cầu quyền Quản trị viên Tối cao (ADMIN).');
    return next({ name: 'Dashboard' });
  }

  next();
});

export default router;
