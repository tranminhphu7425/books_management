<template>
  <div class="modal fade" id="userDetailModal" tabindex="-1" aria-hidden="true" ref="modalRef">
    <div class="modal-dialog modal-md modal-dialog-centered">
      <div class="modal-content border-0 shadow-lg">
        <!-- Header -->
        <div class="modal-header bg-primary text-white py-3">
          <h5 class="modal-title font-serif fs-5 d-flex align-items-center">
            <i class="bi bi-person-badge me-2 text-warning"></i> Hồ Sơ Chi Tiết Bạn Đọc / Người Dùng
          </h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>

        <!-- Body -->
        <div class="modal-body p-4" v-if="user">
          <div class="text-center mb-4">
            <!-- Avatar -->
            <div class="user-avatar-wrapper mx-auto mb-2 shadow">
              <img
                :src="displayUserAvatar"
                alt="Avatar"
                class="user-avatar-img"
                @error="handleAvatarError"
              />
            </div>

            <h5 class="font-serif fw-bold text-dark mb-1">{{ userFullName }}</h5>
            <div class="font-monospace text-muted small mb-2">
              MÃ ĐỊNH DANH: <strong class="text-primary">{{ userCode }}</strong>
            </div>

            <!-- Badges Role & Status -->
            <div class="d-flex justify-content-center gap-2">
              <span
                class="badge px-3 py-1"
                :class="{
                  'bg-danger': user.Role === 'ADMIN',
                  'bg-primary': user.Role === 'BOOK_MANAGER',
                  'bg-secondary': user.Role === 'USER' || !user.Role
                }"
              >
                {{ userRoleLabel }}
              </span>

              <span
                class="badge px-3 py-1"
                :class="user.TrangThai === 'BLACKLISTED' || user.DaBiKhoa || user.IsBlacklisted ? 'bg-danger' : 'bg-success'"
              >
                <i :class="user.TrangThai === 'BLACKLISTED' || user.DaBiKhoa || user.IsBlacklisted ? 'bi bi-slash-circle me-1' : 'bi bi-check-circle me-1'"></i>
                {{ user.TrangThai === 'BLACKLISTED' || user.DaBiKhoa || user.IsBlacklisted ? 'Đang Tạm Khóa (Blacklist)' : 'Đang Hoạt Động' }}
              </span>
            </div>
          </div>

          <!-- Cảnh báo nếu bị khóa -->
          <div
            v-if="user.TrangThai === 'BLACKLISTED' || user.DaBiKhoa || user.IsBlacklisted"
            class="alert alert-danger py-2 px-3 small mb-3 border-0 rounded-3 shadow-sm"
          >
            <div class="fw-bold mb-1"><i class="bi bi-exclamation-triangle-fill me-1"></i> Lý do tạm khóa quyền:</div>
            <div>{{ user.LyDoKhoa || 'Vi phạm quy chế mượn trả hoặc chậm trễ hoàn tất biên bản bồi thường.' }}</div>
            <div class="text-muted mt-1" v-if="user.NgayKhoa" style="font-size: 0.75rem;">
              Ngày khóa: {{ formatDate(user.NgayKhoa) }}
            </div>
          </div>

          <!-- Danh sách thông tin cá nhân -->
          <div class="card bg-light border-0 p-3 rounded-3 small">
            <div class="row g-2">
              <div class="col-sm-4 text-muted">Email tài khoản:</div>
              <div class="col-sm-8 fw-semibold text-dark">{{ user.Email || 'Chưa cập nhật' }}</div>

              <div class="col-sm-4 text-muted">Số điện thoại:</div>
              <div class="col-sm-8 fw-semibold text-dark">{{ user.DienThoai || user.SoDienThoai || 'Chưa cập nhật' }}</div>

              <div class="col-sm-4 text-muted">Giới tính:</div>
              <div class="col-sm-8 text-dark">{{ user.Phai || 'Chưa cập nhật' }}</div>

              <div class="col-sm-4 text-muted">Ngày sinh:</div>
              <div class="col-sm-8 text-dark">{{ formatDate(user.NgaySinh) }}</div>

              <div class="col-sm-4 text-muted">Địa chỉ nơi ở:</div>
              <div class="col-sm-8 text-dark">{{ user.DiaChi || 'Chưa cập nhật' }}</div>

              <div class="col-sm-4 text-muted">Ngày tham gia:</div>
              <div class="col-sm-8 text-dark">{{ formatDate(user.createdAt) }}</div>
            </div>
          </div>
        </div>

        <!-- Loading spinner -->
        <div class="modal-body p-5 text-center" v-else-if="isLoading">
          <div class="spinner-border text-primary mb-2"></div>
          <div class="text-muted small">Đang tải hồ sơ bạn đọc...</div>
        </div>

        <!-- Footer -->
        <div class="modal-footer bg-light py-2 d-flex justify-content-between">
          <button
            v-if="user && authStore.isAdmin && !isUsersManagePage"
            type="button"
            class="btn btn-primary btn-sm px-3 shadow-sm d-flex align-items-center gap-2"
            @click="goToUserManageAndEdit"
          >
            <i class="bi bi-person-gear"></i>
            <span>Quản Lý & Phân Quyền Người Dùng</span>
          </button>
          <div v-else></div>

          <button type="button" class="btn btn-secondary btn-sm px-4" data-bs-dismiss="modal">Đóng</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAdminAuthStore } from '../stores/adminAuthStore';
import { getDefaultAvatar } from '../utils/avatarHelper';
import api from '../services/api';

const router = useRouter();
const route = useRoute();
const authStore = useAdminAuthStore();
const modalRef = ref(null);
const user = ref(null);
const isLoading = ref(false);
const avatarFallback = ref(false);

const isUsersManagePage = computed(() => {
  return route.name === 'UsersManage' || route.path === '/users';
});

const userFullName = computed(() => {
  if (!user.value) return '';
  if (user.value.HoTenNV) return user.value.HoTenNV;
  if (user.value.HoTen) return user.value.HoTen;
  return `${user.value.HoLot || ''} ${user.value.Ten || ''}`.trim() || user.value.Email || 'Bạn đọc';
});

const userInitial = computed(() => {
  const name = userFullName.value || 'U';
  return name.charAt(0).toUpperCase();
});

const displayUserAvatar = computed(() => {
  if (avatarFallback.value || !user.value?.HinhAnh) {
    return getDefaultAvatar(user.value?.Phai);
  }
  return user.value.HinhAnh;
});

const handleAvatarError = () => {
  avatarFallback.value = true;
};

const userCode = computed(() => {
  if (!user.value) return '';
  return user.value.MaDocGia || user.value.MSNV || user.value._id?.slice(-6).toUpperCase();
});

const userRoleLabel = computed(() => {
  const role = user.value?.Role || user.value?.ChucVu || 'USER';
  if (role === 'ADMIN') return 'Quản Trị Viên';
  if (role === 'BOOK_MANAGER') return 'Thủ Thư / Quản Lý';
  return 'Bạn Đọc Thư Viện';
});

const formatDate = (dateStr) => {
  if (!dateStr) return 'Chưa cập nhật';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Chưa cập nhật';
  return d.toLocaleDateString('vi-VN');
};

const goToUserManageAndEdit = () => {
  if (!user.value) return;

  const targetId = user.value._id || user.value.MaDocGia || user.value.MSNV;
  let targetTab = 'READERS';
  if (user.value.TrangThai === 'BLACKLISTED' || user.value.IsBlacklisted || user.value.DaBiKhoa) {
    targetTab = 'BLACKLIST';
  } else if (user.value.Role === 'BOOK_MANAGER' || user.value.Role === 'ADMIN') {
    targetTab = 'STAFFS';
  }

  const modal = window.bootstrap.Modal.getInstance(modalRef.value);
  if (modal) modal.hide();

  router.push({
    path: '/users',
    query: {
      tab: targetTab,
      highlight: targetId,
      role: user.value.Role || 'USER'
    }
  });
};

const open = async (userDataOrId) => {
  if (!userDataOrId) return;

  avatarFallback.value = false;
  const modal = new window.bootstrap.Modal(modalRef.value);
  modal.show();

  if (typeof userDataOrId === 'string') {
    isLoading.value = true;
    user.value = null;
    try {
      const res = await api.get(`/users/${userDataOrId}`);
      user.value = res.data.data;
    } catch (err) {
      console.error('Lỗi khi tải chi tiết người dùng:', err);
    } finally {
      isLoading.value = false;
    }
  } else if (userDataOrId._id && !userDataOrId.DiaChi && !userDataOrId.NgaySinh) {
    // Partial object: show current data and fetch full details in background
    user.value = userDataOrId;
    try {
      const res = await api.get(`/users/${userDataOrId._id}`);
      if (res.data.data) user.value = res.data.data;
    } catch (err) {
      // Keep existing data
    }
  } else {
    user.value = userDataOrId;
  }
};

defineExpose({ open });
</script>

<style scoped>
.user-avatar-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #ffffff;
  background: linear-gradient(135deg, #2b3a4a 0%, #1e293b 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-avatar-fallback {
  color: #ffffff;
  font-weight: 700;
  font-size: 2rem;
}
</style>
