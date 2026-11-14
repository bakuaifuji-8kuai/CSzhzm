<!--
  智光云枢 · 运维工单 · 委外工单管理
  业务域：opsTicket
  功能：委外工单卡片式管理，含进度条、结算金额、开票状态、PENDING/IN_PROGRESS/COMPLETED/VERIFIED 状态
-->
<template>
  <section class="zg-outsource">
    <header class="zg-outsource__head">
      <div class="zg-outsource__headline">
        <div class="zg-outsource__sigil">
          <el-icon :size="22"><House /></el-icon>
        </div>
        <div class="zg-outsource__copy">
          <h1 class="zg-outsource__title">委外工单管理</h1>
          <p class="zg-outsource__sub">委外施工/检修/改造项目全生命周期 · 进度跟踪 · 结算开票</p>
        </div>
      </div>
      <div class="zg-outsource__cta">
        <el-button type="primary"><el-icon><Plus /></el-icon><span>新建委外工单</span></el-button>
        <el-button><el-icon><Download /></el-icon><span>批量导出</span></el-button>
      </div>
    </header>

    <!-- 汇总指标 -->
    <div class="zg-metrics">
      <div class="zg-metrics__cell">
        <span class="zg-metrics__num">{{ summary.total }}</span>
        <span class="zg-metrics__lbl">委外工单总数</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--info">
        <span class="zg-metrics__num">{{ summary.pending }}</span>
        <span class="zg-metrics__lbl">待启动</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <span class="zg-metrics__num">{{ summary.inProgress }}</span>
        <span class="zg-metrics__lbl">进行中</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--success">
        <span class="zg-metrics__num">{{ summary.completed }}</span>
        <span class="zg-metrics__lbl">已完成</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--primary">
        <span class="zg-metrics__num">{{ summary.verified }}</span>
        <span class="zg-metrics__lbl">已验收</span>
      </div>
    </div>

    <!-- 过滤工具栏 -->
    <div class="zg-filterband">
      <div class="zg-filterband__row">
        <el-input v-model="filter.keyword" placeholder="搜索委外单号 / 内部工单 / 实施单位" clearable style="width: 280px">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-select v-model="filter.status" placeholder="状态" style="width: 130px" clearable>
          <el-option label="PENDING 待启动" value="PENDING" />
          <el-option label="IN_PROGRESS 进行中" value="IN_PROGRESS" />
          <el-option label="COMPLETED 已完成" value="COMPLETED" />
          <el-option label="VERIFIED 已验收" value="VERIFIED" />
        </el-select>
        <el-select v-model="filter.invoice" placeholder="开票状态" style="width: 140px" clearable>
          <el-option label="未开票" value="未开票" />
          <el-option label="已开票" value="已开票" />
          <el-option label="部分开票" value="部分开票" />
        </el-select>
        <el-date-picker v-model="filter.dateRange" type="daterange" range-separator="至"
          start-placeholder="开始日期" end-placeholder="结束日期" style="width: 260px" />
        <div class="zg-filterband__actions">
          <el-button type="primary" size="small">筛选</el-button>
          <el-button size="small">重置</el-button>
        </div>
      </div>
    </div>

    <!-- 卡片布局 -->
    <div class="zg-cardgrid">
      <article v-for="item in filteredList" :key="item.no" class="zg-outsource-card" :class="'zg-outsource-card--' + item.status.toLowerCase()">
        <div class="zg-outsource-card__head">
          <div class="zg-outsource-card__no">
            <el-icon :size="16"><Document /></el-icon>
            <span>{{ item.no }}</span>
          </div>
          <span class="zg-status-pill" :class="statusPillClass(item.status)">
            {{ statusLabel(item.status) }}
          </span>
        </div>

        <div class="zg-outsource-card__body">
          <div class="zg-outsource-card__row">
            <span class="zg-outsource-card__lbl">关联内部工单</span>
            <span class="zg-outsource-card__val font-mono">{{ item.internalNo }}</span>
          </div>
          <div class="zg-outsource-card__row">
            <span class="zg-outsource-card__lbl">实施单位</span>
            <span class="zg-outsource-card__val">{{ item.vendor }}</span>
          </div>
          <div class="zg-outsource-card__content">
            <span class="zg-outsource-card__lbl">实施内容</span>
            <p class="zg-outsource-card__desc">{{ item.content }}</p>
          </div>
        </div>

        <div class="zg-outsource-card__dates">
          <div class="zg-date-chip">
            <el-icon><Calendar /></el-icon>
            <span>{{ item.startDate }}</span>
          </div>
          <span class="zg-date-arrow">→</span>
          <div class="zg-date-chip">
            <el-icon><Calendar /></el-icon>
            <span>{{ item.endDate }}</span>
          </div>
        </div>

        <div class="zg-outsource-card__progress">
          <div class="zg-progress-head">
            <span class="zg-progress-head__lbl">完成进度</span>
            <span class="zg-progress-head__num">{{ item.progress }}%</span>
          </div>
          <el-progress :percentage="item.progress" :stroke-width="10"
            :color="progressColor(item.progress)" :show-text="false" />
        </div>

        <div class="zg-outsource-card__foot">
          <div class="zg-outsource-card__amount">
            <span class="zg-outsource-card__lbl">结算金额</span>
            <span class="zg-amount">¥{{ item.amount.toLocaleString() }}</span>
          </div>
          <div class="zg-outsource-card__invoice">
            <span class="zg-outsource-card__lbl">开票状态</span>
            <el-tag :type="invoiceTagType(item.invoiceStatus)" size="small">{{ item.invoiceStatus }}</el-tag>
          </div>
        </div>

        <div class="zg-outsource-card__actions">
          <el-button link type="primary" size="small">详情</el-button>
          <el-button link type="primary" size="small">编辑</el-button>
          <el-button link type="primary" size="small">验收</el-button>
          <el-button link type="primary" size="small">开票</el-button>
        </div>
      </article>
    </div>

    <div class="zg-pagerbar">
      <el-pagination background :total="filteredList.length" :page-size="8"
        layout="prev, pager, next, jumper, ->, sizes, total" />
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { House, Plus, Download, Search, Document, Calendar } from "@element-plus/icons-vue"

const summary = ref({ total: 48, pending: 6, inProgress: 22, completed: 14, verified: 6 })

const filter = reactive({ keyword: '', status: '', invoice: '', dateRange: null })

// 委外工单 mock - 12 条
const outsourceList = ref([
  { no: 'OUT-20261101001', internalNo: 'RPR-20261025003', vendor: '湖南恒通电力工程有限公司', content: '先导路K0+350-K1+200段电缆更换工程', startDate: '2026-11-01', endDate: '2026-11-15', progress: 85, amount: 185000, invoiceStatus: '已开票', status: 'IN_PROGRESS' },
  { no: 'OUT-20261101002', internalNo: 'RPR-20261028007', vendor: '长沙明辉照明工程有限公司', content: '麓谷大道LED灯具批量更换(300套)', startDate: '2026-11-03', endDate: '2026-11-20', progress: 60, amount: 268000, invoiceStatus: '部分开票', status: 'IN_PROGRESS' },
  { no: 'OUT-20261102001', internalNo: 'RPR-20261030012', vendor: '湘电集团安装分公司', content: '梅溪湖3#箱变增容改造(500kVA→800kVA)', startDate: '2026-11-05', endDate: '2026-11-25', progress: 45, amount: 420000, invoiceStatus: '未开票', status: 'IN_PROGRESS' },
  { no: 'OUT-20261102002', internalNo: 'RPR-20261101001', vendor: '中电建市政工程有限公司', content: '金星大道电缆井改造(新增20座)', startDate: '2026-11-08', endDate: '2026-12-05', progress: 0, amount: 156000, invoiceStatus: '未开票', status: 'PENDING' },
  { no: 'OUT-20261103001', internalNo: 'RPR-20261020005', vendor: '华电科技发展有限公司', content: '岳麓大道路灯智能控制系统升级', startDate: '2026-10-20', endDate: '2026-11-10', progress: 100, amount: 86000, invoiceStatus: '已开票', status: 'VERIFIED' },
  { no: 'OUT-20261103002', internalNo: 'RPR-20261015009', vendor: '湖南智光检测技术有限公司', content: '湘江路电缆沟综合检测评估', startDate: '2026-10-15', endDate: '2026-10-30', progress: 100, amount: 42000, invoiceStatus: '已开票', status: 'COMPLETED' },
  { no: 'OUT-20261104001', internalNo: 'RPR-20261104003', vendor: '长沙华诚电力检修有限公司', content: '天心大道4#配电箱大修', startDate: '2026-11-10', endDate: '2026-11-18', progress: 10, amount: 68000, invoiceStatus: '未开票', status: 'IN_PROGRESS' },
  { no: 'OUT-20261104002', internalNo: 'RPR-20261102008', vendor: '芙蓉建设工程有限公司', content: '芙蓉路LED景观带安装(2km)', startDate: '2026-11-12', endDate: '2026-12-15', progress: 5, amount: 320000, invoiceStatus: '未开票', status: 'PENDING' },
  { no: 'OUT-20261105001', internalNo: 'RPR-20261022011', vendor: '开福机电安装工程公司', content: '开福大道充电桩安装工程(15台)', startDate: '2026-10-22', endDate: '2026-11-05', progress: 100, amount: 112000, invoiceStatus: '已开票', status: 'VERIFIED' },
  { no: 'OUT-20261105002', internalNo: 'RPR-20261105006', vendor: '雨花亮化工程有限公司', content: '雨花路路灯杆防腐翻新(80根)', startDate: '2026-11-15', endDate: '2026-11-30', progress: 0, amount: 95000, invoiceStatus: '未开票', status: 'PENDING' },
  { no: 'OUT-20261106001', internalNo: 'RPR-20261018004', vendor: '先导智能科技有限公司', content: '先导路隧道照明节能改造', startDate: '2026-10-18', endDate: '2026-11-28', progress: 80, amount: 520000, invoiceStatus: '部分开票', status: 'IN_PROGRESS' },
  { no: 'OUT-20261106002', internalNo: 'RPR-20261106002', vendor: '梅溪湖市政维护中心', content: '梅溪湖环湖路路灯巡检服务(年度)', startDate: '2026-11-01', endDate: '2027-10-31', progress: 12, amount: 180000, invoiceStatus: '未开票', status: 'IN_PROGRESS' }
])

const filteredList = computed(() => {
  return outsourceList.value.filter(item => {
    const matchKw = !filter.keyword.trim() ||
      item.no.toLowerCase().includes(filter.keyword.toLowerCase()) ||
      item.internalNo.toLowerCase().includes(filter.keyword.toLowerCase()) ||
      item.vendor.toLowerCase().includes(filter.keyword.toLowerCase())
    const matchStatus = !filter.status || item.status === filter.status
    const matchInvoice = !filter.invoice || item.invoiceStatus === filter.invoice
    return matchKw && matchStatus && matchInvoice
  })
})

function statusLabel(code) {
  return { PENDING: '待启动', IN_PROGRESS: '进行中', COMPLETED: '已完成', VERIFIED: '已验收' }[code] || code
}
function statusPillClass(code) {
  return {
    PENDING: 'zg-pill zg-pill--info',
    IN_PROGRESS: 'zg-pill zg-pill--warn',
    COMPLETED: 'zg-pill zg-pill--success',
    VERIFIED: 'zg-pill zg-pill--primary'
  }[code] || 'zg-pill'
}
function invoiceTagType(s) {
  if (s === '已开票') return 'success'
  if (s === '部分开票') return 'warning'
  return 'info'
}
function progressColor(p) {
  if (p >= 100) return '#059669'
  if (p >= 60) return '#0ea5e9'
  if (p >= 30) return '#d97706'
  return '#94a3b8'
}
</script>

<style scoped lang="scss">
.zg-outsource {
  padding: 24px;

  &__head {
    display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;
    margin-bottom: 20px; padding-bottom: 18px; border-bottom: 1px solid #e2e8f0;
  }
  &__headline { display: flex; align-items: center; gap: 14px; }
  &__sigil { width: 44px; height: 44px; border-radius: 10px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; display: flex; align-items: center; justify-content: center; }
  &__copy { display: flex; flex-direction: column; gap: 4px; }
  &__title { font-size: 20px; font-weight: 600; margin: 0; color: #18181b; }
  &__sub { font-size: 13px; color: #71717a; margin: 0; }
  &__cta { display: flex; gap: 10px; }
}

.zg-metrics {
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; margin-bottom: 18px;
  &__cell {
    background: #fff; border: 1px solid #e2e8f0; border-radius: 16px;
    padding: 16px 18px; display: flex; flex-direction: column; gap: 6px;
    box-shadow: 0 1px 3px rgba(15,23,42,0.04); position: relative; overflow: hidden;
    &::before { content: ''; position: absolute; left: 0; top: 0; width: 3px; height: 100%; background: #6366f1; }
    &--primary::before { background: #6366f1; }
    &--success::before { background: #059669; }
    &--warn::before { background: #d97706; }
    &--info::before { background: #0ea5e9; }
  }
  &__num { font-size: 26px; font-weight: 700; color: #18181b; line-height: 1; }
  &__lbl { font-size: 12px; color: #71717a; }
}

.zg-filterband {
  padding: 14px 16px; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px;
  margin-bottom: 18px;
  &__row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
  &__actions { margin-left: auto; display: flex; gap: 8px; }
}

.zg-cardgrid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 16px; margin-bottom: 20px;
}

.zg-outsource-card {
  background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 18px;
  display: flex; flex-direction: column; gap: 12px;
  transition: all 0.25s ease; position: relative; overflow: hidden;
  border-left: 3px solid #94a3b8;

  &:hover { transform: translateY(-2px); box-shadow: 0 8px 24px -8px rgba(15,23,42,0.15); }
  &--pending { border-left-color: #0ea5e9; }
  &--in_progress { border-left-color: #d97706; }
  &--completed { border-left-color: #059669; }
  &--verified { border-left-color: #6366f1; border-style: dashed; }

  &__head { display: flex; justify-content: space-between; align-items: center; }
  &__no { display: flex; align-items: center; gap: 6px; font-family: ui-monospace, monospace; font-size: 13px; font-weight: 600; color: #6366f1; }
  &__body { display: flex; flex-direction: column; gap: 8px; }
  &__row { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
  &__content { display: flex; flex-direction: column; gap: 4px; padding-top: 4px; border-top: 1px dashed #e2e8f0; }
  &__desc { font-size: 13px; color: #52525b; margin: 0; line-height: 1.5; }
  &__lbl { font-size: 11px; color: #94a3b8; font-weight: 500; }
  &__val { font-size: 13px; color: #18181b; font-weight: 500; }
  &__dates { display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: #f8fafc; border-radius: 10px; }
  &__progress { padding: 4px 0; }
  &__foot { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding-top: 10px; border-top: 1px solid #e2e8f0; }
  &__amount { display: flex; flex-direction: column; gap: 4px; }
  &__invoice { display: flex; flex-direction: column; gap: 4px; align-items: flex-end; }
  &__actions { display: flex; justify-content: flex-end; gap: 4px; padding-top: 8px; border-top: 1px dashed #e2e8f0; }
}

.zg-date-chip {
  display: flex; align-items: center; gap: 4px; font-size: 12px; color: #52525b; font-family: ui-monospace, monospace;
}
.zg-date-arrow { color: #94a3b8; font-size: 16px; }

.zg-progress-head {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;
  &__lbl { font-size: 12px; color: #71717a; }
  &__num { font-size: 13px; font-weight: 700; color: #18181b; }
}

.zg-amount { font-size: 18px; font-weight: 700; color: #dc2626; font-variant-numeric: tabular-nums; }

.zg-pill {
  display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; letter-spacing: 0.5px;
  &--pending { background: #e0f2fe; color: #0369a1; }
  &--in_progress { background: #fef3c7; color: #b45309; }
  &--completed { background: #d1fae5; color: #047857; }
  &--verified { background: #ede9fe; color: #6d28d9; }
}

.zg-status-pill { font-size: 11px; }
.font-mono { font-family: ui-monospace, monospace; }

.zg-pagerbar { display: flex; justify-content: flex-end; }
</style>
