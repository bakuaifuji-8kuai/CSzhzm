<!--
  智光云枢 · 运维组织 · 值班表（DutySchedule）
-->
<template>
  <section class="zg-duty">
    <!-- 顶部 -->
    <header class="zg-duty__head">
      <div class="zg-duty__headline">
        <div class="zg-duty__sigil"><el-icon :size="22"><Calendar /></el-icon></div>
        <div class="zg-duty__copy">
          <h1 class="zg-duty__title">值班排班表</h1>
          <p class="zg-duty__sub">{{ currentMonthLabel }} · 运维部三班轮值 · 含领导值周</p>
        </div>
      </div>
      <div class="zg-duty__cta">
        <el-date-picker
          v-model="selectedMonth"
          type="month"
          placeholder="选择月份"
          value-format="YYYY-MM"
          size="default"
        />
        <el-radio-group v-model="viewMode" size="default">
          <el-radio-button value="week">本周</el-radio-button>
          <el-radio-button value="month">本月</el-radio-button>
        </el-radio-group>
        <el-button type="primary" :icon="Plus" @click="openScheduleDialog">调整排班</el-button>
      </div>
    </header>

    <!-- KPI 指标卡 -->
    <div class="zg-duty__kpis">
      <div class="cell cell--primary">
        <div class="cell__icon"><el-icon :size="20"><UserFilled /></el-icon></div>
        <div class="cell__body">
          <span class="num">{{ todayCount }}</span>
          <span class="lbl">今日值班人数</span>
        </div>
      </div>
      <div class="cell cell--warning">
        <div class="cell__icon"><el-icon :size="20"><Cpu /></el-icon></div>
        <div class="cell__body">
          <span class="num">{{ todayChief }}</span>
          <span class="lbl">今日值班班长</span>
        </div>
      </div>
      <div class="cell cell--success">
        <div class="cell__icon"><el-icon :size="20"><CircleCheck /></el-icon></div>
        <div class="cell__body">
          <span class="num">{{ monthAttendance }}</span>
          <span class="lbl">本月出勤人次</span>
        </div>
      </div>
      <div class="cell cell--danger">
        <div class="cell__icon"><el-icon :size="20"><Warning /></el-icon></div>
        <div class="cell__body">
          <span class="num">{{ monthSub }}</span>
          <span class="lbl">请假 / 代班人次</span>
        </div>
      </div>
    </div>

    <!-- 日历主体 -->
    <div class="zg-duty__main">
      <div class="zg-duty__calendar">
        <div class="cal-head">
          <el-button :icon="ArrowLeft" circle size="small" @click="shiftMonth(-1)" />
          <span class="cal-title">{{ selectedMonthLabel }}</span>
          <el-button :icon="ArrowRight" circle size="small" @click="shiftMonth(1)" />
          <span class="cal-legend">
            <span class="lg"><i class="lg-dot lg-day"></i>白班</span>
            <span class="lg"><i class="lg-dot lg-night"></i>夜班</span>
            <span class="lg"><i class="lg-dot lg-chief"></i>班长</span>
            <span class="lg"><i class="lg-dot lg-lead"></i>领导值周</span>
            <span class="lg"><i class="lg-dot lg-leave"></i>请假</span>
            <span class="lg"><i class="lg-dot lg-bak"></i>备班</span>
          </span>
        </div>

        <!-- 周视图 -->
        <div v-if="viewMode === 'week'" class="cal-week">
          <div class="week-days">
            <div v-for="d in weekDays" :key="d.day" class="week-cell" :class="{ today: d.isToday, weekend: d.weekend }">
              <div class="week-cell__head">
                <span class="weekday">{{ d.weekday }}</span>
                <span class="weekdate">{{ d.month }}/{{ d.day }}</span>
              </div>
              <div class="week-cell__lead" v-if="d.leadOn">
                <el-tag size="small" type="danger" effect="light">
                  <el-icon :size="12"><User /></el-icon>{{ d.leadOn }} 值周
                </el-tag>
              </div>
              <div class="shift shift--day">
                <div class="shift__label">☀️ 白班</div>
                <div class="shift__people">
                  <div
                    v-for="p in d.dayShift"
                    :key="p.name"
                    class="person-chip"
                    :class="{ chief: p.isChief, leave: p.status === 'leave', sub: p.status === 'sub', backup: p.status === 'backup' }"
                  >
                    {{ p.name }}
                    <span v-if="p.isChief" class="chief-badge">★</span>
                    <span v-if="p.status === 'leave'" class="tag-leave">请假</span>
                    <span v-if="p.status === 'sub'" class="tag-sub">代</span>
                    <span v-if="p.status === 'backup'" class="tag-bak">备</span>
                  </div>
                </div>
              </div>
              <div class="shift shift--night">
                <div class="shift__label">🌙 夜班</div>
                <div class="shift__people">
                  <div
                    v-for="p in d.nightShift"
                    :key="p.name"
                    class="person-chip"
                    :class="{ chief: p.isChief, leave: p.status === 'leave', sub: p.status === 'sub', backup: p.status === 'backup' }"
                  >
                    {{ p.name }}
                    <span v-if="p.isChief" class="chief-badge">★</span>
                    <span v-if="p.status === 'leave'" class="tag-leave">请假</span>
                    <span v-if="p.status === 'sub'" class="tag-sub">代</span>
                    <span v-if="p.status === 'backup'" class="tag-bak">备</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 月视图 -->
        <div v-else class="cal-month">
          <div class="month-grid">
            <div class="month-grid__head">
              <span v-for="w in ['一','二','三','四','五','六','日']" :key="w" class="weekname">{{ w }}</span>
            </div>
            <div class="month-grid__body">
              <div
                v-for="(cell, idx) in monthCells"
                :key="idx"
                class="month-cell"
                :class="{ 'other-month': !cell.inMonth, today: cell.isToday, weekend: cell.weekend }"
              >
                <div class="month-cell__date">{{ cell.day }}</div>
                <div class="month-cell__lead" v-if="cell.leadOn">
                  <el-icon :size="10"><User /></el-icon>{{ cell.leadOn }}
                </div>
                <div class="month-cell__shifts" v-if="cell.inMonth">
                  <div class="ms ms--day">
                    <span class="ms-dot"></span>
                    <span class="ms-text">{{ cell.dayShift?.map(p => p.name + (p.isChief ? '★' : '')).join('·') || '—' }}</span>
                  </div>
                  <div class="ms ms--night">
                    <span class="ms-dot"></span>
                    <span class="ms-text">{{ cell.nightShift?.map(p => p.name + (p.isChief ? '★' : '')).join('·') || '—' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部值班人员列表 -->
    <div class="zg-duty__table">
      <div class="zg-duty__tablehead">
        <div class="zg-duty__ttitle">
          <el-icon :size="18"><Tickets /></el-icon>
          <span>本月值班明细 · {{ dutyTableData.length }} 条</span>
        </div>
        <div class="zg-duty__tactions">
          <el-select v-model="tableShiftFilter" placeholder="班次" clearable size="default" style="width:130px">
            <el-option label="白班" value="day" />
            <el-option label="夜班" value="night" />
          </el-select>
          <el-select v-model="tableStatusFilter" placeholder="状态" clearable size="default" style="width:130px">
            <el-option label="正常" value="normal" />
            <el-option label="请假" value="leave" />
            <el-option label="代班" value="sub" />
            <el-option label="备班" value="backup" />
          </el-select>
        </div>
      </div>

      <el-table :data="filteredDutyTable" stripe height="calc(100% - 120px)">
        <el-table-column prop="date" label="日期" width="110" />
        <el-table-column label="星期" width="80">
          <template #default="{ row }">{{ row.weekday }}</template>
        </el-table-column>
        <el-table-column label="班次" width="100">
          <template #default="{ row }">
            <el-tag :type="row.shift === 'day' ? 'warning' : 'info'" effect="light" size="small">
              {{ row.shift === 'day' ? '☀️ 白班' : '🌙 夜班' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="班长" width="100">
          <template #default="{ row }">
            <span v-if="row.isChief" class="chief-mark">★ {{ row.person }}</span>
            <span v-else class="sub-person">{{ row.person }}</span>
          </template>
        </el-table-column>
        <el-table-column label="班组" width="140">
          <template #default="{ row }">
            <el-tag size="small" effect="plain">{{ row.team }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <span class="statuschip" :class="'statuschip--' + row.status">
              <span class="statusdot"></span>{{ statusText(row.status) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="160" />
      </el-table>
    </div>

    <!-- 调整排班抽屉 -->
    <el-drawer v-model="drawerOpen" title="调整值班排班" direction="rtl" size="480px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="日期">
          <el-date-picker v-model="form.date" type="date" value-format="YYYY-MM-DD" style="width:100%" />
        </el-form-item>
        <el-form-item label="班次">
          <el-select v-model="form.shift" style="width:100%">
            <el-option label="白班" value="day" />
            <el-option label="夜班" value="night" />
          </el-select>
        </el-form-item>
        <el-form-item label="人员">
          <el-select v-model="form.person" placeholder="选择人员" filterable style="width:100%">
            <el-option v-for="p in allPersonnel" :key="p.name" :label="p.name + ' (' + p.team + ')'" :value="p.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" style="width:100%">
            <el-option label="正常值班" value="normal" />
            <el-option label="请假" value="leave" />
            <el-option label="代班" value="sub" />
            <el-option label="备班" value="backup" />
          </el-select>
        </el-form-item>
        <el-form-item label="是否班长">
          <el-switch v-model="form.isChief" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="如：病假、年假、替班原因等" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="drawerOpen = false">取消</el-button>
        <el-button type="primary" @click="commitSchedule">保存</el-button>
      </template>
    </el-drawer>
  </section>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Calendar, Plus, ArrowLeft, ArrowRight, UserFilled, Cpu, CircleCheck, Warning, User, Tickets
} from "@element-plus/icons-vue"
import { staff } from '@/shared/stores/opsOrgStore'

// ============ 基础状态 ============
const now = new Date()
const selectedMonth = ref(now.toISOString().slice(0, 7)) // YYYY-MM
const viewMode = ref('week')
const drawerOpen = ref(false)

const selectedMonthLabel = computed(() => {
  const [y, m] = selectedMonth.value.split('-').map(Number)
  return `${y} 年 ${m} 月`
})
const shiftMonth = (delta) => {
  const [y, m] = selectedMonth.value.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  selectedMonth.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

// ============ 值班人员池（来自 OrgChart 的 team-1/team-2/team-3） ============
const teamMap = { 'team-1': '一分队', 'team-2': '二分队', 'team-3': '隧道专项组', 'mgmt': '管理层' }
const allPersonnel = computed(() => {
  return staff
    .filter((s) => !['engineer', 'team_leader', 'manager', 'director', 'ceo'].includes(s.leadLevel) || s.teamId !== 'mgmt' || true)
    .map((s) => ({ name: s.name, team: teamMap[s.teamId] || '运维部' }))
})

// ============ 领导值周表（本月固定排） ============
// 每 4 天轮一次：陈经理 → 李副总 → 王总 → 陈经理...
const getLeadForDate = (dateStr) => {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dayOfYear = Math.floor((new Date(y, m - 1, d) - new Date(y, 0, 0)) / 86400000)
  const cycle = dayOfYear % 4
  return ['陈经理', '李副总', '王总', '陈经理'][cycle]
}

// ============ 生成每日值班数据（月视图用） ============
const generateMonthSchedule = () => {
  const [y, m] = selectedMonth.value.split('-').map(Number)
  const firstDay = new Date(y, m - 1, 1)
  const daysInMonth = new Date(y, m, 0).getDate()
  const startWeekDay = (firstDay.getDay() + 6) % 7 // 周一=0

  const team1 = staff.filter((s) => s.teamId === 'team-1')
  const team2 = staff.filter((s) => s.teamId === 'team-2')
  const team3 = staff.filter((s) => s.teamId === 'team-3')
  const engineers = staff.filter((s) => s.leadLevel === 'engineer')
  const chiefs = staff.filter((s) => s.leadLevel === 'team_leader')

  const cells = []
  // 前置填充
  const prevMonthDays = new Date(y, m - 1, 0).getDate()
  for (let i = startWeekDay - 1; i >= 0; i--) {
    cells.push({
      day: prevMonthDays - i, inMonth: false,
      date: `${y}-${String(m - 1).padStart(2, '0')}-${String(prevMonthDays - i).padStart(2, '0')}`,
      month: m - 1, leadOn: null
    })
  }

  // 本月每天
  const todayStr = now.toISOString().slice(0, 10)
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const dow = new Date(y, m - 1, d).getDay()
    const weekend = dow === 0 || dow === 6
    const leadOn = getLeadForDate(dateStr)

    // 白班 2 人 + 夜班 2 人，班长轮流
    const chiefIdx = d % 3
    const dayChief = chiefs[chiefIdx % chiefs.length]
    const nightChief = chiefs[(chiefIdx + 1) % chiefs.length]

    const eIdx = d % engineers.length
    const dayShift = [
      { name: dayChief.name, isChief: true, status: 'normal' },
      { name: engineers[eIdx].name, isChief: false, status: d === 15 ? 'leave' : d === 22 ? 'backup' : 'normal' }
    ]
    const nightShift = [
      { name: nightChief.name, isChief: true, status: d === 8 ? 'sub' : 'normal' },
      { name: engineers[(eIdx + 3) % engineers.length].name, isChief: false, status: 'normal' }
    ]

    cells.push({
      day: d, inMonth: true, date: dateStr, month: m,
      isToday: dateStr === todayStr, weekend,
      leadOn, dayShift, nightShift
    })
  }

  return cells
}

const monthCells = computed(() => generateMonthSchedule())

// 补足月视图最后一周
watch(monthCells, () => {})

// ============ 周视图数据 ============
const weekDays = computed(() => {
  const today = new Date()
  const result = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - today.getDay() + 1 + i)
    const dateStr = d.toISOString().slice(0, 10)
    const cell = monthCells.value.find((c) => c.date === dateStr && c.inMonth)
    result.push({
      day: d.getDate(),
      month: d.getMonth() + 1,
      weekday: ['一', '二', '三', '四', '五', '六', '日'][i],
      weekend: i >= 5,
      isToday: dateStr === today.toISOString().slice(0, 10),
      date: dateStr,
      leadOn: cell?.leadOn,
      dayShift: cell?.dayShift || [],
      nightShift: cell?.nightShift || []
    })
  }
  return result
})

// ============ KPI ============
const todayStr = now.toISOString().slice(0, 10)
const todayCell = computed(() => monthCells.value.find((c) => c.date === todayStr))
const todayCount = computed(() => {
  const c = todayCell.value
  return c ? (c.dayShift.length + c.nightShift.length + 1) : 4 // +1 领导值周
})
const todayChief = computed(() => {
  const c = todayCell.value
  if (!c) return '—'
  const dayChief = c.dayShift.find((p) => p.isChief)
  return dayChief?.name || '—'
})
const monthAttendance = computed(() => {
  return monthCells.value.filter((c) => c.inMonth).reduce((sum, c) => {
    return sum + c.dayShift.length + c.nightShift.length
  }, 0)
})
const monthSub = computed(() => {
  return monthCells.value.filter((c) => c.inMonth).reduce((sum, c) => {
    const all = [...c.dayShift, ...c.nightShift]
    return sum + all.filter((p) => p.status === 'leave' || p.status === 'sub').length
  }, 0)
})

// ============ 底部表格 ============
const statusText = (s) => ({ normal: '正常', leave: '请假', sub: '代班', backup: '备班' }[s] || s)

const dutyTableData = computed(() => {
  const data = []
  monthCells.value.forEach((c) => {
    if (!c.inMonth) return
    const [y, m, d] = c.date.split('-').map(Number)
    const dow = new Date(y, m - 1, d).getDay()
    const weekday = ['日', '一', '二', '三', '四', '五', '六'][dow]
    const addRow = (shift, person) => {
      // 找班组
      const emp = staff.find((s) => s.name === person.name)
      data.push({
        date: `${m}/${d}`,
        weekday,
        shift,
        person: person.name,
        team: emp ? teamMap[emp.teamId] || '运维部' : '运维部',
        phone: emp?.phone || '138****0000',
        isChief: person.isChief,
        status: person.status,
        remark: person.status === 'leave' ? '病假/年假' : person.status === 'sub' ? '临时代班' : person.status === 'backup' ? '备班待命' : '正常值班'
      })
    }
    c.dayShift.forEach((p) => addRow('day', p))
    c.nightShift.forEach((p) => addRow('night', p))
  })
  return data
})

const tableShiftFilter = ref('')
const tableStatusFilter = ref('')
const filteredDutyTable = computed(() => {
  return dutyTableData.value.filter((r) => {
    if (tableShiftFilter.value && r.shift !== tableShiftFilter.value) return false
    if (tableStatusFilter.value && r.status !== tableStatusFilter.value) return false
    return true
  })
})

// ============ 排班抽屉 ============
const form = ref({ date: '', shift: 'day', person: '', status: 'normal', isChief: false, remark: '' })
const openScheduleDialog = () => {
  form.value = { date: new Date().toISOString().slice(0, 10), shift: 'day', person: '', status: 'normal', isChief: false, remark: '' }
  drawerOpen.value = true
}
const commitSchedule = () => {
  ElMessage.success(`✅ 已保存排班：${form.value.date} ${form.value.shift === 'day' ? '白班' : '夜班'} ${form.value.person}`)
  drawerOpen.value = false
}
</script>

<style scoped lang="scss">
.zg-duty {
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
  &__cta { display: flex; gap: 10px; align-items: center; }
}

.zg-duty__kpis {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
  .cell {
    background: var(--zg-surface-card);
    border: 1px solid var(--zg-line-soft);
    border-radius: var(--zg-radius-lg);
    padding: 14px 18px;
    display: flex; align-items: center; gap: 14px;
    box-shadow: var(--zg-shadow-card);
    &__icon {
      width: 44px; height: 44px; border-radius: var(--zg-radius-md);
      display: flex; align-items: center; justify-content: center; color: #fff;
    }
    &__body { display: flex; flex-direction: column; }
    .num { font-size: 24px; font-weight: 700; line-height: 1.1; }
    .lbl { font-size: 12px; color: var(--zg-ink-tertiary); margin-top: 2px; }
    &--primary .cell__icon { background: var(--zg-gradient-primary); }
    &--primary .num { color: var(--zg-brand-primary); }
    &--warning .cell__icon { background: linear-gradient(135deg,#f59e0b,#d97706); }
    &--warning .num { color: var(--zg-warning); }
    &--success .cell__icon { background: linear-gradient(135deg,#10b981,#059669); }
    &--success .num { color: var(--zg-success); }
    &--danger .cell__icon { background: linear-gradient(135deg,#ef4444,#dc2626); }
    &--danger .num { color: var(--zg-danger); }
  }
}

.zg-duty__main {
  background: var(--zg-surface-card);
  border: 1px solid var(--zg-line-soft);
  border-radius: var(--zg-radius-lg);
  padding: 14px;
  box-shadow: var(--zg-shadow-card);
  display: flex; flex-direction: column; gap: 14px;
  min-height: 0;
}

.zg-duty__calendar { flex: 1; display: flex; flex-direction: column; min-height: 0; overflow: auto; }

.cal-head {
  display: flex; align-items: center; gap: 12px; padding-bottom: 12px; border-bottom: 1px dashed var(--zg-line-soft); margin-bottom: 12px;
  .cal-title { font-size: 16px; font-weight: 600; color: var(--zg-ink-primary); flex: 1; text-align: center; }
  .cal-legend { display: flex; gap: 14px; font-size: 11px; color: var(--zg-ink-secondary); }
  .lg { display: flex; align-items: center; gap: 4px; }
  .lg-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; &--day { background: #f59e0b; } &--night { background: #6366f1; } &--chief { background: #f97316; } &--lead { background: #dc2626; } &--leave { background: #fca5a5; } &--bak { background: #a7f3d0; } }
}

// ===== 周视图 =====
.cal-week { flex: 1; display: flex; flex-direction: column; min-height: 0; overflow: auto; }
.week-days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px; flex: 1; }
.week-cell {
  border: 1px solid var(--zg-line-soft);
  border-radius: var(--zg-radius-md);
  padding: 10px;
  display: flex; flex-direction: column; gap: 6px;
  background: #fff;
  min-height: 220px;
  &.today { border-color: var(--zg-brand-primary); box-shadow: 0 0 0 2px var(--zg-brand-tint-50); }
  &.weekend { background: #fffbeb; }
  &__head { display: flex; justify-content: space-between; align-items: center; font-weight: 600; }
  .weekday { font-size: 13px; color: var(--zg-ink-primary); }
  .weekdate { font-size: 12px; color: var(--zg-ink-tertiary); }
  &__lead { margin-top: 2px; }
}

.shift {
  background: var(--zg-surface-muted);
  border-radius: var(--zg-radius-sm);
  padding: 6px 8px;
  &--day { border-left: 3px solid #f59e0b; }
  &--night { border-left: 3px solid #6366f1; }
  &__label { font-size: 11px; color: var(--zg-ink-secondary); margin-bottom: 4px; }
  &__people { display: flex; flex-direction: column; gap: 4px; }
}

.person-chip {
  font-size: 12px; padding: 4px 8px; background: #fff; border-radius: 6px;
  display: flex; align-items: center; gap: 4px; border: 1px solid var(--zg-line-soft);
  &.chief { border-color: #f97316; background: #fff7ed; font-weight: 600; color: #c2410c; }
  &.leave { background: #fef2f2; border-color: #fca5a5; color: #dc2626; text-decoration: line-through; }
  &.sub { background: #fef3c7; border-color: #fcd34d; color: #b45309; }
  &.backup { background: #ecfdf5; border-color: #a7f3d0; color: #059669; }
  .chief-badge { color: #f97316; font-size: 11px; }
  .tag-leave { font-size: 10px; padding: 1px 4px; background: #fee2e2; border-radius: 4px; margin-left: auto; }
  .tag-sub { font-size: 10px; padding: 1px 4px; background: #fef3c7; border-radius: 4px; margin-left: auto; color: #b45309; }
  .tag-bak { font-size: 10px; padding: 1px 4px; background: #ecfdf5; border-radius: 4px; margin-left: auto; color: #059669; }
}

// ===== 月视图 =====
.cal-month { flex: 1; display: flex; flex-direction: column; min-height: 0; overflow: auto; }
.month-grid { display: flex; flex-direction: column; }
.month-grid__head {
  display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; margin-bottom: 4px;
  .weekname { text-align: center; font-size: 12px; font-weight: 600; color: var(--zg-ink-secondary); padding: 6px 0; }
}
.month-grid__body {
  display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px;
}
.month-cell {
  border: 1px solid var(--zg-line-soft);
  border-radius: var(--zg-radius-sm);
  padding: 6px;
  min-height: 100px;
  background: #fff;
  display: flex; flex-direction: column; gap: 4px;
  font-size: 11px;
  &.other-month { opacity: 0.35; }
  &.today { border-color: var(--zg-brand-primary); box-shadow: 0 0 0 2px var(--zg-brand-tint-50); }
  &.weekend { background: #fffbeb; }
  &__date { font-size: 13px; font-weight: 600; color: var(--zg-ink-primary); }
  &__lead {
    font-size: 10px; color: #dc2626; background: #fef2f2;
    padding: 1px 4px; border-radius: 4px; display: inline-flex; align-items: center; gap: 2px; width: fit-content;
  }
  &__shifts { display: flex; flex-direction: column; gap: 2px; margin-top: auto; }
}
.ms {
  display: flex; align-items: center; gap: 4px; font-size: 10px;
  &--day .ms-dot { width: 6px; height: 6px; border-radius: 50%; background: #f59e0b; }
  &--night .ms-dot { width: 6px; height: 6px; border-radius: 50%; background: #6366f1; }
  &--day .ms-text { color: #92400e; }
  &--night .ms-text { color: #3730a3; }
  .ms-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
}

// ===== 底部表格 =====
.zg-duty__table {
  background: var(--zg-surface-card);
  border: 1px solid var(--zg-line-soft);
  border-radius: var(--zg-radius-lg);
  padding: 14px;
  box-shadow: var(--zg-shadow-card);
  display: flex; flex-direction: column;
  height: 300px;
}
.zg-duty__tablehead { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.zg-duty__ttitle { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 600; color: var(--zg-ink-primary); }
.zg-duty__tactions { display: flex; gap: 10px; }

.chief-mark { color: #c2410c; font-weight: 600; }
.sub-person { color: var(--zg-ink-secondary); }

.statuschip {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 3px 10px; border-radius: var(--zg-radius-pill);
  font-size: 12px; font-weight: 500;
  .statusdot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
  &--normal { color: var(--zg-success); background: var(--zg-success-soft); }
  &--leave { color: var(--zg-danger); background: var(--zg-danger-soft); }
  &--sub { color: var(--zg-warning); background: var(--zg-warning-soft); }
  &--backup { color: var(--zg-info); background: var(--zg-info-soft); }
}
</style>
