<!--
  智光云枢 · 外包商管理 · 外包商合同绑定
  左侧外包商列表 → 右侧该外包商合同卡
  底部新增合同（绑定已有 contract 模块合同号）
  关联 supplier/SUP-005、contract/HT-2026-xxx
-->
<template>
  <section class="zg-om-contract">
    <header class="zg-om-contract__head">
      <div class="zg-om-contract__headline">
        <div class="zg-om-contract__sigil"><el-icon :size="22"><Link /></el-icon></div>
        <div class="zg-om-contract__copy">
          <h1 class="zg-om-contract__title">外包商合同绑定</h1>
          <p class="zg-om-contract__sub">
            共 {{ allBindings.length }} 条绑定 ·
            覆盖 {{ distinctOutsourcers }} 家外包商 ·
            合同总额 ¥{{ totalAmount.toLocaleString() }}
          </p>
        </div>
      </div>
      <div class="zg-om-contract__cta">
        <el-button type="primary" :icon="Plus" @click="openBindDialog">
          新增合同绑定
        </el-button>
      </div>
    </header>

    <!-- 主体：左列表 + 右合同卡 -->
    <div class="zg-om-contract__main">
      <!-- 左侧外包商列表 -->
      <aside class="zg-om-contract__left">
        <div class="zg-om-contract__lefthead">
          <span class="zg-om-contract__lefttitle">外包商列表</span>
          <el-input v-model="leftKeyword" size="small" placeholder="搜索" class="zg-om-contract__leftsearch">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </div>
        <div class="zg-om-contract__leftbody">
          <div
            v-for="oc in filteredOutsourcers"
            :key="oc.id"
            class="zg-om-outsourceitem"
            :class="{ active: selectedOutsourcerId === oc.id }"
            @click="selectedOutsourcerId = oc.id"
          >
            <div class="zg-om-outsourceitem__level" :class="'zg-om-level--' + oc.level">{{ oc.level }}</div>
            <div class="zg-om-outsourceitem__body">
              <div class="zg-om-outsourceitem__name">{{ oc.name }}</div>
              <div class="zg-om-outsourceitem__meta">
                <span>{{ oc.code }}</span>
                <span class="zg-sep">·</span>
                <span>{{ oc.contractCount }} 份合同</span>
              </div>
            </div>
            <div class="zg-om-outsourceitem__arrow">
              <el-icon><ArrowRight /></el-icon>
            </div>
          </div>
          <div v-if="!filteredOutsourcers.length" class="zg-om-emptyhint">未找到外包商</div>
        </div>
      </aside>

      <!-- 右侧合同卡 -->
      <main class="zg-om-contract__right">
        <div v-if="currentOutsourcer" class="zg-om-contract__righthead">
          <div class="zg-om-contract__righttitle">
            <h2>{{ currentOutsourcer.name }}</h2>
            <p>{{ currentOutsourcer.code }} · {{ currentOutsourcer.categoryLabel }} · 共 {{ currentBindings.length }} 份合同</p>
          </div>
          <div class="zg-om-contract__rightstats">
            <div class="zg-om-stat">
              <span class="zg-om-stat__lbl">合同总额</span>
              <span class="zg-om-stat__val">¥{{ currentStats.amount.toLocaleString() }}</span>
            </div>
            <div class="zg-om-stat">
              <span class="zg-om-stat__lbl">已付款</span>
              <span class="zg-om-stat__val paid">¥{{ currentStats.paid.toLocaleString() }}</span>
            </div>
            <div class="zg-om-stat">
              <span class="zg-om-stat__lbl">待付款</span>
              <span class="zg-om-stat__val unpaid">¥{{ currentStats.unpaid.toLocaleString() }}</span>
            </div>
            <div class="zg-om-stat">
              <span class="zg-om-stat__lbl">平均执行率</span>
              <span class="zg-om-stat__val">{{ currentStats.avgExec }}%</span>
            </div>
          </div>
        </div>
        <div v-else class="zg-om-contract__rightempty">
          <el-icon :size="48" color="#cbd5e1"><Pointer /></el-icon>
          <p>请从左侧选择一家外包商</p>
        </div>

        <div v-if="currentOutsourcer" class="zg-om-contract__cards">
          <article v-for="b in currentBindings" :key="b.id" class="zg-om-contractcard" :class="'zg-om-contractcard--' + b.statusKey">
            <div class="zg-om-contractcard__head">
              <span class="zg-om-contractcard__code">{{ b.contractNo }}</span>
              <span class="zg-status-pill" :class="'zg-status-pill--' + b.statusKey">
                <i class="dot"></i>{{ b.statusLabel }}
              </span>
            </div>
            <div class="zg-om-contractcard__body">
              <div class="zg-om-contractcard__type">
                <el-tag size="small" type="info" effect="plain">{{ b.contractType }}</el-tag>
              </div>
              <div class="zg-om-contractcard__amount">¥{{ b.amount.toLocaleString() }}</div>
              <div class="zg-om-contractcard__period">
                <el-icon><Clock /></el-icon>
                {{ b.startDate }} → {{ b.endDate }}
              </div>
              <div class="zg-om-contractcard__pay">
                <div class="zg-om-pay-row">
                  <span class="zg-om-pay-row__lbl">已付款</span>
                  <span class="zg-om-pay-row__val paid">¥{{ b.paid.toLocaleString() }}</span>
                </div>
                <div class="zg-om-pay-row">
                  <span class="zg-om-pay-row__lbl">待付款</span>
                  <span class="zg-om-pay-row__val unpaid">¥{{ b.unpaid.toLocaleString() }}</span>
                </div>
              </div>
              <div class="zg-om-contractcard__exec">
                <div class="zg-om-contractcard__execlbl">
                  执行率
                  <span :class="execRate(b.execRate)">{{ b.execRate }}%</span>
                </div>
                <el-progress :percentage="b.execRate" :stroke-width="8" :color="execColor(b.execRate)" />
              </div>
            </div>
            <div class="zg-om-contractcard__foot">
              <el-button type="primary" link size="small" @click="onGotoContract(b)">查看合同</el-button>
              <el-button link size="small" @click="onEditBinding(b)">编辑绑定</el-button>
              <el-button type="danger" link size="small" @click="onUnbind(b)">解绑</el-button>
            </div>
          </article>

          <div v-if="!currentBindings.length" class="zg-om-emptyhint">该外包商暂无合同绑定</div>
        </div>
      </main>
    </div>

    <!-- 新增合同绑定 Dialog -->
    <el-dialog v-model="bindDialogVisible" title="新增合同绑定" width="520px" :close-on-click-modal="false">
      <el-form :model="bindForm" label-width="110px" :rules="bindRules" ref="bindFormRef">
        <el-form-item label="外包商" prop="outsourceId">
          <el-select v-model="bindForm.outsourceId" placeholder="选择外包商" filterable style="width: 100%">
            <el-option v-for="oc in ALL_OUTSOURCERS" :key="oc.id" :label="oc.name" :value="oc.id">
              <span>{{ oc.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 12px">{{ oc.code }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="合同号" prop="contractNo">
          <el-select v-model="bindForm.contractNo" placeholder="从 contract 模块选择已有合同" filterable style="width: 100%">
            <el-option
              v-for="c in availableContracts"
              :key="c.no"
              :label="`${c.no} · ${c.name}`"
              :value="c.no"
              :disabled="c.bound"
            >
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <div>
                  <div style="font-weight:600;font-size:13px;">{{ c.no }}</div>
                  <div style="font-size:11px;color:#8492a6;">{{ c.name }} · {{ c.type }} · ¥{{ c.amount.toLocaleString() }}</div>
                </div>
                <el-tag v-if="c.bound" size="small" type="info">已绑定</el-tag>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="bindForm.remark" type="textarea" :rows="2" placeholder="可选填写备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="bindDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onConfirmBind">确认绑定</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
/**
 * 智光云枢 · 外包商管理 · 外包商合同绑定
 */
import { ref, reactive, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  Link, Plus, Search, ArrowRight, Clock, Pointer
} from "@element-plus/icons-vue"

const route = useRoute()
const router = useRouter()

// ============================================================
// 类型
// ============================================================
type Level = 'A' | 'B' | 'C'
type BindingStatus = 'executing' | 'finished' | 'pending' | 'expired'

interface OutsourceLite {
  id: number
  code: string
  name: string
  categoryLabel: string
  level: Level
  supplierCode?: string
}

interface ContractBinding {
  id: number
  outsourceId: number
  contractNo: string
  contractName: string
  contractType: string
  amount: number
  startDate: string
  endDate: string
  paid: number
  unpaid: number
  execRate: number
  statusKey: BindingStatus
  statusLabel: string
  remark?: string
}

interface ContractOption {
  no: string
  name: string
  type: string
  amount: number
  bound: boolean
}

// ============================================================
// Mock 外包商（列表用）
// ============================================================
const ALL_OUTSOURCERS: OutsourceLite[] = [
  { id: 1, code: 'OUT-2026-001', name: '长沙光服运维服务有限公司', categoryLabel: '运维外包', level: 'A', supplierCode: 'SUP-005' },
  { id: 2, code: 'OUT-2026-002', name: '岳阳恒通工程有限公司',       categoryLabel: '工程外包', level: 'B', supplierCode: 'SUP-012' },
  { id: 3, code: 'OUT-2026-003', name: '湘潭明辉检测技术有限公司',   categoryLabel: '检测外包', level: 'A', supplierCode: 'SUP-018' },
  { id: 4, code: 'OUT-2026-004', name: '株洲信达运维有限公司',       categoryLabel: '运维外包', level: 'B', supplierCode: 'SUP-024' },
  { id: 5, code: 'OUT-2026-005', name: '衡阳鸿远建设工程有限公司',   categoryLabel: '工程外包', level: 'C', supplierCode: 'SUP-031' },
  { id: 6, code: 'OUT-2026-006', name: '常德安恒检测咨询有限公司',   categoryLabel: '检测外包', level: 'B', supplierCode: 'SUP-036' }
]

// ============================================================
// Mock 合同绑定（8 条）
// ============================================================
const ALL_BINDINGS = ref<ContractBinding[]>([
  {
    id: 1, outsourceId: 1, contractNo: 'HT-2026-001', contractName: '长沙城区照明运维服务合同',
    contractType: '运维服务', amount: 3600000, startDate: '2026-01-01', endDate: '2026-12-31',
    paid: 2100000, unpaid: 1500000, execRate: 58, statusKey: 'executing', statusLabel: '执行中'
  },
  {
    id: 2, outsourceId: 1, contractNo: 'HT-2026-045', contractName: '长沙高新区路灯维保补充协议',
    contractType: '运维补充', amount: 580000, startDate: '2026-05-01', endDate: '2026-10-31',
    paid: 580000, unpaid: 0, execRate: 100, statusKey: 'finished', statusLabel: '已完成'
  },
  {
    id: 3, outsourceId: 1, contractNo: 'HT-2026-089', contractName: '长沙经开区智慧照明升级运维',
    contractType: '运维服务', amount: 960000, startDate: '2026-08-01', endDate: '2027-07-31',
    paid: 160000, unpaid: 800000, execRate: 22, statusKey: 'executing', statusLabel: '执行中'
  },
  {
    id: 4, outsourceId: 2, contractNo: 'HT-2026-031', contractName: '岳阳岳阳楼区亮化工程总承包',
    contractType: '工程施工', amount: 8500000, startDate: '2026-03-15', endDate: '2026-11-30',
    paid: 5100000, unpaid: 3400000, execRate: 72, statusKey: 'executing', statusLabel: '执行中'
  },
  {
    id: 5, outsourceId: 2, contractNo: 'HT-2026-078', contractName: '岳阳君山区路灯改造项目',
    contractType: '工程施工', amount: 2300000, startDate: '2026-07-01', endDate: '2026-12-31',
    paid: 460000, unpaid: 1840000, execRate: 35, statusKey: 'executing', statusLabel: '执行中'
  },
  {
    id: 6, outsourceId: 3, contractNo: 'HT-2026-055', contractName: '湘潭全市照明设施年度检测',
    contractType: '技术检测', amount: 420000, startDate: '2026-06-01', endDate: '2027-05-31',
    paid: 210000, unpaid: 210000, execRate: 50, statusKey: 'executing', statusLabel: '执行中'
  },
  {
    id: 7, outsourceId: 4, contractNo: 'HT-2026-022', contractName: '株洲荷塘区路灯日常运维',
    contractType: '运维服务', amount: 1800000, startDate: '2026-02-01', endDate: '2027-01-31',
    paid: 1050000, unpaid: 750000, execRate: 65, statusKey: 'executing', statusLabel: '执行中'
  },
  {
    id: 8, outsourceId: 5, contractNo: 'HT-2026-071', contractName: '衡阳雁峰区背街小巷照明改造',
    contractType: '工程施工', amount: 680000, startDate: '2026-07-10', endDate: '2026-11-30',
    paid: 204000, unpaid: 476000, execRate: 30, statusKey: 'executing', statusLabel: '执行中'
  }
])

// ============================================================
// 可选合同（来自 contract 模块的 mock）
// ============================================================
const ALL_CONTRACT_OPTIONS: ContractOption[] = [
  { no: 'HT-2026-001', name: '长沙城区照明运维服务合同',       type: '运维服务', amount: 3600000, bound: true },
  { no: 'HT-2026-022', name: '株洲荷塘区路灯日常运维',          type: '运维服务', amount: 1800000, bound: true },
  { no: 'HT-2026-031', name: '岳阳岳阳楼区亮化工程总承包',      type: '工程施工', amount: 8500000, bound: true },
  { no: 'HT-2026-045', name: '长沙高新区路灯维保补充协议',      type: '运维补充', amount: 580000,   bound: true },
  { no: 'HT-2026-055', name: '湘潭全市照明设施年度检测',        type: '技术检测', amount: 420000,   bound: true },
  { no: 'HT-2026-071', name: '衡阳雁峰区背街小巷照明改造',      type: '工程施工', amount: 680000,   bound: true },
  { no: 'HT-2026-078', name: '岳阳君山区路灯改造项目',          type: '工程施工', amount: 2300000,  bound: true },
  { no: 'HT-2026-088', name: '常德鼎城区智慧灯杆建设项目',      type: '工程施工', amount: 3100000,  bound: false },
  { no: 'HT-2026-089', name: '长沙经开区智慧照明升级运维',      type: '运维服务', amount: 960000,   bound: true },
  { no: 'HT-2026-112', name: '长沙岳麓区节日亮化维保',          type: '运维补充', amount: 320000,   bound: false },
  { no: 'HT-2026-118', name: '衡阳市城区照明设施检测项目',      type: '技术检测', amount: 280000,   bound: false },
  { no: 'HT-2026-123', name: '株洲芦淞区照明节能改造总承包',    type: '工程施工', amount: 5400000,  bound: false }
]

// ============================================================
// 状态
// ============================================================
const selectedOutsourcerId = ref<number>(1)
const leftKeyword = ref('')
const bindDialogVisible = ref(false)
const bindFormRef = ref<FormInstance>()

const bindForm = reactive({
  outsourceId: null as number | null,
  contractNo: '',
  remark: ''
})

const bindRules: FormRules = {
  outsourceId: [{ required: true, message: '请选择外包商', trigger: 'change' }],
  contractNo: [{ required: true, message: '请选择合同号', trigger: 'change' }]
}

// 初始化：如果 URL 带 outsourceCode，自动选中
watch(() => route.query.outsourceCode, (code) => {
  if (code) {
    const oc = ALL_OUTSOURCERS.find(o => o.code === code)
    if (oc) selectedOutsourcerId.value = oc.id
  }
}, { immediate: true })

// ============================================================
// 计算
// ============================================================
// 左侧列表（带合同数量）
const filteredOutsourcers = computed(() => {
  const kw = leftKeyword.value.trim().toLowerCase()
  const list = kw
    ? ALL_OUTSOURCERS.filter(o => o.name.toLowerCase().includes(kw) || o.code.toLowerCase().includes(kw))
    : ALL_OUTSOURCERS
  return list.map(o => ({
    ...o,
    contractCount: ALL_BINDINGS.value.filter(b => b.outsourceId === o.id).length
  }))
})

// 头部统计
const distinctOutsourcers = computed(() => new Set(ALL_BINDINGS.value.map(b => b.outsourceId)).size)
const totalAmount = computed(() => ALL_BINDINGS.value.reduce((a, b) => a + b.amount, 0))

const currentOutsourcer = computed(() =>
  ALL_OUTSOURCERS.find(o => o.id === selectedOutsourcerId.value) || null
)

const currentBindings = computed(() =>
  ALL_BINDINGS.value.filter(b => b.outsourceId === selectedOutsourcerId.value)
)

const currentStats = computed(() => {
  const bs = currentBindings.value
  const amount = bs.reduce((a, b) => a + b.amount, 0)
  const paid = bs.reduce((a, b) => a + b.paid, 0)
  const unpaid = bs.reduce((a, b) => a + b.unpaid, 0)
  const avgExec = bs.length
    ? Math.round(bs.reduce((a, b) => a + b.execRate, 0) / bs.length)
    : 0
  return { amount, paid, unpaid, avgExec }
})

// availableContracts 从 ALL_CONTRACT_OPTIONS 派生
const availableContracts = computed<ContractOption[]>(() => {
  const boundNos = new Set(ALL_BINDINGS.value.map(b => b.contractNo))
  return ALL_CONTRACT_OPTIONS.map(c => ({ ...c, bound: boundNos.has(c.no) }))
})

// ============================================================
// 工具
// ============================================================
function execRate(r: number) {
  if (r >= 80) return 'exec-high'
  if (r >= 50) return 'exec-mid'
  return 'exec-low'
}
function execColor(r: number) {
  if (r >= 80) return '#059669'
  if (r >= 50) return '#d97706'
  return '#dc2626'
}

// ============================================================
// 动作
// ============================================================
function openBindDialog() {
  bindForm.outsourceId = selectedOutsourcerId.value
  bindForm.contractNo = ''
  bindForm.remark = ''
  bindDialogVisible.value = true
}

async function onConfirmBind() {
  if (!bindFormRef.value) return
  try {
    await bindFormRef.value.validate()
  } catch { return }

  const opt = ALL_CONTRACT_OPTIONS.find(c => c.no === bindForm.contractNo)
  if (!opt) return

  const newId = Math.max(0, ...ALL_BINDINGS.value.map(b => b.id)) + 1
  const now = new Date()
  const start = `${now.getFullYear()}-01-01`
  const end = `${now.getFullYear()}-12-31`
  ALL_BINDINGS.value.push({
    id: newId,
    outsourceId: bindForm.outsourceId!,
    contractNo: opt.no,
    contractName: opt.name,
    contractType: opt.type,
    amount: opt.amount,
    startDate: start,
    endDate: end,
    paid: 0,
    unpaid: opt.amount,
    execRate: 0,
    statusKey: 'executing',
    statusLabel: '执行中',
    remark: bindForm.remark || undefined
  })
  bindDialogVisible.value = false
  ElMessage.success(`已绑定合同 ${opt.no}`)
}

function onGotoContract(b: ContractBinding) {
  router.push({ path: '/contract/detail', query: { contractNo: b.contractNo } })
}
function onEditBinding(b: ContractBinding) {
  ElMessage.info(`编辑合同 ${b.contractNo} 的绑定信息`)
}
function onUnbind(b: ContractBinding) {
  ElMessageBox.confirm(`确认解绑外包商合同 ${b.contractNo}？解绑后不影响合同本身。`, '解绑确认', {
    type: 'warning', confirmButtonText: '确认解绑', cancelButtonText: '取消'
  }).then(() => {
    const idx = ALL_BINDINGS.value.findIndex(x => x.id === b.id)
    if (idx >= 0) ALL_BINDINGS.value.splice(idx, 1)
    ElMessage.success('已解绑')
  }).catch(() => {})
}

</script>

<style scoped lang="scss">
.zg-om-contract {
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
  --zg-ink-tertiary: #71717a;
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

  &__main {
    display: grid; grid-template-columns: 300px 1fr;
    gap: 18px; align-items: start;
  }

  &__left {
    background: #fff; border: 1px solid var(--zg-line-soft);
    border-radius: var(--zg-radius-lg); overflow: hidden;
    position: sticky; top: 24px;
  }
  &__lefthead {
    padding: 14px 16px; border-bottom: 1px solid var(--zg-line-soft);
    display: flex; flex-direction: column; gap: 10px;
  }
  &__lefttitle { font-size: 14px; font-weight: 600; }
  &__leftsearch { width: 100%; }
  &__leftbody { max-height: 640px; overflow-y: auto; }

  &__right {
    background: #fff; border: 1px solid var(--zg-line-soft);
    border-radius: var(--zg-radius-lg); padding: 20px;
  }
  &__righthead {
    display: flex; justify-content: space-between; align-items: center;
    padding-bottom: 18px; margin-bottom: 18px;
    border-bottom: 1px solid var(--zg-line-soft);
    gap: 16px; flex-wrap: wrap;
  }
  &__righttitle h2 { margin: 0 0 4px; font-size: 18px; }
  &__righttitle p { margin: 0; font-size: 12px; color: var(--zg-ink-tertiary); }
  &__rightstats { display: flex; gap: 18px; flex-wrap: wrap; }
  &__rightempty {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    height: 400px; color: var(--zg-ink-tertiary); gap: 10px;
  }

  &__cards {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 16px;
  }
}

.zg-om-outsourceitem {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 16px; cursor: pointer;
  transition: all 180ms ease;
  border-bottom: 1px solid var(--zg-line-soft);
  &:last-child { border-bottom: none; }
  &:hover { background: var(--zg-surface-muted, #f8fafc); }
  &.active {
    background: linear-gradient(90deg, #fef3c7 0%, #fffbeb 100%);
    border-left: 3px solid var(--zg-brand-primary);
    padding-left: 13px;
  }
  &__level {
    width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-weight: 800; font-size: 14px; letter-spacing: 1px;
    &--A { background: var(--zg-success-soft); color: var(--zg-success); }
    &--B { background: var(--zg-warning-soft); color: var(--zg-warning); }
    &--C { background: var(--zg-danger-soft); color: var(--zg-danger); }
  }
  &__body { flex: 1; min-width: 0; }
  &__name { font-weight: 600; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  &__meta { font-size: 11px; color: var(--zg-ink-tertiary); margin-top: 3px;
    .zg-sep { margin: 0 4px; color: #cbd5e1; }
  }
  &__arrow { color: #cbd5e1; transition: color 180ms; }
  &.active &__arrow { color: var(--zg-brand-primary); }
}

.zg-om-stat {
  display: flex; flex-direction: column; align-items: flex-end; gap: 4px;
  padding: 8px 16px; background: #f8fafc; border-radius: var(--zg-radius-md);
  min-width: 130px;
  &__lbl { font-size: 11px; color: var(--zg-ink-tertiary); }
  &__val { font-size: 16px; font-weight: 700; font-variant-numeric: tabular-nums; }
  &__val.paid   { color: var(--zg-success); }
  &__val.unpaid { color: var(--zg-danger); }
}

.zg-om-contractcard {
  background: #fff; border: 1px solid var(--zg-line-soft);
  border-radius: var(--zg-radius-md); padding: 16px;
  transition: all 220ms ease;
  border-top: 3px solid #cbd5e1;
  display: flex; flex-direction: column; gap: 12px;
  &:hover { transform: translateY(-2px); box-shadow: 0 8px 24px -8px rgba(15,23,42,0.12); }
  &--executing { border-top-color: var(--zg-brand-primary); }
  &--finished  { border-top-color: var(--zg-success); }
  &--pending   { border-top-color: var(--zg-info); }
  &--expired   { border-top-color: var(--zg-danger); opacity: 0.85; }

  &__head {
    display: flex; justify-content: space-between; align-items: center;
  }
  &__code {
    font-family: 'Geist Mono', ui-monospace, monospace;
    font-size: 12px; font-weight: 700; color: var(--zg-brand-primary);
  }
  &__body { display: flex; flex-direction: column; gap: 8px; }
  &__amount { font-size: 22px; font-weight: 700; font-variant-numeric: tabular-nums; line-height: 1.2; }
  &__period {
    display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--zg-ink-tertiary);
    .el-icon { font-size: 13px; }
  }
  &__type { display: flex; justify-content: flex-end; }
  &__pay {
    display: flex; justify-content: space-between; padding: 8px 12px;
    background: #f8fafc; border-radius: var(--zg-radius-sm);
  }
  &-pay-row {
    display: flex; flex-direction: column; align-items: flex-start; gap: 2px;
    &__lbl { font-size: 11px; color: var(--zg-ink-tertiary); }
    &__val { font-size: 13px; font-weight: 700; font-variant-numeric: tabular-nums; }
    &__val.paid   { color: var(--zg-success); }
    &__val.unpaid { color: var(--zg-danger); }
  }
  &__exec { display: flex; flex-direction: column; gap: 6px; }
  &__execlbl {
    display: flex; justify-content: space-between; font-size: 12px; color: var(--zg-ink-tertiary);
    span:last-child { font-weight: 700; color: #18181b; }
    .exec-high { color: var(--zg-success); }
    .exec-mid  { color: var(--zg-warning); }
    .exec-low  { color: var(--zg-danger); }
  }
  &__foot {
    display: flex; justify-content: flex-end; gap: 4px;
    padding-top: 10px; border-top: 1px dashed var(--zg-line-soft);
  }
}

.zg-status-pill {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 11px; padding: 2px 10px; border-radius: var(--zg-radius-pill);
  font-weight: 500;
  .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
  &--executing { color: var(--zg-brand-primary); background: #fffbeb; }
  &--finished  { color: var(--zg-success);    background: var(--zg-success-soft); }
  &--pending   { color: var(--zg-info);       background: var(--zg-info-soft); }
  &--expired   { color: var(--zg-danger);     background: var(--zg-danger-soft); }
}

.zg-om-emptyhint {
  text-align: center; padding: 40px; color: var(--zg-ink-tertiary); font-size: 13px;
}
</style>
