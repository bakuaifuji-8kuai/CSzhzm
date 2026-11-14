<!-- 智光云枢 · 能耗专项 · Overview 能耗总览 -->
<template>
  <section class="zg-energy-overview">
    <header class="zg-energy__head">
      <div class="zg-energy__headline">
        <div class="zg-energy__sigil"><el-icon :size="22"><Coin /></el-icon></div>
        <div class="zg-energy__copy">
          <h1>能耗总览</h1>
          <p>全域照明 · 非照明 · 箱变层级用电态势一览，支撑月度节能复盘</p>
        </div>
      </div>
      <div class="zg-energy__cta">
        <el-button type="primary" :icon="Download">导出日报</el-button>
        <el-button :icon="Refresh" @click="refresh">刷新</el-button>
      </div>
    </header>

    <!-- 指标卡 -->
    <div class="zg-metrics">
      <div v-for="m in metrics" :key="m.label" class="zg-metrics__cell">
        <span class="zg-metrics__icon" :style="{ background: m.bg }">
          <el-icon :size="18"><component :is="m.icon" /></el-icon>
        </span>
        <div class="zg-metrics__body">
          <div class="zg-metrics__num">{{ m.value }}</div>
          <div class="zg-metrics__lbl">{{ m.label }}</div>
          <div v-if="m.trend" class="zg-metrics__trend" :class="m.trendType">
            <el-icon><component :is="m.trendType === 'up' ? 'Top' : 'Bottom'" /></el-icon>
            {{ m.trend }}
          </div>
        </div>
      </div>
    </div>

    <!-- 过滤工具栏 -->
    <div class="zg-filterband">
      <el-select v-model="filter.region" placeholder="全部区域" style="width: 160px">
        <el-option v-for="r in regions" :key="r" :label="r" :value="r" />
      </el-select>
      <el-select v-model="filter.time" placeholder="本月" style="width: 140px">
        <el-option label="今日" value="今日" />
        <el-option label="本周" value="本周" />
        <el-option label="本月" value="本月" />
        <el-option label="本季度" value="本季度" />
      </el-select>
      <el-input v-model="filter.keyword" placeholder="搜索箱变 / 回路" :prefix-icon="Search" style="width: 220px" clearable />
      <el-button type="primary" :icon="Search">查询</el-button>
      <el-button :icon="Setting">高级筛选</el-button>
    </div>

    <!-- 图表 -->
    <div class="zg-energy__charts">
      <div class="zg-energy__chart-card">
        <div class="zg-energy__chart-head">
          <h3>区域能耗对比</h3>
          <div class="zg-energy__legend">
            <span class="dot dot--cyan"></span>照明
            <span class="dot dot--amber"></span>非照明
            <span class="dot dot--rose"></span>线损
          </div>
        </div>
        <v-chart class="zg-energy__echart" :option="regionBarOption" autoresize />
      </div>
      <div class="zg-energy__chart-card">
        <div class="zg-energy__chart-head">
          <h3>近 14 日日用电曲线</h3>
          <el-tag effect="plain" type="info">kWh</el-tag>
        </div>
        <v-chart class="zg-energy__echart" :option="dailyAreaOption" autoresize />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Coin, Download, Refresh, Search, Setting, Box, TrendCharts, Warning, Connection } from "@element-plus/icons-vue"
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
use([CanvasRenderer, BarChart, LineChart, GridComponent, TooltipComponent, LegendComponent])

const regions = ['先导区', '岳麓区', '高新区', '望城区', '雨花区', '开福区']
const filter = reactive({ region: '', time: '本月', keyword: '' })

const metrics = ref([
  { label: '今日总用电', value: '86,432', icon: Connection, bg: 'linear-gradient(135deg,#06b6d4,#22d3ee)', trend: '较昨日 +3.2%', trendType: 'up' },
  { label: '本月累计', value: '2,134,580', icon: Box, bg: 'linear-gradient(135deg,#6366f1,#818cf8)', trend: '环比 +8.7%', trendType: 'up' },
  { label: '线损率', value: '7.8%', icon: TrendCharts, bg: 'linear-gradient(135deg,#f59e0b,#fbbf24)', trend: '较上月 -0.4pt', trendType: 'down' },
  { label: '异常事件', value: '14', icon: Warning, bg: 'linear-gradient(135deg,#ef4444,#f87171)', trend: '待处置 6', trendType: 'up' },
  { label: '在线箱变', value: '268 / 271', icon: Connection, bg: 'linear-gradient(135deg,#10b981,#34d399)', trend: '在线率 98.9%', trendType: 'up' }
])

// 区域柱状图
const regionBarOption = computed(() => ({
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  legend: { data: ['照明', '非照明', '线损'], top: 0 },
  grid: { left: 40, right: 20, bottom: 40, top: 36 },
  xAxis: { type: 'category', data: regions },
  yAxis: { type: 'value', name: 'kWh', splitLine: { lineStyle: { type: 'dashed', color: '#e5e7eb' } } },
  series: [
    { name: '照明', type: 'bar', stack: 'a', data: [320000, 280000, 410000, 195000, 260000, 180000], itemStyle: { color: '#06b6d4', borderRadius: [0,0,0,0] } },
    { name: '非照明', type: 'bar', stack: 'a', data: [82000, 75000, 110000, 48000, 68000, 42000], itemStyle: { color: '#f59e0b' } },
    { name: '线损', type: 'bar', stack: 'a', data: [32000, 28500, 41000, 19600, 26500, 18100], itemStyle: { color: '#ef4444', borderRadius: [4,4,0,0] } }
  ]
}))

// 日面积图
const dailyAreaOption = computed(() => {
  const dates = Array.from({length: 14}, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i));
    return `${d.getMonth()+1}/${d.getDate()}`
  })
  const data = dates.map(() => 80000 + Math.round(Math.random() * 20000))
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: 50, right: 20, bottom: 40, top: 20 },
    xAxis: { type: 'category', data: dates, boundaryGap: false },
    yAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed', color: '#e5e7eb' } } },
    series: [{
      name: '日电量 kWh', type: 'line', smooth: true, areaStyle: { opacity: 0.25, color: '#06b6d4' },
      data, lineStyle: { color: '#06b6d4', width: 2 }, itemStyle: { color: '#06b6d4' }, showSymbol: false
    }]
  }
})

function refresh() { /* 触发刷新 */ }
</script>

<style lang="scss" scoped>
.zg-energy-overview {
  padding: var(--zg-space-6);
  background: var(--zg-gradient-surface);
  min-height: calc(100vh - 120px);
}
.zg-energy__head {
  display: flex; justify-content: space-between; align-items: center;
  padding-bottom: var(--zg-space-5); margin-bottom: var(--zg-space-4);
  border-bottom: 1px solid var(--zg-line-soft);
}
.zg-energy__sigil {
  width: 44px; height: 44px; border-radius: var(--zg-radius-md);
  background: linear-gradient(135deg, #06b6d4, #6366f1);
  color: #fff; display: flex; align-items: center; justify-content: center;
}
.zg-energy__headline { display: flex; gap: var(--zg-space-3); align-items: center; }
.zg-energy__copy h1 { margin: 0; font-size: var(--zg-text-display-md); font-weight: 700; }
.zg-energy__copy p { margin: 2px 0 0; font-size: var(--zg-text-body-sm); color: var(--zg-ink-tertiary); }

.zg-metrics {
  display: grid; grid-template-columns: repeat(5, 1fr); gap: var(--zg-space-4);
  margin-bottom: var(--zg-space-5);
}
.zg-metrics__cell {
  display: flex; gap: var(--zg-space-3); padding: var(--zg-space-4);
  background: var(--zg-surface-card); border: 1px solid var(--zg-line-soft);
  border-radius: var(--zg-radius-lg); box-shadow: var(--zg-shadow-card);
}
.zg-metrics__icon {
  width: 42px; height: 42px; border-radius: var(--zg-radius-md);
  display: flex; align-items: center; justify-content: center; color: #fff; flex-shrink: 0;
}
.zg-metrics__body { flex: 1; min-width: 0; }
.zg-metrics__num { font-size: 22px; font-weight: 800; font-family: var(--zg-font-mono); letter-spacing: -0.01em; }
.zg-metrics__lbl { font-size: 12px; color: var(--zg-ink-tertiary); margin-top: 2px; }
.zg-metrics__trend { font-size: 12px; margin-top: 4px; display: inline-flex; align-items: center; gap: 2px; font-weight: 600; }
.zg-metrics__trend.up { color: var(--zg-emerald-success); }
.zg-metrics__trend.down { color: #ef4444; }

.zg-filterband {
  display: flex; gap: 10px; align-items: center; flex-wrap: wrap;
  padding: var(--zg-space-3); background: var(--zg-surface-card);
  border: 1px solid var(--zg-line-soft); border-radius: var(--zg-radius-md);
  margin-bottom: var(--zg-space-4);
}

.zg-energy__charts { display: grid; grid-template-columns: 1fr 1fr; gap: var(--zg-space-4); }
.zg-energy__chart-card {
  background: var(--zg-surface-card); border: 1px solid var(--zg-line-soft);
  border-radius: var(--zg-radius-lg); padding: var(--zg-space-4);
}
.zg-energy__chart-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--zg-space-3); }
.zg-energy__chart-head h3 { margin: 0; font-size: var(--zg-text-body); font-weight: 600; }
.zg-energy__legend { display: flex; gap: 12px; font-size: 12px; color: var(--zg-ink-secondary); }
.dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 4px; vertical-align: middle; }
.dot--cyan { background: #06b6d4; } .dot--amber { background: #f59e0b; } .dot--rose { background: #ef4444; }
.zg-energy__echart { height: 320px; width: 100%; }
</style>
