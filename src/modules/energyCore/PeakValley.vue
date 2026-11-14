<!-- 智光云枢 · 能耗专项 · PeakValley 峰谷用电分析 -->
<template>
  <section class="zg-energy-pv">
    <header class="zg-energy__head">
      <div class="zg-energy__headline">
        <div class="zg-energy__sigil zg-energy__sigil--indigo"><el-icon :size="22"><Coin /></el-icon></div>
        <div class="zg-energy__copy">
          <h1>峰谷用电分析</h1>
          <p>24 小时峰/平/谷三段着色曲线 · 月度日历热力图 · 峰谷差计费分析</p>
        </div>
      </div>
      <div class="zg-energy__cta">
        <el-button type="primary" :icon="TrendCharts">峰谷套利建议</el-button>
        <el-button :icon="Download">导出峰谷报表</el-button>
      </div>
    </header>

    <!-- 指标卡 -->
    <div class="zg-metrics">
      <div v-for="m in metrics" :key="m.label" class="zg-metrics__cell">
        <span class="zg-metrics__icon" :style="{ background: m.bg }"><el-icon :size="18"><component :is="m.icon" /></el-icon></span>
        <div class="zg-metrics__body">
          <div class="zg-metrics__num">{{ m.value }}</div>
          <div class="zg-metrics__lbl">{{ m.label }}</div>
        </div>
      </div>
    </div>

    <!-- 主图区 -->
    <div class="zg-energy__main">
      <div class="zg-energy__chart-card">
        <div class="zg-energy__chart-head">
          <h3>24 小时用电曲线（峰/平/谷着色）</h3>
          <div class="zg-energy__legend">
            <span class="dot dot--rose"></span>峰段
            <span class="dot dot--amber"></span>平段
            <span class="dot dot--indigo"></span>谷段
          </div>
        </div>
        <v-chart class="zg-energy__echart" :option="curveOption" autoresize />
      </div>

      <div class="zg-energy__chart-card">
        <div class="zg-energy__chart-head">
          <h3>月度日历热力图 · 小时负荷</h3>
          <el-tag>2026-11</el-tag>
        </div>
        <v-chart class="zg-energy__echart" :option="calendarOption" autoresize />
      </div>
    </div>

    <!-- 峰谷差计费分析 -->
    <div class="zg-energy__billing-card">
      <h3><el-icon><Coin /></el-icon>峰谷差计费分析 · 本月</h3>
      <el-table :data="billingDetail" stripe size="small">
        <el-table-column prop="period" label="时段" width="120">
          <template #default="{ row }">
            <el-tag :type="row.period === '峰段' ? 'danger' : row.period === '平段' ? 'warning' : 'info'" size="small">{{ row.period }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="hours" label="小时范围" width="170" />
        <el-table-column prop="kwh" label="电量 kWh" width="150" align="right">
          <template #default="{ row }"><span class="font-mono font-semibold">{{ row.kwh.toLocaleString() }}</span></template>
        </el-table-column>
        <el-table-column prop="price" label="电价 ¥/kWh" width="140" align="right">
          <template #default="{ row }"><span class="font-mono">{{ row.price.toFixed(2) }}</span></template>
        </el-table-column>
        <el-table-column prop="amount" label="金额 ¥" width="150" align="right">
          <template #default="{ row }"><span class="font-mono font-bold text-slate-800">{{ row.amount.toLocaleString() }}</span></template>
        </el-table-column>
        <el-table-column label="占比" width="180">
          <template #default="{ row }"><el-progress :percentage="Math.round(row.kwh / totalKwh.value * 100)" /></template>
        </el-table-column>
      </el-table>
      <div class="zg-energy__billing-tip">
        💡 峰谷差 {{ ((0.98 - 0.46) / 0.46 * 100).toFixed(0) }}%，若将 <b>5%</b> 峰段负荷转移至谷段，预计本月可节省电费 <span class="text-emerald-600 font-bold">¥ {{ peakValleySave.toFixed(0).toLocaleString() }}</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Coin, Download, TrendCharts, Connection, Timer } from "@element-plus/icons-vue"
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, HeatmapChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, VisualMapComponent, CalendarComponent } from 'echarts/components'
use([CanvasRenderer, LineChart, HeatmapChart, GridComponent, TooltipComponent, VisualMapComponent, CalendarComponent])

const metrics = ref([
  { label: '今日总用电', value: '86,432 kWh', icon: Connection, bg: 'linear-gradient(135deg,#06b6d4,#22d3ee)' },
  { label: '峰段占比', value: '35.2%', icon: Timer, bg: 'linear-gradient(135deg,#ef4444,#f87171)' },
  { label: '谷段占比', value: '24.8%', icon: TrendCharts, bg: 'linear-gradient(135deg,#6366f1,#818cf8)' },
  { label: '峰谷差电费', value: '¥ 24,320', icon: Coin, bg: 'linear-gradient(135deg,#f59e0b,#fbbf24)' }
])

// 24 小时曲线 + 峰谷背景着色
const curveOption = computed(() => {
  const hours = Array.from({length: 24}, (_, i) => `${i}:00`)
  // 模拟真实的路灯负荷曲线：0-6低，7-17白天照明几乎关，18-23高峰
  const data = [4200, 3800, 3600, 3400, 3200, 3500, 3800, 5200, 6200, 6800, 7200, 7400, 7300, 7100, 7000, 7200, 7800, 12800, 14500, 14800, 14200, 13600, 11200, 7800]
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
    grid: { left: 50, right: 20, top: 30, bottom: 40 },
    xAxis: { type: 'category', data: hours, axisLabel: { interval: 2 } },
    yAxis: { type: 'value', name: 'kWh', splitLine: { lineStyle: { type: 'dashed', color: '#e5e7eb' } } },
    series: [{
      type: 'line', smooth: true, data, symbol: 'circle', symbolSize: 6,
      lineStyle: { width: 3, color: '#06b6d4' },
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [
        { offset: 0, color: 'rgba(6,182,212,0.35)' }, { offset: 1, color: 'rgba(6,182,212,0.05)' }
      ]}},
      markArea: {
        silent: true,
        data: [
          // 谷段：23-7
          [{ xAxis: '0:00', itemStyle: { color: 'rgba(99,102,241,0.10)' } }, { xAxis: '6:00' }],
          // 峰段：8-11, 18-23
          [{ xAxis: '8:00', itemStyle: { color: 'rgba(239,68,68,0.12)' } }, { xAxis: '10:00' }],
          [{ xAxis: '18:00', itemStyle: { color: 'rgba(239,68,68,0.12)' } }, { xAxis: '22:00' }]
        ]
      }
    }]
  }
})

// 日历热力图
const calendarOption = computed(() => {
  const data = []
  const base = new Date(2026, 10, 1)
  const days = new Date(2026, 11, 0).getDate()
  for (let d = 1; d <= days; d++) {
    const date = new Date(2026, 10, d)
    // 生成一天的平均负荷
    const avg = 6000 + Math.round(Math.random() * 9000)
    data.push([[date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-'), avg])
  }
  return {
    tooltip: { formatter: p => `${p.data[0]}<br/>平均 ${p.data[1]} kWh` },
    visualMap: { min: 4000, max: 16000, calculable: true, orient: 'horizontal', left: 'center', bottom: 0, inRange: { color: ['#e0e7ff','#6366f1','#06b6d4','#f59e0b','#ef4444'] } },
    calendar: { top: 30, left: 60, right: 30, yearLabel: { show: false }, dayLabel: { firstDay: 1 }, range: '2026-11', cellSize: ['auto', 24] },
    series: [{ type: 'heatmap', coordinateSystem: 'calendar', data }]
  }
})

// 峰谷差计费
const billingDetail = ref([
  { period: '峰段', hours: '08:00-11:00 / 18:00-23:00', kwh: 842300, price: 0.98, amount: 825454 },
  { period: '平段', hours: '07:00-08:00 / 11:00-18:00', kwh: 963240, price: 0.65, amount: 626106 },
  { period: '谷段', hours: '23:00-07:00', kwh: 679020, price: 0.46, amount: 312349 }
])
const totalKwh = computed(() => billingDetail.value.reduce((s, r) => s + r.kwh, 0))
const peakValleySave = computed(() => {
  // 假设转移 5% 峰段负荷到谷段，节省 (0.98-0.46) * 转移量
  const shift = billingDetail.value[0].kwh * 0.05
  return shift * (0.98 - 0.46)
})
</script>

<style lang="scss" scoped>
.zg-energy-pv { padding: var(--zg-space-6); background: var(--zg-gradient-surface); min-height: calc(100vh - 120px); }
.zg-energy__head { display: flex; justify-content: space-between; align-items: center; padding-bottom: var(--zg-space-5); margin-bottom: var(--zg-space-4); border-bottom: 1px solid var(--zg-line-soft); }
.zg-energy__sigil { width: 44px; height: 44px; border-radius: var(--zg-radius-md); background: linear-gradient(135deg,#06b6d4,#6366f1); color: #fff; display: flex; align-items: center; justify-content: center; }
.zg-energy__sigil--indigo { background: linear-gradient(135deg,#6366f1,#a855f7); }
.zg-energy__headline { display: flex; gap: var(--zg-space-3); align-items: center; }
.zg-energy__copy h1 { margin: 0; font-size: var(--zg-text-display-md); font-weight: 700; }
.zg-energy__copy p { margin: 2px 0 0; font-size: var(--zg-text-body-sm); color: var(--zg-ink-tertiary); }

.zg-metrics { display: grid; grid-template-columns: repeat(4,1fr); gap: var(--zg-space-4); margin-bottom: var(--zg-space-5); }
.zg-metrics__cell { display: flex; gap: var(--zg-space-3); padding: var(--zg-space-4); background: var(--zg-surface-card); border: 1px solid var(--zg-line-soft); border-radius: var(--zg-radius-lg); box-shadow: var(--zg-shadow-card); }
.zg-metrics__icon { width: 42px; height: 42px; border-radius: var(--zg-radius-md); display: flex; align-items: center; justify-content: center; color: #fff; flex-shrink: 0; }
.zg-metrics__num { font-size: 22px; font-weight: 800; font-family: var(--zg-font-mono); }
.zg-metrics__lbl { font-size: 12px; color: var(--zg-ink-tertiary); margin-top: 2px; }

.zg-energy__main { display: grid; grid-template-columns: 1fr 1fr; gap: var(--zg-space-4); margin-bottom: var(--zg-space-4); }
.zg-energy__chart-card { background: var(--zg-surface-card); border: 1px solid var(--zg-line-soft); border-radius: var(--zg-radius-lg); padding: var(--zg-space-4); }
.zg-energy__chart-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--zg-space-3); }
.zg-energy__chart-head h3 { margin: 0; font-size: var(--zg-text-body); font-weight: 600; }
.zg-energy__legend { display: flex; gap: 12px; font-size: 12px; color: var(--zg-ink-secondary); }
.dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 4px; vertical-align: middle; }
.dot--rose { background: #ef4444; } .dot--amber { background: #f59e0b; } .dot--indigo { background: #6366f1; }
.zg-energy__echart { height: 340px; width: 100%; }

.zg-energy__billing-card { background: var(--zg-surface-card); border: 1px solid var(--zg-line-soft); border-radius: var(--zg-radius-lg); padding: var(--zg-space-4); }
.zg-energy__billing-card h3 { margin: 0 0 var(--zg-space-3); font-size: var(--zg-text-body); font-weight: 600; display: flex; gap: 6px; align-items: center; }
.zg-energy__billing-tip { margin-top: var(--zg-space-3); padding: var(--zg-space-3); background: linear-gradient(90deg, rgba(16,185,129,0.1), rgba(6,182,212,0.1)); border: 1px solid rgba(16,185,129,0.3); border-radius: var(--zg-radius-md); font-size: 13px; color: var(--zg-ink-secondary); }
</style>
