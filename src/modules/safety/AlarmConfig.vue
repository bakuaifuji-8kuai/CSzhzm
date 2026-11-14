<!--
  D-04 改造：分级告警对接推送领导通知 + 自动升级
  智光云枢 · 安全域 · 分级告警配置
-->
<template>
  <section class="zg-alarmcfg">
    <!-- 头部 -->
    <header class="zg-alarmcfg__head">
      <div class="zg-alarmcfg__headline">
        <div class="zg-alarmcfg__sigil">
          <el-icon :size="22"><Setting /></el-icon>
        </div>
        <div class="zg-alarmcfg__copy">
          <h1 class="zg-alarmcfg__title">分级告警配置</h1>
          <p class="zg-alarmcfg__sub">运维处置口径（OPS）+ 技术推送口径（TECH）双 Tab 独立管理</p>
        </div>
      </div>
    </header>

    <!-- Tab 切换 -->
    <div class="zg-alarmcfg__tabs">
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="🔧 运维处置口径（OPS）" name="ops">
          <div class="zg-tab-content">
            <div class="zg-tab-toolbar">
              <span class="zg-tab-desc">面向一线运维处置，按故障规模 / 影响范围 / 处置紧迫性分级</span>
              <el-button type="primary" size="default" :icon="Plus">新增规则</el-button>
            </div>
            <el-table :data="opsRules" stripe size="default" style="width: 100%">
              <el-table-column prop="code" label="级别代码" width="120">
                <template #default="{ row }">
                  <code class="zg-code">{{ row.code }}</code>
                </template>
              </el-table-column>
              <el-table-column prop="name" label="级别名称" width="160">
                <template #default="{ row }">
                  <el-tag :type="opsLevelTag(row.code)" effect="dark" size="default">{{ row.name }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="触发条件 JSON" min-width="280">
                <template #default="{ row }">
                  <div class="zg-trigger-json">
                    <div class="zg-json-field">
                      <span class="zg-json-key">故障规模：</span>
                      <el-tag size="small" effect="plain">{{ row.condition.scale }}</el-tag>
                    </div>
                    <div class="zg-json-field">
                      <span class="zg-json-key">影响范围：</span>
                      <el-tag size="small" effect="plain">{{ row.condition.scope }}</el-tag>
                    </div>
                    <div class="zg-json-field">
                      <span class="zg-json-key">安全类型：</span>
                      <el-tag size="small" effect="plain" :type="row.condition.safetyType === '人身安全' ? 'danger' : 'warning'">{{ row.condition.safetyType }}</el-tag>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="action" label="处置方式" width="180" />
              <el-table-column prop="channel" label="通知渠道" width="200">
                <template #default="{ row }">
                  <div class="zg-channel-tags">
                    <el-tag v-for="c in row.channel" :key="c" size="small" class="zg-channel-tag">{{ c }}</el-tag>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="ticketType" label="自动工单类型" width="150">
                <template #default="{ row }">
                  <el-tag size="small" effect="plain" type="success">{{ row.ticketType }}</el-tag>
                </template>
              </el-table-column>
              <!-- D-04 新增列 -->
              <el-table-column label="推送对象" min-width="180">
                <template #default="{ row }">
                  <div class="zg-channel-tags">
                    <el-tag
                      v-for="l in (row.notifyLeaders || [])"
                      :key="l"
                      size="small"
                      class="zg-channel-tag"
                      type="warning"
                    >{{ l }}</el-tag>
                    <span v-if="!row.notifyLeaders?.length" class="zg-empty-tip">无领导推送</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="升级通知" width="150" align="center">
                <template #default="{ row }">
                  <div class="zg-upgrade-cell">
                    <el-switch v-model="row.enableUpgrade" size="default" />
                    <span v-if="row.enableUpgrade" class="zg-upgrade-min">
                      {{ row.upgradeMinutes || 60 }}min
                    </span>
                  </div>
                </template>
              </el-table-column>
              <!-- /D-04 -->
              <el-table-column label="启用" width="80" align="center">
                <template #default="{ row }">
                  <el-switch v-model="row.enabled" size="default" />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120" align="center" fixed="right">
                <template #default="{ row }">
                  <el-button link type="primary" size="small">编辑</el-button>
                  <el-button link type="danger" size="small">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <el-tab-pane label="⚡ 技术推送口径（TECH）" name="tech">
          <div class="zg-tab-content">
            <div class="zg-tab-toolbar">
              <span class="zg-tab-desc">面向技术系统对接推送，按事件类型 / 推送级别 / 接收方系统分级</span>
              <el-button type="primary" size="default" :icon="Plus">新增规则</el-button>
            </div>
            <el-table :data="techRules" stripe size="default" style="width: 100%">
              <el-table-column prop="code" label="级别代码" width="120">
                <template #default="{ row }">
                  <code class="zg-code">{{ row.code }}</code>
                </template>
              </el-table-column>
              <el-table-column prop="name" label="级别名称" width="160">
                <template #default="{ row }">
                  <el-tag :type="techLevelTag(row.code)" effect="dark" size="default">{{ row.name }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="触发条件 JSON" min-width="280">
                <template #default="{ row }">
                  <div class="zg-trigger-json">
                    <div class="zg-json-field">
                      <span class="zg-json-key">事件类型：</span>
                      <el-tag size="small" effect="plain">{{ row.condition.eventType }}</el-tag>
                    </div>
                    <div class="zg-json-field">
                      <span class="zg-json-key">推送级别：</span>
                      <el-tag size="small" effect="plain" :type="techLevelTag(row.condition.pushLevel)">{{ row.condition.pushLevel }}</el-tag>
                    </div>
                    <div class="zg-json-field">
                      <span class="zg-json-key">接收系统：</span>
                      <el-tag size="small" effect="plain" type="info">{{ row.condition.receiver }}</el-tag>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="action" label="推送方式" width="180" />
              <el-table-column prop="channel" label="接口渠道" width="200">
                <template #default="{ row }">
                  <div class="zg-channel-tags">
                    <el-tag v-for="c in row.channel" :key="c" size="small" class="zg-channel-tag">{{ c }}</el-tag>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="ticketType" label="自动工单类型" width="150">
                <template #default="{ row }">
                  <el-tag size="small" effect="plain" type="warning">{{ row.ticketType }}</el-tag>
                </template>
              </el-table-column>
              <!-- D-04 新增列 -->
              <el-table-column label="推送对象" min-width="180">
                <template #default="{ row }">
                  <div class="zg-channel-tags">
                    <el-tag
                      v-for="l in (row.notifyLeaders || [])"
                      :key="l"
                      size="small"
                      class="zg-channel-tag"
                      type="warning"
                    >{{ l }}</el-tag>
                    <span v-if="!row.notifyLeaders?.length" class="zg-empty-tip">无领导推送</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="升级通知" width="150" align="center">
                <template #default="{ row }">
                  <div class="zg-upgrade-cell">
                    <el-switch v-model="row.enableUpgrade" size="default" />
                    <span v-if="row.enableUpgrade" class="zg-upgrade-min">
                      {{ row.upgradeMinutes || 60 }}min
                    </span>
                  </div>
                </template>
              </el-table-column>
              <!-- /D-04 -->
              <el-table-column label="启用" width="80" align="center">
                <template #default="{ row }">
                  <el-switch v-model="row.enabled" size="default" />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120" align="center" fixed="right">
                <template #default="{ row }">
                  <el-button link type="primary" size="small">编辑</el-button>
                  <el-button link type="danger" size="small">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { Setting, Plus } from "@element-plus/icons-vue"

const activeTab = ref('ops')

// OPS 口径 mock 数据（D-04 扩展：notifyLeaders / enableUpgrade / upgradeMinutes）
const opsRules = ref([
  { code: 'OPS-S0', name: 'S0 级 · 紧急安全', enabled: true, action: '立即派单 + 现场处置 ≤ 30min', ticketType: '紧急安全工单', channel: ['电话', '短信', '企业微信', '系统弹窗'],
    notifyLeaders: ['运维经理', '分管副总', '总经理'], enableUpgrade: true, upgradeMinutes: 15,
    condition: { scale: '单点故障', scope: '人身安全风险', safetyType: '人身安全' } },
  { code: 'OPS-S1', name: 'S1 级 · 重要故障', enabled: true, action: '45min 内到达现场 · 2h 内恢复', ticketType: '重要运维工单', channel: ['企业微信', '短信', '系统弹窗'],
    notifyLeaders: ['运维经理', '分管副总'], enableUpgrade: true, upgradeMinutes: 60,
    condition: { scale: '2-5 台设备', scope: '单路段影响', safetyType: '设备安全' } },
  { code: 'OPS-S2', name: 'S2 级 · 一般故障', enabled: true, action: '次日工作计划处置', ticketType: '常规运维工单', channel: ['企业微信', '系统弹窗'],
    notifyLeaders: ['班长'], enableUpgrade: false, upgradeMinutes: 0,
    condition: { scale: '单灯故障', scope: '单点局部', safetyType: '设备安全' } },
  { code: 'OPS-S3', name: 'S3 级 · 隐患预警', enabled: true, action: '纳入周计划排查', ticketType: '巡检排查工单', channel: ['企业微信'],
    notifyLeaders: [], enableUpgrade: false, upgradeMinutes: 0,
    condition: { scale: '趋势异常', scope: '潜在风险', safetyType: '环境安全' } },
  { code: 'OPS-W0', name: 'W0 级 · 气象联动', enabled: true, action: '提前布防 · 自动断电 + 通知', ticketType: '应急保障工单', channel: ['电话', '短信', '企业微信'],
    notifyLeaders: ['运维经理', '分管副总', '总经理'], enableUpgrade: true, upgradeMinutes: 30,
    condition: { scale: '区域级', scope: '气象灾害', safetyType: '人身安全' } },
  { code: 'OPS-I1', name: 'I1 级 · 回路比对异常', enabled: true, action: '自动断电 + 派单排查漏电点', ticketType: '漏电排查工单', channel: ['企业微信', '短信', '系统弹窗'],
    notifyLeaders: ['运维经理', '分管副总'], enableUpgrade: true, upgradeMinutes: 45,
    condition: { scale: '单回路', scope: '回路电流偏差 > 5A', safetyType: '人身安全' } },
  { code: 'OPS-I2', name: 'I2 级 · 单灯漏电告警', enabled: true, action: '记录告警 · 纳入巡检计划', ticketType: '漏电复核工单', channel: ['企业微信', '系统弹窗'],
    notifyLeaders: ['班长'], enableUpgrade: false, upgradeMinutes: 0,
    condition: { scale: '单灯', scope: '漏电电流 > 30mA', safetyType: '设备安全' } },
  { code: 'OPS-A1', name: 'A1 级 · 非法开门告警', enabled: false, action: '联动门禁 + 通知安保到场', ticketType: '安防工单', channel: ['电话', '短信', '安保对讲'],
    notifyLeaders: ['运维经理'], enableUpgrade: true, upgradeMinutes: 20,
    condition: { scale: '单配电箱', scope: '无权限开门', safetyType: '财产安全' } },
])

// TECH 口径 mock 数据（D-04 扩展）
const techRules = ref([
  { code: 'TECH-P0', name: 'P0 级 · 全量推送', enabled: true, action: '实时推送 + 重试 3 次', ticketType: '12345 工单', channel: ['HTTP/POST', 'Kafka Topic', 'WebSocket'],
    notifyLeaders: ['运维经理', '分管副总', '总经理'], enableUpgrade: true, upgradeMinutes: 10,
    condition: { eventType: '安全事件', pushLevel: '紧急', receiver: '长沙 12345 平台' } },
  { code: 'TECH-P1', name: 'P1 级 · 标准推送', enabled: true, action: '实时推送 + 重试 2 次', ticketType: '数字化城管工单', channel: ['HTTP/POST', 'Kafka Topic'],
    notifyLeaders: ['运维经理', '分管副总'], enableUpgrade: true, upgradeMinutes: 40,
    condition: { eventType: '设施故障', pushLevel: '重要', receiver: '数字化城管' } },
  { code: 'TECH-P2', name: 'P2 级 · 批量推送', enabled: true, action: '5 分钟聚合推送', ticketType: '照明监控日报', channel: ['Kafka Topic', '定时批量'],
    notifyLeaders: [], enableUpgrade: false, upgradeMinutes: 0,
    condition: { eventType: '运行状态', pushLevel: '一般', receiver: '照明监控平台' } },
  { code: 'TECH-P3', name: 'P3 级 · 日志归档', enabled: true, action: '仅归档 · 不实时推送', ticketType: '系统日志', channel: ['日志库', 'Elasticsearch'],
    notifyLeaders: [], enableUpgrade: false, upgradeMinutes: 0,
    condition: { eventType: '心跳事件', pushLevel: '低', receiver: '内部日志系统' } },
  { code: 'TECH-A0', name: 'A0 级 · AI 视频告警推送', enabled: true, action: '实时推送 + 携带抓拍图', ticketType: 'AI 识别工单', channel: ['HTTP/POST', 'WebSocket', '对象存储'],
    notifyLeaders: ['运维经理', '分管副总'], enableUpgrade: true, upgradeMinutes: 15,
    condition: { eventType: 'AI 视频识别', pushLevel: '紧急', receiver: '安防指挥中心' } },
  { code: 'TECH-M0', name: 'M0 级 · 浸水告警推送', enabled: true, action: '立即推送 + 联动断电', ticketType: '防汛工单', channel: ['HTTP/POST', '短信网关'],
    notifyLeaders: ['运维经理', '分管副总', '总经理'], enableUpgrade: true, upgradeMinutes: 20,
    condition: { eventType: '浸水监测', pushLevel: '紧急', receiver: '应急管理局' } },
  { code: 'TECH-E1', name: 'E1 级 · 能耗异常推送', enabled: false, action: '日终汇总推送', ticketType: '能耗分析报告', channel: ['定时批量', 'Kafka Topic'],
    notifyLeaders: [], enableUpgrade: false, upgradeMinutes: 0,
    condition: { eventType: '能耗异常', pushLevel: '一般', receiver: '节能管理平台' } },
])

const opsLevelTag = (code) => {
  const m = { 'OPS-S0': 'danger', 'OPS-S1': 'warning', 'OPS-S2': 'success', 'OPS-S3': 'info', 'OPS-W0': 'danger', 'OPS-I1': 'danger', 'OPS-I2': 'warning', 'OPS-A1': 'danger' }
  return m[code] || ''
}

const techLevelTag = (code) => {
  const m = { 'TECH-P0': 'danger', 'TECH-P1': 'warning', 'TECH-P2': 'success', 'TECH-P3': 'info', 'TECH-A0': 'danger', 'TECH-M0': 'danger', 'TECH-E1': 'success', '紧急': 'danger', '重要': 'warning', '一般': 'success', '低': 'info' }
  return m[code] || ''
}
</script>

<style scoped lang="scss">
.zg-alarmcfg { padding: 20px; display: flex; flex-direction: column; gap: 16px; }

.zg-alarmcfg__headline { display: flex; align-items: center; gap: 14px; }
.zg-alarmcfg__sigil {
  width: 44px; height: 44px; border-radius: 10px;
  background: linear-gradient(135deg, #6366f1, #0ea5e9);
  color: #fff; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
}
.zg-alarmcfg__title { font-size: 20px; font-weight: 600; color: #1e293b; margin: 0 0 4px; }
.zg-alarmcfg__sub { font-size: 13px; color: #94a3b8; margin: 0; }

.zg-alarmcfg__tabs {
  background: #fff; border: 1px solid #f1f5f9; border-radius: 12px;
  padding: 14px; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}
.zg-tab-content { padding-top: 8px; }
.zg-tab-toolbar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 0 12px;
}
.zg-tab-desc { font-size: 13px; color: #64748b; }

.zg-trigger-json { display: flex; flex-direction: column; gap: 6px; }
.zg-json-field { display: flex; align-items: center; gap: 6px; }
.zg-json-key { font-size: 12px; color: #64748b; min-width: 72px; }

.zg-channel-tags { display: flex; gap: 4px; flex-wrap: wrap; }
.zg-channel-tag { font-size: 11px; }

.zg-code { color: #6366f1; font-size: 12px; font-family: monospace; }
</style>
