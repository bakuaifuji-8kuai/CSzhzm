<!-- 智光云枢 · 公众上报域 · 12345 热线对接 -->
<template>
  <section class="zg-hotline">
    <!-- 头部 -->
    <header class="zg-hotline__head">
      <div class="zg-hotline__headline">
        <div class="zg-hotline__sigil">
          <el-icon :size="22"><PhoneFilled /></el-icon>
        </div>
        <div class="zg-hotline__copy">
          <h1 class="zg-hotline__title">12345 热线对接</h1>
          <p class="zg-hotline__sub">长沙 12345 政府服务热线工单自动接收 · 双向推送 · 回单管理</p>
        </div>
      </div>
      <div class="zg-hotline__source-badge">
        <el-tag type="danger" effect="dark" :icon="PhoneFilled">来源：12345</el-tag>
      </div>
    </header>

    <!-- 指标卡 -->
    <div class="zg-metrics">
      <div class="zg-metrics__cell zg-metrics__cell--info">
        <div class="zg-metrics__icon"><el-icon :size="20"><Message /></el-icon></div>
        <div class="zg-metrics__body">
          <div class="zg-metrics__num">2,847</div>
          <div class="zg-metrics__lbl">累计接收 12345 工单</div>
          <div class="zg-metrics__mini">本月 186 条 · 同比 ↓8%</div>
        </div>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <div class="zg-metrics__icon"><el-icon :size="20"><Clock /></el-icon></div>
        <div class="zg-metrics__body">
          <div class="zg-metrics__num">12</div>
          <div class="zg-metrics__lbl">处理中</div>
          <div class="zg-metrics__mini">超时预警 3 条</div>
        </div>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--danger">
        <div class="zg-metrics__icon"><el-icon :size="20"><Setting /></el-icon></div>
        <div class="zg-metrics__body">
          <div class="zg-metrics__num">7</div>
          <div class="zg-metrics__lbl">推送失败</div>
          <div class="zg-metrics__mini">需重新推送报文</div>
        </div>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--ok">
        <div class="zg-metrics__icon"><el-icon :size="20"><CircleCheck /></el-icon></div>
        <div class="zg-metrics__body">
          <div class="zg-metrics__num">96.2%</div>
          <div class="zg-metrics__lbl">按时办结率</div>
          <div class="zg-metrics__mini">较上月 ↑2.1%</div>
        </div>
      </div>
    </div>

    <!-- 过滤工具栏 + 批量操作 -->
    <div class="zg-filterband">
      <div class="zg-filterband__group">
        <span class="zg-filterband__lbl">处理状态：</span>
        <el-select v-model="statusFilter" placeholder="全部" clearable size="default" style="width: 130px">
          <el-option label="待处理" value="待处理" />
          <el-option label="处理中" value="处理中" />
          <el-option label="已办结" value="已办结" />
          <el-option label="已退回" value="已退回" />
        </el-select>
      </div>
      <div class="zg-filterband__group">
        <span class="zg-filterband__lbl">回单状态：</span>
        <el-select v-model="replyFilter" placeholder="全部" clearable size="default" style="width: 130px">
          <el-option label="待回单" value="待回单" />
          <el-option label="已回单" value="已回单" />
          <el-option label="回单失败" value="回单失败" />
        </el-select>
      </div>
      <div class="zg-filterband__actions">
        <el-button type="danger" size="default" :icon="Refresh" @click="retryPush" :disabled="failCount === 0">
          重新推送失败报文 ({{ failCount }})
        </el-button>
        <el-button :icon="Download">导出</el-button>
      </div>
    </div>

    <!-- 表格 -->
    <div class="zg-hotline__panel">
      <el-table :data="filteredList" stripe size="default" style="width: 100%" height="500">
        <el-table-column prop="sourceId" label="12345 原始编号" width="170" fixed>
          <template #default="{ row }">
            <code class="zg-code">{{ row.sourceId }}</code>
          </template>
        </el-table-column>
        <el-table-column prop="ticketType" label="工单类型" width="140" align="center">
          <template #default="{ row }">
            <el-tag :type="ticketTypeTag(row.ticketType)" size="small" effect="dark">{{ row.ticketType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="上报内容" min-width="240" show-overflow-tooltip />
        <el-table-column label="市民电话" width="130">
          <template #default="{ row }">
            <code class="zg-phone">{{ row.callerPhone }}</code>
          </template>
        </el-table-column>
        <el-table-column label="位置" min-width="200">
          <template #default="{ row }">{{ row.location }}</template>
        </el-table-column>
        <el-table-column prop="pushTime" label="推送时间" width="170">
          <template #default="{ row }">
            <span class="zg-mono">{{ row.pushTime }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="platformId" label="平台工单ID" width="170">
          <template #default="{ row }">
            <code v-if="row.platformId" class="zg-code">{{ row.platformId }}</code>
            <span v-else class="zg-muted">—</span>
          </template>
        </el-table-column>
        <el-table-column label="处理状态" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.handleStatus)" size="small" effect="light">{{ row.handleStatus }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="回单状态" width="110" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.replyStatus === '已回单' ? 'success' : row.replyStatus === '待回单' ? 'warning' : 'danger'"
              size="small"
              effect="light"
            >{{ row.replyStatus }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small">详情</el-button>
            <el-button link type="primary" size="small" v-if="row.replyStatus === '待回单'">回单</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="zg-hotline__pager">
        <el-pagination
          background
          layout="total, prev, pager, next"
          :total="filteredList.length"
          :page-size="15"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { PhoneFilled, Message, Clock, Setting, CircleCheck, Refresh, Download } from "@element-plus/icons-vue"
import { ElMessage } from 'element-plus'

const statusFilter = ref('')
const replyFilter = ref('')

// mock 数据：12345 工单编号 S202611xx 格式，不少于 15 条
const hotlineList = ref([
  { sourceId: 'S2026111400001', ticketType: '路灯故障', content: '岳麓区先导路麓谷大道交叉口东南角路灯多日不亮，晚间出行存在安全隐患，请求尽快维修。', callerPhone: '138****5623', location: '岳麓区 · 先导路 · 麓谷大道交叉口东南', pushTime: '2026-11-14 19:45:12', platformId: 'WO-20261114-0160', handleStatus: '已办结', replyStatus: '已回单' },
  { sourceId: 'S2026111400002', ticketType: '照明管理', content: '梅溪湖环湖路照明亮度不够，晚上遛弯看不清路，建议提高照度。', callerPhone: '139****8876', location: '岳麓区 · 梅溪湖 · 环湖路 K5+300', pushTime: '2026-11-14 18:22:08', platformId: 'WO-20261114-0162', handleStatus: '处理中', replyStatus: '待回单' },
  { sourceId: 'S2026111400003', ticketType: '设施破损', content: '天心区候家塘中心广场的路灯杆底部有明显撞痕，铁皮外翻，担心漏电伤人。', callerPhone: '137****2341', location: '天心区 · 候家塘街道 · 中心广场东侧', pushTime: '2026-11-14 17:10:23', platformId: 'WO-20261114-0165', handleStatus: '处理中', replyStatus: '待回单' },
  { sourceId: 'S2026111400004', ticketType: '安全隐患', content: '岳麓区桐梓坡路 256 号门前人行道有一盏路灯不亮，光线昏暗容易发生事故。', callerPhone: '136****7789', location: '岳麓区 · 桐梓坡路 · 256 号门前', pushTime: '2026-11-14 16:35:45', platformId: '', handleStatus: '待处理', replyStatus: '待回单' },
  { sourceId: 'S2026111400005', ticketType: '设施故障', content: '雨花区新开铺路 K5+800 处灯杆倾斜约 15 度，有倒塌危险，请尽快派人处置。', callerPhone: '135****5543', location: '雨花区 · 新开铺路 · K5+800 西侧', pushTime: '2026-11-14 15:28:11', platformId: 'WO-20261114-0158', handleStatus: '已办结', replyStatus: '已回单' },
  { sourceId: 'S2026111400006', ticketType: '路灯故障', content: '芙蓉区五一广场东南角草坪灯全部不亮，广场整体亮化效果不佳。', callerPhone: '133****9920', location: '芙蓉区 · 五一广场 · 东南角绿地', pushTime: '2026-11-14 14:15:33', platformId: 'WO-20261114-0155', handleStatus: '已办结', replyStatus: '已回单' },
  { sourceId: 'S2026111400007', ticketType: '设施破损', content: '长沙县星沙东四路某配电柜门未关，锁具损坏，存在安全隐患。', callerPhone: '132****4467', location: '长沙县 · 星沙街道 · 东四路 125 号', pushTime: '2026-11-14 13:02:58', platformId: 'WO-20261114-0152', handleStatus: '已办结', replyStatus: '已回单' },
  { sourceId: 'S2026111400008', ticketType: '照明管理', content: '先导路枫林三路转盘处有 4 盏路灯不亮，转盘区域较暗影响行车安全。', callerPhone: '131****8834', location: '岳麓区 · 先导路 · 枫林三路交叉口转盘', pushTime: '2026-11-14 11:48:22', platformId: 'WO-20261114-0148', handleStatus: '处理中', replyStatus: '待回单' },
  { sourceId: 'S2026111400009', ticketType: '安全隐患', content: '岳麓区王家湾立交桥下照明有闪烁现象，怀疑线路接触不良。', callerPhone: '130****1123', location: '岳麓区 · 王家湾立交桥 · 桥下北侧', pushTime: '2026-11-14 10:35:06', platformId: '', handleStatus: '待处理', replyStatus: '待回单' },
  { sourceId: 'S2026111400010', ticketType: '设施故障', content: '橘子洲头青年雕像西南侧步道有一段路灯全部熄灭，晚上散步漆黑一片。', callerPhone: '159****6645', location: '岳麓区 · 橘子洲景区 · 青年雕像西南', pushTime: '2026-11-14 09:22:41', platformId: 'WO-20261114-0144', handleStatus: '已办结', replyStatus: '已回单' },
  { sourceId: 'S2026111400011', ticketType: '路灯故障', content: '天心区杜甫江阁东侧江边步道有一段照明中断。', callerPhone: '158****3378', location: '天心区 · 杜甫江阁 · 东侧沿江步道', pushTime: '2026-11-14 08:15:33', platformId: '', handleStatus: '已退回', replyStatus: '回单失败' },
  { sourceId: 'S2026111300089', ticketType: '设施破损', content: '麓谷科技新城 C 栋停车场入口照明配电箱锁具损坏。', callerPhone: '157****2210', location: '岳麓区 · 麓谷科技园 · C 栋停车场入口', pushTime: '2026-11-13 20:02:18', platformId: 'WO-20261113-0141', handleStatus: '已办结', replyStatus: '已回单' },
  { sourceId: 'S2026111300090', ticketType: '安全隐患', content: '梅溪湖节庆岛入口有一盏路灯杆倾斜约 10 度，需要检查。', callerPhone: '156****5599', location: '岳麓区 · 梅溪湖 · 节庆岛主入口', pushTime: '2026-11-13 18:48:55', platformId: 'WO-20261113-0139', handleStatus: '已办结', replyStatus: '已回单' },
  { sourceId: 'S2026111300091', ticketType: '路灯故障', content: '望城区沿江路 K2+500 处江边路灯亮度整体偏暗。', callerPhone: '155****7722', location: '望城区 · 沿江路 · K2+500 北侧', pushTime: '2026-11-13 17:35:32', platformId: 'WO-20261113-0137', handleStatus: '已办结', replyStatus: '已回单' },
  { sourceId: 'S2026111300092', ticketType: '照明管理', content: '建议调整先导路枫林三路交叉口的路灯开启时间，入冬后天黑得早。', callerPhone: '153****4488', location: '岳麓区 · 先导路 · 枫林三路交叉口', pushTime: '2026-11-13 16:22:10', platformId: '', handleStatus: '已退回', replyStatus: '回单失败' },
  { sourceId: 'S2026111300093', ticketType: '设施破损', content: '天心区新开铺路沿线有 3 处灯杆喷漆严重剥落影响市容。', callerPhone: '152****6611', location: '天心区 · 新开铺路 · 中段', pushTime: '2026-11-13 15:08:45', platformId: 'WO-20261113-0135', handleStatus: '已办结', replyStatus: '已回单' },
  { sourceId: 'S2026111300094', ticketType: '路灯故障', content: '芙蓉区车站北路有一段 50 米范围内连续 3 盏路灯不亮。', callerPhone: '150****8833', location: '芙蓉区 · 车站北路 · K3+200', pushTime: '2026-11-13 13:55:12', platformId: 'WO-20261113-0133', handleStatus: '已办结', replyStatus: '已回单' },
  { sourceId: 'S2026111300095', ticketType: '安全隐患', content: '岳麓区西二环桥下有一根照明电线裸露，存在触电风险。', callerPhone: '139****2244', location: '岳麓区 · 西二环 · 梅溪湖出口桥下', pushTime: '2026-11-13 12:42:08', platformId: 'WO-20261113-0130', handleStatus: '处理中', replyStatus: '待回单' },
])

const filteredList = computed(() => {
  let list = hotlineList.value
  if (statusFilter.value) list = list.filter(i => i.handleStatus === statusFilter.value)
  if (replyFilter.value) list = list.filter(i => i.replyStatus === replyFilter.value)
  return list
})

const failCount = computed(() => hotlineList.value.filter(i => i.replyStatus === '回单失败').length)

const ticketTypeTag = (t) => {
  const m = { '路灯故障': 'danger', '设施破损': 'warning', '安全隐患': 'danger', '照明管理': 'info', '设施故障': 'warning' }
  return m[t] || ''
}
const statusTag = (s) => {
  const m = { '已办结': 'success', '处理中': 'warning', '待处理': 'info', '已退回': 'danger' }
  return m[s] || ''
}

const retryPush = () => {
  ElMessage.success('已触发 7 条回单失败报文的重新推送')
}
</script>

<style scoped lang="scss">
.zg-hotline { padding: 20px; display: flex; flex-direction: column; gap: 16px; }

.zg-hotline__head { display: flex; justify-content: space-between; align-items: flex-start; }
.zg-hotline__headline { display: flex; align-items: center; gap: 14px; }
.zg-hotline__sigil {
  width: 44px; height: 44px; border-radius: 10px;
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  color: #fff; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 14px rgba(220, 38, 38, 0.35);
}
.zg-hotline__title { font-size: 20px; font-weight: 600; color: #1e293b; margin: 0 0 4px; }
.zg-hotline__sub { font-size: 13px; color: #94a3b8; margin: 0; }

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
.zg-metrics__cell--danger .zg-metrics__icon { background: #fee2e2; color: #ef4444; }
.zg-metrics__cell--danger .zg-metrics__num { color: #ef4444; }
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

.zg-hotline__panel {
  background: #fff; border: 1px solid #f1f5f9; border-radius: 12px;
  padding: 14px; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}
.zg-hotline__pager { display: flex; justify-content: flex-end; padding-top: 12px; }

.zg-code { color: #6366f1; font-size: 12px; font-family: monospace; }
.zg-phone { color: #475569; font-size: 12px; font-family: monospace; letter-spacing: 0.5px; }
.zg-mono { font-family: monospace; color: #475569; }
.zg-muted { color: #94a3b8; }

@media (max-width: 1280px) {
  .zg-metrics { grid-template-columns: repeat(2, 1fr); }
  .zg-filterband__actions { margin-left: 0; }
}
</style>
