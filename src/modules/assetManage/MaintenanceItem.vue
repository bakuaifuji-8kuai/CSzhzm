<!--
  智光云枢 · 资产维保 · 保养项目配置
  业务域：assetManage
  功能：标准保养项配置，预置 10 项标准（清洁/照度检测/线路检查等），支持启用开关与频次设置
-->
<template>
  <section class="zg-maint-item">
    <header class="zg-maint-item__head">
      <div class="zg-maint-item__headline">
        <div class="zg-maint-item__sigil">
          <el-icon :size="22"><Setting /></el-icon>
        </div>
        <div class="zg-maint-item__copy">
          <h1 class="zg-maint-item__title">保养项目配置</h1>
          <p class="zg-maint-item__sub">10 项标准保养项预置 · 适用资产类型 · 标准频次 · 启停管理</p>
        </div>
      </div>
      <div class="zg-maint-item__cta">
        <el-button type="primary"><el-icon><Plus /></el-icon><span>新增保养项</span></el-button>
        <el-button><el-icon><Download /></el-icon><span>导入模板</span></el-button>
      </div>
    </header>

    <!-- 指标卡 -->
    <div class="zg-metrics">
      <div class="zg-metrics__cell">
        <span class="zg-metrics__num">{{ items.length }}</span>
        <span class="zg-metrics__lbl">保养项目总数</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--success">
        <span class="zg-metrics__num">{{ enabledCount }}</span>
        <span class="zg-metrics__lbl">已启用项目</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--info">
        <span class="zg-metrics__num">{{ assetTypes.length }}</span>
        <span class="zg-metrics__lbl">适用资产类型</span>
      </div>
      <div class="zg-metrics__cell">
        <span class="zg-metrics__num">{{ monthlyDueCount }}</span>
        <span class="zg-metrics__lbl">本月待执行</span>
      </div>
    </div>

    <!-- 过滤工具栏 -->
    <div class="zg-filterband">
      <div class="zg-filterband__row">
        <el-input v-model="keyword" placeholder="搜索项目代码 / 名称 / 描述" clearable style="width: 260px">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-select v-model="filterAsset" placeholder="适用资产类型" style="width: 150px" clearable>
          <el-option v-for="t in assetTypes" :key="t" :label="t" :value="t" />
        </el-select>
        <el-switch v-model="onlyEnabled" active-text="仅启用" inactive-text="全部" />
        <div class="zg-filterband__hint">
          共 {{ filteredItems.length }} 项 / 已启用 {{ enabledCount }} 项
        </div>
      </div>
    </div>

    <!-- 保养项目表格 -->
    <div class="zg-panel">
      <el-table :data="filteredItems" stripe border size="small" class="zg-datatable">
        <el-table-column prop="code" label="项目代码" width="150" fixed>
          <template #default="{ row }">
            <span class="zg-code">{{ row.code }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="保养项名称" min-width="160" />
        <el-table-column label="适用资产类型" min-width="220">
          <template #default="{ row }">
            <div class="zg-asset-tags">
              <el-tag v-for="t in row.applyTo" :key="t" :type="assetTagColor(t)" size="small" effect="plain">{{ t }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="标准频次(月)" width="130" align="center">
          <template #default="{ row }">
            <span class="zg-freq">{{ row.frequencyMonths }} 个月</span>
          </template>
        </el-table-column>
        <el-table-column prop="standard" label="执行标准" width="160" show-overflow-tooltip />
        <el-table-column prop="description" label="项目说明" min-width="200" show-overflow-tooltip />
        <el-table-column prop="toolList" label="所需工具" width="180" show-overflow-tooltip />
        <el-table-column prop="estimatedHours" label="预计工时(h)" width="110" align="center" />
        <el-table-column label="启用开关" width="110" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.enabled" size="default" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small">编辑</el-button>
            <el-button link type="primary" size="small">克隆</el-button>
            <el-button link type="danger" size="small" :disabled="row.code.startsWith('STD')">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Setting, Plus, Download, Search } from "@element-plus/icons-vue"

const assetTypes = ['灯杆', 'LED灯具', '配电箱', '控制模块', '摄像头', '充电桩', '箱变', '电缆', '接地装置', '电缆井']

const keyword = ref('')
const filterAsset = ref('')
const onlyEnabled = ref(false)
const monthlyDueCount = ref(32)

// 10 项标准保养项
const items = ref([
  { code: 'STD-001', name: '表面清洁保养', applyTo: ['灯杆', '配电箱', '摄像头', '充电桩'], frequencyMonths: 6, standard: 'GB/T 23241', description: '清除设备表面灰尘、油污、积水，检查排水孔通畅', toolList: '抹布、毛刷、高压水枪', estimatedHours: 0.5, enabled: true },
  { code: 'STD-002', name: '照度检测与校准', applyTo: ['LED灯具'], frequencyMonths: 12, standard: 'GB/T 28204', description: '使用照度计在规定条件下测试灯具输出照度，偏差不超过±10%', toolList: '照度计、标准灯', estimatedHours: 1.0, enabled: true },
  { code: 'STD-003', name: '线路绝缘检查', applyTo: ['电缆', '配电箱', '箱变'], frequencyMonths: 12, standard: 'GB/T 16895', description: '用500V兆欧表测电缆对地绝缘电阻，应≥10MΩ', toolList: '兆欧表、相序表', estimatedHours: 1.5, enabled: true },
  { code: 'STD-004', name: '接线端子紧固检查', applyTo: ['配电箱', '箱变', '控制模块'], frequencyMonths: 6, standard: 'GB/T 14048', description: '检查所有接线端子力矩，电缆端子40N·m、导线端子12N·m', toolList: '力矩扳手、螺丝刀', estimatedHours: 1.0, enabled: true },
  { code: 'STD-005', name: '电容补偿装置检查', applyTo: ['配电箱', '箱变'], frequencyMonths: 12, standard: 'GB/T 12747', description: '检查电容容量偏差、漏液、鼓包情况，功率因数≥0.9', toolList: '电容表、万用表', estimatedHours: 0.5, enabled: true },
  { code: 'STD-006', name: '断路器动作特性测试', applyTo: ['配电箱', '箱变'], frequencyMonths: 24, standard: 'GB/T 14048.2', description: '过流脱扣测试、短路脱扣测试、分合闸测试', toolList: '断路器测试仪、万用表', estimatedHours: 2.0, enabled: true },
  { code: 'STD-007', name: '紧固件与结构检查', applyTo: ['灯杆', '电缆井', '配电箱'], frequencyMonths: 12, standard: 'CJJ 89', description: '检查法兰螺栓、地脚螺栓、焊缝、杆体垂直度', toolList: '力矩扳手、角度仪、超声波测厚仪', estimatedHours: 1.0, enabled: true },
  { code: 'STD-008', name: '防水密封检查', applyTo: ['配电箱', '摄像头', '充电桩', '控制模块'], frequencyMonths: 12, standard: 'IP65', description: '检查密封条老化、排水孔通畅、盖板紧固、IP等级确认', toolList: '游标卡尺、密封胶', estimatedHours: 0.5, enabled: true },
  { code: 'STD-009', name: '接地电阻测试', applyTo: ['接地装置', '灯杆', '配电箱', '箱变'], frequencyMonths: 12, standard: 'GB/T 50065', description: '使用接地电阻测试仪测量，TN-S系统≤4Ω', toolList: '接地电阻测试仪', estimatedHours: 1.0, enabled: true },
  { code: 'STD-010', name: '铭牌与标识检查', applyTo: ['灯杆', '配电箱', '箱变', '充电桩'], frequencyMonths: 24, standard: 'GB/T 23752', description: '检查设备铭牌、安全标识、警示标签清晰完好', toolList: '砂纸、自粘标签', estimatedHours: 0.25, enabled: true }
])

const enabledCount = computed(() => items.value.filter(i => i.enabled).length)

const filteredItems = computed(() => {
  return items.value.filter(it => {
    if (onlyEnabled.value && !it.enabled) return false
    if (filterAsset.value && !it.applyTo.includes(filterAsset.value)) return false
    if (!keyword.value.trim()) return true
    const kw = keyword.value.trim().toLowerCase()
    return it.code.toLowerCase().includes(kw) ||
      it.name.includes(kw) ||
      it.description.includes(kw)
  })
})

function assetTagColor(t) {
  const map = {
    '灯杆': '', 'LED灯具': 'success', '配电箱': 'warning', '控制模块': 'info',
    '摄像头': 'danger', '充电桩': 'primary', '箱变': 'info', '电缆': 'success',
    '接地装置': 'warning', '电缆井': ''
  }
  return map[t] || ''
}
</script>

<style scoped lang="scss">
.zg-maint-item {
  padding: 24px;
  &__head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 20px; padding-bottom: 18px; border-bottom: 1px solid #e2e8f0; }
  &__headline { display: flex; align-items: center; gap: 14px; }
  &__sigil { width: 44px; height: 44px; border-radius: 10px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; display: flex; align-items: center; justify-content: center; }
  &__copy { display: flex; flex-direction: column; gap: 4px; }
  &__title { font-size: 20px; font-weight: 600; margin: 0; color: #18181b; }
  &__sub { font-size: 13px; color: #71717a; margin: 0; }
  &__cta { display: flex; gap: 10px; }
}

.zg-metrics {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 18px;
  &__cell { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px 18px; display: flex; flex-direction: column; gap: 6px; box-shadow: 0 1px 3px rgba(15,23,42,0.04); position: relative; overflow: hidden;
    &::before { content: ''; position: absolute; left: 0; top: 0; width: 3px; height: 100%; background: #6366f1; }
    &--success::before { background: #059669; }
    &--info::before { background: #0ea5e9; }
  }
  &__num { font-size: 26px; font-weight: 700; color: #18181b; line-height: 1; }
  &__lbl { font-size: 12px; color: #71717a; }
}

.zg-filterband {
  padding: 14px 16px; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 16px;
  &__row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
  &__hint { margin-left: auto; font-size: 12px; color: #71717a; }
}

.zg-panel { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 18px; }

.zg-code { font-family: ui-monospace, monospace; font-size: 12px; font-weight: 600; color: #6366f1; }

.zg-asset-tags {
  display: flex; flex-wrap: wrap; gap: 4px;
}

.zg-freq {
  display: inline-block; padding: 2px 10px; background: #ede9fe; color: #6d28d9; border-radius: 6px; font-size: 12px; font-weight: 600;
}
</style>
