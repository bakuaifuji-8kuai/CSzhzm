<!--
  智光云枢 · 电网知识库 · 电路参数库
  业务域：gridKnowledge
  功能：结构化电路参数库，支持载流量/保护定值/接地/线径分类查询
-->
<template>
  <section class="zg-params">
    <header class="zg-params__head">
      <div class="zg-params__headline">
        <div class="zg-params__sigil">
          <el-icon :size="22"><DataBoard /></el-icon>
        </div>
        <div class="zg-params__copy">
          <h1 class="zg-params__title">电路参数库</h1>
          <p class="zg-params__sub">载流量 · 保护定值 · 接地标准 · 线径选择 · 统一执行标准</p>
        </div>
      </div>
      <div class="zg-params__cta">
        <el-button type="primary"><el-icon><Plus /></el-icon><span>新增参数</span></el-button>
        <el-button><el-icon><Download /></el-icon><span>导出 Excel</span></el-button>
      </div>
    </header>

    <!-- 指标卡 -->
    <div class="zg-metrics">
      <div v-for="k in kpiItems" :key="k.label" class="zg-metrics__cell" :class="k.theme">
        <span class="zg-metrics__num">{{ k.value }}</span>
        <span class="zg-metrics__lbl">{{ k.label }}</span>
      </div>
    </div>

    <!-- 分类导航 -->
    <div class="zg-category-nav">
      <div v-for="cat in categories" :key="cat.key" class="zg-category-card"
        :class="{ 'is-active': activeCat === cat.key }"
        @click="activeCat = cat.key">
        <div class="zg-category-card__icon" :style="{ background: cat.color }">
          <el-icon :size="24"><component :is="cat.icon" /></el-icon>
        </div>
        <div class="zg-category-card__body">
          <div class="zg-category-card__title">{{ cat.name }}</div>
          <div class="zg-category-card__count">{{ cat.count }} 条</div>
        </div>
      </div>
    </div>

    <!-- 过滤工具栏 -->
    <div class="zg-filterband">
      <div class="zg-filterband__row">
        <el-input v-model="keyword" placeholder="搜索参数名称 / 标准 / 备注" clearable style="width: 280px">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-select v-model="standard" placeholder="来源标准" style="width: 160px" clearable>
          <el-option label="GB/T 16895" value="GB/T 16895" />
          <el-option label="GB/T 14048" value="GB/T 14048" />
          <el-option label="GB/T 50065" value="GB/T 50065" />
          <el-option label="CJJ 89" value="CJJ 89" />
          <el-option label="GB 50052" value="GB 50052" />
        </el-select>
      </div>
    </div>

    <!-- 参数表格 -->
    <div class="zg-panel">
      <el-table :data="filteredParams" stripe border size="small" class="zg-datatable" :header-cell-style="{ background: '#f8fafc' }">
        <el-table-column label="参数分类" width="120" align="center">
          <template #default="{ row }">
            <span class="zg-cat-badge" :class="'zg-cat-badge--' + catClass(row.category)">{{ row.category }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="参数名称" width="160" />
        <el-table-column prop="condition" label="适用条件" min-width="200" show-overflow-tooltip />
        <el-table-column prop="recommended" label="推荐值" width="160">
          <template #default="{ row }">
            <span class="zg-param-value">{{ row.recommended }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="unit" label="单位" width="100" align="center" />
        <el-table-column prop="standard" label="来源标准" width="150">
          <template #default="{ row }">
            <span class="zg-standard">{{ row.standard }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="180" show-overflow-tooltip />
      </el-table>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { DataBoard, Plus, Download, Search, Connection, Lightning, Menu, Link, Setting } from "@element-plus/icons-vue"

const keyword = ref('')
const standard = ref('')
const activeCat = ref('')

const categories = ref([
  { key: '', name: '全部', count: 28, icon: 'DataBoard', color: 'linear-gradient(135deg,#6366f1,#8b5cf6)' },
  { key: '载流量', name: '载流量', count: 8, icon: 'Connection', color: 'linear-gradient(135deg,#0ea5e9,#0284c7)' },
  { key: '保护定值', name: '保护定值', count: 7, icon: 'Lightning', color: 'linear-gradient(135deg,#ef4444,#dc2626)' },
  { key: '接地', name: '接地标准', count: 6, icon: 'Menu', color: 'linear-gradient(135deg,#10b981,#059669)' },
  { key: '线径', name: '线径选择', count: 7, icon: 'Link', color: 'linear-gradient(135deg,#d97706,#f59e0b)' }
])

const kpiItems = computed(() => [
  { label: '参数总数', value: 28, theme: '' },
  { label: '载流量参数', value: 8, theme: 'zg-metrics__cell--primary' },
  { label: '保护定值', value: 7, theme: 'zg-metrics__cell--danger' },
  { label: '接地标准', value: 6, theme: 'zg-metrics__cell--success' },
  { label: '线径选择', value: 7, theme: 'zg-metrics__cell--warn' }
])

// 参数 mock - 28 条
const params = ref([
  // 载流量
  { category: '载流量', name: 'YJV22-4×150 载流量', condition: '空气中敷设，环境温度 30℃', recommended: '485', unit: 'A', standard: 'GB/T 16895', remark: '交联聚乙烯绝缘钢带铠装' },
  { category: '载流量', name: 'YJV22-4×185 载流量', condition: '空气中敷设，环境温度 30℃', recommended: '540', unit: 'A', standard: 'GB/T 16895', remark: '' },
  { category: '载流量', name: 'YJV22-4×240 载流量', condition: '空气中敷设，环境温度 30℃', recommended: '620', unit: 'A', standard: 'GB/T 16895', remark: '' },
  { category: '载流量', name: 'YJV22-4×300 载流量', condition: '空气中敷设，环境温度 30℃', recommended: '710', unit: 'A', standard: 'GB/T 16895', remark: '' },
  { category: '载流量', name: 'YJV-5×16 载流量', condition: '穿管敷设，PVC管 DN50', recommended: '78', unit: 'A', standard: 'GB/T 16895', remark: '控制回路' },
  { category: '载流量', name: 'YJV-5×25 载流量', condition: '穿管敷设，PVC管 DN65', recommended: '102', unit: 'A', standard: 'GB/T 16895', remark: '' },
  { category: '载流量', name: 'BV-2.5 载流量', condition: '穿管敷设，单根', recommended: '25', unit: 'A', standard: 'GB/T 16895', remark: '照明支线' },
  { category: '载流量', name: 'BV-4 载流量', condition: '穿管敷设，单根', recommended: '32', unit: 'A', standard: 'GB/T 16895', remark: '' },

  // 保护定值
  { category: '保护定值', name: '断路器脱扣曲线', condition: '路灯主回路 AC400V', recommended: 'C 型（5-10In）', unit: '-', standard: 'GB/T 14048.2', remark: '照明回路推荐 C 型' },
  { category: '保护定值', name: '过流保护定值', condition: '变压器低压侧出线', recommended: '1.5 × 额定电流', unit: 'A', standard: 'GB/T 14048.2', remark: '躲过最大负荷电流' },
  { category: '保护定值', name: '短路保护定值', condition: '低压馈线回路', recommended: '2.0 × 过流定值', unit: 'A', standard: 'GB/T 14048.2', remark: '保证上下级配合' },
  { category: '保护定值', name: '漏电保护动作电流', condition: '路灯主回路 TT 系统', recommended: '300', unit: 'mA', standard: 'GB/T 14048.5', remark: '动作时间 ≤ 0.3s' },
  { category: '保护定值', name: '漏电保护动作电流', condition: '充电桩回路 TN-S', recommended: '30', unit: 'mA', standard: 'GB/T 14048.5', remark: '人体保护' },
  { category: '保护定值', name: '熔断器额定电流', condition: '照明支路保护', recommended: '1.25 × 支路电流', unit: 'A', standard: 'GB/T 14048.6', remark: '' },
  { category: '保护定值', name: '电压互感器变比', condition: '低压计量用', recommended: '400 / 100', unit: '-', standard: 'GB/T 20840', remark: '' },

  // 接地
  { category: '接地', name: 'TN-S 系统接地电阻', condition: '变压器中性点接地', recommended: '≤ 4', unit: 'Ω', standard: 'GB/T 50065', remark: '100kVA 及以上' },
  { category: '接地', name: 'TN-S 系统接地电阻', condition: '小容量变压器', recommended: '≤ 10', unit: 'Ω', standard: 'GB/T 50065', remark: '100kVA 以下' },
  { category: '接地', name: 'TT 系统接地电阻', condition: '路灯独立接地', recommended: '≤ 30', unit: 'Ω', standard: 'GB/T 50065', remark: '配 RCD 30mA 可放宽' },
  { category: '接地', name: 'PE 导体最小截面', condition: '相线 ≤ 16mm²', recommended: '= 相线截面', unit: 'mm²', standard: 'GB 50054', remark: '' },
  { category: '接地', name: '垂直接地体长度', condition: '角钢 / 钢管', recommended: '2.5', unit: 'm', standard: 'GB/T 50065', remark: '一般土质' },
  { category: '接地', name: '水平接地体埋深', condition: '扁钢 -40×4', recommended: '≥ 0.6', unit: 'm', standard: 'GB/T 50065', remark: '北方冻土层以下' },

  // 线径
  { category: '线径', name: '照明回路最小线径', condition: '室内/室外照明', recommended: '1.5 / 2.5', unit: 'mm²', standard: 'GB 50034', remark: '铜线' },
  { category: '线径', name: '路灯干线最小线径', condition: '地埋 / 架空', recommended: '4 / 10', unit: 'mm²', standard: 'CJJ 89', remark: 'YJV 铜芯' },
  { category: '线径', name: '单相插座回路线径', condition: '一般用途', recommended: '2.5', unit: 'mm²', standard: 'GB 50034', remark: '' },
  { category: '线径', name: '充电桩回路线径', condition: '单枪 7kW', recommended: '4', unit: 'mm²', standard: 'GB/T 18487', remark: '建议 YJV-3×6' },
  { category: '线径', name: '充电桩回路线径', condition: '单枪 22kW', recommended: '6', unit: 'mm²', standard: 'GB/T 18487', remark: '建议 YJV-3×10' },
  { category: '线径', name: '控制信号线径', condition: 'RS485 / CAN', recommended: '0.5 ~ 1.5', unit: 'mm²', standard: 'GB 50052', remark: '屏蔽双绞线' },
  { category: '线径', name: '接地 PE 线径', condition: '一般配电箱', recommended: '≥ 相线一半', unit: 'mm²', standard: 'GB 50054', remark: '且不小于 16mm²' }
])

const filteredParams = computed(() => {
  return params.value.filter(p => {
    const matchCat = !activeCat.value || p.category === activeCat.value
    const matchStd = !standard.value || p.standard === standard.value
    const matchKw = !keyword.value.trim() ||
      p.name.includes(keyword.value) || p.standard.includes(keyword.value) || p.remark.includes(keyword.value)
    return matchCat && matchStd && matchKw
  })
})

function catClass(c) {
  return { '载流量': 'primary', '保护定值': 'danger', '接地': 'success', '线径': 'warn' }[c] || ''
}
</script>

<style scoped lang="scss">
.zg-params {
  padding: 24px;
  &__head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 18px; padding-bottom: 18px; border-bottom: 1px solid #e2e8f0; }
  &__headline { display: flex; align-items: center; gap: 14px; }
  &__sigil { width: 44px; height: 44px; border-radius: 10px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; display: flex; align-items: center; justify-content: center; }
  &__copy { display: flex; flex-direction: column; gap: 4px; }
  &__title { font-size: 20px; font-weight: 600; margin: 0; color: #18181b; }
  &__sub { font-size: 13px; color: #71717a; margin: 0; }
  &__cta { display: flex; gap: 10px; }
}

.zg-metrics {
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; margin-bottom: 16px;
  &__cell { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px 18px; display: flex; flex-direction: column; gap: 6px; box-shadow: 0 1px 3px rgba(15,23,42,0.04); position: relative; overflow: hidden;
    &::before { content: ''; position: absolute; left: 0; top: 0; width: 3px; height: 100%; background: #6366f1; }
    &--primary::before { background: #0ea5e9; }
    &--danger::before { background: #dc2626; }
    &--success::before { background: #059669; }
    &--warn::before { background: #d97706; }
  }
  &__num { font-size: 26px; font-weight: 700; color: #18181b; line-height: 1; }
  &__lbl { font-size: 12px; color: #71717a; }
}

.zg-category-nav {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 18px;
}
.zg-category-card {
  display: flex; align-items: center; gap: 12px; padding: 14px;
  border: 2px solid #e2e8f0; border-radius: 12px; cursor: pointer; transition: all 0.2s; background: #fff;
  &:hover { border-color: #6366f1; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(99,102,241,0.15); }
  &.is-active { border-color: #6366f1; background: #f5f3ff; box-shadow: 0 4px 12px rgba(99,102,241,0.2); }
  &__icon { width: 48px; height: 48px; border-radius: 10px; color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  &__body { display: flex; flex-direction: column; gap: 2px; }
  &__title { font-size: 14px; font-weight: 600; color: #18181b; }
  &__count { font-size: 12px; color: #71717a; }
}

.zg-filterband { padding: 14px 16px; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 16px;
  &__row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
}

.zg-panel { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 18px; }

.zg-cat-badge {
  display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 600;
  &--primary { background: #e0f2fe; color: #0369a1; }
  &--danger { background: #fee2e2; color: #b91c1c; }
  &--success { background: #d1fae5; color: #047857; }
  &--warn { background: #fef3c7; color: #b45309; }
}

.zg-param-value {
  font-family: ui-monospace, monospace; font-size: 13px; font-weight: 700; color: #6366f1;
}

.zg-standard {
  font-family: ui-monospace, monospace; font-size: 12px; color: #71717a; font-weight: 500;
}
</style>
