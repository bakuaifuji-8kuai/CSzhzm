<!--
  智光云枢 · 合同合同管理 · 即将到期合同续期提醒
  卡片列表 + 剩余天数三色 + 批量续约入口
-->
<template>
  <section class="zg-ct-renew">
    <header class="zg-ct-renew__head">
      <div class="zg-ct-renew__headline">
        <div class="zg-ct-renew__sigil"><el-icon :size="22"><AlarmClock /></el-icon></div>
        <div class="zg-ct-renew__copy">
          <h1 class="zg-ct-renew__title">合同续期提醒</h1>
          <p class="zg-ct-renew__sub">
            即将到期合同 {{ renewList.length }} 份 ·
            <span class="urgent-count">紧急（≤30天）{{ urgentCount }} 份</span> ·
            <span class="warn-count">预警（≤90天）{{ warnCount }} 份</span>
          </p>
        </div>
      </div>
      <div class="zg-ct-renew__cta">
        <el-button plain @click="$router.push('/contract/ledger')">
          <el-icon><Document /></el-icon>前往台账
        </el-button>
      </div>
    </header>

    <!-- 筛选卡 -->
    <div class="zg-ct-renew__filter">
      <div class="zg-filter-row">
        <div class="zg-filter-item">
          <span class="zg-filter-item__lbl">到期日期范围</span>
          <el-date-picker
            v-model="filters.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            class="zg-filter-date"
            value-format="YYYY-MM-DD"
          />
        </div>
        <div class="zg-filter-item">
          <span class="zg-filter-item__lbl">紧急程度</span>
          <el-radio-group v-model="filters.urgency">
            <el-radio-button value="all">全部</el-radio-button>
            <el-radio-button value="urgent"><span class="dot dot-red"></span>≤30天</el-radio-button>
            <el-radio-button value="warn"><span class="dot dot-yellow"></span>≤90天</el-radio-button>
            <el-radio-button value="safe"><span class="dot dot-green"></span>>90天</el-radio-button>
          </el-radio-group>
        </div>
        <div class="zg-filter-item">
          <span class="zg-filter-item__lbl">关键词</span>
          <el-input v-model="filters.keyword" placeholder="合同名称/供应商" clearable
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

    <!-- 卡片网格 -->
    <div v-if="filteredList.length" class="zg-ct-renew__grid">
      <article v-for="item in filteredList" :key="item.id"
        class="zg-ct-renew-card" :class="'zg-ct-renew-card--' + urgencyClass(item.daysLeft)">
        <!-- 左侧倒计时 -->
        <div class="zg-ct-renew-card__countdown">
          <div class="zg-ct-renew-card__days">{{ item.daysLeft }}</div>
          <div class="zg-ct-renew-card__days-lbl">天后到期</div>
          <span class="zg-ct-renew-card__level">{{ urgencyLabel(item.daysLeft) }}</span>
        </div>

        <!-- 右侧信息 -->
        <div class="zg-ct-renew-card__body">
          <div class="zg-ct-renew-card__head">
            <h3 class="zg-ct-renew-card__name">{{ item.name }}</h3>
            <span class="zg-ct-renew-card__code">{{ item.code }}</span>
          </div>

          <div class="zg-ct-renew-card__meta">
            <span class="meta-item">
              <el-icon><School /></el-icon>
              {{ item.partyBName }}
            </span>
            <span class="meta-item">
              <el-icon><Money /></el-icon>
              ¥{{ item.amount.toLocaleString() }}
            </span>
            <span class="meta-item">
              <el-icon><Timer /></el-icon>
              到期 {{ item.endDate }}
            </span>
          </div>

          <!-- 进度：有效期 -->
          <div class="zg-ct-renew-card__progress">
            <el-progress :percentage="item.progress"
              :stroke-width="6"
              :show-text="false"
              :color="progressColor(item.daysLeft)" />
            <span class="zg-ct-renew-card__progress-text">
              有效期已过 {{ (100 - item.progress).toFixed(0) }}%
            </span>
          </div>
        </div>

        <!-- 操作区 -->
        <div class="zg-ct-renew-card__actions">
          <el-button
            :type="item.daysLeft <= 30 ? 'danger' : 'warning'"
            @click="onRenew(item)"
          >
            <el-icon><Refresh /></el-icon>
            发起续约
          </el-button>
          <el-button link type="primary" size="small" @click="onMonitor(item)">
            <el-icon><Monitor /></el-icon>查看
          </el-button>
        </div>
      </article>
    </div>

    <!-- 空状态 -->
    <el-empty v-else description="暂无即将到期的合同 🎉" />

    <!-- 底部批量续约入口 -->
    <div v-if="filteredList.length" class="zg-ct-renew__batch">
      <div class="zg-ct-renew__batch-info">
        <el-icon :size="20"><DocumentChecked /></el-icon>
        <span>
          已筛选 <strong>{{ filteredList.length }}</strong> 份即将到期合同，
          其中 <strong class="danger-text">{{ urgentCount }}</strong> 份紧急
        </span>
      </div>
      <el-button type="primary" size="large" @click="onBatchRenew">
        <el-icon><Promotion /></el-icon>一键批量发起续约
      </el-button>
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * 智光云枢 · 合同合同管理 · 即将到期合同续期提醒
 * 所有状态均从 ContractLedger 的 mock 数据派生，daysLeft ≤ 365 的生效中合同进入视图
 */
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { AlarmClock, Document, Search, Filter, Refresh, Money, Timer, School, Monitor, Promotion } from '@element-plus/icons-vue'

// demo mock（从 ContractLedger 数据派生完整闭环需接共享数据源）
const ALL_CONTRACTS = [
  { id: 1, code:'CT-PUR-2026-001', name:'岳麓区 LED 灯具采购框架合同', statusKey:'active', startDate:'2026-02-01', endDate:'2027-01-31', daysLeft:108, typeKey:'purchase', partyB:'深圳洲明科技股份有限公司', amount:28500000 },
  { id: 2, code:'CT-OPS-2026-003', name:'全市路灯日常运维服务合同', statusKey:'active', startDate:'2025-03-01', endDate:'2026-12-31', daysLeft:45, typeKey:'ops', partyB:'长沙光服运维服务有限公司', amount:9600000 },
  { id: 3, code:'CT-ENG-2026-007', name:'橘子洲亮化改造工程合同', statusKey:'active', startDate:'2026-03-15', endDate:'2026-12-20', daysLeft:34, typeKey:'engineering', partyB:'湖南光明照明工程有限公司', amount:12500000 },
  { id: 4, code:'CT-OPS-2025-012', name:'天心区路灯运维框架合同', statusKey:'active', startDate:'2024-12-01', endDate:'2026-11-30', daysLeft:14, typeKey:'ops', partyB:'长沙光服运维服务有限公司', amount:4800000 },
  { id: 5, code:'CT-ENG-2025-002', name:'五一大道亮化升级工程合同', statusKey:'active', startDate:'2025-06-01', endDate:'2026-11-20', daysLeft:4, typeKey:'engineering', partyB:'湖南光明照明工程有限公司', amount:8200000 },
  { id: 6, code:'CT-OUT-2026-010', name:'应急抢修外包服务合同', statusKey:'active', startDate:'2026-01-01', endDate:'2026-12-31', daysLeft:45, typeKey:'outsourcing', partyB:'岳阳恒通工程有限公司', amount:2800000 },
]

const router = useRouter()

// ============================================================
// 从台账派生即将到期合同（生效中 且 剩余天数 ≤ 365）
// ============================================================
const renewList = computed(() => {
  const now = new Date('2026-11-16')
  return ALL_CONTRACTS
    .filter(c => c.statusKey === 'active' && c.daysLeft !== null && c.daysLeft <= 365 && c.daysLeft >= 0)
    .map(c => {
      const start = new Date(c.startDate)
      const end = new Date(c.endDate)
      const total = end.getTime() - start.getTime()
      const elapsed = now.getTime() - start.getTime()
      const progress = Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)))
      return { ...c, progress }
    })
    .sort((a, b) => (a.daysLeft ?? 0) - (b.daysLeft ?? 0))
})

// ============================================================
// 筛选
// ============================================================
const filters = reactive({
  dateRange: null as [string, string] | null,
  urgency: 'all' as 'all' | 'urgent' | 'warn' | 'safe',
  keyword: ''
})

const filteredList = computed(() => {
  let list = renewList.value.slice()
  if (filters.dateRange && filters.dateRange.length === 2) {
    const [s, e] = filters.dateRange
    list = list.filter(item => item.endDate >= s && item.endDate <= e)
  }
  if (filters.urgency === 'urgent') list = list.filter(i => i.daysLeft <= 30)
  else if (filters.urgency === 'warn') list = list.filter(i => i.daysLeft <= 90)
  else if (filters.urgency === 'safe') list = list.filter(i => i.daysLeft > 90)
  if (filters.keyword.trim()) {
    const kw = filters.keyword.trim().toLowerCase()
    list = list.filter(i =>
      i.name.toLowerCase().includes(kw) ||
      i.partyBName.toLowerCase().includes(kw) ||
      i.code.toLowerCase().includes(kw)
    )
  }
  return list
})

const urgentCount = computed(() => renewList.value.filter(i => i.daysLeft <= 30).length)
const warnCount = computed(() => renewList.value.filter(i => i.daysLeft <= 90).length)

// ============================================================
// 工具函数
// ============================================================
function urgencyClass(days: number | null): 'red' | 'yellow' | 'green' {
  if (days === null) return 'green'
  if (days <= 30) return 'red'
  if (days <= 90) return 'yellow'
  return 'green'
}
function urgencyLabel(days: number | null): string {
  if (days === null) return '—'
  if (days <= 30) return '紧急'
  if (days <= 90) return '预警'
  return '安全'
}
function progressColor(days: number | null): string {
  if (days === null) return '#10b981'
  if (days <= 30) return '#dc2626'
  if (days <= 90) return '#f59e0b'
  return '#10b981'
}

// ============================================================
// 筛选控制
// ============================================================
function onFilterApply() { ElMessage.success('筛选已应用') }
function onFilterReset() {
  filters.dateRange = null
  filters.urgency = 'all'
  filters.keyword = ''
  ElMessage.info('已重置筛选条件')
}

// ============================================================
// 动作
// ============================================================
function onRenew(item: any) {
  ElMessageBox.confirm(
    `确认为《${item.name}》发起续约流程？<br>剩余有效期仅 <strong>${item.daysLeft}</strong> 天。`,
    '发起续约',
    {
      confirmButtonText: '确认发起',
      cancelButtonText: '稍后',
      type: 'warning',
      dangerouslyUseHTMLString: true
    }
  ).then(() => {
    ElMessage.success('续约申请已提交，合同台账状态将自动更新')
  }).catch(() => {})
}

function onMonitor(item: any) {
  router.push({ path: `/contract/detail/${item.id}` })
}

function onBatchRenew() {
  if (!filteredList.value.length) return
  ElMessageBox.confirm(
    `确认对筛选出的 <strong>${filteredList.value.length}</strong> 份合同批量发起续约？<br>` +
    `其中紧急（≤30天）<strong class="danger-text">${urgentCount.value}</strong> 份。`,
    '批量续约',
    {
      confirmButtonText: '确认批量发起',
      cancelButtonText: '取消',
      type: 'warning',
      dangerouslyUseHTMLString: true
    }
  ).then(() => {
    ElMessage.success(`已为 ${filteredList.value.length} 份合同批量生成续约申请草稿，请在待审批中确认`)
  }).catch(() => {})
}
</script>

<style scoped lang="scss">
.zg-ct-renew {
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
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 18px; padding-bottom: 16px; border-bottom: 1px solid var(--zg-line-soft);
  }
  &__headline { display: flex; align-items: center; gap: 14px; }
  &__sigil {
    width: 44px; height: 44px; border-radius: var(--zg-radius-md);
    background: var(--zg-gradient-primary); color: #fff;
    display: flex; align-items: center; justify-content: center;
  }
  &__copy { display: flex; flex-direction: column; gap: 4px; }
  &__title { margin: 0; font-size: 20px; font-weight: 600; }
  &__sub { margin: 0; font-size: 13px; color: var(--zg-ink-tertiary);
    .urgent-count { color: var(--zg-danger); font-weight: 600; margin-right: 10px; }
    .warn-count { color: var(--zg-warning); font-weight: 600; }
  }

  &__filter {
    background: #fff; border: 1px solid var(--zg-line-soft);
    border-radius: var(--zg-radius-lg); padding: 14px 16px;
    margin-bottom: 18px;
  }

  &__grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
    gap: 16px; margin-bottom: 18px;
  }

  &__batch {
    display: flex; justify-content: space-between; align-items: center;
    padding: 18px 22px; background: linear-gradient(135deg, #fffbeb, #fff);
    border-radius: var(--zg-radius-lg);
    border: 1px solid var(--zg-line-soft);
  }
  &__batch-info {
    display: flex; align-items: center; gap: 10px;
    font-size: 14px; color: var(--zg-ink-secondary);
    strong { color: var(--zg-brand-primary); }
    .danger-text { color: var(--zg-danger); }
  }
}

// 筛选条
.zg-filter-row { display: flex; flex-wrap: wrap; align-items: center; gap: 14px 20px; }
.zg-filter-item {
  display: flex; align-items: center; gap: 8px;
  &__lbl { font-size: 12px; color: var(--zg-ink-tertiary); flex-shrink: 0; }
  &--actions { margin-left: auto; }
}
.zg-filter-date { width: 280px; }
.zg-filter-input { width: 200px; }
.zg-filter-item :deep(.dot) {
  display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 4px;
  &.dot-red { background: var(--zg-danger); }
  &.dot-yellow { background: var(--zg-warning); }
  &.dot-green { background: var(--zg-success); }
}

// 续约卡片
.zg-ct-renew-card {
  background: #fff; border-radius: var(--zg-radius-lg);
  border: 1px solid var(--zg-line-soft);
  padding: 18px; display: flex; gap: 16px;
  transition: all 250ms cubic-bezier(0.4,0,0.2,1);
  position: relative; overflow: hidden;

  &::before {
    content: ''; position: absolute; left: 0; top: 0; width: 4px; height: 100%;
    background: var(--zg-ink-tertiary);
  }
  &--red::before    { background: var(--zg-danger); }
  &--yellow::before { background: var(--zg-warning); }
  &--green::before  { background: var(--zg-success); }

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 28px -12px rgba(15,23,42,0.18);
    border-color: var(--zg-brand-primary);
  }

  &__countdown {
    flex-shrink: 0; width: 110px; text-align: center;
    padding: 12px 0; border-radius: var(--zg-radius-md);
    background: var(--zg-surface-muted);
  }
  &--red    &__countdown { background: var(--zg-danger-soft); }
  &--yellow &__countdown { background: var(--zg-warning-soft); }
  &--green  &__countdown { background: var(--zg-success-soft); }

  &__days {
    font-size: 36px; font-weight: 800; line-height: 1;
    font-variant-numeric: tabular-nums;
    color: var(--zg-ink-primary);
  }
  &--red    &__days { color: var(--zg-danger); animation: renewDaysPulse 1.8s ease-in-out infinite; }
  &--yellow &__days { color: var(--zg-warning); }
  &--green  &__days { color: var(--zg-success); }
  @keyframes renewDaysPulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.75; transform: scale(0.95); }
  }
  &__days-lbl { font-size: 11px; color: var(--zg-ink-tertiary); margin-top: 4px; }
  &__level {
    display: inline-block; margin-top: 6px;
    font-size: 11px; font-weight: 600; padding: 1px 10px;
    border-radius: var(--zg-radius-pill);
  }
  &--red    &__level { color: var(--zg-danger);    background: #fff1f2; }
  &--yellow &__level { color: var(--zg-warning);   background: #fffbeb; }
  &--green  &__level { color: var(--zg-success);    background: #f0fdf4; }

  &__body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8px; }
  &__head {
    display: flex; justify-content: space-between; align-items: flex-start;
    gap: 8px;
  }
  &__name {
    margin: 0; font-size: 15px; font-weight: 600; color: var(--zg-ink-primary);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  &__code {
    flex-shrink: 0; font-family: 'Geist Mono', ui-monospace, monospace;
    font-size: 11px; color: var(--zg-ink-tertiary);
    padding: 2px 8px; background: var(--zg-surface-muted); border-radius: 4px;
  }

  &__meta { display: flex; flex-wrap: wrap; gap: 8px 16px; font-size: 12px; color: var(--zg-ink-secondary); }
  .meta-item { display: inline-flex; align-items: center; gap: 4px; }

  &__progress { display: flex; flex-direction: column; gap: 4px; }
  &__progress-text { font-size: 11px; color: var(--zg-ink-tertiary); }

  &__actions { display: flex; flex-direction: column; gap: 8px; justify-content: center; flex-shrink: 0; }
}
</style>
