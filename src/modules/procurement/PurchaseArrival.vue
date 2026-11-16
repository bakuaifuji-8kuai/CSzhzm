<!--
  智光云枢 · 采购管理 · 到货验收
  卡片列表：每个订单一张卡 → 行内"登记到货"按钮 → Dialog 填写到货信息
-->
<template>
  <section class="zg-pm-arrival">
    <header class="zg-pm-arrival__head">
      <div class="zg-pm-arrival__headline">
        <div class="zg-pm-arrival__sigil"><el-icon :size="22"><BoxChecked /></el-icon></div>
        <div class="zg-pm-arrival__copy">
          <h1>到货验收</h1>
          <p>共 {{ allCards.length }} 笔到货单 · 待验收 {{ kpiAgg.pendingCheck }} ·
            验收中 {{ kpiAgg.checking }} · 合格 {{ kpiAgg.pass }} · 不合格 {{ kpiAgg.fail }}</p>
        </div>
      </div>
      <div class="zg-pm-arrival__cta">
        <el-button type="primary"><el-icon><Plus /></el-icon>登记到货</el-button>
        <el-button plain><el-icon><Download /></el-icon>导出</el-button>
      </div>
    </header>

    <!-- KPI 四卡 -->
    <div class="zg-pm-arrival__kpi">
      <div v-for="k in kpiCells" :key="k.key" class="zg-kpi-cell" :class="k.theme">
        <div class="zg-kpi-cell__icon"><el-icon :size="20"><component :is="k.icon" /></el-icon></div>
        <div class="zg-kpi-cell__body">
          <span class="zg-kpi-cell__num">{{ k.value }}</span>
          <span class="zg-kpi-cell__lbl">{{ k.label }}</span>
        </div>
      </div>
    </div>

    <!-- 筛选条 -->
    <div class="zg-pm-arrival__filterbar">
      <div class="zg-filter-row">
        <div class="zg-filter-item">
          <span class="zg-filter-item__lbl">验收状态</span>
          <el-select v-model="filters.status" placeholder="全部" clearable class="zg-filter-select">
            <el-option label="待验收"   value="pending" />
            <el-option label="验收中"   value="checking" />
            <el-option label="合格"     value="pass" />
            <el-option label="不合格"   value="fail" />
            <el-option label="部分合格" value="partial" />
          </el-select>
        </div>
        <div class="zg-filter-item">
          <span class="zg-filter-item__lbl">供应商</span>
          <el-select v-model="filters.supplier" placeholder="全部供应商" clearable class="zg-filter-select">
            <el-option v-for="s in supplierOptions" :key="s.code" :label="`${s.code} ${s.name}`" :value="s.code" />
          </el-select>
        </div>
        <div class="zg-filter-item">
          <span class="zg-filter-item__lbl">搜索</span>
          <el-input v-model="filters.keyword" placeholder="订单号 / 合同号" clearable class="zg-filter-input">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </div>
        <div class="zg-filter-item zg-filter-item--actions">
          <el-button @click="onReset"><el-icon><Refresh /></el-icon>重置</el-button>
        </div>
      </div>
    </div>

    <!-- 卡片列表 -->
    <div class="zg-pm-arrival__grid">
      <article
        v-for="card in filteredCards"
        :key="card.id"
        class="zg-pm-arrival__card"
        :class="'zg-pm-arrival__card--' + card.statusKey"
      >
        <div class="zg-pm-arrival__card-head">
          <div class="zg-pm-arrival__card-no">
            <span class="zg-pm-code">{{ card.orderNo }}</span>
            <span class="zg-pm-subcode">合同 {{ card.contractNo }}</span>
          </div>
          <span class="zg-status-pill" :class="'zg-status-pill--' + card.statusKey">
            <i class="dot"></i>{{ card.statusLabel }}
          </span>
        </div>

        <div class="zg-pm-arrival__card-body">
          <div class="zg-pm-arrival__info">
            <div class="zg-pm-arrival__info-item">
              <el-icon><School /></el-icon>
              <span class="zg-pm-arrival__info-label">供应商</span>
              <span class="zg-pm-arrival__info-value">{{ card.supplierCode }} {{ card.supplierName }}</span>
            </div>
            <div class="zg-pm-arrival__info-item">
              <el-icon><Box /></el-icon>
              <span class="zg-pm-arrival__info-label">到货数量</span>
              <span class="zg-pm-arrival__info-value zg-pm-arrival__qty">
                {{ card.arriveQty }} / {{ card.totalQty }} {{ card.unit }}
              </span>
            </div>
            <div class="zg-pm-arrival__info-item">
              <el-icon><Truck /></el-icon>
              <span class="zg-pm-arrival__info-label">到货日期</span>
              <span class="zg-pm-arrival__info-value">{{ card.arriveDate }}</span>
            </div>
            <div class="zg-pm-arrival__info-item">
              <el-icon><Document /></el-icon>
              <span class="zg-pm-arrival__info-label">签收人</span>
              <span class="zg-pm-arrival__info-value">{{ card.receiver || '—' }}</span>
            </div>
          </div>

          <!-- 进度条 -->
          <div v-if="card.statusKey === 'checking'" class="zg-pm-arrival__progress">
            <div class="zg-pm-arrival__progress-head">
              <span>抽检进度</span>
              <span>{{ card.checkProgress }}%</span>
            </div>
            <el-progress :percentage="card.checkProgress" :stroke-width="6"
              :color="card.checkProgress < 50 ? '#d97706' : '#059669'" :show-text="false" />
          </div>

          <!-- 备注 -->
          <div v-if="card.remark" class="zg-pm-arrival__remark">
            <el-icon><Warning /></el-icon>
            <span>{{ card.remark }}</span>
          </div>
        </div>

        <div class="zg-pm-arrival__card-foot">
          <el-button
            v-if="card.statusKey === 'pending' || card.statusKey === 'checking'"
            type="primary"
            size="small"
            @click="openDialog(card)"
          >
            <el-icon><Edit /></el-icon>登记到货
          </el-button>
          <el-button
            v-if="card.statusKey === 'pass' || card.statusKey === 'partial'"
            type="success"
            plain
            size="small"
          >
            <el-icon><CircleCheck /></el-icon>验收入库
          </el-button>
          <el-button
            v-if="card.statusKey === 'fail'"
            type="danger"
            plain
            size="small"
          >
            <el-icon><Warning /></el-icon>退货处理
          </el-button>
          <el-button link type="primary" size="small">详情</el-button>
        </div>
      </article>
    </div>

    <!-- 登记到货 Dialog -->
    <el-dialog
      v-model="dialogVisible"
      title="登记到货"
      width="520px"
      class="zg-pm-arrival__dialog"
    >
      <div v-if="currentCard" class="zg-pm-arrival__dialog-head">
        <span class="zg-pm-code">{{ currentCard.orderNo }}</span>
        <span class="zg-pm-arrival__dialog-supplier">{{ currentCard.supplierName }}</span>
      </div>

      <el-form :model="form" label-width="100px" label-position="right">
        <el-form-item label="到货数量">
          <el-input-number v-model="form.qty" :min="0" :max="currentCard?.totalQty || 0"
            :step="1" controls-position="right" style="width: 200px" />
          <span class="zg-pm-arrival__qty-hint">单位：{{ currentCard?.unit || '件' }}，
            合计：{{ currentCard?.totalQty || 0 }}</span>
        </el-form-item>
        <el-form-item label="到货日期">
          <el-date-picker v-model="form.date" type="date" placeholder="选择日期"
            value-format="YYYY-MM-DD" style="width: 200px" />
        </el-form-item>
        <el-form-item label="抽检结果">
          <el-radio-group v-model="form.result">
            <el-radio value="pass">合格</el-radio>
            <el-radio value="partial">部分合格</el-radio>
            <el-radio value="fail">不合格</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="不合格数量" v-if="form.result !== 'pass'">
          <el-input-number v-model="form.failQty" :min="0" :max="form.qty || 0"
            controls-position="right" style="width: 200px" />
        </el-form-item>
        <el-form-item label="签收人">
          <el-input v-model="form.receiver" placeholder="请输入签收人姓名" style="width: 200px" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="3"
            placeholder="填写到货备注、抽检说明等" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onSubmit">提交登记</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Box, Plus, Download, Search, Refresh, Warning, School, Promotion, Document, CircleCheck, Edit, List, Check, Close, Clock } from '@element-plus/icons-vue'

interface ArrivalCard {
  id: number
  orderNo: string
  contractNo: string
  supplierCode: string
  supplierName: string
  totalQty: number
  arriveQty: number
  unit: string
  arriveDate: string
  receiver: string
  statusKey: 'pending' | 'checking' | 'pass' | 'fail' | 'partial'
  statusLabel: string
  checkProgress: number
  remark: string
}

const supplierOptions = [
  { code: 'SUP-001', name: '深圳洲明科技股份有限公司' },
  { code: 'SUP-002', name: '上海三思电子工程有限公司' },
  { code: 'SUP-003', name: '长沙华电电气设备有限公司' },
  { code: 'SUP-004', name: '湖南光明照明工程有限公司' },
  { code: 'SUP-005', name: '长沙光服运维服务有限公司' },
  { code: 'SUP-006', name: '中联重科车辆销售分公司' },
]

const allCards = ref<ArrivalCard[]>([
  { id: 1, orderNo: 'PO-202610-012', contractNo: 'HT-2026-0075', supplierCode: 'SUP-001', supplierName: '深圳洲明科技股份有限公司', totalQty: 200, arriveQty: 200, unit: '套', arriveDate: '2026-10-28', receiver: '王师傅',  statusKey: 'pass',    statusLabel: '合格',     checkProgress: 100, remark: '' },
  { id: 2, orderNo: 'PO-202611-001', contractNo: 'HT-2026-0087', supplierCode: 'SUP-001', supplierName: '深圳洲明科技股份有限公司', totalQty: 200, arriveQty: 0,   unit: '套', arriveDate: '',           receiver: '',        statusKey: 'pending', statusLabel: '待验收',   checkProgress: 0,   remark: '预计 11-25 到货' },
  { id: 3, orderNo: 'PO-202611-002', contractNo: 'HT-2026-0090', supplierCode: 'SUP-003', supplierName: '长沙华电电气设备有限公司',   totalQty: 5000, arriveQty: 5000, unit: '米', arriveDate: '2026-11-19', receiver: '李工',    statusKey: 'pass',    statusLabel: '合格',     checkProgress: 100, remark: '' },
  { id: 4, orderNo: 'PO-202611-004', contractNo: 'HT-2026-0095', supplierCode: 'SUP-005', supplierName: '长沙光服运维服务有限公司',   totalQty: 12,   arriveQty: 12,   unit: '月', arriveDate: '2026-11-14', receiver: '张经理',  statusKey: 'pass',    statusLabel: '合格',     checkProgress: 100, remark: '' },
  { id: 5, orderNo: 'PO-202611-005', contractNo: 'HT-2026-0098', supplierCode: 'SUP-002', supplierName: '上海三思电子工程有限公司',   totalQty: 300,  arriveQty: 0,    unit: '台', arriveDate: '',           receiver: '',        statusKey: 'pending', statusLabel: '待验收',   checkProgress: 0,   remark: '' },
  { id: 6, orderNo: 'PO-202611-006', contractNo: 'HT-2026-0101', supplierCode: 'SUP-004', supplierName: '湖南光明照明工程有限公司',   totalQty: 200,  arriveQty: 198,  unit: '套', arriveDate: '2026-11-17', receiver: '赵队长',  statusKey: 'partial', statusLabel: '部分合格', checkProgress: 100, remark: '抽检 2 套外壳破损，待补发' },
  { id: 7, orderNo: 'PO-202611-009', contractNo: 'HT-2026-0108', supplierCode: 'SUP-003', supplierName: '长沙华电电气设备有限公司',   totalQty: 80,   arriveQty: 80,   unit: '台', arriveDate: '2026-11-13', receiver: '陈工',    statusKey: 'fail',    statusLabel: '不合格',   checkProgress: 100, remark: '抽检发现 5 台电流不达标，已通知供应商退货' },
  { id: 8, orderNo: 'PO-202611-010', contractNo: 'HT-2026-0110', supplierCode: 'SUP-006', supplierName: '中联重科车辆销售分公司',     totalQty: 2,    arriveQty: 1,    unit: '辆', arriveDate: '2026-11-15', receiver: '刘主任',  statusKey: 'checking', statusLabel: '验收中',  checkProgress: 60,  remark: '第二辆预计下周到货' },
])

const filters = reactive({
  status: '',
  supplier: '',
  keyword: ''
})

const filteredCards = computed(() => {
  let list = allCards.value
  if (filters.status) list = list.filter(c => c.statusKey === filters.status)
  if (filters.supplier) list = list.filter(c => c.supplierCode === filters.supplier)
  if (filters.keyword.trim()) {
    const kw = filters.keyword.trim().toUpperCase()
    list = list.filter(c => c.orderNo.includes(kw) || c.contractNo.includes(kw))
  }
  return list
})

const kpiAgg = computed(() => {
  const rows = allCards.value
  return {
    pendingCheck: rows.filter(r => r.statusKey === 'pending').length,
    checking: rows.filter(r => r.statusKey === 'checking').length,
    pass: rows.filter(r => r.statusKey === 'pass').length,
    fail: rows.filter(r => r.statusKey === 'fail').length
  }
})

const kpiCells = computed(() => [
  { key: 'pending',  label: '待验收',   value: kpiAgg.value.pendingCheck, icon: Clock,      theme: 'info' },
  { key: 'checking', label: '验收中',   value: kpiAgg.value.checking,      icon: List,       theme: 'warn' },
  { key: 'pass',     label: '合格',     value: kpiAgg.value.pass,          icon: Check,      theme: 'success' },
  { key: 'fail',     label: '不合格',   value: kpiAgg.value.fail,          icon: Close,      theme: 'danger' },
])

// Dialog
const dialogVisible = ref(false)
const currentCard = ref<ArrivalCard | null>(null)
const form = reactive({
  qty: 0,
  date: '',
  result: 'pass' as 'pass' | 'partial' | 'fail',
  failQty: 0,
  receiver: '',
  remark: ''
})

function openDialog(card: ArrivalCard) {
  currentCard.value = card
  form.qty = card.totalQty
  form.date = new Date().toISOString().slice(0, 10)
  form.result = 'pass'
  form.failQty = 0
  form.receiver = ''
  form.remark = ''
  dialogVisible.value = true
}

watch(() => form.result, (v) => {
  if (v === 'pass') form.failQty = 0
})

function onSubmit() {
  if (!currentCard.value) return
  if (!form.receiver.trim()) {
    ElMessage.warning('请填写签收人')
    return
  }
  if (!form.date) {
    ElMessage.warning('请选择到货日期')
    return
  }
  const idx = allCards.value.findIndex(c => c.id === currentCard.value!.id)
  if (idx >= 0) {
    let statusKey: ArrivalCard['statusKey'] = 'checking'
    if (form.result === 'pass') statusKey = 'pass'
    else if (form.result === 'fail') statusKey = 'fail'
    else statusKey = 'partial'
    const statusLabelMap = { pass: '合格', fail: '不合格', partial: '部分合格', pending: '待验收', checking: '验收中' } as const
    allCards.value[idx] = {
      ...allCards.value[idx],
      arriveQty: form.qty,
      arriveDate: form.date,
      receiver: form.receiver,
      statusKey,
      statusLabel: statusLabelMap[statusKey],
      checkProgress: form.result === 'pass' ? 100 : (form.result === 'fail' ? 100 : 70),
      remark: form.remark
    }
  }
  dialogVisible.value = false
  ElMessage.success('到货登记已提交')
}

function onReset() {
  filters.status = ''
  filters.supplier = ''
  filters.keyword = ''
}
</script>

<style scoped lang="scss">
.zg-pm-arrival {
  --zg-primary: #7c3aed;
  --zg-success: #059669;
  --zg-warning: #d97706;
  --zg-danger:  #dc2626;
  --zg-info:    #0284c7;
  --zg-ink-primary: #18181b;
  --zg-ink-secondary: #52525b;
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
    background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%);
    color: #fff; display: flex; align-items: center; justify-content: center;
  }
  &__copy h1 { font-size: 20px; font-weight: 600; margin: 0; }
  &__copy p { font-size: 13px; color: var(--zg-ink-tertiary); margin: 4px 0 0; }
  &__cta { display: flex; gap: 10px; }

  &__kpi {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 14px; margin-bottom: 18px;
  }

  &__filterbar {
    background: #fff; border: 1px solid var(--zg-line-soft);
    border-radius: 12px; padding: 14px 16px; margin-bottom: 18px;
  }

  &__grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    gap: 16px;
  }

  &__card {
    background: #fff; border: 1px solid var(--zg-line-soft);
    border-radius: 14px; padding: 18px;
    transition: all 250ms cubic-bezier(0.4,0,0.2,1);
    display: flex; flex-direction: column; gap: 14px;
    border-left: 4px solid #cbd5e1;
    &:hover { transform: translateY(-3px); box-shadow: 0 10px 30px -10px rgba(15,23,42,0.15); }

    &--pending  { border-left-color: var(--zg-info); }
    &--checking { border-left-color: var(--zg-warning); }
    &--pass     { border-left-color: var(--zg-success); }
    &--fail     { border-left-color: var(--zg-danger); }
    &--partial  { border-left-color: var(--zg-primary); }
  }

  &__card-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }
  &__card-no { display: flex; flex-direction: column; gap: 2px; }
  &__subcode { font-size: 11px; font-family: monospace; color: var(--zg-ink-tertiary); }

  &__card-body { flex: 1; display: flex; flex-direction: column; gap: 12px; }
  &__info { display: flex; flex-direction: column; gap: 8px; }
  &__info-item {
    display: flex; align-items: center; gap: 8px;
    font-size: 13px;
    .el-icon { color: var(--zg-ink-tertiary); font-size: 14px; }
  }
  &__info-label { color: var(--zg-ink-tertiary); flex-shrink: 0; min-width: 56px; }
  &__info-value { color: var(--zg-ink-primary); font-weight: 500; flex: 1; }
  &__qty { font-family: 'Geist Mono', ui-monospace, monospace; font-variant-numeric: tabular-nums; }

  &__progress-head { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; color: var(--zg-ink-secondary); }

  &__remark {
    display: flex; gap: 6px; align-items: flex-start;
    font-size: 12px; color: var(--zg-danger);
    background: #fef2f2; padding: 8px 10px; border-radius: 8px;
    line-height: 1.5;
    .el-icon { margin-top: 2px; flex-shrink: 0; }
  }

  &__card-foot {
    display: flex; gap: 8px; flex-wrap: wrap;
    padding-top: 12px; border-top: 1px dashed var(--zg-line-soft);
  }

  &__dialog-head { display: flex; gap: 10px; margin-bottom: 12px; align-items: center; }
  &__dialog-supplier { font-size: 13px; color: var(--zg-ink-secondary); }

  &__qty-hint { font-size: 12px; color: var(--zg-ink-tertiary); margin-left: 10px; }
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
  &.danger::before  { background: var(--zg-danger); }

  &__icon {
    width: 42px; height: 42px; border-radius: 10px;
    background: var(--zg-primary); color: #fff;
    display: flex; align-items: center; justify-content: center;
  }
  .success &__icon { background: var(--zg-success); }
  .info    &__icon { background: var(--zg-info); }
  .warn    &__icon { background: var(--zg-warning); }
  .danger  &__icon { background: var(--zg-danger); }
  &__body { display: flex; flex-direction: column; gap: 4px; }
  &__num { font-size: 22px; font-weight: 700; line-height: 1.1; font-variant-numeric: tabular-nums; }
  &__lbl { font-size: 12px; color: var(--zg-ink-tertiary); }
}

.zg-filter-row { display: flex; flex-wrap: wrap; align-items: center; gap: 14px 20px; }
.zg-filter-item {
  display: flex; align-items: center; gap: 8px;
  &__lbl { font-size: 12px; color: var(--zg-ink-tertiary); flex-shrink: 0; }
  &--actions { margin-left: auto; }
}
.zg-filter-select { width: 220px; }
.zg-filter-input { width: 240px; }

.zg-pm-code { font-family: 'Geist Mono', ui-monospace, monospace; font-size: 12px; font-weight: 600; color: var(--zg-ink-secondary); }

.zg-status-pill {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 12px; padding: 2px 10px; border-radius: 999px; font-weight: 500;
  .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
  &--pending  { color: var(--zg-info);    background: #e0f2fe; }
  &--checking { color: var(--zg-warning); background: #fef3c7; }
  &--pass     { color: var(--zg-success); background: #d1fae5; }
  &--fail     { color: var(--zg-danger);   background: #fee2e2; }
  &--partial  { color: var(--zg-primary); background: #ede9fe; }
}
</style>
