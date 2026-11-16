<!--
  智光云枢 · 合同合同管理 · 合同台账
  覆盖采购/运维/工程/外包/车辆 五类合同
  KPI 四卡 + Tab 分类 + 筛选条 + el-table
-->
<template>
  <section class="zg-ct-ledger">
    <header class="zg-ct-ledger__head">
      <div class="zg-ct-ledger__headline">
        <div class="zg-ct-ledger__sigil"><el-icon :size="22"><Document /></el-icon></div>
        <div class="zg-ct-ledger__copy">
          <h1 class="zg-ct-ledger__title">合同台账</h1>
          <p class="zg-ct-ledger__sub">
            城市照明合同全景账本 · 共 {{ kpiAgg.total }} 份 ·
            生效中 {{ kpiAgg.active }} 份 ·
            本年签约 ¥{{ (kpiAgg.yearAmount / 10000).toFixed(0) }}万 ·
            即将到期 {{ kpiAgg.expiringSoon }} 份
          </p>
        </div>
      </div>
      <div class="zg-ct-ledger__cta">
        <el-button type="primary"><el-icon><Plus /></el-icon>新建合同</el-button>
        <el-dropdown trigger="click">
          <el-button plain><el-icon><Download /></el-icon>导出</el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item><el-icon><Document /></el-icon>导出 Excel</el-dropdown-item>
              <el-dropdown-item @click="onCsvExport"><el-icon><Files /></el-icon>导出 CSV</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>

    <!-- KPI 四卡 -->
    <div class="zg-ct-ledger__kpi">
      <div v-for="cell in kpiCells" :key="cell.key" class="zg-kpi-cell" :class="cell.theme">
        <div class="zg-kpi-cell__icon"><el-icon :size="20"><component :is="cell.icon" /></el-icon></div>
        <div class="zg-kpi-cell__body">
          <span class="zg-kpi-cell__num">{{ cell.value }}</span>
          <span class="zg-kpi-cell__lbl">{{ cell.label }}</span>
        </div>
      </div>
    </div>

    <!-- 主体卡 -->
    <div class="zg-ct-ledger__main">
      <!-- Tab 分类 -->
      <el-tabs v-model="activeCategory" class="zg-ct-ledger__tabs">
        <el-tab-pane v-for="cat in allCategoryTabs" :key="cat.key" :name="cat.key">
          <template #label>
            <span class="zg-tab-label">
              <el-icon><component :is="cat.icon" /></el-icon>
              {{ cat.label }}
              <em class="zg-tab-count">{{ cat.count }}</em>
            </span>
          </template>
        </el-tab-pane>
      </el-tabs>

      <!-- 筛选条 -->
      <div class="zg-ct-ledger__filterbar">
        <div class="zg-filter-row">
          <div class="zg-filter-item">
            <span class="zg-filter-item__lbl">合同类型</span>
            <el-select v-model="filters.type" placeholder="全部" class="zg-filter-select" clearable>
              <el-option v-for="t in contractTypes" :key="t.key" :label="t.label" :value="t.key" />
            </el-select>
          </div>
          <div class="zg-filter-item">
            <span class="zg-filter-item__lbl">状态</span>
            <el-select v-model="filters.status" placeholder="全部状态" class="zg-filter-select" clearable>
              <el-option v-for="s in statusList" :key="s.key" :label="s.label" :value="s.key" />
            </el-select>
          </div>
          <div class="zg-filter-item">
            <span class="zg-filter-item__lbl">关键词</span>
            <el-input v-model="filters.keyword" placeholder="合同编号/名称/供应商" clearable
              class="zg-filter-input">
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
          </div>
          <div class="zg-filter-item zg-filter-item--actions">
            <el-button type="primary" @click="onFilterApply"><el-icon><Filter /></el-icon>筛选</el-button>
            <el-button @click="onFilterReset"><el-icon><Refresh /></el-icon>重置</el-button>
          </div>
        </div>
      </div>

      <!-- 操作栏 -->
      <div class="zg-ct-ledger__actionbar">
        <div class="zg-actionbar__left">
          <span v-if="selectedRows.length" class="zg-selection-hint">已选 <strong>{{ selectedRows.length }}</strong> 份</span>
          <el-button type="primary" plain size="small" :disabled="!selectedRows.length" @click="onBatchExport">
            <el-icon><Download /></el-icon>批量导出
          </el-button>
          <el-button type="warning" plain size="small" :disabled="!selectedRows.length" @click="onBatchRenew">
            <el-icon><Refresh /></el-icon>批量发起续约
          </el-button>
        </div>
      </div>

      <!-- 表格 -->
      <div class="zg-ct-ledger__tablewrap">
        <el-table ref="tableRef" :data="pagedRows" stripe height="560"
          @selection-change="handleSelectionChange" @row-click="onRowClick">
          <el-table-column type="selection" width="48" align="center" />
          <el-table-column prop="code" label="合同编号" width="160" fixed="left">
            <template #default="{ row }">
              <span class="zg-ct-code">{{ row.code }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="合同名称" min-width="200" show-overflow-tooltip />
          <el-table-column prop="typeLabel" label="合同类型" width="100" align="center">
            <template #default="{ row }">
              <el-tag size="small" :type="typeTagType(row.typeKey)" effect="plain">{{ row.typeLabel }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="partyBName" label="乙方供应商" width="200" show-overflow-tooltip />
          <el-table-column prop="partyA" label="甲方" width="160" show-overflow-tooltip />
          <el-table-column label="合同金额" width="130" align="right">
            <template #default="{ row }">
              <span class="zg-ct-amount">¥{{ row.amount.toLocaleString() }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="signDate" label="签订日期" width="110" />
          <el-table-column label="有效期" width="220">
            <template #default="{ row }">
              <span>{{ row.startDate }}</span>
              <span class="zg-ct-range-sep">~</span>
              <span :class="row.daysLeft !== null && row.daysLeft < 30 ? 'zg-ct-expiring' : ''">
                {{ row.endDate }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="statusLabel" label="状态" width="110" align="center">
            <template #default="{ row }">
              <span class="zg-status-pill" :class="'zg-status-pill--' + row.statusKey">
                <i class="dot"></i>{{ row.statusLabel }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="剩余天数" width="110" align="center">
            <template #default="{ row }">
              <span v-if="row.daysLeft === null" class="zg-ct-days zg-ct-days--na">—</span>
              <span v-else-if="row.daysLeft < 0" class="zg-ct-days zg-ct-days--expired">已到期{{ -row.daysLeft }}天</span>
              <span v-else-if="row.daysLeft <= 30" class="zg-ct-days zg-ct-days--urgent">{{ row.daysLeft }}天</span>
              <span v-else class="zg-ct-days">{{ row.daysLeft }}天</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" align="center" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="onMonitorDetail(row)">查看</el-button>
              <el-button link size="small" @click="onEdit(row)">编辑</el-button>
              <el-button type="warning" link size="small"
                :disabled="row.statusKey !== 'active'"
                @click="onRenew(row)">续约</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="zg-ct-ledger__pager">
        <el-pagination v-model:current-page="pager.page" v-model:page-size="pager.size"
          :total="filteredRows.length" :page-sizes="[10, 20, 50]"
          layout="prev, pager, next, jumper, ->, sizes, total" background />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * 智光云枢 · 合同合同管理 · 合同台账
 * 供应商编号 SUP-001 ~ SUP-006 与 supplier/SupplierLedger.vue 保持一致
 */
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {Document, Plus, Download, Search, Filter, Refresh, Files, Money, Timer, Warning, School} from '@element-plus/icons-vue'

const router = useRouter()

// ============================================================
// 类型定义
// ============================================================
interface ContractRow {
  id: number
  code: string
  name: string
  typeKey: 'purchase' | 'ops' | 'engineering' | 'outsourcing' | 'vehicle'
  typeLabel: string
  partyACode: string
  partyA: string
  partyBCode: string
  partyBName: string
  amount: number
  signDate: string
  startDate: string
  endDate: string
  statusKey: 'draft' | 'active' | 'expired' | 'terminated'
  statusLabel: string
  manager: string
  daysLeft: number | null
}

// ============================================================
// 供应商名称映射（与 supplier/SupplierLedger.vue 保持一致）
// ============================================================
const SUPPLIER_MAP: Record<string, string> = {
  'SUP-001': '深圳洲明科技股份有限公司',
  'SUP-002': '上海三思电子工程有限公司',
  'SUP-003': '长沙华电电气设备有限公司',
  'SUP-004': '湖南光明照明工程有限公司',
  'SUP-005': '长沙光服运维服务有限公司',
  'SUP-006': '中联重科车辆销售分公司'
}

// ============================================================
// 合同类型配置
// ============================================================
const contractTypes = [
  { key: 'purchase',    label: '采购合同' },
  { key: 'ops',         label: '运维合同' },
  { key: 'engineering', label: '工程合同' },
  { key: 'outsourcing', label: '外包合同' },
  { key: 'vehicle',     label: '车辆合同' }
]

const statusList = computed(() => ([
  { key: 'draft',      label: '草稿' },
  { key: 'active',     label: '生效中' },
  { key: 'expired',    label: '已到期' },
  { key: 'terminated', label: '已终止' }
]))

// ============================================================
// Mock 数据（8 条，覆盖各类型）
// ============================================================
function calcDaysLeft(endDate: string): number | null {
  const now = new Date('2026-11-16')
  const end = new Date(endDate)
  const ms = end.getTime() - now.getTime()
  return Math.ceil(ms / (1000 * 60 * 60 * 24))
}

const ALL_CONTRACTS = ref<ContractRow[]>([
  {
    id: 1,
    code: 'CT-PUR-2026-001',
    name: '岳麓区 LED 灯具采购框架合同',
    typeKey: 'purchase', typeLabel: '采购合同',
    partyACode: 'GOV-CS-001', partyA: '长沙市城市照明管理中心',
    partyBCode: 'SUP-001', partyBName: SUPPLIER_MAP['SUP-001'],
    amount: 5800000,
    signDate: '2026-03-15',
    startDate: '2026-04-01', endDate: '2027-03-31',
    statusKey: 'active', statusLabel: '生效中',
    manager: '王建国',
    daysLeft: calcDaysLeft('2027-03-31')
  },
  {
    id: 2,
    code: 'CT-OPS-2025-003',
    name: '先导路片区照明设施年度运维服务合同',
    typeKey: 'ops', typeLabel: '运维合同',
    partyACode: 'GOV-CS-001', partyA: '长沙市城市照明管理中心',
    partyBCode: 'SUP-005', partyBName: SUPPLIER_MAP['SUP-005'],
    amount: 3600000,
    signDate: '2025-12-20',
    startDate: '2026-01-01', endDate: '2026-12-31',
    statusKey: 'active', statusLabel: '生效中',
    manager: '李明辉',
    daysLeft: calcDaysLeft('2026-12-31')
  },
  {
    id: 3,
    code: 'CT-ENG-2026-002',
    name: '梅溪湖二期道路照明工程施工合同',
    typeKey: 'engineering', typeLabel: '工程合同',
    partyACode: 'GOV-CS-002', partyA: '长沙市市政工程建设中心',
    partyBCode: 'SUP-004', partyBName: SUPPLIER_MAP['SUP-004'],
    amount: 12500000,
    signDate: '2026-06-10',
    startDate: '2026-06-15', endDate: '2027-02-28',
    statusKey: 'active', statusLabel: '生效中',
    manager: '张海涛',
    daysLeft: calcDaysLeft('2027-02-28')
  },
  {
    id: 4,
    code: 'CT-OUT-2026-001',
    name: '岳麓区路灯故障抢修外包服务合同',
    typeKey: 'outsourcing', typeLabel: '外包合同',
    partyACode: 'GOV-CS-001', partyA: '长沙市城市照明管理中心',
    partyBCode: 'SUP-005', partyBName: SUPPLIER_MAP['SUP-005'],
    amount: 1800000,
    signDate: '2026-08-01',
    startDate: '2026-08-15', endDate: '2027-08-14',
    statusKey: 'active', statusLabel: '生效中',
    manager: '陈晓东',
    daysLeft: calcDaysLeft('2027-08-14')
  },
  {
    id: 5,
    code: 'CT-PUR-2025-004',
    name: 'LED 控制模块集中采购合同',
    typeKey: 'purchase', typeLabel: '采购合同',
    partyACode: 'GOV-CS-001', partyA: '长沙市城市照明管理中心',
    partyBCode: 'SUP-002', partyBName: SUPPLIER_MAP['SUP-002'],
    amount: 2200000,
    signDate: '2025-11-15',
    startDate: '2025-12-01', endDate: '2026-11-30',
    statusKey: 'active', statusLabel: '生效中',
    manager: '刘芳',
    daysLeft: calcDaysLeft('2026-11-30')
  },
  {
    id: 6,
    code: 'CT-VEH-2026-001',
    name: '高空作业车采购合同',
    typeKey: 'vehicle', typeLabel: '车辆合同',
    partyACode: 'GOV-CS-003', partyA: '长沙市城市管理局',
    partyBCode: 'SUP-006', partyBName: SUPPLIER_MAP['SUP-006'],
    amount: 2800000,
    signDate: '2026-07-20',
    startDate: '2026-07-25', endDate: '2028-07-24',
    statusKey: 'active', statusLabel: '生效中',
    manager: '周建国',
    daysLeft: calcDaysLeft('2028-07-24')
  },
  {
    id: 7,
    code: 'CT-PUR-2024-002',
    name: '配电箱及电气材料采购框架合同',
    typeKey: 'purchase', typeLabel: '采购合同',
    partyACode: 'GOV-CS-001', partyA: '长沙市城市照明管理中心',
    partyBCode: 'SUP-003', partyBName: SUPPLIER_MAP['SUP-003'],
    amount: 960000,
    signDate: '2024-03-10',
    startDate: '2024-04-01', endDate: '2026-03-31',
    statusKey: 'expired', statusLabel: '已到期',
    manager: '王建国',
    daysLeft: calcDaysLeft('2026-03-31')
  },
  {
    id: 8,
    code: 'CT-OPS-2026-002',
    name: '人工智能视频监控巡检运维合同（草稿）',
    typeKey: 'ops', typeLabel: '运维合同',
    partyACode: 'GOV-CS-001', partyA: '长沙市城市照明管理中心',
    partyBCode: 'SUP-002', partyBName: SUPPLIER_MAP['SUP-002'],
    amount: 4200000,
    signDate: '2026-10-28',
    startDate: '2026-12-01', endDate: '2027-11-30',
    statusKey: 'draft', statusLabel: '草稿',
    manager: '李明辉',
    daysLeft: null
  }
])

// ============================================================
// Tab 分类配置
// ============================================================
const allCategoryTabs = computed(() => [
  { key: 'all',         label: '全部',   count: ALL_CONTRACTS.value.length, icon: School },
  { key: 'purchase',    label: '采购',   count: ALL_CONTRACTS.value.filter(c => c.typeKey === 'purchase').length,    icon: Money },
  { key: 'ops',         label: '运维',   count: ALL_CONTRACTS.value.filter(c => c.typeKey === 'ops').length,         icon: Timer },
  { key: 'engineering', label: '工程',   count: ALL_CONTRACTS.value.filter(c => c.typeKey === 'engineering').length, icon: Warning },
  { key: 'outsourcing', label: '外包',   count: ALL_CONTRACTS.value.filter(c => c.typeKey === 'outsourcing').length, icon: Refresh }
])

// ============================================================
// 状态 & 筛选
// ============================================================
const activeCategory = ref('all')
const selectedRows = ref<ContractRow[]>([])
const tableRef = ref()
const pager = reactive({ page: 1, size: 10 })

const filters = reactive({
  type: '' as string,
  status: '' as string,
  keyword: '',
  applied: {
    type: '' as string,
    status: '' as string,
    keyword: ''
  }
})

// ============================================================
// 筛选逻辑
// ============================================================
const filteredRows = computed(() => {
  const f = filters.applied
  let list = ALL_CONTRACTS.value.slice()
  if (activeCategory.value !== 'all') {
    list = list.filter(r => r.typeKey === activeCategory.value)
  }
  if (f.type)   list = list.filter(r => r.typeKey === f.type)
  if (f.status) list = list.filter(r => r.statusKey === f.status)
  if (f.keyword.trim()) {
    const kw = f.keyword.trim().toLowerCase()
    list = list.filter(r =>
      r.code.toLowerCase().includes(kw) ||
      r.name.toLowerCase().includes(kw) ||
      r.partyBName.toLowerCase().includes(kw)
    )
  }
  return list
})

const pagedRows = computed(() => {
  const start = (pager.page - 1) * pager.size
  return filteredRows.value.slice(start, start + pager.size)
})

// ============================================================
// KPI 聚合
// ============================================================
const kpiAgg = computed(() => {
  const rows = filteredRows.value
  const total = rows.length
  const active = rows.filter(r => r.statusKey === 'active').length
  const expiringSoon = rows.filter(r => r.statusKey === 'active' && r.daysLeft !== null && r.daysLeft <= 30).length
  const year = new Date().getFullYear()
  const yearAmount = rows
    .filter(r => r.signDate.startsWith(String(year)) && r.statusKey !== 'draft')
    .reduce((sum, r) => sum + r.amount, 0)
  return { total, active, expiringSoon, yearAmount }
})

const kpiCells = computed(() => [
  { key: 'total',          label: '合同总数',          value: kpiAgg.value.total,     icon: Document,      theme: '' },
  { key: 'active',         label: '生效中',            value: kpiAgg.value.active,    icon: Timer,         theme: 'success' },
  { key: 'expiringSoon',   label: '即将到期 (30天内)', value: kpiAgg.value.expiringSoon, icon: Warning,    theme: 'warn' },
  { key: 'yearAmount',     label: '本年签约金额(万)',  value: (kpiAgg.value.yearAmount / 10000).toFixed(0), icon: Money, theme: 'info' }
])

// ============================================================
// 工具函数
// ============================================================
function typeTagType(typeKey: string): '' | 'info' | 'warning' | 'danger' | 'success' {
  const map: Record<string, '' | 'info' | 'warning' | 'danger' | 'success'> = {
    purchase: '',
    ops: 'success',
    engineering: 'warning',
    outsourcing: 'info',
    vehicle: 'danger'
  }
  return map[typeKey] || ''
}

// ============================================================
// 筛选控制
// ============================================================
function onFilterApply() {
  filters.applied = {
    type: filters.type,
    status: filters.status,
    keyword: filters.keyword
  }
  pager.page = 1
  ElMessage.success('筛选已应用')
}
function onFilterReset() {
  filters.type = ''
  filters.status = ''
  filters.keyword = ''
  filters.applied = { type: '', status: '', keyword: '' }
  pager.page = 1
  ElMessage.info('已重置筛选条件')
}

// ============================================================
// 选中
// ============================================================
function handleSelectionChange(rows: ContractRow[]) {
  selectedRows.value = rows
}

// ============================================================
// 动作
// ============================================================
function onRowClick(row: ContractRow) { onMonitorDetail(row) }

function onMonitorDetail(row: ContractRow) {
  router.push({ path: `/contract/detail/${row.id}`, query: { code: row.code } })
}

function onEdit(row: ContractRow) {
  ElMessageBox.prompt('请输入新的合同名称', `编辑合同 · ${row.code}`, {
    inputValue: row.name,
    confirmButtonText: '保存',
    cancelButtonText: '取消'
  }).then(({ value }) => {
    row.name = value
    ElMessage.success('合同信息已更新')
  }).catch(() => {})
}

function onRenew(row: ContractRow) {
  ElMessageBox.confirm(
    `确认为《${row.name}》发起续约流程？<br>当前有效期至：<strong>${row.endDate}</strong>`,
    '发起续约',
    { confirmButtonText: '确认发起', cancelButtonText: '取消', type: 'warning', dangerouslyUseHTMLString: true }
  ).then(() => {
    ElMessage.success('续约申请已提交，可在续期提醒页查看进度')
  }).catch(() => {})
}

function onBatchExport() { onCsvExport() }

function onBatchRenew() {
  if (!selectedRows.value.length) return
  ElMessageBox.confirm(
    `确认对选中的 <strong>${selectedRows.value.length}</strong> 份合同批量发起续约？`,
    '批量续约',
    { confirmButtonText: '确认', cancelButtonText: '取消', type: 'warning', dangerouslyUseHTMLString: true }
  ).then(() => {
    ElMessage.success(`已为 ${selectedRows.value.length} 份合同生成续约草稿`)
  }).catch(() => {})
}

// ============================================================
// CSV 导出
// ============================================================
function escapeCsv(v: any): string {
  const s = v == null ? '' : String(v)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}
function triggerDownload(csv: string, filename: string) {
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
function onCsvExport() {
  const header = [
    '合同编号', '合同名称', '合同类型', '乙方供应商', '甲方',
    '合同金额(元)', '签订日期', '有效期起', '有效期止', '状态', '经办人'
  ]
  const rows = filteredRows.value.map(r => [
    r.code, r.name, r.typeLabel, r.partyBName, r.partyA,
    r.amount, r.signDate, r.startDate, r.endDate, r.statusLabel, r.manager
  ])
  const csv = [header, ...rows].map(row => row.map(escapeCsv).join(',')).join('\n')
  triggerDownload(csv, `合同台账_${new Date().toISOString().slice(0, 10)}.csv`)
  ElMessage.success('CSV 已导出')
}
</script>

<style scoped lang="scss">
.zg-ct-ledger {
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
  --zg-line-strong: rgba(226,232,240,0.6);
  --zg-ink-primary: #18181b;
  --zg-ink-secondary: #52525b;
  --zg-ink-tertiary: #71717a;
  --zg-surface-card: #ffffff;
  --zg-surface-muted: #f8fafc;
  --zg-gradient-surface: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
  --zg-gradient-primary: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
  --zg-radius-sm: 6px;
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
  &__cta { display: flex; gap: 10px; }

  &__kpi {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 14px; margin-bottom: 18px;
  }
  &__main {
    background: var(--zg-surface-card);
    border-radius: var(--zg-radius-lg);
    border: 1px solid var(--zg-line-soft);
    padding: 18px;
  }
  &__tabs { margin-bottom: 16px; }
  &__filterbar {
    padding: 14px 16px; background: var(--zg-surface-muted);
    border-radius: var(--zg-radius-md); margin-bottom: 14px;
  }
  &__actionbar {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 14px; gap: 12px; flex-wrap: wrap;
  }
  &__tablewrap { border: 1px solid var(--zg-line-soft); border-radius: var(--zg-radius-md); overflow: hidden; }
  &__pager {
    display: flex; justify-content: flex-end;
    padding-top: 14px; border-top: 1px solid var(--zg-line-soft); margin-top: 16px;
  }
}

.zg-kpi-cell {
  background: #fff; border: 1px solid var(--zg-line-soft);
  border-radius: var(--zg-radius-lg); padding: 16px 18px;
  display: flex; align-items: center; gap: 14px;
  box-shadow: 0 1px 3px rgba(15,23,42,0.04);
  transition: all 250ms cubic-bezier(0.4,0,0.2,1);
  position: relative; overflow: hidden;
  &:hover { transform: translateY(-2px); box-shadow: 0 8px 24px -8px rgba(15,23,42,0.12); }
  &::before { content: ''; position: absolute; left: 0; top: 0; width: 3px; height: 100%; background: var(--zg-brand-primary); }
  &.success::before { background: var(--zg-success); }
  &.info::before    { background: var(--zg-info); }
  &.warn::before    { background: var(--zg-warning); }
  &__icon {
    width: 42px; height: 42px; border-radius: var(--zg-radius-md);
    background: var(--zg-brand-primary); color: #fff;
    display: flex; align-items: center; justify-content: center;
  }
  .success &__icon { background: var(--zg-success); }
  .info    &__icon { background: var(--zg-info); }
  .warn    &__icon { background: var(--zg-warning); }
  &__body { display: flex; flex-direction: column; gap: 4px; }
  &__num { font-size: 22px; font-weight: 700; line-height: 1.1; font-variant-numeric: tabular-nums; }
  &__lbl { font-size: 12px; color: var(--zg-ink-tertiary); }
}

.zg-tab-label {
  display: inline-flex; align-items: center; gap: 6px;
  .zg-tab-count {
    font-style: normal; font-size: 11px; padding: 1px 7px;
    background: #fffbeb; color: var(--zg-brand-primary);
    border-radius: var(--zg-radius-pill); font-weight: 500;
  }
}

.zg-filter-row { display: flex; flex-wrap: wrap; align-items: center; gap: 14px 20px; }
.zg-filter-item {
  display: flex; align-items: center; gap: 8px;
  &__lbl { font-size: 12px; color: var(--zg-ink-tertiary); flex-shrink: 0; }
  &--actions { margin-left: auto; }
}
.zg-filter-select { width: 160px; }
.zg-filter-input { width: 240px; }

.zg-actionbar__left, .zg-actionbar__right { display: flex; align-items: center; gap: 10px; }
.zg-selection-hint {
  font-size: 13px; color: var(--zg-ink-secondary);
  strong { color: var(--zg-brand-primary); margin: 0 3px; }
}

.zg-ct-code { font-family: 'Geist Mono', ui-monospace, monospace; font-size: 12px; font-weight: 600; }

.zg-ct-amount { font-weight: 600; font-variant-numeric: tabular-nums; color: var(--zg-ink-primary); }

.zg-ct-range-sep { margin: 0 6px; color: var(--zg-ink-tertiary); }

.zg-ct-expiring { color: var(--zg-warning); font-weight: 600; }

.zg-status-pill {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 12px; padding: 2px 10px; border-radius: var(--zg-radius-pill);
  font-weight: 500;
  .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
  &--draft      { color: var(--zg-info); background: var(--zg-info-soft); }
  &--active     { color: var(--zg-success); background: var(--zg-success-soft); }
  &--expired    { color: var(--zg-danger); background: var(--zg-danger-soft); }
  &--terminated { color: var(--zg-ink-tertiary); background: #f1f5f9; }
}

.zg-ct-days {
  font-size: 12px; font-weight: 500; font-variant-numeric: tabular-nums;
  &--na       { color: var(--zg-ink-tertiary); opacity: 0.6; }
  &--urgent   { color: var(--zg-danger); animation: ctDaysPulse 1.5s ease-in-out infinite; }
  &--expired  { color: var(--zg-danger); }
}
@keyframes ctDaysPulse {
  0%, 100% { opacity: 1; font-weight: 700; }
  50% { opacity: 0.5; font-weight: 500; }
}
</style>
