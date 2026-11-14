<!-- 智光云枢 · 公众上报域 · 扫码上报后台 -->
<template>
  <section class="zg-publist">
    <!-- 头部 -->
    <header class="zg-publist__head">
      <div class="zg-publist__headline">
        <div class="zg-publist__sigil">
          <el-icon :size="22"><ReadingLamp /></el-icon>
        </div>
        <div class="zg-publist__copy">
          <h1 class="zg-publist__title">扫码上报后台</h1>
          <p class="zg-publist__sub">市民扫码 / 微信小程序上报 · 自动关联工单系统</p>
        </div>
      </div>
    </header>

    <!-- 指标卡 -->
    <div class="zg-metrics">
      <div class="zg-metrics__cell zg-metrics__cell--info">
        <div class="zg-metrics__icon"><el-icon :size="20"><Postcard /></el-icon></div>
        <div class="zg-metrics__body">
          <div class="zg-metrics__num">{{ totalCount }}</div>
          <div class="zg-metrics__lbl">累计上报总数</div>
          <div class="zg-metrics__mini">本月新增 {{ monthlyCount }}</div>
        </div>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <div class="zg-metrics__icon"><el-icon :size="20"><Clock /></el-icon></div>
        <div class="zg-metrics__body">
          <div class="zg-metrics__num">{{ pendingCount }}</div>
          <div class="zg-metrics__lbl">待处理</div>
          <div class="zg-metrics__mini">等待审核转工单</div>
        </div>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--ok">
        <div class="zg-metrics__icon"><el-icon :size="20"><CircleCheck /></el-icon></div>
        <div class="zg-metrics__body">
          <div class="zg-metrics__num">{{ transferredCount }}</div>
          <div class="zg-metrics__lbl">已转工单</div>
          <div class="zg-metrics__mini">自动转单 {{ autoCount }}</div>
        </div>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--danger">
        <div class="zg-metrics__icon"><el-icon :size="20"><CircleClose /></el-icon></div>
        <div class="zg-metrics__body">
          <div class="zg-metrics__num">{{ invalidCount }}</div>
          <div class="zg-metrics__lbl">无效上报</div>
          <div class="zg-metrics__mini">疑似误报 / 恶意</div>
        </div>
      </div>
    </div>

    <!-- 过滤工具栏 -->
    <div class="zg-filterband">
      <div class="zg-filterband__group">
        <span class="zg-filterband__lbl">状态：</span>
        <el-select v-model="statusFilter" placeholder="全部" clearable size="default" style="width: 130px">
          <el-option label="待处理" value="待处理" />
          <el-option label="已转工单" value="已转工单" />
          <el-option label="无效" value="无效" />
        </el-select>
      </div>
      <div class="zg-filterband__group">
        <span class="zg-filterband__lbl">故障类型：</span>
        <el-select v-model="faultFilter" placeholder="全部" clearable size="default" style="width: 140px">
          <el-option label="路灯不亮" value="路灯不亮" />
          <el-option label="破损" value="破损" />
          <el-option label="下垂" value="下垂" />
          <el-option label="其他" value="其他" />
        </el-select>
      </div>
      <div class="zg-filterband__group">
        <span class="zg-filterband__lbl">上报时间：</span>
        <el-date-picker v-model="dateRange" type="daterange" range-separator="至"
          start-placeholder="开始" end-placeholder="结束" size="default" style="width: 240px" />
      </div>
      <div class="zg-filterband__actions">
        <el-button type="primary" :icon="Check" @click="batchTransfer" :disabled="selectedRows.length === 0">
          批量转工单 ({{ selectedRows.length }})
        </el-button>
        <el-button :icon="Download">导出</el-button>
      </div>
    </div>

    <!-- 表格 -->
    <div class="zg-publist__panel">
      <el-table
        :data="filteredList"
        stripe
        size="default"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        height="520"
      >
        <el-table-column type="selection" width="48" fixed />
        <el-table-column prop="reportId" label="上报编号" width="150" fixed>
          <template #default="{ row }">
            <code class="zg-code">{{ row.reportId }}</code>
          </template>
        </el-table-column>
        <el-table-column label="灯杆位置" min-width="240">
          <template #default="{ row }">
            <div class="zg-location">
              <div class="zg-location__name">{{ row.poleLocation }}</div>
              <div class="zg-location__coord">
                <el-icon><Location /></el-icon>
                {{ row.lng }}, {{ row.lat }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="故障类型" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="faultTagType(row.faultType)" size="small" effect="dark">{{ row.faultType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column label="照片" width="130" align="center">
          <template #default="{ row }">
            <el-image
              v-if="row.photoUrl"
              :src="row.photoUrl"
              :preview-src-list="[row.photoUrl]"
              fit="cover"
              style="width: 90px; height: 50px; border-radius: 4px"
              preview-teleported
            />
            <span v-else class="zg-muted">—</span>
          </template>
        </el-table-column>
        <el-table-column prop="reportTime" label="上报时间" width="170">
          <template #default="{ row }">
            <span class="zg-mono">{{ row.reportTime }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="ticketId" label="工单ID" width="150">
          <template #default="{ row }">
            <code v-if="row.ticketId" class="zg-code">{{ row.ticketId }}</code>
            <span v-else class="zg-muted">—</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="110" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.status === '已转工单' ? 'success' : row.status === '待处理' ? 'warning' : 'info'"
              size="small"
              effect="light"
            >{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small">详情</el-button>
            <el-button link type="primary" size="small" v-if="row.status === '待处理'">转工单</el-button>
            <el-button link type="danger" size="small" v-if="row.status === '待处理'">忽略</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="zg-publist__pager">
        <el-pagination
          background
          layout="total, prev, pager, next, sizes"
          :total="filteredList.length"
          :page-size="15"
          :page-sizes="[15, 30, 50]"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ReadingLamp, Postcard, Clock, CircleCheck, CircleClose, Check, Download, Location } from "@element-plus/icons-vue"
import { ElMessage } from 'element-plus'

const statusFilter = ref('')
const faultFilter = ref('')
const dateRange = ref([])
const selectedRows = ref([])

const makePhoto = (id) => `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=street%20light%20fault%20report%20scene%20${id}%20city%20night&image_size=landscape_4_3`

// mock 数据：不少于 15 条
const reportList = ref([
  { reportId: 'RP-20261114-0001', poleLocation: '先导路 · 麓谷大道交叉路口东北角', lng: '112.9188', lat: '28.2286', faultType: '路灯不亮', description: '路口 4 盏路灯连续三天不亮，晚上路过很危险', photoUrl: makePhoto('RP0001'), reportTime: '2026-11-14 19:32:15', ticketId: 'WO-20261114-0156', status: '已转工单' },
  { reportId: 'RP-20261114-0002', poleLocation: '梅溪湖 · 环湖路金茂湾东门', lng: '112.9356', lat: '28.2398', faultType: '下垂', description: '有一盏路灯灯臂下垂快碰到电动车了，很危险', photoUrl: makePhoto('RP0002'), reportTime: '2026-11-14 18:45:22', ticketId: 'WO-20261114-0157', status: '已转工单' },
  { reportId: 'RP-20261114-0003', poleLocation: '岳麓区 · 新民路公交站南', lng: '112.9668', lat: '28.1985', faultType: '破损', description: '灯杆底部有明显撞痕，铁皮都翘起来了', photoUrl: makePhoto('RP0003'), reportTime: '2026-11-14 17:28:40', ticketId: '', status: '待处理' },
  { reportId: 'RP-20261114-0004', poleLocation: '橘子洲头 · 青年雕像西南侧', lng: '112.9752', lat: '28.1833', faultType: '路灯不亮', description: '江边步道有一段灯全黑了，晚上散步漆黑一片', photoUrl: makePhoto('RP0004'), reportTime: '2026-11-14 16:15:08', ticketId: '', status: '待处理' },
  { reportId: 'RP-20261114-0005', poleLocation: '麓谷产业园 · B 栋北侧停车场', lng: '112.8975', lat: '28.2456', faultType: '其他', description: '路灯杆上贴了好多小广告，影响美观', photoUrl: makePhoto('RP0005'), reportTime: '2026-11-14 15:42:33', ticketId: '', status: '无效' },
  { reportId: 'RP-20261114-0006', poleLocation: '先导路 · 林语桥南 K8+200', lng: '112.9102', lat: '28.2315', faultType: '路灯不亮', description: '桥南侧有 2 盏路灯不亮', photoUrl: '', reportTime: '2026-11-14 14:28:50', ticketId: 'WO-20261114-0153', status: '已转工单' },
  { reportId: 'RP-20261114-0007', poleLocation: '天心区 · 候家塘中心广场', lng: '112.9785', lat: '28.1812', faultType: '破损', description: '灯罩破损漏雨，担心短路', photoUrl: makePhoto('RP0007'), reportTime: '2026-11-14 13:55:18', ticketId: '', status: '待处理' },
  { reportId: 'RP-20261114-0008', poleLocation: '雨花区 · 新开铺路 K5+800', lng: '112.9912', lat: '28.1685', faultType: '下垂', description: '灯杆向马路中间倾斜了大约 15 度', photoUrl: makePhoto('RP0008'), reportTime: '2026-11-14 12:42:02', ticketId: 'WO-20261114-0149', status: '已转工单' },
  { reportId: 'RP-20261114-0009', poleLocation: '芙蓉区 · 五一广场东南角', lng: '112.9718', lat: '28.1988', faultType: '路灯不亮', description: '广场东南角的草坪灯不亮了好几天', photoUrl: makePhoto('RP0009'), reportTime: '2026-11-14 11:28:41', ticketId: '', status: '无效' },
  { reportId: 'RP-20261114-0010', poleLocation: '长沙县 · 星沙东四路', lng: '113.0688', lat: '28.2425', faultType: '破损', description: '配电箱门没关好，锁也坏了', photoUrl: makePhoto('RP0010'), reportTime: '2026-11-14 10:15:25', ticketId: 'WO-20261114-0145', status: '已转工单' },
  { reportId: 'RP-20261114-0011', poleLocation: '岳麓区 · 桐梓坡路 256 号门前', lng: '112.9368', lat: '28.2245', faultType: '路灯不亮', description: '人行道上有 3 盏灯不亮，晚上走暗', photoUrl: makePhoto('RP0011'), reportTime: '2026-11-14 09:48:10', ticketId: '', status: '待处理' },
  { reportId: 'RP-20261114-0012', poleLocation: '望城区 · 沿江路 K2+500', lng: '112.8185', lat: '28.3765', faultType: '其他', description: '江边路灯亮度不够，能不能调亮些', photoUrl: '', reportTime: '2026-11-14 08:35:55', ticketId: '', status: '待处理' },
  { reportId: 'RP-20261113-0089', poleLocation: '先导路 · 枫林三路交叉口', lng: '112.9265', lat: '28.2188', faultType: '路灯不亮', description: '路口转盘灯全部不亮', photoUrl: makePhoto('RP89'), reportTime: '2026-11-13 20:15:33', ticketId: 'WO-20261113-0138', status: '已转工单' },
  { reportId: 'RP-20261113-0090', poleLocation: '梅溪湖 · 节庆岛入口', lng: '112.9488', lat: '28.2252', faultType: '下垂', description: '节庆岛入口有一盏路灯杆倾斜', photoUrl: makePhoto('RP90'), reportTime: '2026-11-13 19:02:48', ticketId: 'WO-20261113-0140', status: '已转工单' },
  { reportId: 'RP-20261113-0091', poleLocation: '麓谷科技新城 · C 栋停车场', lng: '112.9012', lat: '28.2478', faultType: '破损', description: '停车场入口照明箱锁具损坏', photoUrl: makePhoto('RP91'), reportTime: '2026-11-13 17:48:22', ticketId: '', status: '无效' },
  { reportId: 'RP-20261113-0092', poleLocation: '天心区 · 杜甫江阁沿江', lng: '112.9756', lat: '28.1935', faultType: '路灯不亮', description: '杜甫江阁东侧步道有一段灯不亮', photoUrl: makePhoto('RP92'), reportTime: '2026-11-13 16:35:18', ticketId: 'WO-20261113-0142', status: '已转工单' },
  { reportId: 'RP-20261113-0093', poleLocation: '岳麓区 · 王家湾立交桥下', lng: '112.9425', lat: '28.2098', faultType: '其他', description: '桥下照明有闪烁情况，怀疑接触不良', photoUrl: makePhoto('RP93'), reportTime: '2026-11-13 15:22:05', ticketId: '', status: '待处理' },
])

const filteredList = computed(() => {
  let list = reportList.value
  if (statusFilter.value) list = list.filter(i => i.status === statusFilter.value)
  if (faultFilter.value) list = list.filter(i => i.faultType === faultFilter.value)
  return list
})

const totalCount = computed(() => 12847)
const monthlyCount = computed(() => 328)
const pendingCount = computed(() => reportList.value.filter(i => i.status === '待处理').length)
const transferredCount = computed(() => 12156)
const autoCount = computed(() => 8942)
const invalidCount = computed(() => 691)

const faultTagType = (t) => {
  const m = { '路灯不亮': 'danger', '破损': 'warning', '下垂': 'danger', '其他': 'info' }
  return m[t] || ''
}

const handleSelectionChange = (rows) => { selectedRows.value = rows }
const batchTransfer = () => {
  ElMessage.success(`已将 ${selectedRows.value.length} 条待处理上报批量转工单`)
}
</script>

<style scoped lang="scss">
.zg-publist { padding: 20px; display: flex; flex-direction: column; gap: 16px; }

.zg-publist__headline { display: flex; align-items: center; gap: 14px; }
.zg-publist__sigil {
  width: 44px; height: 44px; border-radius: 10px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
}
.zg-publist__title { font-size: 20px; font-weight: 600; color: #1e293b; margin: 0 0 4px; }
.zg-publist__sub { font-size: 13px; color: #94a3b8; margin: 0; }

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
.zg-metrics__cell--warn .zg-metrics__icon { background: #fef3c7; color: #f59e0b; }
.zg-metrics__cell--warn .zg-metrics__num { color: #f59e0b; }
.zg-metrics__cell--ok .zg-metrics__icon { background: #dcfce7; color: #22c55e; }
.zg-metrics__cell--ok .zg-metrics__num { color: #22c55e; }
.zg-metrics__cell--danger .zg-metrics__icon { background: #fee2e2; color: #ef4444; }
.zg-metrics__cell--danger .zg-metrics__num { color: #ef4444; }

.zg-filterband {
  background: #fff; border: 1px solid #f1f5f9; border-radius: 12px;
  padding: 14px 16px; display: flex; flex-wrap: wrap; gap: 16px; align-items: center;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}
.zg-filterband__group { display: flex; align-items: center; gap: 8px; }
.zg-filterband__lbl { font-size: 13px; color: #64748b; white-space: nowrap; }
.zg-filterband__actions { margin-left: auto; display: flex; gap: 8px; }

.zg-publist__panel {
  background: #fff; border: 1px solid #f1f5f9; border-radius: 12px;
  padding: 14px; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}
.zg-publist__pager { display: flex; justify-content: flex-end; padding-top: 12px; }

.zg-location__name { font-size: 13px; color: #1e293b; font-weight: 500; }
.zg-location__coord {
  display: flex; align-items: center; gap: 4px;
  font-size: 11px; color: #6366f1; font-family: monospace; margin-top: 2px;
}

.zg-code { color: #6366f1; font-size: 12px; font-family: monospace; }
.zg-mono { font-family: monospace; color: #475569; }
.zg-muted { color: #94a3b8; }

@media (max-width: 1280px) {
  .zg-metrics { grid-template-columns: repeat(2, 1fr); }
  .zg-filterband__actions { margin-left: 0; }
}
</style>
