<!--
  智光云枢 · 采购管理 · 采购申请
  申请 → 审批 → 转订单 链路入口
-->
<template>
  <section class="zg-pm-apply">
    <header class="zg-pm-apply__head">
      <div class="zg-pm-apply__headline">
        <div class="zg-pm-apply__sigil"><el-icon :size="22"><DocumentAdd /></el-icon></div>
        <div class="zg-pm-apply__copy">
          <h1>采购申请</h1>
          <p>共 {{ allApplies.length }} 条申请 · 本月新增 {{ kpiAgg.monthCount }} 条 ·
            审批中 {{ kpiAgg.pendingCount }} 条 · 总预算 ¥{{ (kpiAgg.totalAmount/10000).toFixed(1) }}万</p>
        </div>
      </div>
      <div class="zg-pm-apply__cta">
        <el-button type="primary"><el-icon><Plus /></el-icon>新建申请</el-button>
        <el-button plain><el-icon><Download /></el-icon>导出</el-button>
      </div>
    </header>

    <!-- KPI 四卡 -->
    <div class="zg-pm-apply__kpi">
      <div v-for="k in kpiCells" :key="k.key" class="zg-kpi-cell" :class="k.theme">
        <div class="zg-kpi-cell__icon"><el-icon :size="20"><component :is="k.icon" /></el-icon></div>
        <div class="zg-kpi-cell__body">
          <span class="zg-kpi-cell__num">{{ k.value }}</span>
          <span class="zg-kpi-cell__lbl">{{ k.label }}</span>
        </div>
      </div>
    </div>

    <div class="zg-pm-apply__main">
      <!-- 状态 Tab -->
      <el-tabs v-model="activeTab" class="zg-pm-apply__tabs">
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
      <div class="zg-pm-apply__filterbar">
        <div class="zg-filter-row">
          <div class="zg-filter-item">
            <span class="zg-filter-item__lbl">采购类型</span>
            <el-select v-model="filters.type" placeholder="全部类型" class="zg-filter-select" clearable>
              <el-option v-for="t in typeOptions" :key="t.value" :label="t.label" :value="t.value" />
            </el-select>
          </div>
          <div class="zg-filter-item">
            <span class="zg-filter-item__lbl">申请人</span>
            <el-input v-model="filters.applicant" placeholder="输入申请人" class="zg-filter-input" clearable>
              <template #prefix><el-icon><User /></el-icon></template>
            </el-input>
          </div>
          <div class="zg-filter-item">
            <span class="zg-filter-item__lbl">申请日期</span>
            <el-date-picker v-model="filters.dateRange" type="daterange" range-separator="至"
              start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" />
          </div>
          <div class="zg-filter-item zg-filter-item--actions">
            <el-button type="primary"><el-icon><Search /></el-icon>查询</el-button>
            <el-button @click="onReset"><el-icon><Refresh /></el-icon>重置</el-button>
          </div>
        </div>
      </div>

      <!-- 表格 -->
      <div class="zg-pm-apply__tablewrap">
        <el-table :data="filteredList" stripe height="560">
          <el-table-column prop="applyNo" label="申请单号" width="150" fixed="left">
            <template #default="{ row }">
              <span class="zg-pm-code">{{ row.applyNo }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="title" label="采购标题" min-width="200" show-overflow-tooltip />
          <el-table-column label="类型" width="110" align="center">
            <template #default="{ row }">
              <el-tag :type="typeTag(row.type)" effect="plain">{{ row.typeLabel }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="预算金额" width="130" align="right">
            <template #default="{ row }">¥{{ row.budget.toLocaleString() }}</template>
          </el-table-column>
          <el-table-column prop="applicant" label="申请人" width="110" />
          <el-table-column prop="dept" label="申请部门" width="140" />
          <el-table-column label="状态" width="110" align="center">
            <template #default="{ row }">
              <span class="zg-status-pill" :class="'zg-status-pill--' + row.statusKey">
                <i class="dot"></i>{{ row.statusLabel }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="160" />
          <el-table-column label="操作" width="240" fixed="right">
            <template #default="{ row }">
              <el-button v-if="row.statusKey === 'pending'" type="primary" link size="small">审批</el-button>
              <el-button type="primary" link size="small">详情</el-button>
              <el-button v-if="row.statusKey === 'approved'" type="success" link size="small">转采购订单</el-button>
              <el-button v-if="row.statusKey === 'draft'" link size="small">编辑</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="zg-pm-apply__pager">
        <span class="zg-pm-apply__total">共 {{ filteredList.length }} 条</span>
        <el-pagination background layout="prev, pager, next, sizes" :total="filteredList.length"
          :page-sizes="[10, 20, 50]" :page-size="10" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import {
  DocumentAdd, Plus, Download, Search, Refresh, User,
  List, Clock, CircleCheck, Warning
} from '@element-plus/icons-vue'

interface ApplyRow {
  id: number
  applyNo: string
  title: string
  type: string
  typeLabel: string
  budget: number
  applicant: string
  dept: string
  statusKey: 'draft' | 'pending' | 'approved' | 'rejected'
  statusLabel: string
  createTime: string
}

const typeOptions = [
  { value: 'equipment', label: '设备采购' },
  { value: 'material',  label: '材料采购' },
  { value: 'service',   label: '服务采购' },
  { value: 'vehicle',   label: '车辆采购' }
]

const allApplies = ref<ApplyRow[]>([
  { id: 1,  applyNo: 'PA-202611-001', title: 'LED 路灯批量采购 200 套',          type: 'equipment', typeLabel: '设备采购', budget: 2800000,  applicant: '张工', dept: '设备部',   statusKey: 'approved', statusLabel: '已通过', createTime: '2026-11-02 09:15' },
  { id: 2,  applyNo: 'PA-202611-002', title: '2026 年度运维服务外包项目',         type: 'service',   typeLabel: '服务采购', budget: 15600000, applicant: '刘经理', dept: '运维部',   statusKey: 'pending',  statusLabel: '待审批', createTime: '2026-11-03 14:20' },
  { id: 3,  applyNo: 'PA-202611-003', title: '铜芯电缆 YJV22-4×25 采购 5000 米', type: 'material',  typeLabel: '材料采购', budget: 420000,   applicant: '王工程师', dept: '工程中心', statusKey: 'pending',  statusLabel: '待审批', createTime: '2026-11-04 10:05' },
  { id: 4,  applyNo: 'PA-202611-004', title: '高空作业车 14m 升级采购',           type: 'vehicle',   typeLabel: '车辆采购', budget: 680000,   applicant: '赵主任', dept: '车队',     statusKey: 'approved', statusLabel: '已通过', createTime: '2026-11-05 16:30' },
  { id: 5,  applyNo: 'PA-202611-005', title: '智能路灯控制网关 ZGSQ-V4 (300 台)',  type: 'equipment', typeLabel: '设备采购', budget: 980000,   applicant: '陈工', dept: '技术中心', statusKey: 'draft',    statusLabel: '草稿',   createTime: '2026-11-06 11:45' },
  { id: 6,  applyNo: 'PA-202611-006', title: '配电箱 DBX-400V-63A (80 台)',       type: 'equipment', typeLabel: '设备采购', budget: 640000,   applicant: '李采购', dept: '供应链',   statusKey: 'rejected', statusLabel: '已驳回', createTime: '2026-11-07 08:50' },
  { id: 7,  applyNo: 'PA-202611-007', title: '应急抢修电缆一批',                 type: 'material',  typeLabel: '材料采购', budget: 158000,   applicant: '孙主管', dept: '运维部',   statusKey: 'approved', statusLabel: '已通过', createTime: '2026-11-08 13:12' },
  { id: 8,  applyNo: 'PA-202611-008', title: '无人机巡检服务 (年度框架)',         type: 'service',   typeLabel: '服务采购', budget: 3200000,  applicant: '周总监', dept: '巡检中心', statusKey: 'pending',  statusLabel: '待审批', createTime: '2026-11-09 09:30' },
  { id: 9,  applyNo: 'PA-202611-009', title: '工具车 2 辆更换',                   type: 'vehicle',   typeLabel: '车辆采购', budget: 260000,   applicant: '吴队长', dept: '车队',     statusKey: 'draft',    statusLabel: '草稿',   createTime: '2026-11-10 15:40' },
  { id: 10, applyNo: 'PA-202611-010', title: '地埋灯检修材料包 (200 套)',         type: 'material',  typeLabel: '材料采购', budget: 86000,    applicant: '郑师傅', dept: '运维部',   statusKey: 'pending',  statusLabel: '待审批', createTime: '2026-11-11 10:20' },
])

const activeTab = ref('all')
const filters = reactive({
  type: '' as string,
  applicant: '',
  dateRange: [] as string[]
})

function typeTag(v: string) {
  const map: Record<string, string> = { equipment: '', material: 'info', service: 'success', vehicle: 'warning' }
  return map[v] || 'info'
}

const statusTabs = computed(() => {
  const list = allApplies.value
  return [
    { key: 'all',      label: '全部',   icon: List,          count: list.length },
    { key: 'draft',    label: '草稿',   icon: DocumentAdd,   count: list.filter(r => r.statusKey === 'draft').length },
    { key: 'pending',  label: '待审批', icon: Clock,         count: list.filter(r => r.statusKey === 'pending').length },
    { key: 'approved', label: '已通过', icon: CircleCheck,   count: list.filter(r => r.statusKey === 'approved').length },
    { key: 'rejected', label: '已驳回', icon: Warning,       count: list.filter(r => r.statusKey === 'rejected').length },
  ]
})

const filteredList = computed(() => {
  let list = allApplies.value
  if (activeTab.value !== 'all') list = list.filter(r => r.statusKey === activeTab.value)
  if (filters.type) list = list.filter(r => r.type === filters.type)
  if (filters.applicant.trim()) list = list.filter(r => r.applicant.includes(filters.applicant.trim()))
  if (filters.dateRange.length === 2) {
    const [s, e] = filters.dateRange
    list = list.filter(r => {
      const d = r.createTime.slice(0, 10)
      return d >= s && d <= e
    })
  }
  return list
})

const kpiAgg = computed(() => {
  const rows = allApplies.value
  const monthRows = rows.filter(r => r.createTime.startsWith('2026-11'))
  return {
    monthCount: monthRows.length,
    pendingCount: rows.filter(r => r.statusKey === 'pending').length,
    approvedCount: rows.filter(r => r.statusKey === 'approved').length,
    totalAmount: rows.reduce((a, r) => a + r.budget, 0)
  }
})

const kpiCells = computed(() => [
  { key: 'month',    label: '本月申请数',   value: kpiAgg.value.monthCount,                  icon: DocumentAdd,  theme: '' },
  { key: 'pending',  label: '审批中',       value: kpiAgg.value.pendingCount,                icon: Clock,        theme: 'warn' },
  { key: 'approved', label: '已通过',       value: kpiAgg.value.approvedCount,               icon: CircleCheck,  theme: 'success' },
  { key: 'amount',   label: '总申请金额(万)', value: (kpiAgg.value.totalAmount / 10000).toFixed(1), icon: Download, theme: 'primary' },
])

function onReset() {
  filters.type = ''
  filters.applicant = ''
  filters.dateRange = []
  activeTab.value = 'all'
}
</script>

<style scoped lang="scss">
.zg-pm-apply {
  --zg-primary: #d97706;
  --zg-success: #059669;
  --zg-warning: #d97706;
  --zg-danger:  #dc2626;
  --zg-info:    #0284c7;
  --zg-ink-primary: #18181b;
  --zg-ink-secondary: #52525b;
  --zg-ink-tertiary: #71717a;
  --zg-line-soft: rgba(241,245,249,0.8);
  --zg-line-strong: rgba(226,232,240,0.6);
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
    background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
    color: #fff; display: flex; align-items: center; justify-content: center;
  }
  &__copy h1 { font-size: 20px; font-weight: 600; margin: 0; }
  &__copy p { font-size: 13px; color: var(--zg-ink-tertiary); margin: 4px 0 0; }
  &__cta { display: flex; gap: 10px; }

  &__kpi {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 14px; margin-bottom: 18px;
  }

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

.zg-kpi-cell {
  background: #fff; border: 1px solid var(--zg-line-soft);
  border-radius: 16px; padding: 16px 18px;
  display: flex; align-items: center; gap: 14px;
  box-shadow: 0 1px 3px rgba(15,23,42,0.04);
  transition: all 250ms cubic-bezier(0.4,0,0.2,1);
  position: relative; overflow: hidden;
  &:hover { transform: translateY(-2px); box-shadow: 0 8px 24px -8px rgba(15,23,42,0.12); }
  &::before { content: ''; position: absolute; left: 0; top: 0; width: 3px; height: 100%; background: var(--zg-primary); }
  &.success::before { background: var(--zg-success); }
  &.info::before    { background: var(--zg-info); }
  &.warn::before    { background: var(--zg-warning); }

  &__icon {
    width: 42px; height: 42px; border-radius: 10px;
    background: var(--zg-primary); color: #fff;
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
    background: #fffbeb; color: var(--zg-primary);
    border-radius: 999px; font-weight: 500;
  }
}

.zg-filter-row { display: flex; flex-wrap: wrap; align-items: center; gap: 14px 20px; }
.zg-filter-item {
  display: flex; align-items: center; gap: 8px;
  &__lbl { font-size: 12px; color: var(--zg-ink-tertiary); flex-shrink: 0; }
  &--actions { margin-left: auto; }
}
.zg-filter-select { width: 180px; }
.zg-filter-input { width: 200px; }

.zg-pm-code { font-family: 'Geist Mono', ui-monospace, monospace; font-size: 12px; font-weight: 600; color: var(--zg-ink-secondary); }

.zg-status-pill {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 12px; padding: 2px 10px; border-radius: 999px; font-weight: 500;
  .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
  &--draft    { color: var(--zg-info);    background: #e0f2fe; }
  &--pending  { color: var(--zg-warning); background: #fef3c7; }
  &--approved { color: var(--zg-success);  background: #d1fae5; }
  &--rejected { color: var(--zg-danger);   background: #fee2e2; }
}
</style>
