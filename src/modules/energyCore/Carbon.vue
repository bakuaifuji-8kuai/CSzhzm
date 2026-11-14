<!-- 智光云枢 · 能耗专项 · Carbon 碳减排核算 -->
<template>
  <section class="zg-energy-carbon">
    <header class="zg-energy__head">
      <div class="zg-energy__headline">
        <div class="zg-energy__sigil zg-energy__sigil--emerald"><el-icon :size="22"><Coin /></el-icon></div>
        <div class="zg-energy__copy">
          <h1>碳减排核算</h1>
          <p>湖南省 OM 法 0.5810 kg CO₂/kWh · 等效树木 / SO₂ / NOₓ · 政府报送 / 碳资产台账</p>
        </div>
      </div>
      <div class="zg-energy__cta">
        <el-button type="primary" :icon="Sunny">生成碳证书</el-button>
        <el-button :icon="Download">碳资产报表</el-button>
      </div>
    </header>

    <!-- 四大指标 -->
    <div class="zg-energy__kpi-grid">
      <div v-for="k in kpis" :key="k.label" class="zg-energy__kpi" :style="{ background: k.bg }">
        <div class="zg-energy__kpi-top">
          <span class="zg-energy__kpi-lbl">{{ k.label }}</span>
          <el-icon :size="22"><component :is="k.icon" /></el-icon>
        </div>
        <div class="zg-energy__kpi-num">{{ k.value }}</div>
        <div class="zg-energy__kpi-sub">{{ k.sub }}</div>
      </div>
    </div>

    <!-- 区域对比 + 趋势 -->
    <div class="zg-energy__main">
      <div class="zg-energy__chart-card">
        <div class="zg-energy__chart-head">
          <h3>区域碳减排对比</h3>
          <el-tag>吨 CO₂ / 年</el-tag>
        </div>
        <v-chart class="zg-energy__echart" :option="regionBarOption" autoresize />
      </div>
      <div class="zg-energy__chart-card">
        <div class="zg-energy__chart-head">
          <h3>月度碳减排趋势</h3>
          <el-tag>吨 CO₂</el-tag>
        </div>
        <v-chart class="zg-energy__echart" :option="monthTrendOption" autoresize />
      </div>
    </div>

    <!-- 减排换算表 -->
    <div class="zg-energy__equiv-card">
      <div class="zg-energy__chart-head">
        <h3><el-icon><Document /></el-icon>减排量等效换算（IPCC 默认系数）</h3>
        <span class="text-slate-400 text-xs">基准年 2020 · 方法学 CM-001</span>
      </div>
      <el-table :data="equivalents" stripe size="small">
        <el-table-column prop="item" label="换算项目" width="200" />
        <el-table-column prop="formula" label="计算公式" width="260">
          <template #default="{ row }"><code class="zg-formula">{{ row.formula }}</code></template>
        </el-table-column>
        <el-table-column prop="coef" label="系数" width="120" />
        <el-table-column prop="result" label="减排成果" width="160" align="right">
          <template #default="{ row }"><span class="font-mono font-bold text-emerald-600">{{ row.result }}</span></template>
        </el-table-column>
        <el-table-column prop="desc" label="说明" />
      </el-table>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Coin, Download, Sunny, Document, WindPower, Connection } from "@element-plus/icons-vue"
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
use([CanvasRenderer, BarChart, LineChart, GridComponent, TooltipComponent, LegendComponent])

const kpis = ref([
  { label: '年减 CO₂', value: '3,975 吨', sub: '湖南省 OM 法', icon: Sunny, bg: 'linear-gradient(135deg,#10b981,#059669)' },
  { label: '等效种树', value: '218,400 棵', sub: '18 kg 树·年', icon: Sunny, bg: 'linear-gradient(135deg,#06b6d4,#22d3ee)' },
  { label: 'SO₂ 减排', value: '162.4 吨', sub: '系数 40.8 kg/MWh', icon: WindPower, bg: 'linear-gradient(135deg,#6366f1,#818cf8)' },
  { label: 'NOₓ 减排', value: '98.6 吨', sub: '系数 24.8 kg/MWh', icon: Connection, bg: 'linear-gradient(135deg,#f59e0b,#fbbf24)' }
])

const regionBarOption = computed(() => {
  const regions = ['先导区', '岳麓区', '高新区', '望城区', '雨花区', '开福区']
  const thisYear = [1280, 890, 720, 410, 480, 195]
  const lastYear = [980, 720, 580, 340, 380, 160]
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['2026 年', '2025 年'], top: 0 },
    grid: { left: 40, right: 20, bottom: 30, top: 40 },
    xAxis: { type: 'category', data: regions },
    yAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed', color: '#e5e7eb' } } },
    series: [
      { name: '2026 年', type: 'bar', data: thisYear, itemStyle: { color: '#10b981', borderRadius: [4,4,0,0] } },
      { name: '2025 年', type: 'bar', data: lastYear, itemStyle: { color: '#94a3b8', borderRadius: [4,4,0,0] } }
    ]
  }
})

const monthTrendOption = computed(() => {
  const months = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
  const data = [280, 268, 302, 324, 348, 368, 372, 360, 342, 318, 288, 272]
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 20, bottom: 30, top: 20 },
    xAxis: { type: 'category', data: months, boundaryGap: false },
    yAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed', color: '#e5e7eb' } } },
    series: [{
      type: 'line', smooth: true, data,
      lineStyle: { color: '#10b981', width: 3 },
      itemStyle: { color: '#10b981' },
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [
        { offset: 0, color: 'rgba(16,185,129,0.4)' }, { offset: 1, color: 'rgba(16,185,129,0.05)' }
      ]}},
      markPoint: { data: [{ type: 'max', name: '峰值' }, { type: 'min', name: '谷值' }] }
    }]
  }
})

const equivalents = ref([
  { item: '等效种植树木', formula: '减碳量 ÷ 每棵树年固碳', coef: '18 kg CO₂/棵·年', result: '218,400 棵', desc: '平均每棵成年树每年固碳约 18kg' },
  { item: 'SO₂ 减排量', formula: '节电量 × SO₂ 排放因子', coef: '40.8 kg/MWh', result: '162.4 吨', desc: '湖南省电网大气污染物排放系数' },
  { item: 'NOₓ 减排量', formula: '节电量 × NOₓ 排放因子', coef: '24.8 kg/MWh', result: '98.6 吨', desc: '同上' },
  { item: '烟尘减排量', formula: '节电量 × 烟尘排放因子', coef: '4.2 kg/MWh', result: '16.7 吨', desc: '同上' },
  { item: '标煤节约量', formula: '节电量 × 供电煤耗率', coef: '305 g/kWh', result: '2,087 吨', desc: '国家发改委公开数据' },
  { item: '家用轿车停驶等效', formula: '减碳量 ÷ 单车年排放', coef: '1.8 吨/辆·年', result: '2,208 辆', desc: '每辆小轿车年平均排放 1.8 吨 CO₂' }
])
</script>

<style lang="scss" scoped>
.zg-energy-carbon { padding: var(--zg-space-6); background: var(--zg-gradient-surface); min-height: calc(100vh - 120px); }
.zg-energy__head { display: flex; justify-content: space-between; align-items: center; padding-bottom: var(--zg-space-5); margin-bottom: var(--zg-space-4); border-bottom: 1px solid var(--zg-line-soft); }
.zg-energy__sigil { width: 44px; height: 44px; border-radius: var(--zg-radius-md); background: linear-gradient(135deg,#06b6d4,#6366f1); color: #fff; display: flex; align-items: center; justify-content: center; }
.zg-energy__sigil--emerald { background: linear-gradient(135deg,#10b981,#059669); }
.zg-energy__headline { display: flex; gap: var(--zg-space-3); align-items: center; }
.zg-energy__copy h1 { margin: 0; font-size: var(--zg-text-display-md); font-weight: 700; }
.zg-energy__copy p { margin: 2px 0 0; font-size: var(--zg-text-body-sm); color: var(--zg-ink-tertiary); }

.zg-energy__kpi-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: var(--zg-space-4); margin-bottom: var(--zg-space-5); }
.zg-energy__kpi { padding: var(--zg-space-4); border-radius: var(--zg-radius-lg); color: #fff; }
.zg-energy__kpi-top { display: flex; justify-content: space-between; opacity: 0.9; }
.zg-energy__kpi-lbl { font-size: 13px; opacity: 0.9; }
.zg-energy__kpi-num { font-size: 28px; font-weight: 800; font-family: var(--zg-font-mono); margin: 8px 0 4px; }
.zg-energy__kpi-sub { font-size: 12px; opacity: 0.9; }

.zg-energy__main { display: grid; grid-template-columns: 1fr 1fr; gap: var(--zg-space-4); margin-bottom: var(--zg-space-4); }
.zg-energy__chart-card, .zg-energy__equiv-card { background: var(--zg-surface-card); border: 1px solid var(--zg-line-soft); border-radius: var(--zg-radius-lg); padding: var(--zg-space-4); }
.zg-energy__chart-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--zg-space-3); }
.zg-energy__chart-head h3 { margin: 0; font-size: var(--zg-text-body); font-weight: 600; display: flex; gap: 6px; align-items: center; }
.zg-energy__echart { height: 340px; width: 100%; }
.zg-formula { font-size: 12px; color: var(--zg-ink-secondary); background: var(--zg-surface-muted); padding: 2px 6px; border-radius: 4px; }
</style>
