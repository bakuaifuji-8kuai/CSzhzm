<!-- 智光云枢 · 安全域 · 浸水关键点位 -->
<template>
  <section class="zg-waterkey">
    <!-- 头部 -->
    <header class="zg-waterkey__head">
      <div class="zg-waterkey__headline">
        <div class="zg-waterkey__sigil">
          <el-icon :size="22"><Watermelon /></el-icon>
        </div>
        <div class="zg-waterkey__copy">
          <h1 class="zg-waterkey__title">浸水关键点位</h1>
          <p class="zg-waterkey__sub">江边 · 低洼 · 地下 三类点位 · 地理围栏 + 联动漏电/断电</p>
        </div>
      </div>
    </header>

    <!-- 指标卡 -->
    <div class="zg-metrics">
      <div class="zg-metrics__cell zg-metrics__cell--info">
        <div class="zg-metrics__icon"><el-icon :size="20"><MapLocation /></el-icon></div>
        <div class="zg-metrics__body">
          <div class="zg-metrics__num">156</div>
          <div class="zg-metrics__lbl">浸水点位总数</div>
          <div class="zg-metrics__mini">江边 42 · 低洼 68 · 地下 46</div>
        </div>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--danger">
        <div class="zg-metrics__icon"><el-icon :size="20"><Warning /></el-icon></div>
        <div class="zg-metrics__body">
          <div class="zg-metrics__num">28</div>
          <div class="zg-metrics__lbl">关键点位</div>
          <div class="zg-metrics__mini">湘江沿岸 + 历史积水点</div>
        </div>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <div class="zg-metrics__icon"><el-icon :size="20"><Connection /></el-icon></div>
        <div class="zg-metrics__body">
          <div class="zg-metrics__num">89</div>
          <div class="zg-metrics__lbl">已联动漏电监测</div>
          <div class="zg-metrics__mini">联动率 57.1%</div>
        </div>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--ok">
        <div class="zg-metrics__icon"><el-icon :size="20"><Switch /></el-icon></div>
        <div class="zg-metrics__body">
          <div class="zg-metrics__num">124</div>
          <div class="zg-metrics__lbl">已联动自动断电</div>
          <div class="zg-metrics__mini">联动率 79.5%</div>
        </div>
      </div>
    </div>

    <!-- 主体：地图 + 点位列表 -->
    <div class="zg-waterkey__dual">
      <!-- 左：地图占位 -->
      <div class="zg-waterkey__panel">
        <div class="zg-waterkey__panel-head">
          <strong>🗺️ 浸水关键点位地图 · 长沙市域</strong>
          <div class="zg-waterkey__legend">
            <span><i class="dot dot-critical"></i>关键点位</span>
            <span><i class="dot dot-normal"></i>普通点位</span>
            <span><i class="dot dot-fence"></i>地理围栏</span>
          </div>
        </div>
        <div class="zg-waterkey__map">
          <svg viewBox="0 0 560 320" class="zg-waterkey__svg">
            <defs>
              <linearGradient id="river" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#bfdbfe" />
                <stop offset="100%" stop-color="#93c5fd" />
              </linearGradient>
              <linearGradient id="land" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#f0fdf4" />
                <stop offset="100%" stop-color="#dcfce7" />
              </linearGradient>
            </defs>
            <!-- 陆地 -->
            <rect width="560" height="320" fill="url(#land)" />
            <!-- 湘江 -->
            <path d="M 0 180 Q 140 140 280 200 Q 420 260 560 180 L 560 320 L 0 320 Z" fill="url(#river)" opacity="0.85" />
            <!-- 地理围栏（圆圈） -->
            <circle cx="140" cy="100" r="40" fill="none" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.6" />
            <circle cx="380" cy="150" r="45" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.6" />
            <!-- 点位 -->
            <g v-for="p in mapPoints" :key="p.id">
              <circle :cx="p.x" :cy="p.y" r="6" :class="'mapdot mapdot--' + p.type" />
              <text :x="p.x + 10" :y="p.y + 4" fill="#1e293b" font-size="10">{{ p.label }}</text>
            </g>
            <!-- 地名 -->
            <text x="20" y="40" fill="#475569" font-size="12" font-weight="600">岳麓区</text>
            <text x="420" y="40" fill="#475569" font-size="12" font-weight="600">天心区</text>
            <text x="20" y="300" fill="#475569" font-size="12" font-weight="600">雨花区</text>
            <text x="470" y="300" fill="#475569" font-size="12" font-weight="600">芙蓉区</text>
            <text x="260" y="250" fill="#1e40af" font-size="13" font-weight="700">湘 江</text>
          </svg>
        </div>
        <!-- 图例说明 -->
        <div class="zg-waterkey__map-legend">
          <div class="zg-waterkey__legend-item">
            <el-icon class="zg-danger"><Warning /></el-icon>
            <span>红圈 = 湘江沿岸 200m 围栏（关键点位自动触发联动）</span>
          </div>
          <div class="zg-waterkey__legend-item">
            <el-icon class="zg-warn"><AlarmClock /></el-icon>
            <span>黄圈 = 历史积水点围栏（低洼路段，超 5 年积水 ≥ 3 次）</span>
          </div>
        </div>
      </div>

      <!-- 右：点位列表 -->
      <div class="zg-waterkey__panel">
        <div class="zg-waterkey__panel-head">
          <strong>📍 浸水关键点位列表</strong>
          <div class="zg-filterband">
            <el-select v-model="typeFilter" placeholder="全部类型" size="small" style="width: 110px">
              <el-option label="全部类型" value="" />
              <el-option label="江边" value="江边" />
              <el-option label="低洼" value="低洼" />
              <el-option label="地下" value="地下" />
            </el-select>
            <el-button size="small" type="primary" :icon="Plus">新增点位</el-button>
          </div>
        </div>
        <div class="zg-waterkey__list">
          <div v-for="p in filteredPoints" :key="p.id" class="zg-waterkey__item">
            <div class="zg-waterkey__item-head">
              <span class="zg-waterkey__name">{{ p.name }}</span>
              <el-tag
                :type="p.isCritical ? 'danger' : 'info'"
                effect="dark"
                size="small"
              >{{ p.isCritical ? '关键点位' : '普通点位' }}</el-tag>
            </div>
            <div class="zg-waterkey__item-meta">
              <el-tag size="small" effect="plain" class="zg-tag-type">{{ p.type }}</el-tag>
              <span class="zg-waterkey__dist">{{ p.district }}</span>
            </div>
            <div class="zg-waterkey__item-flags">
              <span class="zg-flag" :class="p.fence ? 'on' : ''">
                <el-icon><Grid /></el-icon> 地理围栏
              </span>
              <span class="zg-flag" :class="p.linkLeak ? 'on' : ''">
                <el-icon><Connection /></el-icon> 联动漏电
              </span>
              <span class="zg-flag" :class="p.linkPower ? 'on' : ''">
                <el-icon><Switch /></el-icon> 联动断电
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 全量表格 -->
    <div class="zg-waterkey__panel zg-waterkey__panel--full">
      <div class="zg-waterkey__panel-head">
        <strong>📋 点位全量清单</strong>
        <el-button type="primary" size="small" :icon="Download">导出</el-button>
      </div>
      <el-table :data="filteredPoints" stripe size="default" style="width: 100%">
        <el-table-column prop="id" label="编号" width="100">
          <template #default="{ row }"><code class="zg-code">{{ row.id }}</code></template>
        </el-table-column>
        <el-table-column prop="name" label="点位名称" min-width="220" />
        <el-table-column prop="type" label="类型" width="90" align="center">
          <template #default="{ row }">
            <el-tag size="small" effect="plain">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="district" label="所属行政区" width="140" />
        <el-table-column label="是否关键点位" width="120" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.isCritical" type="danger" effect="dark" size="small">关键</el-tag>
            <el-tag v-else type="info" effect="plain" size="small">普通</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="地理围栏" width="110" align="center">
          <template #default="{ row }">
            <el-icon v-if="row.fence" class="zg-success"><CircleCheck /></el-icon>
            <el-icon v-else class="zg-muted"><CircleClose /></el-icon>
          </template>
        </el-table-column>
        <el-table-column label="联动漏电" width="110" align="center">
          <template #default="{ row }">
            <el-icon v-if="row.linkLeak" class="zg-success"><CircleCheck /></el-icon>
            <el-icon v-else class="zg-muted"><CircleClose /></el-icon>
          </template>
        </el-table-column>
        <el-table-column label="联动断电" width="110" align="center">
          <template #default="{ row }">
            <el-icon v-if="row.linkPower" class="zg-success"><CircleCheck /></el-icon>
            <el-icon v-else class="zg-muted"><CircleClose /></el-icon>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Watermelon, MapLocation, Warning, Connection, Switch, AlarmClock, Plus, Download, CircleCheck, CircleClose, Grid } from "@element-plus/icons-vue"

const typeFilter = ref('')

// 地图点位 mock
const mapPoints = ref([
  { id: 'WP-001', x: 140, y: 95, type: 'critical', label: '橘子洲' },
  { id: 'WP-002', x: 160, y: 100, type: 'normal', label: '麓谷' },
  { id: 'WP-003', x: 130, y: 115, type: 'normal', label: '先导路' },
  { id: 'WP-004', x: 150, y: 150, type: 'critical', label: '银盆岭' },
  { id: 'WP-005', x: 380, y: 145, type: 'critical', label: '太平街' },
  { id: 'WP-006', x: 395, y: 160, type: 'normal', label: '五一广场' },
  { id: 'WP-007', x: 360, y: 170, type: 'normal', label: '候家塘' },
  { id: 'WP-008', x: 420, y: 180, type: 'critical', label: '杜甫江阁' },
  { id: 'WP-009', x: 250, y: 220, type: 'normal', label: '新开铺' },
  { id: 'WP-010', x: 300, y: 240, type: 'critical', label: '猴子石大桥' },
  { id: 'WP-011', x: 80, y: 60, type: 'normal', label: '望城' },
  { id: 'WP-012', x: 480, y: 60, type: 'normal', label: '星沙' },
])

// 点位列表 mock 数据（不少于 10 条）
const pointList = ref([
  { id: 'WP-001', name: '橘子洲头 · 青年雕像东侧照明配电室', type: '江边', district: '岳麓区', isCritical: true, fence: true, linkLeak: true, linkPower: true },
  { id: 'WP-002', name: '麓谷大道 K12+300 低洼积水段', type: '低洼', district: '岳麓区', isCritical: false, fence: true, linkLeak: true, linkPower: true },
  { id: 'WP-003', name: '先导路地下车库 A 入口', type: '地下', district: '岳麓区', isCritical: false, fence: false, linkLeak: true, linkPower: true },
  { id: 'WP-004', name: '银盆岭湘江沿岸步道配电箱', type: '江边', district: '岳麓区', isCritical: true, fence: true, linkLeak: true, linkPower: true },
  { id: 'WP-005', name: '太平街历史文化街区地下管线', type: '地下', district: '天心区', isCritical: true, fence: true, linkLeak: true, linkPower: false },
  { id: 'WP-006', name: '五一广场东南角下穿通道', type: '地下', district: '芙蓉区', isCritical: false, fence: false, linkLeak: false, linkPower: true },
  { id: 'WP-007', name: '候家塘中心广场低洼点', type: '低洼', district: '天心区', isCritical: false, fence: true, linkLeak: false, linkPower: false },
  { id: 'WP-008', name: '杜甫江阁沿江照明回路', type: '江边', district: '天心区', isCritical: true, fence: true, linkLeak: true, linkPower: true },
  { id: 'WP-009', name: '新开铺路 K5+800 积水点', type: '低洼', district: '雨花区', isCritical: false, fence: true, linkLeak: true, linkPower: true },
  { id: 'WP-010', name: '猴子石大桥桥下照明配电间', type: '地下', district: '岳麓区', isCritical: true, fence: true, linkLeak: true, linkPower: true },
  { id: 'WP-011', name: '望城区沿江路 K2+500', type: '江边', district: '望城区', isCritical: true, fence: true, linkLeak: false, linkPower: true },
  { id: 'WP-012', name: '星沙东四路地下停车场 B2', type: '地下', district: '长沙县', isCritical: false, fence: false, linkLeak: true, linkPower: false },
])

const filteredPoints = computed(() => typeFilter.value
  ? pointList.value.filter(p => p.type === typeFilter.value)
  : pointList.value)
</script>

<style scoped lang="scss">
.zg-waterkey { padding: 20px; display: flex; flex-direction: column; gap: 16px; }

.zg-waterkey__headline { display: flex; align-items: center; gap: 14px; }
.zg-waterkey__sigil {
  width: 44px; height: 44px; border-radius: 10px;
  background: linear-gradient(135deg, #0ea5e9, #06b6d4);
  color: #fff; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 14px rgba(14, 165, 233, 0.35);
}
.zg-waterkey__title { font-size: 20px; font-weight: 600; color: #1e293b; margin: 0 0 4px; }
.zg-waterkey__sub { font-size: 13px; color: #94a3b8; margin: 0; }

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

.zg-waterkey__dual { display: grid; grid-template-columns: 1.4fr 1fr; gap: 14px; }
.zg-waterkey__panel {
  background: #fff; border: 1px solid #f1f5f9; border-radius: 12px;
  padding: 14px; display: flex; flex-direction: column; gap: 12px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}
.zg-waterkey__panel--full { grid-column: 1 / -1; }
.zg-waterkey__panel-head {
  display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;
  strong { font-size: 14px; color: #1e293b; font-weight: 600; }
}

.zg-waterkey__legend { display: flex; gap: 14px; font-size: 11px; color: #64748b; span { display: flex; align-items: center; gap: 4px; } }
.dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
.dot-critical { background: #ef4444; }
.dot-normal { background: #3b82f6; }
.dot-fence { border: 1.5px dashed #f59e0b; background: transparent; }

.zg-waterkey__map { border-radius: 8px; overflow: hidden; background: #f0fdf4; }
.zg-waterkey__svg { width: 100%; height: 320px; display: block; }
.mapdot { stroke: #fff; stroke-width: 2; }
.mapdot--critical { fill: #ef4444; filter: drop-shadow(0 0 4px rgba(239, 68, 68, 0.8)); }
.mapdot--normal { fill: #3b82f6; filter: drop-shadow(0 0 3px rgba(59, 130, 246, 0.6)); }

.zg-waterkey__map-legend { display: flex; flex-direction: column; gap: 6px; padding-top: 4px; }
.zg-waterkey__legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #475569; }
.zg-danger { color: #ef4444; }
.zg-warn { color: #f59e0b; }

.zg-waterkey__list { display: flex; flex-direction: column; gap: 10px; max-height: 520px; overflow-y: auto; }
.zg-waterkey__item {
  padding: 12px; border: 1px solid #f1f5f9; border-radius: 10px;
  background: #fafbfc; transition: all 0.2s;
}
.zg-waterkey__item:hover { border-color: #cbd5e1; box-shadow: 0 2px 6px rgba(0,0,0,0.05); }
.zg-waterkey__item-head { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.zg-waterkey__name { font-size: 13px; font-weight: 600; color: #1e293b; }
.zg-waterkey__item-meta { display: flex; gap: 8px; align-items: center; margin-top: 6px; }
.zg-tag-type { font-size: 11px; }
.zg-waterkey__dist { font-size: 12px; color: #64748b; }
.zg-waterkey__item-flags { display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap; }
.zg-flag {
  display: inline-flex; align-items: center; gap: 3px;
  padding: 2px 8px; border-radius: 10px; font-size: 11px;
  background: #f1f5f9; color: #94a3b8;
}
.zg-flag.on { background: #dcfce7; color: #16a34a; }

.zg-code { color: #6366f1; font-size: 12px; }
.zg-success { color: #22c55e; }
.zg-muted { color: #94a3b8; }

@media (max-width: 1280px) {
  .zg-metrics { grid-template-columns: repeat(2, 1fr); }
  .zg-waterkey__dual { grid-template-columns: 1fr; }
}
</style>
