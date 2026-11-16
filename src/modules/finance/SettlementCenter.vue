<!--
  智光云枢 · 财务结算中心 · 结算总览
  - KPI 四卡：本月应收、本月应付、待结算单数、逾期未结
  - Tab：运维服务费 / 电费 / 工程款 / 外包服务费
  - 结算单表格 + 关联合同 + 开票 / 付款状态
-->
<template>
  <section class="zg-fc-center">
    <header class="zg-fc-center__head">
      <div class="zg-fc-center__headline">
        <div class="zg-fc-center__sigil"><el-icon :size="22"><Wallet /></el-icon></div>
        <div class="zg-fc-center__copy">
          <h1 class="zg-fc-center__title">结算总览</h1>
          <p class="zg-fc-center__sub">
            财务结算中心 · 共 {{ filteredRows.length }} 笔结算 ·
            应收 ¥{{ (kpiAgg.receivable / 10000).toFixed(1) }}万 ·
            应付 ¥{{ (kpiAgg.payable / 10000).toFixed(1) }}万 ·
            逾期 {{ kpiAgg.overdueCount }} 笔
          </p>
        </div>
      </div>
      <div class="zg-fc-center__cta">
        <el-button type="primary"><el-icon><Plus /></el-icon>发起结算</el-button>
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
    <div class="zg-fc-center__kpi">
      <div v-for="cell in kpiCells" :key="cell.key" class="zg-kpi-cell" :class="cell.theme">
        <div class="zg-kpi-cell__icon"><el-icon :size="20"><component :is="cell.icon" /></el-icon></div>
        <div class="zg-kpi-cell__body">
          <span class="zg-kpi-cell__num">{{ cell.value }}</span>
          <span class="zg-kpi-cell__lbl">{{ cell.label }}</span>
        </div>
      </div>
    </div>

    <!-- 主体卡 -->
    <div class="zg-fc-center__main">
      <!-- Tab：结算类型 -->
      <el-tabs v-model="activeType" class="zg-fc-center__tabs">
        <el-tab-pane v-for="tab in typeTabs" :key="tab.key" :name="tab.key">
          <template #label>
            <span class="zg-tab-label">
              <el-icon><component :is="tab.icon" /></el-icon>
              {{ tab.label }}
              <em class="zg-tab-count">{{ tab.count }}</em>
            </span>
          </template>
        </el-tab-pane>
      </el-tabs>

      <!-- 筛选条 -->
      <div class="zg-fc-center__filterbar">
        <div class="zg-filter-row">
          <div class="zg-filter-item">
            <span class="zg-filter-item__lbl">方向</span>
            <el-select v-model="filters.direction" placeholder="应收 / 应付" class="zg-filter-select">
              <el-option label="全部" value="" />
              <el-option label="应收" value="receivable" />
              <el-option label="应付" value="payable" />
            </el-select>
          </div>
          <div class="zg-filter-item">
            <span class="zg-filter-item__lbl">结算状态</span>
            <el-select v-model="filters.settleStatus" placeholder="全部" class="zg-filter-select">
              <el-option label="全部" value="" />
              <el-option label="已结" value="settled" />
              <el-option label="待结" value="pending" />
            </el-select>
          </div>
          <div class="zg-filter-item">
            <span class="zg-filter-item__lbl">开票状态</span>
            <el-select v-model="filters.invoiceStatus" placeholder="全部" class="zg-filter-select">
              <el-option label="全部" value="" />
              <el-option label="未开" value="none" />
              <el-option label="已开" value="opened" />
              <el-option label="红冲" value="redFlush" />
            </el-select>
          </div>
          <div class="zg-filter-item">
            <span class="zg-filter-item__lbl">付款状态</span>
            <el-select v-model="filters.paymentStatus" placeholder="全部" class="zg-filter-select">
              <el-option label="全部" value="" />
              <el-option label="未付" value="none" />
              <el-option label="部分" value="partial" />
              <el-option label="已付" value="paid" />
            </el-select>
          </div>
          <div class="zg-filter-item">
            <span class="zg-filter-item__lbl">结算单号</span>
            <el-input v-model="filters.keyword" placeholder="如 JS-2026-xxx" clearable class="zg-filter-input">
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
          </div>
        </div>
      </div>

      <!-- 表格 -->
      <div class="zg-fc-center__tablewrap">
        <el-table :data="filteredRows" stripe height="520">
          <el-table-column prop="code" label="结算单号" width="160" fixed="left">
            <template #default="{ row }">
              <span class="zg-fc-code">{{ row.code }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="contractNo" label="关联合同" width="150">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="onMonitorContract(row)">{{ row.contractNo }}</el-button>
            </template>
          </el-table-column>
          <el-table-column prop="typeLabel" label="结算类型" width="120" align="center">
            <template #default="{ row }">
              <el-tag size="small" effect="plain" :type="typeTagColor(row.typeKey)">{{ row.typeLabel }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="direction" label="方向" width="80" align="center">
            <template #default="{ row }">
              <span :class="row.direction === 'receivable' ? 'zg-fc-dir zg-fc-dir--in' : 'zg-fc-dir zg-fc-dir--out'">
                {{ row.direction === 'receivable' ? '应收' : '应付' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="金额(元)" width="140" align="right">
            <template #default="{ row }">
              <span class="zg-fc-amount" :class="row.direction === 'receivable' ? 'zg-fc-amount--pos' : 'zg-fc-amount--neg'">
                {{ row.direction === 'receivable' ? '+' : '-' }}¥{{ row.amount.toLocaleString() }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="已结/待结" width="180">
            <template #default="{ row }">
              <div class="zg-fc-settlebar">
                <el-progress
                  :percentage="settlePct(row)"
                  :stroke-width="8"
                  :color="settlePct(row) === 100 ? '#059669' : settlePct(row) === 0 ? '#dc2626' : '#f59e0b'"
                  :show-text="false"
                />
                <span class="zg-fc-settlebar__text">¥{{ row.settled.toLocaleString() }} / ¥{{ row.pending.toLocaleString() }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="开票状态" width="110" align="center">
            <template #default="{ row }">
              <span class="zg-status-pill" :class="'zg-status-pill--' + row.invoiceStatus">
                <i class="dot"></i>{{ invoiceLabel(row.invoiceStatus) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="付款状态" width="110" align="center">
            <template #default="{ row }">
              <span class="zg-status-pill" :class="'zg-status-pill--' + row.paymentStatus">
                <i class="dot"></i>{{ paymentLabel(row.paymentStatus) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="deadline" label="结算截止日" width="120">
            <template #default="{ row }">
              <span :class="isOverdue(row) ? 'zg-fc-overdue' : ''">{{ row.deadline }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="160" align="center" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="onMonitorDetail(row)">详情</el-button>
              <el-button link size="small" :disabled="row.invoiceStatus === 'opened' || row.invoiceStatus === 'redFlush'" @click="onOpenInvoice(row)">开票</el-button>
              <el-button type="success" link size="small" :disabled="row.paymentStatus === 'paid' && row.settled === row.amount" @click="onConfirmPaid(row)">结款</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="zg-fc-center__pager">
        <el-pagination v-model:current-page="pager.page" v-model:page-size="pager.size"
          :total="filteredRows.length" :page-sizes="[8, 15, 30]"
          layout="prev, pager, next, jumper, ->, sizes, total" background />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, computed, h } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Wallet, Plus, Download, Document, Files, Search, Coin, Money, Tickets, Warning, Lightning, Brush, Tools, Promotion } from '@element-plus/icons-vue'

// ============================================================
// 类型
// ============================================================
interface SettlementRow {
  id: number
  code: string
  contractNo: string
  typeKey: 'ops' | 'power' | 'project' | 'outsource'
  typeLabel: string
  direction: 'receivable' | 'payable'
  amount: number
  settled: number
  pending: number
  invoiceStatus: 'none' | 'opened' | 'redFlush'
  paymentStatus: 'none' | 'partial' | 'paid'
  deadline: string
  supplier: string
}

// ============================================================
// 结算类型 Tab
// ============================================================
const typeTabs = ref([
  { key: 'all',       label: '全部',         count: 0, icon: Wallet },
  { key: 'ops',       label: '运维服务费',   count: 0, icon: Tools },
  { key: 'power',     label: '电费',         count: 0, icon: Lightning },
  { key: 'project',   label: '工程款',       count: 0, icon: Brush },
  { key: 'outsource', label: '外包服务费',   count: 0, icon: Truck },
])

// ============================================================
// Mock 数据 — 12 条覆盖四种类型
// ============================================================
const MOCK_DATA: SettlementRow[] = [
  // 运维服务费（应收 + 应付）
  { id: 1,  code: 'JS-2026-1101', contractNo: 'HT-2026-001', typeKey: 'ops',       typeLabel: '运维服务费', direction: 'receivable', amount: 128000, settled: 128000, pending: 0,     invoiceStatus: 'opened',  paymentStatus: 'paid',     deadline: '2026-11-05', supplier: '湖南智光城市照明' },
  { id: 2,  code: 'JS-2026-1102', contractNo: 'HT-2026-003', typeKey: 'ops',       typeLabel: '运维服务费', direction: 'payable',    amount: 96000,  settled: 48000,  pending: 48000, invoiceStatus: 'opened',  paymentStatus: 'partial',  deadline: '2026-11-15', supplier: '长沙照明运维队' },
  { id: 3,  code: 'JS-2026-1103', contractNo: 'HT-2026-005', typeKey: 'ops',       typeLabel: '运维服务费', direction: 'receivable', amount: 210000, settled: 0,      pending: 210000, invoiceStatus: 'none',    paymentStatus: 'none',     deadline: '2026-11-28', supplier: '中电建城市运维' },

  // 电费（应付为主）
  { id: 4,  code: 'JS-2026-1110', contractNo: 'HT-2026-010', typeKey: 'power',     typeLabel: '电费',       direction: 'payable',    amount: 356800, settled: 356800, pending: 0,     invoiceStatus: 'opened',  paymentStatus: 'paid',     deadline: '2026-11-10', supplier: '国网湖南省电力公司' },
  { id: 5,  code: 'JS-2026-1111', contractNo: 'HT-2026-010', typeKey: 'power',     typeLabel: '电费',       direction: 'payable',    amount: 298400, settled: 0,      pending: 298400, invoiceStatus: 'none',    paymentStatus: 'none',     deadline: '2026-11-25', supplier: '国网湖南省电力公司' },
  { id: 6,  code: 'JS-2026-1112', contractNo: 'HT-2026-011', typeKey: 'power',     typeLabel: '电费',       direction: 'receivable', amount: 124500, settled: 60000,  pending: 64500, invoiceStatus: 'redFlush', paymentStatus: 'partial', deadline: '2026-11-20', supplier: '湖南电能源' },

  // 工程款
  { id: 7,  code: 'JS-2026-1120', contractNo: 'HT-2026-020', typeKey: 'project',   typeLabel: '工程款',     direction: 'payable',    amount: 580000, settled: 200000, pending: 380000, invoiceStatus: 'opened', paymentStatus: 'partial', deadline: '2026-11-30', supplier: '中电建光电' },
  { id: 8,  code: 'JS-2026-1121', contractNo: 'HT-2026-021', typeKey: 'project',   typeLabel: '工程款',     direction: 'receivable', amount: 1250000, settled: 0,      pending: 1250000, invoiceStatus: 'none',   paymentStatus: 'none',     deadline: '2026-12-15', supplier: '长沙市政工程公司' },
  { id: 9,  code: 'JS-2026-1122', contractNo: 'HT-2026-022', typeKey: 'project',   typeLabel: '工程款',     direction: 'payable',    amount: 320000, settled: 320000, pending: 0,     invoiceStatus: 'opened', paymentStatus: 'paid',     deadline: '2026-11-02', supplier: '华电科技' },

  // 外包服务费
  { id: 10, code: 'JS-2026-1130', contractNo: 'HT-2026-030', typeKey: 'outsource', typeLabel: '外包服务费', direction: 'payable',    amount: 68000,  settled: 68000,  pending: 0,     invoiceStatus: 'opened',  paymentStatus: 'paid',     deadline: '2026-11-08', supplier: '外包SUP-001 巡线队' },
  { id: 11, code: 'JS-2026-1131', contractNo: 'HT-2026-031', typeKey: 'outsource', typeLabel: '外包服务费', direction: 'payable',    amount: 156000, settled: 0,      pending: 156000, invoiceStatus: 'none',    paymentStatus: 'none',     deadline: '2026-11-30', supplier: '外包SUP-003 安装队' },
  { id: 12, code: 'JS-2026-1132', contractNo: 'HT-2026-032', typeKey: 'outsource', typeLabel: '外包服务费', direction: 'receivable', amount: 42000,  settled: 0,      pending: 42000,  invoiceStatus: 'none',    paymentStatus: 'none',     deadline: '2026-11-12', supplier: '外包SUP-005 故障应急' },
]

const ALL_ROWS = ref<SettlementRow[]>(MOCK_DATA)

// 更新各 Tab 数量
typeTabs.value = typeTabs.value.map(tab => {
  if (tab.key === 'all') return { ...tab, count: ALL_ROWS.value.length }
  return { ...tab, count: ALL_ROWS.value.filter(r => r.typeKey === tab.key).length }
})

// ============================================================
// 状态
// ============================================================
const activeType = ref('all')
const pager = reactive({ page: 1, size: 8 })
const filters = reactive({
  direction: '',
  settleStatus: '',
  invoiceStatus: '',
  paymentStatus: '',
  keyword: ''
})

// ============================================================
// 筛选后
// ============================================================
const filteredRows = computed(() => {
  let list = ALL_ROWS.value.slice()
  if (activeType.value !== 'all') list = list.filter(r => r.typeKey === activeType.value)
  if (filters.direction) list = list.filter(r => r.direction === filters.direction)
  if (filters.settleStatus === 'settled') list = list.filter(r => r.pending === 0)
  if (filters.settleStatus === 'pending') list = list.filter(r => r.pending > 0)
  if (filters.invoiceStatus) list = list.filter(r => r.invoiceStatus === filters.invoiceStatus)
  if (filters.paymentStatus) list = list.filter(r => r.paymentStatus === filters.paymentStatus)
  if (filters.keyword.trim()) {
    const kw = filters.keyword.trim().toLowerCase()
    list = list.filter(r =>
      r.code.toLowerCase().includes(kw) ||
      r.contractNo.toLowerCase().includes(kw) ||
      r.supplier.toLowerCase().includes(kw)
    )
  }
  const start = (pager.page - 1) * pager.size
  return list.slice(start, start + pager.size)
})

// ============================================================
// KPI
// ============================================================
function isOverdue(row: SettlementRow): boolean {
  // 已结完不算逾期
  if (row.pending === 0) return false
  const today = new Date('2026-11-16')
  const d = new Date(row.deadline)
  return d < today
}

const kpiAgg = computed(() => {
  // 本月应收 / 应付 / 待结单数 / 逾期（全局 12 条口径）
  const rows = ALL_ROWS.value
  const receivable = rows.filter(r => r.direction === 'receivable').reduce((a, r) => a + r.amount, 0)
  const payable = rows.filter(r => r.direction === 'payable').reduce((a, r) => a + r.amount, 0)
  const pendingCount = rows.filter(r => r.pending > 0).length
  const overdueCount = rows.filter(isOverdue).length
  return { receivable, payable, pendingCount, overdueCount }
})

const kpiCells = computed(() => [
  { key: 'receivable', label: '本月应收总额', value: '¥' + (kpiAgg.value.receivable / 10000).toFixed(1) + '万', icon: Coin,   theme: 'success' },
  { key: 'payable',    label: '本月应付总额', value: '¥' + (kpiAgg.value.payable / 10000).toFixed(1) + '万',    icon: Money,   theme: 'primary' },
  { key: 'pending',    label: '待结算单数',   value: kpiAgg.value.pendingCount + ' 笔',                          icon: Tickets, theme: 'info' },
  { key: 'overdue',    label: '逾期未结',     value: kpiAgg.value.overdueCount + ' 笔',                          icon: Warning, theme: 'warn' },
])

// ============================================================
// 工具
// ============================================================
function settlePct(row: SettlementRow): number {
  if (row.amount === 0) return 0
  return Math.round((row.settled / row.amount) * 100)
}
function typeTagColor(key: string): string {
  const map: Record<string, string> = { ops: '', power: 'warning', project: 'danger', outsource: 'info' }
  return map[key] || ''
}
function invoiceLabel(s: string): string {
  return { none: '未开', opened: '已开', redFlush: '红冲' }[s as 'none'] || s
}
function paymentLabel(s: string): string {
  return { none: '未付', partial: '部分', paid: '已付' }[s as 'none'] || s
}

// ============================================================
// 动作
// ============================================================
function onMonitorContract(row: SettlementRow) {
  ElMessage.info(`查看合同 ${row.contractNo}`)
}
function onMonitorDetail(row: SettlementRow) {
  ElMessage.info(`查看结算单详情 ${row.code}`)
}
function onOpenInvoice(row: SettlementRow) {
  ElMessageBox.confirm(`确认为结算单 ${row.code} 开具发票？`, '开票', {
    type: 'warning', confirmButtonText: '确认', cancelButtonText: '取消'
  }).then(() => {
    const target = ALL_ROWS.value.find(r => r.id === row.id)
    if (target) target.invoiceStatus = 'opened'
    ElMessage.success('开票成功')
  }).catch(() => {})
}
function onConfirmPaid(row: SettlementRow) {
  ElMessageBox.prompt('本次结款金额', '确认结款', {
    inputValue: String(row.pending),
    confirmButtonText: '确认', cancelButtonText: '取消'
  }).then(({ value }) => {
    const pay = Number(value)
    if (!pay || pay <= 0 || pay > row.pending) { ElMessage.warning('金额无效'); return }
    const target = ALL_ROWS.value.find(r => r.id === row.id)
    if (target) {
      target.settled += pay
      target.pending = target.amount - target.settled
      if (target.pending === 0) target.paymentStatus = 'paid'
      else target.paymentStatus = 'partial'
    }
    ElMessage.success(`结款成功 ¥${pay.toLocaleString()}`)
  }).catch(() => {})
}
</script>

<style scoped lang="scss">
/* ============================================================
   变量（与 AssetLedger 保持一致，CSS 前缀 zg-fc-）
   ============================================================ */
.zg-fc-center {
  --zg-brand-primary: var(--zg-amber-glow, #d97706);
  --zg-success: #059669;
  --zg-warning: #d97706;
  --zg-danger: #dc2626;
  --zg-info: #0284c7;
  --zg-success-soft: #d1fae5;
  --zg-warning-soft: #fef3c7;
  --zg-danger-soft: #fee2e2;
  --zg-info-soft: #e0f2fe;
  --zg-line-soft: rgba(241,245,249,0.8);
  --zg-line-strong: rgba(226,232,240,0.6);
  --zg-ink-primary: #18181b;
  --zg-ink-secondary: #52525b;
  --zg-ink-tertiary: #71717a;
  --zg-surface-card: #ffffff;
  --zg-surface-muted: #f8fafc;
  --zg-gradient-surface: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
  --zg-gradient-primary: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
  --zg-radius-sm: 6px;
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

/* KPI 卡 */
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
  &.primary::before { background: var(--zg-danger); }
  &__icon {
    width: 42px; height: 42px; border-radius: var(--zg-radius-md);
    background: var(--zg-brand-primary); color: #fff;
    display: flex; align-items: center; justify-content: center;
  }
  .success &__icon { background: var(--zg-success); }
  .info    &__icon { background: var(--zg-info); }
  .warn    &__icon { background: var(--zg-warning); }
  .primary &__icon { background: var(--zg-danger); }
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
}
.zg-filter-select { width: 160px; }
.zg-filter-input { width: 200px; }

.zg-fc-code { font-family: 'Geist Mono', ui-monospace, monospace; font-size: 12px; font-weight: 600; }

.zg-fc-dir {
  font-size: 12px; font-weight: 600; padding: 2px 10px;
  border-radius: var(--zg-radius-pill);
  &--in  { color: var(--zg-success); background: var(--zg-success-soft); }
  &--out { color: var(--zg-danger);  background: var(--zg-danger-soft); }
}

.zg-fc-amount {
  font-weight: 700; font-variant-numeric: tabular-nums;
  &--pos { color: var(--zg-success); }
  &--neg { color: var(--zg-danger); }
}

.zg-fc-settlebar {
  display: flex; flex-direction: column; gap: 4px; padding-right: 6px;
  &__text { font-size: 11px; color: var(--zg-ink-tertiary); font-variant-numeric: tabular-nums; }
}

.zg-status-pill {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 12px; padding: 2px 10px; border-radius: var(--zg-radius-pill);
  font-weight: 500;
  .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
  /* 开票状态 */
  &--none      { color: var(--zg-danger); background: var(--zg-danger-soft); }
  &--opened    { color: var(--zg-success); background: var(--zg-success-soft); }
  &--redFlush  { color: var(--zg-warning); background: var(--zg-warning-soft); }
  /* 付款状态 */
  &--partial   { color: var(--zg-warning); background: var(--zg-warning-soft); }
  &--paid      { color: var(--zg-success); background: var(--zg-success-soft); }
}

.zg-fc-overdue { color: var(--zg-danger); font-weight: 700; }
</style>
