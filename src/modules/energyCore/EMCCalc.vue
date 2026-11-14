<!-- 智光云枢 · 能耗专项 · EMCCalc EMC 收益计算器 -->
<template>
  <section class="zg-energy-emc">
    <header class="zg-energy__head">
      <div class="zg-energy__headline">
        <div class="zg-energy__sigil"><el-icon :size="22"><Coin /></el-icon></div>
        <div class="zg-energy__copy">
          <h1>EMC 收益计算器</h1>
          <p>合同能源管理 · 输入参数 · 实时输出收益 · 真实峰谷电价加权</p>
        </div>
      </div>
      <div class="zg-energy__cta">
        <el-button type="primary" :icon="Document">生成方案</el-button>
        <el-button :icon="Download">导出 Excel</el-button>
      </div>
    </header>

    <div class="zg-energy__main">
      <!-- 输入区 -->
      <div class="zg-energy__input-card">
        <h3><el-icon><Management /></el-icon>输入参数</h3>
        <el-form :model="form" label-width="130px" label-position="right" size="default">
          <el-form-item label="项目名称">
            <el-input v-model="form.project" style="width:100%" />
          </el-form-item>
          <el-form-item label="年节电量 kWh">
            <el-input-number v-model="form.savedEnergy" :step="10000" :min="0" :controls="false" style="width:100%" />
          </el-form-item>
          <el-form-item label="电价 ¥/kWh">
            <div class="flex gap-2 w-full">
              <el-input-number v-model="form.price" :step="0.01" :precision="3" :min="0.1" :max="2" :controls="false" style="flex:1" />
              <el-button :icon="Edit" @click="useWeighted = !useWeighted">
                {{ useWeighted ? '使用加权' : '自定义' }}
              </el-button>
            </div>
            <div v-if="useWeighted" class="zg-energy__hint">
              湖南省电网峰谷加权：峰 ¥0.98 × 35% + 平 ¥0.65 × 40% + 谷 ¥0.46 × 25% = <b>{{ weightedPrice.toFixed(3) }}</b>
            </div>
          </el-form-item>
          <el-form-item label="我方分成 %">
            <el-slider v-model="form.share" :min="10" :max="90" :step="5" show-input input-size="small" />
          </el-form-item>
          <el-form-item label="合同期限 年">
            <el-radio-group v-model="form.years">
              <el-radio-button :value="3">3 年</el-radio-button>
              <el-radio-button :value="5">5 年</el-radio-button>
              <el-radio-button :value="8">8 年</el-radio-button>
              <el-radio-button :value="10">10 年</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="项目总投资 ¥">
            <el-input-number v-model="form.investment" :step="50000" :min="0" :controls="false" style="width:100%" />
          </el-form-item>
        </el-form>

        <div class="zg-energy__presets">
          <h4>快捷方案</h4>
          <div class="zg-energy__preset-row">
            <div v-for="p in presets" :key="p.name" class="zg-energy__preset" @click="applyPreset(p)">
              <span class="name">{{ p.name }}</span>
              <span class="meta">回收期 {{ p.payback }} 年 · ROI {{ p.roi }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 输出区 -->
      <div class="zg-energy__output-card">
        <div class="zg-energy__result-banner">
          <el-icon><TrendCharts /></el-icon>
          <span>实时测算结果</span>
          <span class="zg-energy__live">● LIVE</span>
        </div>

        <div class="zg-energy__result-grid">
          <div class="zg-energy__result-card zg-energy__result-card--emerald">
            <div class="zg-energy__result-lbl">总收益</div>
            <div class="zg-energy__result-num">¥ {{ totalRevenue.toLocaleString() }}</div>
            <div class="zg-energy__result-sub">{{ form.years }} 年累计</div>
          </div>
          <div class="zg-energy__result-card zg-energy__result-card--cyan">
            <div class="zg-energy__result-lbl">年节能费</div>
            <div class="zg-energy__result-num">¥ {{ annualSavings.toLocaleString() }}</div>
            <div class="zg-energy__result-sub">年节电 × 电价</div>
          </div>
          <div class="zg-energy__result-card zg-energy__result-card--indigo">
            <div class="zg-energy__result-lbl">我方年收益</div>
            <div class="zg-energy__result-num">¥ {{ myAnnual.toLocaleString() }}</div>
            <div class="zg-energy__result-sub">年费 × 分成 {{ form.share }}%</div>
          </div>
          <div class="zg-energy__result-card zg-energy__result-card--amber">
            <div class="zg-energy__result-lbl">投资回收期</div>
            <div class="zg-energy__result-num">{{ paybackYears.toFixed(2) }} <span>年</span></div>
            <div class="zg-energy__result-sub">{{ paybackYears < form.years ? '✅ 在合同期内' : '⚠️ 超过合同期' }}</div>
          </div>
          <div class="zg-energy__result-card zg-energy__result-card--rose">
            <div class="zg-energy__result-lbl">内部收益率 IRR</div>
            <div class="zg-energy__result-num">{{ irr.toFixed(2) }} <span>%</span></div>
            <div class="zg-energy__result-sub">{{ irr > 10 ? '🔥 高于基准' : irr > 5 ? '✅ 可接受' : '⚠️ 偏低' }}</div>
          </div>
          <div class="zg-energy__result-card zg-energy__result-card--purple">
            <div class="zg-energy__result-lbl">额外年减碳</div>
            <div class="zg-energy__result-num">{{ carbonYear.toFixed(0) }} <span>吨 CO₂</span></div>
            <div class="zg-energy__result-sub">湖南省 OM 法</div>
          </div>
        </div>

        <div class="zg-energy__formula-card">
          <h4>核心公式验证</h4>
          <div class="zg-energy__formula">
            <span>年节能费 = {{ form.savedEnergy.toLocaleString() }} × ¥{{ effectivePrice.toFixed(3) }} = <b>¥{{ annualSavings.toLocaleString() }}</b></span>
          </div>
          <div class="zg-energy__formula">
            <span>我方年收益 = ¥{{ annualSavings.toLocaleString() }} × {{ form.share }}% = <b>¥{{ myAnnual.toLocaleString() }}</b></span>
          </div>
          <div class="zg-energy__formula">
            <span>回收期 = ¥{{ form.investment.toLocaleString() }} ÷ ¥{{ myAnnual.toLocaleString() }} ≈ <b>{{ paybackYears.toFixed(2) }} 年</b></span>
          </div>
          <div class="zg-energy__formula">
            <span>年减碳 = {{ form.savedEnergy.toLocaleString() }} × 0.581 ÷ 1000 ≈ <b>{{ carbonYear.toFixed(0) }} 吨</b></span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Coin, Download, Document, Management, TrendCharts, Edit } from "@element-plus/icons-vue"

// 湖南省电网峰谷加权
const peakTable = [
  { p: 0.98, w: 0.35 }, // 峰
  { p: 0.65, w: 0.40 }, // 平
  { p: 0.46, w: 0.25 }  // 谷
]
const weightedPrice = computed(() => peakTable.reduce((s, r) => s + r.p * r.w, 0))

const form = reactive({
  project: '先导路改造',
  savedEnergy: 1286000,
  price: 0.721,
  share: 70,
  years: 5,
  investment: 820000
})
const useWeighted = ref(true)
const effectivePrice = computed(() => useWeighted.value ? weightedPrice.value : form.price)

const annualSavings = computed(() => form.savedEnergy * effectivePrice.value)
const myAnnual = computed(() => annualSavings.value * form.share / 100)
const totalRevenue = computed(() => myAnnual.value * form.years)
const paybackYears = computed(() => form.investment > 0 ? form.investment / myAnnual.value : 0)
const irr = computed(() => {
  // 简化 ROI 法作为 IRR 近似
  if (form.investment <= 0) return 0
  const netProfit = myAnnual.value * form.years - form.investment
  return (netProfit / form.investment / form.years) * 100
})
const carbonYear = computed(() => form.savedEnergy * 0.581 / 1000)

const presets = ref([
  { name: '先导路标杆', savedEnergy: 1286000, investment: 820000, share: 70, years: 5, payback: 1.8, roi: 95.3 },
  { name: '麓谷产业园', savedEnergy: 682000, investment: 320000, share: 70, years: 5, payback: 1.1, roi: 148.6 },
  { name: '梅溪湖环湖路', savedEnergy: 426000, investment: 60000, share: 72, years: 5, payback: 0.3, roi: 386.5 }
])

function applyPreset(p) {
  Object.assign(form, { savedEnergy: p.savedEnergy, investment: p.investment, share: p.share, years: p.years, project: p.name })
  useWeighted.value = true
}
</script>

<style lang="scss" scoped>
.zg-energy-emc { padding: var(--zg-space-6); background: var(--zg-gradient-surface); min-height: calc(100vh - 120px); }
.zg-energy__head { display: flex; justify-content: space-between; align-items: center; padding-bottom: var(--zg-space-5); margin-bottom: var(--zg-space-4); border-bottom: 1px solid var(--zg-line-soft); }
.zg-energy__sigil { width: 44px; height: 44px; border-radius: var(--zg-radius-md); background: linear-gradient(135deg,#06b6d4,#6366f1); color: #fff; display: flex; align-items: center; justify-content: center; }
.zg-energy__headline { display: flex; gap: var(--zg-space-3); align-items: center; }
.zg-energy__copy h1 { margin: 0; font-size: var(--zg-text-display-md); font-weight: 700; }
.zg-energy__copy p { margin: 2px 0 0; font-size: var(--zg-text-body-sm); color: var(--zg-ink-tertiary); }

.zg-energy__main { display: grid; grid-template-columns: 460px 1fr; gap: var(--zg-space-4); }
.zg-energy__input-card, .zg-energy__output-card { background: var(--zg-surface-card); border: 1px solid var(--zg-line-soft); border-radius: var(--zg-radius-lg); padding: var(--zg-space-5); }
.zg-energy__input-card h3, .zg-energy__output-card h3 { margin: 0 0 var(--zg-space-4); font-size: var(--zg-text-body); font-weight: 600; display: flex; gap: 6px; align-items: center; }
.zg-energy__hint { margin-top: 4px; font-size: 12px; color: var(--zg-ink-tertiary); }

.zg-energy__presets { margin-top: var(--zg-space-4); padding-top: var(--zg-space-3); border-top: 1px dashed var(--zg-line-soft); }
.zg-energy__presets h4 { margin: 0 0 var(--zg-space-2); font-size: var(--zg-text-body-sm); font-weight: 600; }
.zg-energy__preset-row { display: flex; flex-direction: column; gap: 8px; }
.zg-energy__preset { padding: 10px 12px; border: 1px solid var(--zg-line-soft); border-radius: var(--zg-radius-md); cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: all .15s; &:hover { border-color: #06b6d4; background: rgba(6,182,212,0.06); } .name { font-weight: 600; font-size: 13px; } .meta { font-size: 12px; color: var(--zg-ink-tertiary); font-family: var(--zg-font-mono); } }

.zg-energy__result-banner { display: flex; gap: 6px; align-items: center; padding: 10px 14px; margin-bottom: var(--zg-space-4); background: linear-gradient(90deg, rgba(16,185,129,0.1), rgba(6,182,212,0.1)); border: 1px solid rgba(16,185,129,0.3); border-radius: var(--zg-radius-md); font-weight: 600; color: var(--zg-emerald-success); .zg-energy__live { margin-left: auto; padding: 2px 10px; border-radius: 10px; background: #10b981; color: #fff; font-size: 12px; font-family: var(--zg-font-mono); animation: breathe 1.5s infinite; } }
@keyframes breathe { 0%,100% { opacity: 1 } 50% { opacity: 0.5 } }

.zg-energy__result-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--zg-space-3); margin-bottom: var(--zg-space-4); }
.zg-energy__result-card { padding: var(--zg-space-3); border-radius: var(--zg-radius-md); border: 1px solid var(--zg-line-soft); position: relative; overflow: hidden; background: #fff; &::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; }
  &--emerald::before { background: linear-gradient(90deg,#10b981,#34d399); }
  &--cyan::before { background: linear-gradient(90deg,#06b6d4,#22d3ee); }
  &--indigo::before { background: linear-gradient(90deg,#6366f1,#818cf8); }
  &--amber::before { background: linear-gradient(90deg,#f59e0b,#fbbf24); }
  &--rose::before { background: linear-gradient(90deg,#ef4444,#f87171); }
  &--purple::before { background: linear-gradient(90deg,#a855f7,#c084fc); }
}
.zg-energy__result-lbl { font-size: 12px; color: var(--zg-ink-tertiary); }
.zg-energy__result-num { font-size: 18px; font-weight: 800; font-family: var(--zg-font-mono); margin: 4px 0; span { font-size: 13px; color: var(--zg-ink-secondary); margin-left: 2px; } }
.zg-energy__result-sub { font-size: 11px; color: var(--zg-ink-tertiary); }

.zg-energy__formula-card { background: var(--zg-surface-muted); border: 1px solid var(--zg-line-soft); border-radius: var(--zg-radius-md); padding: var(--zg-space-3); }
.zg-energy__formula-card h4 { margin: 0 0 var(--zg-space-2); font-size: var(--zg-text-body-sm); font-weight: 600; color: var(--zg-ink-secondary); }
.zg-energy__formula { font-size: 12px; padding: 4px 0; font-family: var(--zg-font-mono); color: var(--zg-ink-secondary); border-bottom: 1px dashed var(--zg-line-soft); &:last-child { border-bottom: none; } b { color: var(--zg-emerald-success); } }
</style>
