<!--
  智光云枢 · 财务结算中心 · 发票管理
  - 双 Tab：销项开票（我方开出）/ 进项收票（供应商开给我）
  - 表格：发票号、类型、日期、购/销方、金额、税额、价税合计、状态、关联结算单
  - Mock 10 条，含已红冲 / 作废 / 已收 / 未开场景
-->
<template>
  <section class="zg-fc-invoice">
    <header class="zg-fc-invoice__head">
      <div class="zg-fc-invoice__headline">
        <div class="zg-fc-invoice__sigil"><el-icon :size="22"><Tickets /></el-icon></div>
        <div class="zg-fc-invoice__copy">
          <h1 class="zg-fc-invoice__title">发票管理</h1>
          <p class="zg-fc-invoice__sub">
            销项 {{ kpiAgg.outCount }} 张（红冲 {{ kpiAgg.outRed }}）·
            进项 {{ kpiAgg.inCount }} 张（已收 {{ kpiAgg.inReceived }}）·
            本月累计税额 ¥{{ (kpiAgg.totalTax / 10000).toFixed(2) }}万
          </p>
        </div>
      </div>
      <div class="zg-fc-invoice__cta">
        <el-button type="primary" :disabled="activeTab !== 'output'" @click="onCreateOutput">
          <el-icon><Plus /></el-icon>销项开票
        </el-button>
        <el-button :disabled="activeTab !== 'input'" @click="onReceiveInput">
          <el-icon><Upload /></el-icon>进项收票
        </el-button>
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
    <div class="zg-fc-invoice__kpi">
      <div v-for="cell in kpiCells" :key="cell.key" class="zg-kpi-cell" :class="cell.theme">
        <div class="zg-kpi-cell__icon"><el-icon :size="20"><component :is="cell.icon" /></el-icon></div>
        <div class="zg-kpi-cell__body">
          <span class="zg-kpi-cell__num">{{ cell.value }}</span>
          <span class="zg-kpi-cell__lbl">{{ cell.label }}</span>
        </div>
      </div>
    </div>

    <!-- 主体卡 -->
    <div class="zg-fc-invoice__main">
      <!-- 双 Tab -->
      <el-tabs v-model="activeTab" class="zg-fc-invoice__tabs">
        <el-tab-pane name="output">
          <template #label>
            <span class="zg-tab-label">
              <el-icon><Promotion /></el-icon>销项开票（我方开）
              <em class="zg-tab-count">{{ kpiAgg.outCount }}</em>
            </span>
          </template>
        </el-tab-pane>
        <el-tab-pane name="input">
          <template #label>
            <span class="zg-tab-label">
              <el-icon><Download /></el-icon>进项收票（供应商开我）
              <em class="zg-tab-count">{{ kpiAgg.inCount }}</em>
            </span>
          </template>
        </el-tab-pane>
      </el-tabs>

      <!-- 筛选条 -->
      <div class="zg-fc-invoice__filterbar">
        <div class="zg-filter-row">
          <div class="zg-filter-item">
            <span class="zg-filter-item__lbl">发票类型</span>
            <el-select v-model="filters.invoiceType" placeholder="全部" class="zg-filter-select">
              <el-option label="全部" value="" />
              <el-option label="增值税专用发票" value="vat-special" />
              <el-option label="增值税普通发票" value="vat-normal" />
            </el-select>
          </div>
          <div class="zg-filter-item">
            <span class="zg-filter-item__lbl">状态</span>
            <el-select v-model="filters.status" placeholder="全部" class="zg-filter-select">
              <el-option label="全部" value="" />
              <el-option label="未开" value="none" />
              <el-option label="已开" value="opened" />
              <el-option label="已收" value="received" />
              <el-option label="红冲" value="redFlush" />
              <el-option label="作废" value="void" />
            </el-select>
          </div>
          <div class="zg-filter-item">
            <span class="zg-filter-item__lbl">开票日期</span>
            <el-date-picker v-model="filters.dateRange" type="daterange"
              start-placeholder="起" end-placeholder="止" range-separator="至"
              value-format="YYYY-MM-DD" class="zg-filter-date" />
          </div>
          <div class="zg-filter-item">
            <span class="zg-filter-item__lbl">关键词</span>
            <el-input v-model="filters.keyword" placeholder="发票号 / 购方 / 销方" clearable class="zg-filter-input">
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
          </div>
        </div>
      </div>

      <!-- 表格 -->
      <div class="zg-fc-invoice__tablewrap">
        <el-table :data="filteredRows" stripe height="520">
          <el-table-column prop="invoiceNo" label="发票号" width="150" fixed="left">
            <template #default="{ row }">
              <span class="zg-fc-code">{{ row.invoiceNo }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="invoiceTypeLabel" label="发票类型" width="140" align="center">
            <template #default="{ row }">
              <el-tag size="small" :type="row.invoiceType === 'vat-special' ? 'primary' : 'info'" effect="plain">
                {{ row.invoiceTypeLabel }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="invoiceDate" label="开票日期" width="120" />
          <!-- 销项 Tab 显示购方，进项 Tab 显示销方 -->
          <el-table-column :label="activeTab === 'output' ? '购方（客户）' : '销方（供应商）'" width="200">
            <template #default="{ row }">
              <span v-if="activeTab === 'output'">{{ row.buyer }}</span>
              <span v-else>{{ row.seller }}</span>
            </template>
          </el-table-column>
          <!-- 销项 Tab 显示销方，进项 Tab 显示购方 -->
          <el-table-column :label="activeTab === 'output' ? '销方（我方）' : '购方（我方）'" width="180">
            <template #default="{ row }">
              <span v-if="activeTab === 'output'">{{ row.seller }}</span>
              <span v-else>{{ row.buyer }}</span>
            </template>
          </el-table-column>
          <el-table-column label="金额(元)" width="120" align="right">
            <template #default="{ row }">¥{{ row.amount.toLocaleString() }}</template>
          </el-table-column>
          <el-table-column label="税额(元)" width="120" align="right">
            <template #default="{ row }">
              <span class="zg-fc-tax">¥{{ row.tax.toLocaleString() }}</span>
            </template>
          </el-table-column>
          <el-table-column label="价税合计" width="140" align="right">
            <template #default="{ row }">
              <span class="zg-fc-total">¥{{ row.total.toLocaleString() }}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100" align="center">
            <template #default="{ row }">
              <span class="zg-status-pill" :class="'zg-status-pill--' + row.status">
                <i class="dot"></i>{{ statusLabel(row.status) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="refSettlement" label="关联结算单" width="160">
            <template #default="{ row }">
              <el-button link type="primary" size="small" v-if="row.refSettlement" @click="onMonitorSettlement(row)">{{ row.refSettlement }}</el-button>
              <span v-else class="zg-fc-muted">—</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" align="center" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="onMonitorDetail(row)">查看</el-button>
              <el-button link size="small" v-if="row.status === 'none' && activeTab === 'output'" @click="onIssue(row)">开具</el-button>
              <el-button link size="small" v-if="row.status === 'opened' && activeTab === 'input'" @click="onReceive(row)">收票</el-button>
              <el-button type="danger" link size="small" v-if="row.status === 'opened'" @click="onRedFlush(row)">红冲</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="zg-fc-invoice__pager">
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
import {
  Tickets, Plus, Download, Document, Files, Search, Upload,
  Coin, Money, Warning, Promotion
} from '@element-plus/icons-vue'

// ============================================================
// 类型
// ============================================================
interface InvoiceRow {
  id: number
  direction: 'output' | 'input'          // 销项 / 进项
  invoiceNo: string
  invoiceType: 'vat-special' | 'vat-normal'
  invoiceTypeLabel: string
  invoiceDate: string
  buyer: string                           // 购方
  seller: string                           // 销方
  amount: number                          // 不含税金额
  tax: number                             // 税额
  total: number                           // 价税合计
  taxRate: number                         // 税率
  status: 'none' | 'opened' | 'received' | 'redFlush' | 'void'
  refSettlement: string | null
}

// ============================================================
// Mock 数据 — 10 条
// ============================================================
const OUR_COMPANY = '智光云枢城市照明运营有限公司'

const ALL_INVOICES = ref<InvoiceRow[]>([
  // ===== 销项（我方开给客户） =====
  { id: 1, direction: 'output', invoiceNo: '251100123456', invoiceType: 'vat-special', invoiceTypeLabel: '增值税专用发票', invoiceDate: '2026-11-05', buyer: '长沙市政工程管理局',     seller: OUR_COMPANY, amount: 113274.34, tax: 14725.66, total: 128000, taxRate: 13, status: 'opened', refSettlement: 'JS-2026-1101' },
  { id: 2, direction: 'output', invoiceNo: '251100123457', invoiceType: 'vat-normal',   invoiceTypeLabel: '增值税普通发票', invoiceDate: '2026-11-08', buyer: '湖南电能源有限公司',       seller: OUR_COMPANY, amount: 37168.14,  tax: 4831.86,  total: 42000,   taxRate: 13, status: 'opened', refSettlement: 'JS-2026-1132' },
  { id: 3, direction: 'output', invoiceNo: '251100123458', invoiceType: 'vat-special', invoiceTypeLabel: '增值税专用发票', invoiceDate: '2026-11-10', buyer: '长沙高新区管委会',         seller: OUR_COMPANY, amount: 185840.71, tax: 24159.29, total: 210000, taxRate: 13, status: 'none',   refSettlement: 'JS-2026-1103' },
  { id: 4, direction: 'output', invoiceNo: '251100123459', invoiceType: 'vat-normal',   invoiceTypeLabel: '增值税普通发票', invoiceDate: '2026-11-12', buyer: '长沙市政工程管理局',     seller: OUR_COMPANY, amount: 953274.34, tax: 123425.66,total: 1076700, taxRate: 13, status: 'redFlush', refSettlement: 'JS-2026-1121' },
  { id: 5, direction: 'output', invoiceNo: '251100123460', invoiceType: 'vat-special', invoiceTypeLabel: '增值税专用发票', invoiceDate: '2026-11-14', buyer: '麓谷高科技产业园',           seller: OUR_COMPANY, amount: 56637.17,  tax: 7362.83,  total: 64000,   taxRate: 13, status: 'void',   refSettlement: 'JS-2026-1130' },

  // ===== 进项（供应商开给我方） =====
  { id: 6, direction: 'input', invoiceNo: '251100234567', invoiceType: 'vat-special', invoiceTypeLabel: '增值税专用发票', invoiceDate: '2026-11-02', buyer: OUR_COMPANY, seller: '长沙照明运维队 SUP-002',  amount: 84955.75,  tax: 11044.25, total: 96000,  taxRate: 13, status: 'opened', refSettlement: 'JS-2026-1102' },
  { id: 7, direction: 'input', invoiceNo: '251100234568', invoiceType: 'vat-normal',   invoiceTypeLabel: '增值税普通发票', invoiceDate: '2026-11-04', buyer: OUR_COMPANY, seller: '国网湖南省电力公司 SUP-004', amount: 315752.21, tax: 41047.79, total: 356800, taxRate: 13, status: 'received', refSettlement: 'JS-2026-1110' },
  { id: 8, direction: 'input', invoiceNo: '251100234569', invoiceType: 'vat-special', invoiceTypeLabel: '增值税专用发票', invoiceDate: '2026-11-06', buyer: OUR_COMPANY, seller: '中电建光电 SUP-001',      amount: 513274.34, tax: 66725.66, total: 580000, taxRate: 13, status: 'none',   refSettlement: 'JS-2026-1120' },
  { id: 9, direction: 'input', invoiceNo: '251100234570', invoiceType: 'vat-normal',   invoiceTypeLabel: '增值税普通发票', invoiceDate: '2026-11-09', buyer: OUR_COMPANY, seller: '华电科技 SUP-006',        amount: 283185.84, tax: 36814.16, total: 320000, taxRate: 13, status: 'received', refSettlement: 'JS-2026-1122' },
  { id: 10, direction: 'input', invoiceNo: '251100234571', invoiceType: 'vat-special', invoiceTypeLabel: '增值税专用发票', invoiceDate: '2026-11-13', buyer: OUR_COMPANY, seller: '外包 SUP-003 安装队',      amount: 138053.10, tax: 17946.90, total: 156000, taxRate: 13, status: 'redFlush', refSettlement: 'JS-2026-1131' },
])

// ============================================================
// 状态
// ============================================================
const activeTab = ref<'output' | 'input'>('output')
const pager = reactive({ page: 1, size: 8 })
const filters = reactive({
  invoiceType: '',
  status: '',
  dateRange: [] as string[],
  keyword: ''
})

// ============================================================
// 筛选后
// ============================================================
const filteredRows = computed(() => {
  let list = ALL_INVOICES.value.filter(r => r.direction === activeTab.value)
  if (filters.invoiceType) list = list.filter(r => r.invoiceType === filters.invoiceType)
  if (filters.status) list = list.filter(r => r.status === filters.status)
  if (filters.dateRange.length === 2) {
    list = list.filter(r => r.invoiceDate >= filters.dateRange[0] && r.invoiceDate <= filters.dateRange[1])
  }
  if (filters.keyword.trim()) {
    const kw = filters.keyword.trim().toLowerCase()
    list = list.filter(r =>
      r.invoiceNo.toLowerCase().includes(kw) ||
      r.buyer.toLowerCase().includes(kw) ||
      r.seller.toLowerCase().includes(kw)
    )
  }
  const start = (pager.page - 1) * pager.size
  return list.slice(start, start + pager.size)
})

// ============================================================
// KPI
// ============================================================
const kpiAgg = computed(() => {
  const outRows = ALL_INVOICES.value.filter(r => r.direction === 'output')
  const inRows = ALL_INVOICES.value.filter(r => r.direction === 'input')
  return {
    outCount: outRows.length,
    outRed: outRows.filter(r => r.status === 'redFlush').length,
    inCount: inRows.length,
    inReceived: inRows.filter(r => r.status === 'received').length,
    totalTax: ALL_INVOICES.value.reduce((a, r) => a + r.tax, 0),
    outAmount: outRows.reduce((a, r) => a + r.total, 0),
    inAmount: inRows.reduce((a, r) => a + r.total, 0),
  }
})

const kpiCells = computed(() => [
  { key: 'out',   label: '销项价税合计', value: '¥' + (kpiAgg.value.outAmount / 10000).toFixed(1) + '万', icon: Coin,    theme: 'success' },
  { key: 'in',    label: '进项价税合计', value: '¥' + (kpiAgg.value.inAmount / 10000).toFixed(1) + '万',  icon: Money,    theme: 'primary' },
  { key: 'count', label: '本月开票张数', value: ALL_INVOICES.value.filter(r => r.status !== 'none').length + ' 张', icon: Tickets, theme: 'info' },
  { key: 'red',   label: '红冲 / 作废',  value: ALL_INVOICES.value.filter(r => r.status === 'redFlush' || r.status === 'void').length + ' 张', icon: Warning, theme: 'warn' },
])

// ============================================================
// 工具
// ============================================================
function statusLabel(s: string): string {
  return { none: '未开', opened: '已开', received: '已收', redFlush: '红冲', void: '作废' }[s as 'none'] || s
}

// ============================================================
// 动作
// ============================================================
function onMonitorDetail(row: InvoiceRow) {
  ElMessage.info(`查看发票 ${row.invoiceNo}`)
}
function onMonitorSettlement(row: InvoiceRow) {
  ElMessage.info(`跳转结算单 ${row.refSettlement}`)
}
function onIssue(row: InvoiceRow) {
  ElMessageBox.confirm(`确认开具发票 ${row.invoiceNo}？`, '销项开票', {
    type: 'warning', confirmButtonText: '确认', cancelButtonText: '取消'
  }).then(() => {
    const target = ALL_INVOICES.value.find(r => r.id === row.id)
    if (target) { target.status = 'opened'; target.invoiceDate = new Date().toISOString().slice(0, 10) }
    ElMessage.success('开票成功')
  }).catch(() => {})
}
function onReceive(row: InvoiceRow) {
  ElMessageBox.confirm(`确认已收到发票 ${row.invoiceNo}？`, '进项收票', {
    type: 'warning', confirmButtonText: '确认', cancelButtonText: '取消'
  }).then(() => {
    const target = ALL_INVOICES.value.find(r => r.id === row.id)
    if (target) target.status = 'received'
    ElMessage.success('收票确认')
  }).catch(() => {})
}
function onRedFlush(row: InvoiceRow) {
  ElMessageBox.confirm(`确认对 ${row.invoiceNo} 进行红冲？红冲后将生成一张负值发票`, '红冲', {
    type: 'warning', confirmButtonText: '确认红冲', cancelButtonText: '取消'
  }).then(() => {
    const target = ALL_INVOICES.value.find(r => r.id === row.id)
    if (target) target.status = 'redFlush'
    ElMessage.success('红冲成功，已生成对应红字发票')
  }).catch(() => {})
}
function onCreateOutput() { ElMessage.info('新建销项开票表单…') }
function onReceiveInput() { ElMessage.info('录入进项发票信息…') }
</script>

<style scoped lang="scss">
.zg-fc-invoice {
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
.zg-filter-select { width: 180px; }
.zg-filter-input { width: 220px; }
.zg-filter-date { width: 300px; }

.zg-fc-code { font-family: 'Geist Mono', ui-monospace, monospace; font-size: 12px; font-weight: 600; color: var(--zg-brand-primary); }
.zg-fc-tax { color: var(--zg-warning); font-weight: 600; font-variant-numeric: tabular-nums; }
.zg-fc-total { color: var(--zg-success); font-weight: 700; font-variant-numeric: tabular-nums; }
.zg-fc-muted { color: #cbd5e1; }

.zg-status-pill {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 12px; padding: 2px 10px; border-radius: var(--zg-radius-pill);
  font-weight: 500;
  .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
  &--none     { color: var(--zg-danger); background: var(--zg-danger-soft); }
  &--opened   { color: var(--zg-success); background: var(--zg-success-soft); }
  &--received { color: var(--zg-success); background: var(--zg-success-soft); }
  &--redFlush { color: var(--zg-warning); background: var(--zg-warning-soft); }
  &--void     { color: var(--zg-ink-tertiary); background: #f1f5f9; text-decoration: line-through; }
}
</style>
