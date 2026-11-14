<!-- 智光云枢 · 安全域 · 漏电历史查询 -->
<template>
  <section class="zg-leakhis">
    <!-- 头部 -->
    <header class="zg-leakhis__head">
      <div class="zg-leakhis__headline">
        <div class="zg-leakhis__sigil">
          <el-icon :size="22"><Clock /></el-icon>
        </div>
        <div class="zg-leakhis__copy">
          <h1 class="zg-leakhis__title">漏电历史查询</h1>
          <p class="zg-leakhis__sub">全量漏电告警历史数据检索 · 支持设备/回路/时间多维筛选</p>
        </div>
      </div>
    </header>

    <!-- 过滤工具栏 -->
    <div class="zg-filterband">
      <div class="zg-filterband__group">
        <span class="zg-filterband__lbl">告警时间：</span>
        <el-date-picker
          v-model="dateRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          format="YYYY-MM-DD HH:mm"
          value-format="YYYY-MM-DD HH:mm:ss"
          size="default"
          style="width: 380px"
        />
      </div>
      <div class="zg-filterband__group">
        <span class="zg-filterband__lbl">设备：</span>
        <el-select v-model="deviceFilter" placeholder="全部设备" clearable size="default" style="width: 180px">
          <el-option v-for="d in deviceOptions" :key="d" :label="d" :value="d" />
        </el-select>
      </div>
      <div class="zg-filterband__group">
        <span class="zg-filterband__lbl">回路：</span>
        <el-select v-model="loopFilter" placeholder="全部回路" clearable size="default" style="width: 140px">
          <el-option v-for="l in loopOptions" :key="l" :label="l" :value="l" />
        </el-select>
      </div>
      <div class="zg-filterband__group">
        <span class="zg-filterband__lbl">级别：</span>
        <el-select v-model="levelFilter" placeholder="全部级别" clearable size="default" style="width: 120px">
          <el-option label="紧急" value="紧急" />
          <el-option label="重要" value="重要" />
          <el-option label="一般" value="一般" />
        </el-select>
      </div>
      <div class="zg-filterband__actions">
        <el-button type="primary" :icon="Search">查询</el-button>
        <el-button :icon="Refresh">重置</el-button>
        <el-button :icon="Download">导出 Excel</el-button>
      </div>
    </div>

    <!-- 统计卡 -->
    <div class="zg-metrics">
      <div class="zg-metrics__cell zg-metrics__cell--info">
        <div class="zg-metrics__icon"><el-icon :size="20"><Search /></el-icon></div>
        <div class="zg-metrics__body">
          <div class="zg-metrics__num">{{ filteredList.length }}</div>
          <div class="zg-metrics__lbl">查询到的告警条数</div>
        </div>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--danger">
        <div class="zg-metrics__icon"><el-icon :size="20"><Warning /></el-icon></div>
        <div class="zg-metrics__body">
          <div class="zg-metrics__num">{{ urgentCount }}</div>
          <div class="zg-metrics__lbl">紧急告警</div>
        </div>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <div class="zg-metrics__icon"><el-icon :size="20"><Connection /></el-icon></div>
        <div class="zg-metrics__body">
          <div class="zg-metrics__num">{{ powerOffCount }}</div>
          <div class="zg-metrics__lbl">联动断电次数</div>
        </div>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--ok">
        <div class="zg-metrics__icon"><el-icon :size="20"><CircleCheck /></el-icon></div>
        <div class="zg-metrics__body">
          <div class="zg-metrics__num">{{ handledRate }}%</div>
          <div class="zg-metrics__lbl">已处理率</div>
        </div>
      </div>
    </div>

    <!-- 表格 -->
    <div class="zg-leakhis__panel">
      <el-table :data="filteredList" stripe size="default" style="width: 100%" height="480">
        <el-table-column prop="alarmTime" label="告警时间" width="170" fixed>
          <template #default="{ row }">
            <span class="zg-mono">{{ row.alarmTime }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="deviceId" label="设备ID" width="140">
          <template #default="{ row }">
            <code class="zg-code">{{ row.deviceId }}</code>
          </template>
        </el-table-column>
        <el-table-column label="检测方式" width="130" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="row.detectMethod === '单灯自带' ? 'info' : 'primary'">{{ row.detectMethod }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="currentValue" label="电流值 mA" width="110" align="right">
          <template #default="{ row }">
            <span :class="row.currentValue > 100 ? 'zg-danger' : row.currentValue > 50 ? 'zg-warn' : ''">{{ row.currentValue }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="threshold" label="阈值 mA" width="100" align="center">
          <template #default="{ row }">
            <span class="zg-muted">{{ row.threshold }}</span>
          </template>
        </el-table-column>
        <el-table-column label="告警级别" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.alarmLevel === '紧急' ? 'danger' : row.alarmLevel === '重要' ? 'warning' : 'info'" size="small" effect="dark">
              {{ row.alarmLevel }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="联动断电" width="110" align="center">
          <template #default="{ row }">
            <el-icon v-if="row.powerOff" class="zg-success"><CircleCheck /></el-icon>
            <el-icon v-else class="zg-muted"><CircleClose /></el-icon>
          </template>
        </el-table-column>
        <el-table-column label="是否已处理" width="120" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.handled" type="success" size="small">已处理</el-tag>
            <el-tag v-else type="warning" size="small">未处理</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small">详情</el-button>
            <el-button link type="primary" size="small" v-if="!row.handled">转工单</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="zg-leakhis__pager">
        <el-pagination
          background
          layout="total, prev, pager, next, sizes"
          :total="156"
          :page-size="20"
          :page-sizes="[20, 50, 100]"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Clock, Search, Refresh, Download, Warning, Connection, CircleCheck, CircleClose } from "@element-plus/icons-vue"

const dateRange = ref([])
const deviceFilter = ref('')
const loopFilter = ref('')
const levelFilter = ref('')

const deviceOptions = ['LK-001', 'LK-002', 'LK-007', 'LK-012', 'LK-015', 'LK-018', 'LK-023', 'LK-028']
const loopOptions = ['LK-001', 'LK-002', 'LK-007', 'LK-012', 'LK-015']

// mock 数据：不少于 15 条
const historyList = ref([
  { alarmTime: '2026-11-14 12:28:45', deviceId: 'LK-023-007', detectMethod: '单灯自带', currentValue: 168, threshold: 30, alarmLevel: '紧急', powerOff: true, handled: true },
  { alarmTime: '2026-11-14 12:15:32', deviceId: 'LK-002', detectMethod: '回路比对', currentValue: 142, threshold: 30, alarmLevel: '紧急', powerOff: true, handled: true },
  { alarmTime: '2026-11-14 12:08:19', deviceId: 'LK-028', detectMethod: '回路比对', currentValue: 156, threshold: 30, alarmLevel: '紧急', powerOff: true, handled: true },
  { alarmTime: '2026-11-14 11:52:07', deviceId: 'LK-012', detectMethod: '回路比对', currentValue: 138, threshold: 30, alarmLevel: '重要', powerOff: false, handled: true },
  { alarmTime: '2026-11-14 11:41:55', deviceId: 'LK-015-003', detectMethod: '单灯自带', currentValue: 89, threshold: 30, alarmLevel: '重要', powerOff: false, handled: true },
  { alarmTime: '2026-11-14 11:33:22', deviceId: 'LK-042', detectMethod: '回路比对', currentValue: 125, threshold: 30, alarmLevel: '重要', powerOff: false, handled: false },
  { alarmTime: '2026-11-14 11:25:10', deviceId: 'LK-063', detectMethod: '回路比对', currentValue: 98, threshold: 30, alarmLevel: '重要', powerOff: false, handled: true },
  { alarmTime: '2026-11-14 11:18:44', deviceId: 'LK-023-012', detectMethod: '单灯自带', currentValue: 178, threshold: 30, alarmLevel: '紧急', powerOff: true, handled: true },
  { alarmTime: '2026-11-14 11:05:33', deviceId: 'LK-051-008', detectMethod: '单灯自带', currentValue: 52, threshold: 30, alarmLevel: '一般', powerOff: false, handled: true },
  { alarmTime: '2026-11-14 10:52:18', deviceId: 'LK-007-015', detectMethod: '单灯自带', currentValue: 45, threshold: 30, alarmLevel: '一般', powerOff: false, handled: true },
  { alarmTime: '2026-11-14 10:41:02', deviceId: 'LK-018-022', detectMethod: '单灯自带', currentValue: 67, threshold: 30, alarmLevel: '一般', powerOff: false, handled: true },
  { alarmTime: '2026-11-14 10:28:50', deviceId: 'LK-035-019', detectMethod: '单灯自带', currentValue: 58, threshold: 30, alarmLevel: '一般', powerOff: false, handled: false },
  { alarmTime: '2026-11-14 09:58:41', deviceId: 'LK-012-006', detectMethod: '单灯自带', currentValue: 112, threshold: 30, alarmLevel: '重要', powerOff: true, handled: true },
  { alarmTime: '2026-11-14 09:45:12', deviceId: 'LK-002', detectMethod: '回路比对', currentValue: 135, threshold: 30, alarmLevel: '重要', powerOff: false, handled: true },
  { alarmTime: '2026-11-14 09:32:05', deviceId: 'LK-023', detectMethod: '回路比对', currentValue: 158, threshold: 30, alarmLevel: '紧急', powerOff: true, handled: true },
  { alarmTime: '2026-11-14 09:18:33', deviceId: 'LK-028-011', detectMethod: '单灯自带', currentValue: 72, threshold: 30, alarmLevel: '一般', powerOff: false, handled: true },
  { alarmTime: '2026-11-14 08:55:21', deviceId: 'LK-007', detectMethod: '回路比对', currentValue: 145, threshold: 30, alarmLevel: '重要', powerOff: false, handled: true },
  { alarmTime: '2026-11-14 08:42:10', deviceId: 'LK-042-009', detectMethod: '单灯自带', currentValue: 63, threshold: 30, alarmLevel: '一般', powerOff: false, handled: true },
])

const filteredList = computed(() => {
  let list = historyList.value
  if (levelFilter.value) list = list.filter(i => i.alarmLevel === levelFilter.value)
  if (deviceFilter.value) list = list.filter(i => i.deviceId.startsWith(deviceFilter.value))
  if (loopFilter.value) list = list.filter(i => i.deviceId.startsWith(loopFilter.value))
  return list
})

const urgentCount = computed(() => filteredList.value.filter(i => i.alarmLevel === '紧急').length)
const powerOffCount = computed(() => filteredList.value.filter(i => i.powerOff).length)
const handledRate = computed(() => {
  const total = filteredList.value.length || 1
  return Math.round(filteredList.value.filter(i => i.handled).length / total * 100)
})
</script>

<style scoped lang="scss">
.zg-leakhis { padding: 20px; display: flex; flex-direction: column; gap: 16px; }

.zg-leakhis__headline { display: flex; align-items: center; gap: 14px; }
.zg-leakhis__sigil {
  width: 44px; height: 44px; border-radius: 10px;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  color: #fff; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
}
.zg-leakhis__title { font-size: 20px; font-weight: 600; color: #1e293b; margin: 0 0 4px; }
.zg-leakhis__sub { font-size: 13px; color: #94a3b8; margin: 0; }

.zg-filterband {
  background: #fff; border: 1px solid #f1f5f9; border-radius: 12px;
  padding: 14px 16px; display: flex; flex-wrap: wrap; gap: 16px; align-items: center;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}
.zg-filterband__group { display: flex; align-items: center; gap: 8px; }
.zg-filterband__lbl { font-size: 13px; color: #64748b; white-space: nowrap; }
.zg-filterband__actions { margin-left: auto; display: flex; gap: 8px; }

.zg-metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.zg-metrics__cell {
  background: #fff; border: 1px solid #f1f5f9; border-radius: 12px;
  padding: 14px 16px; display: flex; align-items: center; gap: 14px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}
.zg-metrics__icon { width: 42px; height: 42px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
.zg-metrics__body { display: flex; flex-direction: column; gap: 2px; flex: 1; }
.zg-metrics__num { font-size: 22px; font-weight: 700; color: #1e293b; }
.zg-metrics__lbl { font-size: 13px; color: #94a3b8; }
.zg-metrics__cell--info .zg-metrics__icon { background: #dbeafe; color: #3b82f6; }
.zg-metrics__cell--info .zg-metrics__num { color: #3b82f6; }
.zg-metrics__cell--danger .zg-metrics__icon { background: #fee2e2; color: #ef4444; }
.zg-metrics__cell--danger .zg-metrics__num { color: #ef4444; }
.zg-metrics__cell--warn .zg-metrics__icon { background: #fef3c7; color: #f59e0b; }
.zg-metrics__cell--warn .zg-metrics__num { color: #f59e0b; }
.zg-metrics__cell--ok .zg-metrics__icon { background: #dcfce7; color: #22c55e; }
.zg-metrics__cell--ok .zg-metrics__num { color: #22c55e; }

.zg-leakhis__panel {
  background: #fff; border: 1px solid #f1f5f9; border-radius: 12px;
  padding: 14px; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}
.zg-leakhis__pager { display: flex; justify-content: flex-end; padding-top: 12px; }

.zg-code { color: #6366f1; font-size: 12px; }
.zg-mono { font-family: monospace; color: #475569; }
.zg-danger { color: #ef4444; font-weight: 600; }
.zg-warn { color: #f59e0b; font-weight: 600; }
.zg-success { color: #22c55e; }
.zg-muted { color: #94a3b8; }

@media (max-width: 1280px) {
  .zg-metrics { grid-template-columns: repeat(2, 1fr); }
  .zg-filterband__actions { margin-left: 0; }
}
</style>
