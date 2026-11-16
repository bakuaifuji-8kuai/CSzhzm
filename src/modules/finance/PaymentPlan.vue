<!--
  智光云枢 · 财务结算中心 · 收付款计划
  - 左侧时间轴（12 月），右侧月度收付款柱状图
  - 下方表格：计划日期、类型、金额、关联合同、对方单位、状态、实际执行日期
  - Mock 12 条，每月 1-2 笔
-->
<template>
  <section class="zg-fc-plan">
    <header class="zg-fc-plan__head">
      <div class="zg-fc-plan__headline">
        <div class="zg-fc-plan__sigil"><el-icon :size="22"><Calendar /></el-icon></div>
        <div class="zg-fc-plan__copy">
          <h1 class="zg-fc-plan__title">收付款计划</h1>
          <p class="zg-fc-plan__sub">
            12 月滚动计划 · 本月计划 {{ monthlySummary.receivable + monthlySummary.payable }} 笔 ·
            收款 ¥{{ (monthlySummary.receivableAmt / 10000).toFixed(1) }}万 ·
            付款 ¥{{ (monthlySummary.payableAmt / 10000).toFixed(1) }}万
          </p>
        </div>
      </div>
      <div class="zg-fc-plan__cta">
        <el-button type="primary"><el-icon><Plus /></el-icon>新建计划</el-button>
        <el-button plain><el-icon><Bell /></el-icon>提醒设置</el-button>
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
    <div class="zg-fc-plan__kpi">
      <div v-for="cell in kpiCells" :key="cell.key" class="zg-kpi-cell" :class="cell.theme">
        <div class="zg-kpi-cell__icon"><el-icon :size="20"><component :is="cell.icon" /></el-icon></div>
        <div class="zg-kpi-cell__body">
          <span class="zg-kpi-cell__num">{{ cell.value }}</span>
          <span class="zg-kpi-cell__lbl">{{ cell.label }}</span>
        </div>
      </div>
    </div>

    <!-- 时间轴 + 柱状图 并排 -->
    <div class="zg-fc-plan__main">
      <!-- 左：12 月时间轴 -->
      <div class="zg-fc-plan__timeline">
        <div class="zg-fc-plan__panel-head">
          <span class="zg-fc-plan__panel-title">月度时间轴</span>
          <span class="zg-fc-plan__panel-sub">2026 年度 · 点击月份筛选下方表格</span>
        </div>
        <div class="zg-fc-plan__months">
          <div
            v-for="m in monthList"
            :key="m.key"
            class="zg-fc-plan__month"
            :class="{ active: selectedMonth === m.key, 'has-pending': m.pendingCount > 0 }"
            @click="selectedMonth = m.key"
          >
            <div class="zg-fc-plan__month-name">{{ m.label }}</div>
            <div class="zg-fc-plan__month-year">2026</div>
            <div class="zg-fc-plan__month-stats">
              <span class="zg-fc-plan__m-in">收 ¥{{ (m.receivableAmt / 10000).toFixed(0) }}万</span>
              <span class="zg-fc-plan__m-out">付 ¥{{ (m.payableAmt / 10000).toFixed(0) }}万</span>
            </div>
            <el-badge v-if="m.overdueCount > 0" :value="m.overdueCount" class="zg-fc-plan__overdue-badge" />
          </div>
        </div>
      </div>

      <!-- 右：柱状图 -->
      <div class="zg-fc-plan__chart">
        <div class="zg-fc-plan__panel-head">
          <span class="zg-fc-plan__panel-title">月度收付款汇总（万元）</span>
          <span class="zg-fc-plan__panel-sub">应收 vs 应付 · 12 个月趋势</span>
        </div>
        <v-chart class="zg-fc-echart" :option="barOption" autoresize />
      </div>
    </div>

    <!-- 表格 -->
    <div class="zg-fc-plan__tablecard">
      <div class="zg-fc-plan__panel-head">
        <span class="zg-fc-plan__panel-title">收付款计划明细</span>
        <div class="zg-fc-plan__table-filter">
          <el-radio-group v-model="detailDirection" size="small">
            <el-radio-button value="">全部</el-radio-button>
            <el-radio-button value="receive">收款</el-radio-button>
            <el-radio-button value="pay">付款</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <div class="zg-fc-plan__tablewrap">
        <el-table :data="filteredDetailRows" stripe height="480">
          <el-table-column prop="planDate" label="计划日期" width="120" fixed="left">
            <template #default="{ row }">
              <div class="zg-fc-plan__date">
                <span class="zg-fc-plan__day">{{ dayOf(row.planDate) }}</span>
                <span class="zg-fc-plan__month-tag">{{ monthOf(row.planDate) }}月</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="类型" width="100" align="center">
            <template #default="{ row }">
              <span :class="row.direction === 'receive' ? 'zg-fc-dir zg-fc-dir--in' : 'zg-fc-dir zg-fc-dir--out'">
                {{ row.direction === 'receive' ? '收款' : '付款' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="金额(元)" width="140" align="right">
            <template #default="{ row }">
              <span class="zg-fc-amount" :class="row.direction === 'receive' ? 'zg-fc-amount--pos' : 'zg-fc-amount--neg'">
                {{ row.direction === 'receive' ? '+' : '-' }}¥{{ row.amount.toLocaleString() }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="contractNo" label="关联合同" width="150">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="onMonitorContract(row)">{{ row.contractNo }}</el-button>
            </template>
          </el-table-column>
          <el-table-column prop="counterParty" label="对方单位" width="200" show-overflow-tooltip />
          <el-table-column prop="purpose" label="计划用途" width="180">
            <template #default="{ row }">
              <el-tag size="small" effect="plain">{{ row.purpose }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="110" align="center">
            <template #default="{ row }">
              <span class="zg-status-pill" :class="'zg-status-pill--' + row.status">
                <i class="dot"></i>{{ planStatusLabel(row.status) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="actualDate" label="实际执行日期" width="130">
            <template #default="{ row }">
              <span v-if="row.actualDate" class="zg-fc-actual">{{ row.actualDate }}</span>
              <span v-else class="zg-fc-muted">—</span>
            </template>
          </el-table-column>
          <el-table-column label="进度" width="180">
            <template #default="{ row }">
              <el-progress
                :percentage="row.status === 'executed' ? 100 : row.status === 'overdue' ? 100 : 0"
                :stroke-width="6"
                :color="row.status === 'executed' ? '#059669' : row.status === 'overdue' ? '#dc2626' : '#cbd5e1'"
                :show-text="false"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" align="center" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="onMonitorDetail(row)">详情</el-button>
              <el-button link size="small" v-if="row.status === 'pending'" @click="onExecute(row)">执行</el-button>
              <el-button type="warning" link size="small" v-if="row.status === 'pending' || row.status === 'overdue'" @click="onPostpone(row)">延期</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="zg-fc-plan__pager">
        <el-pagination v-model:current-page="pager.page" v-model:page-size="pager.size"
          :total="filteredDetailRows.length" :page-sizes="[8, 15, 30]"
          layout="prev, pager, next, jumper, ->, sizes, total" background />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, computed, h } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent } from 'echarts/components'
import {
  Calendar, Plus, Download, Document, Files, Bell,
  Coin, Money, Tickets, Warning
} from '@element-plus/icons-vue'

// 注册 echarts 模块
use([CanvasRenderer, BarChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent])

// ============================================================
// 类型
// ============================================================
interface PlanRow {
  id: number
  planDate: string                    // 计划执行日期 YYYY-MM-DD
  direction: 'receive' | 'pay'        // 收 / 付
  amount: number
  contractNo: string
  counterParty: string
  purpose: string
  status: 'pending' | 'executed' | 'overdue'
  actualDate: string | null
}

// ============================================================
// Mock 数据 — 12 条，每月 1-2 笔
// ============================================================
const DETAIL_ROWS = ref<PlanRow[]>([
  // 1 月
  { id: 1,  planDate: '2026-01-15', direction: 'pay',     amount: 356800,  contractNo: 'HT-2026-010', counterParty: '国网湖南省电力公司',       purpose: '电费结算',       status: 'executed', actualDate: '2026-01-14' },
  { id: 2,  planDate: '2026-01-22', direction: 'receive', amount: 128000,  contractNo: 'HT-2026-001', counterParty: '长沙市政工程管理局',     purpose: '运维服务费',     status: 'executed', actualDate: '2026-01-25' },
  // 2 月
  { id: 3,  planDate: '2026-02-18', direction: 'pay',     amount: 96000,   contractNo: 'HT-2026-003', counterParty: '长沙照明运维队 SUP-002',  purpose: '外包运维',       status: 'executed', actualDate: '2026-02-20' },
  // 3 月
  { id: 4,  planDate: '2026-03-10', direction: 'receive', amount: 210000,  contractNo: 'HT-2026-005', counterParty: '长沙高新区管委会',         purpose: '运维服务费',     status: 'executed', actualDate: '2026-03-12' },
  { id: 5,  planDate: '2026-03-28', direction: 'pay',     amount: 580000,  contractNo: 'HT-2026-020', counterParty: '中电建光电 SUP-001',      purpose: '里程碑工程款',   status: 'executed', actualDate: '2026-03-28' },
  // 5 月
  { id: 6,  planDate: '2026-05-15', direction: 'receive', amount: 124500,  contractNo: 'HT-2026-011', counterParty: '湖南电能源有限公司',       purpose: '节电收益分成',   status: 'overdue',  actualDate: null },
  // 7 月
  { id: 7,  planDate: '2026-07-20', direction: 'pay',     amount: 320000,  contractNo: 'HT-2026-022', counterParty: '华电科技 SUP-006',        purpose: '灯具采购款',     status: 'executed', actualDate: '2026-07-19' },
  // 9 月
  { id: 8,  planDate: '2026-09-10', direction: 'pay',     amount: 68000,   contractNo: 'HT-2026-030', counterParty: '外包 SUP-001 巡线队',      purpose: '外包服务费',     status: 'executed', actualDate: '2026-09-09' },
  // 11 月（本月）
  { id: 9,  planDate: '2026-11-10', direction: 'pay',     amount: 356800,  contractNo: 'HT-2026-010', counterParty: '国网湖南省电力公司',       purpose: '10 月电费',      status: 'executed', actualDate: '2026-11-09' },
  { id: 10, planDate: '2026-11-20', direction: 'receive', amount: 210000,  contractNo: 'HT-2026-005', counterParty: '长沙高新区管委会',         purpose: 'Q4 运维服务费',  status: 'pending',  actualDate: null },
  { id: 11, planDate: '2026-11-28', direction: 'pay',     amount: 298400,  contractNo: 'HT-2026-010', counterParty: '国网湖南省电力公司',       purpose: '11 月电费预付款', status: 'pending', actualDate: null },
  // 12 月
  { id: 12, planDate: '2026-12-15', direction: 'receive', amount: 1250000, contractNo: 'HT-2026-021', counterParty: '长沙市政工程管理局',     purpose: '道路照明工程款', status: 'pending', actualDate: null },
])

// ============================================================
// 12 月列表 & 月度汇总
// ============================================================
const monthList = computed(() => {
  const list = []
  for (let m = 1; m <= 12; m++) {
    const pad = (n: number) => String(n).padStart(2, '0')
    const key = pad(m)
    const rows = DETAIL_ROWS.value.filter(r => r.planDate.startsWith(`2026-${key}`))
    list.push({
      key,
      label: `${m}月`,
      receivableAmt: rows.filter(r => r.direction === 'receive').reduce((a, r) => a + r.amount, 0),
      payableAmt: rows.filter(r => r.direction === 'pay').reduce((a, r) => a + r.amount, 0),
      pendingCount: rows.filter(r => r.status === 'pending').length,
      overdueCount: rows.filter(r => r.status === 'overdue').length,
      totalCount: rows.length,
    })
  }
  return list
})

// ============================================================
// 状态
// ============================================================
const selectedMonth = ref('11')  // 默认选中 11 月
const detailDirection = ref('')
const pager = reactive({ page: 1, size: 8 })

// ============================================================
// 筛选后
// ============================================================
const filteredDetailRows = computed(() => {
  let list = DETAIL_ROWS.value.slice()
  if (selectedMonth.value) list = list.filter(r => r.planDate.startsWith(`2026-${selectedMonth.value}`))
  if (detailDirection.value) list = list.filter(r => r.direction === detailDirection.value)
  list.sort((a, b) => a.planDate.localeCompare(b.planDate))
  const start = (pager.page - 1) * pager.size
  return list.slice(start, start + pager.size)
})

// ============================================================
// KPI
// ============================================================
const monthlySummary = computed(() => {
  const rows = DETAIL_ROWS.value.filter(r => r.planDate.startsWith(`2026-${selectedMonth.value}`))
  return {
    receivable: rows.filter(r => r.direction === 'receive').length,
    payable: rows.filter(r => r.direction === 'pay').length,
    receivableAmt: rows.filter(r => r.direction === 'receive').reduce((a, r) => a + r.amount, 0),
    payableAmt: rows.filter(r => r.direction === 'pay').reduce((a, r) => a + r.amount, 0),
  }
})

const annualSummary = computed(() => ({
  receiveAmt: DETAIL_ROWS.value.filter(r => r.direction === 'receive').reduce((a, r) => a + r.amount, 0),
  payAmt: DETAIL_ROWS.value.filter(r => r.direction === 'pay').reduce((a, r) => a + r.amount, 0),
  overdueCount: DETAIL_ROWS.value.filter(r => r.status === 'overdue').length,
  pendingCount: DETAIL_ROWS.value.filter(r => r.status === 'pending').length,
}))

const kpiCells = computed(() => [
  { key: 'receive', label: '年度计划收款', value: '¥' + (annualSummary.value.receiveAmt / 10000).toFixed(1) + '万', icon: Coin,    theme: 'success' },
  { key: 'pay',    label: '年度计划付款', value: '¥' + (annualSummary.value.payAmt / 10000).toFixed(1) + '万',    icon: Money,    theme: 'primary' },
  { key: 'pending',label: '待执行',       value: annualSummary.value.pendingCount + ' 笔',                              icon: Tickets,  theme: 'info' },
  { key: 'overdue',label: '已逾期',       value: annualSummary.value.overdueCount + ' 笔',                              icon: Warning,  theme: 'warn' },
])

// ============================================================
// ECharts 柱状图 option
// ============================================================
const barOption = computed(() => {
  const months = monthList.value.map(m => m.label.replace('月', ''))
  const receivableW = monthList.value.map(m => +(m.receivableAmt / 10000).toFixed(1))
  const payableW = monthList.value.map(m => +(m.payableAmt / 10000).toFixed(1))
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any[]) => {
        let s = `<div style="font-weight:600;margin-bottom:4px">2026-${params[0].axisValue}月</div>`
        params.forEach((p: any) => {
          s += `<div style="display:flex;justify-content:space-between;gap:18px">
            <span style="color:${p.color}">● ${p.seriesName}</span>
            <span style="font-weight:600">¥${p.value} 万</span>
          </div>`
        })
        return s
      }
    },
    legend: {
      data: ['应收', '应付'],
      top: 0,
      textStyle: { color: '#52525b' },
    },
    grid: { left: 40, right: 20, top: 40, bottom: 30 },
    xAxis: {
      type: 'category',
      data: months,
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      axisLabel: { color: '#52525b' },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: { color: '#71717a', formatter: '{value}万' },
      splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
    },
    series: [
      {
        name: '应收',
        type: 'bar',
        data: receivableW,
        barWidth: '32%',
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#10b981' },
              { offset: 1, color: '#059669' },
            ]
          }
        }
      },
      {
        name: '应付',
        type: 'bar',
        data: payableW,
        barWidth: '32%',
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#ef4444' },
              { offset: 1, color: '#dc2626' },
            ]
          }
        }
      },
    ]
  }
})

// ============================================================
// 工具
// ============================================================
function dayOf(date: string): string {
  return date.slice(8, 10)
}
function monthOf(date: string): string {
  return String(Number(date.slice(5, 7)))
}
function planStatusLabel(s: string): string {
  return { pending: '待执行', executed: '已执行', overdue: '已逾期' }[s as 'pending'] || s
}

// ============================================================
// 动作
// ============================================================
function onMonitorDetail(row: PlanRow) { ElMessage.info(`查看计划详情 ${row.contractNo}`) }
function onMonitorContract(row: PlanRow) { ElMessage.info(`跳转合同 ${row.contractNo}`) }
function onExecute(row: PlanRow) {
  ElMessageBox.confirm(`确认执行 ${row.direction === 'receive' ? '收款' : '付款'} 计划 ¥${row.amount.toLocaleString()}？`, '执行计划', {
    type: 'warning', confirmButtonText: '确认执行', cancelButtonText: '取消'
  }).then(() => {
    const target = DETAIL_ROWS.value.find(r => r.id === row.id)
    if (target) {
      target.status = 'executed'
      target.actualDate = new Date().toISOString().slice(0, 10)
    }
    ElMessage.success('执行成功')
  }).catch(() => {})
}
function onPostpone(row: PlanRow) {
  ElMessageBox.prompt('请输入延期至（格式 YYYY-MM-DD）', '延期计划', {
    inputValue: '2026-11-30',
    confirmButtonText: '确认', cancelButtonText: '取消'
  }).then(({ value }) => {
    const target = DETAIL_ROWS.value.find(r => r.id === row.id)
    if (target) {
      target.planDate = value
      if (target.status === 'overdue') target.status = 'pending'
    }
    ElMessage.success('延期成功')
  }).catch(() => {})
}
</script>

<style scoped lang="scss">
.zg-fc-plan {
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

  /* 主区：时间轴 + 柱状图 */
  &__main {
    display: grid; grid-template-columns: 280px 1fr;
    gap: 18px; margin-bottom: 18px;
  }

  &__timeline, &__chart, &__tablecard {
    background: var(--zg-surface-card);
    border: 1px solid var(--zg-line-soft);
    border-radius: var(--zg-radius-lg);
    padding: 18px;
  }

  &__panel-head {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 14px;
  }
  &__panel-title { font-size: 15px; font-weight: 600; color: #18181b; }
  &__panel-sub { font-size: 12px; color: var(--zg-ink-tertiary); }
  &__table-filter { display: flex; gap: 8px; }

  /* 时间轴 */
  &__months {
    display: flex; flex-direction: column; gap: 10px; max-height: 380px; overflow-y: auto;
    padding-right: 4px;
  }
  &__month {
    position: relative;
    background: var(--zg-surface-muted);
    border: 1px solid var(--zg-line-soft);
    border-radius: var(--zg-radius-md);
    padding: 12px 14px;
    cursor: pointer;
    transition: all 200ms ease;
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto;
    gap: 2px 12px;
    &:hover { border-color: var(--zg-brand-primary); transform: translateX(2px); }
    &.active {
      background: linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%);
      border-color: var(--zg-brand-primary);
      box-shadow: 0 2px 8px -2px rgba(217,119,6,0.2);
    }
    &.has-pending::after {
      content: ''; position: absolute; right: 12px; top: 12px;
      width: 6px; height: 6px; border-radius: 50%;
      background: var(--zg-warning);
    }
  }
  &__month-name { font-size: 15px; font-weight: 700; color: #18181b; }
  &__month-year { font-size: 11px; color: var(--zg-ink-tertiary); align-self: end; }
  &__month-stats {
    grid-column: 1 / -1;
    display: flex; gap: 14px;
    font-size: 11px; font-variant-numeric: tabular-nums;
  }
  &__m-in  { color: var(--zg-success); font-weight: 600; }
  &__m-out { color: var(--zg-danger);  font-weight: 600; }
  &__overdue-badge { position: absolute; top: -6px; right: -6px; }

  /* 日期格式 */
  &__date {
    display: flex; flex-direction: column; align-items: center;
    .zg-fc-plan__day {
      font-size: 16px; font-weight: 700; color: var(--zg-brand-primary); line-height: 1;
    }
    .zg-fc-plan__month-tag {
      font-size: 11px; color: var(--zg-ink-tertiary); margin-top: 2px;
    }
  }

  &__tablewrap { border: 1px solid var(--zg-line-soft); border-radius: var(--zg-radius-md); overflow: hidden; }
  &__pager {
    display: flex; justify-content: flex-end;
    padding-top: 14px; border-top: 1px solid var(--zg-line-soft); margin-top: 16px;
  }
}

.zg-fc-echart { width: 100%; height: 340px; }

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

.zg-status-pill {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 12px; padding: 2px 10px; border-radius: var(--zg-radius-pill);
  font-weight: 500;
  .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
  &--pending  { color: var(--zg-info);    background: var(--zg-info-soft); }
  &--executed { color: var(--zg-success); background: var(--zg-success-soft); }
  &--overdue  { color: var(--zg-danger);  background: var(--zg-danger-soft); }
}

.zg-fc-actual { color: var(--zg-success); font-weight: 500; font-variant-numeric: tabular-nums; }
.zg-fc-muted { color: #cbd5e1; }
</style>
