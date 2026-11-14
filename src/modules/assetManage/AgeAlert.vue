<!--
  智光云枢 · 资产维保 · 年限节点预警
  业务域：assetManage
  功能：设备设计寿命年限节点预警，支持 age_stage 徽章 NORMAL/WARNING/CRITICAL
-->
<template>
  <section class="zg-age-alert">
    <header class="zg-age-alert__head">
      <div class="zg-age-alert__headline">
        <div class="zg-age-alert__sigil">
          <el-icon :size="22"><Clock /></el-icon>
        </div>
        <div class="zg-age-alert__copy">
          <h1 class="zg-age-alert__title">年限节点预警</h1>
          <p class="zg-age-alert__sub">设备设计寿命追踪 · 10/15年节点 · 保养/更换/检测建议</p>
        </div>
      </div>
      <div class="zg-age-alert__cta">
        <el-button type="primary"><el-icon><Bell /></el-icon><span>订阅预警</span></el-button>
        <el-button><el-icon><Download /></el-icon><span>导出清单</span></el-button>
      </div>
    </header>

    <!-- 指标卡 -->
    <div class="zg-metrics">
      <div class="zg-metrics__cell zg-metrics__cell--success">
        <span class="zg-metrics__num">{{ kpi.normalCount }}</span>
        <span class="zg-metrics__lbl">正常使用</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <span class="zg-metrics__num">{{ kpi.warningCount }}</span>
        <span class="zg-metrics__lbl">保养预警 (10年)</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--danger">
        <span class="zg-metrics__num">{{ kpi.criticalCount }}</span>
        <span class="zg-metrics__lbl">更换预警 (15年)</span>
      </div>
      <div class="zg-metrics__cell">
        <span class="zg-metrics__num">{{ kpi.totalAssets }}</span>
        <span class="zg-metrics__lbl">在役设备总数</span>
      </div>
    </div>

    <!-- 过滤工具栏 -->
    <div class="zg-filterband">
      <div class="zg-filterband__row">
        <el-input v-model="filter.keyword" placeholder="搜索设备编号 / 类型" clearable style="width: 240px">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-select v-model="filter.deviceType" placeholder="设备类型" style="width: 140px" clearable>
          <el-option v-for="t in deviceTypes" :key="t" :label="t" :value="t" />
        </el-select>
        <el-select v-model="filter.ageStage" placeholder="预警状态" style="width: 130px" clearable>
          <el-option label="NORMAL 正常" value="NORMAL" />
          <el-option label="WARNING 保养" value="WARNING" />
          <el-option label="CRITICAL 更换" value="CRITICAL" />
        </el-select>
        <el-select v-model="filter.alertType" placeholder="预警类型" style="width: 120px" clearable>
          <el-option label="保养" value="保养" />
          <el-option label="更换" value="更换" />
          <el-option label="检测" value="检测" />
        </el-select>
        <div class="zg-filterband__actions">
          <el-button type="primary" size="small">筛选</el-button>
          <el-button size="small">重置</el-button>
        </div>
      </div>
    </div>

    <!-- 预警表格 -->
    <div class="zg-panel">
      <el-table :data="filteredAlerts" stripe border size="small" class="zg-datatable">
        <el-table-column prop="deviceCode" label="设备编号" width="150" fixed>
          <template #default="{ row }">
            <span class="zg-code">{{ row.deviceCode }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="deviceType" label="设备类型" width="110" />
        <el-table-column prop="installDate" label="安装日期" width="120" />
        <el-table-column label="设计寿命" width="110" align="center">
          <template #default="{ row }">
            <span class="zg-life">{{ row.designLife }} 年</span>
          </template>
        </el-table-column>
        <el-table-column label="当前年龄" width="140" align="center">
          <template #default="{ row }">
            <div class="zg-age-cell">
              <span class="zg-age-num" :class="{ 'is-critical': row.currentAge >= row.designLife }">{{ row.currentAge.toFixed(1) }}</span>
              <span class="zg-age-unit">年</span>
              <div class="zg-age-bar">
                <div class="zg-age-fill" :style="{ width: Math.min((row.currentAge / row.designLife) * 100, 100) + '%' }"
                  :class="ageFillClass(row)"></div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="年限节点" width="120" align="center">
          <template #default="{ row }">
            <div class="zg-milestones">
              <span class="zg-milestone" :class="{ 'is-past': row.currentAge >= 10 }">10</span>
              <span class="zg-milestone-sep">·</span>
              <span class="zg-milestone" :class="{ 'is-past': row.currentAge >= 15 }">15</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="预警状态" width="140" align="center">
          <template #default="{ row }">
            <span class="zg-age-badge" :class="'zg-age-badge--' + row.ageStage.toLowerCase()">
              <i class="zg-age-badge__dot"></i>{{ row.ageStage }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="预警类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="alertTagType(row.alertType)" size="small">{{ row.alertType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="suggestion" label="建议动作" min-width="180" show-overflow-tooltip />
        <el-table-column prop="suggestDate" label="建议日期" width="130" />
        <el-table-column label="状态" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <span class="zg-status" :class="row.status === '待处理' ? 'idle' : row.status === '已完成' ? 'online' : 'offline'">
              {{ row.status }}
            </span>
          </template>
        </el-table-column>
      </el-table>

      <div class="zg-pagerbar">
        <el-pagination v-model:current-page="pager.page" v-model:page-size="pager.size"
          :total="filteredAlerts.length" :page-sizes="[10, 20, 30, 50]"
          layout="prev, pager, next, jumper, ->, sizes, total" background />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Clock, Bell, Download, Search } from "@element-plus/icons-vue"

const deviceTypes = ['灯杆', 'LED灯具', '配电箱', '控制模块', '摄像头', '充电桩', '箱变', '电缆', '接地装置']

const filter = reactive({ keyword: '', deviceType: '', ageStage: '', alertType: '' })
const pager = reactive({ page: 1, size: 20 })

const kpi = ref({ totalAssets: 3856, normalCount: 3120, warningCount: 528, criticalCount: 208 })

// 预警 mock - 14 条，覆盖不同节点
const alerts = ref([
  { deviceCode: 'GD-XD018', deviceType: '灯杆', installDate: '2011-03-15', designLife: 15, currentAge: 15.7, ageNode: 15, ageStage: 'CRITICAL', alertType: '更换', suggestion: '杆体防腐层严重老化，建议整体更换', suggestDate: '2026-12-31', status: '待处理' },
  { deviceCode: 'GD-LG025', deviceType: '灯杆', installDate: '2013-06-20', designLife: 15, currentAge: 13.4, ageNode: 10, ageStage: 'WARNING', alertType: '保养', suggestion: '加强防腐检测与紧固检查频率', suggestDate: '2026-11-30', status: '处理中' },
  { deviceCode: 'LMP-MX045', deviceType: 'LED灯具', installDate: '2014-08-10', designLife: 5, currentAge: 12.2, ageNode: 10, ageStage: 'CRITICAL', alertType: '更换', suggestion: '光衰超过60%，建议整批更换', suggestDate: '2026-12-15', status: '待处理' },
  { deviceCode: 'TXT-JX003', deviceType: '箱变', installDate: '2009-05-25', designLife: 25, currentAge: 17.6, ageNode: 15, ageStage: 'WARNING', alertType: '检测', suggestion: '增加绝缘检测和油色谱分析频次', suggestDate: '2026-11-20', status: '已完成' },
  { deviceCode: 'DBX-YL012', deviceType: '配电箱', installDate: '2016-11-08', designLife: 15, currentAge: 10.2, ageNode: 10, ageStage: 'WARNING', alertType: '保养', suggestion: '重点检查接线端子、断路器特性', suggestDate: '2026-12-01', status: '待处理' },
  { deviceCode: 'CBL-FR008', deviceType: '电缆', installDate: '2008-07-15', designLife: 20, currentAge: 18.4, ageNode: 15, ageStage: 'WARNING', alertType: '检测', suggestion: '开展绝缘诊断和护套破损排查', suggestDate: '2026-11-25', status: '处理中' },
  { deviceCode: 'EARTH-KF003', deviceType: '接地装置', installDate: '2010-04-10', designLife: 15, currentAge: 16.5, ageNode: 15, ageStage: 'CRITICAL', alertType: '更换', suggestion: '接地电阻不合格，建议改造升级', suggestDate: '2027-01-15', status: '待处理' },
  { deviceCode: 'CTRL-TX022', deviceType: '控制模块', installDate: '2018-02-20', designLife: 10, currentAge: 8.8, ageNode: 10, ageStage: 'NORMAL', alertType: '检测', suggestion: '计划内定期维保，关注固件升级', suggestDate: '2027-05-15', status: '已完成' },
  { deviceCode: 'CAM-XJ018', deviceType: '摄像头', installDate: '2017-09-30', designLife: 8, currentAge: 9.2, ageNode: 10, ageStage: 'WARNING', alertType: '保养', suggestion: '检查图像传感器、云台磨损情况', suggestDate: '2026-12-10', status: '待处理' },
  { deviceCode: 'CHG-YH005', deviceType: '充电桩', installDate: '2019-06-15', designLife: 8, currentAge: 7.4, ageNode: 10, ageStage: 'NORMAL', alertType: '保养', suggestion: '检查功率模块散热、充电枪磨损', suggestDate: '2027-02-28', status: '已完成' },
  { deviceCode: 'GD-XD065', deviceType: '灯杆', installDate: '2005-08-20', designLife: 15, currentAge: 21.2, ageNode: 15, ageStage: 'CRITICAL', alertType: '更换', suggestion: '杆体弯曲变形，安全隐患极高', suggestDate: '2026-12-31', status: '待处理' },
  { deviceCode: 'DBX-LG008', deviceType: '配电箱', installDate: '2012-12-05', designLife: 15, currentAge: 13.9, ageNode: 10, ageStage: 'WARNING', alertType: '检测', suggestion: '开展全面绝缘检测和元器件更换', suggestDate: '2026-11-28', status: '处理中' },
  { deviceCode: 'LMP-XD012', deviceType: 'LED灯具', installDate: '2020-10-10', designLife: 5, currentAge: 6.1, ageNode: 10, ageStage: 'NORMAL', alertType: '保养', suggestion: '常规照度检测，关注光衰', suggestDate: '2027-04-10', status: '已完成' },
  { deviceCode: 'TXT-FR004', deviceType: '箱变', installDate: '2004-03-28', designLife: 25, currentAge: 22.6, ageNode: 15, ageStage: 'CRITICAL', alertType: '更换', suggestion: '建议纳入2027年箱变增容改造计划', suggestDate: '2027-06-30', status: '待处理' }
])

const filteredAlerts = computed(() => {
  return alerts.value.filter(a => {
    const matchKw = !filter.keyword.trim() || a.deviceCode.includes(filter.keyword) || a.deviceType.includes(filter.keyword)
    const matchType = !filter.deviceType || a.deviceType === filter.deviceType
    const matchStage = !filter.ageStage || a.ageStage === filter.ageStage
    const matchAlert = !filter.alertType || a.alertType === filter.alertType
    return matchKw && matchType && matchStage && matchAlert
  })
})

function ageFillClass(row) {
  const ratio = row.currentAge / row.designLife
  if (ratio >= 1) return 'is-critical'
  if (ratio >= 0.67) return 'is-warning'
  return ''
}
function alertTagType(t) {
  if (t === '更换') return 'danger'
  if (t === '保养') return 'warning'
  return 'info'
}
</script>

<style scoped lang="scss">
.zg-age-alert {
  padding: 24px;
  &__head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 20px; padding-bottom: 18px; border-bottom: 1px solid #e2e8f0; }
  &__headline { display: flex; align-items: center; gap: 14px; }
  &__sigil { width: 44px; height: 44px; border-radius: 10px; background: linear-gradient(135deg, #f59e0b, #ef4444); color: #fff; display: flex; align-items: center; justify-content: center; }
  &__copy { display: flex; flex-direction: column; gap: 4px; }
  &__title { font-size: 20px; font-weight: 600; margin: 0; color: #18181b; }
  &__sub { font-size: 13px; color: #71717a; margin: 0; }
  &__cta { display: flex; gap: 10px; }
}

.zg-metrics {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 18px;
  &__cell { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px 18px; display: flex; flex-direction: column; gap: 6px; box-shadow: 0 1px 3px rgba(15,23,42,0.04); position: relative; overflow: hidden;
    &::before { content: ''; position: absolute; left: 0; top: 0; width: 3px; height: 100%; background: #0ea5e9; }
    &--success::before { background: #059669; }
    &--warn::before { background: #d97706; }
    &--danger::before { background: #dc2626; }
  }
  &__num { font-size: 26px; font-weight: 700; color: #18181b; line-height: 1; }
  &__lbl { font-size: 12px; color: #71717a; }
}

.zg-filterband {
  padding: 14px 16px; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 16px;
  &__row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
  &__actions { margin-left: auto; display: flex; gap: 8px; }
}

.zg-panel { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 18px; }

.zg-code { font-family: ui-monospace, monospace; font-size: 12px; font-weight: 600; color: #6366f1; }
.zg-life { display: inline-block; padding: 2px 10px; background: #f1f5f9; color: #475569; border-radius: 6px; font-size: 12px; font-weight: 500; }

.zg-age-cell { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.zg-age-num { font-size: 18px; font-weight: 700; color: #18181b; &.is-critical { color: #dc2626; } }
.zg-age-unit { font-size: 11px; color: #71717a; }
.zg-age-bar { width: 100%; height: 6px; background: #f1f5f9; border-radius: 999px; overflow: hidden; }
.zg-age-fill { height: 100%; background: #059669; border-radius: 999px; transition: width 0.3s;
  &.is-warning { background: #d97706; }
  &.is-critical { background: #dc2626; }
}

.zg-milestones { display: flex; align-items: center; gap: 4px; justify-content: center; }
.zg-milestone { padding: 1px 8px; border-radius: 4px; background: #f1f5f9; color: #94a3b8; font-size: 11px; font-weight: 600;
  &.is-past { background: #dc2626; color: #fff; }
}
.zg-milestone-sep { color: #cbd5e1; }

.zg-age-badge {
  display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 600;
  padding: 3px 10px; border-radius: 999px; letter-spacing: 0.5px;
  &__dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
  &--normal { color: #059669; background: #d1fae5; }
  &--warning { color: #d97706; background: #fef3c7; }
  &--critical { color: #dc2626; background: #fee2e2; animation: pulse 1.5s infinite; }
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.zg-status {
  display: inline-block; font-size: 12px; padding: 2px 8px; border-radius: 999px;
  &.online { color: #059669; background: #d1fae5; }
  &.idle { color: #d97706; background: #fef3c7; }
  &.offline { color: #dc2626; background: #fee2e2; }
}

.zg-pagerbar { display: flex; justify-content: flex-end; padding-top: 14px; }
</style>
