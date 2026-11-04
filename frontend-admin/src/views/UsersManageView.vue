<template>
  <div class="users-manage-view">
    <!-- Header -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
      <div>
        <h3 class="font-serif fw-bold text-dark mb-1">Quản Lý Tài Khoản & Phân Quyền Nhân Sự</h3>
       
      </div>

      <button class="btn btn-primary btn-sm px-3 shadow-sm d-flex align-items-center gap-2" @click="openCreateStaffModal">
        <i class="bi bi-person-plus-fill"></i>
        <span>Thêm Nhân Viên Mới</span>
      </button>
    </div>

    <!-- Filter Tabs -->
    <ul class="nav nav-pills custom-admin-pills mb-4 gap-2">
      <li class="nav-item">
        <button
          class="nav-link"
          :class="{ active: currentTab === 'READERS' }"
          @click="currentTab = 'READERS'"
        >
          <i class="bi bi-people-fill me-1"></i> Danh Sách Độc Giả ({{ userStore.readers.length }})
        </button>
      </li>
      <li class="nav-item">
        <button
          class="nav-link"
          :class="{ active: currentTab === 'STAFFS' }"
          @click="currentTab = 'STAFFS'"
        >
          <i class="bi bi-shield-lock-fill me-1"></i> Nhân Sự & Thủ Thư ({{ userStore.staffs.length }})
        </button>
      </li>
      <li class="nav-item">
        <button
          class="nav-link"
          :class="{ active: currentTab === 'BLACKLIST' }"
          @click="currentTab = 'BLACKLIST'"
        >
          <i class="bi bi-slash-circle-fill me-1"></i> Danh Sách Vi Phạm Blacklist ({{ userStore.blacklistedUsers.length }})
        </button>
      </li>
    </ul>

    <!-- Loading State -->
    <div v-if="userStore.isLoading" class="card border-0 shadow-sm p-5 text-center bg-white">
      <div class="spinner-border spinner-border-sm text-primary mx-auto mb-2"></div>
      <div class="text-muted small">Đang tải danh sách tài khoản...</div>
    </div>

    <!-- Bảng Danh Sách Người Dùng -->
    <div v-else class="card border-0 shadow-sm bg-white overflow-hidden">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0 small">
          <thead class="table-light">
            <tr>
              <th>Họ và tên</th>
              <th>Mã định danh</th>
              <th>Email liên hệ</th>
              <th>Số điện thoại</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th class="text-end">Hành động quản trị</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="displayedUsers.length === 0">
              <td colspan="7" class="text-center py-5 text-muted">
                Không tìm thấy tài khoản nào trong danh mục này.
              </td>
            </tr>

            <tr
              v-for="user in displayedUsers"
              :key="user._id"
              :id="'user-row-' + (user._id || user.msnv || user.MSNV || user.maDocGia || user.MaDocGia)"
              :class="{ 'table-warning border-warning highlighted-row': [user._id, user.msnv, user.MSNV, user.maDocGia, user.MaDocGia].includes(highlightedUserId) }"
            >
              <td>
                <div class="fw-bold text-dark">
                  {{ user.hoTenNV || user.HoTenNV || user.hoTen || `${user.hoLot || user.HoLot || ''} ${user.ten || user.Ten || ''}`.trim() }}
                </div>
                <div class="text-muted" style="font-size: 0.75rem;">Địa chỉ: {{ user.diaChi || user.DiaChi || 'Chưa cập nhật' }}</div>
              </td>
              <td>
                <code class="text-primary">{{ user.msnv || user.MSNV || user.maDocGia || user.MaDocGia || user._id.slice(-6).toUpperCase() }}</code>
              </td>
              <td>{{ user.email || user.Email }}</td>
              <td>{{ user.soDienThoai || user.SoDienThoai || user.dienThoai || user.DienThoai || 'N/A' }}</td>
              <td>
                <span
                  class="badge"
                  :class="{
                    'bg-danger': (user.role || user.Role) === 'ADMIN',
                    'bg-primary': (user.role || user.Role) === 'BOOK_MANAGER',
                    'bg-secondary': (user.role || user.Role) === 'USER'
                  }"
                >
                  {{ (user.role || user.Role) === 'ADMIN' ? 'Quản trị viên' : (user.role || user.Role) === 'BOOK_MANAGER' ? 'Thủ thư' : 'Bạn đọc' }}
                </span>
              </td>
              <td>
                <span
                  class="badge"
                  :class="(user.trangThai || user.TrangThai) === 'BLACKLISTED' || user.isBlacklisted || user.IsBlacklisted ? 'bg-danger' : 'bg-success'"
                >
                  {{ (user.trangThai || user.TrangThai) === 'BLACKLISTED' || user.isBlacklisted || user.IsBlacklisted ? 'Tạm khóa (Blacklist)' : 'Hoạt động' }}
                </span>
              </td>
              <td class="text-end">
                <div class="btn-group btn-group-sm">
                  <!-- Xem chi tiết -->
                  <button
                    class="btn btn-outline-info"
                    @click="userDetailModalRef?.open(user)"
                    title="Xem hồ sơ chi tiết đầy đủ"
                  >
                    <i class="bi bi-eye"></i>
                  </button>

                  <!-- Chỉnh sửa thông tin Nhân sự / Thủ thư -->
                  <button
                    v-if="user.msnv || user.MSNV || ['ADMIN', 'BOOK_MANAGER'].includes(user.role || user.Role || user.chucVu || user.ChucVu)"
                    class="btn btn-outline-warning"
                    @click="openEditStaff(user)"
                    title="Chỉnh sửa thông tin nhân viên"
                  >
                    <i class="bi bi-pencil-square"></i>
                  </button>

                  <!-- Đổi quyền (nếu không phải là chính mình) -->
                  <button
                    class="btn btn-outline-secondary"
                    @click="openChangeRole(user)"
                    title="Thay đổi phân quyền vai trò"
                    :disabled="user._id === currentAdminId"
                  >
                    <i class="bi bi-arrow-repeat me-1"></i> Đổi quyền
                  </button>

                  <!-- Blacklist Button -->
                  <button
                    v-if="(user.trangThai || user.TrangThai) === 'BLACKLISTED' || user.isBlacklisted || user.IsBlacklisted"
                    class="btn btn-outline-success"
                    @click="handleToggleBlacklist(user, false)"
                    title="Gỡ khỏi danh sách vi phạm Blacklist"
                  >
                    <i class="bi bi-unlock-fill"></i> Gỡ khóa
                  </button>
                  <button
                    v-else
                    class="btn btn-outline-danger"
                    @click="handleToggleBlacklist(user, true)"
                    title="Đưa vào danh sách vi phạm Blacklist"
                    :disabled="user._id === currentAdminId || (user.role || user.Role) === 'ADMIN'"
                  >
                    <i class="bi bi-slash-circle"></i> Khóa Blacklist
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Chi Tiết Độc Giả / Người Dùng -->
    <UserDetailModal ref="userDetailModalRef" />

    <!-- Modal Thêm Nhân Viên Mới -->
    <div class="modal fade" id="createStaffModal" tabindex="-1" aria-hidden="true" ref="createStaffModalRef">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title font-serif fs-6">Thêm Mới Nhân Sự / Thủ Thư</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>

          <form @submit.prevent="submitCreateStaff">
            <div class="modal-body p-4">
              <div class="mb-3">
                <label class="form-label small fw-semibold">Họ và tên nhân viên <span class="text-danger">*</span></label>
                <input type="text" v-model="staffForm.hoTenNV" class="form-control" required placeholder="Ví dụ: Trần Văn Cương" />
              </div>

              <div class="mb-3">
                <label class="form-label small fw-semibold">Địa chỉ Email đăng nhập <span class="text-danger">*</span></label>
                <input type="email" v-model="staffForm.email" class="form-control" required placeholder="nhanvien@library.com" />
              </div>

              <div class="mb-3">
                <label class="form-label small fw-semibold">Số điện thoại liên hệ <span class="text-danger">*</span></label>
                <input
                  type="tel"
                  inputmode="numeric"
                  v-model="staffForm.soDienThoai"
                  class="form-control"
                  required
                  placeholder="0987654321"
                  maxlength="11"
                  pattern="[0-9]{10,11}"
                  @keypress="filterNumeric"
                  @input="staffForm.soDienThoai = staffForm.soDienThoai.replace(/\D/g, '')"
                />
              </div>

              <div class="mb-3">
                <label class="form-label small fw-semibold">Địa chỉ nơi ở</label>
                <input type="text" v-model="staffForm.diaChi" class="form-control" placeholder="Ví dụ: Số 123 Đường 3/2, Ninh Kiều, Cần Thơ" />
              </div>

              <div class="mb-3">
                <label class="form-label small fw-semibold">Phân quyền vai trò <span class="text-danger">*</span></label>
                <select v-model="staffForm.role" class="form-select" required>
                  <option value="BOOK_MANAGER">Thủ thư / Quản lý sách (BOOK_MANAGER)</option>
                  <option value="ADMIN">Quản trị viên Hệ thống (ADMIN)</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-semibold">Mật khẩu khởi tạo <span class="text-danger">*</span></label>
                <input type="password" v-model="staffForm.password" class="form-control" minlength="6" required placeholder="Tối thiểu 6 ký tự" />
              </div>
            </div>

            <div class="modal-footer bg-light">
              <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Bỏ qua</button>
              <button type="submit" class="btn btn-primary btn-sm px-4">Tạo Tài Khoản</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Cập Nhật Thông Tin Nhân Sự / Thủ Thư -->
    <div class="modal fade" id="editStaffModal" tabindex="-1" aria-hidden="true" ref="editStaffModalRef">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-warning text-dark">
            <h5 class="modal-title font-serif fs-6 d-flex align-items-center gap-2">
              <i class="bi bi-pencil-square"></i> Cập Nhật Thông Tin Nhân Viên
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <form @submit.prevent="submitEditStaff">
            <div class="modal-body p-4">
              <div class="mb-3">
                <label class="form-label small fw-semibold">Mã số nhân viên (MSNV)</label>
                <input type="text" :value="editStaffTarget?.msnv || editStaffTarget?.MSNV" class="form-control bg-light font-monospace" disabled />
              </div>

              <div class="mb-3">
                <label class="form-label small fw-semibold">Họ và tên nhân viên <span class="text-danger">*</span></label>
                <input type="text" v-model="editStaffForm.hoTenNV" class="form-control" required placeholder="Ví dụ: Trần Văn Cương" />
              </div>

              <div class="mb-3">
                <label class="form-label small fw-semibold">Địa chỉ Email <span class="text-danger">*</span></label>
                <input type="email" v-model="editStaffForm.email" class="form-control" required placeholder="nhanvien@library.com" />
              </div>

              <div class="mb-3">
                <label class="form-label small fw-semibold">Số điện thoại liên hệ</label>
                <input
                  type="tel"
                  inputmode="numeric"
                  v-model="editStaffForm.soDienThoai"
                  class="form-control"
                  placeholder="0987654321"
                  maxlength="11"
                  @keypress="filterNumeric"
                  @input="editStaffForm.soDienThoai = editStaffForm.soDienThoai.replace(/\D/g, '')"
                />
              </div>

              <div class="mb-3">
                <label class="form-label small fw-semibold">Địa chỉ nơi ở</label>
                <input type="text" v-model="editStaffForm.diaChi" class="form-control" placeholder="Ví dụ: Số 123 Đường 3/2, Ninh Kiều, Cần Thơ" />
              </div>

              <div class="mb-3">
                <label class="form-label small fw-semibold">Chức vụ vai trò <span class="text-danger">*</span></label>
                <select
                  v-model="editStaffForm.role"
                  class="form-select"
                  required
                  :disabled="editStaffTarget?._id === currentAdminId"
                >
                  <option value="BOOK_MANAGER">Thủ thư / Quản lý sách (BOOK_MANAGER)</option>
                  <option value="ADMIN">Quản trị viên Hệ thống (ADMIN)</option>
                </select>
                <div v-if="editStaffTarget?._id === currentAdminId" class="form-text text-muted small">
                  Bạn không thể tự thay đổi chức vụ của chính mình tại đây.
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-semibold">Mật khẩu mới (Bỏ trống nếu không đổi)</label>
                <input type="password" v-model="editStaffForm.password" class="form-control" minlength="6" placeholder="Để trống nếu giữ nguyên mật khẩu cũ" />
              </div>
            </div>

            <div class="modal-footer bg-light">
              <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Hủy bỏ</button>
              <button
                type="submit"
                class="btn btn-warning btn-sm px-4 fw-semibold"
                :disabled="isSubmittingEditStaff || !isEditStaffFormDirty"
                :title="!isEditStaffFormDirty ? 'Vui lòng thay đổi thông tin trước khi lưu' : 'Lưu thông tin mới'"
              >
                <span v-if="isSubmittingEditStaff" class="spinner-border spinner-border-sm me-1"></span>
                Lưu Thay Đổi
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Đưa Vào Danh Sách Vi Phạm Blacklist -->
    <div class="modal fade" id="blacklistModal" tabindex="-1" aria-hidden="true" ref="blacklistModalRef">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title font-serif fs-6 d-flex align-items-center gap-2">
              <i class="bi bi-slash-circle-fill"></i>
              <span>Đưa Vào Danh Sách Vi Phạm (Blacklist)</span>
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>

          <form @submit.prevent="submitBlacklist">
            <div class="modal-body p-4">
              <!-- Thông tin người dùng bị khóa -->
              <div v-if="blacklistTargetUser" class="p-3 bg-light rounded-3 mb-3 border">
                <div class="fw-bold text-dark fs-6">
                  {{ blacklistTargetUser.hoTenNV || blacklistTargetUser.HoTenNV || blacklistTargetUser.hoTen || `${blacklistTargetUser.hoLot || blacklistTargetUser.HoLot || ''} ${blacklistTargetUser.ten || blacklistTargetUser.Ten || ''}`.trim() }}
                </div>
                <div class="small text-muted d-flex gap-3 mt-1 flex-wrap">
                  <span><strong>Email:</strong> {{ blacklistTargetUser.email || blacklistTargetUser.Email }}</span>
                  <span><strong>Mã:</strong> {{ blacklistTargetUser.msnv || blacklistTargetUser.MSNV || blacklistTargetUser.maDocGia || blacklistTargetUser.MaDocGia || blacklistTargetUser._id?.slice(-6).toUpperCase() }}</span>
                </div>
              </div>

              <div class="alert alert-warning small d-flex align-items-start gap-2 mb-3">
                <i class="bi bi-exclamation-triangle-fill fs-6 text-warning flex-shrink-0 mt-1"></i>
                <div>
                  Tài khoản này sẽ bị <strong>tạm khóa tính năng mượn sách</strong> trên toàn hệ thống cho đến khi được quản trị viên gỡ bỏ.
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-semibold">
                  Lý do đưa vào Blacklist <span class="text-danger">*</span>
                </label>
                <textarea
                  v-model="blacklistReason"
                  class="form-control"
                  rows="3"
                  required
                  placeholder="Nhập chi tiết lý do vi phạm hoặc chọn nhanh từ các gợi ý bên dưới..."
                ></textarea>
              </div>

              <!-- Gợi ý lý do nhanh -->
              <div>
                <label class="form-label small text-muted mb-1">Gợi ý lý do nhanh:</label>
                <div class="d-flex flex-wrap gap-2">
                  <button
                    type="button"
                    class="btn btn-outline-secondary btn-sm py-1 px-2"
                    style="font-size: 0.75rem;"
                    @click="setQuickBlacklistReason('Làm mất hoặc hư hỏng sách nhưng chưa thanh toán bồi thường')"
                  >
                    + Mất/hỏng sách chưa bồi thường
                  </button>
                  <button
                    type="button"
                    class="btn btn-outline-secondary btn-sm py-1 px-2"
                    style="font-size: 0.75rem;"
                    @click="setQuickBlacklistReason('Quá hạn mượn sách nhiều lần không hoàn trả')"
                  >
                    + Quá hạn mượn nhiều lần
                  </button>
                  <button
                    type="button"
                    class="btn btn-outline-secondary btn-sm py-1 px-2"
                    style="font-size: 0.75rem;"
                    @click="setQuickBlacklistReason('Vi phạm nghiêm trọng quy chế mượn trả & bảo quản ấn phẩm')"
                  >
                    + Vi phạm quy chế mượn trả
                  </button>
                </div>
              </div>
            </div>

            <div class="modal-footer bg-light">
              <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Hủy bỏ</button>
              <button type="submit" class="btn btn-danger btn-sm px-4 d-flex align-items-center gap-2" :disabled="isSubmittingBlacklist">
                <span v-if="isSubmittingBlacklist" class="spinner-border spinner-border-sm"></span>
                <i v-else class="bi bi-slash-circle"></i>
                <span>Xác Nhận Khóa Blacklist</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Thay Đổi Vai Trò / Phân Quyền -->
    <div class="modal fade" id="changeRoleModal" tabindex="-1" aria-hidden="true" ref="changeRoleModalRef">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title font-serif fs-6 d-flex align-items-center gap-2">
              <i class="bi bi-person-gear"></i>
              <span>Thay Đổi Phân Quyền Vai Trò</span>
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>

          <form @submit.prevent="submitChangeRole">
            <div class="modal-body p-4">
              <!-- Thông tin người dùng -->
              <div v-if="roleTargetUser" class="p-3 bg-light rounded-3 mb-3 border">
                <div class="fw-bold text-dark fs-6">
                  {{ roleTargetUser.hoTenNV || roleTargetUser.HoTenNV || roleTargetUser.hoTen || `${roleTargetUser.hoLot || roleTargetUser.HoLot || ''} ${roleTargetUser.ten || roleTargetUser.Ten || ''}`.trim() }}
                </div>
                <div class="small text-muted d-flex gap-3 mt-1 flex-wrap align-items-center">
                  <span><strong>Email:</strong> {{ roleTargetUser.email || roleTargetUser.Email }}</span>
                  <span><strong>Mã:</strong> {{ roleTargetUser.msnv || roleTargetUser.MSNV || roleTargetUser.maDocGia || roleTargetUser.MaDocGia || roleTargetUser._id?.slice(-6).toUpperCase() }}</span>
                  <span><strong>Vai trò hiện tại:</strong> 
                    <span class="badge ms-1" :class="(roleTargetUser.role || roleTargetUser.Role) === 'ADMIN' ? 'bg-danger' : (roleTargetUser.role || roleTargetUser.Role) === 'BOOK_MANAGER' ? 'bg-primary' : 'bg-secondary'">
                      {{ (roleTargetUser.role || roleTargetUser.Role) === 'ADMIN' ? 'Quản trị viên' : (roleTargetUser.role || roleTargetUser.Role) === 'BOOK_MANAGER' ? 'Thủ thư' : 'Bạn đọc' }}
                    </span>
                  </span>
                </div>
              </div>

              <!-- Lựa chọn vai trò mới -->
              <div class="mb-2">
                <label class="form-label small fw-semibold">Chọn vai trò / phân quyền mới <span class="text-danger">*</span></label>
                <div class="d-flex flex-column gap-2">
                  <label class="p-3 border rounded-3 cursor-pointer role-option" :class="{ 'border-primary bg-primary-subtle': selectedNewRole === 'USER' }">
                    <div class="form-check mb-0">
                      <input class="form-check-input" type="radio" name="selectedRole" value="USER" v-model="selectedNewRole" />
                      <div class="form-check-label ms-2">
                        <div class="fw-bold text-dark">Bạn Đọc / Độc Giả (USER)</div>
                        <div class="small text-muted">Quyền độc giả: tra cứu sách, gửi yêu cầu mượn sách trực tuyến và quản lý tài khoản cá nhân.</div>
                      </div>
                    </div>
                  </label>

                  <label class="p-3 border rounded-3 cursor-pointer role-option" :class="{ 'border-primary bg-primary-subtle': selectedNewRole === 'BOOK_MANAGER' }">
                    <div class="form-check mb-0">
                      <input class="form-check-input" type="radio" name="selectedRole" value="BOOK_MANAGER" v-model="selectedNewRole" />
                      <div class="form-check-label ms-2">
                        <div class="fw-bold text-dark">Thủ Thư / Quản Lý Sách (BOOK_MANAGER)</div>
                        <div class="small text-muted">Quyền thủ thư: quản lý kho sách, duyệt đơn mượn/trả sách, lập biên bản vi phạm & bồi thường.</div>
                      </div>
                    </div>
                  </label>

                  <label class="p-3 border rounded-3 cursor-pointer role-option" :class="{ 'border-primary bg-primary-subtle': selectedNewRole === 'ADMIN' }">
                    <div class="form-check mb-0">
                      <input class="form-check-input" type="radio" name="selectedRole" value="ADMIN" v-model="selectedNewRole" />
                      <div class="form-check-label ms-2">
                        <div class="fw-bold text-dark">Quản Trị Viên Tối Cao (ADMIN)</div>
                        <div class="small text-muted">Toàn quyền hệ thống: phân quyền nhân sự, quản lý độc giả, thống kê hệ thống và cài đặt.</div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div class="modal-footer bg-light">
              <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Hủy bỏ</button>
              <button type="submit" class="btn btn-primary btn-sm px-4 d-flex align-items-center gap-2" :disabled="isSubmittingRole || selectedNewRole === roleTargetUser?.Role">
                <span v-if="isSubmittingRole" class="spinner-border spinner-border-sm"></span>
                <i v-else class="bi bi-check2-circle"></i>
                <span>Lưu Thay Đổi</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAdminUserStore } from '../stores/adminUserStore';
import { useAdminAuthStore } from '../stores/adminAuthStore';
import { useToast } from '../composables/useToast';
import { useConfirm } from '../composables/useConfirm';
import UserDetailModal from '../components/UserDetailModal.vue';

const route = useRoute();
const userStore = useAdminUserStore();
const authStore = useAdminAuthStore();
const toast = useToast();
const { confirm } = useConfirm();

const userDetailModalRef = ref(null);
const highlightedUserId = ref(null);

const filterNumeric = (event) => {
  if (!/[0-9]/.test(event.key)) {
    event.preventDefault();
  }
};

const currentTab = ref('READERS');
const createStaffModalRef = ref(null);
const editStaffModalRef = ref(null);
const editStaffTarget = ref(null);
const isSubmittingEditStaff = ref(false);

const staffForm = reactive({
  hoTenNV: '',
  email: '',
  soDienThoai: '',
  diaChi: '',
  role: 'BOOK_MANAGER',
  password: ''
});

const editStaffForm = reactive({
  hoTenNV: '',
  email: '',
  soDienThoai: '',
  diaChi: '',
  role: 'BOOK_MANAGER',
  password: ''
});

const displayedUsers = computed(() => {
  if (currentTab.value === 'READERS') return userStore.readers;
  if (currentTab.value === 'STAFFS') return userStore.staffs;
  return userStore.blacklistedUsers;
});

const isEditStaffFormDirty = computed(() => {
  if (!editStaffTarget.value) return false;
  const initialHoTen = editStaffTarget.value.hoTenNV || editStaffTarget.value.HoTenNV || editStaffTarget.value.hoTen || '';
  const initialEmail = editStaffTarget.value.email || editStaffTarget.value.Email || '';
  const initialSoDienThoai = editStaffTarget.value.soDienThoai || editStaffTarget.value.SoDienThoai || editStaffTarget.value.dienThoai || '';
  const initialDiaChi = editStaffTarget.value.diaChi || editStaffTarget.value.DiaChi || '';
  const initialRole = editStaffTarget.value.role || editStaffTarget.value.Role || editStaffTarget.value.chucVu || 'BOOK_MANAGER';

  const isChanged =
    editStaffForm.hoTenNV.trim() !== initialHoTen.trim() ||
    editStaffForm.email.trim().toLowerCase() !== initialEmail.trim().toLowerCase() ||
    editStaffForm.soDienThoai.trim() !== initialSoDienThoai.trim() ||
    editStaffForm.diaChi.trim() !== initialDiaChi.trim() ||
    editStaffForm.role !== initialRole ||
    Boolean(editStaffForm.password && editStaffForm.password.trim().length > 0);

  return isChanged;
});

// Role change modal state
const changeRoleModalRef = ref(null);
const roleTargetUser = ref(null);
const selectedNewRole = ref('USER');
const isSubmittingRole = ref(false);

// Blacklist modal state
const blacklistModalRef = ref(null);
const blacklistTargetUser = ref(null);
const blacklistReason = ref('');
const isSubmittingBlacklist = ref(false);

const setQuickBlacklistReason = (reason) => {
  blacklistReason.value = reason;
};

const currentAdminId = computed(() => authStore.adminUser?._id);

const openCreateStaffModal = () => {
  staffForm.hoTenNV = '';
  staffForm.email = '';
  staffForm.soDienThoai = '';
  staffForm.diaChi = '';
  staffForm.role = 'BOOK_MANAGER';
  staffForm.password = '';
  const modal = new window.bootstrap.Modal(createStaffModalRef.value);
  modal.show();
};

const submitCreateStaff = async () => {
  const payload = {
    hoTenNV: staffForm.hoTenNV,
    HoTenNV: staffForm.hoTenNV,
    email: staffForm.email,
    Email: staffForm.email,
    soDienThoai: staffForm.soDienThoai,
    SoDienThoai: staffForm.soDienThoai,
    diaChi: staffForm.diaChi,
    DiaChi: staffForm.diaChi,
    role: staffForm.role,
    Role: staffForm.role,
    password: staffForm.password,
    Password: staffForm.password
  };

  const res = await userStore.createStaff(payload);
  if (res.success) {
    const modal = window.bootstrap.Modal.getInstance(createStaffModalRef.value);
    if (modal) modal.hide();
    toast.success(res.message);
  } else {
    toast.error(res.error);
  }
};

const openEditStaff = (user) => {
  editStaffTarget.value = user;
  editStaffForm.hoTenNV = user.hoTenNV || user.HoTenNV || user.hoTen || '';
  editStaffForm.email = user.email || user.Email || '';
  editStaffForm.soDienThoai = user.soDienThoai || user.SoDienThoai || user.dienThoai || '';
  editStaffForm.diaChi = user.diaChi || user.DiaChi || '';
  editStaffForm.role = user.role || user.Role || user.chucVu || 'BOOK_MANAGER';
  editStaffForm.password = '';

  if (editStaffModalRef.value && window.bootstrap) {
    const modal = window.bootstrap.Modal.getOrCreateInstance(editStaffModalRef.value);
    modal.show();
  }
};

const submitEditStaff = async () => {
  if (!editStaffTarget.value) return;
  isSubmittingEditStaff.value = true;
  try {
    const payload = {
      hoTenNV: editStaffForm.hoTenNV,
      HoTenNV: editStaffForm.hoTenNV,
      email: editStaffForm.email,
      Email: editStaffForm.email,
      soDienThoai: editStaffForm.soDienThoai,
      SoDienThoai: editStaffForm.soDienThoai,
      diaChi: editStaffForm.diaChi,
      DiaChi: editStaffForm.diaChi,
      role: editStaffForm.role,
      Role: editStaffForm.role
    };
    if (editStaffForm.password && editStaffForm.password.trim()) {
      payload.password = editStaffForm.password;
    }

    const res = await userStore.updateStaff(editStaffTarget.value._id, payload);
    if (res.success) {
      if (editStaffModalRef.value && window.bootstrap) {
        const modal = window.bootstrap.Modal.getInstance(editStaffModalRef.value);
        if (modal) modal.hide();
      }
      toast.success(res.message);
    } else {
      toast.error(res.error);
    }
  } finally {
    isSubmittingEditStaff.value = false;
  }
};

const openChangeRole = (user) => {
  roleTargetUser.value = user;
  selectedNewRole.value = user.role || user.Role || 'USER';
  if (changeRoleModalRef.value && window.bootstrap) {
    const modal = window.bootstrap.Modal.getOrCreateInstance(changeRoleModalRef.value);
    modal.show();
  }
};

const submitChangeRole = async () => {
  if (!roleTargetUser.value) return;
  const currentRole = roleTargetUser.value.role || roleTargetUser.value.Role;
  if (selectedNewRole.value === currentRole) {
    toast.error('Vui lòng chọn vai trò khác với vai trò hiện tại.');
    return;
  }

  isSubmittingRole.value = true;
  try {
    const res = await userStore.updateRole(roleTargetUser.value._id, selectedNewRole.value);
    if (res.success) {
      if (changeRoleModalRef.value && window.bootstrap) {
        const modal = window.bootstrap.Modal.getInstance(changeRoleModalRef.value);
        if (modal) modal.hide();
      }
      toast.success(res.message);
    } else {
      toast.error(res.error);
    }
  } finally {
    isSubmittingRole.value = false;
  }
};

const openBlacklistModal = (user) => {
  blacklistTargetUser.value = user;
  blacklistReason.value = '';
  if (blacklistModalRef.value && window.bootstrap) {
    const modal = window.bootstrap.Modal.getOrCreateInstance(blacklistModalRef.value);
    modal.show();
  }
};

const submitBlacklist = async () => {
  if (!blacklistTargetUser.value) return;
  const reason = blacklistReason.value.trim();
  if (!reason) {
    toast.error('Vui lòng nhập lý do đưa tài khoản vào danh sách vi phạm.');
    return;
  }

  isSubmittingBlacklist.value = true;
  try {
    const res = await userStore.toggleBlacklist(blacklistTargetUser.value._id, {
      isBlacklisted: true,
      reason
    });
    if (res.success) {
      if (blacklistModalRef.value && window.bootstrap) {
        const modal = window.bootstrap.Modal.getInstance(blacklistModalRef.value);
        if (modal) modal.hide();
      }
      toast.success(res.message);
    } else {
      toast.error(res.error);
    }
  } finally {
    isSubmittingBlacklist.value = false;
  }
};

const handleToggleBlacklist = async (user, isBlacklisted) => {
  if (isBlacklisted) {
    openBlacklistModal(user);
  } else {
    const userName = user.hoTenNV || user.HoTenNV || user.hoTen || `${user.hoLot || user.HoLot || ''} ${user.ten || user.Ten || ''}`.trim() || user.email || user.Email;
    const isConfirmed = await confirm({
      title: 'Gỡ khỏi danh sách vi phạm',
      message: `Xác nhận gỡ tài khoản "${userName}" (${user.email || user.Email}) khỏi danh sách vi phạm Blacklist và khôi phục quyền mượn sách?`,
      confirmText: 'Xác nhận gỡ vi phạm',
      cancelText: 'Hủy bỏ',
      type: 'success',
      icon: 'bi-shield-check'
    });
    if (!isConfirmed) return;

    const res = await userStore.toggleBlacklist(user._id, { isBlacklisted: false });
    if (res.success) toast.success(res.message);
    else toast.error(res.error);
  }
};

const handleRouteQuery = async () => {
  const query = route.query;
  if (query.tab) {
    currentTab.value = String(query.tab);
  } else if (query.role) {
    if (query.role === 'USER') currentTab.value = 'READERS';
    else if (query.role === 'BOOK_MANAGER' || query.role === 'ADMIN') currentTab.value = 'STAFFS';
  }

  await userStore.fetchUsers();

  const targetHighlight = query.highlight || query.userId;
  if (targetHighlight) {
    highlightedUserId.value = targetHighlight;

    await nextTick();
    const el = document.getElementById('user-row-' + targetHighlight);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    setTimeout(() => {
      highlightedUserId.value = null;
    }, 4500);
  }
};

watch(
  () => route.query,
  () => {
    handleRouteQuery();
  }
);

onMounted(async () => {
  await handleRouteQuery();
});
</script>

<style scoped>
.custom-admin-pills .nav-link {
  color: var(--admin-text-main);
  background-color: var(--admin-surface);
  border: 1px solid var(--admin-border);
  font-weight: 500;
  border-radius: var(--radius-sm);
  padding: 0.55rem 1.15rem;
  transition: all 0.2s ease;
}

.custom-admin-pills .nav-link.active {
  background-color: var(--admin-primary);
  border-color: var(--admin-primary);
  color: #fff;
}

.role-clickable,
.cursor-pointer {
  cursor: pointer;
}
.role-option {
  transition: all 0.2s ease;
}
.role-option:hover {
  background-color: var(--admin-hover, rgba(0, 0, 0, 0.02));
}
.hover-underline:hover {
  text-decoration: underline !important;
}

@keyframes pulse-user-highlight {
  0% {
    background-color: rgba(255, 193, 7, 0.25);
  }
  50% {
    background-color: rgba(255, 193, 7, 0.65);
  }
  100% {
    background-color: rgba(255, 193, 7, 0.3);
  }
}

.highlighted-row {
  animation: pulse-user-highlight 1.2s ease-in-out infinite alternate;
  box-shadow: 0 0 0 2px var(--admin-primary) !important;
  transition: all 0.3s ease;
}
</style>
