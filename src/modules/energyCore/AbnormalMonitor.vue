<!-- 智光云枢 · 能耗专项 · AbnormalMonitor 异常用电 AI 识别 -->
<template>
  <section class="zg-energy-abnormal">
    <header class="zg-energy__head">
      <div class="zg-energy__headline">
        <div class="zg-energy__sigil zg-energy__sigil--rose"><el-icon :size="22"><Coin /></el-icon></div>
        <div class="zg-energy__copy">
          <h1>异常用电 AI 识别</h1>
          <p>基于电流特征 + 时段 + 负荷模型，识别漏电 · 私接 · 关灯常亮等隐患</p>
        </div>
      </div>
      <div class="zg-energy__cta">
        <el-button type="primary" :icon="Star">重新跑模型</el-button>
        <el-button :icon="Document">导出异常清单</el-button>
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

    <!-- 分类占比 + 事件列表 -->
    <div class="zg-energy__main">
      <div class="zg-energy__pie-wrap">
        <div class="zg-energy__chart-card">
          <div class="zg-energy__chart-head"><h3>今日异常分类占比</h3><el-tag>共 {{ events.length }} 条</el-tag></div>
          <v-chart class="zg-energy__echart--sm" :option="pieOption" autoresize />
        </div>
        <div class="zg-energy__ai-tip">
          <el-icon><Cpu /></el-icon>
          <div>
            <strong>AI 模型：能耗异常 v3.2</strong>
            <p>训练样本 128 万条 · 本月识别准确率 94.6%</p>
          </div>
        </div>
      </div>

      <div class="zg-energy__list-wrap">
        <!-- 过滤 -->
        <div class="zg-filterband zg-filterband--tight">
          <el-select v-model="filter.type" placeholder="异常类型" style="width:140px" clearable>
            <el-option label="夜间常亮" value="夜间常亮" />
            <el-option label="负荷突增" value="负荷突增" />
            <el-option label="关灯后仍有电流" value="关灯后仍有电流" />
          </el-select>
          <el-select v-model="filter.ai" placeholder="AI 分类" style="width:140px" clearable>
            <el-option label="正常待机" value="正常待机" />
            <el-option label="疑似漏电" value="疑似漏电" />
            <el-option label="私接设备" value="私接设备" />
          </el-select>
          <el-select v-model="filter.status" placeholder="处理状态" style="width:120px" clearable>
            <el-option label="待处理" value="待处理" />
            <el-option label="处理中" value="处理中" />
            <el-option label="已解决" value="已解决" />
          </el-select>
          <el-button type="primary" :icon="Search" size="small">查询</el-button>
          <el-button :icon="Setting" size="small">批量处置</el-button>
        </div>
        <el-table :data="filteredEvents" stripe size="small" height="520">
          <el-table-column prop="time" label="发现时间" width="150" />
          <el-table-column prop="device" label="设备 / 回路" width="140" />
          <el-table-column prop="current" label="电流 A" width="100" align="right">
            <template #default="{ row }">
              <span class="font-mono font-semibold" :class="row.current > 3 ? 'text-rose-500' : 'text-slate-700'">{{ row.current }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="type" label="事件类型" width="150">
            <template #default="{ row }">
              <el-tag :type="row.type === '夜间常亮' ? 'danger' : row.type === '负荷突增' ? 'warning' : 'info'" size="small">{{ row.type }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="ai" label="AI 分类" width="120">
            <template #default="{ row }">
              <span :class="aiClass(row.ai)" class="ai-chip">{{ row.ai }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="confidence" label="置信度" width="140">
            <template #default="{ row }">
              <el-progress :percentage="row.confidence" :stroke-width="10" :color="row.confidence > 90 ? '#10b981' : row.confidence > 75 ? '#f59e0b' : '#ef4444'" />
            </template>
          </el-table-column>
          <el-table-column prop="leakage" label="关联漏电" width="100" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.leakage" type="danger" effect="dark" size="small">{{ row.leakage }}</el-tag>
              <span v-else class="text-slate-400">—</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="处理状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === '待处理' ? 'warning' : row.status === '处理中' ? '' : 'success'" size="small">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="130" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small">详情</el-button>
              <el-button link type="primary" size="small">派单</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { Coin, Document, Star, Search, Setting, Cpu, Warning, Connection, Bell } from "@element-plus/icons-vue"
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart } from 'echarts/charts'
import { TooltipComponent, LegendComponent } from 'echarts/components'
use([CanvasRenderer, PieChart, TooltipComponent, LegendComponent])

const metrics = ref([
  { label: '今日异常事件', value: '47', icon: Warning, bg: 'linear-gradient(135deg,#ef4444,#f87171)' },
  { label: '夜间常亮占比', value: '38%', icon: Bell, bg: 'linear-gradient(135deg,#6366f1,#818cf8)' },
  { label: '负荷突增占比', value: '29%', icon: Connection, bg: 'linear-gradient(135deg,#f59e0b,#fbbf24)' },
  { label: '关灯后电流', value: '33%', icon: Cpu, bg: 'linear-gradient(135deg,#06b6d4,#22d3ee)' }
])

const filter = reactive({ type: '', ai: '', status: '' })

function aiClass(c) {
  return c === '疑似漏电' ? 'ai-leak' : c === '私接设备' ? 'ai-private' : 'ai-standby'
}

const events = ref([
  { time: '2026-11-14 03:12', device: 'L1-003 / 先导路 K0+820', current: 2.8, type: '夜间常亮', ai: '疑似漏电', confidence: 96, leakage: '0.42mA', status: '待处理' },
  { time: '2026-11-14 02:48', device: 'L3-007 / 麓谷大道', current: 4.6, type: '负荷突增', ai: '私接设备', confidence: 91, leakage: '', status: '处理中' },
  { time: '2026-11-14 02:15', device: 'L5-012 / 隧道入口', current: 0.3, type: '关灯后仍有电流', ai: '正常待机', confidence: 82, leakage: '', status: '已解决' },
  { time: '2026-11-14 01:33', device: 'L2-004 / 交叉口西', current: 3.2, type: '夜间常亮', ai: '疑似漏电', confidence: 94, leakage: '0.51mA', status: '待处理' },
  { time: '2026-11-14 00:58', device: 'L4-006 / 环湖路北', current: 5.1, type: '负荷突增', ai: '私接设备', confidence: 88, leakage: '', status: '处理中' },
  { time: '2026-11-13 23:47', device: 'L1-009 / 辅路东段', current: 0.4, type: '关灯后仍有电流', ai: '正常待机', confidence: 76, leakage: '', status: '已解决' },
  { time: '2026-11-13 22:20', device: 'L3-011 / 产业园东门', current: 2.9, type: '夜间常亮', ai: '疑似漏电', confidence: 93, leakage: '0.38mA', status: '待处理' },
  { time: '2026-11-13 21:05', device: 'L5-008 / 岳麓大道', current: 4.2, type: '负荷突增', ai: '私接设备', confidence: 90, leakage: '', status: '处理中' },
  { time: '2026-11-13 20:40', device: 'L2-013 / 南辅路', current: 0.3, type: '关灯后仍有电流', ai: '正常待机', confidence: 79, leakage: '', status: '已解决' },
  { time: '2026-11-13 19:22', device: 'L4-015 / 环湖路南', current: 3.5, type: '夜间常亮', ai: '疑似漏电', confidence: 95, leakage: '0.47mA', status: '待处理' },
  { time: '2026-11-13 18:11', device: 'L1-016 / 先导路终点', current: 4.8, type: '负荷突增', ai: '私接设备', confidence: 87, leakage: '', status: '处理中' },
  { time: '2026-11-13 17:05', device: 'L3-020 / 麓谷大道北段', current: 0.5, type: '关灯后仍有电流', ai: '正常待机', confidence: 72, leakage: '', status: '已解决' }
])

const filteredEvents = computed(() =>
  events.value.filter(e =>
    (!filter.type || e.type === filter.type) &&
    (!filter.ai || e.ai === filter.ai) &&
    (!filter.status || e.status === filter.status)
  )
)

const pieOption = computed(() => ({
  tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
  legend: { bottom: 0 },
  series: [{
    type: 'pie', radius: ['45%', '72%'], center: ['50%', '45%'],
    avoidLabelOverlap: true, itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
    label: { show: true, formatter: '{b}\n{d}%', fontSize: 12 },
    data: [
      { value: 18, name: '夜间常亮', itemStyle: { color: '#ef4444' } },
      { value: 14, name: '负荷突增', itemStyle: { color: '#f59e0b' } },
      { value: 15, name: '关灯后电流', itemStyle: { color: '#06b6d4' } }
    ]
  }]
}))
</script>

<style lang="scss" scoped>
.zg-energy-abnormal { padding: var(--zg-space-6); background: var(--zg-gradient-surface); min-height: calc(100vh - 120px); }
.zg-energy__head { display: flex; justify-content: space-between; align-items: center; padding-bottom: var(--zg-space-5); margin-bottom: var(--zg-space-4); border-bottom: 1px solid var(--zg-line-soft); }
.zg-energy__sigil { width: 44px; height: 44px; border-radius: var(--zg-radius-md); background: linear-gradient(135deg,#06b6d4,#6366f1); color: #fff; display: flex; align-items: center; justify-content: center; }
.zg-energy__sigil--rose { background: linear-gradient(135deg,#ef4444,#f59e0b); }
.zg-energy__headline { display: flex; gap: var(--zg-space-3); align-items: center; }
.zg-energy__copy h1 { margin: 0; font-size: var(--zg-text-display-md); font-weight: 700; }
.zg-energy__copy p { margin: 2px 0 0; font-size: var(--zg-text-body-sm); color: var(--zg-ink-tertiary); }

.zg-metrics { display: grid; grid-template-columns: repeat(4,1fr); gap: var(--zg-space-4); margin-bottom: var(--zg-space-5); }
.zg-metrics__cell { display: flex; gap: var(--zg-space-3); padding: var(--zg-space-4); background: var(--zg-surface-card); border: 1px solid var(--zg-line-soft); border-radius: var(--zg-radius-lg); box-shadow: var(--zg-shadow-card); }
.zg-metrics__icon { width: 42px; height: 42px; border-radius: var(--zg-radius-md); display: flex; align-items: center; justify-content: center; color: #fff; flex-shrink: 0; }
.zg-metrics__num { font-size: 22px; font-weight: 800; font-family: var(--zg-font-mono); }
.zg-metrics__lbl { font-size: 12px; color: var(--zg-ink-tertiary); margin-top: 2px; }

.zg-energy__main { display: grid; grid-template-columns: 320px 1fr; gap: var(--zg-space-4); }
.zg-energy__pie-wrap { display: flex; flex-direction: column; gap: var(--zg-space-3); }
.zg-energy__chart-card { background: var(--zg-surface-card); border: 1px solid var(--zg-line-soft); border-radius: var(--zg-radius-lg); padding: var(--zg-space-4); }
.zg-energy__chart-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--zg-space-3); }
.zg-energy__chart-head h3 { margin: 0; font-size: var(--zg-text-body); font-weight: 600; }
.zg-energy__echart--sm { height: 260px; width: 100%; }
.zg-energy__ai-tip { display: flex; gap: var(--zg-space-3); padding: var(--zg-space-3); background: linear-gradient(135deg,rgba(99,102,241,0.08),rgba(6,182,212,0.08)); border: 1px solid rgba(99,102,241,0.2); border-radius: var(--zg-radius-md); color: var(--zg-ink-primary); el-icon { font-size: 20px; color: #6366f1; flex-shrink: 0; margin-top: 2px; } strong { font-size: 13px; } p { margin: 2px 0 0; font-size: 12px; color: var(--zg-ink-tertiary); } }
.zg-energy__list-wrap { background: var(--zg-surface-card); border: 1px solid var(--zg-line-soft); border-radius: var(--zg-radius-lg); padding: var(--zg-space-4); }
.zg-filterband--tight { padding: var(--zg-space-2); margin-bottom: var(--zg-space-3); }

.ai-chip { padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; }
.ai-leak { background: #fef2f2; color: #dc2626; border: 1px solid #fca5a5; }
.ai-private { background: #fff7ed; color: #c2410c; border: 1px solid #fdba74; }
.ai-standby { background: #ecfdf5; color: #059669; border: 1px solid #6ee7b7; }
</style>
