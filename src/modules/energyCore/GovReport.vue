<!-- 智光云枢 · 能耗专项 · GovReport 政府报送模板 -->
<template>
  <section class="zg-energy-gov">
    <header class="zg-energy__head">
      <div class="zg-energy__headline">
        <div class="zg-energy__sigil zg-energy__sigil--violet"><el-icon :size="22"><Coin /></el-icon></div>
        <div class="zg-energy__copy">
          <h1>政府报送模板</h1>
          <p>市政能耗 · 住建厅 / 发改委 / 城管部门报送模板 · 数据追溯 · 版本对比</p>
        </div>
      </div>
      <div class="zg-energy__cta">
        <el-button type="primary" :icon="Setting">一键报送</el-button>
        <el-button :icon="Setting">报送参数</el-button>
      </div>
    </header>

    <el-tabs v-model="activeTab" class="zg-energy__tabs">
      <!-- Tab 1：模板清单 -->
      <el-tab-pane label="模板清单" name="list">
        <el-table :data="templates" stripe size="small" height="520">
          <el-table-column prop="code" label="模板编号" width="120" />
          <el-table-column prop="name" label="模板名称" width="280">
            <template #default="{ row }">
              <div class="flex items-center gap-2">
                <el-icon class="text-indigo-500"><Document /></el-icon>
                <span class="font-semibold">{{ row.name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="receiver" label="报送单位" width="160" />
          <el-table-column prop="cycle" label="报送周期" width="100" />
          <el-table-column prop="deadline" label="截止日" width="100" />
          <el-table-column prop="version" label="当前版本" width="100">
            <template #default="{ row }"><el-tag size="small" effect="plain">v{{ row.version }}</el-tag></template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag v-if="row.status === '待填报'" type="warning" size="small">{{ row.status }}</el-tag>
              <el-tag v-else-if="row.status === '已报送'" type="success" size="small">{{ row.status }}</el-tag>
              <el-tag v-else type="info" size="small">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="数据来源追溯" width="90" align="center">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="expandTrace(row)">
                <el-icon><View /></el-icon>
              </el-button>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small">填报</el-button>
              <el-button link type="primary" size="small">下载</el-button>
              <el-button link type="primary" size="small">历史</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 数据追溯 Drawer -->
        <el-drawer v-model="traceVisible" title="数据来源追溯" size="520px">
          <div class="zg-trace" v-if="traceTarget">
            <h4>{{ traceTarget.name }} — 上游数据链路</h4>
            <el-timeline>
              <el-timeline-item v-for="(t, i) in traceTarget.trace" :key="i" :timestamp="t.time" :type="t.type">
                <div class="zg-trace-item">
                  <div class="zg-trace-head">
                    <el-icon><component :is="t.icon" /></el-icon>
                    <strong>{{ t.label }}</strong>
                  </div>
                  <div class="zg-trace-body">
                    <div v-for="(v, k) in t.values" :key="k" class="zg-trace-kv">
                      <span class="k">{{ k }}</span>
                      <span class="v font-mono">{{ v }}</span>
                    </div>
                  </div>
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-drawer>
      </el-tab-pane>

      <!-- Tab 2：填报入口 -->
      <el-tab-pane label="填报入口" name="fill">
        <div class="zg-energy__fill-grid">
          <div v-for="f in fillEntries" :key="f.code" class="zg-energy__fill-card">
            <div class="zg-energy__fill-head">
              <div class="zg-energy__fill-icon" :style="{ background: f.bg }"><el-icon :size="18"><component :is="f.icon" /></el-icon></div>
              <div class="zg-energy__fill-info">
                <div class="zg-energy__fill-code">{{ f.code }}</div>
                <div class="zg-energy__fill-name">{{ f.name }}</div>
              </div>
            </div>
            <div class="zg-energy__fill-body">
              <div class="zg-energy__fill-progress">
                <span class="zg-energy__fill-lbl">填报进度</span>
                <el-progress :percentage="f.progress" :stroke-width="10" />
              </div>
              <div class="zg-energy__fill-meta">
                <span>周期：{{ f.cycle }}</span>
                <el-tag v-if="f.progress === 100" type="success" size="small">已完成</el-tag>
                <el-tag v-else type="warning" size="small">待填报</el-tag>
              </div>
            </div>
            <div class="zg-energy__fill-cta">
              <el-button v-if="f.progress < 100" type="primary" size="small" :icon="Edit">继续填报</el-button>
              <el-button v-else size="small" :icon="View">查看已填</el-button>
              <el-button size="small" :icon="Share">分享</el-button>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- Tab 3：数据追溯 -->
      <el-tab-pane label="数据追溯" name="trace">
        <div class="zg-filterband">
          <el-input v-model="traceKw" placeholder="搜索模板编号 / 字段 / 数据源" :prefix-icon="Search" style="width:320px" clearable />
          <el-date-picker v-model="traceMonth" type="month" placeholder="月份" value-format="YYYY-MM" style="width:150px" />
          <el-button type="primary" :icon="Search">查询</el-button>
        </div>
        <el-table :data="traceList" stripe size="small" height="520">
          <el-table-column prop="template" label="模板" width="180" />
          <el-table-column prop="field" label="字段名" width="180" />
          <el-table-column prop="source" label="数据源表" width="220">
            <template #default="{ row }"><code class="zg-formula">{{ row.source }}</code></template>
          </el-table-column>
          <el-table-column prop="method" label="计算口径" min-width="240" />
          <el-table-column prop="upstream" label="上游链路" width="200" />
          <el-table-column prop="lastCheck" label="最近核查" width="120" />
          <el-table-column prop="status" label="一致性" width="100">
            <template #default="{ row }">
              <el-tag v-if="row.status === '一致'" type="success" size="small">✓ 一致</el-tag>
              <el-tag v-else type="danger" size="small">⚠ 差异</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- Tab 4：版本对比 -->
      <el-tab-pane label="版本对比" name="version">
        <div class="zg-filterband">
          <el-select v-model="diffTemplate" placeholder="选择模板" style="width:220px">
            <el-option v-for="t in templates" :key="t.code" :label="`${t.code} - ${t.name}`" :value="t.code" />
          </el-select>
          <el-select v-model="vFrom" placeholder="基准版本" style="width:140px">
            <el-option label="v2025.10" value="v2025.10" />
            <el-option label="v2025.09" value="v2025.09" />
            <el-option label="v2025.08" value="v2025.08" />
          </el-select>
          <span class="text-slate-400">vs</span>
          <el-select v-model="vTo" placeholder="对比版本" style="width:140px">
            <el-option label="v2025.11" value="v2025.11" />
            <el-option label="v2025.10" value="v2025.10" />
          </el-select>
          <el-button type="primary" :icon="Connection">执行对比</el-button>
        </div>

        <div class="zg-energy__diff">
          <h4>差异汇总</h4>
          <div class="zg-energy__diff-summary">
            <el-tag type="success">↑ 增加字段 3</el-tag>
            <el-tag type="danger">↓ 删除字段 1</el-tag>
            <el-tag type="warning">△ 修改口径 4</el-tag>
            <el-tag type="info">→ 重命名 2</el-tag>
          </div>
          <el-table :data="diffRows" stripe size="small" height="420">
            <el-table-column prop="type" label="变更类型" width="100">
              <template #default="{ row }">
                <el-tag :type="row.type === '增加' ? 'success' : row.type === '删除' ? 'danger' : row.type === '修改' ? 'warning' : 'info'" size="small">{{ row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="field" label="字段" width="180" />
            <el-table-column prop="before" label="v2025.10" min-width="200" />
            <el-table-column prop="after" label="v2025.11" min-width="200" />
            <el-table-column prop="note" label="变更说明" />
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>
  </section>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Coin, Download, Setting, View, Edit, Share, Search, Connection, Document, List } from "@element-plus/icons-vue"

const activeTab = ref('list')
const traceVisible = ref(false)
const traceTarget = ref(null)
const diffTemplate = ref('')
const vFrom = ref('v2025.10')
const vTo = ref('v2025.11')
const traceKw = ref('')
const traceMonth = ref('2026-11')

const templates = ref([
  { code: 'ZJJ-001', name: '市政照明月度能耗统计表', receiver: '省住建厅', cycle: '月报', deadline: '次月 5 日', version: '2025.11', status: '待填报',
    trace: [
      { time: '2026-11-14 08:02', label: '数据仓抽取', icon: Connection, type: 'primary', values: { '表名': 'energy_core.daily_kwh', '抽取范围': '2026-11-01 ~ 2026-11-13', '行数': '18,426' } },
      { time: '2026-11-14 08:05', label: '指标聚合', icon: Connection, type: 'success', values: { '口径': 'SUM(kwh) BY region, box', '聚合数': '6 区域 / 268 箱变' } },
      { time: '2026-11-14 08:08', label: '逻辑校验', icon: List, type: 'warning', values: { '校验项': '线损率 ∈ [0,20%]', '异常数': '0' } },
      { time: '2026-11-14 08:10', label: '模板填充', icon: Document, type: 'primary', values: { '导出格式': 'Excel 2023 版', '关联模板': 'ZJJ-001 v2025.11' } }
    ]
  },
  { code: 'FGW-002', name: '单位 GDP 能耗年报', receiver: '市发改委', cycle: '年报', deadline: '次年 3 月', version: '2025.03', status: '已报送',
    trace: [
      { time: '2026-03-05 18:00', label: '最终提交', icon: Setting, type: 'success', values: { '版本': 'v2025.03', '回执': '已接收' } }
    ]
  },
  { code: 'CG-003', name: '城管局节能专项月度表', receiver: '市城管局', cycle: '月报', deadline: '次月 10 日', version: '2025.11', status: '待填报', trace: [] },
  { code: 'JST-004', name: '建筑节能统计季报', receiver: '省住建厅', cycle: '季报', deadline: '季后 15 日', version: '2025.03', status: '已报送', trace: [] },
  { code: 'ZJJ-005', name: '城市道路照明节能率表', receiver: '省住建厅', cycle: '半年报', deadline: '7 月 20 日 / 次年 1 月', version: '2025.02', status: '已报送', trace: [] },
  { code: 'TJJ-006', name: '公共机构能源消耗统计', receiver: '市统计局', cycle: '年报', deadline: '次年 2 月', version: '2025.01', status: '草稿', trace: [] },
  { code: 'YJ-007', name: '应急照明保障月度表', receiver: '市应急管理局', cycle: '月报', deadline: '次月 3 日', version: '2025.09', status: '已报送', trace: [] },
  { code: 'CG-008', name: '环卫站点能耗季报', receiver: '市城管局', cycle: '季报', deadline: '季后 10 日', version: '2025.03', status: '已报送', trace: [] }
])

function expandTrace(row) {
  traceTarget.value = row
  traceVisible.value = true
}

const fillEntries = ref([
  { code: 'ZJJ-001', name: '市政照明月度能耗统计表', cycle: '2026-11', progress: 80, icon: Document, bg: 'linear-gradient(135deg,#6366f1,#818cf8)' },
  { code: 'CG-003', name: '城管局节能专项月度表', cycle: '2026-11', progress: 45, icon: List, bg: 'linear-gradient(135deg,#06b6d4,#22d3ee)' },
  { code: 'ZJJ-005', name: '城市道路照明节能率表', cycle: '2026-H2', progress: 100, icon: TrendCharts, bg: 'linear-gradient(135deg,#10b981,#34d399)' },
  { code: 'FGW-002', name: '单位 GDP 能耗年报', cycle: '2026', progress: 15, icon: House, bg: 'linear-gradient(135deg,#f59e0b,#fbbf24)' },
  { code: 'YJ-007', name: '应急照明保障月度表', cycle: '2026-11', progress: 100, icon: Warning, bg: 'linear-gradient(135deg,#ef4444,#f87171)' },
  { code: 'TJJ-006', name: '公共机构能源消耗统计', cycle: '2025', progress: 100, icon: Connection, bg: 'linear-gradient(135deg,#a855f7,#c084fc)' }
])

const traceList = ref([
  { template: 'ZJJ-001', field: '区域总用电 kWh', source: 'energy_core.meter_reading', method: 'SUM(kwh) GROUP BY region', upstream: '箱变公表直连', lastCheck: '2026-11-14', status: '一致' },
  { template: 'ZJJ-001', field: '非照明占比 %', source: 'energy_core.non_lighting', method: '非照明电量 / 总用电', upstream: '分表 OCR + 直连', lastCheck: '2026-11-14', status: '一致' },
  { template: 'ZJJ-001', field: '综合线损率 %', source: 'energy_core.balance', method: '(总表 - 分表Σ) / 总表', upstream: '箱变 + 回路', lastCheck: '2026-11-13', status: '一致' },
  { template: 'ZJJ-001', field: 'LED 照明占比 %', source: 'asset_mgmt.lamp_registry', method: 'LED 灯具数 / 总灯具数', upstream: '灯具资产台账', lastCheck: '2026-11-12', status: '差异' },
  { template: 'CG-003', field: '环卫驿站月耗电 kWh', source: 'energy_core.non_lighting', method: 'WHERE type = 环卫驿站', upstream: '分表直连', lastCheck: '2026-11-10', status: '一致' },
  { template: 'FGW-002', field: '单位 GDP 能耗', source: 'gov_report.gdp_stats', method: '总能耗 / GDP', upstream: '统计局 GDP 数据', lastCheck: '2026-03-05', status: '一致' },
  { template: 'YJ-007', field: '应急保障时长 h', source: 'ops_ticket.outage', method: 'SUM(保障时长) BY 区域', upstream: '运维工单系统', lastCheck: '2026-11-03', status: '一致' }
])

const diffRows = ref([
  { type: '增加', field: '非照明占比 %', before: '—', after: '非照明 kWh / 总用电 kWh', note: '住建厅新增指标' },
  { type: '增加', field: '光衰换灯数量 盏', before: '—', after: 'asset_mgmt 台账汇总', note: '反映节能治理力度' },
  { type: '增加', field: '车载光衰检测里程 km', before: '—', after: '巡检系统轨迹汇总', note: '新增数据维度' },
  { type: '删除', field: '白炽灯数量 盏', before: 'asset_mgmt 字段', after: '—', note: '已全部改造为 LED' },
  { type: '修改', field: '线损率口径', before: '分表 / 总表', after: '(总表 - 分表) / 总表', note: '口径修正，原公式错误' },
  { type: '修改', field: '能耗单位', before: '万度', after: 'kWh', note: '统一 SI 制' },
  { type: '修改', field: '峰谷电价系数', before: '0.715', after: '0.721', note: '湖南省 2025 新电价' },
  { type: '修改', field: '碳排因子', before: '0.5710', after: '0.5810', note: '国家发改委 2024 修订' },
  { type: '重命名', field: '月累计用电', before: 'monthly_total', after: 'monthly_consumption', note: '命名规范化' },
  { type: '重命名', field: '节能率', before: 'save_rate', after: 'energy_saving_rate', note: '命名规范化' }
])
</script>

<style lang="scss" scoped>
.zg-energy-gov { padding: var(--zg-space-6); background: var(--zg-gradient-surface); min-height: calc(100vh - 120px); }
.zg-energy__head { display: flex; justify-content: space-between; align-items: center; padding-bottom: var(--zg-space-5); margin-bottom: var(--zg-space-4); border-bottom: 1px solid var(--zg-line-soft); }
.zg-energy__sigil { width: 44px; height: 44px; border-radius: var(--zg-radius-md); background: linear-gradient(135deg,#06b6d4,#6366f1); color: #fff; display: flex; align-items: center; justify-content: center; }
.zg-energy__sigil--violet { background: linear-gradient(135deg,#6366f1,#a855f7); }
.zg-energy__headline { display: flex; gap: var(--zg-space-3); align-items: center; }
.zg-energy__copy h1 { margin: 0; font-size: var(--zg-text-display-md); font-weight: 700; }
.zg-energy__copy p { margin: 2px 0 0; font-size: var(--zg-text-body-sm); color: var(--zg-ink-tertiary); }
.zg-energy__tabs { background: var(--zg-surface-card); border: 1px solid var(--zg-line-soft); border-radius: var(--zg-radius-lg); padding: var(--zg-space-4); }
.zg-formula { font-size: 12px; color: var(--zg-ink-secondary); background: var(--zg-surface-muted); padding: 2px 6px; border-radius: 4px; }

/* Drawer timeline */
.zg-trace h4 { margin: 0 0 var(--zg-space-3); font-size: var(--zg-text-body); font-weight: 600; }
.zg-trace-item { padding: 8px 12px; background: var(--zg-surface-muted); border-radius: var(--zg-radius-md); }
.zg-trace-head { display: flex; gap: 6px; align-items: center; margin-bottom: 6px; font-size: 13px; font-weight: 600; color: var(--zg-ink-primary); }
.zg-trace-kv { display: flex; justify-content: space-between; font-size: 12px; padding: 2px 0; .k { color: var(--zg-ink-tertiary); } .v { color: var(--zg-ink-primary); font-weight: 600; } }

/* 填报入口卡片 */
.zg-energy__fill-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--zg-space-4); }
.zg-energy__fill-card { border: 1px solid var(--zg-line-soft); border-radius: var(--zg-radius-md); padding: var(--zg-space-4); background: #fff; }
.zg-energy__fill-head { display: flex; gap: var(--zg-space-3); margin-bottom: var(--zg-space-3); }
.zg-energy__fill-icon { width: 38px; height: 38px; border-radius: var(--zg-radius-md); display: flex; align-items: center; justify-content: center; color: #fff; flex-shrink: 0; }
.zg-energy__fill-code { font-size: 12px; color: var(--zg-ink-tertiary); font-family: var(--zg-font-mono); }
.zg-energy__fill-name { font-size: 14px; font-weight: 600; margin-top: 2px; }
.zg-energy__fill-body { margin-bottom: var(--zg-space-3); }
.zg-energy__fill-lbl { font-size: 12px; color: var(--zg-ink-tertiary); margin-bottom: 4px; display: block; }
.zg-energy__fill-meta { display: flex; justify-content: space-between; font-size: 12px; color: var(--zg-ink-tertiary); margin-top: 6px; }
.zg-energy__fill-cta { display: flex; gap: 8px; }

/* 版本对比 */
.zg-energy__diff { margin-top: var(--zg-space-3); }
.zg-energy__diff h4 { margin: 0 0 var(--zg-space-3); font-size: var(--zg-text-body); font-weight: 600; }
.zg-energy__diff-summary { display: flex; gap: var(--zg-space-3); margin-bottom: var(--zg-space-3); }
</style>
