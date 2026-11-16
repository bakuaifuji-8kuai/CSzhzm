<!--
  智光云枢 · 车辆管理 · 车辆调度
  出车申请 → 派车 → 执行 → 还车 全流程
-->
<template>
  <section class="zg-vh-schedule">
    <header class="zg-vh-schedule__head">
      <div class="zg-vh-schedule__headline">
        <div class="zg-vh-schedule__sigil"><el-icon :size="22"><Calendar /></el-icon></div>
        <div class="zg-vh-schedule__copy">
          <h1 class="zg-vh-schedule__title">车辆调度</h1>
          <p class="zg-vh-schedule__sub">
            今日出车 {{ todayAgg.total }} 单 · 待派车 {{ todayAgg.pending }} ·
            执行中 {{ todayAgg.running }} · 已归还 {{ todayAgg.returned }}
          </p>
        </div>
      </div>
      <div class="zg-vh-schedule__cta">
        <el-button type="primary"><el-icon><Plus /></el-icon>发起出车申请</el-button>
        <el-button plain><el-icon><Document /></el-icon>调度日报</el-button>
      </div>
    </header>

    <!-- 今日出车看板 -->
    <div class="zg-vh-schedule__board">
      <div v-for="cell in boardCells" :key="cell.key" class="zg-board-cell" :class="cell.theme">
        <div class="zg-board-cell__icon"><el-icon :size="22"><component :is="cell.icon" /></el-icon></div>
        <div class="zg-board-cell__body">
          <span class="zg-board-cell__num">{{ cell.value }}</span>
          <span class="zg-board-cell__lbl">{{ cell.label }}</span>
        </div>
        <el-icon class="zg-board-cell__arrow"><ArrowRight /></el-icon>
      </div>
    </div>

    <!-- 主体卡 -->
    <div class="zg-vh-schedule__main">
      <!-- 筛选条 -->
      <div class="zg-vh-schedule__filterbar">
        <div class="zg-filter-row">
          <div class="zg-filter-item">
            <span class="zg-filter-item__lbl">日期</span>
            <el-date-picker v-model="filters.date" type="daterange" range-separator="至"
              start-placeholder="开始" end-placeholder="结束" class="zg-filter-date" />
          </div>
          <div class="zg-filter-item">
            <span class="zg-filter-item__lbl">部门</span>
            <el-select v-model="filters.dept" placeholder="全部" clearable class="zg-filter-select">
              <el-option v-for="d in deptOptions" :key="d" :label="d" :value="d" />
            </el-select>
          </div>
          <div class="zg-filter-item">
            <span class="zg-filter-item__lbl">司机</span>
            <el-select v-model="filters.driver" placeholder="全部" clearable class="zg-filter-select">
              <el-option v-for="d in driverOptions" :key="d" :label="d" :value="d" />
            </el-select>
          </div>
          <div class="zg-filter-item">
            <span class="zg-filter-item__lbl">状态</span>
            <el-select v-model="filters.status" placeholder="全部" clearable class="zg-filter-select">
              <el-option v-for="s in statusOptions" :key="s.key" :label="s.label" :value="s.key" />
            </el-select>
          </div>
          <div class="zg-filter-item zg-filter-item--actions">
            <el-button type="primary" @click="onApply"><el-icon><Filter /></el-icon>筛选</el-button>
            <el-button @click="onReset"><el-icon><Refresh /></el-icon>重置</el-button>
          </div>
        </div>
      </div>

      <!-- 表格 -->
      <div class="zg-vh-schedule__tablewrap">
        <el-table :data="filteredList" stripe height="520">
          <el-table-column prop="applyNo" label="申请单号" width="170" fixed="left">
            <template #default="{ row }">
              <span class="zg-mono zg-apply-no">{{ row.applyNo }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="plate" label="车牌号" width="110">
            <template #default="{ row }">
              <span class="zg-plate zg-plate--sm">{{ row.plate }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="driver" label="司机" width="100" />
          <el-table-column prop="applicant" label="申请人" width="100" />
          <el-table-column prop="dept" label="部门" width="150" />
          <el-table-column prop="startTime" label="出车时间" width="160">
            <template #default="{ row }">
              <div class="zg-time-cell">
                <el-icon><Clock /></el-icon>
                <span>{{ row.startTime }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="endTime" label="归还时间" width="160">
            <template #default="{ row }">
              <div class="zg-time-cell">
                <el-icon><CircleCheck v-if="row.statusKey === 'returned'" /><Clock v-else /></el-icon>
                <span>{{ row.endTime || '—' }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="destination" label="目的地 / 任务" width="200" show-overflow-tooltip />
          <el-table-column label="里程" width="110" align="right">
            <template #default="{ row }">
              <span class="zg-mileage">
                <el-icon><Odometer /></el-icon>
                {{ row.mileage ? row.mileage + ' km' : '—' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="statusKey" label="状态" width="110" align="center">
            <template #default="{ row }">
              <span class="zg-status-pill" :class="'zg-status-pill--' + row.statusKey">
                <i class="dot"></i>{{ row.statusLabel }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="240" align="center" fixed="right">
            <template #default="{ row }">
              <el-button v-if="row.statusKey === 'pending'" type="primary" link size="small" @click="onDispatch(row)">派车</el-button>
              <el-button v-if="row.statusKey === 'dispatched'" type="primary" link size="small" @click="onDepart(row)">出车登记</el-button>
              <el-button v-if="row.statusKey === 'running'" type="success" link size="small" @click="onReturn(row)">还车登记</el-button>
              <el-button v-if="row.statusKey === 'pending' || row.statusKey === 'dispatched'" link size="small" @click="onCancel(row)">取消</el-button>
              <el-button link size="small">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="zg-vh-schedule__pager">
        <el-pagination v-model:current-page="pager.page" v-model:page-size="pager.size"
          :total="filteredList.length" :page-sizes="[10, 20, 50]"
          layout="prev, pager, next, jumper, ->, sizes, total" background />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Calendar, Plus, Document, Filter, Refresh, Clock, CircleCheck, Odometer, ArrowRight, Warning, Promotion, CircleCloseFilled } from '@element-plus/icons-vue'

interface ScheduleRow {
  id: number
  applyNo: string
  plate: string
  driver: string
  applicant: string
  dept: string
  startTime: string
  endTime: string | null
  destination: string
  mileage: number | null
  statusKey: 'pending' | 'dispatched' | 'running' | 'returned' | 'cancelled'
  statusLabel: string
  applyDate: string
}

// ============================================================
// Mock 数据：8 条，覆盖全流程
// ============================================================
const MOCK_LIST: ScheduleRow[] = [
  { id: 1, applyNo: 'SCH-20261116-001', plate: '湘A·12345', driver: '张建国', applicant: '李工', dept: '运维部一分队', startTime: '2026-11-16 08:30', endTime: null, destination: '麓谷大道 路灯故障巡检', mileage: null, statusKey: 'pending', statusLabel: '待派车', applyDate: '2026-11-16' },
  { id: 2, applyNo: 'SCH-20261116-002', plate: '湘A·88901', driver: '李志强', applicant: '王工', dept: '运维部一分队', startTime: '2026-11-16 09:00', endTime: null, destination: '先导路 箱变抢修', mileage: null, statusKey: 'dispatched', statusLabel: '已派车', applyDate: '2026-11-16' },
  { id: 3, applyNo: 'SCH-20261116-003', plate: '湘A·77108', driver: '赵立军', applicant: '钱主管', dept: '运维部二分队', startTime: '2026-11-16 07:30', endTime: null, destination: '岳麓大道 工程作业物资运输', mileage: 48, statusKey: 'running', statusLabel: '执行中', applyDate: '2026-11-16' },
  { id: 4, applyNo: 'SCH-20261116-004', plate: '湘A·55219', driver: '陈晓东', applicant: '孙工', dept: '运维部三分队', startTime: '2026-11-16 06:30', endTime: '2026-11-16 10:15', destination: '梅溪湖 夜间照度复测', mileage: 62, statusKey: 'returned', statusLabel: '已归还', applyDate: '2026-11-16' },
  { id: 5, applyNo: 'SCH-20261116-005', plate: '湘A·22667', driver: '吴大为', applicant: '周经理', dept: '运维经理直属', startTime: '2026-11-16 14:00', endTime: null, destination: '市政府 接待用车', mileage: null, statusKey: 'pending', statusLabel: '待派车', applyDate: '2026-11-16' },
  { id: 6, applyNo: 'SCH-20261115-006', plate: '湘A·99887', driver: '周晓明', applicant: '郑总监', dept: '运维经理直属', startTime: '2026-11-15 13:30', endTime: '2026-11-15 18:20', destination: '长沙县 项目现场调研', mileage: 156, statusKey: 'returned', statusLabel: '已归还', applyDate: '2026-11-15' },
  { id: 7, applyNo: 'SCH-20261115-007', plate: '湘A·66023', driver: '王海涛', applicant: '冯工', dept: '运维部二分队', startTime: '2026-11-15 08:00', endTime: null, destination: '星沙开发区 路灯安装', mileage: null, statusKey: 'dispatched', statusLabel: '已派车', applyDate: '2026-11-15' },
  { id: 8, applyNo: 'SCH-20261114-008', plate: '湘A·33445', driver: '刘建军', applicant: '陈主管', dept: '运维部三分队', startTime: '2026-11-14 10:00', endTime: null, destination: '消防培训 临时调整', mileage: null, statusKey: 'cancelled', statusLabel: '已取消', applyDate: '2026-11-14' },
]

// ============================================================
// 配置项
// ============================================================
const deptOptions = ['运维部一分队', '运维部二分队', '运维部三分队', '运维经理直属']
const driverOptions = computed(() => Array.from(new Set(MOCK_LIST.map(v => v.driver))))
const statusOptions = [
  { key: 'pending',     label: '待派车' },
  { key: 'dispatched',  label: '已派车' },
  { key: 'running',     label: '执行中' },
  { key: 'returned',    label: '已归还' },
  { key: 'cancelled',   label: '已取消' },
]

// ============================================================
// 状态
// ============================================================
const filters = reactive({ date: [] as any[], dept: '', driver: '', status: '' })
const pager = reactive({ page: 1, size: 10 })

const filteredList = computed(() => {
  let list = MOCK_LIST.slice()
  if (filters.dept) list = list.filter(v => v.dept === filters.dept)
  if (filters.driver) list = list.filter(v => v.driver === filters.driver)
  if (filters.status) list = list.filter(v => v.statusKey === filters.status)
  if (filters.date && filters.date.length === 2) {
    const [start, end] = filters.date
    const startStr = start.toISOString().slice(0, 10)
    const endStr = end.toISOString().slice(0, 10)
    list = list.filter(v => v.applyDate >= startStr && v.applyDate <= endStr)
  }
  const start = (pager.page - 1) * pager.size
  return list.slice(start, start + pager.size)
})

// ============================================================
// 今日看板
// ============================================================
const today = '2026-11-16'
const todayRows = computed(() => MOCK_LIST.filter(v => v.applyDate === today))
const todayAgg = computed(() => ({
  total: todayRows.value.filter(v => v.statusKey !== 'cancelled').length,
  pending: todayRows.value.filter(v => v.statusKey === 'pending').length,
  dispatched: todayRows.value.filter(v => v.statusKey === 'dispatched').length,
  running: todayRows.value.filter(v => v.statusKey === 'running').length,
  returned: todayRows.value.filter(v => v.statusKey === 'returned').length,
}))
const boardCells = computed(() => [
  { key: 'pending',    label: '待派车',   value: todayAgg.value.pending,    icon: Warning,      theme: 'warn' },
  { key: 'dispatched',label: '已派车',   value: todayAgg.value.dispatched,  icon: Truck,          theme: 'info' },
  { key: 'running',    label: '执行中',   value: todayAgg.value.running,    icon: Promotion,    theme: 'primary' },
  { key: 'returned',   label: '已归还',   value: todayAgg.value.returned,   icon: CircleCloseFilled, theme: 'success' },
])

// ============================================================
// 动作
// ============================================================
function onApply() { pager.page = 1; ElMessage.success('筛选已应用') }
function onReset() {
  filters.date = []; filters.dept = ''; filters.driver = ''; filters.status = ''
  pager.page = 1; ElMessage.info('已重置')
}

function onDispatch(row: ScheduleRow) {
  ElMessageBox.prompt('请选择司机', `派车：${row.applyNo}`, {
    confirmButtonText: '确认派车', cancelButtonText: '取消',
    inputValue: row.driver
  }).then(() => {
    row.statusKey = 'dispatched'; row.statusLabel = '已派车'
    ElMessage.success('已派车，请通知司机出车')
  }).catch(() => {})
}
function onDepart(row: ScheduleRow) {
  ElMessageBox.confirm(`确认 ${row.driver} 已出车执行任务？`, '出车登记', {
    confirmButtonText: '确认出车', cancelButtonText: '取消'
  }).then(() => {
    row.statusKey = 'running'; row.statusLabel = '执行中'
    row.startTime = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
    ElMessage.success('已登记出车')
  }).catch(() => {})
}
function onReturn(row: ScheduleRow) {
  ElMessageBox.prompt('请输入归还里程 (km)', `还车登记：${row.plate}`, {
    confirmButtonText: '确认归还', cancelButtonText: '取消',
    inputType: 'number', inputValue: row.mileage || ''
  }).then(({ value }) => {
    row.statusKey = 'returned'; row.statusLabel = '已归还'
    row.endTime = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
    row.mileage = Number(value) || null
    ElMessage.success('已登记还车')
  }).catch(() => {})
}
function onCancel(row: ScheduleRow) {
  ElMessageBox.confirm(`确认取消申请 ${row.applyNo}？`, '取消申请', {
    type: 'warning', confirmButtonText: '确认取消', cancelButtonText: '返回'
  }).then(() => {
    row.statusKey = 'cancelled'; row.statusLabel = '已取消'
    ElMessage.info('申请已取消')
  }).catch(() => {})
}
</script>

<style scoped lang="scss">
.zg-vh-schedule {
  --zg-brand-primary: var(--zg-amber-glow, #d97706);
  --zg-success: var(--zg-emerald-success, #059669);
  --zg-warning: var(--zg-amber-glow, #d97706);
  --zg-danger: var(--zg-rose-danger, #dc2626);
  --zg-info: var(--zg-sky-info, #0284c7);
  --zg-primary-soft: #fef3c7;
  --zg-success-soft: var(--zg-emerald-soft, #d1fae5);
  --zg-warning-soft: var(--zg-amber-soft, #fef3c7);
  --zg-danger-soft: var(--zg-rose-soft, #fee2e2);
  --zg-info-soft: var(--zg-sky-soft, #e0f2fe);
  --zg-line-soft: rgba(241,245,249,0.8);
  --zg-ink-tertiary: #71717a;
  --zg-surface-card: #ffffff;
  --zg-surface-muted: #f8fafc;
  --zg-gradient-surface: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
  --zg-gradient-primary: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
  --zg-radius-md: 10px;
  --zg-radius-lg: 16px;
  --zg-radius-pill: 999px;
  padding: 24px;
  background: var(--zg-gradient-surface);
  min-height: calc(100vh - 120px);

  &__head {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 20px; padding-bottom: 18px; border-bottom: 1px solid var(--zg-line-soft);
  }
  &__headline { display: flex; align-items: center; gap: 14px; }
  &__sigil {
    width: 44px; height: 44px; border-radius: var(--zg-radius-md);
    background: var(--zg-gradient-primary); color: #fff;
    display: flex; align-items: center; justify-content: center;
  }
  &__copy { display: flex; flex-direction: column; gap: 4px; }
  &__title { font-size: 20px; font-weight: 600; margin: 0; }
  &__sub { font-size: 13px; color: var(--zg-ink-tertiary); margin: 0; }
  &__cta { display: flex; gap: 10px; }

  &__board {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 12px; margin-bottom: 18px;
  }
  &__main {
    background: var(--zg-surface-card);
    border-radius: var(--zg-radius-lg);
    border: 1px solid var(--zg-line-soft);
    padding: 18px;
  }
  &__filterbar {
    padding: 14px 16px; background: var(--zg-surface-muted);
    border-radius: var(--zg-radius-md); margin-bottom: 14px;
  }
  &__tablewrap { border: 1px solid var(--zg-line-soft); border-radius: var(--zg-radius-md); overflow: hidden; }
  &__pager {
    display: flex; justify-content: flex-end;
    padding-top: 14px; border-top: 1px solid var(--zg-line-soft); margin-top: 16px;
  }
}

.zg-board-cell {
  background: #fff; border: 1px solid var(--zg-line-soft);
  border-radius: var(--zg-radius-lg); padding: 16px 18px;
  display: flex; align-items: center; gap: 14px;
  box-shadow: 0 1px 3px rgba(15,23,42,0.04);
  transition: all 250ms cubic-bezier(0.4,0,0.2,1);
  &:hover { transform: translateY(-2px); box-shadow: 0 8px 24px -8px rgba(15,23,42,0.12); }
  &__icon {
    width: 46px; height: 46px; border-radius: var(--zg-radius-md);
    background: var(--zg-primary-soft); color: var(--zg-brand-primary);
    display: flex; align-items: center; justify-content: center;
  }
  &.warn &__icon     { background: var(--zg-warning-soft); color: var(--zg-warning); }
  &.info &__icon     { background: var(--zg-info-soft); color: var(--zg-info); }
  &.success &__icon  { background: var(--zg-success-soft); color: var(--zg-success); }
  &__body { display: flex; flex-direction: column; gap: 4px; flex: 1; }
  &__num { font-size: 26px; font-weight: 700; line-height: 1; font-variant-numeric: tabular-nums; color: #18181b; }
  &__lbl { font-size: 12px; color: var(--zg-ink-tertiary); }
  &__arrow { color: #cbd5e1; font-size: 18px; transition: transform 200ms; }
  &:hover &__arrow { transform: translateX(3px); color: var(--zg-brand-primary); }
}

.zg-filter-row { display: flex; flex-wrap: wrap; align-items: center; gap: 14px 20px; }
.zg-filter-item {
  display: flex; align-items: center; gap: 8px;
  &__lbl { font-size: 12px; color: var(--zg-ink-tertiary); flex-shrink: 0; }
  &--actions { margin-left: auto; }
}
.zg-filter-select { width: 160px; }
.zg-filter-date { width: 300px; }

.zg-mono { font-family: 'Geist Mono', ui-monospace, monospace; font-size: 12px; }
.zg-apply-no { color: var(--zg-ink-tertiary); }

.zg-plate {
  display: inline-block;
  padding: 2px 10px; border-radius: 6px;
  background: linear-gradient(135deg, #1e40af, #2563eb); color: #fff;
  font-family: 'Geist Mono', ui-monospace, monospace; font-weight: 600; font-size: 13px;
  letter-spacing: 1px;
  &--sm { font-size: 12px; padding: 1px 8px; }
}

.zg-time-cell {
  display: inline-flex; align-items: center; gap: 4px;
  color: #52525b; font-variant-numeric: tabular-nums;
  .el-icon { font-size: 13px; color: var(--zg-ink-tertiary); }
}

.zg-mileage {
  display: inline-flex; align-items: center; gap: 4px;
  font-variant-numeric: tabular-nums; color: #18181b;
  .el-icon { font-size: 14px; color: var(--zg-ink-tertiary); }
}

.zg-status-pill {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 12px; padding: 2px 10px; border-radius: var(--zg-radius-pill);
  font-weight: 500;
  .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
  &--pending     { color: var(--zg-warning); background: var(--zg-warning-soft); }
  &--dispatched  { color: var(--zg-info);    background: var(--zg-info-soft); }
  &--running     { color: var(--zg-brand-primary); background: var(--zg-primary-soft); }
  &--returned    { color: var(--zg-success); background: var(--zg-success-soft); }
  &--cancelled   { color: var(--zg-ink-tertiary); background: #f1f5f9; }
}
</style>
