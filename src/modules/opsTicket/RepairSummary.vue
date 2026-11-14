<!--
  智光云枢 · 运维工单 · 检修工单汇总
  业务域：opsTicket
  功能：检修工单月度汇总，含委外关联统计（委外工单数、委外金额）
-->
<template>
  <section class="zg-repair-summary">
    <header class="zg-repair-summary__head">
      <div class="zg-repair-summary__headline">
        <div class="zg-repair-summary__sigil">
          <el-icon :size="22"><Management /></el-icon>
        </div>
        <div class="zg-repair-summary__copy">
          <h1 class="zg-repair-summary__title">检修工单汇总</h1>
          <p class="zg-repair-summary__sub">检修工单月度统计 · 委外关联 · 完成率分析</p>
        </div>
      </div>
      <div class="zg-repair-summary__cta">
        <el-select v-model="repairType" placeholder="检修类型" style="width: 140px" clearable>
          <el-option label="全部类型" value="" />
          <el-option label="定期检修" value="定期检修" />
          <el-option label="故障检修" value="故障检修" />
          <el-option label="日常维护" value="日常维护" />
        </el-select>
        <el-button type="primary"><el-icon><Search /></el-icon><span>查询</span></el-button>
        <el-button><el-icon><Download /></el-icon><span>导出</span></el-button>
      </div>
    </header>

    <!-- 指标卡 -->
    <div class="zg-metrics">
      <div class="zg-metrics__cell zg-metrics__cell--primary">
        <span class="zg-metrics__num">{{ kpi.totalRepair }}</span>
        <span class="zg-metrics__lbl">年度检修工单总数</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <span class="zg-metrics__num">{{ kpi.outsourceCount }}</span>
        <span class="zg-metrics__lbl">委外关联工单</span>
      </div>
      <div class="zg-metrics__cell">
        <span class="zg-metrics__num">¥{{ (kpi.outsourceAmount / 10000).toFixed(1) }}<em>万</em></span>
        <span class="zg-metrics__lbl">委外结算金额</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--success">
        <span class="zg-metrics__num">{{ kpi.completedRate }}<em>%</em></span>
        <span class="zg-metrics__lbl">平均完成率</span>
      </div>
    </div>

    <!-- 月度汇总表格 -->
    <div class="zg-panel">
      <div class="zg-filterband">
        <div class="zg-filterband__row">
          <el-input v-model="keyword" placeholder="搜索月份 / 设备 / 工单编号" clearable style="width: 240px">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
          <div class="zg-filterband__stats">
            <span>共 <strong>{{ filteredMonthly.length }}</strong> 个月份记录</span>
          </div>
        </div>
      </div>

      <el-table :data="filteredMonthly" stripe border size="small" class="zg-datatable"
        :header-cell-style="{ background: '#f8fafc', color: '#52525b' }">
        <el-table-column prop="month" label="月份" width="110" align="center" fixed />
        <el-table-column prop="repairTotal" label="检修工单总数" width="140" align="right" />
        <el-table-column prop="internalDone" label="内部完成" width="110" align="right" />
        <el-table-column prop="outsourceCount" label="委外工单数" width="120" align="right">
          <template #default="{ row }">
            <span v-if="row.outsourceCount > 0" class="zg-badge zg-badge--warn">{{ row.outsourceCount }}</span>
            <span v-else class="text-slate-400">0</span>
          </template>
        </el-table-column>
        <el-table-column label="委外金额(元)" width="140" align="right">
          <template #default="{ row }">
            <span class="font-mono font-semibold">¥{{ row.outsourceAmount.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column label="完成率" width="160">
          <template #default="{ row }">
            <div class="zg-progress-cell">
              <el-progress :percentage="row.completedRate" :stroke-width="10"
                :color="progressColor(row.completedRate)" />
              <span class="zg-progress-cell__num">{{ row.completedRate }}%</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="avgDuration" label="平均工期(天)" width="130" align="right" />
        <el-table-column label="委外占比" width="130" align="center">
          <template #default="{ row }">
            <span class="zg-pct-chip">{{ row.outsourceRatio }}%</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small">月度明细</el-button>
            <el-button link type="primary" size="small">导报表</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 委外工单明细 -->
    <div class="zg-panel zg-panel--detail">
      <div class="zg-panel__head">
        <el-icon><House /></el-icon>
        <span>委外关联工单明细</span>
        <el-tag size="small" type="warning" class="ml-auto">最新 {{ outsourceDetails.length }} 条</el-tag>
      </div>
      <el-table :data="outsourceDetails" stripe size="small" class="zg-datatable">
        <el-table-column prop="outsourceNo" label="委外单号" width="150" />
        <el-table-column prop="internalNo" label="关联内部工单" width="150" />
        <el-table-column prop="vendor" label="实施单位" width="180" show-overflow-tooltip />
        <el-table-column prop="content" label="检修内容" min-width="220" show-overflow-tooltip />
        <el-table-column prop="startDate" label="开始日期" width="120" />
        <el-table-column prop="endDate" label="结束日期" width="120" />
        <el-table-column prop="amount" label="金额(元)" width="120" align="right">
          <template #default="{ row }">¥{{ row.amount.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <span class="zg-status" :class="row.status === '已完成' ? 'online' : row.status === '进行中' ? 'idle' : 'offline'">
              <i class="dot"></i>{{ row.status }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Management, Search, Download, House } from "@element-plus/icons-vue"

const repairType = ref('')
const keyword = ref('')

const kpi = ref({
  totalRepair: 3942,
  outsourceCount: 468,
  outsourceAmount: 23658000,
  completedRate: 89.6
})

// 月度汇总 mock
const monthlyData = ref([
  { month: '2026-01', repairTotal: 285, internalDone: 258, outsourceCount: 22, outsourceAmount: 1280000, completedRate: 90, avgDuration: 3.2, outsourceRatio: 7.7 },
  { month: '2026-02', repairTotal: 242, internalDone: 221, outsourceCount: 18, outsourceAmount: 980000, completedRate: 91, avgDuration: 2.8, outsourceRatio: 7.4 },
  { month: '2026-03', repairTotal: 325, internalDone: 292, outsourceCount: 28, outsourceAmount: 1680000, completedRate: 90, avgDuration: 3.5, outsourceRatio: 8.6 },
  { month: '2026-04', repairTotal: 358, internalDone: 318, outsourceCount: 32, outsourceAmount: 1850000, completedRate: 89, avgDuration: 3.8, outsourceRatio: 8.9 },
  { month: '2026-05', repairTotal: 372, internalDone: 328, outsourceCount: 35, outsourceAmount: 2120000, completedRate: 88, avgDuration: 4.0, outsourceRatio: 9.4 },
  { month: '2026-06', repairTotal: 385, internalDone: 338, outsourceCount: 38, outsourceAmount: 2280000, completedRate: 88, avgDuration: 4.2, outsourceRatio: 9.9 },
  { month: '2026-07', repairTotal: 392, internalDone: 342, outsourceCount: 40, outsourceAmount: 2420000, completedRate: 87, avgDuration: 4.5, outsourceRatio: 10.2 },
  { month: '2026-08', repairTotal: 378, internalDone: 332, outsourceCount: 36, outsourceAmount: 2180000, completedRate: 88, avgDuration: 4.1, outsourceRatio: 9.5 },
  { month: '2026-09', repairTotal: 348, internalDone: 308, outsourceCount: 30, outsourceAmount: 1950000, completedRate: 89, avgDuration: 3.6, outsourceRatio: 8.6 },
  { month: '2026-10', repairTotal: 318, internalDone: 285, outsourceCount: 26, outsourceAmount: 1680000, completedRate: 90, avgDuration: 3.3, outsourceRatio: 8.2 },
  { month: '2026-11', repairTotal: 292, internalDone: 262, outsourceCount: 22, outsourceAmount: 1450000, completedRate: 91, avgDuration: 3.0, outsourceRatio: 7.5 },
  { month: '2026-12', repairTotal: 268, internalDone: 242, outsourceCount: 18, outsourceAmount: 1280000, completedRate: 92, avgDuration: 2.7, outsourceRatio: 6.7 }
])

// 委外工单明细 mock
const outsourceDetails = ref([
  { outsourceNo: 'OUT-20261101001', internalNo: 'RPR-20261025003', vendor: '湖南恒通电力工程有限公司', content: '先导路K0+350-K1+200段电缆更换工程', startDate: '2026-11-01', endDate: '2026-11-15', amount: 185000, status: '进行中' },
  { outsourceNo: 'OUT-20261101002', internalNo: 'RPR-20261028007', vendor: '长沙明辉照明工程有限公司', content: '麓谷大道LED灯具批量更换(300套)', startDate: '2026-11-03', endDate: '2026-11-20', amount: 268000, status: '进行中' },
  { outsourceNo: 'OUT-20261102001', internalNo: 'RPR-20261030012', vendor: '湘电集团安装分公司', content: '梅溪湖3#箱变增容改造(500kVA→800kVA)', startDate: '2026-11-05', endDate: '2026-11-25', amount: 420000, status: '进行中' },
  { outsourceNo: 'OUT-20261102002', internalNo: 'RPR-20261101001', vendor: '中电建市政工程有限公司', content: '金星大道电缆井改造(新增20座)', startDate: '2026-11-08', endDate: '2026-12-05', amount: 156000, status: '待启动' },
  { outsourceNo: 'OUT-20261103001', internalNo: 'RPR-20261020005', vendor: '华电科技发展有限公司', content: '岳麓大道路灯智能控制系统升级', startDate: '2026-10-20', endDate: '2026-11-10', amount: 86000, status: '已完成' },
  { outsourceNo: 'OUT-20261103002', internalNo: 'RPR-20261015009', vendor: '湖南智光检测技术有限公司', content: '湘江路电缆沟综合检测评估', startDate: '2026-10-15', endDate: '2026-10-30', amount: 42000, status: '已完成' },
  { outsourceNo: 'OUT-20261104001', internalNo: 'RPR-20261104003', vendor: '长沙华诚电力检修有限公司', content: '天心大道4#配电箱大修', startDate: '2026-11-10', endDate: '2026-11-18', amount: 68000, status: '进行中' },
  { outsourceNo: 'OUT-20261105001', internalNo: 'RPR-20261022011', vendor: '开福机电安装工程公司', content: '开福大道充电桩安装工程(15台)', startDate: '2026-10-22', endDate: '2026-11-05', amount: 112000, status: '已完成' },
  { outsourceNo: 'OUT-20261105002', internalNo: 'RPR-20261105006', vendor: '雨花亮化工程有限公司', content: '雨花路路灯杆防腐翻新(80根)', startDate: '2026-11-15', endDate: '2026-11-30', amount: 95000, status: '待启动' },
  { outsourceNo: 'OUT-20261106001', internalNo: 'RPR-20261018004', vendor: '先导智能科技有限公司', content: '先导路隧道照明节能改造', startDate: '2026-10-18', endDate: '2026-11-28', amount: 520000, status: '进行中' },
  { outsourceNo: 'OUT-20261106002', internalNo: 'RPR-20261106002', vendor: '梅溪湖市政维护中心', content: '梅溪湖环湖路路灯巡检服务(年度)', startDate: '2026-11-01', endDate: '2027-10-31', amount: 180000, status: '进行中' },
  { outsourceNo: 'OUT-20261107001', internalNo: 'RPR-20261107001', vendor: '湖南电力建设监理有限公司', content: '岳麓大道-金星大道交叉口箱变验收', startDate: '2026-11-08', endDate: '2026-11-10', amount: 18000, status: '已完成' }
])

const filteredMonthly = computed(() => {
  if (!keyword.value.trim()) return monthlyData.value
  const kw = keyword.value.trim().toLowerCase()
  return monthlyData.value.filter(r => r.month.toLowerCase().includes(kw))
})

function progressColor(pct) {
  if (pct >= 90) return '#059669'
  if (pct >= 85) return '#10b981'
  if (pct >= 80) return '#d97706'
  return '#dc2626'
}
</script>

<style scoped lang="scss">
.zg-repair-summary {
  padding: 24px;

  &__head {
    display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;
    margin-bottom: 20px; padding-bottom: 18px; border-bottom: 1px solid #e2e8f0;
  }
  &__headline { display: flex; align-items: center; gap: 14px; }
  &__sigil { width: 44px; height: 44px; border-radius: 10px; background: linear-gradient(135deg, #059669, #0ea5e9); color: #fff; display: flex; align-items: center; justify-content: center; }
  &__copy { display: flex; flex-direction: column; gap: 4px; }
  &__title { font-size: 20px; font-weight: 600; margin: 0; color: #18181b; }
  &__sub { font-size: 13px; color: #71717a; margin: 0; }
  &__cta { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
}

.zg-metrics {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px;
  &__cell {
    background: #fff; border: 1px solid #e2e8f0; border-radius: 16px;
    padding: 16px 18px; display: flex; flex-direction: column; gap: 6px;
    box-shadow: 0 1px 3px rgba(15,23,42,0.04); position: relative; overflow: hidden;
    &::before { content: ''; position: absolute; left: 0; top: 0; width: 3px; height: 100%; background: #0ea5e9; }
    &--primary::before { background: #0ea5e9; }
    &--success::before { background: #059669; }
    &--warn::before { background: #d97706; }
  }
  &__num { font-size: 26px; font-weight: 700; color: #18181b; line-height: 1; em { font-style: normal; font-size: 14px; color: #71717a; margin-left: 4px; font-weight: 400; } }
  &__lbl { font-size: 12px; color: #71717a; }
}

.zg-panel {
  background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 18px; margin-bottom: 18px;
  &__head { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: #52525b; margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid #e2e8f0; }
  &--detail { margin-bottom: 0; }
}

.zg-filterband {
  padding: 14px 16px; background: #f8fafc; border-radius: 10px; margin-bottom: 14px;
  &__row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
  &__stats { margin-left: auto; font-size: 12px; color: #71717a; strong { color: #18181b; } }
}

.zg-badge {
  display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 12px; font-weight: 600;
  &--warn { background: #fef3c7; color: #d97706; }
  &--primary { background: #e0f2fe; color: #0ea5e9; }
}

.zg-progress-cell {
  display: flex; align-items: center; gap: 10px;
  &__num { font-size: 12px; color: #71717a; min-width: 40px; text-align: right; font-variant-numeric: tabular-nums; }
}

.zg-pct-chip {
  display: inline-block; padding: 2px 8px; border-radius: 6px; background: #f1f5f9; color: #52525b; font-size: 12px; font-weight: 500;
}

.zg-status {
  display: inline-flex; align-items: center; gap: 5px; font-size: 12px; padding: 2px 8px; border-radius: 999px;
  .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
  &.online { color: #059669; background: #d1fae5; }
  &.offline { color: #dc2626; background: #fee2e2; }
  &.idle { color: #d97706; background: #fef3c7; }
}

.text-slate-400 { color: #94a3b8; }
.font-mono { font-family: ui-monospace, monospace; }
.font-semibold { font-weight: 600; }
.ml-auto { margin-left: auto; }
</style>
