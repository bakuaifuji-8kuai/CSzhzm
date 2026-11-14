<!--
  智光云枢 · 运维工单 · 告警处置汇总
  业务域：opsTicket
  功能：告警类工单月度汇总表格，支持告警趋势、处理效率、返工率、关联设备统计
-->
<template>
  <section class="zg-alarm-summary">
    <header class="zg-alarm-summary__head">
      <div class="zg-alarm-summary__headline">
        <div class="zg-alarm-summary__sigil">
          <el-icon :size="22"><Warning /></el-icon>
        </div>
        <div class="zg-alarm-summary__copy">
          <h1 class="zg-alarm-summary__title">告警处置汇总</h1>
          <p class="zg-alarm-summary__sub">告警类工单月度趋势 · 处理效率 · 返工率 · 关联照明设备</p>
        </div>
      </div>
      <div class="zg-alarm-summary__cta">
        <el-radio-group v-model="viewMode" size="small">
          <el-radio-button value="month">月度</el-radio-button>
          <el-radio-button value="year">年度</el-radio-button>
        </el-radio-group>
        <el-select v-model="alarmCategory" placeholder="告警类型" style="width: 140px" clearable>
          <el-option label="全部告警" value="" />
          <el-option label="灯具故障" value="灯具" />
          <el-option label="电缆故障" value="电缆" />
          <el-option label="箱变异常" value="箱变" />
          <el-option label="控制箱离线" value="控制箱" />
        </el-select>
        <el-button type="primary"><el-icon><Search /></el-icon><span>查询</span></el-button>
        <el-button><el-icon><Download /></el-icon><span>导出Excel</span></el-button>
      </div>
    </header>

    <!-- 指标卡 -->
    <div class="zg-metrics">
      <div class="zg-metrics__cell zg-metrics__cell--danger">
        <span class="zg-metrics__num">{{ kpi.totalCount }}</span>
        <span class="zg-metrics__lbl">年度告警工单总数</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--success">
        <span class="zg-metrics__num">{{ kpi.completedRate }}<em>%</em></span>
        <span class="zg-metrics__lbl">平均完成率</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <span class="zg-metrics__num">{{ kpi.avgDuration }}<em>h</em></span>
        <span class="zg-metrics__lbl">平均处理时长</span>
      </div>
      <div class="zg-metrics__cell">
        <span class="zg-metrics__num">{{ kpi.reworkRate }}<em>%</em></span>
        <span class="zg-metrics__lbl">平均返工率</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--primary">
        <span class="zg-metrics__num">{{ kpi.deviceCount }}</span>
        <span class="zg-metrics__lbl">关联照明设备数</span>
      </div>
    </div>

    <!-- 趋势图区域 -->
    <div class="zg-panel">
      <div class="zg-panel__head">
        <el-icon><TrendCharts /></el-icon>
        <span>告警工单月度趋势</span>
      </div>
      <div class="zg-chart-mini">
        <div v-for="row in monthlyData" :key="row.month" class="zg-chart-mini__row">
          <span class="zg-chart-mini__lbl">{{ row.month }}</span>
          <div class="zg-chart-mini__track">
            <div class="zg-chart-mini__fill" :style="{ width: row.alarmRate + '%' }"></div>
          </div>
          <span class="zg-chart-mini__val">{{ row.alarmCount }}</span>
        </div>
      </div>
    </div>

    <!-- 月度汇总表格 -->
    <div class="zg-panel zg-panel--table">
      <div class="zg-filterband">
        <div class="zg-filterband__row">
          <el-input v-model="keyword" placeholder="搜索月份 / 告警关键词" clearable style="width: 220px">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
          <div class="zg-filterband__hint">共 {{ filteredData.length }} 条月度记录</div>
        </div>
      </div>

      <el-table :data="filteredData" stripe border size="small" class="zg-datatable" :header-cell-style="{ background: '#f8fafc', color: '#52525b' }">
        <el-table-column prop="month" label="月份" width="100" align="center" fixed />
        <el-table-column prop="alarmCount" label="告警类工单总数" width="140" align="right" />
        <el-table-column label="已完成" width="120" align="right">
          <template #default="{ row }">
            <span class="text-emerald-600 font-semibold">{{ row.completed }}</span>
          </template>
        </el-table-column>
        <el-table-column label="完成率" width="140">
          <template #default="{ row }">
            <el-progress :percentage="row.completedRate" :stroke-width="8" :color="progressColor(row.completedRate)" />
          </template>
        </el-table-column>
        <el-table-column prop="avgDuration" label="平均处理时长(h)" width="150" align="right">
          <template #default="{ row }">
            <span :class="{ 'text-red-500 font-semibold': row.avgDuration > 3 }">{{ row.avgDuration.toFixed(1) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="reworkRate" label="返工率(%)" width="130" align="right">
          <template #default="{ row }">
            <span :class="{ 'text-red-500 font-semibold': row.reworkRate > 5 }">{{ row.reworkRate.toFixed(1) }}%</span>
          </template>
        </el-table-column>
        <el-table-column prop="deviceCount" label="关联照明设备数" width="150" align="right" />
        <el-table-column label="同比变化" width="120" align="center">
          <template #default="{ row }">
            <span :class="row.yoyChange >= 0 ? 'text-red-500' : 'text-emerald-600'">
              {{ row.yoyChange >= 0 ? '↑' : '↓' }}{{ Math.abs(row.yoyChange) }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small">详情</el-button>
            <el-button link type="primary" size="small">导出</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="zg-pagerbar">
        <el-pagination background :total="filteredData.length" :page-size="12"
          layout="prev, pager, next, jumper, ->, total" />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Warning, Search, Download, TrendCharts } from "@element-plus/icons-vue"

const viewMode = ref('month')
const alarmCategory = ref('')
const keyword = ref('')

// KPI
const kpi = ref({
  totalCount: 1247,
  completedRate: 93.5,
  avgDuration: 2.4,
  reworkRate: 3.2,
  deviceCount: 3856
})

// 月度汇总 mock
const monthlyData = ref([
  { month: '2026-01', alarmCount: 86, completed: 80, completedRate: 93, avgDuration: 2.1, reworkRate: 2.3, deviceCount: 3240, yoyChange: -8 },
  { month: '2026-02', alarmCount: 72, completed: 68, completedRate: 94, avgDuration: 1.9, reworkRate: 1.8, deviceCount: 3280, yoyChange: -12 },
  { month: '2026-03', alarmCount: 98, completed: 91, completedRate: 93, avgDuration: 2.3, reworkRate: 2.8, deviceCount: 3350, yoyChange: 5 },
  { month: '2026-04', alarmCount: 115, completed: 108, completedRate: 94, avgDuration: 2.5, reworkRate: 3.1, deviceCount: 3420, yoyChange: 15 },
  { month: '2026-05', alarmCount: 128, completed: 119, completedRate: 93, avgDuration: 2.7, reworkRate: 3.5, deviceCount: 3510, yoyChange: 22 },
  { month: '2026-06', alarmCount: 142, completed: 132, completedRate: 93, avgDuration: 2.9, reworkRate: 4.2, deviceCount: 3600, yoyChange: 28 },
  { month: '2026-07', alarmCount: 156, completed: 145, completedRate: 93, avgDuration: 3.1, reworkRate: 4.8, deviceCount: 3680, yoyChange: 35 },
  { month: '2026-08', alarmCount: 148, completed: 138, completedRate: 93, avgDuration: 2.8, reworkRate: 4.5, deviceCount: 3720, yoyChange: 30 },
  { month: '2026-09', alarmCount: 135, completed: 126, completedRate: 93, avgDuration: 2.5, reworkRate: 3.8, deviceCount: 3780, yoyChange: 18 },
  { month: '2026-10', alarmCount: 120, completed: 112, completedRate: 93, avgDuration: 2.2, reworkRate: 3.2, deviceCount: 3820, yoyChange: 8 },
  { month: '2026-11', alarmCount: 105, completed: 98, completedRate: 93, avgDuration: 2.0, reworkRate: 2.5, deviceCount: 3856, yoyChange: -3 },
  { month: '2026-12', alarmCount: 92, completed: 86, completedRate: 93, avgDuration: 1.8, reworkRate: 2.0, deviceCount: 3890, yoyChange: -10 }
])

// 计算告警率（用于图表）
const maxAlarm = computed(() => Math.max(...monthlyData.value.map(r => r.alarmCount)))
const monthlyWithRate = computed(() =>
  monthlyData.value.map(r => ({ ...r, alarmRate: Math.round((r.alarmCount / maxAlarm.value) * 100) }))
)

// 搜索过滤
const filteredData = computed(() => {
  if (!keyword.value.trim()) return monthlyData.value
  const kw = keyword.value.trim().toLowerCase()
  return monthlyData.value.filter(r => r.month.toLowerCase().includes(kw))
})

function progressColor(pct) {
  if (pct >= 95) return '#059669'
  if (pct >= 90) return '#10b981'
  if (pct >= 80) return '#d97706'
  return '#dc2626'
}
</script>

<style scoped lang="scss">
.zg-alarm-summary {
  padding: 24px;

  &__head {
    display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;
    margin-bottom: 20px; padding-bottom: 18px; border-bottom: 1px solid #e2e8f0;
  }
  &__headline { display: flex; align-items: center; gap: 14px; }
  &__sigil {
    width: 44px; height: 44px; border-radius: 10px;
    background: linear-gradient(135deg, #f59e0b, #ef4444); color: #fff;
    display: flex; align-items: center; justify-content: center;
  }
  &__copy { display: flex; flex-direction: column; gap: 4px; }
  &__title { font-size: 20px; font-weight: 600; margin: 0; color: #18181b; }
  &__sub { font-size: 13px; color: #71717a; margin: 0; }
  &__cta { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
}

.zg-metrics {
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; margin-bottom: 20px;
  &__cell {
    background: #fff; border: 1px solid #e2e8f0; border-radius: 16px;
    padding: 16px 18px; display: flex; flex-direction: column; gap: 6px;
    box-shadow: 0 1px 3px rgba(15,23,42,0.04); position: relative; overflow: hidden;
    &::before { content: ''; position: absolute; left: 0; top: 0; width: 3px; height: 100%; background: #6366f1; }
    &--primary::before { background: #6366f1; }
    &--success::before { background: #059669; }
    &--warn::before { background: #d97706; }
    &--danger::before { background: #dc2626; }
  }
  &__num { font-size: 26px; font-weight: 700; color: #18181b; line-height: 1; em { font-style: normal; font-size: 14px; color: #71717a; margin-left: 4px; font-weight: 400; } }
  &__lbl { font-size: 12px; color: #71717a; }
}

.zg-panel {
  background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 18px; margin-bottom: 18px;
  &__head { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: #52525b; margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid #e2e8f0; }
  &--table { margin-bottom: 0; }
}

.zg-chart-mini {
  display: flex; flex-direction: column; gap: 10px;
  &__row { display: grid; grid-template-columns: 90px 1fr 60px; align-items: center; gap: 10px; }
  &__lbl { font-size: 12px; color: #71717a; font-family: monospace; }
  &__track { height: 10px; background: #f1f5f9; border-radius: 999px; overflow: hidden; }
  &__fill { height: 100%; background: linear-gradient(90deg, #ef4444, #f59e0b); border-radius: 999px; transition: width 0.3s; }
  &__val { font-size: 13px; font-weight: 600; color: #18181b; text-align: right; }
}

.zg-filterband {
  padding: 14px 16px; background: #f8fafc; border-radius: 10px; margin-bottom: 14px;
  &__row { display: flex; gap: 12px; align-items: center; }
  &__hint { margin-left: auto; font-size: 12px; color: #71717a; }
}

.zg-pagerbar { display: flex; justify-content: flex-end; padding-top: 14px; }

.text-emerald-600 { color: #059669; }
.text-red-500 { color: #ef4444; }
.text-emerald-500 { color: #10b981; }
.font-semibold { font-weight: 600; }
</style>
