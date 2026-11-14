<!-- 智光云枢 · 能耗专项 · Settlement 电费台账与结算 -->
<template>
  <section class="zg-energy-settle">
    <header class="zg-energy__head">
      <div class="zg-energy__headline">
        <div class="zg-energy__sigil zg-energy__sigil--amber"><el-icon :size="22"><Coin /></el-icon></div>
        <div class="zg-energy__copy">
          <h1>电费台账与结算</h1>
          <p>月度电费总账 · 公表 / 分表 Tab · 区域汇总 · 结算进度与欠费预警</p>
        </div>
      </div>
      <div class="zg-energy__cta">
        <el-button type="primary" :icon="Coin">发起结算</el-button>
        <el-button :icon="Download">导出台账</el-button>
      </div>
    </header>

    <!-- 区域汇总卡片 -->
    <div class="zg-energy__region-cards">
      <div v-for="r in regionCards" :key="r.name" class="zg-energy__region-card">
        <div class="zg-energy__region-head">
          <el-icon :size="18"><MapLocation /></el-icon>
          <span>{{ r.name }}</span>
        </div>
        <div class="zg-energy__region-main">
          <div class="zg-energy__region-num">¥ {{ r.amount.toLocaleString() }}</div>
          <div class="zg-energy__region-sub">{{ r.kwh.toLocaleString() }} kWh · {{ r.bills }} 单</div>
        </div>
        <div class="zg-energy__region-bar">
          <el-progress :percentage="Math.round(r.amount / 1200000 * 100)" :show-text="false" :stroke-width="4" color="#06b6d4" />
        </div>
      </div>
    </div>

    <div class="zg-energy__main">
      <!-- 左：总账 + Tab -->
      <div class="zg-energy__ledger">
        <el-tabs v-model="activeTab" type="card" class="zg-energy__tabs">
          <el-tab-pane label="公表总账" name="public">
            <el-table :data="publicLedger" stripe size="small" height="460">
              <el-table-column prop="month" label="月份" width="100" />
              <el-table-column prop="box" label="箱变" width="150" />
              <el-table-column prop="kwh" label="用电 kWh" width="120" align="right">
                <template #default="{ row }"><span class="font-mono font-semibold">{{ row.kwh.toLocaleString() }}</span></template>
              </el-table-column>
              <el-table-column prop="rate" label="均价 ¥/kWh" width="120" align="right">
                <template #default="{ row }"><span class="font-mono">{{ row.rate.toFixed(3) }}</span></template>
              </el-table-column>
              <el-table-column prop="amount" label="金额 ¥" width="140" align="right">
                <template #default="{ row }"><span class="font-mono font-bold text-slate-800">{{ row.amount.toLocaleString() }}</span></template>
              </el-table-column>
              <el-table-column prop="settle" label="结算状态" width="110">
                <template #default="{ row }">
                  <el-tag :type="row.settle === '已结算' ? 'success' : row.settle === '结算中' ? 'warning' : 'danger'" size="small">{{ row.settle }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="invoice" label="发票" width="80">
                <template #default="{ row }">
                  <el-icon v-if="row.invoice" class="text-emerald-500"><CircleCheck /></el-icon>
                  <span v-else class="text-slate-300">—</span>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>

          <el-tab-pane label="分表总账" name="sub">
            <el-table :data="subLedger" stripe size="small" height="460">
              <el-table-column prop="month" label="月份" width="100" />
              <el-table-column prop="loop" label="回路" width="140" />
              <el-table-column prop="owner" label="分摊方" width="140" />
              <el-table-column prop="kwh" label="用电 kWh" width="120" align="right">
                <template #default="{ row }"><span class="font-mono">{{ row.kwh.toLocaleString() }}</span></template>
              </el-table-column>
              <el-table-column prop="amount" label="分摊额 ¥" width="130" align="right">
                <template #default="{ row }"><span class="font-mono font-semibold">{{ row.amount.toLocaleString() }}</span></template>
              </el-table-column>
              <el-table-column prop="ratio" label="分摊比" width="100">
                <template #default="{ row }"><el-progress :percentage="row.ratio" :stroke-width="8" /></template>
              </el-table-column>
              <el-table-column prop="settle" label="状态" width="90">
                <template #default="{ row }">
                  <el-tag :type="row.settle === '已结算' ? 'success' : row.settle === '结算中' ? 'warning' : 'danger'" size="small">{{ row.settle }}</el-tag>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 右：结算面板 -->
      <aside class="zg-energy__settle-panel">
        <div class="zg-energy__panel-head">
          <h3><el-icon><Coin /></el-icon>结算中心</h3>
        </div>
        <div class="zg-energy__settle-card">
          <div class="zg-energy__settle-row">
            <span class="zg-energy__settle-lbl">合同供应商</span>
            <span class="zg-energy__settle-val">国家电网 · 长沙供电公司</span>
          </div>
          <div class="zg-energy__settle-row">
            <span class="zg-energy__settle-lbl">结算周期</span>
            <span class="zg-energy__settle-val">自然月 · T+15 开票</span>
          </div>
          <div class="zg-energy__settle-row">
            <span class="zg-energy__settle-lbl">本月应付</span>
            <span class="zg-energy__settle-val text-rose-600 font-bold">¥ 1,720,180</span>
          </div>
          <div class="zg-energy__settle-row">
            <span class="zg-energy__settle-lbl">已开票金额</span>
            <span class="zg-energy__settle-val">¥ 1,586,420</span>
          </div>
          <div class="zg-energy__settle-row">
            <span class="zg-energy__settle-lbl">待开票</span>
            <span class="zg-energy__settle-val">¥ 133,760</span>
          </div>
        </div>

        <h4 class="zg-energy__settle-subtitle">开票记录</h4>
        <div class="zg-energy__invoice-list">
          <div v-for="iv in invoices" :key="iv.no" class="zg-energy__invoice">
            <div class="zg-energy__invoice-head">
              <span class="zg-energy__invoice-no">{{ iv.no }}</span>
              <el-tag v-if="iv.status === '已收到'" type="success" size="small">{{ iv.status }}</el-tag>
              <el-tag v-else type="warning" size="small">{{ iv.status }}</el-tag>
            </div>
            <div class="zg-energy__invoice-info">
              <span>{{ iv.month }}</span>
              <span class="zg-energy__invoice-amt">¥ {{ iv.amount.toLocaleString() }}</span>
            </div>
          </div>
        </div>

        <div class="zg-energy__alert-card">
          <div class="zg-energy__alert-head">
            <el-icon class="text-rose-500"><Warning /></el-icon>
            <strong>欠费预警</strong>
            <el-tag type="danger" size="small">3 笔</el-tag>
          </div>
          <div v-for="d in debts" :key="d.id" class="zg-energy__alert-row">
            <div>
              <span class="font-semibold">{{ d.party }}</span>
              <span class="text-slate-400 text-xs ml-2">逾期 {{ d.days }} 天</span>
            </div>
            <span class="text-rose-600 font-mono font-bold">¥ {{ d.amount.toLocaleString() }}</span>
          </div>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Coin, Download, MapLocation, CircleCheck, Warning } from "@element-plus/icons-vue"

const activeTab = ref('public')

const regionCards = ref([
  { name: '先导区', kwh: 568000, amount: 410128, bills: 18 },
  { name: '岳麓区', kwh: 458200, amount: 330340, bills: 15 },
  { name: '高新区', kwh: 486300, amount: 350642, bills: 16 },
  { name: '望城区', kwh: 268400, amount: 193568, bills: 10 },
  { name: '雨花区', kwh: 324600, amount: 233014, bills: 12 },
  { name: '开福区', kwh: 280950, amount: 201070, bills: 10 }
])

const publicLedger = ref([
  { month: '2026-10', box: '先导路箱变 1', kwh: 440000, rate: 0.721, amount: 317240, settle: '已结算', invoice: true },
  { month: '2026-10', box: '先导路箱变 2', kwh: 198500, rate: 0.721, amount: 143118, settle: '已结算', invoice: true },
  { month: '2026-10', box: '麓谷箱变 3', kwh: 412300, rate: 0.721, amount: 297268, settle: '结算中', invoice: false },
  { month: '2026-10', box: '梅溪湖箱变 4', kwh: 296800, rate: 0.721, amount: 213993, settle: '已结算', invoice: true },
  { month: '2026-10', box: '岳麓箱变 5', kwh: 256400, rate: 0.721, amount: 184864, settle: '已结算', invoice: true },
  { month: '2026-10', box: '望城区箱变 W', kwh: 186400, rate: 0.721, amount: 134394, settle: '结算中', invoice: false },
  { month: '2026-10', box: '雨花区箱变 Y', kwh: 228600, rate: 0.721, amount: 164821, settle: '已结算', invoice: true },
  { month: '2026-10', box: '开福区箱变 K', kwh: 204200, rate: 0.721, amount: 147228, settle: '已结算', invoice: true },
  { month: '2026-10', box: '高新区箱变 G', kwh: 212600, rate: 0.721, amount: 153285, settle: '结算中', invoice: false },
  { month: '2026-09', box: '先导路箱变 1', kwh: 420000, rate: 0.721, amount: 302820, settle: '已结算', invoice: true }
])

const subLedger = ref([
  { month: '2026-10', loop: 'L1-003', owner: '长沙交警支队', kwh: 42100, amount: 30354, ratio: 18, settle: '已结算' },
  { month: '2026-10', loop: 'L3-007', owner: '高新区公安分局', kwh: 32600, amount: 23504, ratio: 14, settle: '已结算' },
  { month: '2026-10', loop: 'L4-006', owner: '长沙公交集团', kwh: 28400, amount: 20476, ratio: 12, settle: '结算中' },
  { month: '2026-10', loop: 'L5-012', owner: '岳麓环卫局', kwh: 12600, amount: 9085, ratio: 5, settle: '已结算' },
  { month: '2026-10', loop: 'L1-009', owner: '长沙交警支队', kwh: 21800, amount: 15718, ratio: 9, settle: '已结算' },
  { month: '2026-10', loop: 'L3-011', owner: '高新区城管局', kwh: 18200, amount: 13122, ratio: 8, settle: '已结算' },
  { month: '2026-10', loop: 'L2-004', owner: '长沙公交集团', kwh: 24600, amount: 17737, ratio: 11, settle: '结算中' },
  { month: '2026-10', loop: 'L4-015', owner: '岳麓环卫局', kwh: 9800, amount: 7066, ratio: 4, settle: '已结算' },
  { month: '2026-10', loop: 'L1-016', owner: '长沙交警支队', kwh: 17600, amount: 12690, ratio: 7, settle: '已结算' },
  { month: '2026-10', loop: 'L3-020', owner: '长沙公交集团', kwh: 15200, amount: 10959, ratio: 6, settle: '已结算' }
])

const invoices = ref([
  { no: 'INV-2026-10-001', month: '2026-10 上半月', amount: 826350, status: '已收到' },
  { no: 'INV-2026-10-002', month: '2026-10 下半月', amount: 760070, status: '已收到' },
  { no: 'INV-2026-09-003', month: '2026-09 补开', amount: 336420, status: '已收到' },
  { no: 'INV-2026-11-001', month: '2026-10 分表', amount: 133760, status: '开票中' }
])

const debts = ref([
  { id: 1, party: '高新区城管局', amount: 23504, days: 18 },
  { id: 2, party: '长沙公交集团', amount: 38213, days: 12 },
  { id: 3, party: '岳麓环卫局', amount: 7066, days: 8 }
])
</script>

<style lang="scss" scoped>
.zg-energy-settle { padding: var(--zg-space-6); background: var(--zg-gradient-surface); min-height: calc(100vh - 120px); }
.zg-energy__head { display: flex; justify-content: space-between; align-items: center; padding-bottom: var(--zg-space-5); margin-bottom: var(--zg-space-4); border-bottom: 1px solid var(--zg-line-soft); }
.zg-energy__sigil { width: 44px; height: 44px; border-radius: var(--zg-radius-md); background: linear-gradient(135deg,#06b6d4,#6366f1); color: #fff; display: flex; align-items: center; justify-content: center; }
.zg-energy__sigil--amber { background: linear-gradient(135deg,#f59e0b,#dc2626); }
.zg-energy__headline { display: flex; gap: var(--zg-space-3); align-items: center; }
.zg-energy__copy h1 { margin: 0; font-size: var(--zg-text-display-md); font-weight: 700; }
.zg-energy__copy p { margin: 2px 0 0; font-size: var(--zg-text-body-sm); color: var(--zg-ink-tertiary); }

.zg-energy__region-cards { display: grid; grid-template-columns: repeat(6, 1fr); gap: var(--zg-space-3); margin-bottom: var(--zg-space-5); }
.zg-energy__region-card { padding: var(--zg-space-3); background: var(--zg-surface-card); border: 1px solid var(--zg-line-soft); border-radius: var(--zg-radius-md); }
.zg-energy__region-head { display: flex; align-items: center; gap: 4px; font-size: 13px; color: var(--zg-ink-secondary); margin-bottom: 6px; }
.zg-energy__region-num { font-size: 18px; font-weight: 800; font-family: var(--zg-font-mono); letter-spacing: -0.01em; }
.zg-energy__region-sub { font-size: 11px; color: var(--zg-ink-tertiary); margin: 2px 0 8px; }

.zg-energy__main { display: grid; grid-template-columns: 1fr 340px; gap: var(--zg-space-4); }
.zg-energy__ledger { background: var(--zg-surface-card); border: 1px solid var(--zg-line-soft); border-radius: var(--zg-radius-lg); padding: var(--zg-space-4); }
.zg-energy__tabs { :deep(.el-tabs__item) { font-weight: 600; } }

.zg-energy__settle-panel { background: var(--zg-surface-card); border: 1px solid var(--zg-line-soft); border-radius: var(--zg-radius-lg); padding: var(--zg-space-4); display: flex; flex-direction: column; gap: var(--zg-space-3); }
.zg-energy__panel-head h3 { margin: 0; font-size: var(--zg-text-body); font-weight: 600; display: flex; align-items: center; gap: 6px; }
.zg-energy__settle-card { border: 1px solid var(--zg-line-soft); border-radius: var(--zg-radius-md); padding: var(--zg-space-3); }
.zg-energy__settle-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px dashed var(--zg-line-soft); &:last-child { border-bottom: none; } }
.zg-energy__settle-lbl { font-size: 13px; color: var(--zg-ink-tertiary); }
.zg-energy__settle-val { font-size: 13px; font-family: var(--zg-font-mono); }
.zg-energy__settle-subtitle { margin: var(--zg-space-2) 0 0; font-size: var(--zg-text-body-sm); font-weight: 600; color: var(--zg-ink-secondary); }
.zg-energy__invoice-list { display: flex; flex-direction: column; gap: 8px; }
.zg-energy__invoice { padding: 10px 12px; border: 1px solid var(--zg-line-soft); border-radius: var(--zg-radius-md); background: var(--zg-surface-muted); }
.zg-energy__invoice-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.zg-energy__invoice-no { font-family: var(--zg-font-mono); font-size: 12px; color: var(--zg-ink-secondary); }
.zg-energy__invoice-info { display: flex; justify-content: space-between; font-size: 12px; color: var(--zg-ink-tertiary); }
.zg-energy__invoice-amt { font-family: var(--zg-font-mono); font-weight: 700; color: var(--zg-ink-primary); }

.zg-energy__alert-card { background: linear-gradient(135deg, rgba(239,68,68,0.08), rgba(245,158,11,0.08)); border: 1px solid rgba(239,68,68,0.25); border-radius: var(--zg-radius-md); padding: var(--zg-space-3); }
.zg-energy__alert-head { display: flex; gap: 6px; align-items: center; margin-bottom: 8px; }
.zg-energy__alert-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px dashed rgba(239,68,68,0.15); &:last-child { border-bottom: none; } }
</style>
