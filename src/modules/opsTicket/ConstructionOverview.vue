<!--
  智光云枢 · 运维工单 · 施工管理总览
  业务域：opsTicket
  功能：四类施工/运维工单汇总看板，告警处置/检修工单/设备检修记录/委外工单全景统计
-->
<template>
  <section class="zg-construction">
    <header class="zg-construction__head">
      <div class="zg-construction__headline">
        <div class="zg-construction__sigil">
          <el-icon :size="22"><Tools /></el-icon>
        </div>
        <div class="zg-construction__copy">
          <h1 class="zg-construction__title">施工管理总览</h1>
          <p class="zg-construction__sub">四类工单全域汇总 · 告警处置 / 检修工单 / 设备检修记录 / 委外工单</p>
        </div>
      </div>
      <div class="zg-construction__cta">
        <el-date-picker v-model="periodRange" type="daterange" range-separator="至"
          start-placeholder="开始日期" end-placeholder="结束日期" style="width: 260px" />
        <el-button type="primary"><el-icon><Search /></el-icon><span>查询</span></el-button>
        <el-button><el-icon><Download /></el-icon><span>导出报表</span></el-button>
      </div>
    </header>

    <!-- 四类工单汇总卡片 -->
    <div class="zg-metrics">
      <div class="zg-metrics__cell zg-metrics__cell--danger">
        <span class="zg-metrics__num">{{ overview.alarmCount }}</span>
        <span class="zg-metrics__lbl">告警处置数</span>
        <span class="zg-metrics__delta">环比 +12%</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--primary">
        <span class="zg-metrics__num">{{ overview.repairCount }}</span>
        <span class="zg-metrics__lbl">检修工单总数</span>
        <span class="zg-metrics__delta">完成率 {{ overview.repairRate }}%</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--success">
        <span class="zg-metrics__num">{{ overview.deviceRecords }}</span>
        <span class="zg-metrics__lbl">设备检修记录</span>
        <span class="zg-metrics__delta">合格率 98.5%</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <span class="zg-metrics__num">{{ overview.outsourceCount }}</span>
        <span class="zg-metrics__lbl">委外工单数</span>
        <span class="zg-metrics__delta">金额 ¥{{ (overview.outsourceAmount / 10000).toFixed(1) }}万</span>
      </div>
    </div>

    <!-- 四个 Tab 汇总表格 -->
    <div class="zg-panel">
      <el-tabs v-model="activeTab" class="zg-construction__tabs">
        <el-tab-pane name="alarm">
          <template #label>
            <span class="zg-tab-label"><el-icon><Warning /></el-icon>告警处置工单</span>
          </template>
        </el-tab-pane>
        <el-tab-pane name="repair">
          <template #label>
            <span class="zg-tab-label"><el-icon><Management /></el-icon>检修工单</span>
          </template>
        </el-tab-pane>
        <el-tab-pane name="device">
          <template #label>
            <span class="zg-tab-label"><el-icon><Memo /></el-icon>设备检修记录</span>
          </template>
        </el-tab-pane>
        <el-tab-pane name="outsource">
          <template #label>
            <span class="zg-tab-label"><el-icon><House /></el-icon>委外工单</span>
          </template>
        </el-tab-pane>
      </el-tabs>

      <!-- 过滤工具栏 -->
      <div class="zg-filterband">
        <div class="zg-filterband__row">
          <el-input v-model="filter.keyword" placeholder="搜索工单编号 / 标题" clearable style="width: 220px">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
          <el-select v-model="filter.status" placeholder="状态" style="width: 140px" clearable>
            <el-option label="待处理" value="待处理" />
            <el-option label="处理中" value="处理中" />
            <el-option label="已完成" value="已完成" />
            <el-option label="已取消" value="已取消" />
          </el-select>
          <el-button type="primary" size="small">筛选</el-button>
          <el-button size="small">重置</el-button>
        </div>
      </div>

      <!-- Tab 1: 告警处置工单 -->
      <el-table v-if="activeTab === 'alarm'" :data="alarmTickets" stripe border size="small" class="zg-datatable">
        <el-table-column prop="no" label="工单编号" width="150" />
        <el-table-column prop="title" label="告警标题" min-width="180" />
        <el-table-column prop="alarmLevel" label="告警级别" width="100">
          <template #default="{ row }">
            <el-tag :type="row.alarmLevel === '紧急' ? 'danger' : row.alarmLevel === '高' ? 'warning' : 'info'" size="small">{{ row.alarmLevel }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="source" label="告警来源" width="120" />
        <el-table-column prop="handler" label="处理人" width="90" align="center" />
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column prop="duration" label="处理时长" width="100" align="center">
          <template #default="{ row }">{{ row.duration }} h</template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <span class="zg-status" :class="statusClass(row.status)"><i class="dot"></i>{{ row.status }}</span>
          </template>
        </el-table-column>
      </el-table>

      <!-- Tab 2: 检修工单 -->
      <el-table v-if="activeTab === 'repair'" :data="repairTickets" stripe border size="small" class="zg-datatable">
        <el-table-column prop="no" label="工单编号" width="150" />
        <el-table-column prop="title" label="检修项目" min-width="180" />
        <el-table-column prop="deviceType" label="设备类型" width="110" />
        <el-table-column prop="deviceId" label="设备ID" width="140" />
        <el-table-column prop="repairType" label="检修类型" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ row.repairType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="handler" label="处理人" width="90" align="center" />
        <el-table-column prop="planTime" label="计划时间" width="160" />
        <el-table-column label="完成率" width="140">
          <template #default="{ row }">
            <el-progress :percentage="row.progress" :stroke-width="6" />
          </template>
        </el-table-column>
      </el-table>

      <!-- Tab 3: 设备检修记录 -->
      <el-table v-if="activeTab === 'device'" :data="deviceRecords" stripe border size="small" class="zg-datatable">
        <el-table-column prop="recordNo" label="记录编号" width="150" />
        <el-table-column prop="deviceId" label="设备ID" width="140" />
        <el-table-column prop="deviceName" label="设备名称" min-width="160" />
        <el-table-column prop="content" label="检修内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="conclusion" label="检修结论" width="110">
          <template #default="{ row }">
            <el-tag :type="row.conclusion === '合格' ? 'success' : 'danger'" size="small">{{ row.conclusion }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="inspector" label="检修人" width="90" align="center" />
        <el-table-column prop="date" label="检修日期" width="120" />
        <el-table-column prop="photoCount" label="照片数" width="80" align="center">
          <template #default="{ row }">
            <el-badge :value="row.photoCount" type="primary" :hidden="!row.photoCount" />
          </template>
        </el-table-column>
      </el-table>

      <!-- Tab 4: 委外工单 -->
      <el-table v-if="activeTab === 'outsource'" :data="outsourceTickets" stripe border size="small" class="zg-datatable">
        <el-table-column prop="no" label="工单编号" width="150" />
        <el-table-column prop="internalNo" label="关联内部工单" width="150" />
        <el-table-column prop="vendor" label="实施单位" width="160" />
        <el-table-column prop="content" label="实施内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="startDate" label="开始日期" width="120" />
        <el-table-column prop="endDate" label="结束日期" width="120" />
        <el-table-column label="进度" width="140">
          <template #default="{ row }">
            <el-progress :percentage="row.progress" :stroke-width="6" />
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="结算金额" width="120" align="right">
          <template #default="{ row }">¥{{ row.amount.toLocaleString() }}</template>
        </el-table-column>
      </el-table>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Tools, Search, Download, Warning, Management, Memo, House } from "@element-plus/icons-vue"

const periodRange = ref(null)
const activeTab = ref('alarm')
const filter = reactive({ keyword: '', status: '' })

// 汇总指标
const overview = ref({
  alarmCount: 156,
  repairCount: 328,
  deviceRecords: 892,
  outsourceCount: 47,
  repairRate: 87,
  outsourceAmount: 2365000
})

// 告警处置工单 mock
const alarmTickets = ref([
  { no: 'ALM-20261101001', title: '先导路K0+350路灯不亮', alarmLevel: '紧急', source: 'LAMP-CTRL', handler: '张工', createTime: '2026-11-01 08:23', duration: 2.5, status: '已完成' },
  { no: 'ALM-20261101002', title: '麓谷大道配电箱温度异常', alarmLevel: '高', source: 'DBX-SENSOR', handler: '李工', createTime: '2026-11-01 09:15', duration: 3.0, status: '已完成' },
  { no: 'ALM-20261101003', title: '梅溪湖变压器过流告警', alarmLevel: '紧急', source: 'TXT-PROT', handler: '王工', createTime: '2026-11-01 14:02', duration: 4.5, status: '处理中' },
  { no: 'ALM-20261102001', title: '金星大道电缆井水位超标', alarmLevel: '中', source: 'WATER-SENSOR', handler: '赵工', createTime: '2026-11-02 07:55', duration: 1.5, status: '已完成' },
  { no: 'ALM-20261102002', title: '岳麓大道LED灯具通讯中断', alarmLevel: '中', source: 'LAMP-GATEWAY', handler: '刘工', createTime: '2026-11-02 10:30', duration: 2.0, status: '已完成' },
  { no: 'ALM-20261102003', title: '湘江路充电桩故障告警', alarmLevel: '高', source: 'CHARGER-CTRL', handler: '陈工', createTime: '2026-11-02 13:45', duration: 0, status: '待处理' },
  { no: 'ALM-20261103001', title: '天心大道控制箱离线告警', alarmLevel: '中', source: 'DBX-GATEWAY', handler: '张工', createTime: '2026-11-03 06:12', duration: 1.0, status: '已完成' },
  { no: 'ALM-20261103002', title: '芙蓉路监控摄像头故障', alarmLevel: '低', source: 'CAM-HEARTBEAT', handler: '李工', createTime: '2026-11-03 09:00', duration: 0, status: '处理中' },
  { no: 'ALM-20261103003', title: '开福大道接地电阻超限', alarmLevel: '高', source: 'EARTH-TEST', handler: '王工', createTime: '2026-11-03 11:20', duration: 3.5, status: '已完成' },
  { no: 'ALM-20261104001', title: '雨花路智能控制器异常重启', alarmLevel: '中', source: 'CTRL-LOG', handler: '赵工', createTime: '2026-11-04 08:05', duration: 2.5, status: '已完成' },
  { no: 'ALM-20261104002', title: '先导路主干馈线跳闸', alarmLevel: '紧急', source: 'BREAKER', handler: '张工', createTime: '2026-11-04 16:30', duration: 0, status: '处理中' },
  { no: 'ALM-20261105001', title: '麓谷分支回路电流不平衡', alarmLevel: '中', source: 'METER', handler: '李工', createTime: '2026-11-05 07:45', duration: 2.0, status: '已完成' }
])

// 检修工单 mock
const repairTickets = ref([
  { no: 'RPR-20261101001', title: '先导路1#箱变年度检修', deviceType: '箱变', deviceId: 'TXT-XD001', repairType: '定期检修', handler: '张工', planTime: '2026-11-05 08:00', progress: 100 },
  { no: 'RPR-20261101002', title: '麓谷分支馈线故障检修', deviceType: '馈线', deviceId: 'FL-LG002', repairType: '故障检修', handler: '李工', planTime: '2026-11-03 09:00', progress: 100 },
  { no: 'RPR-20261102001', title: '梅溪湖3#配电箱更换散热风扇', deviceType: '配电箱', deviceId: 'DBX-MX003', repairType: '故障检修', handler: '王工', planTime: '2026-11-06 10:00', progress: 75 },
  { no: 'RPR-20261102002', title: '金星大道主干电缆绝缘检测', deviceType: '电缆', deviceId: 'CBL-JX001', repairType: '定期检修', handler: '赵工', planTime: '2026-11-07 08:30', progress: 40 },
  { no: 'RPR-20261103001', title: '岳麓大道景观灯线路修复', deviceType: '灯具', deviceId: 'LMP-YL015', repairType: '故障检修', handler: '刘工', planTime: '2026-11-04 09:30', progress: 100 },
  { no: 'RPR-20261103002', title: '湘江路充电桩模块更换', deviceType: '充电桩', deviceId: 'CHG-XJ008', repairType: '故障检修', handler: '陈工', planTime: '2026-11-08 14:00', progress: 20 },
  { no: 'RPR-20261104001', title: '天心大道控制器固件升级', deviceType: '控制模块', deviceId: 'CTRL-TX012', repairType: '定期检修', handler: '张工', planTime: '2026-11-09 08:00', progress: 0 },
  { no: 'RPR-20261104002', title: '芙蓉路监控摄像机镜头清洗', deviceType: '摄像头', deviceId: 'CAM-FR007', repairType: '日常维护', handler: '李工', planTime: '2026-11-02 15:00', progress: 100 },
  { no: 'RPR-20261105001', title: '开福大道电缆井清淤排水', deviceType: '电缆井', deviceId: 'MANHOLE-KF021', repairType: '日常维护', handler: '王工', planTime: '2026-11-10 08:00', progress: 0 },
  { no: 'RPR-20261105002', title: '雨花路接地系统检测', deviceType: '接地装置', deviceId: 'EARTH-YH005', repairType: '定期检修', handler: '赵工', planTime: '2026-11-11 09:00', progress: 0 },
  { no: 'RPR-20261106001', title: '先导路路灯杆紧固检查', deviceType: '灯杆', deviceId: 'GD-XD045', repairType: '定期检修', handler: '刘工', planTime: '2026-11-05 10:00', progress: 100 },
  { no: 'RPR-20261106002', title: '麓谷大道变压器油位检查', deviceType: '箱变', deviceId: 'TXT-LG002', repairType: '定期检修', handler: '陈工', planTime: '2026-11-12 08:00', progress: 0 }
])

// 设备检修记录 mock
const deviceRecords = ref([
  { recordNo: 'RC-20261101001', deviceId: 'TXT-XD001', deviceName: '先导路1#箱变', content: '年度绝缘检测、散热系统清洁、紧固检查', conclusion: '合格', inspector: '张工', date: '2026-11-01', photoCount: 12 },
  { recordNo: 'RC-20261101002', deviceId: 'DBX-LG002', deviceName: '麓谷2#配电箱', content: '断路器分合闸测试、接线端子紧固、温度监测', conclusion: '合格', inspector: '李工', date: '2026-11-01', photoCount: 8 },
  { recordNo: 'RC-20261102001', deviceId: 'LMP-MX023', deviceName: '梅溪湖LED灯具', content: '照度检测、色温校验、光衰测试', conclusion: '合格', inspector: '王工', date: '2026-11-02', photoCount: 5 },
  { recordNo: 'RC-20261102002', deviceId: 'CBL-JX001', deviceName: '金星大道主干电缆', content: '绝缘电阻测试、护套破损检查、环流检测', conclusion: '合格', inspector: '赵工', date: '2026-11-02', photoCount: 15 },
  { recordNo: 'RC-20261103001', deviceId: 'GD-YL015', deviceName: '岳麓大道15号灯杆', content: '垂直度检测、焊缝检查、防腐涂层检测', conclusion: '合格', inspector: '刘工', date: '2026-11-03', photoCount: 6 },
  { recordNo: 'RC-20261103002', deviceId: 'CHG-XJ008', deviceName: '湘江路8号充电桩', content: '功率模块测试、防雷检测、通讯验证', conclusion: '合格', inspector: '陈工', date: '2026-11-03', photoCount: 9 },
  { recordNo: 'RC-20261104001', deviceId: 'CTRL-TX012', deviceName: '天心大道控制器', content: '固件版本检查、日志清理、网关通讯测试', conclusion: '合格', inspector: '张工', date: '2026-11-04', photoCount: 4 },
  { recordNo: 'RC-20261104002', deviceId: 'CAM-FR007', deviceName: '芙蓉路监控摄像机', content: '画面清晰度测试、夜视效果测试、云台巡检', conclusion: '合格', inspector: '李工', date: '2026-11-04', photoCount: 7 },
  { recordNo: 'RC-20261105001', deviceId: 'MANHOLE-KF021', deviceName: '开福大道21号电缆井', content: '井内积水清理、支架检查、电缆防护检查', conclusion: '不合格', inspector: '王工', date: '2026-11-05', photoCount: 11 },
  { recordNo: 'RC-20261105002', deviceId: 'EARTH-YH005', deviceName: '雨花路5号接地装置', content: '接地电阻测试、引下线检查、防腐层检测', conclusion: '合格', inspector: '赵工', date: '2026-11-05', photoCount: 6 },
  { recordNo: 'RC-20261106001', deviceId: 'GD-XD045', deviceName: '先导路45号灯杆', content: '螺栓紧固检查、法兰盘清洁、防坠绳检查', conclusion: '合格', inspector: '刘工', date: '2026-11-06', photoCount: 5 },
  { recordNo: 'RC-20261106002', deviceId: 'TXT-LG002', deviceName: '麓谷2#箱变', content: '油位检查、呼吸器干燥、温度继电器校验', conclusion: '合格', inspector: '陈工', date: '2026-11-06', photoCount: 10 }
])

// 委外工单 mock
const outsourceTickets = ref([
  { no: 'OUT-20261101001', internalNo: 'WO-20261025003', vendor: '湖南恒通电力工程有限公司', content: '先导路K0+350-K1+200段电缆更换工程', startDate: '2026-11-01', endDate: '2026-11-15', progress: 85, amount: 185000 },
  { no: 'OUT-20261101002', internalNo: 'WO-20261028007', vendor: '长沙明辉照明工程有限公司', content: '麓谷大道LED灯具批量更换(300套)', startDate: '2026-11-03', endDate: '2026-11-20', progress: 60, amount: 268000 },
  { no: 'OUT-20261102001', internalNo: 'WO-20261030012', vendor: '湘电集团安装分公司', content: '梅溪湖3#箱变增容改造(500kVA→800kVA)', startDate: '2026-11-05', endDate: '2026-11-25', progress: 45, amount: 420000 },
  { no: 'OUT-20261102002', internalNo: 'WO-20261101001', vendor: '中电建市政工程有限公司', content: '金星大道电缆井改造(新增20座)', startDate: '2026-11-08', endDate: '2026-12-05', progress: 25, amount: 156000 },
  { no: 'OUT-20261103001', internalNo: 'WO-20261020005', vendor: '华电科技发展有限公司', content: '岳麓大道路灯智能控制系统升级', startDate: '2026-10-20', endDate: '2026-11-10', progress: 100, amount: 86000 },
  { no: 'OUT-20261103002', internalNo: 'WO-20261015009', vendor: '湖南智光检测技术有限公司', content: '湘江路电缆沟综合检测评估', startDate: '2026-10-15', endDate: '2026-10-30', progress: 100, amount: 42000 },
  { no: 'OUT-20261104001', internalNo: 'WO-20261104003', vendor: '长沙华诚电力检修有限公司', content: '天心大道4#配电箱大修', startDate: '2026-11-10', endDate: '2026-11-18', progress: 10, amount: 68000 },
  { no: 'OUT-20261104002', internalNo: 'WO-20261102008', vendor: '芙蓉建设工程有限公司', content: '芙蓉路LED景观带安装(2km)', startDate: '2026-11-12', endDate: '2026-12-15', progress: 5, amount: 320000 },
  { no: 'OUT-20261105001', internalNo: 'WO-20261022011', vendor: '开福机电安装工程公司', content: '开福大道充电桩安装工程(15台)', startDate: '2026-10-22', endDate: '2026-11-05', progress: 100, amount: 112000 },
  { no: 'OUT-20261105002', internalNo: 'WO-20261105006', vendor: '雨花亮化工程有限公司', content: '雨花路路灯杆防腐翻新(80根)', startDate: '2026-11-15', endDate: '2026-11-30', progress: 0, amount: 95000 },
  { no: 'OUT-20261106001', internalNo: 'WO-20261018004', vendor: '先导智能科技有限公司', content: '先导路隧道照明节能改造', startDate: '2026-10-18', endDate: '2026-11-28', progress: 80, amount: 520000 },
  { no: 'OUT-20261106002', internalNo: 'WO-20261106002', vendor: '梅溪湖市政维护中心', content: '梅溪湖环湖路路灯巡检服务(年度)', startDate: '2026-11-01', endDate: '2027-10-31', progress: 12, amount: 180000 }
])

const statusClass = (status) => {
  if (status === '已完成') return 'online'
  if (status === '处理中') return 'idle'
  if (status === '待处理') return 'offline'
  return ''
}
</script>

<style scoped lang="scss">
.zg-construction {
  padding: 24px;

  &__head {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 20px; padding-bottom: 18px; border-bottom: 1px solid var(--zg-line-soft, #e2e8f0);
  }
  &__headline { display: flex; align-items: center; gap: 14px; }
  &__sigil {
    width: 44px; height: 44px; border-radius: 10px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff;
    display: flex; align-items: center; justify-content: center;
  }
  &__copy { display: flex; flex-direction: column; gap: 4px; }
  &__title { font-size: 20px; font-weight: 600; margin: 0; color: #18181b; }
  &__sub { font-size: 13px; color: #71717a; margin: 0; }
  &__cta { display: flex; gap: 10px; align-items: center; }
  &__tabs { margin-bottom: 0; }
}

.zg-metrics {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px;

  &__cell {
    background: #fff; border: 1px solid #e2e8f0; border-radius: 16px;
    padding: 16px 18px; display: flex; flex-direction: column; gap: 6px;
    box-shadow: 0 1px 3px rgba(15,23,42,0.04);
    position: relative; overflow: hidden;

    &::before { content: ''; position: absolute; left: 0; top: 0; width: 3px; height: 100%; background: #6366f1; }
    &--primary::before { background: #6366f1; }
    &--success::before { background: #059669; }
    &--warn::before { background: #d97706; }
    &--danger::before { background: #dc2626; }
  }
  &__num { font-size: 26px; font-weight: 700; color: #18181b; line-height: 1; }
  &__lbl { font-size: 12px; color: #71717a; }
  &__delta { font-size: 11px; color: #6366f1; font-weight: 500; }
}

.zg-panel {
  background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 18px;
}

.zg-filterband {
  padding: 14px 16px; background: #f8fafc; border-radius: 10px; margin-bottom: 14px;
  &__row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
}

.zg-tab-label { display: inline-flex; align-items: center; gap: 6px; }

.zg-status {
  display: inline-flex; align-items: center; gap: 5px; font-size: 12px;
  padding: 2px 8px; border-radius: 999px;
  .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
  &.online { color: #059669; background: #d1fae5; }
  &.offline { color: #dc2626; background: #fee2e2; }
  &.idle { color: #d97706; background: #fef3c7; }
}

.zg-datatable { width: 100%; }
</style>
