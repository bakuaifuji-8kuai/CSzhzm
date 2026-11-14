<!-- 智光云枢 · 能耗专项 · VehiclePatrol 车载光衰巡检 -->
<template>
  <section class="zg-energy-vehicle">
    <header class="zg-energy__head">
      <div class="zg-energy__headline">
        <div class="zg-energy__sigil zg-energy__sigil--sky"><el-icon :size="22"><Coin /></el-icon></div>
        <div class="zg-energy__copy">
          <h1>车载光衰巡检</h1>
          <p>车辆搭载 lux 计沿预设轨迹采集 · 光衰预警 · 偏暗路段回溯</p>
        </div>
      </div>
      <div class="zg-energy__cta">
        <el-button type="primary" :icon="Monitor">新建巡检任务</el-button>
        <el-button :icon="Download">导出巡检报告</el-button>
      </div>
    </header>

    <!-- 任务列表 -->
    <div class="zg-energy__task-wrap">
      <div class="zg-energy__chart-head">
        <h3><el-icon><List /></el-icon>巡检任务列表</h3>
        <el-tag>共 {{ tasks.length }} 个</el-tag>
      </div>
      <el-table :data="tasks" stripe size="small" height="320">
        <el-table-column prop="no" label="任务号" width="140" />
        <el-table-column prop="vehicle" label="车辆" width="130">
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <el-icon class="text-cyan-500"><Monitor /></el-icon>
              <span>{{ row.vehicle }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="date" label="巡检日期" width="120" />
        <el-table-column prop="route" label="预设轨迹" min-width="220" />
        <el-table-column prop="mileage" label="完成里程 km" width="130" align="right">
          <template #default="{ row }"><span class="font-mono font-semibold">{{ row.mileage }}</span></template>
        </el-table-column>
        <el-table-column prop="darkCount" label="偏暗路段" width="110" align="right">
          <template #default="{ row }">
            <span class="font-mono font-bold" :class="row.darkCount > 5 ? 'text-rose-500' : row.darkCount > 2 ? 'text-amber-500' : 'text-emerald-500'">{{ row.darkCount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '已完成' ? 'success' : row.status === '进行中' ? 'warning' : row.status === '待执行' ? 'info' : 'danger'" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small">轨迹</el-button>
            <el-button link type="primary" size="small">报告</el-button>
            <el-button link type="primary" size="small">预警</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 光衰预警表格 -->
    <div class="zg-energy__warn-wrap">
      <div class="zg-energy__chart-head">
        <h3><el-icon><Warning /></el-icon>光衰预警 TOP 15</h3>
        <el-tag type="danger">光衰率 ≥ 30%</el-tag>
      </div>
      <el-table :data="warnList" stripe size="small" height="400">
        <el-table-column type="index" width="48" label="#" />
        <el-table-column prop="location" label="灯具位置" width="220" />
        <el-table-column prop="type" label="灯具型号" width="130" />
        <el-table-column prop="years" label="安装年限" width="100" align="right">
          <template #default="{ row }">
            <span class="font-mono" :class="row.years > 5 ? 'text-amber-600' : 'text-slate-600'">{{ row.years }} 年</span>
          </template>
        </el-table-column>
        <el-table-column prop="initLux" label="初始 lux" width="110" align="right">
          <template #default="{ row }"><span class="font-mono">{{ row.initLux }}</span></template>
        </el-table-column>
        <el-table-column prop="currLux" label="当前 lux" width="110" align="right">
          <template #default="{ row }"><span class="font-mono font-bold" :class="row.currLux < row.initLux * 0.7 ? 'text-rose-500' : ''">{{ row.currLux }}</span></template>
        </el-table-column>
        <el-table-column label="光衰率" width="180">
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <el-progress
                :percentage="row.decay"
                :color="row.decay >= 40 ? '#ef4444' : row.decay >= 30 ? '#f59e0b' : '#10b981'"
                :stroke-width="10"
                :show-text="false"
                style="flex:1"
              />
              <span class="font-mono font-bold" :class="row.decay >= 40 ? 'text-rose-500' : row.decay >= 30 ? 'text-amber-500' : 'text-emerald-500'">{{ row.decay }}%</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="suggest" label="建议" width="140">
          <template #default="{ row }">
            <el-tag v-if="row.decay >= 40" type="danger" size="small">立即更换</el-tag>
            <el-tag v-else-if="row.decay >= 30" type="warning" size="small">加强巡查</el-tag>
            <el-tag v-else type="success" size="small">正常</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { Coin, Download, Monitor, List, Warning } from "@element-plus/icons-vue"

const tasks = ref([
  { no: 'PATROL-2026-11-14-01', vehicle: '湘A·D5238 巡1号', date: '2026-11-14', route: '先导路（K0+000 ~ K5+200）', mileage: 52.3, darkCount: 7, status: '已完成' },
  { no: 'PATROL-2026-11-14-02', vehicle: '湘A·D5239 巡2号', date: '2026-11-14', route: '麓谷大道 + 梅溪湖环湖路', mileage: 38.6, darkCount: 3, status: '进行中' },
  { no: 'PATROL-2026-11-13-01', vehicle: '湘A·D5238 巡1号', date: '2026-11-13', route: '岳麓大道西段 + 隧道群', mileage: 46.2, darkCount: 5, status: '已完成' },
  { no: 'PATROL-2026-11-13-02', vehicle: '湘A·D5240 巡3号', date: '2026-11-13', route: '望城区府路 + 金星北路', mileage: 54.8, darkCount: 9, status: '已完成' },
  { no: 'PATROL-2026-11-12-01', vehicle: '湘A·D5239 巡2号', date: '2026-11-12', route: '雨花区政府路 + 万家丽路', mileage: 42.1, darkCount: 4, status: '已完成' },
  { no: 'PATROL-2026-11-12-02', vehicle: '湘A·D5240 巡3号', date: '2026-11-12', route: '开福区浏阳河大道', mileage: 35.8, darkCount: 2, status: '已完成' },
  { no: 'PATROL-2026-11-11-01', vehicle: '湘A·D5238 巡1号', date: '2026-11-11', route: '先导路（返程）', mileage: 50.4, darkCount: 6, status: '已完成' },
  { no: 'PATROL-2026-11-15-01', vehicle: '湘A·D5239 巡2号', date: '2026-11-15', route: '高新区产业园外围', mileage: 40.0, darkCount: 0, status: '待执行' },
  { no: 'PATROL-2026-11-15-02', vehicle: '湘A·D5240 巡3号', date: '2026-11-15', route: '岳麓山西环', mileage: 48.5, darkCount: 0, status: '待执行' }
])

const warnList = ref([
  { location: '先导路 K2+380 北侧单灯', type: 'LED 50W 第一代', years: 7, initLux: 120, currLux: 68, decay: 43 },
  { location: '麓谷大道 K1+820 交叉口组灯', type: 'LED 60W 第一代', years: 6, initLux: 150, currLux: 95, decay: 37 },
  { location: '梅溪湖环湖路 K3+100 东侧', type: 'LED 40W 第一代', years: 6, initLux: 100, currLux: 62, decay: 38 },
  { location: '岳麓隧道入口第 3 排', type: 'LED 80W 第一代', years: 7, initLux: 200, currLux: 112, decay: 44 },
  { location: '先导路 K3+500 辅道', type: 'LED 50W 第一代', years: 7, initLux: 120, currLux: 72, decay: 40 },
  { location: '望城区府路 K0+880', type: 'LED 40W 第一代', years: 8, initLux: 100, currLux: 55, decay: 45 },
  { location: '雨花区政府东路口', type: 'LED 60W 第一代', years: 6, initLux: 150, currLux: 98, decay: 35 },
  { location: '开福区浏阳河大桥下', type: 'LED 100W 第一代', years: 6, initLux: 250, currLux: 160, decay: 36 },
  { location: '麓谷产业园东门组灯', type: 'LED 60W 第二代', years: 4, initLux: 160, currLux: 108, decay: 33 },
  { location: '先导路 K4+900 北段', type: 'LED 50W 第一代', years: 7, initLux: 120, currLux: 70, decay: 42 },
  { location: '梅溪湖环湖路南 K1+200', type: 'LED 40W 第一代', years: 5, initLux: 100, currLux: 68, decay: 32 },
  { location: '岳麓大道西段 K2+100', type: 'LED 60W 第二代', years: 4, initLux: 150, currLux: 102, decay: 32 },
  { location: '金星北路 K5+600', type: 'LED 50W 第一代', years: 6, initLux: 120, currLux: 76, decay: 37 },
  { location: '万家丽路高架下', type: 'LED 80W 第一代', years: 7, initLux: 200, currLux: 124, decay: 38 },
  { location: '先导路 K1+000 起点', type: 'LED 50W 第二代', years: 4, initLux: 130, currLux: 90, decay: 31 }
])
</script>

<style lang="scss" scoped>
.zg-energy-vehicle { padding: var(--zg-space-6); background: var(--zg-gradient-surface); min-height: calc(100vh - 120px); }
.zg-energy__head { display: flex; justify-content: space-between; align-items: center; padding-bottom: var(--zg-space-5); margin-bottom: var(--zg-space-4); border-bottom: 1px solid var(--zg-line-soft); }
.zg-energy__sigil { width: 44px; height: 44px; border-radius: var(--zg-radius-md); background: linear-gradient(135deg,#06b6d4,#6366f1); color: #fff; display: flex; align-items: center; justify-content: center; }
.zg-energy__sigil--sky { background: linear-gradient(135deg,#0ea5e9,#06b6d4); }
.zg-energy__headline { display: flex; gap: var(--zg-space-3); align-items: center; }
.zg-energy__copy h1 { margin: 0; font-size: var(--zg-text-display-md); font-weight: 700; }
.zg-energy__copy p { margin: 2px 0 0; font-size: var(--zg-text-body-sm); color: var(--zg-ink-tertiary); }

.zg-energy__task-wrap, .zg-energy__warn-wrap { background: var(--zg-surface-card); border: 1px solid var(--zg-line-soft); border-radius: var(--zg-radius-lg); padding: var(--zg-space-4); margin-bottom: var(--zg-space-4); }
.zg-energy__chart-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--zg-space-3); }
.zg-energy__chart-head h3 { margin: 0; font-size: var(--zg-text-body); font-weight: 600; display: flex; gap: 6px; align-items: center; }
</style>
