<!--
  智光云枢 · 车辆管理 · 车辆台账
  车辆作为固定资产（资产类别=车辆），纳入统一资产账本
-->
<template>
  <section class="zg-vh-ledger">
    <header class="zg-vh-ledger__head">
      <div class="zg-vh-ledger__headline">
        <div class="zg-vh-ledger__sigil"><el-icon :size="22"><Truck /></el-icon></div>
        <div class="zg-vh-ledger__copy">
          <h1 class="zg-vh-ledger__title">车辆台账</h1>
          <p class="zg-vh-ledger__sub">
            车辆作为固定资产 · 共 {{ kpiAgg.total }} 辆 ·
            原值 ¥{{ (kpiAgg.totalAmount / 10000).toFixed(1) }}万 ·
            在役率 {{ kpiAgg.inServiceRate }}%
          </p>
        </div>
      </div>
      <div class="zg-vh-ledger__cta">
        <el-button type="primary"><el-icon><Plus /></el-icon>新增车辆登记</el-button>
        <el-dropdown trigger="click">
          <el-button plain><el-icon><Download /></el-icon>导出</el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item><el-icon><Document /></el-icon>导出 Excel</el-dropdown-item>
              <el-dropdown-item><el-icon><Files /></el-icon>导出 CSV</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>

    <!-- KPI 四卡 -->
    <div class="zg-vh-ledger__kpi">
      <div v-for="cell in kpiCells" :key="cell.key" class="zg-kpi-cell" :class="cell.theme">
        <div class="zg-kpi-cell__icon"><el-icon :size="20"><component :is="cell.icon" /></el-icon></div>
        <div class="zg-kpi-cell__body">
          <span class="zg-kpi-cell__num">{{ cell.value }}</span>
          <span class="zg-kpi-cell__lbl">{{ cell.label }}</span>
        </div>
      </div>
    </div>

    <!-- 主体卡 -->
    <div class="zg-vh-ledger__main">
      <!-- Tab：车辆类型 -->
      <el-tabs v-model="activeType" class="zg-vh-ledger__tabs">
        <el-tab-pane v-for="cat in typeTabs" :key="cat.key" :name="cat.key">
          <template #label>
            <span class="zg-tab-label">
              <el-icon><component :is="cat.icon" /></el-icon>
              {{ cat.label }}
              <em class="zg-tab-count">{{ cat.count }}</em>
            </span>
          </template>
        </el-tab-pane>
      </el-tabs>

      <!-- 筛选条 -->
      <div class="zg-vh-ledger__filterbar">
        <div class="zg-filter-row">
          <div class="zg-filter-item">
            <span class="zg-filter-item__lbl">车牌号</span>
            <el-input v-model="filters.plate" placeholder="湘A·12345" clearable class="zg-filter-input">
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
          </div>
          <div class="zg-filter-item">
            <span class="zg-filter-item__lbl">品牌</span>
            <el-select v-model="filters.brand" placeholder="全部" clearable class="zg-filter-select">
              <el-option v-for="b in brandOptions" :key="b" :label="b" :value="b" />
            </el-select>
          </div>
          <div class="zg-filter-item">
            <span class="zg-filter-item__lbl">所属部门</span>
            <el-select v-model="filters.dept" placeholder="全部" clearable class="zg-filter-select">
              <el-option v-for="d in deptOptions" :key="d" :label="d" :value="d" />
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
      <div class="zg-vh-ledger__tablewrap">
        <el-table :data="filteredList" stripe height="520">
          <el-table-column prop="plate" label="车牌号" width="120" fixed="left">
            <template #default="{ row }">
              <span class="zg-plate">{{ row.plate }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="brandModel" label="品牌型号" width="180" show-overflow-tooltip />
          <el-table-column prop="vin" label="VIN码" width="170" show-overflow-tooltip>
            <template #default="{ row }">
              <span class="zg-mono">{{ row.vin }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="purchaseDate" label="购置日期" width="110" />
          <el-table-column label="购置金额" width="120" align="right">
            <template #default="{ row }">¥{{ row.purchaseAmount.toLocaleString() }}</template>
          </el-table-column>
          <el-table-column prop="assetCode" label="资产编号" width="150">
            <template #default="{ row }">
              <span class="zg-mono zg-asset-code">{{ row.assetCode }}</span>
            </template>
          </el-table-column>
          <el-table-column label="行驶证有效期" width="130" align="center">
            <template #default="{ row }">
              <span class="zg-expiry" :class="expiryClass(row.licenseExpiry)">{{ row.licenseExpiry }}</span>
            </template>
          </el-table-column>
          <el-table-column label="保险到期" width="130" align="center">
            <template #default="{ row }">
              <span class="zg-expiry" :class="expiryClass(row.insuranceExpiry)">{{ row.insuranceExpiry }}</span>
            </template>
          </el-table-column>
          <el-table-column label="年检到期" width="130" align="center">
            <template #default="{ row }">
              <span class="zg-expiry" :class="expiryClass(row.inspectionExpiry)">{{ row.inspectionExpiry }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="driver" label="司机" width="100" />
          <el-table-column prop="dept" label="所属部门" width="160" />
          <el-table-column prop="statusKey" label="状态" width="110" align="center">
            <template #default="{ row }">
              <span class="zg-status-pill" :class="'zg-status-pill--' + row.statusKey">
                <i class="dot"></i>{{ row.statusLabel }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" align="center" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link size="small">详情</el-button>
              <el-button link size="small">编辑</el-button>
              <el-button link size="small" :disabled="row.statusKey === 'scrapped'">维保</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="zg-vh-ledger__pager">
        <el-pagination v-model:current-page="pager.page" v-model:page-size="pager.size"
          :total="filteredList.length" :page-sizes="[10, 20, 50]"
          layout="prev, pager, next, jumper, ->, sizes, total" background />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Promotion, Plus, Download, Document, Files, Filter, Refresh, Search, Setting, List, TrendCharts } from '@element-plus/icons-vue'

interface VehicleRow {
  id: number
  plate: string
  brandModel: string
  vin: string
  purchaseDate: string
  purchaseAmount: number
  assetCode: string
  licenseExpiry: string
  insuranceExpiry: string
  inspectionExpiry: string
  driver: string
  dept: string
  typeKey: string
  typeLabel: string
  statusKey: 'inUse' | 'repairing' | 'idle' | 'scrapped'
  statusLabel: string
}

// ============================================================
// Mock 数据
// ============================================================
const MOCK_LIST: VehicleRow[] = [
  { id: 1, plate: '湘A·12345', brandModel: '长城炮 2.0T 四驱', vin: 'LFV3A28C4H3012345', purchaseDate: '2024-03-15', purchaseAmount: 188000, assetCode: 'ASSET-V-20240301', licenseExpiry: '2028-03-15', insuranceExpiry: '2026-05-20', inspectionExpiry: '2027-03-15', driver: '张建国', dept: '运维部一分队', typeKey: 'pickup', typeLabel: '皮卡车', statusKey: 'inUse', statusLabel: '在用' },
  { id: 2, plate: '湘A·88901', brandModel: '郑州日产 NP300', vin: 'LJN8MU5X5KN123456', purchaseDate: '2023-06-20', purchaseAmount: 165000, assetCode: 'ASSET-V-20230602', licenseExpiry: '2027-06-20', insuranceExpiry: '2026-07-10', inspectionExpiry: '2026-12-01', driver: '李志强', dept: '运维部一分队', typeKey: 'pickup', typeLabel: '皮卡车', statusKey: 'inUse', statusLabel: '在用' },
  { id: 3, plate: '湘A·66023', brandModel: '东风多利卡 D6', vin: 'LGAX1A193LX098765', purchaseDate: '2022-11-08', purchaseAmount: 268000, assetCode: 'ASSET-V-20221103', licenseExpiry: '2026-11-08', insuranceExpiry: '2026-12-15', inspectionExpiry: '2027-02-28', driver: '王海涛', dept: '运维部二分队', typeKey: 'engineer', typeLabel: '工程车', statusKey: 'repairing', statusLabel: '维修中' },
  { id: 4, plate: '湘A·77108', brandModel: '江铃特顺 工程车', vin: 'LJXCLBBA3NS112233', purchaseDate: '2023-09-12', purchaseAmount: 225000, assetCode: 'ASSET-V-20230904', licenseExpiry: '2027-09-12', insuranceExpiry: '2026-03-05', inspectionExpiry: '2026-09-12', driver: '赵立军', dept: '运维部二分队', typeKey: 'engineer', typeLabel: '工程车', statusKey: 'inUse', statusLabel: '在用' },
  { id: 5, plate: '湘A·55219', brandModel: '比亚迪秦 PLUS DM', vin: 'LGXCE4CB4N1099887', purchaseDate: '2024-01-18', purchaseAmount: 128000, assetCode: 'ASSET-V-20240105', licenseExpiry: '2028-01-18', insuranceExpiry: '2026-06-30', inspectionExpiry: '2027-01-18', driver: '陈晓东', dept: '运维部三分队', typeKey: 'patrol', typeLabel: '巡检车', statusKey: 'inUse', statusLabel: '在用' },
  { id: 6, plate: '湘A·33445', brandModel: '吉利博越 X PRO', vin: 'L6T7824S3NU223344', purchaseDate: '2023-04-22', purchaseAmount: 156000, assetCode: 'ASSET-V-20230406', licenseExpiry: '2027-04-22', insuranceExpiry: '2026-04-22', inspectionExpiry: '2026-10-15', driver: '刘建军', dept: '运维部三分队', typeKey: 'patrol', typeLabel: '巡检车', statusKey: 'idle', statusLabel: '闲置' },
  { id: 7, plate: '湘A·99887', brandModel: '奥迪 A6L 商务版', vin: 'LFV3A24G9P3556677', purchaseDate: '2022-08-05', purchaseAmount: 412000, assetCode: 'ASSET-V-20220807', licenseExpiry: '2026-08-05', insuranceExpiry: '2026-09-15', inspectionExpiry: '2026-08-05', driver: '周晓明', dept: '运维经理直属', typeKey: 'sedan', typeLabel: '轿车', statusKey: 'inUse', statusLabel: '在用' },
  { id: 8, plate: '湘A·22667', brandModel: '别克 GL8 ES 陆尊', vin: 'LSGUA84E0NB123456', purchaseDate: '2023-02-14', purchaseAmount: 368000, assetCode: 'ASSET-V-20230208', licenseExpiry: '2027-02-14', insuranceExpiry: '2026-02-28', inspectionExpiry: '2027-02-14', driver: '吴大为', dept: '运维经理直属', typeKey: 'sedan', typeLabel: '轿车', statusKey: 'inUse', statusLabel: '在用' },
  { id: 9, plate: '湘A·66778', brandModel: '蔚来 ET5 纯电轿车', vin: 'LJ1E8E713P0099886', purchaseDate: '2024-05-20', purchaseAmount: 328000, assetCode: 'ASSET-V-20240509', licenseExpiry: '2028-05-20', insuranceExpiry: '2026-05-30', inspectionExpiry: '2027-05-20', driver: '孙浩然', dept: '运维部一分队', typeKey: 'ev', typeLabel: '电动车', statusKey: 'inUse', statusLabel: '在用' },
  { id: 10, plate: '湘A·55667', brandModel: '比亚迪汉 EV 尊贵版', vin: 'LGXCE4CC7P1088775', purchaseDate: '2024-07-11', purchaseAmount: 285000, assetCode: 'ASSET-V-20240710', licenseExpiry: '2028-07-11', insuranceExpiry: '2026-08-11', inspectionExpiry: '2027-07-11', driver: '郑宇飞', dept: '运维部二分队', typeKey: 'ev', typeLabel: '电动车', statusKey: 'inUse', statusLabel: '在用' },
]

// ============================================================
// 类型 Tab 配置
// ============================================================
const allTypes = [
  { key: 'all',     label: '全部',    icon: Truck },
  { key: 'pickup',  label: '皮卡车',  icon: Promotion },
  { key: 'engineer',label: '工程车',  icon: Setting },
  { key: 'patrol',  label: '巡检车',  icon: List },
  { key: 'sedan',   label: '轿车',    icon: Promotion },
  { key: 'ev',      label: '电动车',  icon: TrendCharts },
]
const typeTabs = computed(() => allTypes.map(t => ({
  ...t,
  count: t.key === 'all' ? MOCK_LIST.length : MOCK_LIST.filter(v => v.typeKey === t.key).length
})))

const brandOptions = computed(() => Array.from(new Set(MOCK_LIST.map(v => v.brandModel.split(' ')[0]))))
const deptOptions = ['运维部一分队', '运维部二分队', '运维部三分队', '运维经理直属']
const statusOptions = [
  { key: 'inUse',     label: '在用' },
  { key: 'repairing', label: '维修中' },
  { key: 'idle',      label: '闲置' },
  { key: 'scrapped',  label: '报废' },
]

// ============================================================
// 状态
// ============================================================
const activeType = ref('all')
const filters = reactive({ plate: '', brand: '', dept: '', status: '' })
const pager = reactive({ page: 1, size: 10 })

const filteredList = computed(() => {
  let list = MOCK_LIST.slice()
  if (activeType.value !== 'all') list = list.filter(v => v.typeKey === activeType.value)
  if (filters.plate.trim()) {
    const kw = filters.plate.trim().toLowerCase()
    list = list.filter(v => v.plate.toLowerCase().includes(kw) || v.assetCode.toLowerCase().includes(kw))
  }
  if (filters.brand) list = list.filter(v => v.brandModel.startsWith(filters.brand!))
  if (filters.dept) list = list.filter(v => v.dept === filters.dept)
  if (filters.status) list = list.filter(v => v.statusKey === filters.status)
  const start = (pager.page - 1) * pager.size
  return list.slice(start, start + pager.size)
})

// ============================================================
// KPI
// ============================================================
const kpiAgg = computed(() => {
  const total = MOCK_LIST.length
  const inUse = MOCK_LIST.filter(v => v.statusKey === 'inUse').length
  const repairing = MOCK_LIST.filter(v => v.statusKey === 'repairing').length
  const idle = MOCK_LIST.filter(v => v.statusKey === 'idle').length
  const totalAmount = MOCK_LIST.reduce((s, v) => s + v.purchaseAmount, 0)
  const inServiceRate = total === 0 ? 0 : Math.round((inUse / total) * 100)
  return { total, inUse, repairing, idle, totalAmount, inServiceRate }
})
const kpiCells = computed(() => [
  { key: 'total',     label: '车辆总数', value: kpiAgg.value.total,       icon: Truck,          theme: '' },
  { key: 'inUse',     label: '在用',     value: kpiAgg.value.inUse,       icon: TrendCharts,  theme: 'success' },
  { key: 'repairing', label: '维修中',   value: kpiAgg.value.repairing,   icon: Setting,      theme: 'warn' },
  { key: 'idle',      label: '闲置',     value: kpiAgg.value.idle,        icon: List,         theme: 'info' },
])

// ============================================================
// 动作
// ============================================================
function onApply() { pager.page = 1; ElMessage.success('筛选已应用') }
function onReset() {
  filters.plate = ''; filters.brand = ''; filters.dept = ''; filters.status = ''
  pager.page = 1; ElMessage.info('已重置')
}

// 日期到期样式：60 天内黄色，30 天内红色，过期也是红色
function expiryClass(dateStr: string) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr); target.setHours(0, 0, 0, 0)
  const diff = Math.floor((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diff < 0 || diff <= 30) return 'zg-expiry--danger'
  if (diff <= 60) return 'zg-expiry--warn'
  return ''
}
</script>

<style scoped lang="scss">
.zg-vh-ledger {
  --zg-brand-primary: var(--zg-amber-glow, #d97706);
  --zg-success: var(--zg-emerald-success, #059669);
  --zg-warning: var(--zg-amber-glow, #d97706);
  --zg-danger: var(--zg-rose-danger, #dc2626);
  --zg-info: var(--zg-sky-info, #0284c7);
  --zg-success-soft: var(--zg-emerald-soft, #d1fae5);
  --zg-warning-soft: var(--zg-amber-soft, #fef3c7);
  --zg-danger-soft: var(--zg-rose-soft, #fee2e2);
  --zg-info-soft: var(--zg-sky-soft, #e0f2fe);
  --zg-line-soft: rgba(241,245,249,0.8);
  --zg-ink-primary: #18181b;
  --zg-ink-secondary: #52525b;
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

  &__kpi {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 14px; margin-bottom: 18px;
  }
  &__main {
    background: var(--zg-surface-card);
    border-radius: var(--zg-radius-lg);
    border: 1px solid var(--zg-line-soft);
    padding: 18px;
  }
  &__tabs { margin-bottom: 16px; }
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

.zg-kpi-cell {
  background: #fff; border: 1px solid var(--zg-line-soft);
  border-radius: var(--zg-radius-lg); padding: 16px 18px;
  display: flex; align-items: center; gap: 14px;
  box-shadow: 0 1px 3px rgba(15,23,42,0.04);
  transition: all 250ms cubic-bezier(0.4,0,0.2,1);
  position: relative; overflow: hidden;
  &:hover { transform: translateY(-2px); box-shadow: 0 8px 24px -8px rgba(15,23,42,0.12); }
  &::before { content: ''; position: absolute; left: 0; top: 0; width: 3px; height: 100%; background: var(--zg-brand-primary); }
  &.success::before { background: var(--zg-success); }
  &.info::before    { background: var(--zg-info); }
  &.warn::before    { background: var(--zg-warning); }
  &__icon {
    width: 42px; height: 42px; border-radius: var(--zg-radius-md);
    background: var(--zg-brand-primary); color: #fff;
    display: flex; align-items: center; justify-content: center;
  }
  .success &__icon { background: var(--zg-success); }
  .info    &__icon { background: var(--zg-info); }
  .warn    &__icon { background: var(--zg-warning); }
  &__body { display: flex; flex-direction: column; gap: 4px; }
  &__num { font-size: 22px; font-weight: 700; line-height: 1.1; font-variant-numeric: tabular-nums; }
  &__lbl { font-size: 12px; color: var(--zg-ink-tertiary); }
}

.zg-tab-label {
  display: inline-flex; align-items: center; gap: 6px;
  .zg-tab-count {
    font-style: normal; font-size: 11px; padding: 1px 7px;
    background: #fffbeb; color: var(--zg-brand-primary);
    border-radius: var(--zg-radius-pill); font-weight: 500;
  }
}

.zg-filter-row { display: flex; flex-wrap: wrap; align-items: center; gap: 14px 20px; }
.zg-filter-item {
  display: flex; align-items: center; gap: 8px;
  &__lbl { font-size: 12px; color: var(--zg-ink-tertiary); flex-shrink: 0; }
  &--actions { margin-left: auto; }
}
.zg-filter-select { width: 180px; }
.zg-filter-input { width: 200px; }

.zg-plate {
  display: inline-block;
  padding: 2px 10px; border-radius: 6px;
  background: linear-gradient(135deg, #1e40af, #2563eb); color: #fff;
  font-family: 'Geist Mono', ui-monospace, monospace; font-weight: 600; font-size: 13px;
  letter-spacing: 1px;
}
.zg-mono { font-family: 'Geist Mono', ui-monospace, monospace; font-size: 12px; }
.zg-asset-code { color: var(--zg-ink-secondary); }

.zg-expiry { font-size: 12px; font-weight: 500; font-variant-numeric: tabular-nums; }
.zg-expiry--warn { color: var(--zg-warning); }
.zg-expiry--danger { color: var(--zg-danger); animation: vhPulse 1.5s ease-in-out infinite; }
@keyframes vhPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.55; }
}

.zg-status-pill {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 12px; padding: 2px 10px; border-radius: var(--zg-radius-pill);
  font-weight: 500;
  .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
  &--inUse     { color: var(--zg-success); background: var(--zg-success-soft); }
  &--repairing { color: var(--zg-warning); background: var(--zg-warning-soft); }
  &--idle      { color: var(--zg-info); background: var(--zg-info-soft); }
  &--scrapped  { color: var(--zg-danger); background: var(--zg-danger-soft); }
}
</style>
