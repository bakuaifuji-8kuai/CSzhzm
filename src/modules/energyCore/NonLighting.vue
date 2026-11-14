<!-- 智光云枢 · 能耗专项 · NonLighting 非照明用电监测 -->
<template>
  <section class="zg-energy-nonlight">
    <header class="zg-energy__head">
      <div class="zg-energy__headline">
        <div class="zg-energy__sigil zg-energy__sigil--violet"><el-icon :size="22"><Coin /></el-icon></div>
        <div class="zg-energy__copy">
          <h1>非照明用电监测</h1>
          <p>交安 · 天网 · 公交站 · 环卫驿站 —— 照明箱变内的非照明负荷台账</p>
        </div>
      </div>
      <div class="zg-energy__cta">
        <el-button type="primary" :icon="Plus">新增点位</el-button>
        <el-button :icon="Download">导出台账</el-button>
      </div>
    </header>

    <!-- 顶部汇总 -->
    <div class="zg-metrics">
      <div v-for="m in metrics" :key="m.label" class="zg-metrics__cell">
        <span class="zg-metrics__icon" :style="{ background: m.bg }"><el-icon :size="18"><component :is="m.icon" /></el-icon></span>
        <div class="zg-metrics__body">
          <div class="zg-metrics__num">{{ m.value }}</div>
          <div class="zg-metrics__lbl">{{ m.label }}</div>
        </div>
      </div>
    </div>

    <div class="zg-energy__main">
      <!-- 点位表 -->
      <div class="zg-energy__table-wrap">
        <div class="zg-filterband zg-filterband--tight">
          <el-select v-model="filter.type" placeholder="类型" style="width:140px" clearable>
            <el-option v-for="t in ['交安','天网','公交站','环卫驿站']" :key="t" :label="t" :value="t" />
          </el-select>
          <el-select v-model="filter.region" placeholder="区域" style="width:140px" clearable>
            <el-option v-for="r in regions" :key="r" :label="r" :value="r" />
          </el-select>
          <el-input v-model="filter.keyword" placeholder="搜索点位 / 权属单位" :prefix-icon="Search" style="width:220px" clearable />
          <el-button type="primary" :icon="Search" size="small">查询</el-button>
        </div>
        <el-table :data="filteredPoints" stripe size="small" height="520">
          <el-table-column type="index" width="48" />
          <el-table-column prop="name" label="点位名称" width="220" />
          <el-table-column prop="type" label="类型" width="110">
            <template #default="{ row }">
              <el-tag :type="typeColor(row.type)" effect="plain" size="small">{{ row.type }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="loop" label="所属回路" width="120" />
          <el-table-column prop="monthUse" label="月用电量 kWh" width="130" align="right">
            <template #default="{ row }"><span class="font-mono font-semibold">{{ row.monthUse.toLocaleString() }}</span></template>
          </el-table-column>
          <el-table-column prop="owner" label="权属单位" width="160" />
          <el-table-column prop="lnglat" label="地理坐标" width="200" />
          <el-table-column prop="status" label="在线" width="80">
            <template #default="{ row }">
              <span class="dot dot--{{ row.status === '在线' ? 'green' : 'red' }}"></span>{{ row.status }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default><el-button link type="primary" size="small">查看</el-button><el-button link type="primary" size="small">能耗</el-button></template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 类型占比饼图 -->
      <div class="zg-energy__side">
        <div class="zg-energy__chart-card">
          <div class="zg-energy__chart-head"><h3>类型占比（按点位）</h3><el-tag>共 {{ points.length }} 个</el-tag></div>
          <v-chart class="zg-energy__echart--med" :option="pieOption" autoresize />
        </div>
        <div class="zg-energy__mini-list">
          <h4>类型月耗电排行</h4>
          <div v-for="r in typeRank" :key="r.name" class="zg-energy__rank-row">
            <div class="zg-energy__rank-head">
              <span class="zg-energy__rank-name">{{ r.name }}</span>
              <span class="zg-energy__rank-val">{{ r.kwh.toLocaleString() }} kWh</span>
            </div>
            <el-progress :percentage="Math.round(r.kwh / 140000 * 100)" :show-text="false" :color="r.color" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { Coin, Download, Plus, Search, Monitor, Camera, Box, House } from "@element-plus/icons-vue"
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart } from 'echarts/charts'
import { TooltipComponent, LegendComponent } from 'echarts/components'
use([CanvasRenderer, PieChart, TooltipComponent, LegendComponent])

const regions = ['先导区', '岳麓区', '高新区', '望城区', '雨花区', '开福区']
const filter = reactive({ type: '', region: '', keyword: '' })

function typeColor(t) {
  return t === '交安' ? 'danger' : t === '天网' ? 'warning' : t === '公交站' ? 'info' : ''
}

const metrics = ref([
  { label: '非照明点位', value: '268', icon: Monitor, bg: 'linear-gradient(135deg,#6366f1,#818cf8)' },
  { label: '月总用电', value: '138,560', icon: Camera, bg: 'linear-gradient(135deg,#06b6d4,#22d3ee)' },
  { label: '占箱变比', value: '3.8%', icon: Box, bg: 'linear-gradient(135deg,#f59e0b,#fbbf24)' },
  { label: '权属单位', value: '12', icon: House, bg: 'linear-gradient(135deg,#10b981,#34d399)' }
])

const points = ref([
  { name: '先导路 K0+820 交安卡口', type: '交安', loop: 'L1-003', monthUse: 3200, owner: '长沙交警支队', lnglat: '112.9342°, 28.2231°', status: '在线' },
  { name: '麓谷大道 K1+200 天网摄像头', type: '天网', loop: 'L3-007', monthUse: 1860, owner: '高新区公安分局', lnglat: '112.8876°, 28.2456°', status: '在线' },
  { name: '梅溪湖环湖路西公交站屏', type: '公交站', loop: 'L4-006', monthUse: 2480, owner: '长沙公交集团', lnglat: '112.9012°, 28.2103°', status: '离线' },
  { name: '先导路东环卫驿站', type: '环卫驿站', loop: 'L1-003', monthUse: 920, owner: '岳麓环卫局', lnglat: '112.9518°, 28.2314°', status: '在线' },
  { name: '岳麓隧道南口交安卡口', type: '交安', loop: 'L5-012', monthUse: 3650, owner: '长沙交警支队', lnglat: '112.9201°, 28.2543°', status: '在线' },
  { name: '麓谷产业园东门天网', type: '天网', loop: 'L3-011', monthUse: 1420, owner: '高新区公安分局', lnglat: '112.8754°, 28.2489°', status: '在线' },
  { name: '先导路 K2+100 公交站', type: '公交站', loop: 'L1-009', monthUse: 2260, owner: '长沙公交集团', lnglat: '112.9412°, 28.2299°', status: '在线' },
  { name: '梅溪湖环卫驿站（南）', type: '环卫驿站', loop: 'L4-015', monthUse: 880, owner: '岳麓环卫局', lnglat: '112.9105°, 28.2018°', status: '在线' },
  { name: '先导路 K3+500 交安卡口', type: '交安', loop: 'L1-016', monthUse: 3120, owner: '长沙交警支队', lnglat: '112.9623°, 28.2382°', status: '在线' },
  { name: '岳麓大道西段天网', type: '天网', loop: 'L5-008', monthUse: 1680, owner: '高新区公安分局', lnglat: '112.9078°, 28.2614°', status: '离线' },
  { name: '麓谷大道北公交站', type: '公交站', loop: 'L3-020', monthUse: 2140, owner: '长沙公交集团', lnglat: '112.8691°, 28.2567°', status: '在线' },
  { name: '先导路西环卫驿站', type: '环卫驿站', loop: 'L2-013', monthUse: 980, owner: '岳麓环卫局', lnglat: '112.9156°, 28.2278°', status: '在线' },
  { name: '望城区府北交安卡口', type: '交安', loop: 'W-001', monthUse: 3480, owner: '长沙交警支队', lnglat: '112.8123°, 28.3156°', status: '在线' },
  { name: '雨花区政府东天网', type: '天网', loop: 'Y-002', monthUse: 1560, owner: '雨花公安分局', lnglat: '112.9845°, 28.1678°', status: '在线' },
  { name: '开福区浏阳河公交站', type: '公交站', loop: 'K-003', monthUse: 2380, owner: '长沙公交集团', lnglat: '112.9456°, 28.2812°', status: '在线' },
  { name: '高新区环卫驿站', type: '环卫驿站', loop: 'G-004', monthUse: 1020, owner: '高新区城管局', lnglat: '112.8654°, 28.2467°', status: '在线' }
])

const filteredPoints = computed(() => points.value.filter(p =>
  (!filter.type || p.type === filter.type) &&
  (!filter.region || (regions.includes(filter.region))) &&
  (!filter.keyword || p.name.includes(filter.keyword) || p.owner.includes(filter.keyword))
))

const typeRank = computed(() => ([
  { name: '交安卡口', kwh: 48520, color: '#ef4444' },
  { name: '公交站屏', kwh: 43210, color: '#6366f1' },
  { name: '天网摄像头', kwh: 21560, color: '#f59e0b' },
  { name: '环卫驿站', kwh: 25270, color: '#10b981' }
]))

const pieOption = computed(() => ({
  tooltip: { trigger: 'item', formatter: '{b}: {c} 个 ({d}%)' },
  legend: { bottom: 0 },
  series: [{
    type: 'pie', radius: ['40%', '68%'], center: ['50%', '42%'],
    itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
    label: { formatter: '{b}\n{c} 个' },
    data: [
      { value: 86, name: '交安', itemStyle: { color: '#ef4444' } },
      { value: 92, name: '天网', itemStyle: { color: '#f59e0b' } },
      { value: 58, name: '公交站', itemStyle: { color: '#6366f1' } },
      { value: 32, name: '环卫驿站', itemStyle: { color: '#10b981' } }
    ]
  }]
}))
</script>

<style lang="scss" scoped>
.zg-energy-nonlight { padding: var(--zg-space-6); background: var(--zg-gradient-surface); min-height: calc(100vh - 120px); }
.zg-energy__head { display: flex; justify-content: space-between; align-items: center; padding-bottom: var(--zg-space-5); margin-bottom: var(--zg-space-4); border-bottom: 1px solid var(--zg-line-soft); }
.zg-energy__sigil { width: 44px; height: 44px; border-radius: var(--zg-radius-md); background: linear-gradient(135deg,#06b6d4,#6366f1); color: #fff; display: flex; align-items: center; justify-content: center; }
.zg-energy__sigil--violet { background: linear-gradient(135deg,#6366f1,#a855f7); }
.zg-energy__headline { display: flex; gap: var(--zg-space-3); align-items: center; }
.zg-energy__copy h1 { margin: 0; font-size: var(--zg-text-display-md); font-weight: 700; }
.zg-energy__copy p { margin: 2px 0 0; font-size: var(--zg-text-body-sm); color: var(--zg-ink-tertiary); }

.zg-metrics { display: grid; grid-template-columns: repeat(4,1fr); gap: var(--zg-space-4); margin-bottom: var(--zg-space-5); }
.zg-metrics__cell { display: flex; gap: var(--zg-space-3); padding: var(--zg-space-4); background: var(--zg-surface-card); border: 1px solid var(--zg-line-soft); border-radius: var(--zg-radius-lg); box-shadow: var(--zg-shadow-card); }
.zg-metrics__icon { width: 42px; height: 42px; border-radius: var(--zg-radius-md); display: flex; align-items: center; justify-content: center; color: #fff; flex-shrink: 0; }
.zg-metrics__num { font-size: 22px; font-weight: 800; font-family: var(--zg-font-mono); }
.zg-metrics__lbl { font-size: 12px; color: var(--zg-ink-tertiary); margin-top: 2px; }

.zg-energy__main { display: grid; grid-template-columns: 1fr 360px; gap: var(--zg-space-4); }
.zg-energy__table-wrap, .zg-energy__chart-card, .zg-energy__side > .zg-energy__mini-list { background: var(--zg-surface-card); border: 1px solid var(--zg-line-soft); border-radius: var(--zg-radius-lg); padding: var(--zg-space-4); }
.zg-energy__side { display: flex; flex-direction: column; gap: var(--zg-space-4); }
.zg-energy__chart-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--zg-space-3); h3 { margin: 0; font-size: var(--zg-text-body); font-weight: 600; } }
.zg-energy__echart--med { height: 260px; width: 100%; }
.zg-energy__mini-list h4 { margin: 0 0 var(--zg-space-3); font-size: var(--zg-text-body); font-weight: 600; }
.zg-energy__rank-row { margin-bottom: var(--zg-space-3); }
.zg-energy__rank-head { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 13px; }
.zg-energy__rank-val { font-family: var(--zg-font-mono); font-weight: 600; color: var(--zg-ink-secondary); }

.dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 4px; vertical-align: middle; }
.dot--green { background: #10b981; } .dot--red { background: #ef4444; }
</style>
