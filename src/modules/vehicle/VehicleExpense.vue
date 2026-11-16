<!--
  智光云枢 · 车辆管理 · 车辆费用台账
  加油 / 保养 / 维修 / 保险 / 年检 / 其他
-->
<template>
  <section class="zg-vh-expense">
    <header class="zg-vh-expense__head">
      <div class="zg-vh-expense__headline">
        <div class="zg-vh-expense__sigil"><el-icon :size="22"><Wallet /></el-icon></div>
        <div class="zg-vh-expense__copy">
          <h1 class="zg-vh-expense__title">车辆费用台账</h1>
          <p class="zg-vh-expense__sub">
            本月共 {{ kpiAgg.count }} 笔 · 累计 ¥{{ kpiAgg.total.toLocaleString() }} ·
            加油占比 {{ kpiAgg.fuelPct }}% · 维修占比 {{ kpiAgg.repairPct }}%
          </p>
        </div>
      </div>
      <div class="zg-vh-expense__cta">
        <el-button type="primary"><el-icon><Plus /></el-icon>登记费用</el-button>
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

    <!-- 金额聚合卡 -->
    <div class="zg-vh-expense__summary">
      <div v-for="cell in summaryCells" :key="cell.key" class="zg-summary-cell">
        <div class="zg-summary-cell__icon" :style="{ background: cell.bg, color: cell.color }">
          <el-icon :size="20"><component :is="cell.icon" /></el-icon>
        </div>
        <div class="zg-summary-cell__body">
          <span class="zg-summary-cell__num">¥{{ cell.amount.toLocaleString() }}</span>
          <span class="zg-summary-cell__lbl">{{ cell.label }}</span>
        </div>
        <el-progress :percentage="cell.pct" :stroke-width="4" :show-text="false"
          :color="cell.color" class="zg-summary-cell__bar" />
      </div>
    </div>

    <!-- 主体卡 -->
    <div class="zg-vh-expense__main">
      <!-- Tab：费用类型 -->
      <el-tabs v-model="activeType" class="zg-vh-expense__tabs">
        <el-tab-pane v-for="cat in expenseTabs" :key="cat.key" :name="cat.key">
          <template #label>
            <span class="zg-tab-label">
              <el-icon><component :is="cat.icon" /></el-icon>
              {{ cat.label }}
              <em class="zg-tab-count">¥{{ (cat.amount / 10000).toFixed(1) }}万</em>
            </span>
          </template>
        </el-tab-pane>
      </el-tabs>

      <!-- 筛选条 -->
      <div class="zg-vh-expense__filterbar">
        <div class="zg-filter-row">
          <div class="zg-filter-item">
            <span class="zg-filter-item__lbl">费用日期</span>
            <el-date-picker v-model="filters.date" type="daterange" range-separator="至"
              start-placeholder="开始" end-placeholder="结束" class="zg-filter-date" />
          </div>
          <div class="zg-filter-item">
            <span class="zg-filter-item__lbl">车牌号</span>
            <el-select v-model="filters.plate" placeholder="全部" clearable class="zg-filter-select">
              <el-option v-for="p in plateOptions" :key="p" :label="p" :value="p" />
            </el-select>
          </div>
          <div class="zg-filter-item">
            <span class="zg-filter-item__lbl">经办人</span>
            <el-select v-model="filters.handler" placeholder="全部" clearable class="zg-filter-select">
              <el-option v-for="h in handlerOptions" :key="h" :label="h" :value="h" />
            </el-select>
          </div>
          <div class="zg-filter-item">
            <span class="zg-filter-item__lbl">关联合同</span>
            <el-select v-model="filters.contract" placeholder="全部" clearable class="zg-filter-select">
              <el-option v-for="c in contractOptions" :key="c" :label="c" :value="c" />
            </el-select>
          </div>
          <div class="zg-filter-item zg-filter-item--actions">
            <el-button type="primary" @click="onApply"><el-icon><Filter /></el-icon>筛选</el-button>
            <el-button @click="onReset"><el-icon><Refresh /></el-icon>重置</el-button>
          </div>
        </div>
      </div>

      <!-- 表格 -->
      <div class="zg-vh-expense__tablewrap">
        <el-table :data="filteredList" stripe height="520">
          <el-table-column prop="expenseDate" label="费用日期" width="120" fixed="left" />
          <el-table-column prop="plate" label="车牌号" width="120">
            <template #default="{ row }">
              <span class="zg-plate zg-plate--sm">{{ row.plate }}</span>
            </template>
          </el-table-column>
          <el-table-column label="费用类型" width="120" align="center">
            <template #default="{ row }">
              <span class="zg-expense-tag" :class="'zg-expense-tag--' + row.typeKey">
                {{ row.typeLabel }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="金额" width="130" align="right">
            <template #default="{ row }">
              <span class="zg-amount">¥{{ row.amount.toLocaleString() }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="handler" label="经办人" width="100" />
          <el-table-column prop="summary" label="摘要" width="220" show-overflow-tooltip />
          <el-table-column prop="voucherNo" label="凭证号" width="150">
            <template #default="{ row }">
              <span class="zg-mono">{{ row.voucherNo }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="contractNo" label="所属合同" width="200">
            <template #default="{ row }">
              <el-link v-if="row.contractNo && row.contractNo !== '—'" type="primary" :underline="false"
                class="zg-contract-link">
                <el-icon><Link /></el-icon>
                {{ row.contractNo }}
              </el-link>
              <span v-else class="zg-contract-none">—</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" align="center" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link size="small">查看</el-button>
              <el-button link size="small">编辑</el-button>
              <el-button link size="small">凭证</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 & 合计 -->
      <div class="zg-vh-expense__pager">
        <div class="zg-vh-expense__total">
          本页 <strong>{{ filteredList.length }}</strong> 笔 ·
          合计 <span class="zg-amount">¥{{ pageTotal.toLocaleString() }}</span>
        </div>
        <el-pagination v-model:current-page="pager.page" v-model:page-size="pager.size"
          :total="filteredList.length" :page-sizes="[10, 20, 50]"
          layout="prev, pager, next, jumper, ->, sizes" background />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Wallet, Plus, Download, Document, Files, Filter, Refresh, Link, Promotion, Tools, FirstAidKit, Ticket, Monitor, More } from '@element-plus/icons-vue'

interface ExpenseRow {
  id: number
  expenseDate: string
  plate: string
  typeKey: 'fuel' | 'maintenance' | 'repair' | 'insurance' | 'inspection' | 'other'
  typeLabel: string
  amount: number
  handler: string
  summary: string
  voucherNo: string
  contractNo: string
}

// ============================================================
// Mock 数据：10 条
// ============================================================
const MOCK_LIST: ExpenseRow[] = [
  { id: 1, expenseDate: '2026-11-15', plate: '湘A·12345', typeKey: 'fuel',        typeLabel: '加油',  amount: 680,  handler: '张建国', summary: '中石化先导路 92# 50L 长途加油', voucherNo: 'PZ-20261115-001', contractNo: 'CON-FUEL-2026-001' },
  { id: 2, expenseDate: '2026-11-14', plate: '湘A·77108', typeKey: 'maintenance', typeLabel: '保养',  amount: 1280, handler: '赵立军', summary: '江铃特顺 20000km 常规保养换机油滤芯', voucherNo: 'PZ-20261114-002', contractNo: 'CON-MAINT-2026-003' },
  { id: 3, expenseDate: '2026-11-13', plate: '湘A·66023', typeKey: 'repair',      typeLabel: '维修',  amount: 4850, handler: '王海涛', summary: '东风多利卡 变速箱异响、换离合器片', voucherNo: 'PZ-20261113-003', contractNo: 'CON-REPAIR-2026-005' },
  { id: 4, expenseDate: '2026-11-12', plate: '湘A·88901', typeKey: 'fuel',        typeLabel: '加油',  amount: 720,  handler: '李志强', summary: '中石油麓谷 92# 52L', voucherNo: 'PZ-20261112-004', contractNo: 'CON-FUEL-2026-001' },
  { id: 5, expenseDate: '2026-11-10', plate: '湘A·22667', typeKey: 'insurance',   typeLabel: '保险',  amount: 3680, handler: '吴大为', summary: '别克 GL8 交强险+三者 200 万续保', voucherNo: 'PZ-20261110-005', contractNo: 'CON-INSURE-2026-002' },
  { id: 6, expenseDate: '2026-11-08', plate: '湘A·55219', typeKey: 'inspection',  typeLabel: '年检',  amount: 350,  handler: '陈晓东', summary: '比亚迪秦 PLUS 年度安全技术检验', voucherNo: 'PZ-20261108-006', contractNo: '—' },
  { id: 7, expenseDate: '2026-11-07', plate: '湘A·99887', typeKey: 'fuel',        typeLabel: '加油',  amount: 0,    handler: '孙浩然', summary: '蔚来 ET5 蔚来免费换电 5 次', voucherNo: 'PZ-20261107-007', contractNo: 'CON-EV-2026-001' },
  { id: 8, expenseDate: '2026-11-05', plate: '湘A·12345', typeKey: 'repair',      typeLabel: '维修',  amount: 1580, handler: '张建国', summary: '长城炮 右前轮胎扎钉、换胎压传感器', voucherNo: 'PZ-20261105-008', contractNo: 'CON-REPAIR-2026-005' },
  { id: 9, expenseDate: '2026-11-03', plate: '湘A·55667', typeKey: 'other',       typeLabel: '其他',  amount: 260,  handler: '郑宇飞', summary: '临时停车缴费 16 次', voucherNo: 'PZ-20261103-009', contractNo: '—' },
  { id: 10, expenseDate: '2026-11-01', plate: '湘A·33445', typeKey: 'maintenance',typeLabel: '保养',  amount: 960,  handler: '刘建军', summary: '吉利博越 30000km 大保养', voucherNo: 'PZ-20261101-010', contractNo: 'CON-MAINT-2026-003' },
]

// ============================================================
// Tab 配置
// ============================================================
const typeDefs = [
  { key: 'fuel',        label: '加油', icon: Promotion,  color: '#d97706', bg: '#fef3c7' },
  { key: 'maintenance', label: '保养', icon: Tools,       color: '#059669', bg: '#d1fae5' },
  { key: 'repair',      label: '维修', icon: FirstAidKit, color: '#dc2626', bg: '#fee2e2' },
  { key: 'insurance',   label: '保险', icon: Ticket,      color: '#0284c7', bg: '#e0f2fe' },
  { key: 'inspection',  label: '年检', icon: Monitor,    color: '#7c3aed', bg: '#ede9fe' },
  { key: 'other',       label: '其他', icon: More,        color: '#64748b', bg: '#f1f5f9' },
]
const expenseTabs = computed(() => [
  { key: 'all', label: '全部', icon: Wallet, amount: MOCK_LIST.reduce((s, v) => s + v.amount, 0) },
  ...typeDefs.map(t => ({
    ...t,
    amount: MOCK_LIST.filter(v => v.typeKey === t.key).reduce((s, v) => s + v.amount, 0)
  }))
])

const plateOptions = computed(() => Array.from(new Set(MOCK_LIST.map(v => v.plate))))
const handlerOptions = computed(() => Array.from(new Set(MOCK_LIST.map(v => v.handler))))
const contractOptions = computed(() => Array.from(new Set(MOCK_LIST.filter(v => v.contractNo !== '—').map(v => v.contractNo))))

// ============================================================
// 状态
// ============================================================
const activeType = ref('all')
const filters = reactive({ date: [] as any[], plate: '', handler: '', contract: '' })
const pager = reactive({ page: 1, size: 10 })

const filteredList = computed(() => {
  let list = MOCK_LIST.slice()
  if (activeType.value !== 'all') list = list.filter(v => v.typeKey === activeType.value)
  if (filters.plate) list = list.filter(v => v.plate === filters.plate)
  if (filters.handler) list = list.filter(v => v.handler === filters.handler)
  if (filters.contract) list = list.filter(v => v.contractNo === filters.contract)
  if (filters.date && filters.date.length === 2) {
    const [start, end] = filters.date
    const startStr = start.toISOString().slice(0, 10)
    const endStr = end.toISOString().slice(0, 10)
    list = list.filter(v => v.expenseDate >= startStr && v.expenseDate <= endStr)
  }
  return list
})

const pageTotal = computed(() => filteredList.value.reduce((s, v) => s + v.amount, 0))

// ============================================================
// KPI / 聚合
// ============================================================
const kpiAgg = computed(() => {
  const total = filteredList.value.reduce((s, v) => s + v.amount, 0)
  const count = filteredList.value.length
  const fuelTotal = filteredList.value.filter(v => v.typeKey === 'fuel').reduce((s, v) => s + v.amount, 0)
  const repairTotal = filteredList.value.filter(v => v.typeKey === 'repair').reduce((s, v) => s + v.amount, 0)
  const fuelPct = total === 0 ? 0 : Math.round((fuelTotal / total) * 100)
  const repairPct = total === 0 ? 0 : Math.round((repairTotal / total) * 100)
  return { total, count, fuelPct, repairPct }
})

const summaryCells = computed(() => {
  const total = MOCK_LIST.reduce((s, v) => s + v.amount, 0)
  return typeDefs.map(t => {
    const amount = MOCK_LIST.filter(v => v.typeKey === t.key).reduce((s, v) => s + v.amount, 0)
    const pct = total === 0 ? 0 : Math.round((amount / total) * 100)
    return { ...t, amount, pct }
  })
})

// ============================================================
// 动作
// ============================================================
function onApply() { pager.page = 1; ElMessage.success('筛选已应用') }
function onReset() {
  filters.date = []; filters.plate = ''; filters.handler = ''; filters.contract = ''
  pager.page = 1; ElMessage.info('已重置')
}
</script>

<style scoped lang="scss">
.zg-vh-expense {
  --zg-brand-primary: var(--zg-amber-glow, #d97706);
  --zg-line-soft: rgba(241,245,249,0.8);
  --zg-ink-primary: #18181b;
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

  &__summary {
    display: grid; grid-template-columns: repeat(6, 1fr);
    gap: 12px; margin-bottom: 18px;
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
    display: flex; justify-content: space-between; align-items: center;
    padding-top: 14px; border-top: 1px solid var(--zg-line-soft); margin-top: 16px;
  }
  &__total { font-size: 13px; color: var(--zg-ink-tertiary); strong { color: var(--zg-brand-primary); margin: 0 3px; } }
}

.zg-summary-cell {
  background: #fff; border: 1px solid var(--zg-line-soft);
  border-radius: var(--zg-radius-lg); padding: 14px 16px;
  display: flex; align-items: center; gap: 10px;
  box-shadow: 0 1px 3px rgba(15,23,42,0.04);
  transition: all 250ms cubic-bezier(0.4,0,0.2,1);
  flex-wrap: wrap;
  &:hover { transform: translateY(-2px); box-shadow: 0 8px 24px -8px rgba(15,23,42,0.12); }
  &__icon {
    width: 36px; height: 36px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  &__body { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
  &__num { font-size: 16px; font-weight: 700; line-height: 1.1; font-variant-numeric: tabular-nums; }
  &__lbl { font-size: 11px; color: var(--zg-ink-tertiary); }
  &__bar { width: 100%; margin-top: 4px; }
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
.zg-filter-select { width: 160px; }
.zg-filter-date { width: 300px; }

.zg-plate {
  display: inline-block;
  padding: 2px 10px; border-radius: 6px;
  background: linear-gradient(135deg, #1e40af, #2563eb); color: #fff;
  font-family: 'Geist Mono', ui-monospace, monospace; font-weight: 600; font-size: 13px;
  letter-spacing: 1px;
  &--sm { font-size: 12px; padding: 1px 8px; }
}

.zg-mono { font-family: 'Geist Mono', ui-monospace, monospace; font-size: 12px; color: var(--zg-ink-tertiary); }

.zg-expense-tag {
  display: inline-block; font-size: 12px; font-weight: 500;
  padding: 2px 10px; border-radius: var(--zg-radius-pill);
  &--fuel        { color: #d97706; background: #fef3c7; }
  &--maintenance { color: #059669; background: #d1fae5; }
  &--repair      { color: #dc2626; background: #fee2e2; }
  &--insurance   { color: #0284c7; background: #e0f2fe; }
  &--inspection  { color: #7c3aed; background: #ede9fe; }
  &--other       { color: #64748b; background: #f1f5f9; }
}

.zg-amount { font-weight: 700; font-variant-numeric: tabular-nums; color: #18181b; }

.zg-contract-link {
  display: inline-flex; align-items: center; gap: 4px; font-family: 'Geist Mono', ui-monospace, monospace; font-size: 12px;
  .el-icon { font-size: 13px; }
}
.zg-contract-none { color: #cbd5e1; }
</style>
