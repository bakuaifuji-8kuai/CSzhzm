<!--
  智光云枢 · 供应商管理 · 供应商台账
  闭环入口：采购 → 合同 → 维保 → 报废
-->
<template>
  <section class="zg-sp-ledger">
    <header class="zg-sp-ledger__head">
      <div class="zg-sp-ledger__headline">
        <div class="zg-sp-ledger__sigil"><el-icon :size="22"><School /></el-icon></div>
        <div class="zg-sp-ledger__copy">
          <h1>供应商台账</h1>
          <p>共 {{ total }} 家 · 框架协议 {{ frameworkCount }} 家 · 活跃 {{ activeCount }} 家 · 本月新入 {{ newThisMonth }}</p>
        </div>
      </div>
      <el-button type="primary"><el-icon><Plus /></el-icon>新增供应商</el-button>
    </header>

    <div class="zg-sp-kpi">
      <div v-for="k in kpiCells" :key="k.label" class="zg-kpi-cell" :class="k.theme">
        <div class="zg-kpi-cell__icon"><el-icon :size="20"><component :is="k.icon" /></el-icon></div>
        <div class="zg-kpi-cell__body">
          <span class="zg-kpi-cell__num">{{ k.value }}</span>
          <span class="zg-kpi-cell__lbl">{{ k.label }}</span>
        </div>
      </div>
    </div>

    <div class="zg-sp-card">
      <div class="zg-filter-row">
        <div class="zg-filter-item">
          <span class="zg-filter-item__lbl">经营类别</span>
          <el-select v-model="filters.category" placeholder="全部" class="zg-filter-select">
            <el-option label="照明设备" value="lighting" />
            <el-option label="电气材料" value="material" />
            <el-option label="运维服务" value="ops" />
            <el-option label="工程施工" value="engineering" />
            <el-option label="车辆" value="vehicle" />
          </el-select>
        </div>
        <div class="zg-filter-item">
          <span class="zg-filter-item__lbl">等级</span>
          <el-select v-model="filters.level" placeholder="全部">
            <el-option label="A 级" value="A" />
            <el-option label="B 级" value="B" />
            <el-option label="C 级" value="C" />
          </el-select>
        </div>
        <div class="zg-filter-item">
          <span class="zg-filter-item__lbl">状态</span>
          <el-select v-model="filters.status" placeholder="全部">
            <el-option label="合作中" value="active" />
            <el-option label="暂停" value="paused" />
            <el-option label="黑名单" value="blacklist" />
          </el-select>
        </div>
        <el-input v-model="filters.keyword" placeholder="搜索供应商名称/统一社会信用代码" style="width:300px" clearable />
      </div>

      <el-table :data="filteredList" stripe border style="width:100%; margin-top:12px">
        <el-table-column prop="code" label="供应商编号" width="120" />
        <el-table-column prop="name" label="供应商名称" min-width="200" />
        <el-table-column prop="categoryLabel" label="经营类别" width="110">
          <template #default="{ row }">
            <el-tag :type="{ lighting:'', material:'info', ops:'success', engineering:'warning', vehicle:'' }[row.category]">{{ row.categoryLabel }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="等级" width="80">
          <template #default="{ row }">
            <el-tag :type="row.level==='A'?'success':row.level==='B'?'warning':'danger'">{{ row.level }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="contact" label="联系人" width="110" />
        <el-table-column prop="phone" label="联系电话" width="140" />
        <el-table-column label="合同数" width="90" align="center">
          <template #default="{ row }"><span class="zg-link" @click="$router.push('/contract/ledger?supplier='+row.code)">{{ row.contractCount }}</span></template>
        </el-table-column>
        <el-table-column label="合作金额(万)" width="120" align="right">
          <template #default="{ row }">{{ (row.totalAmount/10000).toFixed(1) }}</template>
        </el-table-column>
        <el-table-column prop="joinDate" label="入库日期" width="120" />
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status==='active'?'success':row.status==='paused'?'info':'danger'" effect="plain">{{ row.statusLabel }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small">查看</el-button>
            <el-button link type="primary" size="small">编辑</el-button>
            <el-button link type="primary" size="small">评价</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="zg-pagination">
        <span>共 {{ filteredList.length }} 条</span>
        <el-pagination background layout="prev, pager, next" :total="filteredList.length" />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { School, Plus, Trophy, Document, Warning, User } from '@element-plus/icons-vue'

const filters = ref({ category:'', level:'', status:'', keyword:'' })

const allSuppliers = ref([
  { code:'SUP-001', name:'深圳洲明科技股份有限公司', category:'lighting', categoryLabel:'照明设备', level:'A', contact:'王经理', phone:'138****1234', contractCount:6, totalAmount:8560000, joinDate:'2023-03-15', status:'active', statusLabel:'合作中' },
  { code:'SUP-002', name:'上海三思电子工程有限公司', category:'lighting', categoryLabel:'照明设备', level:'A', contact:'李总', phone:'139****5678', contractCount:4, totalAmount:5200000, joinDate:'2023-06-20', status:'active', statusLabel:'合作中' },
  { code:'SUP-003', name:'长沙华电电气设备有限公司', category:'material', categoryLabel:'电气材料', level:'B', contact:'张工', phone:'137****9012', contractCount:9, totalAmount:3800000, joinDate:'2022-11-08', status:'active', statusLabel:'合作中' },
  { code:'SUP-004', name:'湖南光明照明工程有限公司', category:'engineering', categoryLabel:'工程施工', level:'A', contact:'陈总', phone:'136****3456', contractCount:3, totalAmount:12500000, joinDate:'2022-05-01', status:'active', statusLabel:'合作中' },
  { code:'SUP-005', name:'长沙光服运维服务有限公司', category:'ops', categoryLabel:'运维服务', level:'A', contact:'刘经理', phone:'135****7890', contractCount:8, totalAmount:9600000, joinDate:'2021-09-12', status:'active', statusLabel:'合作中' },
  { code:'SUP-006', name:'中联重科车辆销售分公司', category:'vehicle', categoryLabel:'车辆', level:'B', contact:'周总', phone:'134****2345', contractCount:2, totalAmount:2800000, joinDate:'2024-01-18', status:'active', statusLabel:'合作中' },
  { code:'SUP-007', name:'佛山照明股份有限公司', category:'lighting', categoryLabel:'照明设备', level:'B', contact:'赵经理', phone:'133****6789', contractCount:3, totalAmount:1800000, joinDate:'2023-08-30', status:'paused', statusLabel:'暂停' },
  { code:'SUP-008', name:'岳阳电力器材厂', category:'material', categoryLabel:'电气材料', level:'C', contact:'孙厂长', phone:'132****0123', contractCount:1, totalAmount:450000, joinDate:'2024-03-10', status:'blacklist', statusLabel:'黑名单' },
])

const filteredList = computed(() => allSuppliers.value.filter(s => {
  if (filters.value.category && s.category !== filters.value.category) return false
  if (filters.value.level && s.level !== filters.value.level) return false
  if (filters.value.status && s.status !== filters.value.status) return false
  if (filters.value.keyword && !s.name.includes(filters.value.keyword) && !s.code.includes(filters.value.keyword)) return false
  return true
}))

const total = computed(() => allSuppliers.value.length)
const activeCount = computed(() => allSuppliers.value.filter(s=>s.status==='active').length)
const frameworkCount = computed(() => allSuppliers.value.filter(s=>s.contractCount>=3).length)
const newThisMonth = ref(1)

const kpiCells = computed(() => [
  { label:'合作供应商总数', value: total.value, icon: School, theme: 'theme-primary' },
  { label:'框架协议供应商', value: frameworkCount.value, icon: Document, theme: 'theme-success' },
  { label:'活跃合作中', value: activeCount.value, icon: User, theme: 'theme-warning' },
  { label:'本月新增入库', value: newThisMonth.value, icon: Plus, theme: 'theme-info' },
])
</script>

<style scoped>
.zg-sp-ledger { padding: 16px; background: #f8fafc; min-height: calc(100vh - 120px); }
.zg-sp-ledger__head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.zg-sp-ledger__headline { display: flex; gap: 12px; align-items: center; }
.zg-sp-ledger__sigil { width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg,#6366f1,#8b5cf6); color:#fff; display:flex; align-items:center; justify-content:center; }
.zg-sp-ledger__copy h1 { margin:0; font-size:22px; color:#1e293b; }
.zg-sp-ledger__copy p { margin:4px 0 0; font-size:13px; color:#64748b; }
.zg-sp-kpi { display: grid; grid-template-columns: repeat(4,1fr); gap:12px; margin-bottom:16px; }
.zg-kpi-cell { background:#fff; border-radius:12px; padding:16px; display:flex; gap:12px; border:1px solid #e2e8f0; }
.zg-kpi-cell__icon { width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; color:#fff; }
.theme-primary .zg-kpi-cell__icon { background: linear-gradient(135deg,#6366f1,#8b5cf6); }
.theme-success .zg-kpi-cell__icon { background: linear-gradient(135deg,#22c55e,#10b981); }
.theme-warning .zg-kpi-cell__icon { background: linear-gradient(135deg,#f59e0b,#f97316); }
.theme-info .zg-kpi-cell__icon { background: linear-gradient(135deg,#3b82f6,#6366f1); }
.zg-kpi-cell__body { display:flex; flex-direction:column; }
.zg-kpi-cell__num { font-size:24px; font-weight:700; color:#1e293b; line-height:1.2; }
.zg-kpi-cell__lbl { font-size:12px; color:#64748b; margin-top:2px; }
.zg-sp-card { background:#fff; border-radius:12px; padding:16px; border:1px solid #e2e8f0; }
.zg-filter-row { display:flex; gap:12px; flex-wrap:wrap; align-items:center; }
.zg-filter-item { display:flex; gap:6px; align-items:center; }
.zg-filter-item__lbl { font-size:13px; color:#475569; }
.zg-pagination { display:flex; justify-content:space-between; align-items:center; margin-top:16px; font-size:13px; color:#64748b; }
.zg-link { color:#6366f1; cursor:pointer; }
.zg-link:hover { text-decoration:underline; }
</style>
