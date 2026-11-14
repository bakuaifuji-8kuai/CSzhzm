<!--
  智光云枢 · 资产维保 · 一码绑定与出码
  业务域：assetManage
  功能：资产二维码出码批次管理，印刷/安装状态跟踪 + 资产覆盖率统计
-->
<template>
  <section class="zg-qr-issue">
    <header class="zg-qr-issue__head">
      <div class="zg-qr-issue__headline">
        <div class="zg-qr-issue__sigil">
          <el-icon :size="22"><Link /></el-icon>
        </div>
        <div class="zg-qr-issue__copy">
          <h1 class="zg-qr-issue__title">一码绑定与出码</h1>
          <p class="zg-qr-issue__sub">资产二维码批次管理 · 印刷出码 · 安装绑定 · 覆盖率统计</p>
        </div>
      </div>
      <div class="zg-qr-issue__cta">
        <el-button type="primary"><el-icon><Plus /></el-icon><span>新建出码批次</span></el-button>
      </div>
    </header>

    <!-- 覆盖率统计卡 -->
    <div class="zg-coverage-card">
      <div class="zg-coverage-card__ring">
        <svg viewBox="0 0 100 100" class="zg-ring">
          <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" stroke-width="8" />
          <circle cx="50" cy="50" r="42" fill="none" stroke="url(#zgGrad)" stroke-width="8"
            :stroke-dasharray="264"
            :stroke-dashoffset="264 * (1 - coverageData.totalRate / 100)"
            stroke-linecap="round" transform="rotate(-90 50 50)" />
          <defs>
            <linearGradient id="zgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#6366f1" />
              <stop offset="100%" stop-color="#0ea5e9" />
            </linearGradient>
          </defs>
        </svg>
        <div class="zg-coverage-card__center">
          <span class="zg-coverage-card__val">{{ coverageData.totalRate }}%</span>
          <span class="zg-coverage-card__lbl">总覆盖率</span>
        </div>
      </div>
      <div class="zg-coverage-card__detail">
        <h4 class="zg-coverage-card__title">资产覆盖率统计</h4>
        <div v-for="item in coverageData.items" :key="item.type" class="zg-coverage-row">
          <span class="zg-coverage-row__lbl">{{ item.type }}</span>
          <div class="zg-coverage-row__track">
            <div class="zg-coverage-row__fill" :style="{ width: item.rate + '%' }"></div>
          </div>
          <span class="zg-coverage-row__val">{{ item.rate }}%</span>
          <span class="zg-coverage-row__count">({{ item.installed }}/{{ item.total }})</span>
        </div>
      </div>
    </div>

    <!-- 批次表格 -->
    <div class="zg-panel">
      <div class="zg-filterband">
        <div class="zg-filterband__row">
          <el-input v-model="keyword" placeholder="搜索批次号 / 资产类型" clearable style="width: 240px">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
          <el-select v-model="filterAsset" placeholder="资产类型" style="width: 140px" clearable>
            <el-option v-for="t in assetTypes" :key="t" :label="t" :value="t" />
          </el-select>
          <el-select v-model="filterPrint" placeholder="印刷状态" style="width: 130px" clearable>
            <el-option label="未印刷" value="待印刷" />
            <el-option label="印刷中" value="印刷中" />
            <el-option label="已印刷" value="已印刷" />
          </el-select>
          <el-select v-model="filterInstall" placeholder="安装状态" style="width: 130px" clearable>
            <el-option label="待安装" value="待安装" />
            <el-option label="部分安装" value="部分安装" />
            <el-option label="已安装" value="已安装" />
          </el-select>
        </div>
      </div>

      <el-table :data="filteredBatches" stripe border size="small" class="zg-datatable">
        <el-table-column prop="batchNo" label="批次号" width="160" fixed>
          <template #default="{ row }">
            <span class="zg-code">{{ row.batchNo }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="assetType" label="资产类型" width="110">
          <template #default="{ row }">
            <el-tag size="small">{{ row.assetType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="issueQty" label="出码数量" width="100" align="right" />
        <el-table-column prop="installedQty" label="已安装" width="100" align="right">
          <template #default="{ row }">
            <span :class="{ 'text-emerald-600 font-semibold': row.installedQty === row.issueQty }">{{ row.installedQty }}</span>
          </template>
        </el-table-column>
        <el-table-column label="印刷状态" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="printTagType(row.printStatus)" size="small">{{ row.printStatus }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="安装状态" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="installTagType(row.installStatus)" size="small">{{ row.installStatus }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="安装进度" width="140">
          <template #default="{ row }">
            <el-progress :percentage="Math.round((row.installedQty / row.issueQty) * 100)" :stroke-width="8" />
          </template>
        </el-table-column>
        <el-table-column prop="createDate" label="创建日期" width="120" />
        <el-table-column prop="creator" label="创建人" width="90" align="center" />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small">出码</el-button>
            <el-button link type="primary" size="small" :disabled="row.printStatus !== '已印刷'">安装</el-button>
            <el-button link type="primary" size="small">导出PDF</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="zg-pagerbar">
        <el-pagination v-model:current-page="pager.page" v-model:page-size="pager.size"
          :total="filteredBatches.length" :page-sizes="[10, 20, 30, 50]"
          layout="prev, pager, next, jumper, ->, sizes, total" background />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Link, Plus, Search } from "@element-plus/icons-vue"

const assetTypes = ['灯杆', 'LED灯具', '配电箱', '控制模块', '摄像头', '充电桩', '箱变', '电缆', '接地装置']
const keyword = ref('')
const filterAsset = ref('')
const filterPrint = ref('')
const filterInstall = ref('')
const pager = reactive({ page: 1, size: 20 })

// 覆盖率数据
const coverageData = ref({
  totalRate: 87.3,
  items: [
    { type: '灯杆', total: 1560, installed: 1548, rate: 99.2 },
    { type: 'LED灯具', total: 8200, installed: 7520, rate: 91.7 },
    { type: '配电箱', total: 320, installed: 315, rate: 98.4 },
    { type: '控制模块', total: 480, installed: 462, rate: 96.3 },
    { type: '摄像头', total: 280, installed: 215, rate: 76.8 },
    { type: '充电桩', total: 156, installed: 85, rate: 54.5 }
  ]
})

// 批次 mock - 14 条
const batches = ref([
  { batchNo: 'QR-20261101001', assetType: '灯杆', issueQty: 200, installedQty: 195, printStatus: '已印刷', installStatus: '部分安装', createDate: '2026-11-01', creator: '张工' },
  { batchNo: 'QR-20261101002', assetType: 'LED灯具', issueQty: 500, installedQty: 500, printStatus: '已印刷', installStatus: '已安装', createDate: '2026-11-01', creator: '李工' },
  { batchNo: 'QR-20261102001', assetType: '配电箱', issueQty: 50, installedQty: 45, printStatus: '已印刷', installStatus: '部分安装', createDate: '2026-11-02', creator: '王工' },
  { batchNo: 'QR-20261102002', assetType: '控制模块', issueQty: 120, installedQty: 80, printStatus: '已印刷', installStatus: '部分安装', createDate: '2026-11-02', creator: '赵工' },
  { batchNo: 'QR-20261103001', assetType: '摄像头', issueQty: 80, installedQty: 0, printStatus: '印刷中', installStatus: '待安装', createDate: '2026-11-03', creator: '刘工' },
  { batchNo: 'QR-20261103002', assetType: '充电桩', issueQty: 30, installedQty: 0, printStatus: '待印刷', installStatus: '待安装', createDate: '2026-11-03', creator: '陈工' },
  { batchNo: 'QR-20261104001', assetType: '箱变', issueQty: 20, installedQty: 18, printStatus: '已印刷', installStatus: '部分安装', createDate: '2026-11-04', creator: '张工' },
  { batchNo: 'QR-20261104002', assetType: '电缆', issueQty: 300, installedQty: 300, printStatus: '已印刷', installStatus: '已安装', createDate: '2026-11-04', creator: '李工' },
  { batchNo: 'QR-20261105001', assetType: '接地装置', issueQty: 60, installedQty: 0, printStatus: '待印刷', installStatus: '待安装', createDate: '2026-11-05', creator: '王工' },
  { batchNo: 'QR-20261105002', assetType: '灯杆', issueQty: 150, installedQty: 0, printStatus: '印刷中', installStatus: '待安装', createDate: '2026-11-05', creator: '赵工' },
  { batchNo: 'QR-20261106001', assetType: 'LED灯具', issueQty: 800, installedQty: 0, printStatus: '已印刷', installStatus: '待安装', createDate: '2026-11-06', creator: '刘工' },
  { batchNo: 'QR-20261106002', assetType: '配电箱', issueQty: 40, installedQty: 38, printStatus: '已印刷', installStatus: '部分安装', createDate: '2026-11-06', creator: '陈工' },
  { batchNo: 'QR-20261107001', assetType: '摄像头', issueQty: 100, installedQty: 0, printStatus: '已印刷', installStatus: '待安装', createDate: '2026-11-07', creator: '张工' },
  { batchNo: 'QR-20261107002', assetType: '控制模块', issueQty: 150, installedQty: 0, printStatus: '印刷中', installStatus: '待安装', createDate: '2026-11-07', creator: '李工' }
])

const filteredBatches = computed(() => {
  return batches.value.filter(b => {
    const matchKw = !keyword.value.trim() || b.batchNo.includes(keyword.value) || b.assetType.includes(keyword.value)
    const matchAsset = !filterAsset.value || b.assetType === filterAsset.value
    const matchPrint = !filterPrint.value || b.printStatus === filterPrint.value
    const matchInstall = !filterInstall.value || b.installStatus === filterInstall.value
    return matchKw && matchAsset && matchPrint && matchInstall
  })
})

function printTagType(s) {
  if (s === '已印刷') return 'success'
  if (s === '印刷中') return 'warning'
  return 'info'
}
function installTagType(s) {
  if (s === '已安装') return 'success'
  if (s === '部分安装') return 'warning'
  return 'info'
}
</script>

<style scoped lang="scss">
.zg-qr-issue {
  padding: 24px;
  &__head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 20px; padding-bottom: 18px; border-bottom: 1px solid #e2e8f0; }
  &__headline { display: flex; align-items: center; gap: 14px; }
  &__sigil { width: 44px; height: 44px; border-radius: 10px; background: linear-gradient(135deg, #0ea5e9, #6366f1); color: #fff; display: flex; align-items: center; justify-content: center; }
  &__copy { display: flex; flex-direction: column; gap: 4px; }
  &__title { font-size: 20px; font-weight: 600; margin: 0; color: #18181b; }
  &__sub { font-size: 13px; color: #71717a; margin: 0; }
  &__cta { display: flex; gap: 10px; }
}

.zg-coverage-card {
  display: grid; grid-template-columns: 240px 1fr; gap: 24px;
  background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px;
  margin-bottom: 18px; box-shadow: 0 1px 3px rgba(15,23,42,0.04);

  &__ring { position: relative; width: 200px; height: 200px; }
  .zg-ring { width: 200px; height: 200px; }
  &__center {
    position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;
  }
  &__val { font-size: 32px; font-weight: 700; color: #18181b; line-height: 1; }
  &__lbl { font-size: 12px; color: #71717a; margin-top: 4px; }
  &__detail { display: flex; flex-direction: column; gap: 10px; }
  &__title { font-size: 14px; font-weight: 600; color: #18181b; margin: 0 0 6px; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0; }
}

.zg-coverage-row {
  display: grid; grid-template-columns: 70px 1fr 60px 80px; gap: 10px; align-items: center;
  &__lbl { font-size: 13px; color: #52525b; font-weight: 500; }
  &__track { height: 8px; background: #f1f5f9; border-radius: 999px; overflow: hidden; }
  &__fill { height: 100%; background: linear-gradient(90deg, #0ea5e9, #6366f1); border-radius: 999px; transition: width 0.3s; }
  &__val { font-size: 13px; font-weight: 600; color: #18181b; text-align: right; }
  &__count { font-size: 11px; color: #71717a; text-align: right; font-family: ui-monospace, monospace; }
}

.zg-panel { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 18px; }

.zg-filterband {
  padding: 14px 16px; background: #f8fafc; border-radius: 10px; margin-bottom: 14px;
  &__row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
}

.zg-code { font-family: ui-monospace, monospace; font-size: 12px; font-weight: 600; color: #0ea5e9; }

.text-emerald-600 { color: #059669; }
.font-semibold { font-weight: 600; }

.zg-pagerbar { display: flex; justify-content: flex-end; padding-top: 14px; }
</style>
