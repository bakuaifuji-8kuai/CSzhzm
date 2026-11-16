<!--
  智光云枢 · 工程项目管理 · 施工进度
  左侧项目列表 + 右侧甘特 (el-progress 里程碑)
  里程碑：立项→招标→签约→进场→施工50%→施工100%→验收→结项
  下方：进度款支付节点 + 问题/风险清单
-->
<template>
  <section class="zg-pj-progress">
    <header class="zg-pj-progress__head">
      <div class="zg-pj-progress__headline">
        <div class="zg-pj-progress__sigil"><el-icon :size="22"><Timer /></el-icon></div>
        <div class="zg-pj-progress__copy">
          <h1 class="zg-pj-progress__title">施工进度跟踪</h1>
          <p class="zg-pj-progress__sub">
            实时跟踪 {{ projects.length }} 个项目里程碑 · 当前选中 {{ currentProject?.name || '-' }}
          </p>
        </div>
      </div>
    </header>

    <div class="zg-pj-progress__layout">
      <!-- 左侧项目列表 -->
      <aside class="zg-pj-progress__sidebar">
        <div class="zg-pj-progress__sidebar-head">
          <el-input v-model="keyword" placeholder="搜索项目名称/编号" clearable size="small">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </div>
        <ul class="zg-pj-progress__projectlist">
          <li v-for="p in filteredProjects" :key="p.id"
            class="zg-pj-progress__projectitem"
            :class="{ active: currentProject?.id === p.id }"
            @click="currentProject = p">
            <div class="zg-pj-progress__projectname">
              <span class="zg-pj-progress__code">{{ p.code }}</span>
              <span class="zg-pj-progress__name">{{ p.name }}</span>
            </div>
            <div class="zg-pj-progress__projectmeta">
              <span class="zg-pj-progress__status" :class="'zg-pj-progress__status--' + p.statusKey">
                {{ p.statusLabel }}
              </span>
              <el-progress :percentage="p.progress" :stroke-width="4" :show-text="false"
                :color="progressColor(p.progress)" class="zg-pj-progress__mini" />
            </div>
          </li>
        </ul>
      </aside>

      <!-- 右侧甘特 + 详情 -->
      <main class="zg-pj-progress__content" v-if="currentProject">
        <!-- 项目概况 -->
        <div class="zg-pj-progress__overview">
          <div class="zg-pj-progress__ovcard">
            <div class="zg-pj-progress__ovlabel">项目名称</div>
            <div class="zg-pj-progress__ovvalue">{{ currentProject.name }}</div>
          </div>
          <div class="zg-pj-progress__ovcard">
            <div class="zg-pj-progress__ovlabel">乙方承包商</div>
            <div class="zg-pj-progress__ovvalue">{{ currentProject.contractorName }}</div>
          </div>
          <div class="zg-pj-progress__ovcard">
            <div class="zg-pj-progress__ovlabel">合同号</div>
            <div class="zg-pj-progress__ovvalue">{{ currentProject.contractCode }}</div>
          </div>
          <div class="zg-pj-progress__ovcard">
            <div class="zg-pj-progress__ovlabel">计划周期</div>
            <div class="zg-pj-progress__ovvalue">{{ currentProject.planStart }} ~ {{ currentProject.planEnd }}</div>
          </div>
          <div class="zg-pj-progress__ovcard zg-pj-progress__ovcard--highlight">
            <div class="zg-pj-progress__ovlabel">总体进度</div>
            <div class="zg-pj-progress__ovvalue">{{ currentProject.progress }}%</div>
          </div>
        </div>

        <!-- 里程碑甘特 -->
        <div class="zg-pj-progress__gantt">
          <h3 class="zg-pj-progress__sectiontitle">
            <el-icon><TrendCharts /></el-icon> 里程碑甘特图
          </h3>
          <div class="zg-pj-progress__ganttbody">
            <div v-for="(m, idx) in currentProject.milestones" :key="idx"
              class="zg-pj-progress__milestone">
              <div class="zg-pj-progress__mstone-head">
                <span class="zg-pj-progress__mstone-name">{{ m.name }}</span>
                <span class="zg-pj-progress__mstone-date">计划: {{ m.planDate }}</span>
              </div>
              <div class="zg-pj-progress__mstone-bar">
                <div class="zg-pj-progress__mstone-track">
                  <div class="zg-pj-progress__mstone-fill"
                    :style="{ width: m.percent + '%' }"
                    :class="'zg-pj-progress__mstone-fill--' + m.status"></div>
                  <div class="zg-pj-progress__mstone-node"
                    :class="'zg-pj-progress__mstone-node--' + m.status"></div>
                </div>
                <span class="zg-pj-progress__mstone-status"
                  :class="'zg-pj-progress__mstone-status--' + m.status">
                  {{ m.statusLabel }}
                </span>
              </div>
              <div v-if="m.actualDate && m.actualDate !== m.planDate" class="zg-pj-progress__mstone-actual">
                实际: {{ m.actualDate }}
              </div>
            </div>
          </div>
        </div>

        <!-- 下方两栏 -->
        <div class="zg-pj-progress__bottom">
          <!-- 进度款支付节点 -->
          <div class="zg-pj-progress__payments">
            <h3 class="zg-pj-progress__sectiontitle">
              <el-icon><Money /></el-icon> 进度款支付节点
              <span class="zg-pj-progress__subinfo">关联合同 {{ currentProject.contractCode }}</span>
            </h3>
            <el-table :data="currentProject.payments" border stripe size="small">
              <el-table-column prop="node" label="支付节点" width="150" />
              <el-table-column label="节点条件" show-overflow-tooltip />
              <el-table-column prop="percent" label="比例" width="70" align="center">
                <template #default="{ row }">{{ row.percent }}%</template>
              </el-table-column>
              <el-table-column label="金额(万)" width="100" align="right">
                <template #default="{ row }">¥{{ (row.amount / 10000).toFixed(0) }}</template>
              </el-table-column>
              <el-table-column label="状态" width="90" align="center">
                <template #default="{ row }">
                  <span class="zg-status-pill zg-status-pill--sm" :class="'zg-status-pill--' + row.status">
                    <i class="dot"></i>{{ row.statusLabel }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="实际日期" width="110">
                <template #default="{ row }">{{ row.actualDate || '-' }}</template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 问题/风险清单 -->
          <div class="zg-pj-progress__risks">
            <h3 class="zg-pj-progress__sectiontitle">
              <el-icon><Warning /></el-icon> 问题/风险清单
              <el-tag size="small" type="danger" style="margin-left:8px">{{ currentProject.risks.length }}</el-tag>
            </h3>
            <div v-if="!currentProject.risks.length" class="zg-pj-progress__empty">
              <el-empty description="暂无问题与风险" :image-size="60" />
            </div>
            <div v-else class="zg-pj-progress__risklist">
              <div v-for="(r, idx) in currentProject.risks" :key="idx"
                class="zg-pj-progress__riskitem" :class="'zg-pj-progress__riskitem--' + r.level">
                <div class="zg-pj-progress__risklevel">
                  <el-icon><Warning /></el-icon>
                </div>
                <div class="zg-pj-progress__riskbody">
                  <div class="zg-pj-progress__risktitle">{{ r.title }}</div>
                  <div class="zg-pj-progress__riskdesc">{{ r.desc }}</div>
                  <div class="zg-pj-progress__riskmeta">
                    <span>{{ r.owner }}</span>
                    <span>{{ r.date }}</span>
                    <el-tag size="small" :type="resolveTagType(r.status)">{{ r.statusLabel }}</el-tag>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * 智光云枢 · 工程项目管理 · 施工进度
 */
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  Timer, Search, TrendCharts, Money, Warning
} from '@element-plus/icons-vue'

const route = useRoute()

// ============================================================
// 供应商映射
// ============================================================
const SUPPLIER_NAME_MAP: Record<string, string> = {
  'SUP-001': '深圳洲明科技股份有限公司',
  'SUP-002': '上海三思电子工程有限公司',
  'SUP-003': '长沙华电电气设备有限公司',
  'SUP-004': '湖南光明照明工程有限公司',
  'SUP-005': '长沙光服运维服务有限公司',
  'SUP-006': '中联重科车辆销售分公司',
}

// ============================================================
// 类型
// ============================================================
interface Milestone {
  name: string
  planDate: string
  actualDate: string
  percent: number
  status: 'done' | 'doing' | 'todo' | 'delay'
  statusLabel: string
}
interface Payment {
  node: string
  condition: string
  percent: number
  amount: number
  status: 'done' | 'doing' | 'todo'
  statusLabel: string
  actualDate: string
}
interface Risk {
  title: string
  desc: string
  level: 'high' | 'medium' | 'low'
  owner: string
  date: string
  status: 'open' | 'processing' | 'closed'
  statusLabel: string
}
interface ProjectProgress {
  id: number
  code: string
  name: string
  contractorCode: string
  contractorName: string
  contractCode: string
  planStart: string
  planEnd: string
  statusKey: string
  statusLabel: string
  progress: number
  milestones: Milestone[]
  payments: Payment[]
  risks: Risk[]
}

// ============================================================
// Mock 项目 (5 个，每个 6~8 里程碑)
// ============================================================
const projects = ref<ProjectProgress[]>([
  {
    id: 1, code: 'PJ-CS-2026-001', name: '橘子洲景区 LED 照明改造工程',
    contractorCode: 'SUP-004', contractorName: SUPPLIER_NAME_MAP['SUP-004'],
    contractCode: 'HT-2026-003',
    planStart: '2026-05-10', planEnd: '2026-09-30',
    statusKey: 'construction', statusLabel: '施工中', progress: 62,
    milestones: [
      { name: '立项',   planDate: '2026-04-01', actualDate: '2026-04-03', percent: 100, status: 'done',  statusLabel: '已完成' },
      { name: '招标',   planDate: '2026-04-15', actualDate: '2026-04-20', percent: 100, status: 'done',  statusLabel: '已完成' },
      { name: '签约',   planDate: '2026-05-05', actualDate: '2026-05-08', percent: 100, status: 'done',  statusLabel: '已完成' },
      { name: '进场',   planDate: '2026-05-10', actualDate: '2026-05-12', percent: 100, status: 'done',  statusLabel: '已完成' },
      { name: '施工50%', planDate: '2026-07-15', actualDate: '2026-07-12', percent: 100, status: 'done',  statusLabel: '已完成' },
      { name: '施工100%', planDate: '2026-09-15', actualDate: '',            percent: 62,  status: 'doing', statusLabel: '进行中' },
      { name: '验收',   planDate: '2026-09-25', actualDate: '',            percent: 0,   status: 'todo',  statusLabel: '待开始' },
      { name: '结项',   planDate: '2026-09-30', actualDate: '',            percent: 0,   status: 'todo',  statusLabel: '待开始' }
    ],
    payments: [
      { node: '预付款 10%',    condition: '合同签订后 7 天内',       percent: 10, amount: 860000,  status: 'done',  statusLabel: '已支付', actualDate: '2026-05-15' },
      { node: '进度款 30%',    condition: '进场施工后 30 天内',      percent: 30, amount: 2580000, status: 'done',  statusLabel: '已支付', actualDate: '2026-06-20' },
      { node: '进度款 30%',    condition: '施工量达 50%',             percent: 30, amount: 2580000, status: 'done',  statusLabel: '已支付', actualDate: '2026-07-20' },
      { node: '进度款 20%',    condition: '施工量达 100%',            percent: 20, amount: 1720000, status: 'doing', statusLabel: '申请中', actualDate: '' },
      { node: '质保金 10%',    condition: '验收合格满 2 年',          percent: 10, amount: 860000,  status: 'todo',  statusLabel: '待支付', actualDate: '' }
    ],
    risks: [
      { title: '橘子洲岛施工用电接驳临时方案变更', desc: '原计划从南岸引电，现需协调岛内专用变压器，预计延误 5~7 天',
        level: 'high', owner: '陈总（SUP-004）', date: '2026-08-10', status: 'processing', statusLabel: '处理中' },
      { title: '夏季高温施工人员防护', desc: '长沙 8 月日均气温 36℃，需调整作业时段并增加防暑物资',
        level: 'medium', owner: '张海涛（业主）', date: '2026-08-01', status: 'closed',     statusLabel: '已关闭' }
    ]
  },
  {
    id: 2, code: 'PJ-CS-2026-002', name: '五一大道城市亮化提升工程',
    contractorCode: 'SUP-001', contractorName: SUPPLIER_NAME_MAP['SUP-001'],
    contractCode: 'HT-2026-011',
    planStart: '2026-07-01', planEnd: '2027-01-31',
    statusKey: 'construction', statusLabel: '施工中', progress: 38,
    milestones: [
      { name: '立项',   planDate: '2026-05-15', actualDate: '2026-05-18', percent: 100, status: 'done',  statusLabel: '已完成' },
      { name: '招标',   planDate: '2026-06-01', actualDate: '2026-06-05', percent: 100, status: 'done',  statusLabel: '已完成' },
      { name: '签约',   planDate: '2026-06-25', actualDate: '2026-06-28', percent: 100, status: 'done',  statusLabel: '已完成' },
      { name: '进场',   planDate: '2026-07-01', actualDate: '2026-07-05', percent: 100, status: 'done',  statusLabel: '已完成' },
      { name: '施工50%', planDate: '2026-10-01', actualDate: '',            percent: 38,  status: 'doing', statusLabel: '进行中' },
      { name: '施工100%', planDate: '2027-01-10', actualDate: '',            percent: 0,   status: 'todo',  statusLabel: '待开始' },
      { name: '验收',   planDate: '2027-01-25', actualDate: '',            percent: 0,   status: 'todo',  statusLabel: '待开始' },
      { name: '结项',   planDate: '2027-01-31', actualDate: '',            percent: 0,   status: 'todo',  statusLabel: '待开始' }
    ],
    payments: [
      { node: '预付款 10%', condition: '合同签订后 7 天内', percent: 10, amount: 1580000, status: 'done',  statusLabel: '已支付', actualDate: '2026-07-02' },
      { node: '进度款 30%', condition: '进场施工后 30 天内', percent: 30, amount: 4740000, status: 'done',  statusLabel: '已支付', actualDate: '2026-08-10' },
      { node: '进度款 30%', condition: '施工量达 50%',    percent: 30, amount: 4740000, status: 'todo',  statusLabel: '待申请', actualDate: '' },
      { node: '进度款 20%', condition: '施工量达 100%',   percent: 20, amount: 3160000, status: 'todo',  statusLabel: '待申请', actualDate: '' },
      { node: '质保金 10%', condition: '验收合格满 2 年', percent: 10, amount: 1580000, status: 'todo',  statusLabel: '待支付', actualDate: '' }
    ],
    risks: [
      { title: '五一广场交通管制协调', desc: '施工需封闭部分人行通道，已向交警申请周末施工窗口',
        level: 'medium', owner: '王建国（业主）', date: '2026-09-15', status: 'processing', statusLabel: '处理中' }
    ]
  },
  {
    id: 3, code: 'PJ-CS-2026-003', name: '先导路智慧路灯新建设备及安装项目',
    contractorCode: 'SUP-004', contractorName: SUPPLIER_NAME_MAP['SUP-004'],
    contractCode: 'HT-2026-015',
    planStart: '2026-03-15', planEnd: '2026-10-15',
    statusKey: 'accepting', statusLabel: '验收中', progress: 92,
    milestones: [
      { name: '立项',   planDate: '2026-02-01', actualDate: '2026-02-03', percent: 100, status: 'done', statusLabel: '已完成' },
      { name: '招标',   planDate: '2026-02-20', actualDate: '2026-02-25', percent: 100, status: 'done', statusLabel: '已完成' },
      { name: '签约',   planDate: '2026-03-10', actualDate: '2026-03-14', percent: 100, status: 'done', statusLabel: '已完成' },
      { name: '进场',   planDate: '2026-03-15', actualDate: '2026-03-20', percent: 100, status: 'done', statusLabel: '已完成' },
      { name: '施工50%', planDate: '2026-06-01', actualDate: '2026-05-28', percent: 100, status: 'done', statusLabel: '已完成' },
      { name: '施工100%', planDate: '2026-09-30', actualDate: '2026-09-28', percent: 100, status: 'done', statusLabel: '已完成' },
      { name: '验收',   planDate: '2026-10-10', actualDate: '',            percent: 40,  status: 'doing', statusLabel: '进行中' },
      { name: '结项',   planDate: '2026-10-15', actualDate: '',            percent: 0,   status: 'todo',  statusLabel: '待开始' }
    ],
    payments: [
      { node: '预付款 10%', condition: '合同签订后 7 天内', percent: 10, amount: 1250000, status: 'done',  statusLabel: '已支付', actualDate: '2026-03-18' },
      { node: '进度款 30%', condition: '进场施工后 30 天内', percent: 30, amount: 3750000, status: 'done',  statusLabel: '已支付', actualDate: '2026-04-25' },
      { node: '进度款 30%', condition: '施工量达 50%',    percent: 30, amount: 3750000, status: 'done',  statusLabel: '已支付', actualDate: '2026-06-10' },
      { node: '进度款 20%', condition: '施工量达 100%',   percent: 20, amount: 2500000, status: 'done',  statusLabel: '已支付', actualDate: '2026-09-30' },
      { node: '质保金 10%', condition: '验收合格满 2 年', percent: 10, amount: 1250000, status: 'todo',  statusLabel: '待支付', actualDate: '' }
    ],
    risks: []
  },
  {
    id: 4, code: 'PJ-CS-2026-005', name: '岳麓大道下穿隧道照明专项整治',
    contractorCode: 'SUP-003', contractorName: SUPPLIER_NAME_MAP['SUP-003'],
    contractCode: 'HT-2026-008',
    planStart: '2026-04-01', planEnd: '2026-07-31',
    statusKey: 'done', statusLabel: '已完工', progress: 100,
    milestones: [
      { name: '立项',   planDate: '2026-02-15', actualDate: '2026-02-18', percent: 100, status: 'done', statusLabel: '已完成' },
      { name: '招标',   planDate: '2026-03-01', actualDate: '2026-03-05', percent: 100, status: 'done', statusLabel: '已完成' },
      { name: '签约',   planDate: '2026-03-25', actualDate: '2026-03-28', percent: 100, status: 'done', statusLabel: '已完成' },
      { name: '进场',   planDate: '2026-04-01', actualDate: '2026-04-05', percent: 100, status: 'done', statusLabel: '已完成' },
      { name: '施工50%', planDate: '2026-05-15', actualDate: '2026-05-12', percent: 100, status: 'done', statusLabel: '已完成' },
      { name: '施工100%', planDate: '2026-07-10', actualDate: '2026-07-08', percent: 100, status: 'done', statusLabel: '已完成' },
      { name: '验收',   planDate: '2026-07-25', actualDate: '2026-07-26', percent: 100, status: 'done', statusLabel: '已完成' },
      { name: '结项',   planDate: '2026-07-31', actualDate: '2026-07-30', percent: 100, status: 'done', statusLabel: '已完成' }
    ],
    payments: [
      { node: '预付款 10%', condition: '合同签订后 7 天内', percent: 10, amount: 380000, status: 'done', statusLabel: '已支付', actualDate: '2026-04-02' },
      { node: '进度款 40%', condition: '施工量达 50%',    percent: 40, amount: 1520000, status: 'done', statusLabel: '已支付', actualDate: '2026-05-20' },
      { node: '进度款 40%', condition: '施工量达 100%',   percent: 40, amount: 1520000, status: 'done', statusLabel: '已支付', actualDate: '2026-07-15' },
      { node: '质保金 10%', condition: '验收合格满 2 年', percent: 10, amount: 380000, status: 'todo', statusLabel: '待支付', actualDate: '' }
    ],
    risks: []
  },
  {
    id: 5, code: 'PJ-CS-2026-010', name: '开福区背街小巷照明微改造',
    contractorCode: 'SUP-002', contractorName: SUPPLIER_NAME_MAP['SUP-002'],
    contractCode: 'HT-2026-033',
    planStart: '2026-10-01', planEnd: '2026-12-15',
    statusKey: 'bidding', statusLabel: '招标中', progress: 8,
    milestones: [
      { name: '立项',   planDate: '2026-08-20', actualDate: '2026-08-22', percent: 100, status: 'done', statusLabel: '已完成' },
      { name: '招标',   planDate: '2026-09-15', actualDate: '',            percent: 20,  status: 'doing', statusLabel: '进行中' },
      { name: '签约',   planDate: '2026-09-28', actualDate: '',            percent: 0,   status: 'todo',  statusLabel: '待开始' },
      { name: '进场',   planDate: '2026-10-01', actualDate: '',            percent: 0,   status: 'todo',  statusLabel: '待开始' },
      { name: '施工50%', planDate: '2026-11-10', actualDate: '',            percent: 0,   status: 'todo',  statusLabel: '待开始' },
      { name: '施工100%', planDate: '2026-12-05', actualDate: '',            percent: 0,   status: 'todo',  statusLabel: '待开始' },
      { name: '验收',   planDate: '2026-12-12', actualDate: '',            percent: 0,   status: 'todo',  statusLabel: '待开始' },
      { name: '结项',   planDate: '2026-12-15', actualDate: '',            percent: 0,   status: 'todo',  statusLabel: '待开始' }
    ],
    payments: [
      { node: '预付款 10%', condition: '合同签订后 7 天内', percent: 10, amount: 420000, status: 'todo', statusLabel: '待支付', actualDate: '' },
      { node: '进度款 30%', condition: '进场施工后 30 天内', percent: 30, amount: 1260000, status: 'todo', statusLabel: '待支付', actualDate: '' },
      { node: '进度款 40%', condition: '施工量达 100%',   percent: 40, amount: 1680000, status: 'todo', statusLabel: '待支付', actualDate: '' },
      { node: '质保金 20%', condition: '验收合格满 2 年', percent: 20, amount: 840000, status: 'todo', statusLabel: '待支付', actualDate: '' }
    ],
    risks: []
  }
])

const keyword = ref('')
const filteredProjects = computed(() => {
  if (!keyword.value.trim()) return projects.value
  const kw = keyword.value.trim().toLowerCase()
  return projects.value.filter(p =>
    p.name.toLowerCase().includes(kw) || p.code.toLowerCase().includes(kw)
  )
})

const currentProject = ref<ProjectProgress | null>(
  projects.value.find(p => String(p.id) === String(route.query.id)) || projects.value[0]
)

function progressColor(pct: number) {
  if (pct < 30) return 'linear-gradient(135deg,#0284c7,#38bdf8)'
  if (pct < 70) return 'linear-gradient(135deg,#d97706,#f59e0b)'
  if (pct < 100) return 'linear-gradient(135deg,#059669,#10b981)'
  return 'linear-gradient(135deg,#7c3aed,#a78bfa)'
}

function resolveTagType(status: string): 'danger' | 'warning' | 'success' {
  const map: Record<string, 'danger' | 'warning' | 'success'> = {
    open: 'danger', processing: 'warning', closed: 'success'
  }
  return map[status] || 'warning'
}
</script>

<style scoped lang="scss">
.zg-pj-progress {
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
}

.zg-pj-progress__layout {
  display: grid; grid-template-columns: 300px 1fr; gap: 16px;
}

.zg-pj-progress__sidebar {
  background: var(--zg-surface-card); border-radius: var(--zg-radius-lg);
  border: 1px solid var(--zg-line-soft); padding: 14px;
  height: calc(100vh - 200px); overflow: hidden;
  display: flex; flex-direction: column;
}
.zg-pj-progress__sidebar-head { margin-bottom: 12px; }
.zg-pj-progress__projectlist {
  list-style: none; margin: 0; padding: 0; overflow-y: auto; flex: 1;
  display: flex; flex-direction: column; gap: 8px;
}
.zg-pj-progress__projectitem {
  padding: 12px; border-radius: var(--zg-radius-md);
  border: 1px solid var(--zg-line-soft); cursor: pointer;
  transition: all 200ms ease;
  &:hover { border-color: var(--zg-brand-primary); background: #fffbeb; }
  &.active {
    border-color: var(--zg-brand-primary);
    background: #fffbeb;
    box-shadow: 0 0 0 2px rgba(217,119,6,0.15);
  }
}
.zg-pj-progress__projectname {
  display: flex; flex-direction: column; gap: 3px; margin-bottom: 8px;
}
.zg-pj-progress__code {
  font-family: ui-monospace, monospace; font-size: 11px; color: var(--zg-ink-tertiary);
}
.zg-pj-progress__name { font-size: 13px; font-weight: 600; color: var(--zg-ink-primary); }
.zg-pj-progress__projectmeta {
  display: flex; justify-content: space-between; align-items: center; gap: 8px;
}
.zg-pj-progress__status { font-size: 11px; padding: 1px 8px; border-radius: var(--zg-radius-pill); font-weight: 500; }
.zg-pj-progress__status--construction { color: var(--zg-warning); background: var(--zg-warning-soft); }
.zg-pj-progress__status--accepting    { color: var(--zg-warning); background: var(--zg-warning-soft); }
.zg-pj-progress__status--done         { color: var(--zg-success); background: var(--zg-success-soft); }
.zg-pj-progress__status--bidding      { color: var(--zg-info); background: var(--zg-info-soft); }
.zg-pj-progress__mini { flex: 1; }

.zg-pj-progress__content {
  display: flex; flex-direction: column; gap: 16px; min-width: 0;
}

.zg-pj-progress__overview {
  background: var(--zg-surface-card); border-radius: var(--zg-radius-lg);
  border: 1px solid var(--zg-line-soft); padding: 16px 18px;
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px;
}
.zg-pj-progress__ovcard {
  border-left: 3px solid var(--zg-info); padding-left: 12px;
  &--highlight { border-left-color: var(--zg-brand-primary); }
  &:first-child { border-left-color: var(--zg-success); }
  &:nth-child(2) { border-left-color: var(--zg-info); }
  &:nth-child(3) { border-left-color: var(--zg-info); }
  &:nth-child(4) { border-left-color: var(--zg-warning); }
}
.zg-pj-progress__ovlabel { font-size: 11px; color: var(--zg-ink-tertiary); margin-bottom: 4px; }
.zg-pj-progress__ovvalue { font-size: 14px; font-weight: 600; color: var(--zg-ink-primary); }

.zg-pj-progress__gantt {
  background: var(--zg-surface-card); border-radius: var(--zg-radius-lg);
  border: 1px solid var(--zg-line-soft); padding: 18px;
}
.zg-pj-progress__sectiontitle {
  display: flex; align-items: center; gap: 8px; margin: 0 0 16px;
  font-size: 15px; font-weight: 600; color: var(--zg-ink-primary);
}
.zg-pj-progress__subinfo {
  font-size: 12px; color: var(--zg-ink-tertiary); font-weight: normal; margin-left: 8px;
}

.zg-pj-progress__ganttbody {
  display: flex; flex-direction: column; gap: 12px;
}
.zg-pj-progress__milestone {
  display: grid; grid-template-columns: 120px 1fr 90px; gap: 12px; align-items: center;
}
.zg-pj-progress__mstone-head {
  display: flex; flex-direction: column; gap: 2px;
}
.zg-pj-progress__mstone-name { font-size: 13px; font-weight: 600; color: var(--zg-ink-primary); }
.zg-pj-progress__mstone-date { font-size: 11px; color: var(--zg-ink-tertiary); font-family: ui-monospace, monospace; }
.zg-pj-progress__mstone-bar {
  display: flex; align-items: center; gap: 10px;
}
.zg-pj-progress__mstone-track {
  flex: 1; height: 14px; background: #f1f5f9; border-radius: 999px;
  position: relative; overflow: hidden;
}
.zg-pj-progress__mstone-fill {
  height: 100%; border-radius: 999px;
  transition: width 400ms ease;
  &--done  { background: linear-gradient(135deg,#059669,#10b981); }
  &--doing { background: linear-gradient(135deg,#d97706,#f59e0b); }
  &--todo  { background: transparent; border: 2px dashed #e2e8f0; }
  &--delay { background: linear-gradient(135deg,#dc2626,#ef4444); }
}
.zg-pj-progress__mstone-node {
  position: absolute; right: 0; top: 50%; transform: translate(50%, -50%);
  width: 16px; height: 16px; border-radius: 50%; border: 2px solid #fff;
  box-shadow: 0 2px 6px rgba(0,0,0,0.12);
  &--done  { background: var(--zg-success); }
  &--doing { background: var(--zg-warning); animation: pulseNode 1.2s ease-in-out infinite; }
  &--todo  { background: #cbd5e1; }
  &--delay { background: var(--zg-danger); }
}
@keyframes pulseNode {
  0%, 100% { transform: translate(50%, -50%) scale(1); }
  50%      { transform: translate(50%, -50%) scale(1.2); }
}
.zg-pj-progress__mstone-status {
  font-size: 12px; padding: 2px 10px; border-radius: var(--zg-radius-pill); font-weight: 500;
  text-align: center;
  &--done  { color: var(--zg-success); background: var(--zg-success-soft); }
  &--doing { color: var(--zg-warning); background: var(--zg-warning-soft); }
  &--todo  { color: var(--zg-ink-tertiary); background: #f1f5f9; }
  &--delay { color: var(--zg-danger); background: var(--zg-danger-soft); }
}
.zg-pj-progress__mstone-actual {
  font-size: 11px; color: var(--zg-danger); font-family: ui-monospace, monospace;
  grid-column: 3; text-align: right;
}

.zg-pj-progress__bottom {
  display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
}
.zg-pj-progress__payments, .zg-pj-progress__risks {
  background: var(--zg-surface-card); border-radius: var(--zg-radius-lg);
  border: 1px solid var(--zg-line-soft); padding: 18px;
}
.zg-pj-progress__empty { padding: 20px 0; }

.zg-pj-progress__risklist {
  display: flex; flex-direction: column; gap: 10px;
}
.zg-pj-progress__riskitem {
  display: flex; gap: 12px; padding: 12px; border-radius: var(--zg-radius-md);
  border-left: 3px solid var(--zg-info); background: var(--zg-surface-muted);
  &--high   { border-left-color: var(--zg-danger); background: var(--zg-danger-soft); }
  &--medium { border-left-color: var(--zg-warning); background: var(--zg-warning-soft); }
  &--low    { border-left-color: var(--zg-success); background: var(--zg-success-soft); }
}
.zg-pj-progress__risklevel {
  width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: #fff;
  .zg-pj-progress__riskitem--high   & { background: var(--zg-danger); }
  .zg-pj-progress__riskitem--medium & { background: var(--zg-warning); }
  .zg-pj-progress__riskitem--low    & { background: var(--zg-success); }
}
.zg-pj-progress__riskbody { flex: 1; display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.zg-pj-progress__risktitle { font-size: 13px; font-weight: 600; color: var(--zg-ink-primary); }
.zg-pj-progress__riskdesc { font-size: 12px; color: var(--zg-ink-secondary); line-height: 1.5; }
.zg-pj-progress__riskmeta {
  display: flex; gap: 12px; align-items: center; font-size: 11px; color: var(--zg-ink-tertiary);
}

.zg-status-pill {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 11px; padding: 2px 8px; border-radius: var(--zg-radius-pill);
  font-weight: 500;
  .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
  &--sm { font-size: 11px; padding: 1px 6px; }
  &--done  { color: var(--zg-success); background: var(--zg-success-soft); }
  &--doing { color: var(--zg-warning); background: var(--zg-warning-soft); }
  &--todo  { color: var(--zg-ink-tertiary); background: #f1f5f9; }
}
</style>
