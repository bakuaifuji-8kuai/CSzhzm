<!--
  智光云枢 · 用电申请扩展 · 计量接口状态
  业务域：powerApply
  功能：计量仪表在线状态实时监控，直连/OCR/导入三种采集方式不同徽章
-->
<template>
  <section class="zg-meter-status">
    <header class="zg-meter-status__head">
      <div class="zg-meter-status__headline">
        <div class="zg-meter-status__sigil">
          <el-icon :size="22"><Connection /></el-icon>
        </div>
        <div class="zg-meter-status__copy">
          <h1 class="zg-meter-status__title">计量接口状态</h1>
          <p class="zg-meter-status__sub">计量仪表在线监控 · 采集方式状态 · 今日数据点统计</p>
        </div>
      </div>
      <div class="zg-meter-status__cta">
        <el-button @click="refreshAll"><el-icon><Refresh /></el-icon><span>刷新状态</span></el-button>
      </div>
    </header>

    <!-- 在线率统计 -->
    <div class="zg-online-rack">
      <div class="zg-online-rack__item">
        <div class="zg-online-rack__ring">
          <svg viewBox="0 0 100 100" class="zg-ring">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" stroke-width="10" />
            <circle cx="50" cy="50" r="42" fill="none" stroke="#059669" stroke-width="10"
              :stroke-dasharray="264"
              :stroke-dashoffset="264 * (1 - onlineRate / 100)"
              stroke-linecap="round" transform="rotate(-90 50 50)" />
          </svg>
          <div class="zg-online-rack__center">
            <span class="zg-online-rack__val">{{ onlineRate }}%</span>
            <span class="zg-online-rack__lbl">整体在线率</span>
          </div>
        </div>
      </div>
      <div class="zg-online-rack__grid">
        <div class="zg-mode-card">
          <div class="zg-mode-card__icon is-green">
            <el-icon :size="20"><Connection /></el-icon>
          </div>
          <div class="zg-mode-card__body">
            <div class="zg-mode-card__name">直连采集</div>
            <div class="zg-mode-card__num">{{ modeStats.direct.online }}/{{ modeStats.direct.total }}</div>
            <div class="zg-mode-card__rate">在线率 {{ modeStats.direct.onlineRate }}%</div>
          </div>
        </div>
        <div class="zg-mode-card">
          <div class="zg-mode-card__icon is-yellow">
            <el-icon :size="20"><Camera /></el-icon>
          </div>
          <div class="zg-mode-card__body">
            <div class="zg-mode-card__name">OCR 抄表</div>
            <div class="zg-mode-card__num">{{ modeStats.ocr.pending }}/{{ modeStats.ocr.total }}</div>
            <div class="zg-mode-card__rate">待审核 {{ modeStats.ocr.pendingRate }}%</div>
          </div>
        </div>
        <div class="zg-mode-card">
          <div class="zg-mode-card__icon is-gray">
            <el-icon :size="20"><Upload /></el-icon>
          </div>
          <div class="zg-mode-card__body">
            <div class="zg-mode-card__name">手工导入</div>
            <div class="zg-mode-card__num">{{ modeStats.import.submitted }}/{{ modeStats.import.total }}</div>
            <div class="zg-mode-card__rate">已提交</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 过滤工具栏 -->
    <div class="zg-filterband">
      <div class="zg-filterband__row">
        <el-input v-model="filter.keyword" placeholder="搜索仪表ID / 关联箱变" clearable style="width: 260px">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-select v-model="filter.mode" placeholder="采集方式" style="width: 130px" clearable>
          <el-option label="直连" value="直连" />
          <el-option label="OCR" value="OCR" />
          <el-option label="导入" value="导入" />
        </el-select>
        <el-select v-model="filter.status" placeholder="在线状态" style="width: 130px" clearable>
          <el-option label="在线" value="在线" />
          <el-option label="离线" value="离线" />
          <el-option label="待审核" value="待审核" />
        </el-select>
      </div>
    </div>

    <!-- 仪表在线列表 -->
    <div class="zg-panel">
      <el-table :data="filteredMeters" stripe border size="small" class="zg-datatable">
        <el-table-column prop="meterId" label="仪表ID" width="160" fixed>
          <template #default="{ row }"><span class="zg-code">{{ row.meterId }}</span></template>
        </el-table-column>
        <el-table-column prop="transformer" label="关联箱变/位置" width="180" show-overflow-tooltip />
        <el-table-column prop="type" label="表类型" width="130" />
        <el-table-column prop="lastReportTime" label="最后上报时间" width="160">
          <template #default="{ row }">
            <span class="font-mono">{{ row.lastReportTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="在线状态" width="120" align="center">
          <template #default="{ row }">
            <!-- 直连方式：绿色在线/红色离线 -->
            <template v-if="row.mode === '直连'">
              <span class="zg-meter-status zg-meter-status--online" v-if="row.online">
                <span class="zg-meter-status__dot"></span>在线
              </span>
              <span class="zg-meter-status zg-meter-status--offline" v-else>
                <span class="zg-meter-status__dot"></span>离线
              </span>
            </template>
            <!-- OCR 方式：黄色待审核/绿色已通过 -->
            <template v-else-if="row.mode === 'OCR'">
              <span class="zg-meter-status zg-meter-status--ocr-pending" v-if="row.online">
                <el-icon class="mr-1"><Clock /></el-icon>待审核
              </span>
              <span class="zg-meter-status zg-meter-status--offline" v-else>
                <span class="zg-meter-status__dot"></span>未上传
              </span>
            </template>
            <!-- 导入方式：灰色已提交 -->
            <template v-else>
              <span class="zg-meter-status zg-meter-status--import">
                <el-icon class="mr-1"><Upload /></el-icon>已提交
              </span>
            </template>
          </template>
        </el-table-column>
        <el-table-column label="采集方式" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="modeTagType(row.mode)" size="small" effect="plain">{{ row.mode }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="todayPoints" label="今日数据点" width="110" align="right">
          <template #default="{ row }">
            <span class="font-mono font-bold">{{ row.todayPoints }}</span>
            <span class="text-slate-400 text-xs">/288</span>
          </template>
        </el-table-column>
        <el-table-column label="数据完整度" width="140">
          <template #default="{ row }">
            <el-progress :percentage="Math.round(row.todayPoints / 288 * 100)" :stroke-width="8"
              :color="dataColor(row.todayPoints)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small">实时数据</el-button>
            <el-button link type="primary" size="small">历史曲线</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="zg-pagerbar">
        <el-pagination background :total="filteredMeters.length" :page-size="15"
          layout="prev, pager, next, jumper, ->, total" />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Connection, Refresh, Search, Clock, Upload } from "@element-plus/icons-vue"

const filter = reactive({ keyword: '', mode: '', status: '' })

const modeStats = ref({
  direct: { total: 186, online: 178, onlineRate: 95.7 },
  ocr: { total: 56, pending: 12, pendingRate: 21.4 },
  'import': { total: 44, submitted: 44 }
})

const onlineRate = computed(() => Math.round(
  (modeStats.value.direct.online + (modeStats.value.ocr.total - modeStats.value.ocr.pending)) /
  (modeStats.value.direct.total + modeStats.value.ocr.total + modeStats.value['import'].total) * 100
))

const refreshAll = () => { /* 模拟刷新 */ }

// 仪表 mock - 14 条
const meters = ref([
  { meterId: 'DBX-XD001-M1', transformer: '先导路1#箱变', type: '三相四线电子式', lastReportTime: '2026-11-14 10:30', online: true, mode: '直连', todayPoints: 286 },
  { meterId: 'DBX-XD001-M2', transformer: '先导路1#备用表', type: '三相三线', lastReportTime: '2026-11-14 10:28', online: true, mode: '直连', todayPoints: 285 },
  { meterId: 'DBX-LG002-M1', transformer: '麓谷2#箱变', type: '三相四线电子式', lastReportTime: '2026-11-14 10:29', online: true, mode: '直连', todayPoints: 287 },
  { meterId: 'TXT-MX003-M', transformer: '梅溪湖3#箱变', type: '三相四线电子式', lastReportTime: '2026-11-14 10:30', online: true, mode: '直连', todayPoints: 288 },
  { meterId: 'DBX-JX015-M1', transformer: '金星大道15#箱变', type: '三相四线电子式', lastReportTime: '2026-11-14 08:45', online: false, mode: '直连', todayPoints: 215 },
  { meterId: 'DBX-YL008-M1', transformer: '岳麓大道8#箱变', type: '三相四线电子式', lastReportTime: '2026-11-14 10:27', online: true, mode: '直连', todayPoints: 286 },
  { meterId: 'DBX-XJ003-M', transformer: '湘江路3#箱变', type: '三相四线电子式', lastReportTime: '2026-11-14 10:26', online: true, mode: '直连', todayPoints: 288 },
  { meterId: 'CHG-XJ008-M', transformer: '湘江路充电站', type: '直流充电桩专用', lastReportTime: '2026-11-14 10:30', online: true, mode: '直连', todayPoints: 288 },
  { meterId: 'CAM-XD018-M', transformer: '先导路监控中心', type: '单相电子式', lastReportTime: '2026-11-14 09:00', online: true, mode: 'OCR', todayPoints: 96 },
  { meterId: 'CAM-JX005-M', transformer: '金星大道监控系统', type: '单相电子式', lastReportTime: '2026-11-14 08:30', online: true, mode: 'OCR', todayPoints: 95 },
  { meterId: 'CHG-TX015-M', transformer: '天心大道充电站', type: '直流充电桩专用', lastReportTime: '2026-11-14 10:30', online: true, mode: '直连', todayPoints: 288 },
  { meterId: 'EARTH-KF003-M', transformer: '开福区防雷设施', type: '单相电子式', lastReportTime: '2026-11-13 18:00', online: false, mode: 'OCR', todayPoints: 88 },
  { meterId: 'DBX-YH005-M2', transformer: '雨花路5#备用表', type: '三相三线', lastReportTime: '2026-11-14 10:00', online: true, mode: '导入', todayPoints: 288 },
  { meterId: 'CTRL-FR008-M', transformer: '芙蓉路景观照明', type: '单相电子式', lastReportTime: '2026-11-14 10:25', online: true, mode: '直连', todayPoints: 287 }
])

const filteredMeters = computed(() => {
  return meters.value.filter(m => {
    let matchKw = !filter.keyword.trim() ||
      m.meterId.includes(filter.keyword) || m.transformer.includes(filter.keyword)
    const matchMode = !filter.mode || m.mode === filter.mode
    const matchStatus = !filter.status ||
      (filter.status === '在线' && m.online && m.mode === '直连') ||
      (filter.status === '离线' && !m.online && m.mode === '直连') ||
      (filter.status === '待审核' && m.online && m.mode === 'OCR')
    // 更简单的状态匹配
    let matchStatus2 = !filter.status
    if (filter.status === '在线') matchStatus2 = m.mode === '直连' && m.online
    if (filter.status === '离线') matchStatus2 = m.mode === '直连' && !m.online
    if (filter.status === '待审核') matchStatus2 = m.mode === 'OCR' && m.online
    return matchKw && matchMode && matchStatus2
  })
})

function modeTagType(m) {
  if (m === '直连') return 'success'
  if (m === 'OCR') return 'warning'
  return 'info'
}
function dataColor(points) {
  const pct = points / 288
  if (pct >= 0.95) return '#059669'
  if (pct >= 0.8) return '#d97706'
  return '#dc2626'
}
</script>

<style scoped lang="scss">
.zg-meter-status {
  padding: 24px;
  &__head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 18px; padding-bottom: 18px; border-bottom: 1px solid #e2e8f0; }
  &__headline { display: flex; align-items: center; gap: 14px; }
  &__sigil { width: 44px; height: 44px; border-radius: 10px; background: linear-gradient(135deg, #10b981, #0ea5e9); color: #fff; display: flex; align-items: center; justify-content: center; }
  &__copy { display: flex; flex-direction: column; gap: 4px; }
  &__title { font-size: 20px; font-weight: 600; margin: 0; color: #18181b; }
  &__sub { font-size: 13px; color: #71717a; margin: 0; }
}

.zg-online-rack {
  display: grid; grid-template-columns: 240px 1fr; gap: 20px;
  background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin-bottom: 16px;
  &__item { display: flex; justify-content: center; align-items: center; }
  &__ring { position: relative; width: 200px; height: 200px; }
  .zg-ring { width: 200px; height: 200px; }
  &__center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  &__val { font-size: 28px; font-weight: 700; color: #059669; line-height: 1; }
  &__lbl { font-size: 12px; color: #71717a; margin-top: 6px; }
  &__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
}

.zg-mode-card {
  display: flex; gap: 12px; padding: 14px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;
  &__icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #fff; flex-shrink: 0;
    &.is-green { background: linear-gradient(135deg, #059669, #10b981); }
    &.is-yellow { background: linear-gradient(135deg, #d97706, #f59e0b); }
    &.is-gray { background: linear-gradient(135deg, #64748b, #94a3b8); }
  }
  &__body { display: flex; flex-direction: column; gap: 4px; }
  &__name { font-size: 13px; font-weight: 500; color: #52525b; }
  &__num { font-size: 18px; font-weight: 700; color: #18181b; font-family: ui-monospace, monospace; }
  &__rate { font-size: 11px; color: #71717a; }
}

.zg-filterband { padding: 14px 16px; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 16px;
  &__row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
}

.zg-panel { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 18px; }

.zg-code { font-family: ui-monospace, monospace; font-size: 12px; font-weight: 600; color: #10b981; }

.zg-meter-status {
  display: inline-flex; align-items: center; gap: 5px; font-size: 12px; padding: 3px 10px; border-radius: 999px; font-weight: 500;
  &__dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

  &--online {
    color: #059669; background: #d1fae5;
    .zg-meter-status__dot { box-shadow: 0 0 6px #10b981; animation: blink 2s infinite; }
  }
  &--offline {
    color: #dc2626; background: #fee2e2;
  }
  &--ocr-pending {
    color: #b45309; background: #fef3c7;
  }
  &--import {
    color: #64748b; background: #f1f5f9;
  }
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.font-mono { font-family: ui-monospace, monospace; }
.font-bold { font-weight: 700; }
.text-slate-400 { color: #94a3b8; }
.text-xs { font-size: 11px; }
.mr-1 { margin-right: 4px; }

.zg-pagerbar { display: flex; justify-content: flex-end; padding-top: 14px; }
</style>
