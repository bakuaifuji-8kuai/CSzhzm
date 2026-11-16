<!-- 智光云枢 · 安全域 · 开门抓拍日志 -->
<template>
  <section class="zg-cabinet">
    <!-- 头部 -->
    <header class="zg-cabinet__head">
      <div class="zg-cabinet__headline">
        <div class="zg-cabinet__sigil">
          <el-icon :size="22"><Camera /></el-icon>
        </div>
        <div class="zg-cabinet__copy">
          <h1 class="zg-cabinet__title">开门抓拍日志</h1>
          <p class="zg-cabinet__sub">配电箱电子锁 / 机械锁 / 抓拍 三源日志汇聚 · AI 识别开门人</p>
        </div>
      </div>
    </header>

    <!-- 指标卡 -->
    <div class="zg-metrics">
      <div class="zg-metrics__cell zg-metrics__cell--info">
        <div class="zg-metrics__icon"><el-icon :size="20"><Key /></el-icon></div>
        <div class="zg-metrics__body">
          <div class="zg-metrics__num">127</div>
          <div class="zg-metrics__lbl">今日开门次数</div>
          <div class="zg-metrics__mini">较昨日 ↑8.5%</div>
        </div>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--danger">
        <div class="zg-metrics__icon"><el-icon :size="20"><Timer /></el-icon></div>
        <div class="zg-metrics__body">
          <div class="zg-metrics__num">6</div>
          <div class="zg-metrics__lbl">开门超时未关</div>
          <div class="zg-metrics__mini">超过 15 分钟未关闭</div>
        </div>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <div class="zg-metrics__icon"><el-icon :size="20"><User /></el-icon></div>
        <div class="zg-metrics__body">
          <div class="zg-metrics__num">23</div>
          <div class="zg-metrics__lbl">外部人员开门</div>
          <div class="zg-metrics__mini">访客 / 抢修 / 快递</div>
        </div>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--ok">
        <div class="zg-metrics__icon"><el-icon :size="20"><CircleCheck /></el-icon></div>
        <div class="zg-metrics__body">
          <div class="zg-metrics__num">101</div>
          <div class="zg-metrics__lbl">内部人员正常开门</div>
          <div class="zg-metrics__mini">运维 / 巡检 / 工程</div>
        </div>
      </div>
    </div>

    <!-- 过滤工具栏 -->
    <div class="zg-filterband">
      <div class="zg-filterband__group">
        <span class="zg-filterband__lbl">配电箱：</span>
        <el-input v-model="cabinetFilter" placeholder="输入编号" clearable size="default" style="width: 160px" />
      </div>
      <div class="zg-filterband__group">
        <span class="zg-filterband__lbl">开门方式：</span>
        <el-select v-model="methodFilter" placeholder="全部" clearable size="default" style="width: 120px">
          <el-option label="电子锁" value="电子锁" />
          <el-option label="机械锁" value="机械锁" />
          <el-option label="抓拍" value="抓拍" />
        </el-select>
      </div>
      <div class="zg-filterband__group">
        <span class="zg-filterband__lbl">人员类型：</span>
        <el-select v-model="personFilter" placeholder="全部" clearable size="default" style="width: 120px">
          <el-option label="内部" value="内部" />
          <el-option label="外部" value="外部" />
        </el-select>
      </div>
      <div class="zg-filterband__actions">
        <el-button type="primary" :icon="Search">查询</el-button>
        <el-button :icon="Download">导出</el-button>
      </div>
    </div>

    <!-- 表格 -->
    <div class="zg-cabinet__panel">
      <el-table :data="filteredLogs" stripe size="default" style="width: 100%" height="500">
        <el-table-column prop="openTime" label="开门时间" width="170" fixed>
          <template #default="{ row }">
            <span class="zg-mono">{{ row.openTime }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="cabinetId" label="配电箱编号" width="150">
          <template #default="{ row }">
            <code class="zg-code">{{ row.cabinetId }}</code>
          </template>
        </el-table-column>
        <el-table-column label="开门人" min-width="180">
          <template #default="{ row }">
            <div class="zg-person">
              <span class="zg-person__name">{{ row.personName }}</span>
              <el-tag
                :type="row.personType === '内部' ? 'success' : 'warning'"
                size="small"
                effect="plain"
              >{{ row.personType }}</el-tag>
            </div>
            <div v-if="row.personDept" class="zg-person__dept">{{ row.personDept }}</div>
          </template>
        </el-table-column>
        <el-table-column label="开门方式" width="120" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.openMethod === '电子锁' ? 'success' : row.openMethod === '抓拍' ? 'primary' : 'info'"
              size="small"
              effect="light"
            >{{ row.openMethod }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="开门时长 (分钟)" width="140" align="right">
          <template #default="{ row }">
            <span :class="row.duration > 15 ? 'zg-danger' : row.duration > 5 ? 'zg-warn' : 'zg-normal'">
              {{ row.duration }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="抓拍照片" width="130" align="center">
          <template #default="{ row }">
            <el-image
              v-if="row.hasPhoto"
              :src="row.photoUrl"
              :preview-src-list="[row.photoUrl]"
              fit="cover"
              style="width: 90px; height: 50px; border-radius: 4px"
              preview-teleported
            />
            <span v-else class="zg-muted">—</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="zg-cabinet__pager">
        <el-pagination
          background
          layout="total, prev, pager, next"
          :total="filteredLogs.length"
          :page-size="15"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Camera, Key, Timer, User, CircleCheck, Search, Download } from "@element-plus/icons-vue"

const cabinetFilter = ref('')
const methodFilter = ref('')
const personFilter = ref('')

// 生成抓拍照片占位 URL
const makePhoto = (cabinetId) => `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cabinet%20door%20opening%20surveillance%20photo%20${cabinetId}%20dark%20warehouse&image_size=landscape_4_3`

// mock 数据：不少于 15 条
const doorLogs = ref([
  { openTime: '2026-11-14 12:32:18', cabinetId: 'PD-XGL-038', personName: '张伟', personType: '内部', personDept: '岳麓区运维班', openMethod: '电子锁', duration: 8, hasPhoto: true, photoUrl: makePhoto('PD-XGL-038') },
  { openTime: '2026-11-14 12:18:45', cabinetId: 'PD-LG-012', personName: '李强', personType: '内部', personDept: '麓谷巡线组', openMethod: '电子锁', duration: 12, hasPhoto: true, photoUrl: makePhoto('PD-LG-012') },
  { openTime: '2026-11-14 12:05:33', cabinetId: 'PD-MXH-025', personName: '王芳', personType: '外部', personDept: '中国电信 光纤抢修', openMethod: '机械锁', duration: 45, hasPhoto: true, photoUrl: makePhoto('PD-MXH-025') },
  { openTime: '2026-11-14 11:52:10', cabinetId: 'PD-XGL-088', personName: '赵静', personType: '内部', personDept: '配电工程组', openMethod: '电子锁', duration: 22, hasPhoto: true, photoUrl: makePhoto('PD-XGL-088') },
  { openTime: '2026-11-14 11:38:02', cabinetId: 'PD-LG-045', personName: '无权限人员', personType: '外部', personDept: '未登记', openMethod: '机械锁', duration: 15, hasPhoto: true, photoUrl: makePhoto('PD-LG-045') },
  { openTime: '2026-11-14 11:22:55', cabinetId: 'PD-MXH-007', personName: '刘伟', personType: '内部', personDept: '梅溪湖片区', openMethod: '电子锁', duration: 5, hasPhoto: true, photoUrl: makePhoto('PD-MXH-007') },
  { openTime: '2026-11-14 11:08:41', cabinetId: 'PD-YZL-015', personName: '杨帆', personType: '内部', personDept: '橘子洲安保', openMethod: '电子锁', duration: 3, hasPhoto: false, photoUrl: '' },
  { openTime: '2026-11-14 10:55:28', cabinetId: 'PD-XGL-126', personName: '顺丰快递', personType: '外部', personDept: '配送包裹', openMethod: '抓拍', duration: 1, hasPhoto: true, photoUrl: makePhoto('PD-XGL-126') },
  { openTime: '2026-11-14 10:41:15', cabinetId: 'PD-LG-078', personName: '陈明', personType: '内部', personDept: '技术部调试', openMethod: '电子锁', duration: 28, hasPhoto: true, photoUrl: makePhoto('PD-LG-078') },
  { openTime: '2026-11-14 10:28:02', cabinetId: 'PD-MXH-051', personName: '王磊', personType: '外部', personDept: '市政施工队', openMethod: '机械锁', duration: 62, hasPhoto: true, photoUrl: makePhoto('PD-MXH-051') },
  { openTime: '2026-11-14 10:15:48', cabinetId: 'PD-XGL-055', personName: '孙丽', personType: '内部', personDept: '计量检定组', openMethod: '电子锁', duration: 18, hasPhoto: true, photoUrl: makePhoto('PD-XGL-055') },
  { openTime: '2026-11-14 10:02:33', cabinetId: 'PD-YZL-032', personName: '游客张某', personType: '外部', personDept: '误入', openMethod: '抓拍', duration: 10, hasPhoto: true, photoUrl: makePhoto('PD-YZL-032') },
  { openTime: '2026-11-14 09:48:21', cabinetId: 'PD-LG-091', personName: '周杰', personType: '内部', personDept: '麓谷运维班', openMethod: '电子锁', duration: 6, hasPhoto: true, photoUrl: makePhoto('PD-LG-091') },
  { openTime: '2026-11-14 09:35:05', cabinetId: 'PD-MXH-068', personName: '黄海', personType: '内部', personDept: '配电运行', openMethod: '电子锁', duration: 95, hasPhoto: true, photoUrl: makePhoto('PD-MXH-068') },
  { openTime: '2026-11-14 09:20:52', cabinetId: 'PD-XGL-142', personName: '京东物流', personType: '外部', personDept: '设备交付', openMethod: '抓拍', duration: 4, hasPhoto: true, photoUrl: makePhoto('PD-XGL-142') },
  { openTime: '2026-11-14 09:05:40', cabinetId: 'PD-YZL-048', personName: '吴强', personType: '内部', personDept: '照明巡检', openMethod: '电子锁', duration: 14, hasPhoto: false, photoUrl: '' },
  { openTime: '2026-11-14 08:52:18', cabinetId: 'PD-LG-105', personName: '无权限人员', personType: '外部', personDept: '可疑撬锁', openMethod: '机械锁', duration: 120, hasPhoto: true, photoUrl: makePhoto('PD-LG-105') },
])

const filteredLogs = computed(() => {
  let list = doorLogs.value
  if (cabinetFilter.value) list = list.filter(l => l.cabinetId.includes(cabinetFilter.value))
  if (methodFilter.value) list = list.filter(l => l.openMethod === methodFilter.value)
  if (personFilter.value) list = list.filter(l => l.personType === personFilter.value)
  return list
})
</script>

<style scoped lang="scss">
.zg-cabinet { padding: 20px; display: flex; flex-direction: column; gap: 16px; }

.zg-cabinet__headline { display: flex; align-items: center; gap: 14px; }
.zg-cabinet__sigil {
  width: 44px; height: 44px; border-radius: 10px;
  background: linear-gradient(135deg, #f97316, #ef4444);
  color: #fff; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 14px rgba(249, 115, 22, 0.35);
}
.zg-cabinet__title { font-size: 20px; font-weight: 600; color: #1e293b; margin: 0 0 4px; }
.zg-cabinet__sub { font-size: 13px; color: #94a3b8; margin: 0; }

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

.zg-filterband {
  background: #fff; border: 1px solid #f1f5f9; border-radius: 12px;
  padding: 14px 16px; display: flex; flex-wrap: wrap; gap: 16px; align-items: center;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}
.zg-filterband__group { display: flex; align-items: center; gap: 8px; }
.zg-filterband__lbl { font-size: 13px; color: #64748b; white-space: nowrap; }
.zg-filterband__actions { margin-left: auto; display: flex; gap: 8px; }

.zg-cabinet__panel {
  background: #fff; border: 1px solid #f1f5f9; border-radius: 12px;
  padding: 14px; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}
.zg-cabinet__pager { display: flex; justify-content: flex-end; padding-top: 12px; }

.zg-code { color: #6366f1; font-size: 12px; }
.zg-mono { font-family: monospace; color: #475569; }
.zg-danger { color: #ef4444; font-weight: 600; }
.zg-warn { color: #f59e0b; font-weight: 600; }
.zg-normal { color: #22c55e; font-weight: 600; }
.zg-muted { color: #94a3b8; }

.zg-person { display: flex; align-items: center; gap: 8px; }
.zg-person__name { font-weight: 600; color: #1e293b; }
.zg-person__dept { font-size: 11px; color: #94a3b8; margin-top: 2px; }

@media (max-width: 1280px) {
  .zg-metrics { grid-template-columns: repeat(2, 1fr); }
  .zg-filterband__actions { margin-left: 0; }
}
</style>
