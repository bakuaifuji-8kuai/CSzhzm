<!--
  智光云枢 · 运维工单 · 升级规则管理（EscalationRule · D-06）
-->
<template>
  <section class="zg-escal">
    <!-- 顶部 -->
    <header class="zg-escal__head">
      <div class="zg-escal__headline">
        <div class="zg-escal__sigil"><el-icon :size="22"><Promotion /></el-icon></div>
        <div class="zg-escal__copy">
          <h1 class="zg-escal__title">工单升级规则（D-06）</h1>
          <p class="zg-escal__sub">两级推送 · 超时自动升级 + 人工一键上报领导</p>
        </div>
      </div>
      <div class="zg-escal__cta">
        <el-button :icon="Refresh" @click="resetRules">恢复默认规则</el-button>
        <el-button type="primary" :icon="Plus" @click="openCreate">新建规则</el-button>
      </div>
    </header>

    <!-- 说明 alert -->
    <el-alert
      class="zg-escal__alert"
      type="info"
      :closable="false"
      show-icon
    >
      <template #title>
        <div class="alert-title">
          <strong>两种升级模式 · 均可配置</strong>
        </div>
        <div class="alert-desc">
          <span class="mode-chip mode-auto">
            <el-icon :size="14"><Timer /></el-icon>
            <b>自动升级</b>：工单超时未处理，系统自动按规则推送至更高级别负责人
          </span>
          <span class="mode-chip mode-manual">
            <el-icon :size="14"><Pointer /></el-icon>
            <b>人工升级</b>：一线工程师可主动点击"升级"按钮上报，可配置允许的工程师权限
          </span>
          <span class="mode-chip mode-push">
            <el-icon :size="14"><Bell /></el-icon>
            <b>推送渠道</b>：站内通知 · 短信 · 语音
          </span>
        </div>
      </template>
    </el-alert>

    <!-- 规则列表 -->
    <div class="zg-escal__table-wrap">
      <div class="zg-escal__tablehead">
        <div class="zg-escal__ttitle">
          <el-icon :size="18"><List /></el-icon>
          <span>升级规则 · {{ rules.length }} 条</span>
        </div>
        <div class="zg-escal__tactions">
          <el-select v-model="priorityFilter" placeholder="工单等级" clearable size="default" style="width:130px">
            <el-option label="L1 一般" value="L1" />
            <el-option label="L2 较大" value="L2" />
            <el-option label="L3 重大" value="L3" />
            <el-option label="L4 特大" value="L4" />
          </el-select>
          <el-select v-model="statusFilter" placeholder="状态" clearable size="default" style="width:110px">
            <el-option label="启用" value="enabled" />
            <el-option label="停用" value="disabled" />
          </el-select>
        </div>
      </div>

      <el-table :data="filteredRules" stripe>
        <el-table-column prop="name" label="规则名称" min-width="220">
          <template #default="{ row }">
            <div class="rule-name">
              <el-tag size="small" :type="priorityTagType(row.priority)" effect="dark">{{ row.priority }}</el-tag>
              <span class="rule-title">{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="触发条件" width="180">
          <template #default="{ row }">
            <div class="trigger-info">
              <el-tag size="small" type="danger" effect="light">工单等级 {{ row.priority }}</el-tag>
              <span v-if="row.matchKeyword" class="match-keyword">· 含「{{ row.matchKeyword }}」</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="自动升级" width="200">
          <template #default="{ row }">
            <div class="mode-cell">
              <el-switch
                :model-value="row.autoEnabled"
                @update:model-value="(v) => toggleAuto(row, v)"
                size="default"
              />
              <span v-if="row.autoEnabled" class="timeout-label">
                超时 <b>{{ row.timeoutMinutes }}</b> 分钟
              </span>
              <span v-else class="disabled-label">已关闭</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="人工升级" width="200">
          <template #default="{ row }">
            <div class="mode-cell">
              <el-switch
                :model-value="row.manualEnabled"
                @update:model-value="(v) => toggleManual(row, v)"
                size="default"
              />
              <span v-if="row.manualEnabled" class="manual-label">
                {{ row.engineerCanUpgrade ? '工程师可自主升级' : '仅班长可操作' }}
              </span>
              <span v-else class="disabled-label">已关闭</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="推送对象" min-width="240">
          <template #default="{ row }">
            <div class="target-list">
              <el-tag
                v-for="t in row.targets"
                :key="t"
                size="small"
                :type="targetTagType(t)"
                effect="plain"
                class="target-tag"
              >{{ t }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="推送渠道" width="180">
          <template #default="{ row }">
            <div class="channel-list">
              <span
                v-for="c in row.channels"
                :key="c"
                class="channel-pill"
                :class="'channel-' + c"
              >{{ channelIcon(c) }} {{ channelLabel(c) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              :model-value="row.status === 'enabled'"
              @update:model-value="(v) => toggleStatus(row, v)"
              active-text="启用"
              inactive-text="停用"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <div class="rowactions">
              <el-button link type="primary" size="small" @click="onEdit(row)">编辑</el-button>
              <el-button link type="success" size="small" @click="testRule(row)">测试</el-button>
              <el-button link type="danger" size="small" @click="onRemove(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 右侧抽屉：新建/编辑规则 -->
    <el-drawer
      v-model="drawerOpen"
      :title="formMode === 'edit' ? '编辑升级规则' : '新建升级规则'"
      direction="rtl"
      size="560px"
    >
      <el-form :model="form" label-width="110px" label-position="right">
        <el-form-item label="规则名称" required>
          <el-input v-model="form.name" placeholder="如：L2连片灭灯自动升级" />
        </el-form-item>
        <el-form-item label="触发条件">
          <el-select v-model="form.priority" placeholder="选择工单等级" style="width:100%">
            <el-option label="L1 一般故障" value="L1" />
            <el-option label="L2 较大故障" value="L2" />
            <el-option label="L3 重大故障" value="L3" />
            <el-option label="L4 特大故障" value="L4" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词匹配">
          <el-input v-model="form.matchKeyword" placeholder="如：连片灭灯、断电、漏电（可选）" />
        </el-form-item>

        <el-divider content-position="left">自动升级配置</el-divider>
        <el-form-item label="启用自动升级">
          <el-switch v-model="form.autoEnabled" />
        </el-form-item>
        <el-form-item v-if="form.autoEnabled" label="超时分钟数">
          <el-input-number
            v-model="form.timeoutMinutes"
            :min="1"
            :max="720"
            :step="5"
            style="width:100%"
          />
        </el-form-item>

        <el-divider content-position="left">人工升级配置</el-divider>
        <el-form-item label="启用人工升级">
          <el-switch v-model="form.manualEnabled" />
        </el-form-item>
        <el-form-item v-if="form.manualEnabled" label="工程师自主升级">
          <el-switch v-model="form.engineerCanUpgrade" />
          <div class="form-tip">关闭后仅班长及以上可执行人工升级</div>
        </el-form-item>

        <el-divider content-position="left">推送配置</el-divider>
        <el-form-item label="推送对象">
          <el-select v-model="form.targets" multiple placeholder="选择推送对象" style="width:100%">
            <el-option label="班组" value="班组" />
            <el-option label="班长" value="班长" />
            <el-option label="运维经理" value="运维经理" />
            <el-option label="分管副总" value="分管副总" />
            <el-option label="总经理" value="总经理" />
          </el-select>
        </el-form-item>
        <el-form-item label="推送渠道">
          <el-checkbox-group v-model="form.channels">
            <el-checkbox value="site">站内通知</el-checkbox>
            <el-checkbox value="sms">短信</el-checkbox>
            <el-checkbox value="voice">语音</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-divider content-position="left">状态</el-divider>
        <el-form-item label="规则状态">
          <el-radio-group v-model="form.status">
            <el-radio value="enabled">启用</el-radio>
            <el-radio value="disabled">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="drawerOpen = false">取消</el-button>
        <el-button type="primary" @click="commitForm">保存规则</el-button>
      </template>
    </el-drawer>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Promotion, Plus, Refresh, Timer, Pointer, Bell, List } from "@element-plus/icons-vue"

// ============ 预置规则（6 条） ============
const DEFAULT_RULES = [
  {
    id: 1, name: 'L1 单灯故障（仅通知班组）', priority: 'L1', matchKeyword: '',
    autoEnabled: false, timeoutMinutes: 120,
    manualEnabled: false, engineerCanUpgrade: false,
    targets: ['班长'], channels: ['site'],
    status: 'enabled'
  },
  {
    id: 2, name: 'L2 连片灭灯（≤10 盏）', priority: 'L2', matchKeyword: '连片灭灯',
    autoEnabled: true, timeoutMinutes: 60,
    manualEnabled: true, engineerCanUpgrade: true,
    targets: ['运维经理', '班长'], channels: ['site', 'sms'],
    status: 'enabled'
  },
  {
    id: 3, name: 'L3 连片灭灯（>10 盏）', priority: 'L3', matchKeyword: '连片灭灯',
    autoEnabled: true, timeoutMinutes: 30,
    manualEnabled: true, engineerCanUpgrade: true,
    targets: ['分管副总', '运维经理', '班长'], channels: ['site', 'sms', 'voice'],
    status: 'enabled'
  },
  {
    id: 4, name: 'L4 特大断电事故', priority: 'L4', matchKeyword: '断电',
    autoEnabled: true, timeoutMinutes: 10,
    manualEnabled: true, engineerCanUpgrade: true,
    targets: ['总经理', '分管副总', '运维经理'], channels: ['site', 'sms', 'voice'],
    status: 'enabled'
  },
  {
    id: 5, name: '电缆漏电告警', priority: 'L3', matchKeyword: '漏电',
    autoEnabled: true, timeoutMinutes: 15,
    manualEnabled: true, engineerCanUpgrade: true,
    targets: ['分管副总', '运维经理'], channels: ['site', 'sms', 'voice'],
    status: 'enabled'
  },
  {
    id: 6, name: '人工升级权限配置', priority: 'L3', matchKeyword: '',
    autoEnabled: false, timeoutMinutes: 60,
    manualEnabled: true, engineerCanUpgrade: true,
    targets: ['总经理'], channels: ['site', 'sms'],
    status: 'enabled'
  }
]

const rules = ref([...DEFAULT_RULES])
const priorityFilter = ref('')
const statusFilter = ref('')

const filteredRules = computed(() => {
  return rules.value.filter((r) => {
    if (priorityFilter.value && r.priority !== priorityFilter.value) return false
    if (statusFilter.value && r.status !== statusFilter.value) return false
    return true
  })
})

// ============ 辅助方法 ============
const priorityTagType = (p) => ({ L1: 'success', L2: 'warning', L3: 'danger', L4: 'dark' }[p] || 'info')
const targetTagType = (t) => ({
  '班组': 'info', '班长': 'success', '运维经理': 'warning', '分管副总': 'danger', '总经理': 'primary'
}[t] || 'info')
const channelLabel = (c) => ({ site: '站内通知', sms: '短信', voice: '语音' }[c] || c)
const channelIcon = (c) => ({ site: '📩', sms: '📱', voice: '📞' }[c] || '🔔')

// ============ 开关操作 ============
const toggleAuto = (row, v) => {
  row.autoEnabled = v
  ElMessage.success(`${row.name} · 自动升级已${v ? '开启' : '关闭'}`)
}
const toggleManual = (row, v) => {
  row.manualEnabled = v
  ElMessage.success(`${row.name} · 人工升级已${v ? '开启' : '关闭'}`)
}
const toggleStatus = (row, v) => {
  row.status = v ? 'enabled' : 'disabled'
  ElMessage.success(`${row.name} 已${v ? '启用' : '停用'}`)
}

// ============ 抽屉 ============
const drawerOpen = ref(false)
const formMode = ref('create')
const form = ref({
  name: '', priority: 'L2', matchKeyword: '',
  autoEnabled: true, timeoutMinutes: 60,
  manualEnabled: true, engineerCanUpgrade: false,
  targets: ['班长'], channels: ['site'],
  status: 'enabled'
})

const resetForm = () => {
  form.value = {
    name: '', priority: 'L2', matchKeyword: '',
    autoEnabled: true, timeoutMinutes: 60,
    manualEnabled: true, engineerCanUpgrade: false,
    targets: ['班长'], channels: ['site'],
    status: 'enabled'
  }
}

const openCreate = () => {
  formMode.value = 'create'
  resetForm()
  drawerOpen.value = true
}

const onEdit = (row) => {
  formMode.value = 'edit'
  form.value = {
    ...row,
    targets: [...row.targets],
    channels: [...row.channels]
  }
  drawerOpen.value = true
}

const commitForm = () => {
  if (!form.value.name.trim()) {
    ElMessage.warning('请填写规则名称')
    return
  }
  if (!form.value.targets.length) {
    ElMessage.warning('请至少选择一个推送对象')
    return
  }

  if (formMode.value === 'create') {
    const nextId = Math.max(...rules.value.map((r) => r.id), 0) + 1
    rules.value.push({ ...form.value, id: nextId })
    ElMessage.success(`✅ 已新建规则：${form.value.name}`)
  } else {
    const idx = rules.value.findIndex((r) => r.id === form.value.id)
    if (idx >= 0) {
      rules.value[idx] = { ...form.value, id: rules.value[idx].id }
      ElMessage.success(`✅ 已保存规则：${form.value.name}`)
    }
  }
  drawerOpen.value = false
}

const onRemove = (row) => {
  ElMessageBox.confirm(`确认删除规则「${row.name}」？此操作不可撤销。`, '操作确认', { type: 'warning' })
    .then(() => {
      const idx = rules.value.findIndex((r) => r.id === row.id)
      if (idx >= 0) rules.value.splice(idx, 1)
      ElMessage.success(`✅ 已删除规则`)
    })
    .catch(() => {})
}

const testRule = (row) => {
  ElMessage.success(`🧪 已触发测试：模拟 ${row.priority} 工单 · ${row.name} · 将推送给 ${row.targets.join(' → ')}`)
}

const resetRules = () => {
  ElMessageBox.confirm('确认恢复为默认的 6 条预置规则？当前自定义规则将丢失。', '操作确认', { type: 'warning' })
    .then(() => {
      rules.value = DEFAULT_RULES.map((r) => ({ ...r, targets: [...r.targets], channels: [...r.channels] }))
      ElMessage.success('✅ 已恢复默认规则')
    })
    .catch(() => {})
}
</script>

<style scoped lang="scss">
.zg-escal {
  padding: 24px;
  display: flex; flex-direction: column; gap: 14px;
  height: calc(100vh - 120px);

  &__head {
    display: flex; justify-content: space-between; align-items: center;
    padding-bottom: 14px; border-bottom: 1px solid var(--zg-line-soft);
  }
  &__headline { display: flex; align-items: center; gap: 14px; }
  &__sigil {
    width: 44px; height: 44px; border-radius: var(--zg-radius-md);
    background: var(--zg-gradient-primary); color: #fff;
    display: flex; align-items: center; justify-content: center;
  }
  &__copy { display: flex; flex-direction: column; gap: 4px; }
  &__title { margin: 0; font-size: 20px; font-weight: 600; }
  &__sub { margin: 0; font-size: 13px; color: var(--zg-ink-tertiary); }
  &__cta { display: flex; gap: 10px; }
}

.zg-escal__alert {
  :deep(.el-alert__title) { display: flex; flex-direction: column; gap: 6px; }
  .alert-title b { font-size: 14px; }
  .alert-desc {
    display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px;
    font-size: 12px;
  }
  .mode-chip {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 4px 10px; border-radius: 8px;
    b { font-size: 12px; }
    &.mode-auto { background: #fef3c7; color: #92400e; }
    &.mode-manual { background: #dbeafe; color: #1e40af; }
    &.mode-push { background: #fce7f3; color: #9d174d; }
  }
}

.zg-escal__table-wrap {
  background: var(--zg-surface-card);
  border: 1px solid var(--zg-line-soft);
  border-radius: var(--zg-radius-lg);
  padding: 14px;
  box-shadow: var(--zg-shadow-card);
  flex: 1;
  display: flex; flex-direction: column;
  min-height: 0;
  overflow: auto;
}

.zg-escal__tablehead { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.zg-escal__ttitle { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 600; color: var(--zg-ink-primary); }
.zg-escal__tactions { display: flex; gap: 10px; }

.rule-name {
  display: flex; align-items: center; gap: 8px;
  .rule-title { font-weight: 500; color: var(--zg-ink-primary); }
}

.trigger-info {
  display: flex; align-items: center; gap: 4px; flex-wrap: wrap;
  .match-keyword { font-size: 11px; color: var(--zg-warning); }
}

.mode-cell {
  display: flex; align-items: center; gap: 8px;
  .timeout-label { font-size: 12px; color: var(--zg-success); }
  .manual-label { font-size: 12px; color: var(--zg-info); }
  .disabled-label { font-size: 12px; color: var(--zg-ink-tertiary); font-style: italic; }
}

.target-list {
  display: flex; flex-wrap: wrap; gap: 4px;
  .target-tag { font-size: 11px; }
}

.channel-list {
  display: flex; flex-direction: column; gap: 2px;
}
.channel-pill {
  font-size: 11px; padding: 1px 6px; border-radius: 6px;
  display: inline-block; width: fit-content;
  &.channel-site { background: #e0f2fe; color: #075985; }
  &.channel-sms { background: #dcfce7; color: #166534; }
  &.channel-voice { background: #fce7f3; color: #9d174d; }
}

.rowactions { display: flex; gap: 4px; }

.form-tip {
  font-size: 11px; color: var(--zg-ink-tertiary); margin-top: 4px; line-height: 1.4;
}
</style>
