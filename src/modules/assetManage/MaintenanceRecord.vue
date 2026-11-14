<!--
  智光云枢 · 资产维保 · 维保记录查询
  业务域：assetManage
  功能：设备维保记录全量查询，含维保类型、耗材更换、检测数据、照片附件
-->
<template>
  <section class="zg-maint-record">
    <header class="zg-maint-record__head">
      <div class="zg-maint-record__headline">
        <div class="zg-maint-record__sigil">
          <el-icon :size="22"><Memo /></el-icon>
        </div>
        <div class="zg-maint-record__copy">
          <h1 class="zg-maint-record__title">维保记录查询</h1>
          <p class="zg-maint-record__sub">设备维保全量档案 · 耗材更换 · 检测数据 · 照片归档</p>
        </div>
      </div>
      <div class="zg-maint-record__cta">
        <el-button type="primary"><el-icon><Plus /></el-icon><span>新增记录</span></el-button>
        <el-button><el-icon><Download /></el-icon><span>批量导出</span></el-button>
      </div>
    </header>

    <!-- 指标卡 -->
    <div class="zg-metrics">
      <div class="zg-metrics__cell">
        <span class="zg-metrics__num">{{ kpi.totalRecords }}</span>
        <span class="zg-metrics__lbl">年度维保记录总数</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--success">
        <span class="zg-metrics__num">{{ kpi.qualifiedRate }}<em>%</em></span>
        <span class="zg-metrics__lbl">维保合格率</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <span class="zg-metrics__num">{{ kpi.nextDueCount }}</span>
        <span class="zg-metrics__lbl">待执行计划维保</span>
      </div>
      <div class="zg-metrics__cell">
        <span class="zg-metrics__num">¥{{ (kpi.materialCost / 10000).toFixed(1) }}<em>万</em></span>
        <span class="zg-metrics__lbl">耗材消耗金额</span>
      </div>
    </div>

    <!-- 过滤工具栏 -->
    <div class="zg-filterband">
      <div class="zg-filterband__row">
        <el-input v-model="filter.keyword" placeholder="搜索维保编号 / 设备ID / 设备类型" clearable style="width: 260px">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-select v-model="filter.deviceType" placeholder="设备类型" style="width: 140px" clearable>
          <el-option v-for="t in deviceTypes" :key="t" :label="t" :value="t" />
        </el-select>
        <el-select v-model="filter.maintenanceType" placeholder="维保类型" style="width: 130px" clearable>
          <el-option label="定期维保" value="定期" />
          <el-option label="故障维修" value="故障" />
          <el-option label="随机巡查" value="随机" />
        </el-select>
        <el-date-picker v-model="filter.dateRange" type="daterange" range-separator="至"
          start-placeholder="开始日期" end-placeholder="结束日期" style="width: 260px" />
        <div class="zg-filterband__actions">
          <el-button type="primary" size="small">查询</el-button>
          <el-button size="small">重置</el-button>
        </div>
      </div>
    </div>

    <!-- 记录表格 -->
    <div class="zg-panel">
      <el-table :data="filteredRecords" stripe border size="small" class="zg-datatable" height="580">
        <el-table-column prop="recordNo" label="维保编号" width="150" fixed />
        <el-table-column prop="deviceId" label="设备ID" width="140" />
        <el-table-column prop="deviceType" label="设备类型" width="110" />
        <el-table-column prop="maintenanceTime" label="维保时间" width="160" />
        <el-table-column label="维保类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.maintenanceType === '定期' ? 'success' : row.maintenanceType === '故障' ? 'danger' : 'info'" size="small">
              {{ row.maintenanceType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="handler" label="维保人员" width="90" align="center" />
        <el-table-column label="耗材更换" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row.materials.length">{{ row.materials.join('、') }}</span>
            <span v-else class="text-slate-300">无</span>
          </template>
        </el-table-column>
        <el-table-column label="检测数据摘要" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="zg-data-summary">
              <span v-for="(v, i) in row.dataSummary" :key="i" class="zg-data-chip">{{ v }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="维保结论" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.conclusion === '合格' ? 'success' : 'danger'" size="small">{{ row.conclusion }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="nextPlanTime" label="下次计划时间" width="130" />
        <el-table-column label="照片" width="140" align="center" fixed="right">
          <template #default="{ row }">
            <el-badge :value="row.photoCount" type="primary" :hidden="!row.photoCount" class="mr-2">
              <el-button link type="primary" size="small" :disabled="!row.photoCount">查看</el-button>
            </el-badge>
          </template>
        </el-table-column>
      </el-table>

      <div class="zg-pagerbar">
        <el-pagination v-model:current-page="pager.page" v-model:page-size="pager.size"
          :total="filteredRecords.length" :page-sizes="[10, 20, 30, 50]"
          layout="prev, pager, next, jumper, ->, sizes, total" background />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Memo, Plus, Download, Search } from "@element-plus/icons-vue"

const deviceTypes = ['灯杆', 'LED灯具', '配电箱', '控制模块', '摄像头', '充电桩', '箱变', '电缆', '接地装置']

const kpi = ref({ totalRecords: 1856, qualifiedRate: 96.5, nextDueCount: 48, materialCost: 2856000 })

const filter = reactive({ keyword: '', deviceType: '', maintenanceType: '', dateRange: null })
const pager = reactive({ page: 1, size: 20 })

// 维保记录 mock - 14 条
const records = ref([
  { recordNo: 'MRC-20261101001', deviceId: 'TXT-XD001', deviceType: '箱变', maintenanceTime: '2026-11-01 09:30', maintenanceType: '定期', handler: '张工', materials: ['变压器油 20L', '干燥剂 1包'], dataSummary: ['绝缘电阻 5000MΩ', '油温 42℃', '负载率 68%'], conclusion: '合格', nextPlanTime: '2027-05-01', photoCount: 12 },
  { recordNo: 'MRC-20261101002', deviceId: 'LMP-LG015', deviceType: 'LED灯具', maintenanceTime: '2026-11-01 14:20', maintenanceType: '故障', handler: '李工', materials: ['LED驱动模块 1块'], dataSummary: ['输入电压 220V', '输出电流 0.68A', '照度 0lx(故障)'], conclusion: '合格', nextPlanTime: '2027-05-15', photoCount: 5 },
  { recordNo: 'MRC-20261102001', deviceId: 'DBX-MX003', deviceType: '配电箱', maintenanceTime: '2026-11-02 10:00', maintenanceType: '定期', handler: '王工', materials: ['散热风扇 1个', '接线端子 8个'], dataSummary: ['断路器温度 38℃', '三相电流偏差 2%', '漏电流 15mA'], conclusion: '合格', nextPlanTime: '2027-05-02', photoCount: 10 },
  { recordNo: 'MRC-20261102002', deviceId: 'GD-JX012', deviceType: '灯杆', maintenanceTime: '2026-11-02 15:30', maintenanceType: '随机', handler: '赵工', materials: [], dataSummary: ['垂直度 0.3°', '法兰螺栓力矩 42N·m', '防腐涂层完好'], conclusion: '合格', nextPlanTime: '2027-11-02', photoCount: 3 },
  { recordNo: 'MRC-20261103001', deviceId: 'CTRL-TX008', deviceType: '控制模块', maintenanceTime: '2026-11-03 08:45', maintenanceType: '定期', handler: '张工', materials: ['存储芯片 1个'], dataSummary: ['固件版本 V4.2.1', '在线率 99.8%', '响应延迟 120ms'], conclusion: '合格', nextPlanTime: '2027-05-03', photoCount: 6 },
  { recordNo: 'MRC-20261103002', deviceId: 'CBL-YL005', deviceType: '电缆', maintenanceTime: '2026-11-03 11:20', maintenanceType: '故障', handler: '李工', materials: ['中间接头 1套', '绝缘胶带 1卷'], dataSummary: ['绝缘电阻 120MΩ(修复后)', '护套完好', '环流 2.3A'], conclusion: '合格', nextPlanTime: '2027-05-20', photoCount: 8 },
  { recordNo: 'MRC-20261104001', deviceId: 'CAM-XJ003', deviceType: '摄像头', maintenanceTime: '2026-11-04 09:15', maintenanceType: '定期', handler: '王工', materials: ['镜头清洁布'], dataSummary: ['画面清晰度 1080P', '夜视效果良好', '云台响应正常'], conclusion: '合格', nextPlanTime: '2027-05-04', photoCount: 4 },
  { recordNo: 'MRC-20261104002', deviceId: 'CHG-FR006', deviceType: '充电桩', maintenanceTime: '2026-11-04 14:00', maintenanceType: '定期', handler: '赵工', materials: ['功率模块散热片'], dataSummary: ['模块温度 52℃', '充电电压 380V', '通讯正常'], conclusion: '合格', nextPlanTime: '2027-05-04', photoCount: 7 },
  { recordNo: 'MRC-20261105001', deviceId: 'EARTH-KF001', deviceType: '接地装置', maintenanceTime: '2026-11-05 08:30', maintenanceType: '定期', handler: '刘工', materials: ['降阻剂 25kg'], dataSummary: ['接地电阻 3.8Ω', '引下线完好', '焊接点防腐'], conclusion: '合格', nextPlanTime: '2027-11-05', photoCount: 9 },
  { recordNo: 'MRC-20261105002', deviceId: 'LMP-YH021', deviceType: 'LED灯具', maintenanceTime: '2026-11-05 16:00', maintenanceType: '故障', handler: '陈工', materials: ['LED光源板 1套'], dataSummary: ['输入电压 220V', '输出电流 0A(损坏)', '光衰未测'], conclusion: '不合格', nextPlanTime: '2027-05-05', photoCount: 11 },
  { recordNo: 'MRC-20261106001', deviceId: 'GD-XD028', deviceType: '灯杆', maintenanceTime: '2026-11-06 10:00', maintenanceType: '定期', handler: '张工', materials: ['防坠绳 1根'], dataSummary: ['垂直度 0.2°', '防腐涂层 DFT 85μm', '螺栓力矩达标'], conclusion: '合格', nextPlanTime: '2027-11-06', photoCount: 5 },
  { recordNo: 'MRC-20261106002', deviceId: 'TXT-LG004', deviceType: '箱变', maintenanceTime: '2026-11-06 13:30', maintenanceType: '故障', handler: '李工', materials: ['散热风扇 2个', '温控继电器 1个'], dataSummary: ['油温 68℃(修复前)', '冷却后 45℃', '负载率 72%'], conclusion: '合格', nextPlanTime: '2027-05-06', photoCount: 15 },
  { recordNo: 'MRC-20261107001', deviceId: 'DBX-JX015', deviceType: '配电箱', maintenanceTime: '2026-11-07 09:00', maintenanceType: '随机', handler: '王工', materials: [], dataSummary: ['接线紧固力矩 32N·m', '绝缘电阻 500MΩ', '漏电流 12mA'], conclusion: '合格', nextPlanTime: '2027-05-07', photoCount: 2 },
  { recordNo: 'MRC-20261107002', deviceId: 'CTRL-YL012', deviceType: '控制模块', maintenanceTime: '2026-11-07 15:30', maintenanceType: '定期', handler: '赵工', materials: [], dataSummary: ['固件版本 V4.2.2(升级)', '内存占用 45%', '网关心跳 30s'], conclusion: '合格', nextPlanTime: '2027-05-07', photoCount: 6 }
])

const filteredRecords = computed(() => {
  return records.value.filter(r => {
    const matchKw = !filter.keyword.trim() ||
      r.recordNo.includes(filter.keyword) || r.deviceId.includes(filter.keyword) || r.deviceType.includes(filter.keyword)
    const matchType = !filter.deviceType || r.deviceType === filter.deviceType
    const matchMaint = !filter.maintenanceType || r.maintenanceType === filter.maintenanceType
    return matchKw && matchType && matchMaint
  })
})
</script>

<style scoped lang="scss">
.zg-maint-record {
  padding: 24px;
  &__head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 20px; padding-bottom: 18px; border-bottom: 1px solid #e2e8f0; }
  &__headline { display: flex; align-items: center; gap: 14px; }
  &__sigil { width: 44px; height: 44px; border-radius: 10px; background: linear-gradient(135deg, #d97706, #f59e0b); color: #fff; display: flex; align-items: center; justify-content: center; }
  &__copy { display: flex; flex-direction: column; gap: 4px; }
  &__title { font-size: 20px; font-weight: 600; margin: 0; color: #18181b; }
  &__sub { font-size: 13px; color: #71717a; margin: 0; }
  &__cta { display: flex; gap: 10px; }
}

.zg-metrics {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 18px;
  &__cell { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px 18px; display: flex; flex-direction: column; gap: 6px; box-shadow: 0 1px 3px rgba(15,23,42,0.04); position: relative; overflow: hidden;
    &::before { content: ''; position: absolute; left: 0; top: 0; width: 3px; height: 100%; background: #d97706; }
    &--success::before { background: #059669; }
    &--warn::before { background: #f59e0b; }
  }
  &__num { font-size: 26px; font-weight: 700; color: #18181b; line-height: 1; em { font-style: normal; font-size: 14px; color: #71717a; margin-left: 4px; font-weight: 400; } }
  &__lbl { font-size: 12px; color: #71717a; }
}

.zg-filterband {
  padding: 14px 16px; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 16px;
  &__row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
  &__actions { margin-left: auto; display: flex; gap: 8px; }
}

.zg-panel { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 18px; }

.zg-data-summary {
  display: flex; flex-wrap: wrap; gap: 4px;
}
.zg-data-chip {
  display: inline-block; padding: 2px 8px; border-radius: 4px; background: #f1f5f9; color: #475569; font-size: 11px; font-family: ui-monospace, monospace;
}

.zg-pagerbar { display: flex; justify-content: flex-end; padding-top: 14px; }

.text-slate-300 { color: #cbd5e1; }
.mr-2 { margin-right: 8px; }
</style>
