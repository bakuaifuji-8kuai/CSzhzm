<!-- 智光云枢 · 能耗专项 · Balance 电量平衡与线损分析 -->
<template>
  <section class="zg-energy-balance">
    <header class="zg-energy__head">
      <div class="zg-energy__headline">
        <div class="zg-energy__sigil zg-energy__sigil--amber"><el-icon :size="22"><Coin /></el-icon></div>
        <div class="zg-energy__copy">
          <h1>电量平衡与线损分析</h1>
          <p>箱变总表 → 回路分表 → 终端电量三层级追溯，定位异常线损回路</p>
        </div>
      </div>
      <div class="zg-energy__cta">
        <el-button type="primary" :icon="Download">导出平衡报表</el-button>
        <el-button :icon="Document">线损治理方案</el-button>
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

    <!-- Sankey + 异常列表 -->
    <div class="zg-energy__main">
      <div class="zg-energy__chart-card">
        <div class="zg-energy__chart-head">
          <h3><el-icon><Connection /></el-icon>三层级电量流向 Sankey（单位 kWh · 本月）</h3>
          <el-tag effect="plain">12 台箱变 · 48 条回路</el-tag>
        </div>
        <v-chart class="zg-energy__echart" :option="sankeyOption" autoresize />
      </div>
      <div class="zg-energy__table-card">
        <div class="zg-energy__chart-head">
          <h3>异常线损回路 TOP 12</h3>
          <el-tag type="danger" effect="plain">线损率 > 12% 需关注</el-tag>
        </div>
        <el-table :data="abnormalLoop" stripe size="small" height="380">
          <el-table-column type="index" width="48" label="#" />
          <el-table-column prop="loop" label="回路" width="120" />
          <el-table-column prop="box" label="箱变" width="110" />
          <el-table-column prop="mainMeter" label="总表 kWh" width="110" align="right" />
          <el-table-column prop="subSum" label="分表Σ kWh" width="110" align="right" />
          <el-table-column prop="loss" label="线损 kWh" width="100" align="right">
            <template #default="{ row }">
              <span class="text-rose-500 font-mono font-semibold">{{ row.loss.toLocaleString() }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="rate" label="线损率" width="100" align="right">
            <template #default="{ row }">
              <span class="loss-rate" :class="row.rate > 14 ? 'loss--danger' : 'loss--warn'">{{ row.rate }}%</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="row.status === '待处置' ? 'danger' : 'warning'" size="small">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Coin, Download, Document, Connection, Box, TrendCharts, Warning } from "@element-plus/icons-vue"
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { SankeyChart } from 'echarts/charts'
import { TooltipComponent, TitleComponent } from 'echarts/components'
use([CanvasRenderer, SankeyChart, TooltipComponent, TitleComponent])

const metrics = ref([
  { label: '总表电量', value: '2,286,540', icon: Box, bg: 'linear-gradient(135deg,#06b6d4,#22d3ee)' },
  { label: 'Σ 回路分表', value: '2,118,960', icon: Connection, bg: 'linear-gradient(135deg,#6366f1,#818cf8)' },
  { label: '线损电量', value: '167,580', icon: Warning, bg: 'linear-gradient(135deg,#f59e0b,#fbbf24)' },
  { label: '综合线损率', value: '7.32%', icon: TrendCharts, bg: 'linear-gradient(135deg,#10b981,#34d399)' }
])

// Sankey 三层级：箱变 → 回路 → 终端
const sankeyOption = computed(() => {
  const nodes = [
    // 箱变
    { name: '先导路箱变 1', itemStyle: { color: '#6366f1' } },
    { name: '先导路箱变 2', itemStyle: { color: '#6366f1' } },
    { name: '麓谷箱变 3', itemStyle: { color: '#6366f1' } },
    { name: '梅溪湖箱变 4', itemStyle: { color: '#6366f1' } },
    { name: '岳麓箱变 5', itemStyle: { color: '#6366f1' } },
    // 回路
    { name: 'L1-001 主回路', itemStyle: { color: '#06b6d4' } },
    { name: 'L1-002 辅路', itemStyle: { color: '#06b6d4' } },
    { name: 'L2-001 交叉口', itemStyle: { color: '#06b6d4' } },
    { name: 'L3-001 产业园', itemStyle: { color: '#06b6d4' } },
    { name: 'L4-001 环湖路', itemStyle: { color: '#06b6d4' } },
    { name: 'L5-001 隧道群', itemStyle: { color: '#06b6d4' } },
    // 终端
    { name: 'LED 灯具', itemStyle: { color: '#10b981' } },
    { name: '交安摄像机', itemStyle: { color: '#10b981' } },
    { name: '天网摄像头', itemStyle: { color: '#10b981' } },
    { name: '公交站屏', itemStyle: { color: '#10b981' } },
    { name: '环卫驿站', itemStyle: { color: '#10b981' } }
  ]
  const links = [
    { source: '先导路箱变 1', target: 'L1-001 主回路', value: 312000 },
    { source: '先导路箱变 1', target: 'L1-002 辅路', value: 128000 },
    { source: '先导路箱变 2', target: 'L2-001 交叉口', value: 198500 },
    { source: '麓谷箱变 3', target: 'L3-001 产业园', value: 412300 },
    { source: '梅溪湖箱变 4', target: 'L4-001 环湖路', value: 296800 },
    { source: '岳麓箱变 5', target: 'L5-001 隧道群', value: 256400 },
    { source: 'L1-001 主回路', target: 'LED 灯具', value: 268000 },
    { source: 'L1-001 主回路', target: '交安摄像机', value: 18000 },
    { source: 'L1-001 主回路', target: '天网摄像头', value: 16000 },
    { source: 'L1-002 辅路', target: 'LED 灯具', value: 110000 },
    { source: 'L1-002 辅路', target: '公交站屏', value: 8000 },
    { source: 'L2-001 交叉口', target: 'LED 灯具', value: 168000 },
    { source: 'L2-001 交叉口', target: '天网摄像头', value: 22000 },
    { source: 'L3-001 产业园', target: 'LED 灯具', value: 365000 },
    { source: 'L3-001 产业园', target: '环卫驿站', value: 18000 },
    { source: 'L4-001 环湖路', target: 'LED 灯具', value: 260000 },
    { source: 'L5-001 隧道群', target: 'LED 灯具', value: 232000 },
    { source: 'L5-001 隧道群', target: '交安摄像机', value: 14000 }
  ]
  return {
    tooltip: { trigger: 'item', triggerOn: 'mousemove', formatter: p => `${p.data.source} → ${p.data.target}<br/><b>${p.data.value.toLocaleString()} kWh</b>` },
    series: [{
      type: 'sankey', layout: 'none', emphasis: { focus: 'adjacency' },
      nodeAlign: 'left', nodeGap: 12, nodeWidth: 20,
      lineStyle: { color: 'gradient', curveness: 0.5, opacity: 0.55 },
      label: { fontSize: 12, color: '#374151' },
      data: nodes, links
    }]
  }
})

const abnormalLoop = ref([
  { loop: 'L1-003', box: '先导路 1', mainMeter: 52800, subSum: 44160, loss: 8640, rate: 16.36, status: '待处置' },
  { loop: 'L3-007', box: '麓谷 3', mainMeter: 41200, subSum: 35200, loss: 6000, rate: 14.56, status: '待处置' },
  { loop: 'L5-012', box: '岳麓 5', mainMeter: 38500, subSum: 33680, loss: 4820, rate: 12.52, status: '处置中' },
  { loop: 'L2-004', box: '先导路 2', mainMeter: 32000, subSum: 27960, loss: 4040, rate: 12.63, status: '处置中' },
  { loop: 'L4-006', box: '梅溪湖 4', mainMeter: 28600, subSum: 25040, loss: 3560, rate: 12.45, status: '待处置' },
  { loop: 'L1-009', box: '先导路 1', mainMeter: 24800, subSum: 21520, loss: 3280, rate: 13.23, status: '待处置' },
  { loop: 'L3-011', box: '麓谷 3', mainMeter: 21200, subSum: 18360, loss: 2840, rate: 13.40, status: '处置中' },
  { loop: 'L5-008', box: '岳麓 5', mainMeter: 19600, subSum: 17160, loss: 2440, rate: 12.45, status: '处置中' },
  { loop: 'L2-013', box: '先导路 2', mainMeter: 18400, subSum: 16080, loss: 2320, rate: 12.61, status: '待处置' },
  { loop: 'L4-015', box: '梅溪湖 4', mainMeter: 17200, subSum: 15040, loss: 2160, rate: 12.56, status: '处置中' },
  { loop: 'L1-016', box: '先导路 1', mainMeter: 16800, subSum: 14680, loss: 2120, rate: 12.62, status: '待处置' },
  { loop: 'L3-020', box: '麓谷 3', mainMeter: 15600, subSum: 13680, loss: 1920, rate: 12.31, status: '处置中' }
])
</script>

<style lang="scss" scoped>
.zg-energy-balance {
  padding: var(--zg-space-6);
  background: var(--zg-gradient-surface);
  min-height: calc(100vh - 120px);
}
.zg-energy__head {
  display: flex; justify-content: space-between; align-items: center;
  padding-bottom: var(--zg-space-5); margin-bottom: var(--zg-space-4);
  border-bottom: 1px solid var(--zg-line-soft);
}
.zg-energy__sigil { width: 44px; height: 44px; border-radius: var(--zg-radius-md); background: linear-gradient(135deg,#06b6d4,#6366f1); color: #fff; display: flex; align-items: center; justify-content: center; }
.zg-energy__sigil--amber { background: linear-gradient(135deg,#f59e0b,#ef4444); }
.zg-energy__headline { display: flex; gap: var(--zg-space-3); align-items: center; }
.zg-energy__copy h1 { margin: 0; font-size: var(--zg-text-display-md); font-weight: 700; }
.zg-energy__copy p { margin: 2px 0 0; font-size: var(--zg-text-body-sm); color: var(--zg-ink-tertiary); }

.zg-metrics { display: grid; grid-template-columns: repeat(4,1fr); gap: var(--zg-space-4); margin-bottom: var(--zg-space-5); }
.zg-metrics__cell { display: flex; gap: var(--zg-space-3); padding: var(--zg-space-4); background: var(--zg-surface-card); border: 1px solid var(--zg-line-soft); border-radius: var(--zg-radius-lg); box-shadow: var(--zg-shadow-card); }
.zg-metrics__icon { width: 42px; height: 42px; border-radius: var(--zg-radius-md); display: flex; align-items: center; justify-content: center; color: #fff; flex-shrink: 0; }
.zg-metrics__num { font-size: 22px; font-weight: 800; font-family: var(--zg-font-mono); }
.zg-metrics__lbl { font-size: 12px; color: var(--zg-ink-tertiary); margin-top: 2px; }

.zg-energy__main { display: grid; grid-template-columns: 1.15fr 1fr; gap: var(--zg-space-4); }
.zg-energy__chart-card, .zg-energy__table-card { background: var(--zg-surface-card); border: 1px solid var(--zg-line-soft); border-radius: var(--zg-radius-lg); padding: var(--zg-space-4); }
.zg-energy__chart-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--zg-space-3); }
.zg-energy__chart-head h3 { margin: 0; font-size: var(--zg-text-body); font-weight: 600; display: flex; gap: 6px; align-items: center; }
.zg-energy__echart { height: 480px; width: 100%; }

.loss-rate { font-family: var(--zg-font-mono); font-weight: 700; }
.loss--danger { color: #dc2626; }
.loss--warn { color: #d97706; }
</style>
