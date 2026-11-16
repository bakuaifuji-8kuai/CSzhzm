<!--
  智光云枢 · 外包商管理 · 外包商档案
  外包服务商总台账 · 运维/工程/检测三类分 Tab
  关联 supplier/SUP-005 长沙光服运维、contract/HT-2026-xxx、opsTicket 委外工单
-->
<template>
  <section class="zg-om-ledger">
    <header class="zg-om-ledger__head">
      <div class="zg-om-ledger__headline">
        <div class="zg-om-ledger__sigil"><el-icon :size="22"><User /></el-icon></div>
        <div class="zg-om-ledger__copy">
          <h1 class="zg-om-ledger__title">外包商档案</h1>
          <p class="zg-om-ledger__sub">
            共 {{ kpiAgg.total }} 家 · A 级 {{ kpiAgg.aLevel }} 家 ·
            在职外包人员 {{ kpiAgg.staffTotal }} 人 ·
            在保合同 {{ kpiAgg.contractTotal }} 份
          </p>
        </div>
      </div>
      <div class="zg-om-ledger__cta">
        <el-button type="primary"><el-icon><Plus /></el-icon>新增外包商</el-button>
        <el-dropdown trigger="click">
          <el-button plain><el-icon><Download /></el-icon>导出</el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item><el-icon><Document /></el-icon>导出 Excel</el-dropdown-item>
              <el-dropdown-item><el-icon><Print /></el-icon>打印档案</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>

    <!-- KPI 四卡 -->
    <div class="zg-om-ledger__kpi">
      <div v-for="cell in kpiCells" :key="cell.key" class="zg-kpi-cell" :class="cell.theme">
        <div class="zg-kpi-cell__icon"><el-icon :size="20"><component :is="cell.icon" /></el-icon></div>
        <div class="zg-kpi-cell__body">
          <span class="zg-kpi-cell__num">{{ cell.value }}</span>
          <span class="zg-kpi-cell__lbl">{{ cell.label }}</span>
        </div>
      </div>
    </div>

    <!-- 主体卡 -->
    <div class="zg-om-ledger__main">
      <!-- Tab 分类 -->
      <el-tabs v-model="activeCategory" class="zg-om-ledger__tabs">
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
      <div class="zg-om-ledger__filterbar">
        <div class="zg-filter-row">
          <div class="zg-filter-item">
            <span class="zg-filter-item__lbl">资质等级</span>
            <el-select v-model="filters.level" placeholder="全部等级" class="zg-filter-select" clearable>
              <el-option label="A 级" value="A" />
              <el-option label="B 级" value="B" />
              <el-option label="C 级" value="C" />
            </el-select>
          </div>
          <div class="zg-filter-item">
            <span class="zg-filter-item__lbl">状态</span>
            <el-select v-model="filters.status" placeholder="全部状态" class="zg-filter-select" clearable>
              <el-option label="合作中" value="active" />
              <el-option label="已暂停" value="paused" />
              <el-option label="已终止" value="terminated" />
            </el-select>
          </div>
          <div class="zg-filter-item">
            <span class="zg-filter-item__lbl">关键词</span>
            <el-input v-model="filters.keyword" placeholder="编号 / 名称" class="zg-filter-input" clearable>
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
          </div>
          <div class="zg-filter-item zg-filter-item--actions">
            <el-button type="primary" @click="onFilterApply"><el-icon><Filter /></el-icon>筛选</el-button>
            <el-button @click="onFilterReset"><el-icon><Refresh /></el-icon>重置</el-button>
          </div>
        </div>
      </div>

      <!-- 表格 -->
      <div class="zg-om-ledger__tablewrap">
        <el-table :data="pagedRows" stripe height="560" @row-click="onRowClick">
          <el-table-column prop="code" label="外包商编号" width="130" fixed="left">
            <template #default="{ row }">
              <span class="zg-om-code">{{ row.code }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="外包商名称" min-width="200">
            <template #default="{ row }">
              <div class="zg-om-name">
                <span class="zg-om-name__title">{{ row.name }}</span>
                <span class="zg-om-name__sup" v-if="row.supplierCode">
                  关联供应商 {{ row.supplierCode }}
                </span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="categoryLabel" label="业务类型" width="110" align="center">
            <template #default="{ row }">
              <el-tag size="small" type="info" effect="plain">{{ row.categoryLabel }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="资质等级" width="100" align="center">
            <template #default="{ row }">
              <span class="zg-om-level" :class="'zg-om-level--' + row.level">{{ row.level }} 级</span>
            </template>
          </el-table-column>
          <el-table-column prop="certificate" label="资质证书" min-width="180" show-overflow-tooltip>
            <template #default="{ row }">
              <span v-if="row.certificate" class="zg-om-cert">
                <el-icon><Document /></el-icon>
                {{ row.certificate }}
              </span>
              <span v-else class="zg-om-empty">—</span>
            </template>
          </el-table-column>
          <el-table-column prop="staffCount" label="在职人员" width="110" align="right">
            <template #default="{ row }">{{ row.staffCount }} 人</template>
          </el-table-column>
          <el-table-column prop="contractCount" label="在保合同" width="110" align="center">
            <template #default="{ row }">
              <span class="zg-link" @click.stop="onGotoContract(row)">{{ row.contractCount }} 份</span>
            </template>
          </el-table-column>
          <el-table-column label="最近考核" width="110" align="center">
            <template #default="{ row }">
              <span class="zg-om-score" :class="scoreColor(row.lastScore)">{{ row.lastScore }} 分</span>
            </template>
          </el-table-column>
          <el-table-column prop="statusLabel" label="状态" width="110" align="center">
            <template #default="{ row }">
              <span class="zg-status-pill" :class="'zg-status-pill--' + row.statusKey">
                <i class="dot"></i>{{ row.statusLabel }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="关联工单" width="100" align="center" fixed="right">
            <template #default="{ row }">
              <span class="zg-link" @click.stop="onGotoTicket(row)">{{ row.ticketCount }} 单</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="170" align="center" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click.stop="onMonitorDetail(row)">详情</el-button>
              <el-button link size="small" @click.stop="onEdit(row)">编辑</el-button>
              <el-button type="danger" link size="small" :disabled="row.statusKey === 'terminated'" @click.stop="onDisable(row)">停用</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="zg-om-ledger__pager">
        <el-pagination v-model:current-page="pager.page" v-model:page-size="pager.size"
          :total="filteredRows.length" :page-sizes="[10, 20, 50]"
          layout="prev, pager, next, jumper, ->, sizes, total" background />
      </div>
    </div>

    <!-- 详情 Drawer -->
    <el-drawer v-model="detailVisible" title="外包商详情" size="520px" :close-on-click-modal="false">
      <div v-if="currentRow" class="zg-om-detail">
        <div class="zg-om-detail__hero">
          <div class="zg-om-detail__level" :class="'zg-om-level--' + currentRow.level">
            {{ currentRow.level }} 级
          </div>
          <div class="zg-om-detail__hero-copy">
            <h3>{{ currentRow.name }}</h3>
            <p>{{ currentRow.code }} · {{ currentRow.categoryLabel }}</p>
          </div>
        </div>
        <el-descriptions :column="1" border size="small" class="zg-om-detail__desc">
          <el-descriptions-item label="资质证书">{{ currentRow.certificate || '—' }}</el-descriptions-item>
          <el-descriptions-item label="在职人员">{{ currentRow.staffCount }} 人</el-descriptions-item>
          <el-descriptions-item label="在保合同">{{ currentRow.contractCount }} 份</el-descriptions-item>
          <el-descriptions-item label="最近考核">{{ currentRow.lastScore }} 分</el-descriptions-item>
          <el-descriptions-item label="关联供应商">{{ currentRow.supplierCode || '—' }}</el-descriptions-item>
          <el-descriptions-item label="关联工单">{{ currentRow.ticketCount }} 单</el-descriptions-item>
          <el-descriptions-item label="联系人">{{ currentRow.contact }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ currentRow.phone }}</el-descriptions-item>
        </el-descriptions>
        <div class="zg-om-detail__actions">
          <el-button type="primary" @click="onGotoContract(currentRow)">查看合同</el-button>
          <el-button @click="onGotoTicket(currentRow)">查看工单</el-button>
        </div>
      </div>
    </el-drawer>
  </section>
</template>

<script setup lang="ts">
/**
 * 智光云枢 · 外包商管理 · 外包商档案
 */
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Plus, Download, Document, Search, Filter, Refresh, Monitor, SetUp, Histogram, CircleCheck, Warning } from '@element-plus/icons-vue'

const router = useRouter()

// ============================================================
// 类型
// ============================================================
type CategoryKey = 'all' | 'ops' | 'engineering' | 'inspection'
type Level = 'A' | 'B' | 'C'
type StatusKey = 'active' | 'paused' | 'terminated'

interface OutsourceRow {
  id: number
  code: string                 // 外包商编号
  name: string                 // 名称
  categoryKey: Exclude<CategoryKey, 'all'>
  categoryLabel: string
  level: Level                 // A/B/C
  certificate: string          // 资质证书
  staffCount: number            // 在职人员
  contractCount: number         // 在保合同
  contractNos: string[]         // 合同号列表
  lastScore: number             // 最近考核分
  statusKey: StatusKey
  statusLabel: string
  supplierCode?: string         // 关联供应商编号
  ticketCount: number           // 关联工单
  contact: string
  phone: string
}

// ============================================================
// Mock 数据
// ============================================================
const MOCK_LIST: OutsourceRow[] = [
  {
    id: 1, code: 'OUT-2026-001', name: '长沙光服运维服务有限公司',
    categoryKey: 'ops', categoryLabel: '运维外包', level: 'A',
    certificate: '城市道路照明工程专业承包壹级 / 湘建字 2023-A-018',
    staffCount: 50, contractCount: 4,
    contractNos: ['HT-2026-001', 'HT-2026-045', 'HT-2026-089', 'HT-2026-112'],
    lastScore: 92, statusKey: 'active', statusLabel: '合作中',
    supplierCode: 'SUP-005', ticketCount: 318,
    contact: '王建国', phone: '138-0731-8801'
  },
  {
    id: 2, code: 'OUT-2026-002', name: '岳阳恒通工程有限公司',
    categoryKey: 'engineering', categoryLabel: '工程外包', level: 'B',
    certificate: '市政公用工程施工总承包贰级 / 湘建字 2022-B-033',
    staffCount: 28, contractCount: 2,
    contractNos: ['HT-2026-031', 'HT-2026-078'],
    lastScore: 84, statusKey: 'active', statusLabel: '合作中',
    supplierCode: 'SUP-012', ticketCount: 96,
    contact: '刘志强', phone: '139-0730-5566'
  },
  {
    id: 3, code: 'OUT-2026-003', name: '湘潭明辉检测技术有限公司',
    categoryKey: 'inspection', categoryLabel: '检测外包', level: 'A',
    certificate: 'CMA 认证 / 湘检字 2023-056',
    staffCount: 15, contractCount: 1,
    contractNos: ['HT-2026-055'],
    lastScore: 88, statusKey: 'active', statusLabel: '合作中',
    supplierCode: 'SUP-018', ticketCount: 42,
    contact: '周明辉', phone: '137-0732-1122'
  },
  {
    id: 4, code: 'OUT-2026-004', name: '株洲信达运维有限公司',
    categoryKey: 'ops', categoryLabel: '运维外包', level: 'B',
    certificate: '城市道路照明工程专业承包贰级 / 湘建字 2021-B-047',
    staffCount: 32, contractCount: 3,
    contractNos: ['HT-2026-022', 'HT-2026-063', 'HT-2026-097'],
    lastScore: 78, statusKey: 'active', statusLabel: '合作中',
    supplierCode: 'SUP-024', ticketCount: 215,
    contact: '陈信达', phone: '136-0733-8899'
  },
  {
    id: 5, code: 'OUT-2026-005', name: '衡阳鸿远建设工程有限公司',
    categoryKey: 'engineering', categoryLabel: '工程外包', level: 'C',
    certificate: '市政公用工程施工总承包叁级 / 湘建字 2020-C-091',
    staffCount: 20, contractCount: 1,
    contractNos: ['HT-2026-071'],
    lastScore: 71, statusKey: 'paused', statusLabel: '已暂停',
    supplierCode: 'SUP-031', ticketCount: 58,
    contact: '李建华', phone: '135-0734-3344'
  },
  {
    id: 6, code: 'OUT-2026-006', name: '常德安恒检测咨询有限公司',
    categoryKey: 'inspection', categoryLabel: '检测外包', level: 'B',
    certificate: 'CMA 认证 / 湘检字 2022-078',
    staffCount: 12, contractCount: 1,
    contractNos: ['HT-2026-088'],
    lastScore: 82, statusKey: 'active', statusLabel: '合作中',
    supplierCode: 'SUP-036', ticketCount: 35,
    contact: '吴安恒', phone: '134-0736-7788'
  }
]

const ALL_ROWS = ref<OutsourceRow[]>(MOCK_LIST)

// ============================================================
// Tab 配置
// ============================================================
const realCategoryTabs: Array<{
  key: Exclude<CategoryKey, 'all'>
  label: string
  icon: any
}> = [
  { key: 'ops',          label: '运维外包', icon: Monitor },
  { key: 'engineering', label: '工程外包', icon: SetUp },
  { key: 'inspection',  label: '检测外包', icon: Histogram }
]

const allCategoryTabs = computed(() => {
  const total = ALL_ROWS.value.length
  const countMap: Record<string, number> = {
    ops: ALL_ROWS.value.filter(r => r.categoryKey === 'ops').length,
    engineering: ALL_ROWS.value.filter(r => r.categoryKey === 'engineering').length,
    inspection: ALL_ROWS.value.filter(r => r.categoryKey === 'inspection').length
  }
  return [
    { key: 'all', label: '全部', count: total, icon: User },
    ...realCategoryTabs.map(c => ({ ...c, count: countMap[c.key] }))
  ]
})

// ============================================================
// 状态
// ============================================================
const activeCategory = ref<CategoryKey>('all')
const filters = reactive({
  level: '' as '' | Level,
  status: '' as '' | StatusKey,
  keyword: '',
  applied: { level: '' as '' | Level, status: '' as '' | StatusKey, keyword: '' }
})
const pager = reactive({ page: 1, size: 10 })

const detailVisible = ref(false)
const currentRow = ref<OutsourceRow | null>(null)

// ============================================================
// 筛选后
// ============================================================
const filteredRows = computed(() => {
  const f = filters.applied
  let list = ALL_ROWS.value.slice()
  if (activeCategory.value !== 'all') {
    list = list.filter(r => r.categoryKey === activeCategory.value)
  }
  if (f.level) list = list.filter(r => r.level === f.level)
  if (f.status) list = list.filter(r => r.statusKey === f.status)
  if (f.keyword.trim()) {
    const kw = f.keyword.trim().toLowerCase()
    list = list.filter(r =>
      r.code.toLowerCase().includes(kw) ||
      r.name.toLowerCase().includes(kw)
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
  return {
    total: rows.length,
    aLevel: rows.filter(r => r.level === 'A').length,
    staffTotal: rows.reduce((a, r) => a + r.staffCount, 0),
    contractTotal: rows.reduce((a, r) => a + r.contractCount, 0)
  }
})

const kpiCells = computed(() => [
  { key: 'total',   label: '外包商总数',   value: kpiAgg.value.total,        icon: User,        theme: '' },
  { key: 'aLevel',  label: 'A 级服务商',   value: kpiAgg.value.aLevel,       icon: CircleCheck, theme: 'success' },
  { key: 'staff',   label: '在职外包人员', value: kpiAgg.value.staffTotal + ' 人', icon: Histogram, theme: 'info' },
  { key: 'contract',label: '在保合同数',   value: kpiAgg.value.contractTotal, icon: Document,    theme: 'warn' }
])

// ============================================================
// 筛选控制
// ============================================================
function onFilterApply() {
  filters.applied = { level: filters.level, status: filters.status, keyword: filters.keyword }
  pager.page = 1
  ElMessage.success('筛选已应用')
}
function onFilterReset() {
  filters.level = ''
  filters.status = ''
  filters.keyword = ''
  filters.applied = { level: '', status: '', keyword: '' }
  pager.page = 1
  ElMessage.info('已重置筛选条件')
}

// ============================================================
// 颜色工具
// ============================================================
function scoreColor(score: number) {
  if (score >= 85) return 'score-a'
  if (score >= 75) return 'score-b'
  return 'score-c'
}

// ============================================================
// 动作
// ============================================================
function onRowClick(row: OutsourceRow) {
  currentRow.value = row
  detailVisible.value = true
}
function onMonitorDetail(row: OutsourceRow) {
  currentRow.value = row
  detailVisible.value = true
}
function onEdit(row: OutsourceRow) {
  ElMessage.info(`编辑外包商 ${row.code}`)
}
function onDisable(row: OutsourceRow) {
  ElMessageBox.confirm(`确认停用外包商「${row.name}」？停用后所有关联工单将重新分配。`, '停用外包商', {
    type: 'warning', confirmButtonText: '确认停用', cancelButtonText: '取消'
  }).then(() => {
    const idx = ALL_ROWS.value.findIndex(r => r.id === row.id)
    if (idx >= 0) {
      ALL_ROWS.value[idx].statusKey = 'paused'
      ALL_ROWS.value[idx].statusLabel = '已暂停'
    }
    ElMessage.success('已停用')
  }).catch(() => {})
}
function onGotoContract(row: OutsourceRow) {
  router.push({ path: '/outsourcing/contract', query: { outsourceCode: row.code } })
}
function onGotoTicket(row: OutsourceRow) {
  router.push({ path: '/opsTicket/outsourcing', query: { outsourceCode: row.code } })
}
</script>

<style scoped lang="scss">
.zg-om-ledger {
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
  &__tablewrap { border: 1px solid var(--zg-line-soft); border-radius: var(--zg-radius-md); overflow: hidden; cursor: pointer; }
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
.zg-filter-select { width: 170px; }
.zg-filter-input { width: 240px; }

.zg-om-code { font-family: 'Geist Mono', ui-monospace, monospace; font-size: 12px; font-weight: 600; }
.zg-om-name {
  display: flex; flex-direction: column; gap: 2px;
  &__title { font-weight: 600; font-size: 13px; }
  &__sup { font-size: 11px; color: var(--zg-ink-tertiary); }
}

.zg-om-level {
  display: inline-flex; align-items: center; justify-content: center;
  width: 36px; height: 26px; border-radius: var(--zg-radius-sm);
  font-size: 12px; font-weight: 700; letter-spacing: 1px;
  &--A { background: var(--zg-success-soft); color: var(--zg-success); }
  &--B { background: var(--zg-warning-soft); color: var(--zg-warning); }
  &--C { background: var(--zg-danger-soft); color: var(--zg-danger); }
}

.zg-om-cert {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 12px; color: var(--zg-ink-secondary);
  .el-icon { color: var(--zg-brand-primary); }
}
.zg-om-empty { color: #cbd5e1; }

.zg-om-score {
  font-weight: 700; font-variant-numeric: tabular-nums; font-size: 13px;
  &.score-a { color: var(--zg-success); }
  &.score-b { color: var(--zg-warning); }
  &.score-c { color: var(--zg-danger); }
}

.zg-status-pill {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 12px; padding: 2px 10px; border-radius: var(--zg-radius-pill);
  font-weight: 500;
  .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
  &--active     { color: var(--zg-success); background: var(--zg-success-soft); }
  &--paused     { color: var(--zg-warning); background: var(--zg-warning-soft); }
  &--terminated { color: var(--zg-danger);  background: var(--zg-danger-soft); }
}

.zg-link {
  color: var(--zg-brand-primary); cursor: pointer; font-weight: 500;
  &:hover { text-decoration: underline; }
}

.zg-om-detail {
  display: flex; flex-direction: column; gap: 18px;
  &__hero {
    display: flex; align-items: center; gap: 16px;
    padding: 18px; background: var(--zg-surface-muted);
    border-radius: var(--zg-radius-md);
  }
  &__level {
    width: 56px; height: 56px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; font-weight: 800; letter-spacing: 1px;
    &.zg-om-level--A { background: var(--zg-success-soft); color: var(--zg-success); }
    &.zg-om-level--B { background: var(--zg-warning-soft); color: var(--zg-warning); }
    &.zg-om-level--C { background: var(--zg-danger-soft); color: var(--zg-danger); }
  }
  &__hero-copy h3 { margin: 0 0 4px; font-size: 16px; }
  &__hero-copy p { margin: 0; font-size: 12px; color: var(--zg-ink-tertiary); }
  &__desc { :deep(th) { width: 110px; background: var(--zg-surface-muted); } }
  &__actions { display: flex; gap: 10px; padding-top: 12px; border-top: 1px dashed var(--zg-line-soft); }
}
</style>
