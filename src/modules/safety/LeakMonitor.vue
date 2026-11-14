<!-- 智光云枢 · 安全域 · 双轨漏电监测 -->
<template>
  <section class="zg-leakmon">
    <!-- 头部 -->
    <header class="zg-leakmon__head">
      <div class="zg-leakmon__headline">
        <div class="zg-leakmon__sigil">
          <el-icon :size="22"><Warning /></el-icon>
        </div>
        <div class="zg-leakmon__copy">
          <h1 class="zg-leakmon__title">双轨漏电监测</h1>
          <p class="zg-leakmon__sub">单灯自带传感器 + 回路电流比对 · 双轨并行实时监测</p>
        </div>
      </div>
      <div class="zg-leakmon__pulse">
        <el-tag type="danger" effect="dark" :icon="Warning" class="zg-live-tag">● LIVE 实时流</el-tag>
      </div>
    </header>

    <!-- 指标卡 -->
    <div class="zg-metrics">
      <div class="zg-metrics__cell zg-metrics__cell--info">
        <div class="zg-metrics__icon"><el-icon :size="20"><Cpu /></el-icon></div>
        <div class="zg-metrics__body">
          <div class="zg-metrics__num">1,842</div>
          <div class="zg-metrics__lbl">实时监测设备数</div>
          <div class="zg-metrics__mini">覆盖 86 回路 · 在线率 98.7%</div>
        </div>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--danger">
        <div class="zg-metrics__icon"><el-icon :size="20"><Warning /></el-icon></div>
        <div class="zg-metrics__body">
          <div class="zg-metrics__num">17</div>
          <div class="zg-metrics__lbl">当前漏电告警数</div>
          <div class="zg-metrics__mini">紧急 3 · 重要 9 · 一般 5</div>
        </div>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <div class="zg-metrics__icon"><el-icon :size="20"><Connection /></el-icon></div>
        <div class="zg-metrics__body">
          <div class="zg-metrics__num">8</div>
          <div class="zg-metrics__lbl">回路比对异常数</div>
          <div class="zg-metrics__mini">偏差超阈值 · 联动排查中</div>
        </div>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--ok">
        <div class="zg-metrics__icon"><el-icon :size="20"><Connection /></el-icon></div>
        <div class="zg-metrics__body">
          <div class="zg-metrics__num">284</div>
          <div class="zg-metrics__lbl">今日告警总数</div>
          <div class="zg-metrics__mini">较昨日 ↓12.3%</div>
        </div>
      </div>
    </div>

    <!-- 主体双栏 -->
    <div class="zg-leakmon__dual">
      <!-- 左：实时漏电电流曲线 -->
      <div class="zg-leakmon__panel">
        <div class="zg-leakmon__panel-head">
          <strong>📈 实时漏电电流曲线（多设备叠加）</strong>
          <div class="zg-leakmon__legend">
            <span><i class="dot dot-1"></i>设备 LK-001</span>
            <span><i class="dot dot-2"></i>设备 LK-007</span>
            <span><i class="dot dot-3"></i>设备 LK-015</span>
            <span><i class="dot dot-4"></i>设备 LK-023</span>
          </div>
        </div>
        <div class="zg-leakmon__chart">
          <svg viewBox="0 0 560 240" class="zg-chart-svg">
            <!-- 网格 -->
            <g stroke="#e2e8f0" stroke-width="0.5">
              <line x1="40" y1="30" x2="560" y2="30" />
              <line x1="40" y1="80" x2="560" y2="80" />
              <line x1="40" y1="130" x2="560" y2="130" />
              <line x1="40" y1="180" x2="560" y2="180" />
              <line x1="40" y1="220" x2="560" y2="220" />
            </g>
            <!-- Y 轴刻度 -->
            <g fill="#94a3b8" font-size="10" font-family="monospace">
              <text x="6" y="34">200mA</text>
              <text x="6" y="84">150mA</text>
              <text x="6" y="134">100mA</text>
              <text x="6" y="184">50mA</text>
              <text x="6" y="224">0</text>
            </g>
            <!-- 阈值线 30mA -->
            <line x1="40" y1="190" x2="560" y2="190" stroke="#ef4444" stroke-width="1" stroke-dasharray="4 4" />
            <text x="500" y="186" fill="#ef4444" font-size="10" font-family="monospace">阈值 30mA</text>
            <!-- 设备1 曲线 -->
            <polyline points="40,200 90,195 140,188 190,192 240,175 290,168 340,160 390,145 440,155 490,170 540,180"
              fill="none" stroke="#3b82f6" stroke-width="2" />
            <!-- 设备2 曲线 -->
            <polyline points="40,198 90,190 140,175 190,170 240,155 290,140 340,125 390,110 440,95 490,108 540,120"
              fill="none" stroke="#22c55e" stroke-width="2" />
            <!-- 设备3 曲线 -->
            <polyline points="40,195 90,178 140,160 190,145 240,130 290,105 340,85 390,65 440,50 490,70 540,90"
              fill="none" stroke="#f59e0b" stroke-width="2" />
            <!-- 设备4 曲线（异常峰值） -->
            <polyline points="40,192 90,165 140,140 190,115 240,80 290,45 340,55 390,95 440,130 490,155 540,175"
              fill="none" stroke="#ef4444" stroke-width="2" />
            <!-- 告警点标记 -->
            <circle cx="290" cy="45" r="5" fill="#ef4444" />
            <text x="300" y="40" fill="#ef4444" font-size="10" font-weight="bold">告警峰值 168mA</text>
          </svg>
        </div>
        <div class="zg-leakmon__xaxis">
          <span>11:30</span><span>11:40</span><span>11:50</span><span>12:00</span><span>12:10</span><span>12:20</span><span>12:30</span>
        </div>
      </div>

      <!-- 右：回路电流比对面板 -->
      <div class="zg-leakmon__panel">
        <div class="zg-leakmon__panel-head">
          <strong>⚖️ 回路电流比对面板</strong>
          <el-button size="small" :icon="Refresh">刷新</el-button>
        </div>
        <el-table :data="loopCompare" stripe size="default" style="width: 100%" height="280">
          <el-table-column prop="loopId" label="回路ID" width="100">
            <template #default="{ row }">
              <code class="zg-code">{{ row.loopId }}</code>
            </template>
          </el-table-column>
          <el-table-column prop="sumLamp" label="Σ单灯电流 A" width="120" align="right">
            <template #default="{ row }">{{ row.sumLamp.toFixed(2) }}</template>
          </el-table-column>
          <el-table-column prop="loopOut" label="回路输出电流 A" width="130" align="right">
            <template #default="{ row }">{{ row.loopOut.toFixed(2) }}</template>
          </el-table-column>
          <el-table-column prop="deltaI" label="ΔI 差值 mA" width="120" align="right">
            <template #default="{ row }">
              <span :class="Math.abs(row.deltaI) > row.threshold ? 'zg-danger' : ''">{{ row.deltaI.toFixed(1) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="threshold" label="阈值 mA" width="100" align="center" />
          <el-table-column label="状态" width="110" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status === '正常' ? 'success' : row.status === '预警' ? 'warning' : 'danger'" size="small" effect="light">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 底部告警列表 -->
    <div class="zg-leakmon__panel zg-leakmon__panel--full">
      <div class="zg-leakmon__panel-head">
        <strong>🚨 实时告警列表</strong>
        <div class="zg-filterband">
          <el-select v-model="alarmFilter" placeholder="全部级别" size="small" style="width: 120px">
            <el-option label="全部级别" value="" />
            <el-option label="紧急" value="紧急" />
            <el-option label="重要" value="重要" />
            <el-option label="一般" value="一般" />
          </el-select>
          <el-button type="primary" size="small" :icon="Download">导出</el-button>
        </div>
      </div>
      <el-table :data="filteredAlarms" stripe size="default" style="width: 100%">
        <el-table-column prop="time" label="告警时间" width="170">
          <template #default="{ row }">
            <span class="zg-mono">{{ row.time }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="deviceId" label="设备ID" width="130">
          <template #default="{ row }">
            <code class="zg-code">{{ row.deviceId }}</code>
          </template>
        </el-table-column>
        <el-table-column label="位置" min-width="200">
          <template #default="{ row }">{{ row.location }}</template>
        </el-table-column>
        <el-table-column prop="method" label="检测方式" width="140" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="row.method === '单灯自带' ? 'info' : 'primary'">{{ row.method }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="current" label="电流值 mA" width="120" align="right">
          <template #default="{ row }">
            <span class="zg-danger">{{ row.current }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="level" label="告警级别" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.level === '紧急' ? 'danger' : row.level === '重要' ? 'warning' : 'info'" size="small" effect="dark">
              {{ row.level }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="powerOff" label="联动断电" width="100" align="center">
          <template #default="{ row }">
            <el-icon v-if="row.powerOff" class="zg-success"><CircleCheck /></el-icon>
            <el-icon v-else class="zg-muted"><CircleClose /></el-icon>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small">详情</el-button>
            <el-button link type="primary" size="small">确认</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Warning, Cpu, Connection, Refresh, Download, CircleCheck, CircleClose } from "@element-plus/icons-vue"

const alarmFilter = ref('')

// 回路比对 mock 数据
const loopCompare = ref([
  { loopId: 'LK-001', sumLamp: 4.82, loopOut: 4.85, deltaI: -320, threshold: 500, status: '正常' },
  { loopId: 'LK-002', sumLamp: 5.15, loopOut: 5.38, deltaI: -2300, threshold: 500, status: '告警' },
  { loopId: 'LK-007', sumLamp: 3.96, loopOut: 3.98, deltaI: -200, threshold: 500, status: '正常' },
  { loopId: 'LK-012', sumLamp: 6.28, loopOut: 6.72, deltaI: -4400, threshold: 500, status: '告警' },
  { loopId: 'LK-015', sumLamp: 4.55, loopOut: 4.61, deltaI: -600, threshold: 500, status: '预警' },
  { loopId: 'LK-018', sumLamp: 5.02, loopOut: 5.04, deltaI: -180, threshold: 500, status: '正常' },
  { loopId: 'LK-023', sumLamp: 3.78, loopOut: 3.82, deltaI: -420, threshold: 500, status: '正常' },
  { loopId: 'LK-028', sumLamp: 5.41, loopOut: 5.88, deltaI: -4700, threshold: 500, status: '告警' },
  { loopId: 'LK-035', sumLamp: 4.12, loopOut: 4.14, deltaI: -200, threshold: 500, status: '正常' },
  { loopId: 'LK-042', sumLamp: 6.88, loopOut: 7.15, deltaI: -2700, threshold: 500, status: '告警' },
  { loopId: 'LK-051', sumLamp: 4.33, loopOut: 4.37, deltaI: -380, threshold: 500, status: '正常' },
  { loopId: 'LK-063', sumLamp: 5.56, loopOut: 5.68, deltaI: -1200, threshold: 500, status: '预警' },
])

// 告警列表 mock 数据
const alarmList = ref([
  { time: '2026-11-14 12:28:45', deviceId: 'LK-023-007', location: '先导路 · 麓谷大道交叉口东北角', method: '单灯自带', current: 168, level: '紧急', powerOff: true },
  { time: '2026-11-14 12:15:32', deviceId: 'LK-002', location: '先导路 · 文轩路 38 号配电箱', method: '回路比对', current: 142, level: '紧急', powerOff: true },
  { time: '2026-11-14 12:08:19', deviceId: 'LK-028', location: '梅溪湖 · 环湖路 K15+200', method: '回路比对', current: 156, level: '紧急', powerOff: true },
  { time: '2026-11-14 11:52:07', deviceId: 'LK-012', location: '岳麓区 · 新民路公交站南', method: '回路比对', current: 138, level: '重要', powerOff: false },
  { time: '2026-11-14 11:41:55', deviceId: 'LK-015-003', location: '麓谷产业园 · B 栋北侧', method: '单灯自带', current: 89, level: '重要', powerOff: false },
  { time: '2026-11-14 11:33:22', deviceId: 'LK-042', location: '橘子洲头 · 青年雕像西南', method: '回路比对', current: 125, level: '重要', powerOff: false },
  { time: '2026-11-14 11:25:10', deviceId: 'LK-063', location: '先导路 · 林语桥南', method: '回路比对', current: 98, level: '重要', powerOff: false },
  { time: '2026-11-14 11:18:44', deviceId: 'LK-023-012', location: '梅溪湖 · 节庆岛入口', method: '单灯自带', current: 178, level: '紧急', powerOff: true },
  { time: '2026-11-14 11:05:33', deviceId: 'LK-051-008', location: '岳麓区 · 桐梓坡路 256 号', method: '单灯自带', current: 52, level: '一般', powerOff: false },
  { time: '2026-11-14 10:52:18', deviceId: 'LK-007-015', location: '麓谷科技新城 · C 栋停车场', method: '单灯自带', current: 45, level: '一般', powerOff: false },
  { time: '2026-11-14 10:41:02', deviceId: 'LK-018-022', location: '先导路 · 枫林三路交叉口', method: '单灯自带', current: 67, level: '一般', powerOff: false },
  { time: '2026-11-14 10:28:50', deviceId: 'LK-035-019', location: '梅溪湖 · 金茂湾东门', method: '单灯自带', current: 58, level: '一般', powerOff: false },
])

const filteredAlarms = computed(() => alarmFilter.value
  ? alarmList.value.filter(a => a.level === alarmFilter.value)
  : alarmList.value)
</script>

<style scoped lang="scss">
.zg-leakmon { padding: 20px; display: flex; flex-direction: column; gap: 16px; }

.zg-leakmon__head { display: flex; justify-content: space-between; align-items: center; }
.zg-leakmon__headline { display: flex; align-items: center; gap: 14px; }
.zg-leakmon__sigil {
  width: 44px; height: 44px; border-radius: 10px;
  background: linear-gradient(135deg, #ef4444, #f59e0b);
  color: #fff; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.35);
}
.zg-leakmon__title { font-size: 20px; font-weight: 600; color: #1e293b; margin: 0 0 4px; }
.zg-leakmon__sub { font-size: 13px; color: #94a3b8; margin: 0; }
.zg-live-tag { animation: blink 1.2s infinite; }
@keyframes blink { 0%, 100% { opacity: 1 } 50% { opacity: 0.5 } }

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
.zg-metrics__mini { font-size: 11px; color: #94a3b8; font-family: monospace; }
.zg-metrics__cell--info .zg-metrics__icon { background: #dbeafe; color: #3b82f6; }
.zg-metrics__cell--info .zg-metrics__num { color: #3b82f6; }
.zg-metrics__cell--danger .zg-metrics__icon { background: #fee2e2; color: #ef4444; }
.zg-metrics__cell--danger .zg-metrics__num { color: #ef4444; }
.zg-metrics__cell--warn .zg-metrics__icon { background: #fef3c7; color: #f59e0b; }
.zg-metrics__cell--warn .zg-metrics__num { color: #f59e0b; }
.zg-metrics__cell--ok .zg-metrics__icon { background: #dcfce7; color: #22c55e; }
.zg-metrics__cell--ok .zg-metrics__num { color: #22c55e; }

.zg-leakmon__dual { display: grid; grid-template-columns: 1.3fr 1fr; gap: 14px; }
.zg-leakmon__panel {
  background: #fff; border: 1px solid #f1f5f9; border-radius: 12px;
  padding: 14px; display: flex; flex-direction: column; gap: 12px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}
.zg-leakmon__panel--full { grid-column: 1 / -1; }
.zg-leakmon__panel-head {
  display: flex; justify-content: space-between; align-items: center;
  strong { font-size: 14px; color: #1e293b; font-weight: 600; }
}

.zg-leakmon__legend { display: flex; gap: 12px; font-size: 11px; color: #64748b; span { display: flex; align-items: center; gap: 4px; } }
.dot { width: 10px; height: 3px; border-radius: 2px; display: inline-block; }
.dot-1 { background: #3b82f6; }
.dot-2 { background: #22c55e; }
.dot-3 { background: #f59e0b; }
.dot-4 { background: #ef4444; }

.zg-leakmon__chart { border-radius: 8px; overflow: hidden; background: #fafbfc; }
.zg-chart-svg { width: 100%; height: 240px; display: block; }
.zg-leakmon__xaxis {
  display: flex; justify-content: space-between; padding: 4px 10px 0;
  font-size: 10px; color: #94a3b8; font-family: monospace;
}

.zg-filterband { display: flex; gap: 8px; align-items: center; }
.zg-code { color: #6366f1; font-size: 12px; }
.zg-mono { font-family: monospace; color: #475569; }
.zg-danger { color: #ef4444; font-weight: 600; }
.zg-success { color: #22c55e; }
.zg-muted { color: #94a3b8; }

@media (max-width: 1280px) {
  .zg-metrics { grid-template-columns: repeat(2, 1fr); }
  .zg-leakmon__dual { grid-template-columns: 1fr; }
}
</style>
