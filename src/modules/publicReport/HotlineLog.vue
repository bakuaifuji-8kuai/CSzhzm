<!-- 智光云枢 · 公众上报域 · 12345 对接日志 -->
<template>
  <section class="zg-hlglog">
    <!-- 头部 -->
    <header class="zg-hlglog__head">
      <div class="zg-hlglog__headline">
        <div class="zg-hlglog__sigil">
          <el-icon :size="22"><Document /></el-icon>
        </div>
        <div class="zg-hlglog__copy">
          <h1 class="zg-hlglog__title">12345 对接日志</h1>
          <p class="zg-hlglog__sub">接口调用全链路追踪 · 报文可追溯 · 耗时监控</p>
        </div>
      </div>
    </header>

    <!-- 指标卡 -->
    <div class="zg-metrics">
      <div class="zg-metrics__cell zg-metrics__cell--info">
        <div class="zg-metrics__icon"><el-icon :size="20"><Connection /></el-icon></div>
        <div class="zg-metrics__body">
          <div class="zg-metrics__num">{{ totalCalls }}</div>
          <div class="zg-metrics__lbl">今日接口调用总次数</div>
          <div class="zg-metrics__mini">接收 {{ inCount }} · 推送 {{ outCount }}</div>
        </div>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--ok">
        <div class="zg-metrics__icon"><el-icon :size="20"><CircleCheck /></el-icon></div>
        <div class="zg-metrics__body">
          <div class="zg-metrics__num">{{ successRate }}%</div>
          <div class="zg-metrics__lbl">成功率</div>
          <div class="zg-metrics__mini">较昨日 ↑0.3%</div>
        </div>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <div class="zg-metrics__icon"><el-icon :size="20"><Timer /></el-icon></div>
        <div class="zg-metrics__body">
          <div class="zg-metrics__num">{{ avgLatency }} ms</div>
          <div class="zg-metrics__lbl">平均耗时</div>
          <div class="zg-metrics__mini">P99 耗时 {{ p99Latency }} ms</div>
        </div>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--danger">
        <div class="zg-metrics__icon"><el-icon :size="20"><Warning /></el-icon></div>
        <div class="zg-metrics__body">
          <div class="zg-metrics__num">{{ failCount }}</div>
          <div class="zg-metrics__lbl">失败请求</div>
          <div class="zg-metrics__mini">需关注</div>
        </div>
      </div>
    </div>

    <!-- 过滤工具栏 -->
    <div class="zg-filterband">
      <div class="zg-filterband__group">
        <span class="zg-filterband__lbl">方向：</span>
        <el-select v-model="dirFilter" placeholder="全部" clearable size="default" style="width: 110px">
          <el-option label="接收" value="接收" />
          <el-option label="推送" value="推送" />
        </el-select>
      </div>
      <div class="zg-filterband__group">
        <span class="zg-filterband__lbl">状态：</span>
        <el-select v-model="statusFilter" placeholder="全部" clearable size="default" style="width: 110px">
          <el-option label="成功" value="成功" />
          <el-option label="失败" value="失败" />
        </el-select>
      </div>
      <div class="zg-filterband__group">
        <span class="zg-filterband__lbl">时间范围：</span>
        <el-date-picker v-model="timeRange" type="datetimerange"
          range-separator="至" start-placeholder="开始" end-placeholder="结束"
          format="YYYY-MM-DD HH:mm" value-format="YYYY-MM-DD HH:mm:ss"
          size="default" style="width: 360px" />
      </div>
      <div class="zg-filterband__actions">
        <el-button type="primary" :icon="Search">查询</el-button>
        <el-button :icon="Download">导出</el-button>
      </div>
    </div>

    <!-- 接口调用时间线 -->
    <div class="zg-hlglog__panel">
      <div class="zg-hlglog__panel-head">
        <strong>🔌 接口调用日志（按时间倒序）</strong>
        <el-tag type="info" effect="plain" size="small">可展开查看原始 JSON 报文</el-tag>
      </div>
      <el-collapse v-model="expandedLogs">
        <el-collapse-item
          v-for="(log, i) in filteredLogs"
          :key="log.id"
          :name="log.id"
          class="zg-log-item"
        >
          <template #title>
            <div class="zg-log-summary">
              <div class="zg-log-left">
                <span class="zg-log-time">{{ log.time }}</span>
                <el-tag
                  :type="log.direction === '接收' ? 'primary' : 'success'"
                  effect="dark"
                  size="small"
                  class="zg-log-dir"
                >{{ log.direction }}</el-tag>
                <el-tag
                  :type="log.status === '成功' ? 'success' : 'danger'"
                  effect="light"
                  size="small"
                >{{ log.status }}</el-tag>
                <span class="zg-log-desc">{{ log.summary }}</span>
              </div>
              <div class="zg-log-right">
                <span class="zg-log-latency" :class="log.latency > 1000 ? 'zg-danger' : log.latency > 500 ? 'zg-warn' : ''">
                  ⏱ {{ log.latency }} ms
                </span>
                <el-icon class="zg-log-expand"><ArrowDown /></el-icon>
              </div>
            </div>
          </template>
          <!-- 展开的原始 JSON -->
          <div class="zg-log-json">
            <div class="zg-log-json-head">
              <el-icon><Document /></el-icon>
              <span>{{ log.direction === '接收' ? '请求报文' : '推送报文' }} · {{ log.endpoint }}</span>
              <code class="zg-code">#{{ log.traceId }}</code>
            </div>
            <pre class="zg-json-block">{{ log.rawJson }}</pre>
            <div class="zg-log-json-meta">
              <span>请求大小：{{ log.reqSize }}</span>
              <span>响应大小：{{ log.respSize }}</span>
              <span>重试次数：{{ log.retries }}</span>
              <span v-if="log.errorMsg" class="zg-danger">错误：{{ log.errorMsg }}</span>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
      <div class="zg-hlglog__empty" v-if="filteredLogs.length === 0">暂无接口调用日志</div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Document, Connection, CircleCheck, Timer, Warning, ArrowDown, Search, Download } from "@element-plus/icons-vue"

const dirFilter = ref('')
const statusFilter = ref('')
const timeRange = ref([])
const expandedLogs = ref([])

// mock 数据：不少于 15 条
const logList = ref([
  {
    id: 'log-001', time: '2026-11-14 12:35:18', direction: '推送', status: '成功', summary: '工单 S2026111400011 回单推送',
    latency: 128, endpoint: 'POST /api/12345/callback/reply', traceId: 'trc-1731573318-0001',
    rawJson: `{
  "sourceId": "S2026111400011",
  "status": "REPLIED",
  "replyContent": "该处灯杆系人为喷漆损坏，已组织清洁处理并重新喷涂，已整改完毕。",
  "replyTime": "2026-11-14 12:30:00",
  "handler": "岳麓区照明运维班",
  "images": ["https://oss.xxx.com/reply/001.jpg"]
}`,
    reqSize: '2.3 KB', respSize: '312 B', retries: 0, errorMsg: ''
  },
  {
    id: 'log-002', time: '2026-11-14 12:28:42', direction: '接收', status: '成功', summary: '新工单 S2026111400012 接收',
    latency: 96, endpoint: 'POST /api/12345/webhook/ticket', traceId: 'trc-1731573242-0002',
    rawJson: `{
  "sourceId": "S2026111400012",
  "ticketType": "路灯故障",
  "content": "岳麓区梅溪湖节庆岛东侧有一盏路灯不亮。",
  "callerPhone": "1385623****",
  "location": "岳麓区梅溪湖节庆岛",
  "receiveTime": "2026-11-14 12:28:40",
  "severity": "一般"
}`,
    reqSize: '1.8 KB', respSize: '245 B', retries: 0, errorMsg: ''
  },
  {
    id: 'log-003', time: '2026-11-14 12:15:05', direction: '推送', status: '失败', summary: '工单 S2026111400003 回单推送超时',
    latency: 3024, endpoint: 'POST /api/12345/callback/reply', traceId: 'trc-1731573105-0003',
    rawJson: `{
  "sourceId": "S2026111400003",
  "status": "REPLIED",
  "replyContent": "该处灯杆破损已临时加固，正在安排整体更换。",
  "replyTime": "2026-11-14 12:00:00",
  "handler": "天心区照明工程组"
}`,
    reqSize: '1.9 KB', respSize: '超时无响应', retries: 2, errorMsg: 'ReadTimeout: 3000ms'
  },
  {
    id: 'log-004', time: '2026-11-14 11:52:30', direction: '接收', status: '成功', summary: '心跳 / 订阅确认',
    latency: 45, endpoint: 'GET /api/12345/health', traceId: 'trc-1731572950-0004',
    rawJson: `{
  "clientId": "zg-lighting-ops",
  "timestamp": 1731572950300,
  "version": "v2.3.1"
}`,
    reqSize: '128 B', respSize: '196 B', retries: 0, errorMsg: ''
  },
  {
    id: 'log-005', time: '2026-11-14 11:38:12', direction: '推送', status: '成功', summary: '工单 S2026111400001 回单推送',
    latency: 156, endpoint: 'POST /api/12345/callback/reply', traceId: 'trc-1731572892-0005',
    rawJson: `{
  "sourceId": "S2026111400001",
  "status": "REPLIED",
  "replyContent": "已安排紧急抢修，4 盏不亮路灯于 2026-11-14 20:30 修复完毕，现场测试正常。",
  "replyTime": "2026-11-14 21:00:00",
  "handler": "先导路运维一班"
}`,
    reqSize: '2.1 KB', respSize: '334 B', retries: 0, errorMsg: ''
  },
  {
    id: 'log-006', time: '2026-11-14 11:25:40', direction: '接收', status: '成功', summary: '批量工单同步（8 条）',
    latency: 312, endpoint: 'POST /api/12345/sync/batch', traceId: 'trc-1731572740-0006',
    rawJson: `{
  "batchId": "B20261114008",
  "items": [
    {"sourceId": "S2026111400004", "ticketType": "安全隐患", ...},
    {"sourceId": "S2026111400005", "ticketType": "设施故障", ...},
    ...共 8 条
  ]
}`,
    reqSize: '12.5 KB', respSize: '1.2 KB', retries: 0, errorMsg: ''
  },
  {
    id: 'log-007', time: '2026-11-14 11:10:22', direction: '推送', status: '失败', summary: '工单 S2026111400006 推送失败',
    latency: 2140, endpoint: 'POST /api/12345/callback/reply', traceId: 'trc-1731572622-0007',
    rawJson: `{"sourceId": "S2026111400006", "status": "REPLIED", ...}`,
    reqSize: '1.7 KB', respSize: 'HTTP 502 Bad Gateway', retries: 1, errorMsg: 'HTTP 502 - Bad Gateway'
  },
  {
    id: 'log-008', time: '2026-11-14 10:55:08', direction: '接收', status: '成功', summary: '工单 S2026111400007 接收',
    latency: 89, endpoint: 'POST /api/12345/webhook/ticket', traceId: 'trc-1731572508-0008',
    rawJson: `{"sourceId": "S2026111400007", "ticketType": "设施破损", ...}`,
    reqSize: '1.6 KB', respSize: '238 B', retries: 0, errorMsg: ''
  },
  {
    id: 'log-009', time: '2026-11-14 10:42:55', direction: '推送', status: '成功', summary: '工单 S2026111300094 回单推送',
    latency: 178, endpoint: 'POST /api/12345/callback/reply', traceId: 'trc-1731572415-0009',
    rawJson: `{"sourceId": "S2026111300094", "status": "REPLIED", ...}`,
    reqSize: '1.9 KB', respSize: '312 B', retries: 0, errorMsg: ''
  },
  {
    id: 'log-010', time: '2026-11-14 10:28:30', direction: '接收', status: '失败', summary: '接收接口异常 · 签名校验失败',
    latency: 62, endpoint: 'POST /api/12345/webhook/ticket', traceId: 'trc-1731572310-0010',
    rawJson: `{"sourceId": "S2026111400008", "ticketType": "路灯故障", "_签名校验失败_"}`,
    reqSize: '1.4 KB', respSize: '{"code": 403, "msg": "Signature invalid"}', retries: 0, errorMsg: 'Signature invalid (403)'
  },
  {
    id: 'log-011', time: '2026-11-14 10:15:12', direction: '推送', status: '成功', summary: '工单 S2026111300093 回单推送',
    latency: 142, endpoint: 'POST /api/12345/callback/reply', traceId: 'trc-1731572232-0011',
    rawJson: `{"sourceId": "S2026111300093", "status": "REPLIED", ...}`,
    reqSize: '2.0 KB', respSize: '326 B', retries: 0, errorMsg: ''
  },
  {
    id: 'log-012', time: '2026-11-14 09:58:45', direction: '接收', status: '成功', summary: '工单 S2026111400009 接收',
    latency: 98, endpoint: 'POST /api/12345/webhook/ticket', traceId: 'trc-1731572125-0012',
    rawJson: `{"sourceId": "S2026111400009", "ticketType": "安全隐患", ...}`,
    reqSize: '1.7 KB', respSize: '242 B', retries: 0, errorMsg: ''
  },
  {
    id: 'log-013', time: '2026-11-14 09:42:30', direction: '推送', status: '成功', summary: '批量回单推送（5 条）',
    latency: 456, endpoint: 'POST /api/12345/callback/batch', traceId: 'trc-1731572030-0013',
    rawJson: `{"batchId": "B20261114R05", "items": [{"sourceId": "S2026111300089", ...}, ...共 5 条]}`,
    reqSize: '8.6 KB', respSize: '1.8 KB', retries: 0, errorMsg: ''
  },
  {
    id: 'log-014', time: '2026-11-14 09:25:18', direction: '接收', status: '成功', summary: '工单 S2026111400010 接收',
    latency: 84, endpoint: 'POST /api/12345/webhook/ticket', traceId: 'trc-1731571918-0014',
    rawJson: `{"sourceId": "S2026111400010", "ticketType": "设施故障", ...}`,
    reqSize: '1.6 KB', respSize: '238 B', retries: 0, errorMsg: ''
  },
  {
    id: 'log-015', time: '2026-11-14 09:10:05', direction: '推送', status: '失败', summary: '工单 S2026111300092 推送报文格式错误',
    latency: 892, endpoint: 'POST /api/12345/callback/reply', traceId: 'trc-1731571805-0015',
    rawJson: `{"sourceId": "S2026111300092", "status": "REPLIED", "replyContent": "..."}`,
    reqSize: '2.1 KB', respSize: '{"code": 422, "msg": "Missing required field: images"}', retries: 1, errorMsg: 'HTTP 422 - Missing required field'
  },
])

const filteredLogs = computed(() => {
  let list = logList.value
  if (dirFilter.value) list = list.filter(i => i.direction === dirFilter.value)
  if (statusFilter.value) list = list.filter(i => i.status === statusFilter.value)
  return list
})

const totalCalls = computed(() => logList.value.length + 286)
const inCount = computed(() => logList.value.filter(i => i.direction === '接收').length + 152)
const outCount = computed(() => logList.value.filter(i => i.direction === '推送').length + 134)
const successRate = computed(() => {
  const s = logList.value.filter(i => i.status === '成功').length
  return Math.round(s / logList.value.length * 1000) / 10
})
const avgLatency = computed(() => {
  const total = logList.value.reduce((sum, i) => sum + i.latency, 0)
  return Math.round(total / logList.value.length)
})
const p99Latency = computed(() => 1856)
const failCount = computed(() => logList.value.filter(i => i.status === '失败').length)
</script>

<style scoped lang="scss">
.zg-hlglog { padding: 20px; display: flex; flex-direction: column; gap: 16px; }

.zg-hlglog__headline { display: flex; align-items: center; gap: 14px; }
.zg-hlglog__sigil {
  width: 44px; height: 44px; border-radius: 10px;
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  color: #fff; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 14px rgba(139, 92, 246, 0.35);
}
.zg-hlglog__title { font-size: 20px; font-weight: 600; color: #1e293b; margin: 0 0 4px; }
.zg-hlglog__sub { font-size: 13px; color: #94a3b8; margin: 0; }

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
.zg-metrics__cell--ok .zg-metrics__icon { background: #dcfce7; color: #22c55e; }
.zg-metrics__cell--ok .zg-metrics__num { color: #22c55e; }
.zg-metrics__cell--warn .zg-metrics__icon { background: #fef3c7; color: #f59e0b; }
.zg-metrics__cell--warn .zg-metrics__num { color: #f59e0b; }
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

.zg-hlglog__panel {
  background: #fff; border: 1px solid #f1f5f9; border-radius: 12px;
  padding: 14px; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}
.zg-hlglog__panel-head {
  display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
  strong { font-size: 14px; color: #1e293b; font-weight: 600; }
}

.zg-log-summary {
  display: flex; justify-content: space-between; align-items: center; gap: 12px; width: 100%;
}
.zg-log-left { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
.zg-log-time { font-family: monospace; font-size: 12px; color: #475569; min-width: 150px; }
.zg-log-dir { font-size: 11px; min-width: 44px; text-align: center; }
.zg-log-desc { font-size: 13px; color: #1e293b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.zg-log-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.zg-log-latency { font-family: monospace; font-size: 12px; color: #64748b; }
.zg-log-expand { color: #94a3b8; transition: transform 0.2s; }

.el-collapse-item__content { padding: 0 !important; }
.el-collapse-item__wrap { border-bottom-color: #f1f5f9 !important; }
.zg-log-item :deep(.el-collapse-item__header) { padding: 0 !important; border-bottom: none !important; height: auto !important; line-height: 1 !important; background: transparent !important; }
.zg-log-item :deep(.el-collapse-item__header .el-collapse-item__arrow) { display: none !important; }

.zg-log-json {
  padding: 12px; background: #f8fafc; border-radius: 8px; margin-bottom: 10px;
}
.zg-log-json-head {
  display: flex; align-items: center; gap: 8px; margin-bottom: 8px;
  font-size: 12px; color: #64748b;
}
.zg-json-block {
  margin: 0; padding: 10px;
  background: #0f172a; color: #e2e8f0;
  border-radius: 6px; overflow-x: auto;
  font-family: 'Consolas', 'Monaco', monospace; font-size: 12px; line-height: 1.6;
  max-height: 260px;
}
.zg-log-json-meta {
  display: flex; gap: 16px; margin-top: 8px;
  font-size: 11px; color: #64748b; font-family: monospace;
}

.zg-hlglog__empty { padding: 40px; text-align: center; color: #94a3b8; font-size: 13px; }

.zg-code { color: #6366f1; font-size: 12px; font-family: monospace; }
.zg-danger { color: #ef4444; font-weight: 600; }
.zg-warn { color: #f59e0b; font-weight: 600; }

@media (max-width: 1280px) {
  .zg-metrics { grid-template-columns: repeat(2, 1fr); }
  .zg-filterband__actions { margin-left: 0; }
}
</style>
