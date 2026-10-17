<template>
  <div class="dashboard-view">
    <!-- Tiêu đề & Nút xuất báo cáo -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
      <div>
        <h3 class="font-serif fw-bold text-dark mb-1">Tổng Quan Hoạt Động Thư Viện</h3>
        <p class="text-muted small mb-0">
          Số liệu thống kê thời gian thực về tình trạng kho sách, lượt mượn trả và cảnh báo quá hạn.
        </p>
      </div>

      <div class="d-flex flex-wrap gap-2" v-if="authStore.isAdmin">
        <button class="btn btn-outline-success btn-sm px-3 shadow-sm" @click="handleExportBorrows" :disabled="isExporting">
          <i class="bi bi-file-earmark-spreadsheet me-1"></i> Xuất Báo Cáo Mượn Trả (CSV)
        </button>
        <button class="btn btn-outline-danger btn-sm px-3 shadow-sm" @click="handleExportFines" :disabled="isExporting">
          <i class="bi bi-file-earmark-excel me-1"></i> Xuất Báo Cáo Bồi Thường (CSV)
        </button>
      </div>
    </div>

    <!-- 4 KPI Thẻ Thống Kê Đầu Trang -->
    <div class="row g-3 mb-4">
      <div class="col-xl-3 col-sm-6">
        <div class="kpi-card">
          <div>
            <div class="text-muted small fw-medium mb-1">Tổng Đầu Sách Trong Kho</div>
            <div class="kpi-number text-primary">{{ statsStore.summary.totalBooks || 0 }}</div>
            <div class="small text-muted mt-1">Đầu mục ấn phẩm</div>
          </div>
          <div class="kpi-icon-wrap bg-primary bg-opacity-10 text-primary">
            <i class="bi bi-bookshelf"></i>
          </div>
        </div>
      </div>

      <div class="col-xl-3 col-sm-6">
        <div class="kpi-card">
          <div>
            <div class="text-muted small fw-medium mb-1">Độc Giả Đang Hoạt Động</div>
            <div class="kpi-number text-success">{{ statsStore.summary.activeReaders || 0 }}</div>
            <div class="small text-muted mt-1">Tài khoản bạn đọc hợp lệ</div>
          </div>
          <div class="kpi-icon-wrap bg-success bg-opacity-10 text-success">
            <i class="bi bi-person-check-fill"></i>
          </div>
        </div>
      </div>

      <div class="col-xl-3 col-sm-6">
        <div class="kpi-card">
          <div>
            <div class="text-muted small fw-medium mb-1">Sách Đang Lưu Hành</div>
            <div class="kpi-number text-warning">{{ statsStore.summary.currentlyBorrowed || 0 }}</div>
            <div class="small text-muted mt-1">Cuốn đang được mượn về</div>
          </div>
          <div class="kpi-icon-wrap bg-warning bg-opacity-10 text-warning">
            <i class="bi bi-journal-arrow-up"></i>
          </div>
        </div>
      </div>

      <div class="col-xl-3 col-sm-6">
        <div class="kpi-card">
          <div>
            <div class="text-muted small fw-medium mb-1">Sách Quá Hạn Cần Thu Hồi</div>
            <div class="kpi-number text-danger">{{ statsStore.summary.overdueBooks || 0 }}</div>
            <div class="small text-danger mt-1">
              <i class="bi bi-exclamation-triangle-fill me-1"></i> Cần nhắc nhở bạn đọc
            </div>
          </div>
          <div class="kpi-icon-wrap bg-danger bg-opacity-10 text-danger">
            <i class="bi bi-alarm-fill"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Biểu đồ phân tích (Doughnut & Bar) -->
    <div class="row g-4 mb-4">
      <div class="col-lg-6">
        <div class="card border-0 shadow-sm p-4 bg-white h-100">
          <h6 class="font-serif fw-bold text-dark mb-3">
            <i class="bi bi-pie-chart-fill text-primary me-2"></i> Cơ Cấu Ấn Phẩm Theo Thể Loại
          </h6>
          <div style="height: 280px; position: relative;">
            <Doughnut v-if="genreChartData.labels.length" :data="genreChartData" :options="chartOptions" />
            <div v-else class="h-100 d-flex align-items-center justify-content-center text-muted small">
              Đang tổng hợp dữ liệu thể loại...
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-6">
        <div class="card border-0 shadow-sm p-4 bg-white h-100">
          <h6 class="font-serif fw-bold text-dark mb-3">
            <i class="bi bi-bar-chart-fill text-success me-2"></i> Lượt Mượn Sách Theo Thời Gian
          </h6>
          <div style="height: 280px; position: relative;">
            <Bar v-if="borrowTrendData.labels.length" :data="borrowTrendData" :options="chartOptions" />
            <div v-else class="h-100 d-flex align-items-center justify-content-center text-muted small">
              Đang tổng hợp xu hướng mượn sách...
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bảng Top 10 Sách Mượn Nhiều Nhất -->
    <div class="card border-0 shadow-sm bg-white overflow-hidden">
      <div class="p-3 border-bottom d-flex justify-content-between align-items-center">
        <h6 class="font-serif fw-bold text-dark mb-0">
          <i class="bi bi-trophy-fill text-warning me-2"></i> Top 10 Ấn Phẩm Được Mượn Nhiều Nhất
        </h6>
        <router-link to="/books" class="btn btn-sm btn-outline-primary py-0">
          Xem toàn bộ kho sách
        </router-link>
      </div>

      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0 small">
          <thead class="table-light">
            <tr>
              <th style="width: 50px;">Hạng</th>
              <th>Ấn phẩm</th>
              <th>Tác giả</th>
              <th>Thể loại</th>
              <th>Đơn giá</th>
              <th class="text-center">Số lượt mượn</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="statsStore.topBooks.length === 0">
              <td colspan="6" class="text-center py-4 text-muted">
                Chưa có dữ liệu thống kê mượn sách.
              </td>
            </tr>
            <tr v-for="(book, index) in statsStore.topBooks" :key="book._id">
              <td class="fw-bold">
                <span
                  class="badge rounded-circle p-2"
                  :class="{
                    'bg-warning text-dark': index === 0,
                    'bg-secondary text-white': index === 1,
                    'bg-dark text-white': index === 2,
                    'bg-light text-dark border': index > 2
                  }"
                  style="width: 26px; height: 26px; display: inline-flex; align-items: center; justify-content: center;"
                >
                  {{ index + 1 }}
                </span>
              </td>
              <td>
                <div
                  class="fw-bold text-dark role-clickable hover-underline"
                  @click="bookDetailModalRef?.open(book._id || book.MaSach)"
                  title="Nhấn để xem chi tiết ấn phẩm"
                >
                  {{ book.TenSach }}
                </div>
                <div class="text-muted" style="font-size: 0.75rem;">
                  Mã:
                  <code
                    class="role-clickable text-primary"
                    @click="bookDetailModalRef?.open(book._id || book.MaSach)"
                  >{{ book.MaSach }}</code>
                </div>
              </td>
              <td>{{ book.TacGia || book.NguonGoc || 'N/A' }}</td>
              <td><span class="badge bg-light text-dark border">{{ book.TheLoai }}</span></td>
              <td class="fw-semibold">{{ formatCurrency(book.DonGia) }}</td>
              <td class="text-center">
                <span class="badge bg-success px-3 py-1">{{ book.LuotMuon || 0 }} lượt</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Chi Tiết Ấn Phẩm -->
    <BookDetailModal ref="bookDetailModalRef" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAdminAuthStore } from '../stores/adminAuthStore';
import { useAdminStatsStore } from '../stores/adminStatsStore';
import { useToast } from '../composables/useToast';
import BookDetailModal from '../components/BookDetailModal.vue';

const bookDetailModalRef = ref(null);

// Chart.js imports
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement
} from 'chart.js';
import { Doughnut, Bar } from 'vue-chartjs';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement);

const authStore = useAdminAuthStore();
const statsStore = useAdminStatsStore();
const toast = useToast();
const isExporting = ref(false);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { font: { family: 'Inter', size: 12 } }
    }
  }
};

const genreChartData = computed(() => {
  const stats = statsStore.summary.genreStats || [];
  return {
    labels: stats.map((s) => s.name || s._id || 'Khác'),
    datasets: [
      {
        data: stats.map((s) => s.count || 0),
        backgroundColor: [
          '#1B4332',
          '#2D6A4F',
          '#52B788',
          '#74C69D',
          '#95D5B2',
          '#D4A373',
          '#B07D50',
          '#6B4226',
          '#8B5A2B',
          '#A67C52'
        ]
      }
    ]
  };
});

const borrowTrendData = computed(() => {
  const trend = statsStore.summary.borrowTrend || [];
  return {
    labels: trend.map((t) => t.date || t._id || ''),
    datasets: [
      {
        label: 'Số lượt mượn sách',
        backgroundColor: '#1B4332',
        borderRadius: 6,
        data: trend.map((t) => t.count || 0)
      }
    ]
  };
});

const formatCurrency = (val) => {
  if (!val) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
};

const handleExportBorrows = async () => {
  isExporting.value = true;
  const res = await statsStore.exportBorrowsCSV();
  if (res.success) toast.success('Xuất báo cáo mượn trả thành công!');
  else toast.error(res.error);
  isExporting.value = false;
};

const handleExportFines = async () => {
  isExporting.value = true;
  const res = await statsStore.exportFinesCSV();
  if (res.success) toast.success('Xuất báo cáo biên bản thành công!');
  else toast.error(res.error);
  isExporting.value = false;
};

onMounted(() => {
  statsStore.fetchSummary();
  statsStore.fetchTopBooks();
});
</script>

<style scoped>
.role-clickable {
  cursor: pointer;
  transition: color 0.15s ease;
}
.hover-underline:hover {
  text-decoration: underline !important;
}
</style>
