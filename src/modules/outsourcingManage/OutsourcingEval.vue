<!--
  智光云枢 · 外包商管理 · 外包商考核评价
  五维考核（响应时间 / 完成率 / 返工率 / 业主评价 / 安全）
  行内 Drawer 展示雷达图 + 历史趋势
  关联 opsTicket 本月工单量
-->
<template>
  <section class="zg-om-eval">
    <header class="zg-om-eval__head">
      <div class="zg-om-eval__headline">
        <div class="zg-om-eval__sigil"><el-icon :size="22"><DataAnalysis /></el-icon></div>
        <div class="zg-om-eval__copy">
          <h1 class="zg-om-eval__title">外包商考核评价</h1>
          <p class="zg-om-eval__sub">
            考核期 {{ currentPeriod.label }} ·
            覆盖 {{ evalRows.length }} 家外包商 ·
            平均分 {{ avgScore }} 分 ·
            C 级预警 <span class="zg-danger">{{ warnCount }}</span> 家
          </p>
        </div>
      </div>
      <div class="zg-om-eval__cta">
        <el-date-picker v-model="currentPeriodRaw" type="month" value-format="YYYY-MM"
          placeholder="选择考核期" class="zg-om-eval__period-picker">
          <template #prefix><el-icon><Calendar /></el-icon></template>
        </el-date-picker>
        <el-button type="primary"><el-icon><EditPen /></el-icon>录入考核</el-button>
        <el-button plain><el-icon><Download /></el-icon>导出报表</el-button>
      </div>
    </header>

    <!-- 权重配置卡 -->
    <div class="zg-om-eval__weightcard">
      <div class="zg-om-eval__weighthead">
        <span class="zg-om-eval__weighttitle">考核维度权重配置</span>
        <el-button link type="primary" :icon="isEditingWeight ? Check : Setting" @click="toggleWeightEdit">
          {{ isEditingWeight ? '保存' : '调整权重' }}
        </el-button>
      </div>
      <div class="zg-om-eval__weightbody">
        <div v-for="dim in dimensions" :key="dim.key" class="zg-om-eval__weightitem">
          <div class="zg-om-eval__weightlbl">
            <span class="zg-dim-dot" :style="{ background: dim.color }"></span>
            {{ dim.label }}
          </div>
          <el-slider v-if="isEditingWeight" v-model="dim.weight" :max="100" :step="5" :marks="{ 0:'0', 25:'25', 50:'50', 75:'75', 100:'100' }" show-input :show-input-controls="false" />
          <div v-else class="zg-om-eval__weightbar">
            <div class="zg-om-eval__weightfill" :style="{ width: dim.weight + '%', background: dim.color }"></div>
          </div>
          <span class="zg-om-eval__weightval">{{ dim.weight }}%</span>
        </div>
        <div class="zg-om-eval__weightsum" :class="weightSum === 100 ? 'ok' : 'err'">
          合计 {{ weightSum }}%
          <span v-if="weightSum !== 100" class="zg-weight-warn"> （权重合计须为 100%）</span>
        </div>
      </div>
    </div>

    <!-- 表格 -->
    <div class="zg-om-eval__main">
      <div class="zg-om-eval__tablewrap">
        <el-table :data="evalRows" stripe height="520" @row-click="onRowClick">
          <el-table-column prop="code" label="外包商编号" width="140" fixed="left">
            <template #default="{ row }">
              <span class="zg-om-code">{{ row.code }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="外包商名称" min-width="200">
            <template #default="{ row }">
              <span class="zg-om-name">{{ row.name }}</span>
              <el-tag v-if="row.consecutiveC >= 2" size="small" type="danger" effect="dark" class="zg-consecutive-warn">
                连续 {{ row.consecutiveC }} 月 C 级
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="综合得分" width="110" align="center" sortable :sort-method="sortBy('score')">
            <template #default="{ row }">
              <span class="zg-om-score" :class="scoreLevel(row.score)">{{ row.score }}</span>
            </template>
          </el-table-column>
          <el-table-column label="响应时间" width="110" align="center">
            <template #default="{ row }"><span class="zg-dim-score">{{ row.dims.responseTime }}</span></template>
          </el-table-column>
          <el-table-column label="完成率" width="100" align="center">
            <template #default="{ row }"><span class="zg-dim-score">{{ row.dims.completion }}</span></template>
          </el-table-column>
          <el-table-column label="返工率" width="100" align="center">
            <template #default="{ row }"><span class="zg-dim-score" :class="row.dims.rework < 75 ? 'dim-low' : ''">{{ row.dims.rework }}</span></template>
          </el-table-column>
          <el-table-column label="业主评价" width="110" align="center">
            <template #default="{ row }"><span class="zg-dim-score">{{ row.dims.ownerReview }}</span></template>
          </el-table-column>
          <el-table-column label="安全" width="90" align="center">
            <template #default="{ row }"><span class="zg-dim-score">{{ row.dims.safety }}</span></template>
          </el-table-column>
          <el-table-column label="等级" width="90" align="center">
            <template #default="{ row }">
              <span class="zg-om-level" :class="'zg-om-level--' + row.grade">{{ row.grade }}</span>
            </template>
          </el-table-column>
          <el-table-column label="本月工单" width="100" align="center">
            <template #default="{ row }">
              <span class="zg-link" @click.stop="onGotoTicket(row)">{{ row.ticketCount }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" align="center" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click.stop="onRowClick(row)">查看详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 详情 Drawer（雷达图） -->
    <el-drawer v-model="detailVisible" title="考核详情" size="540px" :close-on-click-modal="false">
      <div v-if="currentRow" class="zg-om-eval-detail">
        <div class="zg-om-eval-detail__head">
          <div class="zg-om-eval-detail__title">
            <h3>{{ currentRow.name }}</h3>
            <p>{{ currentRow.code }} · {{ currentPeriod.label }}</p>
          </div>
          <div class="zg-om-eval-detail__score">
            <span class="zg-om-score big" :class="scoreLevel(currentRow.score)">{{ currentRow.score }}</span>
            <span class="zg-om-eval-detail__label">综合得分</span>
          </div>
        </div>

        <div class="zg-om-eval-detail__radar">
          <v-chart class="zg-radar-chart" :option="radarOption(currentRow)" autoresize />
        </div>

        <div class="zg-om-eval-detail__dims">
          <div v-for="dim in dimensions" :key="dim.key" class="zg-om-eval-detail__dim">
            <div class="zg-om-eval-detail__dimhead">
              <span>
                <span class="zg-dim-dot" :style="{ background: dim.color }"></span>{{ dim.label }}
              </span>
              <span class="zg-om-eval-detail__dimweight">权重 {{ dim.weight }}%</span>
            </div>
            <el-progress :percentage="(currentRow.dims as any)[dim.key]"
              :stroke-width="10" :color="dim.color" />
          </div>
        </div>

        <div class="zg-om-eval-detail__trend">
          <h4>近 6 月综合得分趋势</h4>
          <v-chart class="zg-trend-chart" :option="trendOption(currentRow)" autoresize />
        </div>
      </div>
    </el-drawer>
  </section>
</template>

<script setup lang="ts">
/**
 * 智光云枢 · 外包商管理 · 外包商考核评价
 */
import { ref, reactive, computed, h } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  DataAnalysis, Calendar, Download, EditPen, Check, Setting
} from "@element-plus/icons-vue"
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { RadarChart, LineChart } from 'echarts/charts'
import {
  RadarComponent, TooltipComponent, LegendComponent,
  GridComponent, TitleComponent
} from 'echarts/components'

use([
  CanvasRenderer, RadarChart, LineChart,
  RadarComponent, TooltipComponent, LegendComponent,
  GridComponent, TitleComponent
])

const router = useRouter()

// ============================================================
// 维度配置（含权重）
// ============================================================
interface Dimension {
  key: string
  label: string
  color: string
  weight: number
}

const dimensions = reactive<Dimension[]>([
  { key: 'responseTime', label: '响应时间', color: '#0284c7', weight: 25 },
  { key: 'completion',    label: '完成率',   color: '#059669', weight: 25 },
  { key: 'rework',        label: '返工率',   color: '#d97706', weight: 20 },
  { key: 'ownerReview',   label: '业主评价', color: '#7c3aed', weight: 20 },
  { key: 'safety',        label: '安全',     color: '#dc2626', weight: 10 }
])

const isEditingWeight = ref(false)
const weightSum = computed(() => dimensions.reduce((a, d) => a + d.weight, 0))

function toggleWeightEdit() {
  if (isEditingWeight.value) {
    if (weightSum.value !== 100) {
      ElMessage.warning(`权重合计 ${weightSum.value}%，须调整为 100%`)
      return
    }
    ElMessage.success('权重配置已保存')
  }
  isEditingWeight.value = !isEditingWeight.value
}

// ============================================================
// 考核期
// ============================================================
const currentPeriodRaw = ref('2026-11')
const currentPeriod = computed(() => ({
  raw: currentPeriodRaw.value,
  label: (() => {
    const [y, m] = currentPeriodRaw.value.split('-')
    return `${y} 年 ${parseInt(m)} 月`
  })()
}))

// ============================================================
// Mock 考核数据
// ============================================================
interface EvalRow {
  id: number
  code: string
  name: string
  dims: Record<string, number>
  score: number
  grade: 'A' | 'B' | 'C'
  consecutiveC: number
  ticketCount: number
  trend: number[] // 近 6 月综合得分
}

function calcGrade(score: number): 'A' | 'B' | 'C' {
  if (score >= 85) return 'A'
  if (score >= 75) return 'B'
  return 'C'
}

function calcScore(dims: Record<string, number>) {
  // 按权重加权平均
  const total = dimensions.reduce((sum, d) => sum + (dims[d.key] || 0) * d.weight / 100, 0)
  return Math.round(total)
}

const MOCK_EVAL: Omit<EvalRow, 'score' | 'grade'>[] = [
  {
    id: 1, code: 'OUT-2026-001', name: '长沙光服运维服务有限公司',
    dims: { responseTime: 94, completion: 92, rework: 90, ownerReview: 93, safety: 95 },
    consecutiveC: 0, ticketCount: 318, trend: [88, 90, 89, 91, 90, 92]
  },
  {
    id: 2, code: 'OUT-2026-002', name: '岳阳恒通工程有限公司',
    dims: { responseTime: 86, completion: 84, rework: 82, ownerReview: 85, safety: 88 },
    consecutiveC: 0, ticketCount: 96, trend: [80, 82, 81, 83, 83, 84]
  },
  {
    id: 3, code: 'OUT-2026-003', name: '湘潭明辉检测技术有限公司',
    dims: { responseTime: 88, completion: 90, rework: 91, ownerReview: 87, safety: 92 },
    consecutiveC: 0, ticketCount: 42, trend: [84, 85, 86, 87, 87, 88]
  },
  {
    id: 4, code: 'OUT-2026-004', name: '株洲信达运维有限公司',
    dims: { responseTime: 78, completion: 76, rework: 72, ownerReview: 75, safety: 85 },
    consecutiveC: 0, ticketCount: 215, trend: [75, 76, 77, 78, 77, 77]
  },
  {
    // 连续 3 月 C 级预警
    id: 5, code: 'OUT-2026-005', name: '衡阳鸿远建设工程有限公司',
    dims: { responseTime: 68, completion: 70, rework: 65, ownerReview: 69, safety: 78 },
    consecutiveC: 3, ticketCount: 58, trend: [72, 70, 71, 69, 70, 70]
  },
  {
    id: 6, code: 'OUT-2026-006', name: '常德安恒检测咨询有限公司',
    dims: { responseTime: 82, completion: 84, rework: 86, ownerReview: 80, safety: 88 },
    consecutiveC: 0, ticketCount: 35, trend: [78, 79, 80, 81, 82, 82]
  }
]

// 因为权重是响应式的，用 computed 计算 score 和 grade
const evalRows = computed<EvalRow[]>(() =>
  MOCK_EVAL.map(row => {
    const score = calcScore(row.dims)
    return { ...row, score, grade: calcGrade(score) }
  })
)

const avgScore = computed(() => {
  if (!evalRows.value.length) return 0
  return Math.round(evalRows.value.reduce((a, r) => a + r.score, 0) / evalRows.value.length)
})

const warnCount = computed(() => evalRows.value.filter(r => r.grade === 'C').length)

// ============================================================
// 状态
// ============================================================
const detailVisible = ref(false)
const currentRow = ref<EvalRow | null>(null)

// ============================================================
// 工具
// ============================================================
function sortBy(key: keyof EvalRow) {
  return (a: EvalRow, b: EvalRow) => (a[key] as number) - (b[key] as number)
}
function scoreLevel(s: number) {
  if (s >= 85) return 'score-a'
  if (s >= 75) return 'score-b'
  return 'score-c'
}

// ============================================================
// 雷达图配置
// ============================================================
function radarOption(row: EvalRow) {
  const indicator = dimensions.map(d => ({
    name: d.label,
    max: 100,
    color: '#18181b'
  }))
  const values = dimensions.map(d => row.dims[d.key])
  return {
    tooltip: { trigger: 'item' },
    radar: {
      indicator,
      radius: '65%',
      center: ['50%', '55%'],
      axisName: { color: '#71717a', fontSize: 12 },
      splitArea: {
        areaStyle: {
          color: ['#ffffff', '#fafafa', '#f5f5f5', '#f0f0f0', '#ebebeb']
        }
      },
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      splitLine: { lineStyle: { color: '#e2e8f0' } }
    },
    series: [{
      type: 'radar',
      symbol: 'circle',
      symbolSize: 6,
      itemStyle: { color: '#d97706' },
      lineStyle: { color: '#d97706', width: 2 },
      areaStyle: {
        color: {
          type: 'radial', x: 0.5, y: 0.5, r: 0.5,
          colorStops: [
            { offset: 0, color: 'rgba(217, 119, 6, 0.35)' },
            { offset: 1, color: 'rgba(217, 119, 6, 0.05)' }
          ]
        }
      },
      data: [{ value: values, name: row.name }]
    }]
  }
}

// ============================================================
// 趋势图配置
// ============================================================
function trendOption(row: EvalRow) {
  const months = ['6 月', '7 月', '8 月', '9 月', '10 月', '11 月']
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 20, top: 20, bottom: 30 },
    xAxis: { type: 'category', data: months, axisLine: { lineStyle: { color: '#e2e8f0' } } },
    yAxis: {
      type: 'value', min: 50, max: 100,
      axisLine: { show: false }, splitLine: { lineStyle: { color: '#f1f5f9' } }
    },
    series: [{
      type: 'line',
      smooth: true,
      data: row.trend,
      symbol: 'circle',
      symbolSize: 8,
      itemStyle: { color: '#d97706' },
      lineStyle: { color: '#d97706', width: 2.5 },
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(217, 119, 6, 0.3)' },
            { offset: 1, color: 'rgba(217, 119, 6, 0)' }
          ]
        }
      },
      markLine: {
        silent: true,
        symbol: 'none',
        lineStyle: { color: '#dc2626', type: 'dashed' },
        data: [{ yAxis: 75, label: { formatter: 'C 级线 75', color: '#dc2626', fontSize: 10 } }]
      }
    }]
  }
}

// ============================================================
// 动作
// ============================================================
function onRowClick(row: EvalRow) {
  currentRow.value = row
  detailVisible.value = true
}
function onGotoTicket(row: EvalRow) {
  router.push({ path: '/opsTicket/outsourcing', query: { outsourceCode: row.code } })
}
</script>

<style scoped lang="scss">
.zg-om-eval {
  --zg-brand-primary: var(--zg-amber-glow, #d97706);
  --zg-success: var(--zg-emerald-success, #059669);
  --zg-warning: var(--zg-amber-glow, #d97706);
  --zg-danger: var(--zg-rose-danger, #dc2626);
  --zg-info: var(--zg-sky-info, #0284c7);
  --zg-success-soft: var(--zg-emerald-soft, #d1fae5);
  --zg-warning-soft: var(--zg-amber-soft, #fef3c7);
  --zg-danger-soft: var(--zg-rose-soft, #fee2e2);
  --zg-info-soft: var(--zg-sky-soft, #e0f2fe);
  --zg-line-soft: rgba(241,245,249,0.8);
  --zg-ink-tertiary: #71717a;
  --zg-gradient-surface: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
  --zg-gradient-primary: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
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
  &__cta { display: flex; gap: 10px; align-items: center; }
  &__period-picker { width: 160px; }

  &__weightcard {
    background: #fff; border: 1px solid var(--zg-line-soft);
    border-radius: var(--zg-radius-lg); padding: 18px 22px; margin-bottom: 18px;
  }
  &__weighthead {
    display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;
  }
  &__weighttitle { font-size: 14px; font-weight: 600; }
  &__weightbody { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px 20px; align-items: center; }
  &__weightlbl {
    font-size: 12px; color: #52525b; display: flex; align-items: center; gap: 6px; margin-bottom: 6px;
  }
  &__weightbar {
    height: 6px; background: #f1f5f9; border-radius: 3px; overflow: hidden; margin: 6px 0;
  }
  &__weightfill { height: 100%; border-radius: 3px; transition: width 200ms; }
  &__weightval { font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums; text-align: right; }
  &__weightsum {
    grid-column: 1 / -1;
    font-size: 12px; margin-top: 6px;
    &.ok { color: var(--zg-success); }
    &.err { color: var(--zg-danger); }
  }
  &__weightsum.err + .zg-weight-warn { color: var(--zg-danger); font-weight: 500; }

  &__main {
    background: #fff; border: 1px solid var(--zg-line-soft);
    border-radius: var(--zg-radius-lg); padding: 18px;
  }
  &__tablewrap { border: 1px solid var(--zg-line-soft); border-radius: var(--zg-radius-md); overflow: hidden; cursor: pointer; }
}

.zg-danger { color: var(--zg-danger); font-weight: 600; }
.zg-dim-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }

.zg-om-code { font-family: 'Geist Mono', ui-monospace, monospace; font-size: 12px; font-weight: 600; }
.zg-om-name { font-weight: 600; font-size: 13px; margin-right: 8px; }

.zg-consecutive-warn { margin-left: 6px; }

.zg-om-score {
  font-weight: 700; font-size: 15px; font-variant-numeric: tabular-nums;
  &.big { font-size: 32px; line-height: 1; }
  &.score-a { color: var(--zg-success); }
  &.score-b { color: var(--zg-warning); }
  &.score-c { color: var(--zg-danger); }
}

.zg-dim-score {
  font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums;
  &.dim-low { color: var(--zg-danger); }
}

.zg-om-level {
  display: inline-flex; align-items: center; justify-content: center;
  width: 36px; height: 26px; border-radius: 6px;
  font-size: 12px; font-weight: 700; letter-spacing: 1px;
  &--A { background: var(--zg-success-soft); color: var(--zg-success); }
  &--B { background: var(--zg-warning-soft); color: var(--zg-warning); }
  &--C { background: var(--zg-danger-soft); color: var(--zg-danger); }
}

.zg-link {
  color: var(--zg-brand-primary); cursor: pointer; font-weight: 500;
  &:hover { text-decoration: underline; }
}

.zg-om-eval-detail {
  display: flex; flex-direction: column; gap: 22px;
  &__head {
    display: flex; justify-content: space-between; align-items: flex-end;
    padding-bottom: 18px; border-bottom: 1px dashed var(--zg-line-soft);
  }
  &__title h3 { margin: 0 0 4px; font-size: 16px; }
  &__title p { margin: 0; font-size: 12px; color: var(--zg-ink-tertiary); }
  &__score { display: flex; flex-direction: column; align-items: flex-end; }
  &__label { font-size: 11px; color: var(--zg-ink-tertiary); margin-top: 4px; }

  &__radar { height: 320px; }
  .zg-radar-chart { height: 100%; width: 100%; }

  &__dims { display: flex; flex-direction: column; gap: 14px; }
  &__dimhead {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 6px; font-size: 12px; color: #52525b;
  }
  &__dimweight { color: var(--zg-ink-tertiary); }

  &__trend {
    padding-top: 18px; border-top: 1px dashed var(--zg-line-soft);
    h4 { margin: 0 0 12px; font-size: 14px; font-weight: 600; }
    .zg-trend-chart { height: 200px; width: 100%; }
  }
}
</style>
