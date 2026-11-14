<!--
  智光云枢 · 用电申请扩展 · 电费结算
  业务域：powerApply
  功能：电费结算单列表，结算类型（预付/后付/包干）、状态（待付/部分/已付/欠费）、发票管理
-->
<template>
  <section class="zg-settlement">
    <header class="zg-settlement__head">
      <div class="zg-settlement__headline">
        <div class="zg-settlement__sigil">
          <el-icon :size="22"><Coin /></el-icon>
        </div>
        <div class="zg-settlement__copy">
          <h1 class="zg-settlement__title">电费结算</h1>
          <p class="zg-settlement__sub">预付 / 后付 / 包干 · 结算状态跟踪 · 发票管理</p>
        </div>
      </div>
      <div class="zg-settlement__cta">
        <el-select v-model="year" placeholder="年份" style="width: 120px">
          <el-option label="2026 年" value="2026" />
          <el-option label="2025 年" value="2025" />
        </el-select>
        <el-button type="primary"><el-icon><Plus /></el-icon><span>创建结算单</span></el-button>
      </div>
    </header>

    <!-- 指标卡 -->
    <div class="zg-metrics">
      <div class="zg-metrics__cell">
        <span class="zg-metrics__num">{{ kpi.totalCount }}</span>
        <span class="zg-metrics__lbl">结算单总数</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--primary">
        <span class="zg-metrics__num">¥{{ (kpi.totalAmount / 10000).toFixed(2) }}<em>万</em></span>
        <span class="zg-metrics__lbl">结算总额</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--success">
        <span class="zg-metrics__num">¥{{ (kpi.paidAmount / 10000).toFixed(2) }}<em>万</em></span>
        <span class="zg-metrics__lbl">已付金额</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <span class="zg-metrics__num">¥{{ ((kpi.totalAmount - kpi.paidAmount) / 10000).toFixed(2) }}<em>万</em></span>
        <span class="zg-metrics__lbl">待收金额</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--danger">
        <span class="zg-metrics__num">{{ kpi.overdueCount }}</span>
        <span class="zg-metrics__lbl">欠费单据</span>
      </div>
    </div>

    <!-- 状态分布 -->
    <div class="zg-status-summary">
      <div v-for="(s, i) in statusSummary" :key="i" class="zg-status-summary__item">
        <div class="zg-status-summary__bar" :class="'is-' + s.key" :style="{ height: s.pct + '%' }"></div>
        <span class="zg-status-summary__lbl">{{ s.label }}</span>
        <span class="zg-status-summary__val">{{ s.count }}</span>
      </div>
    </div>

    <!-- 过滤工具栏 -->
    <div class="zg-filterband">
      <div class="zg-filterband__row">
        <el-input v-model="filter.keyword" placeholder="搜索结算号 / 月 / 类型" clearable style="width: 260px">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-select v-model="filter.type" placeholder="结算类型" style="width: 130px" clearable>
          <el-option label="预付" value="预付" />
          <el-option label="后付" value="后付" />
          <el-option label="包干" value="包干" />
        </el-select>
        <el-select v-model="filter.status" placeholder="结算状态" style="width: 130px" clearable>
          <el-option label="待付" value="待付" />
          <el-option label="部分付" value="部分付" />
          <el-option label="已付清" value="已付清" />
          <el-option label="欠费" value="欠费" />
        </el-select>
      </div>
    </div>

    <!-- 结算单表格 -->
    <div class="zg-panel">
      <el-table :data="filteredSettlements" stripe border size="small" class="zg-datatable">
        <el-table-column prop="settlementNo" label="结算号" width="160" fixed>
          <template #default="{ row }"><span class="zg-code">{{ row.settlementNo }}</span></template>
        </el-table-column>
        <el-table-column prop="month" label="结算月份" width="110" align="center">
          <template #default="{ row }">{{ row.month.slice(0, 4) }}-{{ row.month.slice(4) }}</template>
        </el-table-column>
        <el-table-column label="结算类型" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="typeTagType(row.type)" size="small">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="总额(元)" width="140" align="right">
          <template #default="{ row }"><span class="font-mono font-bold">¥{{ row.totalAmount.toLocaleString() }}</span></template>
        </el-table-column>
        <el-table-column label="已付(元)" width="140" align="right">
          <template #default="{ row }">
            <span class="font-mono" :class="{ 'text-emerald-600 font-semibold': row.paidAmount === row.totalAmount }">
              ¥{{ row.paidAmount.toLocaleString() }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="支付进度" width="160">
          <template #default="{ row }">
            <el-progress :percentage="Math.round(row.paidAmount / row.totalAmount * 100)" :stroke-width="10"
              :color="payColor(row)" />
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <span class="zg-settle-status" :class="'zg-settle-status--' + row.status">
              <i class="dot"></i>{{ row.status }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="invoiceNo" label="发票号" width="160" show-overflow-tooltip />
        <el-table-column prop="invoiceDate" label="开票日期" width="120" />
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small">详情</el-button>
            <el-button link type="primary" size="small" :disabled="row.status === '已付清'">付款</el-button>
            <el-button link type="primary" size="small">开票</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="zg-pagerbar">
        <el-pagination background :total="filteredSettlements.length" :page-size="15"
          layout="prev, pager, next, jumper, ->, sizes, total" />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Coin, Plus, Search } from "@element-plus/icons-vue"

const year = ref('2026')
const filter = reactive({ keyword: '', type: '', status: '' })

const kpi = ref({ totalCount: 86, totalAmount: 4925680, paidAmount: 4123500, overdueCount: 5 })

const statusSummary = ref([
  { key: 'pending', label: '待付', count: 12, pct: 45 },
  { key: 'partial', label: '部分', count: 18, pct: 68 },
  { key: 'paid', label: '已付清', count: 51, pct: 100 },
  { key: 'overdue', label: '欠费', count: 5, pct: 22 }
])

// 结算单 mock - 14 条
const settlements = ref([
  { settlementNo: 'STL-2026110001', month: '202610', type: '后付', totalAmount: 586320, paidAmount: 586320, status: '已付清', invoiceNo: 'INV-202611-001', invoiceDate: '2026-11-10' },
  { settlementNo: 'STL-2026110002', month: '202610', type: '后付', totalAmount: 425680, paidAmount: 425680, status: '已付清', invoiceNo: 'INV-202611-002', invoiceDate: '2026-11-10' },
  { settlementNo: 'STL-2026110003', month: '202610', type: '预付', totalAmount: 368500, paidAmount: 368500, status: '已付清', invoiceNo: 'INV-202611-003', invoiceDate: '2026-11-12' },
  { settlementNo: 'STL-2026110004', month: '202610', type: '包干', totalAmount: 285000, paidAmount: 150000, status: '部分付', invoiceNo: 'INV-202611-004', invoiceDate: '2026-11-08' },
  { settlementNo: 'STL-2026110005', month: '202610', type: '后付', totalAmount: 625300, paidAmount: 625300, status: '已付清', invoiceNo: 'INV-202611-005', invoiceDate: '2026-11-15' },
  { settlementNo: 'STL-2026110006', month: '202610', type: '预付', totalAmount: 198000, paidAmount: 0, status: '待付', invoiceNo: '', invoiceDate: '' },
  { settlementNo: 'STL-2026110007', month: '202609', type: '后付', totalAmount: 512450, paidAmount: 512450, status: '已付清', invoiceNo: 'INV-202610-001', invoiceDate: '2026-10-12' },
  { settlementNo: 'STL-2026110008', month: '202609', type: '包干', totalAmount: 285000, paidAmount: 285000, status: '已付清', invoiceNo: 'INV-202610-002', invoiceDate: '2026-10-15' },
  { settlementNo: 'STL-2026110009', month: '202609', type: '后付', totalAmount: 458200, paidAmount: 300000, status: '部分付', invoiceNo: 'INV-202610-003', invoiceDate: '2026-10-18' },
  { settlementNo: 'STL-2026110010', month: '202609', type: '预付', totalAmount: 225600, paidAmount: 0, status: '欠费', invoiceNo: '', invoiceDate: '' },
  { settlementNo: 'STL-2026110011', month: '202608', type: '后付', totalAmount: 586300, paidAmount: 586300, status: '已付清', invoiceNo: 'INV-202609-001', invoiceDate: '2026-09-12' },
  { settlementNo: 'STL-2026110012', month: '202608', type: '包干', totalAmount: 285000, paidAmount: 285000, status: '已付清', invoiceNo: 'INV-202609-002', invoiceDate: '2026-09-15' },
  { settlementNo: 'STL-2026110013', month: '202608', type: '后付', totalAmount: 492350, paidAmount: 0, status: '欠费', invoiceNo: '', invoiceDate: '' },
  { settlementNo: 'STL-2026110014', month: '202611', type: '后付', totalAmount: 528450, paidAmount: 0, status: '待付', invoiceNo: '', invoiceDate: '' }
])

const filteredSettlements = computed(() => {
  return settlements.value.filter(s => {
    const matchKw = !filter.keyword.trim() ||
      s.settlementNo.includes(filter.keyword) || s.month.includes(filter.keyword) || s.type.includes(filter.keyword)
    const matchType = !filter.type || s.type === filter.type
    const matchStatus = !filter.status || s.status === filter.status
    return matchKw && matchType && matchStatus
  })
})

function typeTagType(t) {
  if (t === '预付') return 'primary'
  if (t === '后付') return 'success'
  return 'warning'
}
function payColor(row) {
  const pct = Math.round(row.paidAmount / row.totalAmount * 100)
  if (pct === 100) return '#059669'
  if (pct === 0) return '#dc2626'
  return '#f59e0b'
}
</script>

<style scoped lang="scss">
.zg-settlement {
  padding: 24px;
  &__head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 18px; padding-bottom: 18px; border-bottom: 1px solid #e2e8f0; }
  &__headline { display: flex; align-items: center; gap: 14px; }
  &__sigil { width: 44px; height: 44px; border-radius: 10px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; display: flex; align-items: center; justify-content: center; }
  &__copy { display: flex; flex-direction: column; gap: 4px; }
  &__title { font-size: 20px; font-weight: 600; margin: 0; color: #18181b; }
  &__sub { font-size: 13px; color: #71717a; margin: 0; }
  &__cta { display: flex; gap: 10px; align-items: center; }
}

.zg-metrics {
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; margin-bottom: 16px;
  &__cell { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px 18px; display: flex; flex-direction: column; gap: 6px; box-shadow: 0 1px 3px rgba(15,23,42,0.04); position: relative; overflow: hidden;
    &::before { content: ''; position: absolute; left: 0; top: 0; width: 3px; height: 100%; background: #6366f1; }
    &--primary::before { background: #6366f1; }
    &--success::before { background: #059669; }
    &--warn::before { background: #d97706; }
    &--danger::before { background: #dc2626; }
  }
  &__num { font-size: 24px; font-weight: 700; color: #18181b; line-height: 1; em { font-style: normal; font-size: 13px; color: #71717a; margin-left: 4px; font-weight: 400; } }
  &__lbl { font-size: 12px; color: #71717a; }
}

.zg-status-summary {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px;
  &__item {
    display: flex; flex-direction: column; align-items: center; gap: 6px;
    padding: 14px 10px; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px;
  }
  &__bar {
    width: 36px; height: 100px; border-radius: 6px 6px 0 0;
    &.is-pending { background: linear-gradient(180deg, #0ea5e9, #38bdf8); }
    &.is-partial { background: linear-gradient(180deg, #d97706, #fbbf24); }
    &.is-paid { background: linear-gradient(180deg, #059669, #34d399); }
    &.is-overdue { background: linear-gradient(180deg, #dc2626, #f87171); }
  }
  &__lbl { font-size: 12px; color: #71717a; font-weight: 500; }
  &__val { font-size: 18px; font-weight: 700; color: #18181b; }
}

.zg-filterband { padding: 14px 16px; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 16px;
  &__row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
}

.zg-panel { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 18px; }

.zg-code { font-family: ui-monospace, monospace; font-size: 12px; font-weight: 600; color: #6366f1; }

.zg-settle-status {
  display: inline-flex; align-items: center; gap: 5px; font-size: 12px; padding: 2px 8px; border-radius: 999px;
  .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
  &--已付清 { color: #059669; background: #d1fae5; }
  &--待付 { color: #0ea5e9; background: #e0f2fe; }
  &--部分付 { color: #d97706; background: #fef3c7; }
  &--欠费 { color: #dc2626; background: #fee2e2; animation: pulse 1.5s infinite; }
}
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }

.font-mono { font-family: ui-monospace, monospace; }
.font-bold { font-weight: 700; }
.text-emerald-600 { color: #059669; }
.font-semibold { font-weight: 600; }

.zg-pagerbar { display: flex; justify-content: flex-end; padding-top: 14px; }
</style>
