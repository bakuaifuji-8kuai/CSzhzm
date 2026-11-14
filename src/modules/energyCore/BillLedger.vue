<!-- 智光云枢 · 能耗专项 · BillLedger 供电局计量与账单 -->
<template>
  <section class="zg-energy-bill">
    <header class="zg-energy__head">
      <div class="zg-energy__headline">
        <div class="zg-energy__sigil zg-energy__sigil--emerald"><el-icon :size="22"><Coin /></el-icon></div>
        <div class="zg-energy__copy">
          <h1>供电局计量与账单</h1>
          <p>公表 · 分表 · OCR 识别 / 直连 / Excel 导入 · 账单审核全链路</p>
        </div>
      </div>
      <div class="zg-energy__cta">
        <el-button type="primary" :icon="Camera" @click="ocrRunning = true">
          OCR 识别
          <span v-if="ocrRunning" class="zg-spinner"></span>
        </el-button>
        <el-button :icon="Upload">导入 Excel</el-button>
        <el-button :icon="Download">导出账单</el-button>
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

    <div class="zg-energy__main">
      <!-- 过滤 -->
      <div class="zg-filterband zg-filterband--tight mb-3">
        <el-select v-model="filter.type" placeholder="公/分表" style="width:120px" clearable>
          <el-option label="公表" value="公表" />
          <el-option label="分表" value="分表" />
        </el-select>
        <el-select v-model="filter.source" placeholder="采集方式" style="width:140px" clearable>
          <el-option label="OCR 识别" value="OCR" />
          <el-option label="直连采集" value="直连" />
          <el-option label="Excel 导入" value="导入" />
        </el-select>
        <el-select v-model="filter.status" placeholder="审核状态" style="width:140px" clearable>
          <el-option label="已审核" value="已审核" />
          <el-option label="待审核" value="待审核" />
          <el-option label="异常" value="异常" />
        </el-select>
        <el-date-picker v-model="filter.month" type="month" placeholder="计费月" value-format="YYYY-MM" style="width:150px" />
        <el-input v-model="filter.keyword" placeholder="账单号 / 仪表" :prefix-icon="Search" style="width:200px" clearable />
        <el-button type="primary" :icon="Search" size="small">查询</el-button>
      </div>

      <el-table :data="filteredBills" stripe size="small" height="540">
        <el-table-column prop="billNo" label="账单号" width="170" fixed="left" />
        <el-table-column prop="meter" label="计量仪表" width="180" />
        <el-table-column prop="kind" label="类型" width="80">
          <template #default="{ row }">
            <el-tag :type="row.kind === '公表' ? '' : 'info'" size="small" effect="plain">{{ row.kind }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="month" label="计费月" width="110" />
        <el-table-column prop="peak" label="峰 kWh" width="100" align="right">
          <template #default="{ row }"><span class="font-mono">{{ row.peak.toLocaleString() }}</span></template>
        </el-table-column>
        <el-table-column prop="flat" label="平 kWh" width="100" align="right">
          <template #default="{ row }"><span class="font-mono">{{ row.flat.toLocaleString() }}</span></template>
        </el-table-column>
        <el-table-column prop="valley" label="谷 kWh" width="100" align="right">
          <template #default="{ row }"><span class="font-mono">{{ row.valley.toLocaleString() }}</span></template>
        </el-table-column>
        <el-table-column prop="amount" label="总金额 ¥" width="130" align="right">
          <template #default="{ row }"><span class="font-mono font-semibold text-slate-800">{{ row.amount.toLocaleString() }}</span></template>
        </el-table-column>
        <el-table-column prop="source" label="采集方式" width="110">
          <template #default="{ row }">
            <el-tag :type="row.source === 'OCR' ? 'warning' : row.source === '直连' ? 'success' : 'info'" effect="light" size="small">
              {{ row.source === 'OCR' ? 'OCR 识别' : row.source === '直连' ? '直连采集' : 'Excel 导入' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="审核状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '已审核' ? 'success' : row.status === '待审核' ? 'warning' : 'danger'" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reviewer" label="审核人" width="90" />
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small">详情</el-button>
            <el-button v-if="row.status === '待审核'" link type="primary" size="small">审核</el-button>
            <el-button link type="primary" size="small">PDF</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { Coin, Download, Upload, Camera, Search, Document, Box, TrendCharts, Warning, CircleCheck } from "@element-plus/icons-vue"

const metrics = ref([
  { label: '本月账单', value: '84', icon: Document, bg: 'linear-gradient(135deg,#10b981,#34d399)' },
  { label: '峰平谷总量', value: '2,386,450', icon: TrendCharts, bg: 'linear-gradient(135deg,#06b6d4,#22d3ee)' },
  { label: '本月总额 ¥', value: '1,720,180', icon: Box, bg: 'linear-gradient(135deg,#f59e0b,#fbbf24)' },
  { label: '待审核', value: '6', icon: Warning, bg: 'linear-gradient(135deg,#ef4444,#f87171)' }
])

const filter = reactive({ type: '', source: '', status: '', month: '', keyword: '' })
const ocrRunning = ref(false)

const bills = ref([
  { billNo: 'ELEC-2026-11-0001', meter: '先导路公表 DTSD341 #A001', kind: '公表', month: '2026-10', peak: 18520, flat: 24680, valley: 11820, amount: 35420, source: '直连', status: '已审核', reviewer: '张敏' },
  { billNo: 'ELEC-2026-11-0002', meter: '麓谷箱变 3 公表', kind: '公表', month: '2026-10', peak: 42150, flat: 58320, valley: 28640, amount: 83210, source: '直连', status: '已审核', reviewer: '李亮' },
  { billNo: 'ELEC-2026-11-0003', meter: '梅溪湖箱变 4 公表', kind: '公表', month: '2026-10', peak: 29680, flat: 41250, valley: 19860, amount: 58640, source: 'OCR', status: '已审核', reviewer: '张敏' },
  { billNo: 'ELEC-2026-11-0004', meter: '岳麓箱变 5 公表', kind: '公表', month: '2026-10', peak: 24820, flat: 33860, valley: 16240, amount: 48520, source: '直连', status: '待审核', reviewer: '' },
  { billNo: 'ELEC-2026-11-0005', meter: '望城区公表 W-001', kind: '公表', month: '2026-10', peak: 15260, flat: 20840, valley: 9820, amount: 29680, source: '导入', status: '已审核', reviewer: '王芳' },
  { billNo: 'ELEC-2026-11-0006', meter: '先导路 L1-003 分表', kind: '分表', month: '2026-10', peak: 8620, flat: 11480, valley: 5420, amount: 16520, source: '直连', status: '已审核', reviewer: '张敏' },
  { billNo: 'ELEC-2026-11-0007', meter: '麓谷 L3-007 分表', kind: '分表', month: '2026-10', peak: 6140, flat: 8260, valley: 3920, amount: 11840, source: 'OCR', status: '已审核', reviewer: '李亮' },
  { billNo: 'ELEC-2026-11-0008', meter: '梅溪湖 L4-006 分表', kind: '分表', month: '2026-10', peak: 5280, flat: 7120, valley: 3380, amount: 10210, source: '直连', status: '已审核', reviewer: '张敏' },
  { billNo: 'ELEC-2026-11-0009', meter: '岳麓 L5-012 分表', kind: '分表', month: '2026-10', peak: 4820, flat: 6480, valley: 3020, amount: 9260, source: '直连', status: '异常', reviewer: '王芳' },
  { billNo: 'ELEC-2026-11-0010', meter: '先导路 L2-004 分表', kind: '分表', month: '2026-10', peak: 3920, flat: 5260, valley: 2460, amount: 7520, source: '导入', status: '已审核', reviewer: '张敏' },
  { billNo: 'ELEC-2026-11-0011', meter: '高新区 G-004 公表', kind: '公表', month: '2026-10', peak: 8640, flat: 11520, valley: 5480, amount: 16580, source: 'OCR', status: '待审核', reviewer: '' },
  { billNo: 'ELEC-2026-11-0012', meter: '雨花区 Y-002 公表', kind: '公表', month: '2026-10', peak: 12680, flat: 16820, valley: 8120, amount: 24360, source: '直连', status: '已审核', reviewer: '李亮' },
  { billNo: 'ELEC-2026-11-0013', meter: '开福区 K-003 公表', kind: '公表', month: '2026-10', peak: 9820, flat: 13120, valley: 6240, amount: 18940, source: '直连', status: '已审核', reviewer: '张敏' },
  { billNo: 'ELEC-2026-11-0014', meter: '先导路 L1-016 分表', kind: '分表', month: '2026-10', peak: 3480, flat: 4620, valley: 2160, amount: 6580, source: 'OCR', status: '待审核', reviewer: '' },
  { billNo: 'ELEC-2026-11-0015', meter: '麓谷 L3-020 分表', kind: '分表', month: '2026-10', peak: 3120, flat: 4160, valley: 1940, amount: 5920, source: '直连', status: '已审核', reviewer: '李亮' }
])

const filteredBills = computed(() => bills.value.filter(b =>
  (!filter.type || b.kind === filter.type) &&
  (!filter.source || b.source === filter.source) &&
  (!filter.status || b.status === filter.status) &&
  (!filter.month || b.month === filter.month) &&
  (!filter.keyword || b.billNo.includes(filter.keyword) || b.meter.includes(filter.keyword))
))
</script>

<style lang="scss" scoped>
.zg-energy-bill { padding: var(--zg-space-6); background: var(--zg-gradient-surface); min-height: calc(100vh - 120px); }
.zg-energy__head { display: flex; justify-content: space-between; align-items: center; padding-bottom: var(--zg-space-5); margin-bottom: var(--zg-space-4); border-bottom: 1px solid var(--zg-line-soft); }
.zg-energy__sigil { width: 44px; height: 44px; border-radius: var(--zg-radius-md); background: linear-gradient(135deg,#06b6d4,#6366f1); color: #fff; display: flex; align-items: center; justify-content: center; }
.zg-energy__sigil--emerald { background: linear-gradient(135deg,#10b981,#06b6d4); }
.zg-energy__headline { display: flex; gap: var(--zg-space-3); align-items: center; }
.zg-energy__copy h1 { margin: 0; font-size: var(--zg-text-display-md); font-weight: 700; }
.zg-energy__copy p { margin: 2px 0 0; font-size: var(--zg-text-body-sm); color: var(--zg-ink-tertiary); }

.zg-metrics { display: grid; grid-template-columns: repeat(4,1fr); gap: var(--zg-space-4); margin-bottom: var(--zg-space-5); }
.zg-metrics__cell { display: flex; gap: var(--zg-space-3); padding: var(--zg-space-4); background: var(--zg-surface-card); border: 1px solid var(--zg-line-soft); border-radius: var(--zg-radius-lg); box-shadow: var(--zg-shadow-card); }
.zg-metrics__icon { width: 42px; height: 42px; border-radius: var(--zg-radius-md); display: flex; align-items: center; justify-content: center; color: #fff; flex-shrink: 0; }
.zg-metrics__num { font-size: 22px; font-weight: 800; font-family: var(--zg-font-mono); }
.zg-metrics__lbl { font-size: 12px; color: var(--zg-ink-tertiary); margin-top: 2px; }

.zg-energy__main { background: var(--zg-surface-card); border: 1px solid var(--zg-line-soft); border-radius: var(--zg-radius-lg); padding: var(--zg-space-4); }
.mb-3 { margin-bottom: var(--zg-space-3); }
.zg-spinner { display: inline-block; width: 12px; height: 12px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; margin-left: 6px; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
