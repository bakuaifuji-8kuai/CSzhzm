<!--
  智光云枢 · 运维组织 · 车辆轨迹与考核
  业务域：opsOrg
  功能：运维车辆实时在线状态、今日行驶里程、覆盖区域、禁区违规统计 + 考核指标雷达图
-->
<template>
  <section class="zg-vehicle-perf">
    <header class="zg-vehicle-perf__head">
      <div class="zg-vehicle-perf__headline">
        <div class="zg-vehicle-perf__sigil">
          <el-icon :size="22"><Monitor /></el-icon>
        </div>
        <div class="zg-vehicle-perf__copy">
          <h1 class="zg-vehicle-perf__title">车辆轨迹与考核</h1>
          <p class="zg-vehicle-perf__sub">运维车辆实时监控 · 行驶轨迹 · 覆盖效率 · 考核雷达图</p>
        </div>
      </div>
      <div class="zg-vehicle-perf__cta">
        <el-date-picker v-model="dateRange" type="daterange" range-separator="至"
          start-placeholder="开始日期" end-placeholder="结束日期" style="width: 260px" />
        <el-button type="primary"><el-icon><Search /></el-icon><span>查询</span></el-button>
      </div>
    </header>

    <!-- 指标卡 -->
    <div class="zg-metrics">
      <div class="zg-metrics__cell zg-metrics__cell--success">
        <span class="zg-metrics__num">{{ kpi.onlineCount }}<em>/{{ kpi.totalCount }}</em></span>
        <span class="zg-metrics__lbl">今日在线车辆数</span>
      </div>
      <div class="zg-metrics__cell">
        <span class="zg-metrics__num">{{ kpi.totalMileage.toLocaleString() }}<em>km</em></span>
        <span class="zg-metrics__lbl">总行驶里程</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--primary">
        <span class="zg-metrics__num">{{ kpi.avgCoverage }}<em>%</em></span>
        <span class="zg-metrics__lbl">平均覆盖率</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--danger">
        <span class="zg-metrics__num">{{ kpi.restrictedCount }}</span>
        <span class="zg-metrics__lbl">禁区进入次数</span>
      </div>
    </div>

    <div class="zg-layout">
      <!-- 左侧：车辆列表 -->
      <div class="zg-layout__left">
        <div class="zg-panel zg-panel--vehicle">
          <div class="zg-panel__head">
            <el-icon><List /></el-icon>
            <span>运维车辆列表</span>
            <el-tag size="small" type="success" effect="dark" class="ml-auto">{{ vehicles.length }} 辆</el-tag>
          </div>

          <div class="zg-filterband zg-filterband--compact">
            <el-input v-model="keyword" placeholder="搜索车牌号 / 驾驶员" clearable size="small" style="width: 200px">
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
            <el-switch v-model="onlyOnline" active-text="仅在线" inactive-text="全部" />
          </div>

          <el-table :data="filteredVehicles" stripe border size="small" class="zg-datatable">
            <el-table-column prop="plateNo" label="车牌号" width="110" fixed />
            <el-table-column prop="driver" label="驾驶员" width="90" align="center" />
            <el-table-column label="今日里程" width="120" align="right">
              <template #default="{ row }">
                <span class="font-mono">{{ row.todayMileage.toFixed(1) }} km</span>
              </template>
            </el-table-column>
            <el-table-column label="覆盖区域" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.coveredZones >= 5 ? 'success' : row.coveredZones >= 3 ? 'warning' : 'info'" size="small">
                  {{ row.coveredZones }} 个
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="关联工单" width="100" align="right">
              <template #default="{ row }">
                <span :class="{ 'text-red-500 font-semibold': row.ticketCount >= 5 }">{{ row.ticketCount }}</span>
              </template>
            </el-table-column>
            <el-table-column label="禁区进入" width="110" align="center">
              <template #default="{ row }">
                <template v-if="row.restrictedEntries > 0">
                  <el-badge :value="row.restrictedEntries" type="danger" class="cursor-pointer">
                    <el-tag type="danger" size="small">⚠</el-tag>
                  </el-badge>
                </template>
                <span v-else class="text-slate-300">—</span>
              </template>
            </el-table-column>
            <el-table-column label="在线状态" width="100" align="center">
              <template #default="{ row }">
                <span class="zg-status dot" :class="row.online ? 'online' : 'offline'">
                  {{ row.online ? '在线' : '离线' }}
                </span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <!-- 右侧：雷达图 + 详情 -->
      <div class="zg-layout__right">
        <div class="zg-panel zg-panel--radar">
          <div class="zg-panel__head">
            <el-icon><Connection /></el-icon>
            <span>考核指标雷达图</span>
          </div>

          <!-- SVG 雷达图 -->
          <div class="zg-radar">
            <svg viewBox="0 0 240 240" class="zg-radar__svg">
              <!-- 网格 -->
              <g v-for="(rings, ri) in 5" :key="ri">
                <polygon
                  :points="radarPolygonPoints(ri * 20)"
                  fill="none" stroke="#e2e8f0" stroke-width="1"
                />
              </g>
              <!-- 轴线 -->
              <line v-for="(_, i) in 5" :key="'a'+i"
                :x1="120" :y1="120"
                :x2="120 + 100 * Math.cos((Math.PI / 2) - i * (2 * Math.PI / 5))"
                :y2="120 - 100 * Math.sin((Math.PI / 2) - i * (2 * Math.PI / 5))"
                stroke="#e2e8f0" stroke-width="1"
              />
              <!-- 数据多边形 -->
              <polygon :points="radarDataPoints()"
                fill="rgba(99,102,241,0.25)" stroke="#6366f1" stroke-width="2" />
              <!-- 数据点 -->
              <circle v-for="(v, i) in radarData" :key="'d'+i"
                :cx="120 + (v.value * 1) * Math.cos((Math.PI / 2) - i * (2 * Math.PI / 5))"
                :cy="120 - (v.value * 1) * Math.sin((Math.PI / 2) - i * (2 * Math.PI / 5))"
                r="4" fill="#6366f1" stroke="#fff" stroke-width="2" />
              <!-- 标签 -->
              <text v-for="(v, i) in radarData" :key="'t'+i"
                :x="120 + 115 * Math.cos((Math.PI / 2) - i * (2 * Math.PI / 5))"
                :y="120 - 115 * Math.sin((Math.PI / 2) - i * (2 * Math.PI / 5))"
                text-anchor="middle" dominant-baseline="middle"
                font-size="12" fill="#52525b" font-weight="500"
              >{{ v.label }}</text>
            </svg>
          </div>

          <div class="zg-radar-legend">
            <div v-for="v in radarData" :key="v.label" class="zg-radar-legend__item">
              <span class="zg-radar-legend__lbl">{{ v.label }}</span>
              <div class="zg-radar-legend__track">
                <div class="zg-radar-legend__fill" :style="{ width: v.value + '%' }"></div>
              </div>
              <span class="zg-radar-legend__val">{{ v.score }}</span>
            </div>
          </div>
        </div>

        <!-- 违规统计 -->
        <div class="zg-panel zg-panel--violation">
          <div class="zg-panel__head">
            <el-icon><Warning /></el-icon>
            <span>禁区进入 TOP 车辆</span>
          </div>
          <div class="zg-violation-list">
            <div v-for="(v, i) in topViolations" :key="v.plateNo" class="zg-violation-item">
              <span class="zg-violation-item__rank" :class="{ 'is-top3': i < 3 }">{{ i + 1 }}</span>
              <span class="zg-violation-item__plate">{{ v.plateNo }}</span>
              <span class="zg-violation-item__driver">{{ v.driver }}</span>
              <el-tag type="danger" size="small">{{ v.restrictedEntries }} 次</el-tag>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Monitor, Search, List, Connection, Warning } from "@element-plus/icons-vue"

const dateRange = ref(null)
const keyword = ref('')
const onlyOnline = ref(false)

const kpi = ref({
  totalCount: 28,
  onlineCount: 25,
  totalMileage: 4256,
  avgCoverage: 78,
  restrictedCount: 8
})

// 车辆 mock - 14 条
const vehicles = ref([
  { plateNo: '湘A·B1234', driver: '张师傅', todayMileage: 285.6, coveredZones: 8, ticketCount: 6, restrictedEntries: 0, online: true },
  { plateNo: '湘A·C5678', driver: '李师傅', todayMileage: 210.3, coveredZones: 6, ticketCount: 4, restrictedEntries: 0, online: true },
  { plateNo: '湘A·D9012', driver: '王师傅', todayMileage: 312.8, coveredZones: 9, ticketCount: 8, restrictedEntries: 2, online: true },
  { plateNo: '湘A·E3456', driver: '赵师傅', todayMileage: 178.4, coveredZones: 4, ticketCount: 2, restrictedEntries: 0, online: true },
  { plateNo: '湘A·F7890', driver: '刘师傅', todayMileage: 245.1, coveredZones: 7, ticketCount: 5, restrictedEntries: 1, online: true },
  { plateNo: '湘A·G2345', driver: '陈师傅', todayMileage: 198.7, coveredZones: 5, ticketCount: 3, restrictedEntries: 0, online: true },
  { plateNo: '湘A·H6789', driver: '杨师傅', todayMileage: 156.2, coveredZones: 3, ticketCount: 1, restrictedEntries: 3, online: true },
  { plateNo: '湘A·J0123', driver: '周师傅', todayMileage: 268.9, coveredZones: 8, ticketCount: 7, restrictedEntries: 0, online: true },
  { plateNo: '湘A·K4567', driver: '吴师傅', todayMileage: 123.5, coveredZones: 2, ticketCount: 1, restrictedEntries: 0, online: false },
  { plateNo: '湘A·L8901', driver: '徐师傅', todayMileage: 234.6, coveredZones: 6, ticketCount: 4, restrictedEntries: 1, online: true },
  { plateNo: '湘A·M2345', driver: '孙师傅', todayMileage: 189.3, coveredZones: 4, ticketCount: 2, restrictedEntries: 0, online: true },
  { plateNo: '湘A·N6789', driver: '胡师傅', todayMileage: 0, coveredZones: 0, ticketCount: 0, restrictedEntries: 0, online: false },
  { plateNo: '湘A·P0123', driver: '朱师傅', todayMileage: 345.7, coveredZones: 9, ticketCount: 9, restrictedEntries: 0, online: true },
  { plateNo: '湘A·Q4567', driver: '高师傅', todayMileage: 167.8, coveredZones: 4, ticketCount: 2, restrictedEntries: 1, online: true }
])

// 考核雷达数据（标准化 0-100）
const radarData = ref([
  { label: '里程', value: 82, score: '82分' },
  { label: '覆盖率', value: 78, score: '78分' },
  { label: '禁区违规', value: 92, score: '92分（越低越好）' },
  { label: '工单关联', value: 85, score: '85分' },
  { label: '响应时效', value: 88, score: '88分' }
])

// 过滤
const filteredVehicles = computed(() => {
  let list = vehicles.value
  if (onlyOnline.value) list = list.filter(v => v.online)
  if (keyword.value.trim()) {
    const kw = keyword.value.trim().toLowerCase()
    list = list.filter(v =>
      v.plateNo.toLowerCase().includes(kw) || v.driver.includes(kw)
    )
  }
  return list
})

// 禁区违规 TOP
const topViolations = computed(() =>
  vehicles.value.filter(v => v.restrictedEntries > 0).sort((a, b) => b.restrictedEntries - a.restrictedEntries).slice(0, 5)
)

// 雷达图工具
function radarPolygonPoints(r) {
  const pts = []
  for (let i = 0; i < 5; i++) {
    const angle = (Math.PI / 2) - i * (2 * Math.PI / 5)
    pts.push(`${120 + r * Math.cos(angle)},${120 - r * Math.sin(angle)}`)
  }
  return pts.join(' ')
}
function radarDataPoints() {
  return radarData.value.map(v => {
    const angle = (Math.PI / 2) - radarData.value.indexOf(v) * (2 * Math.PI / 5)
    const r = v.value // 0-100
    return `${120 + r * Math.cos(angle)},${120 - r * Math.sin(angle)}`
  }).join(' ')
}
</script>

<style scoped lang="scss">
.zg-vehicle-perf {
  padding: 24px;
  &__head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 20px; padding-bottom: 18px; border-bottom: 1px solid #e2e8f0; }
  &__headline { display: flex; align-items: center; gap: 14px; }
  &__sigil { width: 44px; height: 44px; border-radius: 10px; background: linear-gradient(135deg, #0ea5e9, #06b6d4); color: #fff; display: flex; align-items: center; justify-content: center; }
  &__copy { display: flex; flex-direction: column; gap: 4px; }
  &__title { font-size: 20px; font-weight: 600; margin: 0; color: #18181b; }
  &__sub { font-size: 13px; color: #71717a; margin: 0; }
  &__cta { display: flex; gap: 10px; }
}

.zg-metrics {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 18px;
  &__cell { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px 18px; display: flex; flex-direction: column; gap: 6px; box-shadow: 0 1px 3px rgba(15,23,42,0.04); position: relative; overflow: hidden;
    &::before { content: ''; position: absolute; left: 0; top: 0; width: 3px; height: 100%; background: #0ea5e9; }
    &--primary::before { background: #6366f1; }
    &--success::before { background: #059669; }
    &--warn::before { background: #d97706; }
    &--danger::before { background: #dc2626; }
  }
  &__num { font-size: 26px; font-weight: 700; color: #18181b; line-height: 1; em { font-style: normal; font-size: 14px; color: #71717a; margin-left: 4px; font-weight: 400; } }
  &__lbl { font-size: 12px; color: #71717a; }
}

.zg-layout {
  display: grid; grid-template-columns: 1.6fr 1fr; gap: 18px; align-items: start;
  &__left { display: flex; flex-direction: column; gap: 18px; }
  &__right { display: flex; flex-direction: column; gap: 18px; }
}

.zg-panel {
  background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 18px;
  &__head { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: #52525b; margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid #e2e8f0; }
  &--radar { padding: 18px; }
}

.zg-filterband {
  padding: 14px 16px; background: #f8fafc; border-radius: 10px; margin-bottom: 14px;
  &--compact { padding: 10px 14px; display: flex; align-items: center; gap: 12px; }
}

.zg-radar {
  display: flex; justify-content: center; padding: 10px 0;
  &__svg { width: 240px; height: 240px; }
}

.zg-radar-legend {
  display: flex; flex-direction: column; gap: 10px; margin-top: 14px;
  &__item { display: grid; grid-template-columns: 80px 1fr 50px; align-items: center; gap: 10px; }
  &__lbl { font-size: 12px; color: #52525b; }
  &__track { height: 8px; background: #f1f5f9; border-radius: 999px; overflow: hidden; }
  &__fill { height: 100%; background: linear-gradient(90deg, #6366f1, #8b5cf6); border-radius: 999px; }
  &__val { font-size: 12px; font-weight: 600; color: #18181b; text-align: right; }
}

.zg-violation-list {
  display: flex; flex-direction: column; gap: 8px;
}
.zg-violation-item {
  display: grid; grid-template-columns: 32px 110px 1fr auto; align-items: center; gap: 10px;
  padding: 10px 12px; background: #fef2f2; border-radius: 10px; border-left: 3px solid #dc2626;
  &__rank { width: 22px; height: 22px; border-radius: 50%; background: #e2e8f0; color: #52525b; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600;
    &.is-top3 { background: #dc2626; color: #fff; }
  }
  &__plate { font-family: ui-monospace, monospace; font-size: 13px; font-weight: 600; color: #18181b; }
  &__driver { font-size: 13px; color: #52525b; }
}

.zg-status.dot {
  display: inline-flex; align-items: center; gap: 5px; font-size: 12px; padding: 2px 8px; border-radius: 999px;
  &::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
  &.online { color: #059669; background: #d1fae5; }
  &.offline { color: #94a3b8; background: #f1f5f9; }
}

.font-mono { font-family: ui-monospace, monospace; }
.text-red-500 { color: #ef4444; }
.font-semibold { font-weight: 600; }
.text-slate-300 { color: #cbd5e1; }
.ml-auto { margin-left: auto; }
.cursor-pointer { cursor: pointer; }
</style>
