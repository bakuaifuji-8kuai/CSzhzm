<!-- 智光云枢 · 能耗专项 · SavingsOverview 节能绩效看板 -->
<template>
  <section class="zg-energy-save">
    <header class="zg-energy__head">
      <div class="zg-energy__headline">
        <div class="zg-energy__sigil zg-energy__sigil--emerald"><el-icon :size="22"><Coin /></el-icon></div>
        <div class="zg-energy__copy">
          <h1>节能绩效看板</h1>
          <p>年节电 · 节煤 · 减碳 · EMC 收益 —— 政府汇报 / EMC 分成 / 碳资产台账</p>
        </div>
      </div>
      <div class="zg-energy__cta">
        <el-button type="primary" :icon="Connection">绩效报告</el-button>
        <el-button :icon="Download">导出</el-button>
      </div>
    </header>

    <!-- 四大核心卡 -->
    <div class="zg-energy__kpi-grid">
      <div v-for="k in kpis" :key="k.label" class="zg-energy__kpi" :style="{ background: k.bg }">
        <div class="zg-energy__kpi-top">
          <span class="zg-energy__kpi-lbl">{{ k.label }}</span>
          <el-icon :size="22"><component :is="k.icon" /></el-icon>
        </div>
        <div class="zg-energy__kpi-num">{{ k.value }}</div>
        <div class="zg-energy__kpi-sub">
          <span>{{ k.sub }}</span>
          <el-tag effect="dark" size="small" :type="k.tagType">{{ k.tag }}</el-tag>
        </div>
      </div>
    </div>

    <div class="zg-energy__main">
      <!-- 策略贡献占比 -->
      <div class="zg-energy__chart-card">
        <div class="zg-energy__chart-head"><h3>节能策略贡献占比</h3></div>
        <v-chart class="zg-energy__echart" :option="strategyBarOption" autoresize />
      </div>
      <!-- 月度趋势 -->
      <div class="zg-energy__chart-card">
        <div class="zg-energy__chart-head"><h3>近 12 月节电量趋势</h3><el-tag>kWh</el-tag></div>
        <v-chart class="zg-energy__echart" :option="trendOption" autoresize />
      </div>
    </div>

    <!-- 项目明细 -->
    <div class="zg-energy__proj-card">
      <div class="zg-energy__chart-head"><h3><el-icon><Folder /></el-icon>已落地节能项目明细</h3></div>
      <el-table :data="projects" stripe size="small" height="320">
        <el-table-column prop="name" label="项目名称" width="220" />
        <el-table-column prop="region" label="区域" width="100" />
        <el-table-column prop="strategy" label="策略类型" width="140">
          <template #default="{ row }">
            <el-tag size="small" effect="plain">{{ row.strategy }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="annualSave" label="年节电 kWh" width="140" align="right">
          <template #default="{ row }"><span class="font-mono font-bold text-emerald-600">{{ row.annualSave.toLocaleString() }}</span></template>
        </el-table-column>
        <el-table-column prop="invest" label="投资 ¥" width="150" align="right">
          <template #default="{ row }"><span class="font-mono">{{ row.invest.toLocaleString() }}</span></template>
        </el-table-column>
        <el-table-column prop="payback" label="回收期" width="100" align="right">
          <template #default="{ row }"><span class="font-mono">{{ row.payback }} 年</span></template>
        </el-table-column>
        <el-table-column prop="mode" label="模式" width="100">
          <template #default="{ row }">
            <el-tag :type="row.mode === 'EMC' ? 'success' : row.mode === '合同' ? 'warning' : 'info'" size="small">{{ row.mode }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '已验收' ? 'success' : row.status === '实施中' ? 'warning' : 'info'" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Coin, Download, Connection, Folder, Sunny } from "@element-plus/icons-vue"
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
use([CanvasRenderer, BarChart, LineChart, GridComponent, TooltipComponent, LegendComponent])

const kpis = ref([
  { label: '年节电', value: '6,842,360 kWh', sub: '较基线 -42.6%', tag: '↑ 12.8%', tagType: 'success', icon: Connection, bg: 'linear-gradient(135deg,#06b6d4,#22d3ee)' },
  { label: '等效节煤', value: '2,280 吨', sub: '标煤 0.42kg/kWh', tag: '↑ 9.2%', tagType: 'success', icon: Sunny, bg: 'linear-gradient(135deg,#f59e0b,#fbbf24)' },
  { label: '年减碳', value: '3,975 吨 CO₂', sub: '湖南省 OM 法', tag: '↑ 11.5%', tagType: 'success', icon: Sunny, bg: 'linear-gradient(135deg,#10b981,#34d399)' },
  { label: 'EMC 年收益', value: '¥ 362.4 万', sub: '分成 70%', tag: '↑ 8.7%', tagType: 'success', icon: Coin, bg: 'linear-gradient(135deg,#6366f1,#a855f7)' }
])

const strategyBarOption = computed(() => ({
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  grid: { left: 120, right: 40, bottom: 30, top: 20 },
  xAxis: { type: 'value', name: 'kWh' },
  yAxis: { type: 'category', data: ['LED 改造', '智能调光', '夜间降功率', '回路优化', '光衰换灯', '非照明剥离'] },
  series: [{
    type: 'bar', data: [3200000, 1680000, 960000, 520000, 362360, 120000],
    itemStyle: {
      borderRadius: [0, 4, 4, 0],
      color: (p) => ['#10b981','#06b6d4','#6366f1','#a855f7','#f59e0b','#ef4444'][p.dataIndex]
    },
    label: { show: true, position: 'right', formatter: p => (p.value / 10000).toFixed(1) + ' 万' }
  }]
}))

const trendOption = computed(() => {
  const months = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
  const thisYear = [480000, 462000, 512000, 540000, 580000, 612000, 630000, 612000, 580000, 542000, 492000, 460000]
  const lastYear = [380000, 362000, 412000, 440000, 480000, 512000, 530000, 512000, 480000, 442000, 392000, 360000]
  return {
    tooltip: { trigger: 'axis' },
    legend: { data: ['2026 年', '2025 年'], top: 0 },
    grid: { left: 50, right: 20, bottom: 30, top: 40 },
    xAxis: { type: 'category', data: months },
    yAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed', color: '#e5e7eb' } } },
    series: [
      { name: '2026 年', type: 'line', smooth: true, data: thisYear, itemStyle: { color: '#10b981' }, areaStyle: { opacity: 0.15 } },
      { name: '2025 年', type: 'line', smooth: true, data: lastYear, itemStyle: { color: '#94a3b8' }, lineStyle: { type: 'dashed' } }
    ]
  }
})

const projects = ref([
  { name: '先导路 LED 整体换代', region: '先导区', strategy: 'LED 改造', annualSave: 1286000, invest: 820000, payback: 2.1, mode: 'EMC', status: '已验收' },
  { name: '麓谷产业园智能调光', region: '高新区', strategy: '智能调光', annualSave: 682000, invest: 320000, payback: 1.2, mode: '合同', status: '已验收' },
  { name: '梅溪湖夜间降功率', region: '岳麓区', strategy: '夜间降功率', annualSave: 426000, invest: 60000, payback: 0.7, mode: 'EMC', status: '已验收' },
  { name: '岳麓大道回路优化', region: '岳麓区', strategy: '回路优化', annualSave: 280000, invest: 180000, payback: 2.5, mode: 'EMC', status: '实施中' },
  { name: '望城区光衰专项换灯', region: '望城区', strategy: '光衰换灯', annualSave: 168000, invest: 260000, payback: 3.8, mode: '合同', status: '实施中' },
  { name: '雨花区分表剥离非照明', region: '雨花区', strategy: '非照明剥离', annualSave: 82000, invest: 45000, payback: 1.8, mode: 'EMC', status: '已验收' },
  { name: '开福区智能调光二期', region: '开福区', strategy: '智能调光', annualSave: 512000, invest: 260000, payback: 1.4, mode: 'EMC', status: '实施中' },
  { name: '先导路 5G 路灯替换', region: '先导区', strategy: 'LED 改造', annualSave: 760000, invest: 520000, payback: 2.5, mode: 'EMC', status: '实施中' }
])
</script>

<style lang="scss" scoped>
.zg-energy-save { padding: var(--zg-space-6); background: var(--zg-gradient-surface); min-height: calc(100vh - 120px); }
.zg-energy__head { display: flex; justify-content: space-between; align-items: center; padding-bottom: var(--zg-space-5); margin-bottom: var(--zg-space-4); border-bottom: 1px solid var(--zg-line-soft); }
.zg-energy__sigil { width: 44px; height: 44px; border-radius: var(--zg-radius-md); background: linear-gradient(135deg,#06b6d4,#6366f1); color: #fff; display: flex; align-items: center; justify-content: center; }
.zg-energy__sigil--emerald { background: linear-gradient(135deg,#10b981,#059669); }
.zg-energy__headline { display: flex; gap: var(--zg-space-3); align-items: center; }
.zg-energy__copy h1 { margin: 0; font-size: var(--zg-text-display-md); font-weight: 700; }
.zg-energy__copy p { margin: 2px 0 0; font-size: var(--zg-text-body-sm); color: var(--zg-ink-tertiary); }

.zg-energy__kpi-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: var(--zg-space-4); margin-bottom: var(--zg-space-5); }
.zg-energy__kpi { padding: var(--zg-space-4); border-radius: var(--zg-radius-lg); color: #fff; position: relative; overflow: hidden; }
.zg-energy__kpi-top { display: flex; justify-content: space-between; align-items: center; opacity: 0.9; }
.zg-energy__kpi-lbl { font-size: 13px; opacity: 0.9; }
.zg-energy__kpi-num { font-size: 28px; font-weight: 800; font-family: var(--zg-font-mono); margin: 8px 0 4px; letter-spacing: -0.01em; }
.zg-energy__kpi-sub { display: flex; justify-content: space-between; align-items: center; font-size: 12px; opacity: 0.9; }

.zg-energy__main { display: grid; grid-template-columns: 1fr 1fr; gap: var(--zg-space-4); margin-bottom: var(--zg-space-4); }
.zg-energy__chart-card, .zg-energy__proj-card { background: var(--zg-surface-card); border: 1px solid var(--zg-line-soft); border-radius: var(--zg-radius-lg); padding: var(--zg-space-4); }
.zg-energy__chart-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--zg-space-3); }
.zg-energy__chart-head h3 { margin: 0; font-size: var(--zg-text-body); font-weight: 600; display: flex; gap: 6px; align-items: center; }
.zg-energy__echart { height: 340px; width: 100%; }
</style>
