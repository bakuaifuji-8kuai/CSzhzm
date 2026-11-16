<!--
  智光云枢 · 采购管理 · 采购订单
  订单 → 合同 → 供应商 → 到货 链路
-->
<template>
  <section class="zg-pm-order">
    <header class="zg-pm-order__head">
      <div class="zg-pm-order__headline">
        <div class="zg-pm-order__sigil"><el-icon :size="22"><Tickets /></el-icon></div>
        <div class="zg-pm-order__copy">
          <h1>采购订单</h1>
          <p>共 {{ allOrders.length }} 条订单 · 总金额 ¥{{ (kpiAgg.totalAmount/10000).toFixed(1) }}万 ·
            执行中 {{ kpiAgg.inProgress }} 条 · 已完成 {{ kpiAgg.done }} 条</p>
        </div>
      </div>
      <div class="zg-pm-order__cta">
        <el-button type="primary"><el-icon><Plus /></el-icon>创建订单</el-button>
        <el-button plain><el-icon><Download /></el-icon>导出</el-button>
      </div>
    </header>

    <!-- 状态 Tab -->
    <div class="zg-pm-order__main">
      <el-tabs v-model="activeTab" class="zg-pm-order__tabs">
        <el-tab-pane v-for="t in statusTabs" :key="t.key" :name="t.key">
          <template #label>
            <span class="zg-tab-label">
              <el-icon><component :is="t.icon" /></el-icon>
              {{ t.label }}
              <em class="zg-tab-count">{{ t.count }}</em>
            </span>
          </template>
        </el-tab-pane>
      </el-tabs>

      <!-- 筛选条 -->
      <div class="zg-pm-order__filterbar">
        <div class="zg-filter-row">
          <div class="zg-filter-item">
            <span class="zg-filter-item__lbl">供应商</span>
            <el-select v-model="filters.supplier" placeholder="全部供应商" clearable class="zg-filter-select">
              <el-option v-for="s in supplierOptions" :key="s.code" :label="`${s.code} ${s.name}`" :value="s.code" />
            </el-select>
          </div>
          <div class="zg-filter-item">
            <span class="zg-filter-item__lbl">订单号</span>
            <el-input v-model="filters.orderNo" placeholder="PO-2026..." class="zg-filter-input" clearable />
          </div>
          <div class="zg-filter-item">
            <span class="zg-filter-item__lbl">合同号</span>
            <el-input v-model="filters.contractNo" placeholder="HT-2026..." class="zg-filter-input" clearable />
          </div>
          <div class="zg-filter-item zg-filter-item--actions">
            <el-button type="primary"><el-icon><Search /></el-icon>查询</el-button>
            <el-button @click="onReset"><el-icon><Refresh /></el-icon>重置</el-button>
          </div>
        </div>
      </div>

      <!-- 表格 -->
      <div class="zg-pm-order__tablewrap">
        <el-table :data="filteredList" stripe height="560">
          <el-table-column prop="orderNo" label="订单号" width="155" fixed="left">
            <template #default="{ row }">
              <span class="zg-pm-code">{{ row.orderNo }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="contractNo" label="合同号" width="155">
            <template #default="{ row }">
              <span class="zg-pm-code">{{ row.contractNo }}</span>
            </template>
          </el-table-column>
          <el-table-column label="供应商" min-width="220">
            <template #default="{ row }">
              <div class="zg-pm-supplier">
                <span class="zg-pm-supplier__code">{{ row.supplierCode }}</span>
                <span class="zg-pm-supplier__name">{{ row.supplierName }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="订单金额" width="130" align="right">
            <template #default="{ row }">¥{{ row.amount.toLocaleString() }}</template>
          </el-table-column>
          <el-table-column prop="orderDate" label="下单日期" width="110" />
          <el-table-column prop="expectArrive" label="预计到货" width="110" />
          <el-table-column prop="actualArrive" label="实际到货" width="110">
            <template #default="{ row }">
              <span v-if="row.actualArrive" class="zg-pm-arrive--ok">{{ row.actualArrive }}</span>
              <span v-else class="zg-pm-arrive--pending">—</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="110" align="center">
            <template #default="{ row }">
              <span class="zg-status-pill" :class="'zg-status-pill--' + row.statusKey">
                <i class="dot"></i>{{ row.statusLabel }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small">详情</el-button>
              <el-button v-if="row.statusKey !== 'done' && row.statusKey !== 'cancelled'" link type="primary" size="small">跟踪</el-button>
              <el-button v-if="row.statusKey === 'done'" link type="success" size="small">到货验收</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="zg-pm-order__pager">
        <span class="zg-pm-order__total">共 {{ filteredList.length }} 条</span>
        <el-pagination background layout="prev, pager, next, sizes" :total="filteredList.length"
          :page-sizes="[10, 20, 50]" :page-size="10" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Tickets, Plus, Download, Search, Refresh, List, Document, Box, Promotion, CircleCheck, Close } from '@element-plus/icons-vue'

interface OrderRow {
  id: number
  orderNo: string
  contractNo: string
  supplierCode: string
  supplierName: string
  amount: number
  orderDate: string
  expectArrive: string
  actualArrive: string
  statusKey: 'pending' | 'ordered' | 'producing' | 'shipped' | 'arrived' | 'done' | 'cancelled'
  statusLabel: string
}

// 供应商编号与 SupplierLedger 保持一致
const supplierOptions = [
  { code: 'SUP-001', name: '深圳洲明科技股份有限公司' },
  { code: 'SUP-002', name: '上海三思电子工程有限公司' },
  { code: 'SUP-003', name: '长沙华电电气设备有限公司' },
  { code: 'SUP-004', name: '湖南光明照明工程有限公司' },
  { code: 'SUP-005', name: '长沙光服运维服务有限公司' },
  { code: 'SUP-006', name: '中联重科车辆销售分公司' },
]

const allOrders = ref<OrderRow[]>([
  { id: 1,  orderNo: 'PO-202611-001', contractNo: 'HT-2026-0087', supplierCode: 'SUP-001', supplierName: '深圳洲明科技股份有限公司', amount: 2800000, orderDate: '2026-11-03', expectArrive: '2026-11-25', actualArrive: '',            statusKey: 'producing', statusLabel: '生产中'   },
  { id: 2,  orderNo: 'PO-202611-002', contractNo: 'HT-2026-0090', supplierCode: 'SUP-003', supplierName: '长沙华电电气设备有限公司',   amount: 420000,  orderDate: '2026-11-05', expectArrive: '2026-11-20', actualArrive: '2026-11-19', statusKey: 'done',      statusLabel: '已完成'   },
  { id: 3,  orderNo: 'PO-202611-003', contractNo: 'HT-2026-0092', supplierCode: 'SUP-006', supplierName: '中联重科车辆销售分公司',     amount: 680000,  orderDate: '2026-11-06', expectArrive: '2026-12-05', actualArrive: '',            statusKey: 'ordered',   statusLabel: '已下单'   },
  { id: 4,  orderNo: 'PO-202611-004', contractNo: 'HT-2026-0095', supplierCode: 'SUP-005', supplierName: '长沙光服运维服务有限公司',   amount: 15600000,orderDate: '2026-11-08', expectArrive: '2026-11-15', actualArrive: '2026-11-14', statusKey: 'arrived',   statusLabel: '已到货'   },
  { id: 5,  orderNo: 'PO-202611-005', contractNo: 'HT-2026-0098', supplierCode: 'SUP-002', supplierName: '上海三思电子工程有限公司',   amount: 980000,  orderDate: '2026-11-10', expectArrive: '2026-11-28', actualArrive: '',            statusKey: 'shipped',   statusLabel: '已发货'   },
  { id: 6,  orderNo: 'PO-202611-006', contractNo: 'HT-2026-0101', supplierCode: 'SUP-004', supplierName: '湖南光明照明工程有限公司',   amount: 158000,  orderDate: '2026-11-12', expectArrive: '2026-11-18', actualArrive: '2026-11-17', statusKey: 'done',      statusLabel: '已完成'   },
  { id: 7,  orderNo: 'PO-202611-007', contractNo: 'HT-2026-0103', supplierCode: 'SUP-001', supplierName: '深圳洲明科技股份有限公司',   amount: 640000,  orderDate: '2026-11-14', expectArrive: '2026-11-22', actualArrive: '',            statusKey: 'pending',   statusLabel: '待下单'   },
  { id: 8,  orderNo: 'PO-202611-008', contractNo: 'HT-2026-0105', supplierCode: 'SUP-006', supplierName: '中联重科车辆销售分公司',     amount: 260000,  orderDate: '2026-11-15', expectArrive: '2026-11-30', actualArrive: '',            statusKey: 'producing', statusLabel: '生产中'   },
])

const activeTab = ref('all')
const filters = reactive({
  supplier: '',
  orderNo: '',
  contractNo: ''
})

const statusTabs = computed(() => {
  const list = allOrders.value
  return [
    { key: 'all',        label: '全部',     icon: List,         count: list.length },
    { key: 'pending',    label: '待下单',   icon: Document,     count: list.filter(r => r.statusKey === 'pending').length },
    { key: 'ordered',    label: '已下单',   icon: Box,          count: list.filter(r => r.statusKey === 'ordered').length },
    { key: 'producing',  label: '生产中',   icon: Truck,          count: list.filter(r => r.statusKey === 'producing').length },
    { key: 'shipped',    label: '已发货',   icon: Truck,          count: list.filter(r => r.statusKey === 'shipped').length },
    { key: 'arrived',    label: '已到货',   icon: BoxChecked,   count: list.filter(r => r.statusKey === 'arrived').length },
    { key: 'done',       label: '已完成',   icon: CircleCheck,  count: list.filter(r => r.statusKey === 'done').length },
  ]
})

const filteredList = computed(() => {
  let list = allOrders.value
  if (activeTab.value !== 'all') list = list.filter(r => r.statusKey === activeTab.value)
  if (filters.supplier) list = list.filter(r => r.supplierCode === filters.supplier)
  if (filters.orderNo.trim()) list = list.filter(r => r.orderNo.includes(filters.orderNo.trim().toUpperCase()))
  if (filters.contractNo.trim()) list = list.filter(r => r.contractNo.includes(filters.contractNo.trim().toUpperCase()))
  return list
})

const kpiAgg = computed(() => {
  const rows = allOrders.value
  return {
    totalAmount: rows.reduce((a, r) => a + r.amount, 0),
    inProgress: rows.filter(r => ['pending', 'ordered', 'producing', 'shipped', 'arrived'].includes(r.statusKey)).length,
    done: rows.filter(r => r.statusKey === 'done').length
  }
})

function onReset() {
  filters.supplier = ''
  filters.orderNo = ''
  filters.contractNo = ''
  activeTab.value = 'all'
}
</script>

<style scoped lang="scss">
.zg-pm-order {
  --zg-primary: #0f766e;
  --zg-success: #059669;
  --zg-warning: #d97706;
  --zg-danger:  #dc2626;
  --zg-info:    #0284c7;
  --zg-ink-primary: #18181b;
  --zg-ink-tertiary: #71717a;
  --zg-line-soft: rgba(241,245,249,0.8);
  padding: 24px;
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
  min-height: calc(100vh - 120px);

  &__head {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 20px; padding-bottom: 18px; border-bottom: 1px solid var(--zg-line-soft);
  }
  &__headline { display: flex; align-items: center; gap: 14px; }
  &__sigil {
    width: 44px; height: 44px; border-radius: 10px;
    background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%);
    color: #fff; display: flex; align-items: center; justify-content: center;
  }
  &__copy h1 { font-size: 20px; font-weight: 600; margin: 0; }
  &__copy p { font-size: 13px; color: var(--zg-ink-tertiary); margin: 4px 0 0; }
  &__cta { display: flex; gap: 10px; }

  &__main {
    background: #fff; border-radius: 16px;
    border: 1px solid var(--zg-line-soft); padding: 18px;
  }
  &__tabs { margin-bottom: 16px; }
  &__filterbar {
    padding: 14px 16px; background: #f8fafc;
    border-radius: 10px; margin-bottom: 14px;
  }
  &__tablewrap { border: 1px solid var(--zg-line-soft); border-radius: 10px; overflow: hidden; }
  &__pager {
    display: flex; justify-content: space-between; align-items: center;
    padding-top: 14px; margin-top: 16px;
    border-top: 1px solid var(--zg-line-soft);
  }
  &__total { font-size: 13px; color: var(--zg-ink-tertiary); }
}

.zg-tab-label {
  display: inline-flex; align-items: center; gap: 6px;
  .zg-tab-count {
    font-style: normal; font-size: 11px; padding: 1px 7px;
    background: #f0fdfa; color: var(--zg-primary);
    border-radius: 999px; font-weight: 500;
  }
}

.zg-filter-row { display: flex; flex-wrap: wrap; align-items: center; gap: 14px 20px; }
.zg-filter-item {
  display: flex; align-items: center; gap: 8px;
  &__lbl { font-size: 12px; color: var(--zg-ink-tertiary); flex-shrink: 0; }
  &--actions { margin-left: auto; }
}
.zg-filter-select { width: 220px; }
.zg-filter-input { width: 180px; }

.zg-pm-code { font-family: 'Geist Mono', ui-monospace, monospace; font-size: 12px; font-weight: 600; color: #52525b; }

.zg-pm-supplier { display: flex; flex-direction: column; gap: 2px; }
.zg-pm-supplier__code { font-family: 'Geist Mono', ui-monospace, monospace; font-size: 11px; color: #71717a; font-weight: 600; }
.zg-pm-supplier__name { font-size: 13px; color: #18181b; }

.zg-pm-arrive--ok { color: var(--zg-success); font-weight: 500; }
.zg-pm-arrive--pending { color: var(--zg-ink-tertiary); }

.zg-status-pill {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 12px; padding: 2px 10px; border-radius: 999px; font-weight: 500;
  .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
  &--pending   { color: var(--zg-info);    background: #e0f2fe; }
  &--ordered   { color: #7c3aed; background: #ede9fe; }
  &--producing { color: var(--zg-warning); background: #fef3c7; }
  &--shipped   { color: #c2410c; background: #ffedd5; }
  &--arrived   { color: #0f766e; background: #ccfbf1; }
  &--done      { color: var(--zg-success); background: #d1fae5; }
  &--cancelled { color: var(--zg-danger);   background: #fee2e2; }
}
</style>
