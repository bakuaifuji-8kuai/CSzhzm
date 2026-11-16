<!-- 智光云枢 · 能耗专项 · ReportCenter 能耗报表中心 -->
<template>
  <section class="zg-energy-report">
    <header class="zg-energy__head">
      <div class="zg-energy__headline">
        <div class="zg-energy__sigil"><el-icon :size="22"><Coin /></el-icon></div>
        <div class="zg-energy__copy">
          <h1>能耗报表中心</h1>
          <p>日报 / 月报 / 年报 / 自定义 —— 多维度导出 · 定时生成 · 政府报送衔接</p>
        </div>
      </div>
      <div class="zg-energy__cta">
        <el-button type="primary" :icon="Plus">新建自定义报表</el-button>
        <el-button :icon="Star">定时任务配置</el-button>
      </div>
    </header>

    <!-- 筛选工具栏 -->
    <div class="zg-filterband">
      <el-select v-model="filter.period" placeholder="报表周期" style="width:140px">
        <el-option label="日报" value="日报" />
        <el-option label="月报" value="月报" />
        <el-option label="年报" value="年报" />
        <el-option label="自定义" value="自定义" />
      </el-select>
      <el-select v-model="filter.dim" placeholder="统计维度" style="width:160px">
        <el-option v-for="d in ['区域','路段','箱变','回路','灯具','权属单位']" :key="d" :label="d" :value="d" />
      </el-select>
      <el-date-picker v-model="filter.range" type="daterange" range-separator="至" start-placeholder="开始" end-placeholder="结束" value-format="YYYY-MM-DD" style="width:260px" />
      <el-input v-model="filter.keyword" placeholder="搜索报表名称" :prefix-icon="Search" style="width:220px" clearable />
      <el-button type="primary" :icon="Search">查询</el-button>
    </div>

    <!-- 报表列表：Tab 切换周期 -->
    <el-tabs v-model="activePeriod" type="border-card" class="zg-energy__tabs">
      <el-tab-pane label="全部" name="all" />
      <el-tab-pane label="日报" name="日报" />
      <el-tab-pane label="月报" name="月报" />
      <el-tab-pane label="年报" name="年报" />
      <el-tab-pane label="自定义" name="自定义" />
    </el-tabs>

    <el-table :data="displayReports" stripe size="small" height="520">
      <el-table-column prop="name" label="报表名称" width="280">
        <template #default="{ row }">
          <div class="flex items-center gap-2">
            <el-icon class="text-cyan-500"><Document /></el-icon>
            <span class="font-semibold">{{ row.name }}</span>
            <el-tag v-if="row.period !== '自定义'" size="small" effect="plain" :type="periodColor(row.period)">{{ row.period }}</el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="dim" label="维度" width="110">
        <template #default="{ row }"><el-tag size="small" effect="plain">{{ row.dim }}</el-tag></template>
      </el-table-column>
      <el-table-column prop="range" label="时间范围" width="170" />
      <el-table-column prop="size" label="数据量" width="120">
        <template #default="{ row }"><span class="font-mono text-sm">{{ row.size }}</span></template>
      </el-table-column>
      <el-table-column prop="generator" label="生成方式" width="120">
        <template #default="{ row }">
          <el-tag v-if="row.generator === '定时'" type="success" effect="light" size="small">⟳ 定时</el-tag>
          <el-tag v-else type="info" effect="light" size="small">手动</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="owner" label="创建人" width="100" />
      <el-table-column prop="time" label="生成时间" width="170" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag v-if="row.status === '已生成'" type="success" size="small">{{ row.status }}</el-tag>
          <el-tag v-else-if="row.status === '生成中'" type="warning" size="small">{{ row.status }}</el-tag>
          <el-tag v-else type="danger" size="small">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" :icon="Monitor">预览</el-button>
          <el-button link type="primary" size="small" :icon="Download">Excel</el-button>
          <el-button link type="primary" size="small" :icon="Download">PDF</el-button>
          <el-button link type="primary" size="small" :icon="Share">分享</el-button>
        </template>
      </el-table-column>
    </el-table>
  </section>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { Coin, Document, Download, Plus, Star, Search, Monitor, Share } from "@element-plus/icons-vue"

function periodColor(p) {
  return p === '日报' ? 'info' : p === '月报' ? '' : p === '年报' ? 'warning' : 'success'
}

const activePeriod = ref('all')
const filter = reactive({ period: '', dim: '', range: null, keyword: '' })

const reports = ref([
  { name: '先导区 11月能耗月报', period: '月报', dim: '区域', range: '2026-11-01 ~ 2026-11-14', size: '1.2万行', generator: '定时', owner: '张敏', time: '2026-11-14 08:02', status: '已生成' },
  { name: '麓谷产业园 周度能耗简报', period: '日报', dim: '路段', range: '2026-11-07 ~ 2026-11-13', size: '3,210 行', generator: '定时', owner: '李亮', time: '2026-11-14 08:01', status: '已生成' },
  { name: '梅溪湖环湖路 10月线损分析', period: '月报', dim: '回路', range: '2026-10-01 ~ 2026-10-31', size: '6,840 行', generator: '手动', owner: '王芳', time: '2026-11-03 16:22', status: '已生成' },
  { name: '2025 年度全域能耗年报', period: '年报', dim: '区域', range: '2025-01-01 ~ 2025-12-31', size: '15.6万行', generator: '手动', owner: '运营中心', time: '2026-01-15 10:30', status: '已生成' },
  { name: '今日箱变实时用电日报', period: '日报', dim: '箱变', range: '2026-11-13', size: '986 行', generator: '定时', owner: '系统', time: '2026-11-14 00:05', status: '已生成' },
  { name: 'LED 灯具能耗对比分析（2026H1）', period: '自定义', dim: '灯具', range: '2026-01-01 ~ 2026-06-30', size: '8,210 行', generator: '手动', owner: '赵工', time: '2026-07-08 11:18', status: '已生成' },
  { name: '岳麓区 三季度节能专项报表', period: '月报', dim: '路段', range: '2026-07 ~ 2026-09', size: '4,520 行', generator: '手动', owner: '岳麓城管', time: '2026-10-12 15:40', status: '已生成' },
  { name: '非照明点位月度耗电排行', period: '月报', dim: '权属单位', range: '2026-10-01 ~ 2026-10-31', size: '268 行', generator: '定时', owner: '运营中心', time: '2026-11-02 08:00', status: '已生成' },
  { name: '2026 年 11 月政府能耗报送模板', period: '自定义', dim: '区域', range: '2026-11', size: '1,240 行', generator: '定时', owner: '系统', time: '2026-11-14 06:00', status: '生成中' },
  { name: '异常用电 AI 识别 · 10月汇总', period: '月报', dim: '回路', range: '2026-10-01 ~ 2026-10-31', size: '326 行', generator: '手动', owner: 'AI 运维', time: '2026-11-05 09:20', status: '已生成' },
  { name: '峰谷用电月度分析报告', period: '月报', dim: '箱变', range: '2026-10', size: '48 行', generator: '定时', owner: '系统', time: '2026-11-01 00:10', status: '已生成' },
  { name: '节能 EMC 收益季报', period: '自定义', dim: '区域', range: '2026-Q3', size: '12 行', generator: '手动', owner: '商务拓展', time: '2026-10-25 14:00', status: '已生成' },
  { name: '今日车载光衰巡检报告', period: '日报', dim: '路段', range: '2026-11-14', size: '420 行', generator: '手动', owner: '巡检队', time: '2026-11-14 17:30', status: '已生成' },
  { name: '开福区 11月能耗月报', period: '月报', dim: '区域', range: '2026-11-01 ~ 2026-11-14', size: '890 行', generator: '定时', owner: '系统', time: '2026-11-14 08:05', status: '已生成' },
  { name: '雨花区箱变线损专项分析', period: '自定义', dim: '箱变', range: '2026-09 ~ 2026-11', size: '260 行', generator: '手动', owner: '运维部', time: '2026-11-10 10:15', status: '已生成' }
])

const displayReports = computed(() => reports.value.filter(r =>
  (activePeriod.value === 'all' || r.period === activePeriod.value) &&
  (!filter.keyword || r.name.includes(filter.keyword))
))
</script>

<style lang="scss" scoped>
.zg-energy-report { padding: var(--zg-space-6); background: var(--zg-gradient-surface); min-height: calc(100vh - 120px); }
.zg-energy__head { display: flex; justify-content: space-between; align-items: center; padding-bottom: var(--zg-space-5); margin-bottom: var(--zg-space-4); border-bottom: 1px solid var(--zg-line-soft); }
.zg-energy__sigil { width: 44px; height: 44px; border-radius: var(--zg-radius-md); background: linear-gradient(135deg,#06b6d4,#6366f1); color: #fff; display: flex; align-items: center; justify-content: center; }
.zg-energy__headline { display: flex; gap: var(--zg-space-3); align-items: center; }
.zg-energy__copy h1 { margin: 0; font-size: var(--zg-text-display-md); font-weight: 700; }
.zg-energy__copy p { margin: 2px 0 0; font-size: var(--zg-text-body-sm); color: var(--zg-ink-tertiary); }

.zg-filterband { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; padding: var(--zg-space-3); background: var(--zg-surface-card); border: 1px solid var(--zg-line-soft); border-radius: var(--zg-radius-md); margin-bottom: var(--zg-space-4); }

.zg-energy__tabs { :deep(.el-tabs__item) { font-weight: 600; } margin-bottom: var(--zg-space-3); }
</style>
