<!--
  智光云枢 · 用电申请扩展 · 电费账单
  业务域：powerApply
  功能：公表/分表 Tab 切换，展示峰/平/谷电量明细与审核状态
-->
<template>
  <section class="zg-bills">
    <header class="zg-bills__head">
      <div class="zg-bills__headline">
        <div class="zg-bills__sigil">
          <el-icon :size="22"><Coin /></el-icon>
        </div>
        <div class="zg-bills__copy">
          <h1 class="zg-bills__title">电费账单</h1>
          <p class="zg-bills__sub">公表 / 分表分类 · 峰平谷电量明细 · 审核状态追踪</p>
        </div>
      </div>
      <div class="zg-bills__cta">
        <el-date-picker v-model="period" type="month" placeholder="计费月份" style="width: 160px" />
        <el-button type="primary"><el-icon><Search /></el-icon><span>查询</span></el-button>
        <el-button><el-icon><Download /></el-icon><span>导出</span></el-button>
      </div>
    </header>

    <!-- 指标卡 -->
    <div class="zg-metrics">
      <div class="zg-metrics__cell zg-metrics__cell--primary">
        <span class="zg-metrics__num">¥{{ (kpi.totalAmount / 10000).toFixed(2) }}<em>万</em></span>
        <span class="zg-metrics__lbl">本期电费总额</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <span class="zg-metrics__num">{{ kpi.peakKwh.toLocaleString() }}<em>kWh</em></span>
        <span class="zg-metrics__lbl">峰期电量</span>
      </div>
      <div class="zg-metrics__cell">
        <span class="zg-metrics__num">{{ kpi.flatKwh.toLocaleString() }}<em>kWh</em></span>
        <span class="zg-metrics__lbl">平期电量</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--success">
        <span class="zg-metrics__num">{{ kpi.valleyKwh.toLocaleString() }}<em>kWh</em></span>
        <span class="zg-metrics__lbl">谷期电量</span>
      </div>
      <div class="zg-metrics__cell">
        <span class="zg-metrics__num">{{ kpi.totalMeters }}</span>
        <span class="zg-metrics__lbl">计量仪表总数</span>
      </div>
    </div>

    <!-- Tab 切换 + 过滤 -->
    <div class="zg-tabs-filter">
      <el-tabs v-model="activeTab" class="zg-tabs-filter__tabs">
        <el-tab-pane name="public">
          <template #label>
            <span class="zg-tab-label"><el-icon><House /></el-icon>公表账单</span>
          </template>
        </el-tab-pane>
        <el-tab-pane name="sub">
          <template #label>
            <span class="zg-tab-label"><el-icon><HomeFilled /></el-icon>分表账单</span>
          </template>
        </el-tab-pane>
      </el-tabs>

      <div class="zg-filterband zg-filterband--inline">
        <el-input v-model="filter.keyword" placeholder="搜索账单号 / 计量仪表 / 用户名" clearable style="width: 260px">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-select v-model="filter.auditStatus" placeholder="审核状态" style="width: 120px" clearable>
          <el-option label="待审核" value="待审核" />
          <el-option label="已通过" value="已通过" />
          <el-option label="已驳回" value="已驳回" />
        </el-select>
      </div>
    </div>

    <!-- 账单表格 -->
    <div class="zg-panel">
      <el-table v-if="activeTab === 'public'" :data="filteredPublic" stripe border size="small" class="zg-datatable">
        <el-table-column prop="billNo" label="账单号" width="150" fixed>
          <template #default="{ row }"><span class="zg-code">{{ row.billNo }}</span></template>
        </el-table-column>
        <el-table-column prop="meterNo" label="计量仪表" width="160" />
        <el-table-column prop="billingMonth" label="计费月" width="100" align="center" />
        <el-table-column label="峰电量(kWh)" width="130" align="right">
          <template #default="{ row }"><span class="text-amber-600 font-semibold">{{ row.peakKwh.toLocaleString() }}</span></template>
        </el-table-column>
        <el-table-column label="平电量(kWh)" width="130" align="right">
          <template #default="{ row }">{{ row.flatKwh.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="谷电量(kWh)" width="130" align="right">
          <template #default="{ row }"><span class="text-emerald-600 font-semibold">{{ row.valleyKwh.toLocaleString() }}</span></template>
        </el-table-column>
        <el-table-column label="总额(元)" width="140" align="right">
          <template #default="{ row }"><span class="font-mono font-bold">¥{{ row.totalAmount.toLocaleString() }}</span></template>
        </el-table-column>
        <el-table-column prop="collectMethod" label="采集方式" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="collectTagType(row.collectMethod)">{{ row.collectMethod }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="审核状态" width="100" align="center">
          <template #default="{ row }">
            <span class="zg-status" :class="row.auditStatus === '已通过' ? 'online' : row.auditStatus === '待审核' ? 'idle' : 'offline'">
              <i class="dot"></i>{{ row.auditStatus }}
            </span>
          </template>
        </el-table-column>
      </el-table>

      <el-table v-else :data="filteredSub" stripe border size="small" class="zg-datatable">
        <el-table-column prop="billNo" label="账单号" width="150" fixed>
          <template #default="{ row }"><span class="zg-code">{{ row.billNo }}</span></template>
        </el-table-column>
        <el-table-column prop="meterNo" label="计量仪表" width="160" />
        <el-table-column prop="user" label="分表使用方" width="160" />
        <el-table-column prop="billingMonth" label="计费月" width="100" align="center" />
        <el-table-column label="峰电量(kWh)" width="130" align="right">
          <template #default="{ row }"><span class="text-amber-600 font-semibold">{{ row.peakKwh.toLocaleString() }}</span></template>
        </el-table-column>
        <el-table-column label="平电量(kWh)" width="130" align="right">
          <template #default="{ row }">{{ row.flatKwh.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="谷电量(kWh)" width="130" align="right">
          <template #default="{ row }"><span class="text-emerald-600 font-semibold">{{ row.valleyKwh.toLocaleString() }}</span></template>
        </el-table-column>
        <el-table-column label="总额(元)" width="140" align="right">
          <template #default="{ row }"><span class="font-mono font-bold">¥{{ row.totalAmount.toLocaleString() }}</span></template>
        </el-table-column>
        <el-table-column prop="collectMethod" label="采集方式" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="collectTagType(row.collectMethod)">{{ row.collectMethod }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="审核状态" width="100" align="center">
          <template #default="{ row }">
            <span class="zg-status" :class="row.auditStatus === '已通过' ? 'online' : row.auditStatus === '待审核' ? 'idle' : 'offline'">
              <i class="dot"></i>{{ row.auditStatus }}
            </span>
          </template>
        </el-table-column>
      </el-table>

      <div class="zg-pagerbar">
        <el-pagination background :total="currentFiltered.length" :page-size="15"
          layout="prev, pager, next, jumper, ->, total" />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Coin, Search, Download, House, HomeFilled } from "@element-plus/icons-vue"

const period = ref('')
const activeTab = ref('public')
const filter = reactive({ keyword: '', auditStatus: '' })

const kpi = ref({ totalAmount: 586320, peakKwh: 125600, flatKwh: 238500, valleyKwh: 412300, totalMeters: 286 })

// 公表 mock - 14 条
const publicBills = ref([
  { billNo: 'PUB-202611-0001', meterNo: 'DBX-XD001-01', billingMonth: '2026-11', peakKwh: 8560, flatKwh: 12300, valleyKwh: 28900, totalAmount: 23456, collectMethod: '直连', auditStatus: '已通过' },
  { billNo: 'PUB-202611-0002', meterNo: 'DBX-LG002-03', billingMonth: '2026-11', peakKwh: 9230, flatKwh: 14500, valleyKwh: 32100, totalAmount: 26890, collectMethod: '直连', auditStatus: '已通过' },
  { billNo: 'PUB-202611-0003', meterNo: 'TXT-MX003-M', billingMonth: '2026-11', peakKwh: 12500, flatKwh: 18600, valleyKwh: 45200, totalAmount: 38560, collectMethod: '直连', auditStatus: '待审核' },
  { billNo: 'PUB-202611-0004', meterNo: 'DBX-JX015-02', billingMonth: '2026-11', peakKwh: 6800, flatKwh: 10200, valleyKwh: 21500, totalAmount: 18900, collectMethod: 'OCR', auditStatus: '已通过' },
  { billNo: 'PUB-202611-0005', meterNo: 'DBX-YL008-01', billingMonth: '2026-11', peakKwh: 7450, flatKwh: 11800, valleyKwh: 24300, totalAmount: 21200, collectMethod: '直连', auditStatus: '已通过' },
  { billNo: 'PUB-202611-0006', meterNo: 'DBX-XJ003-01', billingMonth: '2026-11', peakKwh: 5600, flatKwh: 8900, valleyKwh: 18200, totalAmount: 15680, collectMethod: '直连', auditStatus: '已通过' },
  { billNo: 'PUB-202611-0007', meterNo: 'DBX-TX012-02', billingMonth: '2026-11', peakKwh: 10200, flatKwh: 15600, valleyKwh: 36800, totalAmount: 32150, collectMethod: 'OCR', auditStatus: '待审核' },
  { billNo: 'PUB-202611-0008', meterNo: 'DBX-FR006-01', billingMonth: '2026-11', peakKwh: 8900, flatKwh: 13200, valleyKwh: 31500, totalAmount: 28400, collectMethod: '直连', auditStatus: '已通过' },
  { billNo: 'PUB-202611-0009', meterNo: 'TXT-KF001-M', billingMonth: '2026-11', peakKwh: 15800, flatKwh: 22500, valleyKwh: 52300, totalAmount: 46850, collectMethod: '直连', auditStatus: '已通过' },
  { billNo: 'PUB-202611-0010', meterNo: 'DBX-YH005-03', billingMonth: '2026-11', peakKwh: 7200, flatKwh: 10800, valleyKwh: 22600, totalAmount: 19850, collectMethod: '导入', auditStatus: '已驳回' },
  { billNo: 'PUB-202611-0011', meterNo: 'TXT-LG004-M', billingMonth: '2026-11', peakKwh: 13200, flatKwh: 19500, valleyKwh: 48500, totalAmount: 42300, collectMethod: '直连', auditStatus: '已通过' },
  { billNo: 'PUB-202611-0012', meterNo: 'DBX-MX018-01', billingMonth: '2026-11', peakKwh: 6100, flatKwh: 9200, valleyKwh: 19800, totalAmount: 16950, collectMethod: '直连', auditStatus: '已通过' },
  { billNo: 'PUB-202611-0013', meterNo: 'TXT-XD001-M', billingMonth: '2026-11', peakKwh: 18500, flatKwh: 28600, valleyKwh: 68200, totalAmount: 62180, collectMethod: '直连', auditStatus: '已通过' },
  { billNo: 'PUB-202611-0014', meterNo: 'DBX-JX022-01', billingMonth: '2026-11', peakKwh: 7800, flatKwh: 11500, valleyKwh: 23800, totalAmount: 20960, collectMethod: 'OCR', auditStatus: '待审核' }
])

// 分表 mock - 14 条
const subBills = ref([
  { billNo: 'SUB-202611-0001', meterNo: 'CHG-XJ008-M01', user: '湘江路充电站-1号', billingMonth: '2026-11', peakKwh: 3200, flatKwh: 5800, valleyKwh: 12500, totalAmount: 12580, collectMethod: '直连', auditStatus: '已通过' },
  { billNo: 'SUB-202611-0002', meterNo: 'CHG-FR006-M02', user: '芙蓉路充电站-2号', billingMonth: '2026-11', peakKwh: 2800, flatKwh: 5200, valleyKwh: 11800, totalAmount: 11200, collectMethod: '直连', auditStatus: '已通过' },
  { billNo: 'SUB-202611-0003', meterNo: 'CAM-XD018-M', user: '先导路监控中心', billingMonth: '2026-11', peakKwh: 1200, flatKwh: 2800, valleyKwh: 5600, totalAmount: 4850, collectMethod: '直连', auditStatus: '已通过' },
  { billNo: 'SUB-202611-0004', meterNo: 'CTRL-LG012-M', user: '麓谷隧道控制箱', billingMonth: '2026-11', peakKwh: 1500, flatKwh: 3200, valleyKwh: 6800, totalAmount: 5890, collectMethod: '直连', auditStatus: '已通过' },
  { billNo: 'SUB-202611-0005', meterNo: 'CHG-MX012-M01', user: '梅溪湖充电桩集群', billingMonth: '2026-11', peakKwh: 4500, flatKwh: 8200, valleyKwh: 18600, totalAmount: 18200, collectMethod: '直连', auditStatus: '待审核' },
  { billNo: 'SUB-202611-0006', meterNo: 'CAM-JX005-M', user: '金星大道监控系统', billingMonth: '2026-11', peakKwh: 980, flatKwh: 2200, valleyKwh: 4800, totalAmount: 4020, collectMethod: 'OCR', auditStatus: '已通过' },
  { billNo: 'SUB-202611-0007', meterNo: 'CTRL-YL022-M', user: '岳麓大道景观灯', billingMonth: '2026-11', peakKwh: 2100, flatKwh: 4500, valleyKwh: 9800, totalAmount: 8560, collectMethod: '直连', auditStatus: '已通过' },
  { billNo: 'SUB-202611-0008', meterNo: 'CHG-TX015-M', user: '天心大道充电站', billingMonth: '2026-11', peakKwh: 2600, flatKwh: 4800, valleyKwh: 11200, totalAmount: 10680, collectMethod: '直连', auditStatus: '已通过' },
  { billNo: 'SUB-202611-0009', meterNo: 'EARTH-KF003-M', user: '开福区路灯防雷设施', billingMonth: '2026-11', peakKwh: 180, flatKwh: 420, valleyKwh: 860, totalAmount: 720, collectMethod: '导入', auditStatus: '已驳回' },
  { billNo: 'SUB-202611-0010', meterNo: 'CAM-YH007-M', user: '雨花路高清监控', billingMonth: '2026-11', peakKwh: 850, flatKwh: 1900, valleyKwh: 4200, totalAmount: 3680, collectMethod: '直连', auditStatus: '已通过' },
  { billNo: 'SUB-202611-0011', meterNo: 'CTRL-FR008-M', user: '芙蓉路景观照明', billingMonth: '2026-11', peakKwh: 2400, flatKwh: 5200, valleyKwh: 11500, totalAmount: 10280, collectMethod: '直连', auditStatus: '已通过' },
  { billNo: 'SUB-202611-0012', meterNo: 'CHG-KF020-M', user: '开福大道新能源车桩', billingMonth: '2026-11', peakKwh: 1900, flatKwh: 3800, valleyKwh: 8500, totalAmount: 7580, collectMethod: '直连', auditStatus: '待审核' },
  { billNo: 'SUB-202611-0013', meterNo: 'DBX-XJ015-M', user: '湘江路箱变备用表', billingMonth: '2026-11', peakKwh: 560, flatKwh: 1200, valleyKwh: 2600, totalAmount: 2250, collectMethod: 'OCR', auditStatus: '已通过' },
  { billNo: 'SUB-202611-0014', meterNo: 'CAM-MX020-M', user: '梅溪湖环湖路监控', billingMonth: '2026-11', peakKwh: 720, flatKwh: 1680, valleyKwh: 3600, totalAmount: 3120, collectMethod: '直连', auditStatus: '已通过' }
])

const filteredPublic = computed(() => {
  return publicBills.value.filter(b => {
    const matchKw = !filter.keyword.trim() ||
      b.billNo.includes(filter.keyword) || b.meterNo.includes(filter.keyword)
    const matchStatus = !filter.auditStatus || b.auditStatus === filter.auditStatus
    return matchKw && matchStatus
  })
})
const filteredSub = computed(() => {
  return subBills.value.filter(b => {
    const matchKw = !filter.keyword.trim() ||
      b.billNo.includes(filter.keyword) || b.meterNo.includes(filter.keyword) || b.user.includes(filter.keyword)
    const matchStatus = !filter.auditStatus || b.auditStatus === filter.auditStatus
    return matchKw && matchStatus
  })
})
const currentFiltered = computed(() => activeTab.value === 'public' ? filteredPublic.value.length : filteredSub.value.length)

function collectTagType(m) {
  if (m === '直连') return 'success'
  if (m === 'OCR') return 'warning'
  return 'info'
}
</script>

<style scoped lang="scss">
.zg-bills {
  padding: 24px;
  &__head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 18px; padding-bottom: 18px; border-bottom: 1px solid #e2e8f0; }
  &__headline { display: flex; align-items: center; gap: 14px; }
  &__sigil { width: 44px; height: 44px; border-radius: 10px; background: linear-gradient(135deg, #f59e0b, #d97706); color: #fff; display: flex; align-items: center; justify-content: center; }
  &__copy { display: flex; flex-direction: column; gap: 4px; }
  &__title { font-size: 20px; font-weight: 600; margin: 0; color: #18181b; }
  &__sub { font-size: 13px; color: #71717a; margin: 0; }
  &__cta { display: flex; gap: 10px; align-items: center; }
}

.zg-metrics {
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; margin-bottom: 16px;
  &__cell { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px 18px; display: flex; flex-direction: column; gap: 6px; box-shadow: 0 1px 3px rgba(15,23,42,0.04); position: relative; overflow: hidden;
    &::before { content: ''; position: absolute; left: 0; top: 0; width: 3px; height: 100%; background: #f59e0b; }
    &--primary::before { background: #6366f1; }
    &--success::before { background: #059669; }
    &--warn::before { background: #d97706; }
  }
  &__num { font-size: 24px; font-weight: 700; color: #18181b; line-height: 1; em { font-style: normal; font-size: 13px; color: #71717a; margin-left: 4px; font-weight: 400; } }
  &__lbl { font-size: 12px; color: #71717a; }
}

.zg-tabs-filter {
  background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 4px 18px 0;
  display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 16px;
  gap: 16px; flex-wrap: wrap;
  &__tabs { min-width: 300px; }
}

.zg-tab-label { display: inline-flex; align-items: center; gap: 6px; }

.zg-filterband--inline {
  padding: 10px 14px; background: #f8fafc; border-radius: 10px; display: flex; gap: 12px; align-items: center;
}

.zg-panel { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 18px; }

.zg-code { font-family: ui-monospace, monospace; font-size: 12px; font-weight: 600; color: #f59e0b; }

.zg-status {
  display: inline-flex; align-items: center; gap: 5px; font-size: 12px; padding: 2px 8px; border-radius: 999px;
  .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
  &.online { color: #059669; background: #d1fae5; }
  &.offline { color: #dc2626; background: #fee2e2; }
  &.idle { color: #d97706; background: #fef3c7; }
}

.text-amber-600 { color: #d97706; }
.text-emerald-600 { color: #059669; }
.font-semibold { font-weight: 600; }
.font-mono { font-family: ui-monospace, monospace; }
.font-bold { font-weight: 700; }

.zg-pagerbar { display: flex; justify-content: flex-end; padding-top: 14px; }
</style>
