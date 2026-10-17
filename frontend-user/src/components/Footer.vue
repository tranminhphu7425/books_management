<template>
  <footer class="footer-custom mt-auto">
    <div class="container py-5">
      <div class="row g-4">
        <!-- Cột 1: Giới thiệu Thư viện -->
        <div class="col-lg-4 col-md-6">
          <div class="d-flex align-items-center gap-2 mb-3">
            <div class="footer-logo-icon">
              <i class="bi bi-book-half"></i>
            </div>
            <span class="footer-brand-title">THƯ VIỆN TRI THỨC</span>
          </div>
          <p class="text-white-50 small mb-3">
            Không gian lan tỏa văn hóa đọc, nghiên cứu học thuật và tiếp cận nguồn tri thức phong phú, đa dạng cho cộng đồng bạn đọc và học sinh - sinh viên.
          </p>
          <div class="text-white-50 small">
            <div class="mb-1"><i class="bi bi-geo-alt-fill text-warning me-2"></i>Trung tâm học liệu, Đại học Cần Thơ</div>
            <div class="mb-1"><i class="bi bi-telephone-fill text-warning me-2"></i>Hotline hỗ trợ: 0834013968</div>
            <div><i class="bi bi-envelope-fill text-warning me-2"></i>Email liên hệ: thuvientrithuc@edu.vn</div>
          </div>
        </div>

        <!-- Cột 2: Thời gian phục vụ -->
        <div class="col-lg-4 col-md-6">
          <h6 class="footer-section-title mb-3">Thời Gian Phục Vụ & Mượn Sách</h6>
          <ul class="list-unstyled text-white-50 small mb-0">
            <li class="d-flex justify-content-between py-1 border-bottom border-secondary border-opacity-25">
              <span>Thứ Hai - Thứ Sáu:</span>
              <strong class="text-white">08:00 - 21:00</strong>
            </li>
            <li class="d-flex justify-content-between py-1 border-bottom border-secondary border-opacity-25">
              <span>Thứ Bảy & Chủ Nhật:</span>
              <strong class="text-white">08:00 - 17:00</strong>
            </li>
            <li class="d-flex justify-content-between py-1">
              <span>Ngày Lễ, Tết:</span>
              <span class="text-warning">Nghỉ theo quy định nhà nước</span>
            </li>
          </ul>
          <div class="mt-3 p-2 rounded bg-black bg-opacity-25 text-white-50 small">
            <i class="bi bi-info-circle text-info me-1"></i>
            Hệ thống hỗ trợ đặt mượn trực tuyến 24/7. Bạn đọc có 48 giờ để đến quầy nhận sách kể từ khi yêu cầu được duyệt.
          </div>
        </div>

        <!-- Cột 3: Quy định mượn trả -->
        <div class="col-lg-4 col-md-12">
          <h6 class="footer-section-title mb-3">Nội Quy Mượn Sách Tóm Tắt</h6>
          <ul class="list-unstyled text-white-50 small mb-3">
            <li class="mb-2 d-flex align-items-start gap-2">
              <i class="bi bi-check-circle-fill text-success mt-1"></i>
              <span>Mỗi bạn đọc được mượn tối đa <strong>03 cuốn sách</strong> cùng một thời điểm.</span>
            </li>
            <li class="mb-2 d-flex align-items-start gap-2">
              <i class="bi bi-check-circle-fill text-success mt-1"></i>
              <span>Thời hạn mượn tiêu chuẩn là <strong>14 ngày</strong> và được quyền gia hạn thêm 01 lần (+07 ngày).</span>
            </li>
            <li class="mb-2 d-flex align-items-start gap-2">
              <i class="bi bi-exclamation-triangle-fill text-warning mt-1"></i>
              <span>Ấn phẩm quá hạn hoặc thất lạc sẽ bị tính phí bồi thường theo đúng đơn giá niêm yết của cuốn sách.</span>
            </li>
          </ul>
        </div>
      </div>

      <hr class="border-secondary border-opacity-25 my-4" />

      <!-- Bản quyền -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-center text-white-50 small">
        <div>
          © 2026 Thư viện Tri thức. Bản quyền thuộc về Hệ thống Quản lý Thư viện Số.
        </div>
        <div class="d-flex gap-3 mt-2 mt-md-0">
          <span>Chuẩn mực - Hiện đại - Thân thiện</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer-custom {
  background-color: #0d281e !important;
  color: #f8f9fa !important;
  border-top: 4px solid var(--color-accent);
}

.footer-logo-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background-color: var(--color-accent);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.footer-brand-title {
  font-family: var(--font-serif);
  font-weight: 700;
  font-size: 1.1rem;
  letter-spacing: 0.5px;
  color: #fff !important;
}

.footer-section-title {
  font-family: var(--font-serif);
  color: #fff !important;
  font-size: 0.95rem;
  position: relative;
  padding-bottom: 0.5rem;
}

.footer-section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 30px;
  height: 2px;
  background-color: var(--color-accent);
}

.text-white-50 {
  color: rgba(255, 255, 255, 0.75) !important;
}
</style>
