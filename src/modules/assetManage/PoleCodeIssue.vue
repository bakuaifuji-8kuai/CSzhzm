<!--
  智光云枢 · 资产维保 · 灯杆码批量出码
  业务域：assetManage
  功能：灯杆码批量出码流程（选区域→选灯杆→生成码→下载印刷文件）+ 灯杆码台账
-->
<template>
  <section class="zg-pole-code">
    <header class="zg-pole-code__head">
      <div class="zg-pole-code__headline">
        <div class="zg-pole-code__sigil">
          <el-icon :size="22"><Postcard /></el-icon>
        </div>
        <div class="zg-pole-code__copy">
          <h1 class="zg-pole-code__title">灯杆码批量出码</h1>
          <p class="zg-pole-code__sub">GD 编号体系 · 区域筛选 · 批量出码印刷 · 台账管理</p>
        </div>
      </div>
      <div class="zg-pole-code__cta">
        <el-button type="primary"><el-icon><Plus /></el-icon><span>新建出码任务</span></el-button>
      </div>
    </header>

    <!-- 批量出码流程卡 -->
    <div class="zg-flow-card">
      <div class="zg-flow-card__head">
        <h3 class="zg-flow-card__title">批量出码流程</h3>
        <el-tag type="info" effect="plain">当前步骤 {{ currentStep }} / 4</el-tag>
      </div>

      <div class="zg-flow-steps">
        <div v-for="(step, i) in flowSteps" :key="i" class="zg-flow-step"
          :class="{ 'is-active': currentStep === i + 1, 'is-done': currentStep > i + 1 }">
          <div class="zg-flow-step__num">{{ i + 1 }}</div>
          <div class="zg-flow-step__body">
            <div class="zg-flow-step__title">{{ step }}</div>
          </div>
        </div>
        <div v-if="currentStep > 1" class="zg-flow-actions">
          <el-button size="small" @click="prevStep">上一步</el-button>
          <el-button type="primary" size="small" @click="nextStep">下一步</el-button>
        </div>
      </div>

      <!-- 步骤内容 -->
      <div class="zg-flow-content">
        <!-- Step 1: 选区域 -->
        <div v-if="currentStep === 1" class="zg-flow-step-content">
          <div class="zg-region-grid">
            <div v-for="r in regions" :key="r.key" class="zg-region-card"
              :class="{ 'is-selected': selectedRegion === r.key }"
              @click="selectedRegion = r.key">
              <el-icon :size="20"><Location /></el-icon>
              <span>{{ r.name }}</span>
              <em class="zg-region-card__count">{{ r.poleCount }} 杆</em>
            </div>
          </div>
        </div>

        <!-- Step 2: 选灯杆 -->
        <div v-else-if="currentStep === 2" class="zg-flow-step-content">
          <div class="zg-pole-select-toolbar">
            <el-input v-model="poleKeyword" placeholder="搜索 GD 编号" clearable style="width: 240px">
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
            <el-checkbox v-model="selectAll" @change="onSelectAll">全选当前页 {{ pagedPoles.length }} 条</el-checkbox>
            <span class="zg-pole-select-count">已选 {{ selectedPoles.length }} / {{ filteredPoles.length }} 杆</span>
          </div>
          <el-table :data="pagedPoles" stripe border size="small" height="360" class="zg-datatable"
            @selection-change="handlePoleSelection">
            <el-table-column type="selection" width="48" />
            <el-table-column prop="poleNo" label="灯杆编号" width="160">
              <template #default="{ row }">
                <span class="zg-code">{{ row.poleNo }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="road" label="道路/位置" width="200" show-overflow-tooltip />
            <el-table-column prop="type" label="杆型" width="100" />
            <el-table-column prop="height" label="高度(m)" width="90" align="right" />
            <el-table-column prop="installDate" label="安装日期" width="120" />
            <el-table-column prop="hasCode" label="已有码" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.hasCode ? 'success' : 'info'" size="small">{{ row.hasCode ? '已有' : '无' }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- Step 3: 生成码 -->
        <div v-else-if="currentStep === 3" class="zg-flow-step-content">
          <div class="zg-preview-grid">
            <div v-for="pole in selectedPoles.slice(0, 9)" :key="pole.poleNo" class="zg-qr-preview">
              <div class="zg-qr-preview__box">
                <svg viewBox="0 0 100 100" class="zg-qr-mini">
                  <rect width="100" height="100" fill="#fff" />
                  <rect x="10" y="10" width="25" height="25" fill="#1a1a1a" />
                  <rect x="15" y="15" width="15" height="15" fill="#fff" />
                  <rect x="20" y="20" width="5" height="5" fill="#1a1a1a" />
                  <rect x="65" y="10" width="25" height="25" fill="#1a1a1a" />
                  <rect x="70" y="15" width="15" height="15" fill="#fff" />
                  <rect x="75" y="20" width="5" height="5" fill="#1a1a1a" />
                  <rect x="10" y="65" width="25" height="25" fill="#1a1a1a" />
                  <rect x="15" y="70" width="15" height="15" fill="#fff" />
                  <rect x="20" y="75" width="5" height="5" fill="#1a1a1a" />
                  <g fill="#1a1a1a">
                    <rect x="40" y="15" width="5" height="5" />
                    <rect x="50" y="20" width="5" height="5" />
                    <rect x="45" y="30" width="5" height="5" />
                    <rect x="55" y="35" width="5" height="5" />
                    <rect x="40" y="50" width="5" height="5" />
                    <rect x="50" y="55" width="5" height="5" />
                    <rect x="60" y="50" width="5" height="5" />
                    <rect x="45" y="65" width="5" height="5" />
                    <rect x="55" y="70" width="5" height="5" />
                    <rect x="50" y="80" width="5" height="5" />
                    <rect x="70" y="50" width="5" height="5" />
                    <rect x="75" y="60" width="5" height="5" />
                  </g>
                </svg>
              </div>
              <div class="zg-qr-preview__text">{{ pole.poleNo }}</div>
            </div>
            <div v-if="selectedPoles.length > 9" class="zg-qr-preview__more">
              +{{ selectedPoles.length - 9 }} 个灯杆
            </div>
          </div>
          <div class="zg-flow-tip">将为 <strong>{{ selectedPoles.length }}</strong> 根灯杆生成二维码标签</div>
        </div>

        <!-- Step 4: 下载 -->
        <div v-else class="zg-flow-step-content">
          <div class="zg-download-grid">
            <div class="zg-download-card">
              <el-icon :size="32"><Files /></el-icon>
              <h4>批量印刷文件</h4>
              <p>PDF 格式 · A4 标签纸 · {{ selectedPoles.length }} 码</p>
              <el-button type="primary" round>下载 PDF</el-button>
            </div>
            <div class="zg-download-card">
              <el-icon :size="32"><Document /></el-icon>
              <h4>台账清单</h4>
              <p>Excel 格式 · 含全部灯杆信息</p>
              <el-button round>下载 Excel</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 灯杆码台账 -->
    <div class="zg-panel zg-panel--ledger">
      <div class="zg-panel__head">
        <el-icon><List /></el-icon>
        <span>灯杆码台账</span>
        <el-tag size="small" type="success" class="ml-auto">共 {{ ledger.length }} 条</el-tag>
      </div>

      <div class="zg-filterband">
        <div class="zg-filterband__row">
          <el-input v-model="ledgerKeyword" placeholder="搜索 GD 编号 / 地址" clearable style="width: 260px">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
          <el-select v-model="filterIssue" placeholder="出码状态" style="width: 130px" clearable>
            <el-option label="未出码" value="未出码" />
            <el-option label="已出码" value="已出码" />
          </el-select>
          <el-select v-model="filterInstall" placeholder="安装状态" style="width: 130px" clearable>
            <el-option label="未安装" value="未安装" />
            <el-option label="已安装" value="已安装" />
          </el-select>
        </div>
      </div>

      <el-table :data="filteredLedger" stripe border size="small" class="zg-datatable">
        <el-table-column prop="poleNo" label="灯杆编号" width="150">
          <template #default="{ row }">
            <span class="zg-code">{{ row.poleNo }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="address" label="地址/道路" min-width="200" show-overflow-tooltip />
        <el-table-column label="出码状态" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="row.issueStatus === '已出码' ? 'success' : 'info'" size="small">{{ row.issueStatus }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="安装状态" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="row.installStatus === '已安装' ? 'success' : 'warning'" size="small">{{ row.installStatus }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="issueTime" label="出码时间" width="160" />
        <el-table-column prop="installTime" label="安装时间" width="160" />
        <el-table-column prop="batchNo" label="批次号" width="160" />
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small">查看</el-button>
            <el-button link type="primary" size="small">打印</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Postcard, Plus, Location, Search, Files, Document, List } from "@element-plus/icons-vue"

const currentStep = ref(1)
const flowSteps = ['选择区域', '选择灯杆', '生成二维码', '下载印刷文件']
const selectedRegion = ref('')
const poleKeyword = ref('')
const selectedPoles = ref([])
const selectAll = ref(false)
const pager = reactive({ page: 1, size: 10 })

// 区域
const regions = ref([
  { key: 'XD', name: '先导路片区', poleCount: 68 },
  { key: 'LG', name: '麓谷片区', poleCount: 124 },
  { key: 'MX', name: '梅溪湖片区', poleCount: 96 },
  { key: 'JX', name: '金星大道片区', poleCount: 82 },
  { key: 'YL', name: '岳麓大道片区', poleCount: 45 },
  { key: 'XJ', name: '湘江路片区', poleCount: 56 },
  { key: 'TX', name: '天心大道片区', poleCount: 78 },
  { key: 'FR', name: '芙蓉路片区', poleCount: 112 }
])

// 灯杆池 mock
const poles = ref([
  { poleNo: 'GD-XD001', road: '先导路K0+020', type: 'P-014', height: 14, installDate: '2018-03-15', hasCode: true },
  { poleNo: 'GD-XD002', road: '先导路K0+080', type: 'P-014', height: 14, installDate: '2018-03-15', hasCode: true },
  { poleNo: 'GD-XD003', road: '先导路K0+150', type: 'P-025', height: 14, installDate: '2018-03-20', hasCode: false },
  { poleNo: 'GD-LG001', road: '麓谷大道K0+100', type: 'P-025', height: 16, installDate: '2019-06-10', hasCode: true },
  { poleNo: 'GD-LG002', road: '麓谷大道K0+200', type: 'P-025', height: 16, installDate: '2019-06-10', hasCode: true },
  { poleNo: 'GD-MX001', road: '梅溪湖环湖路K0+050', type: 'P-036', height: 16, installDate: '2020-08-25', hasCode: true },
  { poleNo: 'GD-MX002', road: '梅溪湖环湖路K0+150', type: 'P-036', height: 16, installDate: '2020-08-25', hasCode: false },
  { poleNo: 'GD-JX001', road: '金星大道K0+030', type: 'P-014', height: 14, installDate: '2017-05-18', hasCode: true },
  { poleNo: 'GD-JX002', road: '金星大道K0+120', type: 'P-014', height: 14, installDate: '2017-05-18', hasCode: false },
  { poleNo: 'GD-YL001', road: '岳麓大道K0+080', type: 'P-048', height: 18, installDate: '2016-11-02', hasCode: true },
  { poleNo: 'GD-YL002', road: '岳麓大道K0+200', type: 'P-048', height: 18, installDate: '2016-11-02', hasCode: true },
  { poleNo: 'GD-XJ001', road: '湘江路K0+050', type: 'P-014', height: 12, installDate: '2021-04-15', hasCode: false },
  { poleNo: 'GD-TX001', road: '天心大道K0+100', type: 'P-025', height: 14, installDate: '2018-07-22', hasCode: true },
  { poleNo: 'GD-TX002', road: '天心大道K0+250', type: 'P-025', height: 14, installDate: '2018-07-22', hasCode: true },
  { poleNo: 'GD-FR001', road: '芙蓉路K0+080', type: 'P-060', height: 20, installDate: '2015-09-10', hasCode: true },
  { poleNo: 'GD-FR002', road: '芙蓉路K0+200', type: 'P-060', height: 20, installDate: '2015-09-10', hasCode: false }
])

const filteredPoles = computed(() => {
  if (!poleKeyword.value.trim()) return poles.value
  return poles.value.filter(p => p.poleNo.includes(poleKeyword.value))
})

const pagedPoles = computed(() => {
  const start = (pager.page - 1) * pager.size
  return filteredPoles.value.slice(start, start + pager.size)
})

function handlePoleSelection(rows) { selectedPoles.value = rows }
function onSelectAll(val) {
  selectedPoles.value = val ? [...filteredPoles.value] : []
}

// 台账 mock
const ledgerKeyword = ref('')
const filterIssue = ref('')
const filterInstall = ref('')
const ledger = ref([
  { poleNo: 'GD-XD001', address: '先导路K0+020', issueStatus: '已出码', installStatus: '已安装', issueTime: '2026-08-15 10:30', installTime: '2026-08-18 14:20', batchNo: 'QR-20260815001' },
  { poleNo: 'GD-XD002', address: '先导路K0+080', issueStatus: '已出码', installStatus: '已安装', issueTime: '2026-08-15 10:30', installTime: '2026-08-19 09:15', batchNo: 'QR-20260815001' },
  { poleNo: 'GD-XD003', address: '先导路K0+150', issueStatus: '未出码', installStatus: '未安装', issueTime: '-', installTime: '-', batchNo: '-' },
  { poleNo: 'GD-LG001', address: '麓谷大道K0+100', issueStatus: '已出码', installStatus: '已安装', issueTime: '2026-09-10 09:00', installTime: '2026-09-12 16:30', batchNo: 'QR-20260910002' },
  { poleNo: 'GD-LG002', address: '麓谷大道K0+200', issueStatus: '已出码', installStatus: '部分安装', issueTime: '2026-09-10 09:00', installTime: '2026-09-13 10:00', batchNo: 'QR-20260910002' },
  { poleNo: 'GD-MX001', address: '梅溪湖环湖路K0+050', issueStatus: '已出码', installStatus: '已安装', issueTime: '2026-09-25 11:20', installTime: '2026-09-28 08:30', batchNo: 'QR-20260925003' },
  { poleNo: 'GD-MX002', address: '梅溪湖环湖路K0+150', issueStatus: '未出码', installStatus: '未安装', issueTime: '-', installTime: '-', batchNo: '-' },
  { poleNo: 'GD-JX001', address: '金星大道K0+030', issueStatus: '已出码', installStatus: '已安装', issueTime: '2026-10-05 14:00', installTime: '2026-10-08 11:15', batchNo: 'QR-20261005004' },
  { poleNo: 'GD-JX002', address: '金星大道K0+120', issueStatus: '未出码', installStatus: '未安装', issueTime: '-', installTime: '-', batchNo: '-' },
  { poleNo: 'GD-YL001', address: '岳麓大道K0+080', issueStatus: '已出码', installStatus: '已安装', issueTime: '2026-08-20 09:30', installTime: '2026-08-22 15:00', batchNo: 'QR-20260820005' },
  { poleNo: 'GD-YL002', address: '岳麓大道K0+200', issueStatus: '已出码', installStatus: '已安装', issueTime: '2026-08-20 09:30', installTime: '2026-08-23 10:20', batchNo: 'QR-20260820005' },
  { poleNo: 'GD-XJ001', address: '湘江路K0+050', issueStatus: '未出码', installStatus: '未安装', issueTime: '-', installTime: '-', batchNo: '-' },
  { poleNo: 'GD-TX001', address: '天心大道K0+100', issueStatus: '已出码', installStatus: '已安装', issueTime: '2026-10-15 10:00', installTime: '2026-10-18 09:45', batchNo: 'QR-20261015006' },
  { poleNo: 'GD-TX002', address: '天心大道K0+250', issueStatus: '已出码', installStatus: '部分安装', issueTime: '2026-10-15 10:00', installTime: '2026-10-19 14:30', batchNo: 'QR-20261015006' },
  { poleNo: 'GD-FR001', address: '芙蓉路K0+080', issueStatus: '已出码', installStatus: '已安装', issueTime: '2026-07-28 08:30', installTime: '2026-08-01 16:00', batchNo: 'QR-20260728007' },
  { poleNo: 'GD-FR002', address: '芙蓉路K0+200', issueStatus: '未出码', installStatus: '未安装', issueTime: '-', installTime: '-', batchNo: '-' }
])

const filteredLedger = computed(() => {
  return ledger.value.filter(l => {
    const matchKw = !ledgerKeyword.value.trim() || l.poleNo.includes(ledgerKeyword.value) || l.address.includes(ledgerKeyword.value)
    const matchIssue = !filterIssue.value || l.issueStatus === filterIssue.value
    const matchInstall = !filterInstall.value || l.installStatus === filterInstall.value
    return matchKw && matchIssue && matchInstall
  })
})

function nextStep() { if (currentStep.value < 4) currentStep.value++ }
function prevStep() { if (currentStep.value > 1) currentStep.value-- }
</script>

<style scoped lang="scss">
.zg-pole-code {
  padding: 24px;
  &__head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 20px; padding-bottom: 18px; border-bottom: 1px solid #e2e8f0; }
  &__headline { display: flex; align-items: center; gap: 14px; }
  &__sigil { width: 44px; height: 44px; border-radius: 10px; background: linear-gradient(135deg, #10b981, #0ea5e9); color: #fff; display: flex; align-items: center; justify-content: center; }
  &__copy { display: flex; flex-direction: column; gap: 4px; }
  &__title { font-size: 20px; font-weight: 600; margin: 0; color: #18181b; }
  &__sub { font-size: 13px; color: #71717a; margin: 0; }
}

.zg-flow-card {
  background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin-bottom: 18px;
  &__head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
  &__title { font-size: 16px; font-weight: 600; color: #18181b; margin: 0; }
}

.zg-flow-steps {
  display: flex; gap: 12px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0;
  position: relative; flex-wrap: wrap;
}
.zg-flow-step {
  display: flex; align-items: center; gap: 10px; padding: 10px 16px; border-radius: 10px;
  background: #f8fafc; border: 1px solid #e2e8f0; transition: all 0.2s;
  flex: 1; min-width: 180px;
  &.is-active { background: linear-gradient(135deg, #6366f1, #8b5cf6); border-color: transparent; color: #fff; box-shadow: 0 4px 12px rgba(99,102,241,0.3); }
  &.is-done { background: #d1fae5; border-color: #10b981; color: #047857; }
  &__num {
    width: 28px; height: 28px; border-radius: 50%; background: #fff; color: #6366f1;
    display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700;
  }
  &.is-active &__num { color: #6366f1; }
  &.is-done &__num { color: #059669; }
  &__body { display: flex; flex-direction: column; }
  &__title { font-size: 13px; font-weight: 600; }
}

.zg-flow-actions { position: absolute; right: 0; top: 16px; display: flex; gap: 8px; }

.zg-region-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px;
}
.zg-region-card {
  display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 16px;
  border: 2px solid #e2e8f0; border-radius: 12px; cursor: pointer; transition: all 0.2s;
  background: #f8fafc; color: #52525b;
  &:hover { border-color: #6366f1; background: #f5f3ff; color: #6366f1; }
  &.is-selected { border-color: #6366f1; background: #ede9fe; color: #6366f1; }
  &__count { font-size: 12px; color: #71717a; font-style: normal; margin-top: 4px; }
}

.zg-pole-select-toolbar {
  display: flex; gap: 16px; align-items: center; margin-bottom: 14px; padding: 12px 14px; background: #f8fafc; border-radius: 10px;
}
.zg-pole-select-count { margin-left: auto; font-size: 13px; color: #71717a; font-weight: 500; }

.zg-preview-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 12px;
}
.zg-qr-preview {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
}
.zg-qr-preview__box {
  width: 100px; height: 100px; padding: 6px; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px;
}
.zg-qr-mini { width: 88px; height: 88px; }
.zg-qr-preview__text { font-family: ui-monospace, monospace; font-size: 12px; font-weight: 600; color: #6366f1; }
.zg-qr-preview__more {
  grid-column: span 3; display: flex; align-items: center; justify-content: center;
  padding: 12px; background: #ede9fe; color: #6366f1; border-radius: 8px; font-size: 13px; font-weight: 600;
}
.zg-flow-tip { margin-top: 16px; padding: 12px 16px; background: #f5f3ff; border-radius: 8px; color: #6366f1; font-size: 14px;
  strong { font-weight: 700; font-size: 16px; margin: 0 4px; }
}

.zg-download-grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;
}
.zg-download-card {
  display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 24px;
  border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc;
  h4 { margin: 0; font-size: 15px; font-weight: 600; color: #18181b; }
  p { margin: 0; font-size: 13px; color: #71717a; text-align: center; }
}

.zg-panel { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 18px;
  &__head { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: #52525b; margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid #e2e8f0; }
  &--ledger { margin-top: 18px; }
}

.zg-filterband { padding: 14px 16px; background: #f8fafc; border-radius: 10px; margin-bottom: 14px;
  &__row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
}

.zg-code { font-family: ui-monospace, monospace; font-size: 12px; font-weight: 600; color: #10b981; }

.ml-auto { margin-left: auto; }
</style>
