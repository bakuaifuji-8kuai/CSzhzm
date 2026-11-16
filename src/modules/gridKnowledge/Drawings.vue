<!--
  智光云枢 · 电网知识库 · 竣工图纸与档案
  业务域：gridKnowledge
  功能：图纸文件库管理，支持电缆敷设/接地/安装类型筛选、版本管理、PDF在线预览
-->
<template>
  <section class="zg-drawings">
    <header class="zg-drawings__head">
      <div class="zg-drawings__headline">
        <div class="zg-drawings__sigil">
          <el-icon :size="22"><Document /></el-icon>
        </div>
        <div class="zg-drawings__copy">
          <h1 class="zg-drawings__title">竣工图纸与档案</h1>
          <p class="zg-drawings__sub">电缆敷设 · 接地图纸 · 安装图纸 · 版本归档 · PDF 在线预览</p>
        </div>
      </div>
      <div class="zg-drawings__cta">
        <el-button type="primary"><el-icon><Upload /></el-icon><span>上传图纸</span></el-button>
        <el-button><el-icon><FolderAdd /></el-icon><span>新建目录</span></el-button>
      </div>
    </header>

    <!-- 标签筛选 -->
    <div class="zg-filterband">
      <div class="zg-filterband__tags">
        <span class="zg-filterband__lbl">图纸类型：</span>
        <el-radio-group v-model="filter.type" size="small">
          <el-radio-button value="">全部</el-radio-button>
          <el-radio-button value="电缆敷设">电缆敷设</el-radio-button>
          <el-radio-button value="接地">接地图纸</el-radio-button>
          <el-radio-button value="安装">安装图纸</el-radio-button>
          <el-radio-button value="原理图">原理图</el-radio-button>
          <el-radio-button value="台账">台账表</el-radio-button>
        </el-radio-group>
      </div>
      <div class="zg-filterband__search">
        <el-input v-model="filter.keyword" placeholder="搜索图纸名称 / 回路 / 设备" clearable style="width: 260px">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
      </div>
    </div>

    <!-- 图纸列表 -->
    <div class="zg-panel">
      <div class="zg-file-toolbar">
        <span class="zg-file-toolbar__count">共 {{ filteredDrawings.length }} 份图纸</span>
        <div class="zg-file-toolbar__right">
          <el-radio-group v-model="viewMode" size="small">
            <el-radio-button value="table"><el-icon><List /></el-icon>表格</el-radio-button>
            <el-radio-button value="card"><el-icon><Grid /></el-icon>卡片</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <!-- 表格视图 -->
      <el-table v-show="viewMode === 'table'" :data="filteredDrawings" stripe border size="small" class="zg-datatable">
        <el-table-column prop="name" label="图纸名称" min-width="240">
          <template #default="{ row }">
            <div class="zg-file-cell">
              <div class="zg-file-cell__icon">
                <el-icon :size="20" :color="fileColor(row.type)"><component :is="fileIcon(row.type)" /></el-icon>
              </div>
              <span class="zg-file-cell__name">{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="belongTo" label="所属回路/设备" width="180" show-overflow-tooltip />
        <el-table-column label="类型" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="typeTagColor(row.type)" size="small">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="uploadDate" label="上传日期" width="120" />
        <el-table-column label="版本" width="140">
          <template #default="{ row }">
            <span class="zg-version" :class="{ 'is-latest': row.isLatest }">{{ row.version }}</span>
            <el-tag v-if="row.isLatest" size="small" type="success" effect="dark" round class="ml-2">最新</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="文件大小" width="100" align="right" prop="size" />
        <el-table-column prop="uploader" label="上传人" width="90" align="center" />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small"><el-icon><Monitor /></el-icon>预览</el-button>
            <el-button link type="primary" size="small"><el-icon><Download /></el-icon>下载</el-button>
            <el-button link type="primary" size="small"><el-icon><Clock /></el-icon>历史</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 卡片视图 -->
      <div v-show="viewMode === 'card'" class="zg-card-view">
        <div v-for="row in filteredDrawings" :key="row.id" class="zg-file-card">
          <div class="zg-file-card__thumb">
            <div class="zg-file-card__thumb-icon" :style="{ background: fileBg(row.type) }">
              <el-icon :size="28" color="#fff"><component :is="fileIcon(row.type)" /></el-icon>
            </div>
            <span class="zg-file-card__type-tag" :class="'zg-file-card__type-tag--' + typeClass(row.type)">{{ row.type }}</span>
          </div>
          <div class="zg-file-card__body">
            <h4 class="zg-file-card__name">{{ row.name }}</h4>
            <p class="zg-file-card__meta">{{ row.belongTo }}</p>
            <div class="zg-file-card__info">
              <span class="zg-file-card__version">{{ row.version }}</span>
              <span>{{ row.uploadDate }}</span>
              <span>{{ row.size }}</span>
            </div>
          </div>
          <div class="zg-file-card__actions">
            <el-button size="small" type="primary" round><el-icon><Monitor /></el-icon>在线预览</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- PDF 预览抽屉 -->
    <el-drawer v-model="previewOpen" :title="previewFile?.name" size="720px" direction="rtl">
      <div v-if="previewFile" class="zg-pdf-preview">
        <div class="zg-pdf-preview__mock">
          <div class="zg-pdf-page">
            <div class="zg-pdf-page__header">{{ previewFile.name }}</div>
            <div class="zg-pdf-page__content">
              <div class="zg-pdf-line" style="width: 60%"></div>
              <div class="zg-pdf-line" style="width: 80%"></div>
              <div class="zg-pdf-line" style="width: 45%"></div>
              <div class="zg-pdf-diagram">📐 {{ previewFile.type }} 示意图区域</div>
              <div class="zg-pdf-line" style="width: 70%"></div>
              <div class="zg-pdf-line" style="width: 55%"></div>
              <div class="zg-pdf-line" style="width: 90%"></div>
            </div>
          </div>
        </div>
        <div class="zg-pdf-preview__actions">
          <el-button round><el-icon><Download /></el-icon>下载 PDF</el-button>
          <el-button type="primary" round><el-icon><Printer /></el-icon>打印</el-button>
        </div>
      </div>
    </el-drawer>
  </section>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Document, Upload, FolderAdd, Search, List, Grid, Monitor, Download, Clock, Printer } from "@element-plus/icons-vue"

const filter = reactive({ type: '', keyword: '' })
const viewMode = ref('table')
const previewOpen = ref(false)
const previewFile = ref(null)

// 图纸 mock - 14 条
const drawings = ref([
  { id: 1, name: '先导路1#箱变电缆敷设图', belongTo: '先导路主干馈线', type: '电缆敷设', uploadDate: '2026-09-15', version: 'v2.3', size: '15.2 MB', uploader: '张工', isLatest: true },
  { id: 2, name: '先导路K0+350电缆井接地图', belongTo: '先导路K0+350', type: '接地', uploadDate: '2026-08-20', version: 'v1.0', size: '6.8 MB', uploader: '李工', isLatest: true },
  { id: 3, name: '麓谷大道2#回路安装竣工图', belongTo: '麓谷2#回路', type: '安装', uploadDate: '2026-10-01', version: 'v1.2', size: '22.4 MB', uploader: '王工', isLatest: true },
  { id: 4, name: '先导路1#箱变一次/二次原理图', belongTo: '先导路1#箱变', type: '原理图', uploadDate: '2026-09-10', version: 'v2.1', size: '9.5 MB', uploader: '张工', isLatest: true },
  { id: 5, name: '梅溪湖3#箱变竣工验收图纸', belongTo: '梅溪湖3#箱变', type: '安装', uploadDate: '2026-06-01', version: 'v1.0', size: '18.7 MB', uploader: '赵工', isLatest: true },
  { id: 6, name: '金星大道主干馈线回路划分表', belongTo: '金星大道主干馈线', type: '台账', uploadDate: '2026-09-28', version: 'v1.3', size: '3.2 MB', uploader: '李工', isLatest: true },
  { id: 7, name: '先导路1#箱变接地电阻测试报告', belongTo: '先导路1#箱变', type: '接地', uploadDate: '2026-07-10', version: 'v2.1', size: '2.8 MB', uploader: '张工', isLatest: false },
  { id: 8, name: '岳麓大道配电箱电缆敷设总览', belongTo: '岳麓大道', type: '电缆敷设', uploadDate: '2026-05-15', version: 'v1.8', size: '28.5 MB', uploader: '王工', isLatest: true },
  { id: 9, name: '湘江路充电桩群接地图', belongTo: '湘江路充电桩群', type: '接地', uploadDate: '2026-07-22', version: 'v1.1', size: '7.2 MB', uploader: '陈工', isLatest: true },
  { id: 10, name: '天心大道隧道照明安装图', belongTo: '天心大道隧道', type: '安装', uploadDate: '2026-08-30', version: 'v3.0', size: '35.6 MB', uploader: '赵工', isLatest: true },
  { id: 11, name: '芙蓉路主干馈线原理图', belongTo: '芙蓉路主干馈线', type: '原理图', uploadDate: '2026-04-18', version: 'v1.5', size: '12.3 MB', uploader: '张工', isLatest: true },
  { id: 12, name: '开福大道灯杆台账表', belongTo: '开福大道', type: '台账', uploadDate: '2026-11-01', version: 'v2.0', size: '4.8 MB', uploader: '刘工', isLatest: true },
  { id: 13, name: '雨花路电缆沟敷设详图', belongTo: '雨花路电缆沟', type: '电缆敷设', uploadDate: '2026-09-05', version: 'v1.0', size: '19.6 MB', uploader: '李工', isLatest: true },
  { id: 14, name: '梅溪湖环湖路监控系统接线图', belongTo: '梅溪湖环湖路', type: '接线', uploadDate: '2026-06-28', version: 'v1.2', size: '8.4 MB', uploader: '王工', isLatest: true }
])

const filteredDrawings = computed(() => {
  return drawings.value.filter(d => {
    const matchType = !filter.type || d.type === filter.type
    const matchKw = !filter.keyword.trim() ||
      d.name.includes(filter.keyword) || d.belongTo.includes(filter.keyword)
    return matchType && matchKw
  })
})

function fileIcon(t) {
  const map = { '电缆敷设': 'Connection', '接地': 'Lightning', '安装': 'SetUp', '原理图': 'Document', '台账': 'List', '接线': 'Connection' }
  return map[t] || 'Document'
}
function fileColor(t) {
  const map = { '电缆敷设': '#6366f1', '接地': '#10b981', '安装': '#0ea5e9', '原理图': '#8b5cf6', '台账': '#d97706', '接线': '#6366f1' }
  return map[t] || '#64748b'
}
function fileBg(t) {
  const map = { '电缆敷设': 'linear-gradient(135deg,#6366f1,#8b5cf6)', '接地': 'linear-gradient(135deg,#10b981,#059669)', '安装': 'linear-gradient(135deg,#0ea5e9,#0284c7)', '原理图': 'linear-gradient(135deg,#8b5cf6,#6366f1)', '台账': 'linear-gradient(135deg,#d97706,#f59e0b)', '接线': 'linear-gradient(135deg,#6366f1,#4f46e5)' }
  return map[t] || '#64748b'
}
function typeTagColor(t) {
  const map = { '电缆敷设': 'primary', '接地': 'success', '安装': 'info', '原理图': 'warning', '台账': '', '接线': 'primary' }
  return map[t] || ''
}
function typeClass(t) {
  const map = { '电缆敷设': 'primary', '接地': 'success', '安装': 'info', '原理图': 'warning', '台账': 'amber', '接线': 'primary' }
  return map[t] || ''
}
</script>

<style scoped lang="scss">
.zg-drawings {
  padding: 24px;
  &__head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 18px; padding-bottom: 18px; border-bottom: 1px solid #e2e8f0; }
  &__headline { display: flex; align-items: center; gap: 14px; }
  &__sigil { width: 44px; height: 44px; border-radius: 10px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; display: flex; align-items: center; justify-content: center; }
  &__copy { display: flex; flex-direction: column; gap: 4px; }
  &__title { font-size: 20px; font-weight: 600; margin: 0; color: #18181b; }
  &__sub { font-size: 13px; color: #71717a; margin: 0; }
  &__cta { display: flex; gap: 10px; }
}

.zg-filterband {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 16px; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 16px; flex-wrap: wrap; gap: 12px;
  &__tags { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  &__lbl { font-size: 13px; font-weight: 500; color: #52525b; }
}

.zg-panel { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 18px; }

.zg-file-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;
  &__count { font-size: 13px; color: #71717a; }
}

.zg-file-cell {
  display: flex; align-items: center; gap: 10px;
  &__icon { width: 32px; height: 32px; border-radius: 6px; background: #f8fafc; display: flex; align-items: center; justify-content: center; }
  &__name { font-size: 13px; font-weight: 500; color: #18181b; }
}

.zg-version { font-family: ui-monospace, monospace; font-size: 12px; font-weight: 600; color: #52525b;
  &.is-latest { color: #059669; }
}

.zg-card-view { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }
.zg-file-card {
  background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;
  display: flex; flex-direction: column; transition: all 0.2s;
  &:hover { box-shadow: 0 8px 24px -8px rgba(15,23,42,0.15); transform: translateY(-2px); }
}
.zg-file-card__thumb {
  height: 120px; display: flex; align-items: center; justify-content: center; position: relative; background: #f8fafc;
}
.zg-file-card__thumb-icon { width: 56px; height: 56px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
.zg-file-card__type-tag {
  position: absolute; top: 8px; right: 8px; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;
  &--primary { background: #ede9fe; color: #6366f1; }
  &--success { background: #d1fae5; color: #059669; }
  &--info { background: #e0f2fe; color: #0ea5e9; }
  &--warning { background: #fef3c7; color: #d97706; }
  &--amber { background: #fef3c7; color: #b45309; }
}
.zg-file-card__body { padding: 12px; }
.zg-file-card__name { margin: 0 0 4px; font-size: 14px; font-weight: 600; color: #18181b; }
.zg-file-card__meta { margin: 0 0 8px; font-size: 12px; color: #71717a; }
.zg-file-card__info { display: flex; gap: 10px; font-size: 11px; color: #94a3b8; font-family: ui-monospace, monospace; }
.zg-file-card__actions { padding: 12px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; }

.zg-pdf-preview { display: flex; flex-direction: column; gap: 16px; }
.zg-pdf-preview__mock { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; background: #f1f5f9; }
.zg-pdf-page { background: #fff; min-height: 400px; padding: 24px; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.zg-pdf-page__header { font-size: 16px; font-weight: 600; color: #18181b; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #e2e8f0; }
.zg-pdf-page__content { display: flex; flex-direction: column; gap: 12px; }
.zg-pdf-line { height: 10px; background: #e2e8f0; border-radius: 4px; }
.zg-pdf-diagram {
  height: 160px; background: linear-gradient(135deg, #f8fafc, #e2e8f0);
  border-radius: 8px; display: flex; align-items: center; justify-content: center;
  color: #64748b; font-size: 14px; border: 2px dashed #cbd5e1; margin: 16px 0;
}
.zg-pdf-preview__actions { display: flex; justify-content: flex-end; gap: 10px; }

.ml-2 { margin-left: 8px; }
</style>
