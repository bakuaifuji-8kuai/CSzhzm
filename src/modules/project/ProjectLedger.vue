<!--
  智光云枢 · 工程项目管理 · 工程项目台账
  KPI 四卡 + Tab 状态分类 + 筛选条 + 表格
  供应商编号 SUP-001~SUP-006 与 supplier/SupplierLedger.vue 保持一致
  合同编号 HT-2026-xxx 与 contract/ContractLedger.vue 格式匹配
-->
<template>
  <section class="zg-pj-ledger">
    <header class="zg-pj-ledger__head">
      <div class="zg-pj-ledger__headline">
        <div class="zg-pj-ledger__sigil"><el-icon :size="22"><Suitcase /></el-icon></div>
        <div class="zg-pj-ledger__copy">
          <h1 class="zg-pj-ledger__title">工程项目台账</h1>
          <p class="zg-pj-ledger__sub">
            城市照明工程全景账本 · 共 {{ kpiAgg.total }} 项 ·
            进行中 {{ kpiAgg.ongoing }} 项 ·
            已完工 {{ kpiAgg.done }} 项 ·
            本年投资额 ¥{{ (kpiAgg.yearInvest / 10000).toFixed(0) }}万
          </p>
        </div>
      </div>
      <div class="zg-pj-ledger__cta">
        <el-button type="primary"><el-icon><Plus /></el-icon>新建项目立项</el-button>
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
    <div class="zg-pj-ledger__kpi">
      <div v-for="cell in kpiCells" :key="cell.key" class="zg-kpi-cell" :class="cell.theme">
        <div class="zg-kpi-cell__icon"><el-icon :size="20"><component :is="cell.icon" /></el-icon></div>
        <div class="zg-kpi-cell__body">
          <span class="zg-kpi-cell__num">{{ cell.value }}</span>
          <span class="zg-kpi-cell__lbl">{{ cell.label }}</span>
        </div>
      </div>
    </div>

    <!-- 主体卡 -->
    <div class="zg-pj-ledger__main">
      <!-- Tab 状态 -->
      <el-tabs v-model="activeCategory" class="zg-pj-ledger__tabs">
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
      <div class="zg-pj-ledger__filterbar">
        <div class="zg-filter-row">
          <div class="zg-filter-item">
            <span class="zg-filter-item__lbl">项目类型</span>
            <el-select v-model="filters.type" placeholder="全部类型" class="zg-filter-select" clearable>
              <el-option v-for="t in projectTypes" :key="t.key" :label="t.label" :value="t.key" />
            </el-select>
          </div>
          <div class="zg-filter-item">
            <span class="zg-filter-item__lbl">业主单位</span>
            <el-select v-model="filters.owner" placeholder="全部业主" class="zg-filter-select" clearable>
              <el-option v-for="o in ownerOptions" :key="o" :label="o" :value="o" />
            </el-select>
          </div>
          <div class="zg-filter-item">
            <span class="zg-filter-item__lbl">乙方承包商</span>
            <el-select v-model="filters.contractor" placeholder="全部乙方" class="zg-filter-select" clearable>
              <el-option v-for="c in contractorOptions" :key="c.code" :label="c.name" :value="c.code" />
            </el-select>
          </div>
          <div class="zg-filter-item">
            <span class="zg-filter-item__lbl">年份</span>
            <el-select v-model="filters.year" placeholder="全部年份" class="zg-filter-select" clearable>
              <el-option label="2026" value="2026" />
              <el-option label="2025" value="2025" />
              <el-option label="2024" value="2024" />
            </el-select>
          </div>
          <div class="zg-filter-item zg-filter-item--actions">
            <el-button type="primary" @click="onFilterApply"><el-icon><Filter /></el-icon>筛选</el-button>
            <el-button @click="onFilterReset"><el-icon><Refresh /></el-icon>重置</el-button>
          </div>
        </div>
      </div>

      <!-- 表格 -->
      <div class="zg-pj-ledger__tablewrap">
        <el-table ref="tableRef" :data="pagedRows" stripe height="560">
          <el-table-column prop="code" label="项目编号" width="150" fixed="left">
            <template #default="{ row }">
              <span class="zg-pj-code">{{ row.code }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="项目名称" min-width="220" show-overflow-tooltip />
          <el-table-column prop="typeLabel" label="类型" width="90" align="center">
            <template #default="{ row }">
              <el-tag size="small" :type="typeTagType(row.typeKey)" effect="plain">{{ row.typeLabel }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="owner" label="业主单位" width="180" show-overflow-tooltip />
          <el-table-column prop="contractorName" label="乙方承包商" width="200" show-overflow-tooltip />
          <el-table-column label="预算金额(万)" width="120" align="right">
            <template #default="{ row }">
              <span class="zg-pj-amount">¥{{ (row.budget / 10000).toFixed(0) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="contractCode" label="合同号" width="150">
            <template #default="{ row }">
              <span class="zg-link">{{ row.contractCode }}</span>
            </template>
          </el-table-column>
          <el-table-column label="计划周期" width="220">
            <template #default="{ row }">
              <span>{{ row.planStart }}</span>
              <span class="zg-pj-range-sep">~</span>
              <span>{{ row.planEnd }}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100" align="center">
            <template #default="{ row }">
              <span class="zg-status-pill" :class="'zg-status-pill--' + row.statusKey">
                <i class="dot"></i>{{ row.statusLabel }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="startDate" label="开工日期" width="110" />
          <el-table-column label="进度" width="180">
            <template #default="{ row }">
              <div class="zg-pj-progress">
                <el-progress :percentage="row.progress" :stroke-width="8" :color="progressColor(row.progress)" />
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" align="center" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="onMonitorProgress(row)">进度</el-button>
              <el-button link size="small" @click="onMonitorDetail(row)">详情</el-button>
              <el-button type="warning" link size="small"
                :disabled="row.statusKey === 'done'"
                @click="onAccept(row)">验收</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="zg-pj-ledger__pager">
        <el-pagination v-model:current-page="pager.page" v-model:page-size="pager.size"
          :total="filteredRows.length" :page-sizes="[10, 20, 50]"
          layout="prev, pager, next, jumper, ->, sizes, total" background />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * 智光云枢 · 工程项目管理 · 工程项目台账
 */
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Suitcase, Plus, Download, Search, Filter, Refresh, Files, Document,
  Money, Timer, CircleCheck, School
} from '@element-plus/icons-vue'

const router = useRouter()

// ============================================================
// 供应商映射（与 supplier/SupplierLedger.vue 保持一致）
// ============================================================
const SUPPLIER_MAP: Array<{ code: string, name: string }> = [
  { code: 'SUP-001', name: '深圳洲明科技股份有限公司' },
  { code: 'SUP-002', name: '上海三思电子工程有限公司' },
  { code: 'SUP-003', name: '长沙华电电气设备有限公司' },
  { code: 'SUP-004', name: '湖南光明照明工程有限公司' },
  { code: 'SUP-005', name: '长沙光服运维服务有限公司' },
  { code: 'SUP-006', name: '中联重科车辆销售分公司' },
]
const SUPPLIER_NAME_MAP: Record<string, string> = Object.fromEntries(SUPPLIER_MAP.map(s => [s.code, s.name]))

// ============================================================
// 类型
// ============================================================
interface ProjectRow {
  id: number
  code: string
  name: string
  typeKey: 'new' | 'renovation' | 'expand' | 'special'
  typeLabel: string
  owner: string
  contractorCode: string
  contractorName: string
  budget: number
  contractCode: string
  planStart: string
  planEnd: string
  startDate: string
  endDate: string
  statusKey: 'init' | 'bidding' | 'signing' | 'construction' | 'accepting' | 'done' | 'paused'
  statusLabel: string
  progress: number
  year: string
}

// ============================================================
// 配置
// ============================================================
const projectTypes = [
  { key: 'new',        label: '新建' },
  { key: 'renovation', label: '改造' },
  { key: 'expand',     label: '扩建' },
  { key: 'special',    label: '专项' }
]

const statusList = computed(() => ([
  { key: 'init',        label: '立项中' },
  { key: 'bidding',     label: '招标中' },
  { key: 'construction',label: '施工中' },
  { key: 'accepting',   label: '验收中' },
  { key: 'done',        label: '已完工' },
  { key: 'paused',      label: '暂停' }
]))

const ownerOptions = computed(() => {
  const set = new Set(ALL_PROJECTS.value.map(p => p.owner))
  return Array.from(set)
})
const contractorOptions = computed(() => SUPPLIER_MAP)

// ============================================================
// Mock 数据 (10 条，真实长沙项目名)
// ============================================================
const ALL_PROJECTS = ref<ProjectRow[]>([
  {
    id: 1, code: 'PJ-CS-2026-001', name: '橘子洲景区 LED 照明改造工程',
    typeKey: 'renovation', typeLabel: '改造',
    owner: '长沙市文化旅游广电局', contractorCode: 'SUP-004', contractorName: SUPPLIER_NAME_MAP['SUP-004'],
    budget: 8600000, contractCode: 'HT-2026-003',
    planStart: '2026-05-10', planEnd: '2026-09-30',
    startDate: '2026-05-12', endDate: '',
    statusKey: 'construction', statusLabel: '施工中', progress: 62, year: '2026'
  },
  {
    id: 2, code: 'PJ-CS-2026-002', name: '五一大道城市亮化提升工程',
    typeKey: 'new', typeLabel: '新建',
    owner: '长沙市城市照明管理中心', contractorCode: 'SUP-001', contractorName: SUPPLIER_NAME_MAP['SUP-001'],
    budget: 15800000, contractCode: 'HT-2026-011',
    planStart: '2026-07-01', planEnd: '2027-01-31',
    startDate: '2026-07-05', endDate: '',
    statusKey: 'construction', statusLabel: '施工中', progress: 38, year: '2026'
  },
  {
    id: 3, code: 'PJ-CS-2026-003', name: '先导路智慧路灯新建设备及安装项目',
    typeKey: 'new', typeLabel: '新建',
    owner: '长沙先导投资控股集团', contractorCode: 'SUP-004', contractorName: SUPPLIER_NAME_MAP['SUP-004'],
    budget: 12500000, contractCode: 'HT-2026-015',
    planStart: '2026-03-15', planEnd: '2026-10-15',
    startDate: '2026-03-20', endDate: '',
    statusKey: 'accepting', statusLabel: '验收中', progress: 92, year: '2026'
  },
  {
    id: 4, code: 'PJ-CS-2026-004', name: '梅溪湖环湖路照明扩建工程',
    typeKey: 'expand', typeLabel: '扩建',
    owner: '岳麓高新技术产业开发区管委会', contractorCode: 'SUP-002', contractorName: SUPPLIER_NAME_MAP['SUP-002'],
    budget: 6200000, contractCode: 'HT-2026-021',
    planStart: '2026-09-01', planEnd: '2027-02-28',
    startDate: '', endDate: '',
    statusKey: 'bidding', statusLabel: '招标中', progress: 15, year: '2026'
  },
  {
    id: 5, code: 'PJ-CS-2026-005', name: '岳麓大道下穿隧道照明专项整治',
    typeKey: 'special', typeLabel: '专项',
    owner: '长沙市市政设施建设管理局', contractorCode: 'SUP-003', contractorName: SUPPLIER_NAME_MAP['SUP-003'],
    budget: 3800000, contractCode: 'HT-2026-008',
    planStart: '2026-04-01', planEnd: '2026-07-31',
    startDate: '2026-04-05', endDate: '2026-07-28',
    statusKey: 'done', statusLabel: '已完工', progress: 100, year: '2026'
  },
  {
    id: 6, code: 'PJ-CS-2025-012', name: '湘江新区夜间经济照明示范项目',
    typeKey: 'renovation', typeLabel: '改造',
    owner: '湘江新区管委会', contractorCode: 'SUP-004', contractorName: SUPPLIER_NAME_MAP['SUP-004'],
    budget: 22000000, contractCode: 'HT-2025-036',
    planStart: '2025-10-01', planEnd: '2026-06-30',
    startDate: '2025-10-08', endDate: '2026-06-25',
    statusKey: 'done', statusLabel: '已完工', progress: 100, year: '2025'
  },
  {
    id: 7, code: 'PJ-CS-2026-006', name: '三一大道快速路照明改造',
    typeKey: 'renovation', typeLabel: '改造',
    owner: '长沙经济技术开发区管委会', contractorCode: 'SUP-001', contractorName: SUPPLIER_NAME_MAP['SUP-001'],
    budget: 9200000, contractCode: 'HT-2026-025',
    planStart: '2026-11-15', planEnd: '2027-04-30',
    startDate: '', endDate: '',
    statusKey: 'init', statusLabel: '立项中', progress: 5, year: '2026'
  },
  {
    id: 8, code: 'PJ-CS-2026-007', name: '天心阁古城墙夜景亮化工程',
    typeKey: 'special', typeLabel: '专项',
    owner: '长沙市文化旅游广电局', contractorCode: 'SUP-002', contractorName: SUPPLIER_NAME_MAP['SUP-002'],
    budget: 5600000, contractCode: 'HT-2026-030',
    planStart: '2027-01-10', planEnd: '2027-05-31',
    startDate: '', endDate: '',
    statusKey: 'init', statusLabel: '立项中', progress: 2, year: '2026'
  },
  {
    id: 9, code: 'PJ-CS-2026-008', name: '金星大道北段照明大修工程',
    typeKey: 'renovation', typeLabel: '改造',
    owner: '长沙市城市照明管理中心', contractorCode: 'SUP-003', contractorName: SUPPLIER_NAME_MAP['SUP-003'],
    budget: 4800000, contractCode: 'HT-2026-019',
    planStart: '2026-06-20', planEnd: '2026-09-20',
    startDate: '2026-06-25', endDate: '',
    statusKey: 'paused', statusLabel: '暂停', progress: 55, year: '2026'
  },
  {
    id: 10, code: 'PJ-CS-2026-009', name: '地铁 6 号线车站出入口照明配套工程',
    typeKey: 'new', typeLabel: '新建',
    owner: '长沙轨道交通集团有限公司', contractorCode: 'SUP-004', contractorName: SUPPLIER_NAME_MAP['SUP-004'],
    budget: 7200000, contractCode: 'HT-2026-028',
    planStart: '2026-08-15', planEnd: '2027-03-31',
    startDate: '2026-08-20', endDate: '',
    statusKey: 'construction', statusLabel: '施工中', progress: 22, year: '2026'
  }
])

// ============================================================
// Tab 配置
// ============================================================
const allCategoryTabs = computed(() => [
  { key: 'all',          label: '全部',   count: ALL_PROJECTS.value.length,  icon: School },
  { key: 'init',         label: '立项中', count: ALL_PROJECTS.value.filter(p => p.statusKey === 'init').count ?? 0, icon: Document },
  { key: 'bidding',      label: '招标中', count: ALL_PROJECTS.value.filter(p => p.statusKey === 'bidding').length,    icon: Timer },
  { key: 'construction', label: '施工中', count: ALL_PROJECTS.value.filter(p => p.statusKey === 'construction').length, icon: Suitcase },
  { key: 'accepting',    label: '验收中', count: ALL_PROJECTS.value.filter(p => p.statusKey === 'accepting').length, icon: CircleCheck },
  { key: 'done',         label: '已完工', count: ALL_PROJECTS.value.filter(p => p.statusKey === 'done').length,       icon: CircleCheck },
  { key: 'paused',       label: '暂停',   count: ALL_PROJECTS.value.filter(p => p.statusKey === 'paused').length,     icon: Search },
])
// 修正 all count
allCategoryTabs.value[0].count = ALL_PROJECTS.value.length

// ============================================================
// 状态 & 筛选
// ============================================================
const activeCategory = ref('all')
const tableRef = ref()
const pager = reactive({ page: 1, size: 10 })

const filters = reactive({
  type: '' as string,
  owner: '',
  contractor: '',
  year: '',
  applied: { type: '' as string, owner: '', contractor: '', year: '' }
})

// ============================================================
// 筛选逻辑
// ============================================================
const filteredRows = computed(() => {
  const f = filters.applied
  let list = ALL_PROJECTS.value.slice()
  if (activeCategory.value !== 'all') {
    list = list.filter(r => r.statusKey === activeCategory.value)
  }
  if (f.type)       list = list.filter(r => r.typeKey === f.type)
  if (f.owner)      list = list.filter(r => r.owner === f.owner)
  if (f.contractor) list = list.filter(r => r.contractorCode === f.contractor)
  if (f.year)       list = list.filter(r => r.year === f.year)
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
  const ongoing = rows.filter(r => ['init', 'bidding', 'construction', 'accepting'].includes(r.statusKey)).length
  const done = rows.filter(r => r.statusKey === 'done').length
  const year = new Date().getFullYear()
  const yearInvest = rows
    .filter(r => r.year === String(year))
    .reduce((sum, r) => sum + r.budget, 0)
  return { total, ongoing, done, yearInvest }
})

const kpiCells = computed(() => [
  { key: 'total',      label: '项目总数',   value: kpiAgg.value.total, icon: School, theme: '' },
  { key: 'ongoing',    label: '进行中',     value: kpiAgg.value.ongoing, icon: Suitcase,     theme: 'info' },
  { key: 'done',       label: '已完工',     value: kpiAgg.value.done, icon: CircleCheck, theme: 'success' },
  { key: 'yearInvest', label: '本年投资额(万)', value: (kpiAgg.value.yearInvest / 10000).toFixed(0), icon: Money, theme: 'warn' }
])

// ============================================================
// 工具函数
// ============================================================
function typeTagType(typeKey: string): '' | 'info' | 'warning' | 'success' | 'danger' {
  const map: Record<string, '' | 'info' | 'warning' | 'success' | 'danger'> = {
    new: '', renovation: 'warning', expand: 'success', special: 'danger'
  }
  return map[typeKey] || ''
}
function progressColor(pct: number) {
  if (pct < 30) return 'linear-gradient(135deg,#0284c7,#38bdf8)'
  if (pct < 70) return 'linear-gradient(135deg,#d97706,#f59e0b)'
  if (pct < 100) return 'linear-gradient(135deg,#059669,#10b981)'
  return 'linear-gradient(135deg,#7c3aed,#a78bfa)'
}

// ============================================================
// 筛选控制
// ============================================================
function onFilterApply() {
  filters.applied = {
    type: filters.type, owner: filters.owner,
    contractor: filters.contractor, year: filters.year
  }
  pager.page = 1
  ElMessage.success('筛选已应用')
}
function onFilterReset() {
  filters.type = ''; filters.owner = ''; filters.contractor = ''; filters.year = ''
  filters.applied = { type: '', owner: '', contractor: '', year: '' }
  pager.page = 1
  ElMessage.info('已重置筛选条件')
}

// ============================================================
// 动作
// ============================================================
function onMonitorProgress(row: ProjectRow) {
  router.push({ path: '/project/progress', query: { id: row.id, code: row.code } })
}
function onMonitorDetail(row: ProjectRow) {
  ElMessageBox.alert(`项目 ${row.code} · ${row.name}<br>预算：¥${(row.budget / 10000).toFixed(0)}万<br>乙方：${row.contractorName}<br>合同号：${row.contractCode}`,
    '项目详情', { confirmButtonText: '关闭', dangerouslyUseHTMLString: true })
}
function onAccept(row: ProjectRow) {
  router.push({ path: '/project/accept', query: { id: row.id, code: row.code } })
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
  a.href = url; a.download = filename
  document.body.appendChild(a); a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
function onCsvExport() {
  const header = [
    '项目编号', '项目名称', '类型', '业主单位', '乙方承包商',
    '预算金额(元)', '合同号', '计划开始', '计划结束', '状态', '开工日期', '进度%'
  ]
  const rows = filteredRows.value.map(r => [
    r.code, r.name, r.typeLabel, r.owner, r.contractorName,
    r.budget, r.contractCode, r.planStart, r.planEnd, r.statusLabel, r.startDate, r.progress
  ])
  const csv = [header, ...rows].map(row => row.map(escapeCsv).join(',')).join('\n')
  triggerDownload(csv, `工程项目台账_${new Date().toISOString().slice(0, 10)}.csv`)
  ElMessage.success('CSV 已导出')
}
</script>

<style scoped lang="scss">
.zg-pj-ledger {
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

.zg-pj-code { font-family: 'Geist Mono', ui-monospace, monospace; font-size: 12px; font-weight: 600; }
.zg-pj-amount { font-weight: 600; font-variant-numeric: tabular-nums; }
.zg-pj-range-sep { margin: 0 6px; color: var(--zg-ink-tertiary); }
.zg-pj-progress :deep(.el-bar) { border-radius: 999px; }

.zg-link { color: #6366f1; cursor: pointer; }
.zg-link:hover { text-decoration: underline; }

.zg-status-pill {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 12px; padding: 2px 10px; border-radius: var(--zg-radius-pill);
  font-weight: 500;
  .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
  &--init         { color: var(--zg-info); background: var(--zg-info-soft); }
  &--bidding      { color: var(--zg-info); background: var(--zg-info-soft); }
  &--construction { color: var(--zg-warning); background: var(--zg-warning-soft); }
  &--accepting    { color: var(--zg-warning); background: var(--zg-warning-soft); }
  &--done         { color: var(--zg-success); background: var(--zg-success-soft); }
  &--paused       { color: var(--zg-danger); background: var(--zg-danger-soft); }
}
</style>
