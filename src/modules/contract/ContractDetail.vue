<!--
  智光云枢 · 合同合同管理 · 合同详情
  路由参数 :id + :code(query)
  顶部概览 + 左右双栏 + 下方四 Tab
-->
<template>
  <section class="zg-ct-detail">
    <header class="zg-ct-detail__head">
      <div class="zg-ct-detail__headline">
        <el-button link size="small" class="zg-ct-detail__back" @click="$router.back()">
          <el-icon><ArrowLeft /></el-icon>返回台账
        </el-button>
        <h1 class="zg-ct-detail__title">{{ focused?.name || '合同详情' }}</h1>
        <span class="zg-ct-detail__code-badge">{{ focused?.code || '--' }}</span>
        <span v-if="focused" class="zg-status-pill" :class="'zg-status-pill--' + focused.statusKey">
          <i class="dot"></i>{{ focused.statusLabel }}
        </span>
      </div>
      <div class="zg-ct-detail__cta">
        <el-button plain><el-icon><Download /></el-icon>下载合同 PDF</el-button>
        <el-button plain><el-icon><Printer /></el-icon>打印</el-button>
        <el-button type="primary"><el-icon><Edit /></el-icon>编辑合同</el-button>
      </div>
    </header>

    <!-- 左右双栏 -->
    <div class="zg-ct-detail__split">
      <!-- 左栏：基本信息 -->
      <div class="zg-ct-detail__info">
        <div class="zg-ct-detail__card">
          <h3 class="zg-ct-detail__section-title">合同基本信息</h3>
          <el-descriptions v-if="focused" :column="1" border class="zg-ct-detail__descs">
            <el-descriptions-item label="合同编号">
              <span class="zg-ct-mono">{{ focused.code }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="合同类型">
              <el-tag size="small" :type="typeTagType(focused.typeKey)" effect="plain">{{ focused.typeLabel }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="甲方（发包方）">
              {{ focused.partyA }}
              <span class="zg-ct-sub-info">（{{ focused.partyACode }}）</span>
            </el-descriptions-item>
            <el-descriptions-item label="乙方（承包方）">
              {{ focused.partyBName }}
              <span class="zg-ct-sub-info">（{{ focused.partyBCode }}）</span>
            </el-descriptions-item>
            <el-descriptions-item label="合同金额">
              <span class="zg-ct-amount-big">¥{{ focused.amount.toLocaleString() }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="签订日期">{{ focused.signDate }}</el-descriptions-item>
            <el-descriptions-item label="有效期">
              {{ focused.startDate }} <span class="zg-ct-range-sep">至</span> {{ focused.endDate }}
            </el-descriptions-item>
            <el-descriptions-item label="经办人">{{ focused.manager }}</el-descriptions-item>
            <el-descriptions-item label="剩余有效期">
              <span v-if="focused.daysLeft === null" class="zg-ct-days zg-ct-days--na">—</span>
              <span v-else-if="focused.daysLeft < 0" class="zg-ct-days zg-ct-days--expired">已到期 {{ -focused.daysLeft }} 天</span>
              <span v-else-if="focused.daysLeft <= 30" class="zg-ct-days zg-ct-days--urgent">{{ focused.daysLeft }} 天</span>
              <span v-else class="zg-ct-days">{{ focused.daysLeft }} 天</span>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 合同条款摘要 -->
        <div class="zg-ct-detail__card">
          <h3 class="zg-ct-detail__section-title">合同条款摘要</h3>
          <div class="zg-ct-clause">
            <div class="zg-ct-clause__item">
              <span class="zg-ct-clause__label">结算方式</span>
              <span class="zg-ct-clause__value">按里程碑节点支付，每节点完成后 15 日内付款</span>
            </div>
            <div class="zg-ct-clause__item">
              <span class="zg-ct-clause__label">质保期</span>
              <span class="zg-ct-clause__value">验收合格后 12 个月</span>
            </div>
            <div class="zg-ct-clause__item">
              <span class="zg-ct-clause__label">违约责任</span>
              <span class="zg-ct-clause__value">逾期交付按 0.1%/日 计违约金，上限合同额 5%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右栏：履约进度 -->
      <div class="zg-ct-detail__progress">
        <div class="zg-ct-detail__card">
          <h3 class="zg-ct-detail__section-title">履约付款进度</h3>

          <!-- 金额大数字 -->
          <div class="zg-ct-progress-summary">
            <div class="zg-ct-progress-cell">
              <span class="lbl">合同总金额</span>
              <span class="num zg-ct-progress-cell--total">¥{{ (focused?.amount || 0).toLocaleString() }}</span>
            </div>
            <div class="zg-ct-progress-arrow"><el-icon><ArrowRight /></el-icon></div>
            <div class="zg-ct-progress-cell">
              <span class="lbl">已付款</span>
              <span class="num zg-ct-progress-cell--paid">¥{{ paidAmount.toLocaleString() }}</span>
            </div>
            <div class="zg-ct-progress-arrow"><el-icon><ArrowRight /></el-icon></div>
            <div class="zg-ct-progress-cell">
              <span class="lbl">待付款</span>
              <span class="num zg-ct-progress-cell--pending">¥{{ pendingAmount.toLocaleString() }}</span>
            </div>
            <div class="zg-ct-progress-arrow"><el-icon><ArrowRight /></el-icon></div>
            <div class="zg-ct-progress-cell">
              <span class="lbl">质保金</span>
              <span class="num zg-ct-progress-cell--warranty">¥{{ warrantyAmount.toLocaleString() }}</span>
            </div>
          </div>

          <!-- 进度条可视化 -->
          <div class="zg-ct-progress-bar-wrap">
            <div class="zg-ct-progress-bar">
              <div class="zg-ct-progress-seg zg-ct-progress-seg--paid"
                :style="{ width: paidPct + '%' }">
                <span class="seg-label">已付 {{ paidPct.toFixed(0) }}%</span>
              </div>
              <div class="zg-ct-progress-seg zg-ct-progress-seg--pending"
                :style="{ width: pendingPct + '%' }">
                <span class="seg-label">待付 {{ pendingPct.toFixed(0) }}%</span>
              </div>
              <div class="zg-ct-progress-seg zg-ct-progress-seg--warranty"
                :style="{ width: warrantyPct + '%' }">
                <span class="seg-label">质保 {{ warrantyPct.toFixed(0) }}%</span>
              </div>
            </div>
          </div>

          <!-- 履约里程碑 -->
          <h4 class="zg-ct-detail__subtitle">履约里程碑</h4>
          <el-timeline class="zg-ct-detail__timeline">
            <el-timeline-item v-for="(m, idx) in milestones" :key="idx"
              :timestamp="m.time" :type="m.type" :hollow="m.status !== 'done'">
              <div class="zg-ct-milestone">
                <span class="zg-ct-milestone__title">{{ m.title }}</span>
                <span class="zg-ct-milestone__amount">¥{{ m.amount.toLocaleString() }}</span>
                <el-tag v-if="m.status === 'done'" size="small" type="success" effect="plain">已完成</el-tag>
                <el-tag v-else-if="m.status === 'doing'" size="small" type="warning" effect="plain">进行中</el-tag>
                <el-tag v-else size="small" effect="plain">待执行</el-tag>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
    </div>

    <!-- 下方四 Tab -->
    <div class="zg-ct-detail__tabs-wrap">
      <el-tabs v-model="activeTab" class="zg-ct-detail__tabs">
        <!-- Tab 1 付款计划 -->
        <el-tab-pane label="付款计划" name="payment">
          <el-table :data="paymentPlan" stripe border>
            <el-table-column prop="phase" label="付款阶段" width="140" />
            <el-table-column prop="ratio" label="比例" width="90" align="center">
              <template #default="{ row }">{{ row.ratio }}%</template>
            </el-table-column>
            <el-table-column label="金额" width="140" align="right">
              <template #default="{ row }">¥{{ row.amount.toLocaleString() }}</template>
            </el-table-column>
            <el-table-column prop="planDate" label="计划日期" width="120" />
            <el-table-column label="状态" width="110" align="center">
              <template #default="{ row }">
                <span class="zg-status-pill" :class="'zg-status-pill--' + row.statusKey">
                  <i class="dot"></i>{{ row.statusLabel }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="说明" />
          </el-table>
        </el-tab-pane>

        <!-- Tab 2 履约记录 -->
        <el-tab-pane label="履约记录" name="records">
          <el-table :data="performanceRecords" stripe border>
            <el-table-column prop="time" label="时间" width="180" />
            <el-table-column prop="event" label="事件" width="160" />
            <el-table-column prop="detail" label="详情" min-width="240" />
            <el-table-column prop="operator" label="操作人" width="100" />
            <el-table-column label="关联金额" width="130" align="right">
              <template #default="{ row }">{{ row.amount ? '¥' + row.amount.toLocaleString() : '—' }}</template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- Tab 3 附件 -->
        <el-tab-pane label="附件资料" name="attachments">
          <div class="zg-ct-attachments">
            <div v-for="att in attachments" :key="att.name" class="zg-ct-attach-card">
              <div class="zg-ct-attach-card__icon" :class="att.type">
                <el-icon :size="28">
                  <Document v-if="att.type === 'pdf'" />
                  <PictureFilled v-else />
                </el-icon>
              </div>
              <div class="zg-ct-attach-card__body">
                <div class="zg-ct-attach-card__name">{{ att.name }}</div>
                <div class="zg-ct-attach-card__meta">{{ att.size }} · {{ att.uploadTime }} · {{ att.uploader }}</div>
              </div>
              <div class="zg-ct-attach-card__actions">
                <el-button link type="primary" size="small"><el-icon><Monitor /></el-icon>预览</el-button>
                <el-button link type="primary" size="small"><el-icon><Download /></el-icon>下载</el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- Tab 4 变更记录 -->
        <el-tab-pane label="变更记录" name="changes">
          <el-table :data="changeLogs" stripe border>
            <el-table-column prop="time" label="变更时间" width="180" />
            <el-table-column prop="type" label="变更类型" width="120" />
            <el-table-column prop="before" label="变更前" width="180" />
            <el-table-column prop="after" label="变更后" width="180" />
            <el-table-column prop="reason" label="变更原因" min-width="200" />
            <el-table-column prop="approver" label="审批人" width="100" />
          </el-table>
          <el-empty v-if="!changeLogs.length" description="暂无变更记录" />
        </el-tab-pane>
      </el-tabs>
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * 智光云枢 · 合同合同管理 · 合同详情
 * 根据路由参数 :id 定位合同，无数据时使用 mock 展示
 */
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Download, Edit, Printer, ArrowRight, Monitor, Document, Picture } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

// 演示合同（mock，完整闭环需接 ContractLedger 数据源）
const DEMO_CONTRACT = {
  id: 1, code: 'CT-PUR-2026-001', name: '岳麓区 LED 灯具采购框架合同',
  typeKey: 'purchase', typeLabel: '采购合同',
  partyA: '长沙市城市照明管理中心', partyB: '深圳洲明科技股份有限公司',
  amount: 28500000, signedAt: '2026-01-15',
  startDate: '2026-02-01', endDate: '2027-01-31',
  manager: '李明辉', statusKey: 'active', statusLabel: '生效中',
  daysLeft: 108
}

const focused = computed(() => DEMO_CONTRACT)

const activeTab = ref('payment')

// ============================================================
// 履约付款数据
// ============================================================
const paidAmount = computed(() => {
  const total = focused.value?.amount || 0
  return Math.round(total * 0.65)
})
const warrantyAmount = computed(() => {
  const total = focused.value?.amount || 0
  return Math.round(total * 0.05)
})
const pendingAmount = computed(() => {
  const total = focused.value?.amount || 0
  return total - paidAmount.value - warrantyAmount.value
})
const paidPct = computed(() => {
  const total = focused.value?.amount || 1
  return (paidAmount.value / total) * 100
})
const pendingPct = computed(() => {
  const total = focused.value?.amount || 1
  return (pendingAmount.value / total) * 100
})
const warrantyPct = computed(() => {
  const total = focused.value?.amount || 1
  return (warrantyAmount.value / total) * 100
})

// ============================================================
// 里程碑
// ============================================================
const milestones = ref([
  { title: '合同签订', amount: 0,     time: focused.value?.signDate || '2026-03-15', type: 'primary', status: 'done' },
  { title: '项目启动', amount: Math.round((focused.value?.amount || 0) * 0.2), time: '2026-04-01', type: 'success', status: 'done' },
  { title: '中期验收', amount: Math.round((focused.value?.amount || 0) * 0.35), time: '2026-08-15', type: 'success', status: 'done' },
  { title: '终验交付', amount: Math.round((focused.value?.amount || 0) * 0.4), time: '2027-03-15', type: 'warning', status: 'doing' },
  { title: '质保期满', amount: warrantyAmount.value, time: '2028-03-15', type: 'info', status: 'pending' }
])

// ============================================================
// 付款计划（mock 4 条）
// ============================================================
const paymentPlan = ref([
  { phase: '首付款（启动）', ratio: 20, amount: Math.round((focused.value?.amount || 0) * 0.2), planDate: '2026-04-05', statusKey: 'paid',  statusLabel: '已支付', remark: '合同签订后 10 日内支付' },
  { phase: '中期款',         ratio: 35, amount: Math.round((focused.value?.amount || 0) * 0.35), planDate: '2026-08-20', statusKey: 'paid',  statusLabel: '已支付', remark: '中期验收合格后 15 日内支付' },
  { phase: '终验款',         ratio: 40, amount: Math.round((focused.value?.amount || 0) * 0.4), planDate: '2027-03-20', statusKey: 'pending', statusLabel: '待支付', remark: '终验交付后支付' },
  { phase: '质保金',         ratio: 5,  amount: warrantyAmount.value, planDate: '2028-03-20', statusKey: 'warranty', statusLabel: '质保金', remark: '质保期满后一次性支付' }
])

// ============================================================
// 履约记录（mock 3 条）
// ============================================================
const performanceRecords = ref([
  { time: '2026-08-15 14:30', event: '中期验收', detail: '项目中期验收合格，已通过监理方审核', operator: '张海涛', amount: Math.round((focused.value?.amount || 0) * 0.35) },
  { time: '2026-04-02 09:15', event: '项目启动', detail: '召开启动会，各方确认工期、质量标准和安全要求', operator: '王建国', amount: Math.round((focused.value?.amount || 0) * 0.2) },
  { time: '2026-03-18 11:00', event: '合同签署', detail: '甲乙双方完成合同盖章签署，正式生效', operator: '王建国', amount: 0 }
])

// ============================================================
// 附件（mock 2 个）
// ============================================================
const attachments = ref([
  { name: '合同正本_岳麓区LED灯具采购框架合同.pdf',    type: 'pdf',  size: '2.4 MB', uploadTime: '2026-03-15 16:20', uploader: '王建国' },
  { name: '合同附件_技术规范书.pdf',                      type: 'pdf',  size: '5.1 MB', uploadTime: '2026-03-15 16:25', uploader: '王建国' }
])

// ============================================================
// 变更记录（暂无变更）
// ============================================================
const changeLogs = ref<any[]>([])

// ============================================================
// 工具
// ============================================================
function typeTagType(typeKey: string): '' | 'info' | 'warning' | 'danger' | 'success' {
  const map: Record<string, '' | 'info' | 'warning' | 'danger' | 'success'> = {
    purchase: '', ops: 'success', engineering: 'warning', outsourcing: 'info', vehicle: 'danger'
  }
  return map[typeKey] || ''
}
</script>

<style scoped lang="scss">
.zg-ct-detail {
  --zg-brand-primary: #d97706;
  --zg-success: #059669;
  --zg-warning: #d97706;
  --zg-danger: #dc2626;
  --zg-info: #0284c7;
  --zg-success-soft: #d1fae5;
  --zg-warning-soft: #fef3c7;
  --zg-danger-soft: #fee2e2;
  --zg-info-soft: #e0f2fe;
  --zg-line-soft: rgba(241,245,249,0.8);
  --zg-ink-primary: #18181b;
  --zg-ink-secondary: #52525b;
  --zg-ink-tertiary: #71717a;
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
    display: flex; justify-content: space-between; align-items: flex-start;
    margin-bottom: 20px; padding: 18px 22px;
    background: linear-gradient(135deg, #fffbeb, #fff);
    border-radius: var(--zg-radius-lg);
    border: 1px solid var(--zg-line-soft);
  }
  &__headline { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  &__back { color: var(--zg-ink-tertiary); padding: 0; }
  &__title { margin: 0; font-size: 22px; font-weight: 700; color: var(--zg-ink-primary); }
  &__code-badge {
    font-family: 'Geist Mono', ui-monospace, monospace;
    font-size: 12px; font-weight: 600;
    padding: 3px 10px; border-radius: var(--zg-radius-sm);
    background: #fef3c7; color: var(--zg-brand-primary);
  }
  &__cta { display: flex; gap: 10px; }

  &__split {
    display: grid; grid-template-columns: 1fr 1fr; gap: 18px;
    margin-bottom: 18px;
  }
  &__info, &__progress { display: flex; flex-direction: column; gap: 14px; }

  &__card {
    background: #fff; border: 1px solid var(--zg-line-soft);
    border-radius: var(--zg-radius-lg); padding: 18px 20px;
  }
  &__section-title {
    font-size: 15px; font-weight: 600; color: var(--zg-ink-primary);
    margin: 0 0 14px; padding-left: 10px; border-left: 3px solid var(--zg-brand-primary);
  }
  &__subtitle {
    font-size: 14px; font-weight: 600; color: var(--zg-ink-secondary);
    margin: 20px 0 12px;
  }

  &__descs {
    :deep(.el-descriptions__label) {
      font-weight: 500; color: var(--zg-ink-tertiary); width: 120px; font-size: 13px;
    }
    :deep(.el-descriptions__content) { font-size: 14px; }
  }
}

.zg-ct-mono { font-family: 'Geist Mono', ui-monospace, monospace; font-weight: 600; }
.zg-ct-sub-info { color: var(--zg-ink-tertiary); font-size: 12px; margin-left: 6px; }
.zg-ct-amount-big {
  font-size: 18px; font-weight: 700; color: var(--zg-brand-primary);
  font-variant-numeric: tabular-nums;
}
.zg-ct-range-sep { margin: 0 6px; color: var(--zg-ink-tertiary); }

.zg-ct-clause {
  display: flex; flex-direction: column; gap: 12px;
  &__item { display: flex; gap: 14px; font-size: 13px; }
  &__label { color: var(--zg-ink-tertiary); min-width: 72px; flex-shrink: 0; }
  &__value { color: var(--zg-ink-primary); line-height: 1.5; }
}

// 履约进度
.zg-ct-progress-summary {
  display: flex; align-items: center; gap: 6px; margin-bottom: 16px;
}
.zg-ct-progress-cell {
  flex: 1; display: flex; flex-direction: column; gap: 4px;
  background: var(--zg-surface-muted); border-radius: var(--zg-radius-md);
  padding: 12px; text-align: center;
  .lbl { font-size: 11px; color: var(--zg-ink-tertiary); }
  .num { font-size: 15px; font-weight: 700; font-variant-numeric: tabular-nums; }
  &--total    .num { color: var(--zg-ink-primary); }
  &--paid     .num { color: var(--zg-success); }
  &--pending  .num { color: var(--zg-warning); }
  &--warranty .num { color: var(--zg-info); }
}
.zg-ct-progress-arrow {
  flex-shrink: 0; color: var(--zg-ink-tertiary);
}

.zg-ct-progress-bar-wrap { margin-bottom: 6px; }
.zg-ct-progress-bar {
  display: flex; height: 32px; border-radius: var(--zg-radius-md);
  overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.04);
}
.zg-ct-progress-seg {
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 600; color: #fff;
  transition: width 300ms ease;
  &--paid     { background: linear-gradient(135deg, #059669, #10b981); }
  &--pending  { background: linear-gradient(135deg, #d97706, #f59e0b); }
  &--warranty { background: linear-gradient(135deg, #0284c7, #38bdf8); }
  .seg-label { white-space: nowrap; }
}

// 里程碑
.zg-ct-milestone {
  display: flex; align-items: center; gap: 10px;
  &__title { font-weight: 500; flex: 1; }
  &__amount {
    font-family: 'Geist Mono', ui-monospace, monospace;
    font-size: 12px; color: var(--zg-ink-secondary);
  }
}

// 状态 pill
.zg-status-pill {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 12px; padding: 2px 10px; border-radius: var(--zg-radius-pill);
  font-weight: 500;
  .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
  &--draft      { color: var(--zg-info); background: var(--zg-info-soft); }
  &--active     { color: var(--zg-success); background: var(--zg-success-soft); }
  &--expired    { color: var(--zg-danger); background: var(--zg-danger-soft); }
  &--terminated { color: var(--zg-ink-tertiary); background: #f1f5f9; }
  &--paid       { color: var(--zg-success); background: var(--zg-success-soft); }
  &--pending    { color: var(--zg-warning); background: var(--zg-warning-soft); }
  &--warranty   { color: var(--zg-info); background: var(--zg-info-soft); }
}

.zg-ct-days {
  font-weight: 500; font-variant-numeric: tabular-nums; font-size: 13px;
  &--na { color: var(--zg-ink-tertiary); opacity: 0.6; }
  &--urgent { color: var(--zg-danger); animation: ctDaysPulse 1.5s ease-in-out infinite; font-weight: 700; }
  &--expired { color: var(--zg-danger); }
}
@keyframes ctDaysPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

// 附件
.zg-ct-attachments {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 14px; padding: 4px 0;
}
.zg-ct-attach-card {
  display: flex; align-items: center; gap: 14px;
  padding: 14px; background: var(--zg-surface-muted);
  border-radius: var(--zg-radius-md); border: 1px solid var(--zg-line-soft);
  transition: all 200ms ease;
  &:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
  &__icon {
    width: 52px; height: 52px; border-radius: var(--zg-radius-md);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    &.pdf { background: #fee2e2; color: var(--zg-danger); }
    &.image { background: var(--zg-info-soft); color: var(--zg-info); }
  }
  &__body { flex: 1; min-width: 0; }
  &__name { font-size: 14px; font-weight: 600; color: var(--zg-ink-primary);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  &__meta { font-size: 12px; color: var(--zg-ink-tertiary); margin-top: 4px; }
  &__actions { display: flex; flex-direction: column; gap: 2px; flex-shrink: 0; }
}

// Tabs wrap
.zg-ct-detail__tabs-wrap {
  background: #fff; border: 1px solid var(--zg-line-soft);
  border-radius: var(--zg-radius-lg); padding: 18px 20px;
}
</style>
