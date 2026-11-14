<!--
  智光云枢 · 电网知识库 · 施工工艺库
  业务域：gridKnowledge
  功能：图文步骤卡展示，含工艺名称、适用场景、编号步骤、注意事项、验收标准
-->
<template>
  <section class="zg-construction">
    <header class="zg-construction__head">
      <div class="zg-construction__headline">
        <div class="zg-construction__sigil">
          <el-icon :size="22"><Setting /></el-icon>
        </div>
        <div class="zg-construction__copy">
          <h1 class="zg-construction__title">施工工艺库</h1>
          <p class="zg-construction__sub">标准化施工工艺 · 图文步骤 · 注意事项 · 验收标准</p>
        </div>
      </div>
      <div class="zg-construction__cta">
        <el-button type="primary"><el-icon><Plus /></el-icon><span>新增工艺</span></el-button>
      </div>
    </header>

    <!-- 过滤工具栏 -->
    <div class="zg-filterband">
      <div class="zg-filterband__row">
        <el-input v-model="keyword" placeholder="搜索工艺名称 / 关键词" clearable style="width: 280px">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-select v-model="filterScene" placeholder="适用场景" style="width: 140px" clearable>
          <el-option v-for="s in sceneOptions" :key="s" :label="s" :value="s" />
        </el-select>
        <el-select v-model="filterLevel" placeholder="风险等级" style="width: 130px" clearable>
          <el-option label="一般风险" value="一般" />
          <el-option label="高风险" value="高" />
          <el-option label="极高风险" value="极高" />
        </el-select>
        <div class="zg-filterband__hint">共 {{ filteredProcesses.length }} 项工艺</div>
      </div>
    </div>

    <!-- 工艺卡片列表 -->
    <div class="zg-process-grid">
      <article v-for="(p, idx) in filteredProcesses" :key="p.id" class="zg-process-card"
        :class="{ 'is-expanded': expanded === idx }">
        <!-- 卡片头部 -->
        <header class="zg-process-card__head" @click="expanded = expanded === idx ? -1 : idx">
          <div class="zg-process-card__icon" :style="{ background: p.color }">
            <el-icon :size="22"><component :is="p.icon" /></el-icon>
          </div>
          <div class="zg-process-card__meta">
            <h3 class="zg-process-card__name">{{ p.name }}</h3>
            <p class="zg-process-card__scene">{{ p.scene }}</p>
          </div>
          <div class="zg-process-card__tags">
            <el-tag :type="riskTagType(p.risk)" size="small" effect="dark">{{ p.risk }}风险</el-tag>
            <span class="zg-process-card__version">v{{ p.version }}</span>
          </div>
        </header>

        <!-- 适用场景标签 -->
        <div class="zg-process-card__applications">
          <el-tag v-for="(a, i) in p.applications" :key="i" size="small" effect="plain">{{ a }}</el-tag>
        </div>

        <!-- 步骤列表（始终显示简版） -->
        <div class="zg-process-card__steps">
          <div class="zg-process-card__steps-title">
            <el-icon><List /></el-icon>步骤流程（{{ p.steps.length }}步）
          </div>
          <div class="zg-step-numbers">
            <div v-for="(s, i) in p.steps.slice(0, expanded === idx ? p.steps.length : 4)" :key="i"
              class="zg-step-number" :style="{ background: p.color }">
              {{ i + 1 }}
            </div>
            <template v-if="expanded !== idx && p.steps.length > 4">
              <span class="zg-step-more">+{{ p.steps.length - 4 }}</span>
            </template>
          </div>
        </div>

        <!-- 展开内容 -->
        <div v-if="expanded === idx" class="zg-process-card__detail">
          <!-- 详细步骤 -->
          <div class="zg-detail-section">
            <h4 class="zg-detail-section__title">
              <el-icon><Management /></el-icon>详细步骤
            </h4>
            <ol class="zg-step-detailed">
              <li v-for="(s, i) in p.steps" :key="i">
                <div class="zg-step-detailed__num" :style="{ background: p.color }">{{ i + 1 }}</div>
                <div class="zg-step-detailed__body">
                  <div class="zg-step-detailed__title">{{ s.title }}</div>
                  <div class="zg-step-detailed__desc">{{ s.desc }}</div>
                </div>
              </li>
            </ol>
          </div>

          <!-- 注意事项 -->
          <div class="zg-detail-section">
            <h4 class="zg-detail-section__title zg-detail-section__title--warn">
              <el-icon><Warning /></el-icon>注意事项（{{ p.warnings.length }}项）
            </h4>
            <ul class="zg-warning-list">
              <li v-for="(w, i) in p.warnings" :key="i">{{ w }}</li>
            </ul>
          </div>

          <!-- 验收标准 -->
          <div class="zg-detail-section">
            <h4 class="zg-detail-section__title zg-detail-section__title--success">
              <el-icon><CircleCheck /></el-icon>验收标准
            </h4>
            <ul class="zg-acceptance-list">
              <li v-for="(a, i) in p.acceptance" :key="i">
                <el-icon :size="14" class="text-emerald-500"><Check /></el-icon>
                <span>{{ a }}</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- 底部操作 -->
        <footer class="zg-process-card__footer" @click.stop>
          <el-button link type="primary" size="small">查看历史版本</el-button>
          <el-button link type="primary" size="small">导出PDF</el-button>
          <el-button link type="primary" size="small">编辑工艺</el-button>
          <el-button link type="primary" size="small">{{ expanded === idx ? '收起' : '展开全部 ▼' }}</el-button>
        </footer>
      </article>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Setting, Plus, Search, List, Management, Warning, CircleCheck, Check } from "@element-plus/icons-vue"

const keyword = ref('')
const filterScene = ref('')
const filterLevel = ref('')
const expanded = ref(-1)

const sceneOptions = ['电缆敷设', '箱变安装', '路灯施工', '接地工程', '控制柜安装', '调试试验', '改造升级']

// 工艺 mock - 6 条
const processes = ref([
  {
    id: 1, name: '电缆直埋敷设工艺', icon: 'Connection', version: '3.2', risk: '高',
    scene: '10kV / 0.4kV 电力电缆地埋敷设',
    color: 'linear-gradient(135deg,#0ea5e9,#0284c7)',
    applications: ['新建道路', '改造路段', '小区布线', '隧道电缆'],
    steps: [
      { title: '路径勘测定位', desc: '用地下管线探测仪确认地下原有管线位置，规划新电缆路径并在地面划线标记。' },
      { title: '沟槽开挖', desc: '人工或机械开挖，上口宽度 0.6m，下口 0.4m，深度 0.8-1.0m（车行道 ≥ 0.8m，人行道 ≥ 0.7m）。' },
      { title: '沟底处理', desc: '沟底铺 10cm 厚细沙并夯实，确保无硬物、碎石。' },
      { title: '电缆敷设', desc: '采用机械牵引或人工展放，电缆弯曲半径 ≥ 20D，每 5m 固定一次。' },
      { title: '铺沙盖砖', desc: '电缆上方再铺 10cm 细沙，加盖混凝土保护板（人行道用砖），板间留缝。' },
      { title: '回填土', desc: '分层回填夯实，每层 30cm，回填至比原地面高 5cm。' },
      { title: '标识桩设置', desc: '直线段每 50m、转角处、分支处埋设标识桩，标明电压等级和路径方向。' },
      { title: '竣工测绘归档', desc: '竣工后用 GPS 测绘电缆实际路径坐标，归档至管网系统。' }
    ],
    warnings: [
      '挖沟前必须查竣工图或进行管线探测，严禁盲目开挖破坏原有管线',
      '高压电缆与通信管线间距 ≥ 0.5m，交叉时用隔板隔离',
      '电缆接头处预留检查井，严禁接头埋入地下',
      '冬季低温敷设时注意电缆弯曲半径，防止绝缘开裂',
      '沟槽临边设置警示围栏和夜间警示灯'
    ],
    acceptance: [
      '电缆埋深 ≥ 0.7m（人行道）/ 0.8m（车行道）',
      '保护板覆盖完整，无漏铺',
      '标识桩位置准确、字迹清晰',
      '电缆绝缘电阻测试 ≥ 10MΩ（1kV 兆欧表）',
      '竣工图纸测绘偏差 ≤ ±30cm'
    ]
  },
  {
    id: 2, name: '箱变安装工艺', icon: 'House', version: '2.5', risk: '极高',
    scene: '预装式箱式变电站整体安装',
    color: 'linear-gradient(135deg,#ef4444,#dc2626)',
    applications: ['新建小区', '市政道路', '商业综合体', '工业园区'],
    steps: [
      { title: '基础施工', desc: '按基础图浇筑钢筋混凝土基础台，预埋件位置准确，基础顶面高出地面 20cm。' },
      { title: '接地装置施工', desc: '基础四角预埋接地极，接地体与箱体螺栓焊接，接地电阻 ≤ 4Ω。' },
      { title: '箱体吊装', desc: '用汽车吊整体吊装，专人指挥，缓慢平稳放置到基础台上。' },
      { title: '箱体找正紧固', desc: '水平仪检查箱体水平度，四角偏差 ≤ 3mm，紧固固定螺栓。' },
      { title: '高压进线连接', desc: '高压电缆终端头制作，连接到高压侧接线端子，力矩 50N·m。' },
      { title: '低压出线连接', desc: '低压电缆终端头制作，连接到低压侧母线，力矩 35N·m。' },
      { title: '一次/二次接线', desc: '按原理图完成保护回路、测量回路接线，线号正确、压接牢固。' },
      { title: '调试试验', desc: '保护定值整定、继电保护传动、断路器分合闸试验、变压器空载冲击合闸 5 次。' },
      { title: '空载试运行', desc: '空载运行 24 小时，观察油温、异响、渗漏，确认正常。' }
    ],
    warnings: [
      '高压侧操作必须遵守"两票三制"，有人监护',
      '吊装时箱体下方严禁站人，吊臂范围内设置警示',
      'SF6 气体箱变安装前检查气体压力，安装后检测检漏',
      '二次接线完成后必须核相，防止相序错误',
      '变压器冲击合闸顺序：由电源侧到负荷侧逐级送电'
    ],
    acceptance: [
      '箱体水平度偏差 ≤ 3mm',
      '接地电阻 ≤ 4Ω（TN-S 系统）',
      '保护定值误差 ≤ ±5%',
      '绝缘电阻：高压 ≥ 300MΩ，低压 ≥ 10MΩ',
      '空载试运行 24h 无异常',
      '出厂合格证、试验报告齐全'
    ]
  },
  {
    id: 3, name: '中低压电缆接头制作工艺', icon: 'Connection', version: '2.8', risk: '高',
    scene: 'YJV / YJV22 系列电力电缆中间接头、终端头制作',
    color: 'linear-gradient(135deg,#8b5cf6,#6366f1)',
    applications: ['电缆延长', '电缆分支', '箱变进线', '配电箱进线'],
    steps: [
      { title: '电缆预处理', desc: '校直电缆 200cm 范围，清洁外护套油污，套入接头主体和热缩管。' },
      { title: '外护套剥切', desc: '按工艺尺寸剥除外护套，留钢铠 20mm 用于接地，清理铠装毛刺。' },
      { title: '钢铠接地', desc: '剥出钢铠后用 25mm² 多股铜线缠绕 5 圈焊牢，另一端压接线耳接地。' },
      { title: '内护套填充', desc: '清理线芯绝缘层，套入内护套，填充绝缘胶带绕包至电缆护套外径。' },
      { title: '导体压接', desc: '两端导体对齐，使用对应规格铜管压接钳压接，每端压 3-4 道，打磨压接毛刺。' },
      { title: '绝缘恢复', desc: '热缩管加热收缩，先中间后两端，用热风枪均匀加热，无气泡、无烤焦。' },
      { title: '防水处理', desc: '接头两端缠绕自粘防水带各 50mm，再套热缩护套整体加热密封。' },
      { title: '电气试验', desc: '做工频耐压试验 2.5kV/5min（低压电缆），绝缘电阻 ≥ 10MΩ。' }
    ],
    warnings: [
      '压接钳六角模规格必须与导体匹配，禁止错用',
      '热缩管加热时注意距离，防止烤伤绝缘层或人员',
      '铜铝过渡必须用铜铝过渡接头，严禁铜铝直接连接',
      '接头应安装在检查井或穿管内，严禁直接埋地',
      '制作完成后待充分冷却（≥ 2h）再移动或送电'
    ],
    acceptance: [
      '绝缘电阻 ≥ 10MΩ（1kV 兆欧表）',
      '工频耐压试验通过，无击穿、无闪络',
      '接头外观无气泡、无破损、密封完好',
      '接地电阻 ≤ 4Ω',
      '制作人员持有效特种作业操作证'
    ]
  },
  {
    id: 4, name: '接地装置施工工艺', icon: 'Lightning', version: '1.8', risk: '一般',
    scene: 'TN-S / TT 系统接地体、接地网施工',
    color: 'linear-gradient(135deg,#10b981,#059669)',
    applications: ['新建小区', '道路照明', '箱变接地', '机房接地', '防雷接地'],
    steps: [
      { title: '接地极定位放线', desc: '按设计图确定垂直接地极位置，一般间距 5m，距建筑物 ≥ 3m。' },
      { title: '垂直接地体敷设', desc: '用 50×50×5 角钢或 Φ50×4 钢管，长度 2.5m，垂直打入地下，顶端距地面 0.6m。' },
      { title: '水平接地体敷设', desc: '用 -40×4 或 -60×6 镀锌扁钢，埋深 ≥ 0.6m，与垂直接地体三面焊接。' },
      { title: '接地网焊接', desc: '焊接面 ≥ 3 倍扁钢宽度，三面施焊，焊点做沥青漆防腐处理。' },
      { title: '引出线制作', desc: '从接地网适当位置引出至测试井，使用 -40×4 镀锌扁钢，高出地面 0.15m。' },
      { title: '测试井砌筑', desc: '砖砌测试井，上方覆盖铸铁盖板，标注"接地测试井"。' },
      { title: '接地电阻测试', desc: '用接地电阻测试仪测量，要求 TN-S ≤ 4Ω，TT ≤ 30Ω。' },
      { title: '回填土并标识', desc: '分层夯实回填，设置接地路径标识。' }
    ],
    warnings: [
      '垂直接地极打入时注意周围地下管线',
      '焊接必须使用镀锌焊条，防止锈蚀',
      '测试前断开接地网与所有设备连接',
      '高土壤电阻率地区可使用降阻剂或深孔接地',
      '雨雪天不宜做接地电阻测试'
    ],
    acceptance: [
      '垂直接地体长度 ≥ 2.5m',
      '水平接地体埋深 ≥ 0.6m',
      '焊接长度 ≥ 3×b（b 为扁钢宽度）',
      '接地电阻满足设计要求',
      '接地测试井位置正确、标识清晰'
    ]
  },
  {
    id: 5, name: 'LED 灯具安装调试工艺', icon: 'Lightbulb', version: '2.3', risk: '一般',
    scene: '城市照明 LED 灯具新装 / 更换 / 调试',
    color: 'linear-gradient(135deg,#f59e0b,#d97706)',
    applications: ['道路改造', '新建道路', '小区照明', '隧道照明'],
    steps: [
      { title: '灯具开箱检查', desc: '核对型号规格，检查外观有无破损，铭牌参数符合设计要求。' },
      { title: '灯具组装', desc: '组装灯具与灯杆法兰，紧固力矩 30N·m，密封圈安装到位。' },
      { title: '接线端子连接', desc: 'L/N/PE 三相色标正确（棕/蓝/黄绿），端子压接牢固。' },
      { title: '防水密封', desc: '接线口缠绕自粘防水带，电缆入口加防水堵头。' },
      { title: '灯杆高空作业', desc: '高空作业车升至安装高度，系安全带，灯具挂装并对准法兰孔。' },
      { title: '紧固安装并接线', desc: '高空紧固法兰螺栓（8.8 级 M12×40），在灯杆内接好电缆。' },
      { title: '智能模块配对', desc: '安装 ZGSQ-CTRL-V5 智能控制器，通过蓝牙 APP 扫码配对，设置地址。' },
      { title: '单灯调试', desc: '远程下发开关命令、调光命令，确认灯具正常响应。' },
      { title: '批量联动调试', desc: '分时段自动开关、调光方案下发，灯具组动作一致无延迟。' }
    ],
    warnings: [
      '高空作业必须戴安全帽、系安全带，地面设警示',
      '灯具安装高度 ≥ 6m 时严禁从地面抛掷工具',
      '控制器配对前断电，安装完成后再通电测试',
      '接线时严格执行"先验电后作业"规程',
      '雷雨天气严禁户外高空作业'
    ],
    acceptance: [
      '灯具垂直度偏差 ≤ 2°',
      '防水等级 IP65 合格',
      '照度值偏差 ≤ ±10%',
      '智能控制器在线率 ≥ 99%',
      '调光响应延迟 ≤ 1s',
      '接地电阻 ≤ 4Ω（TN-S 系统）'
    ]
  },
  {
    id: 6, name: '断路器更换工艺', icon: 'Switch', version: '1.5', risk: '高',
    scene: '低压塑壳 / 微型断路器故障更换',
    color: 'linear-gradient(135deg,#22c55e,#16a34a)',
    applications: ['配电箱维修', '故障更换', '升级改造'],
    steps: [
      { title: '停电验电', desc: '断开上级电源，验电器确认低压侧无电后挂牌上锁。' },
      { title: '脱扣测试', desc: '对故障断路器按 T 按钮测试，确认故障后再更换。' },
      { title: '拆旧接线', desc: '螺丝刀松开接线端子，卸下断路器，注意铜线不要碰及相邻带电体。' },
      { title: '核对规格型号', desc: '确认新断路器额定电流、极数、脱扣曲线与原开关一致。' },
      { title: '安装新断路器', desc: '导轨安装，压紧接线端子（4 平方线力矩 12N·m）。' },
      { title: '二次接线恢复', desc: '如带失压脱扣或辅助触点，恢复相应控制线。' },
      { title: '手动操作试验', desc: '手动分合闸 3 次，确认动作可靠，指示正确。' },
      { title: '送电试运行', desc: '确认无异常后逐级送电，观察负载运行正常。' }
    ],
    warnings: [
      '必须执行"两票三制"，高压侧严禁带电作业',
      '拆下的铜线用绝缘胶带包裹，防止短路',
      '更换 MCB 时注意导轨夹紧装置',
      '更换 MCCB 时注意铜排对准，防止接触不良',
      '送电前确认箱内无遗留工具和杂物'
    ],
    acceptance: [
      '额定电流、极数、脱扣曲线与设计一致',
      '手动分合闸 10 次动作可靠',
      '辅助触点 / 脱扣线圈动作正确',
      '接线力矩达标，无松动、无氧化',
      '负载试运 30 分钟无异常发热'
    ]
  }
])

const filteredProcesses = computed(() => {
  return processes.value.filter(p => {
    const matchKw = !keyword.value.trim() ||
      p.name.includes(keyword.value) ||
      p.scene.includes(keyword.value) ||
      p.applications.some(a => a.includes(keyword.value))
    const matchScene = !filterScene.value || p.applications.includes(filterScene.value) || p.scene.includes(filterScene.value)
    const matchLevel = !filterLevel.value || p.risk === filterLevel.value
    return matchKw && matchScene && matchLevel
  })
})

function riskTagType(r) {
  if (r === '极高') return 'danger'
  if (r === '高') return 'warning'
  return 'info'
}
</script>

<style scoped lang="scss">
.zg-construction {
  padding: 24px;
  &__head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 18px; padding-bottom: 18px; border-bottom: 1px solid #e2e8f0; }
  &__headline { display: flex; align-items: center; gap: 14px; }
  &__sigil { width: 44px; height: 44px; border-radius: 10px; background: linear-gradient(135deg, #10b981, #059669); color: #fff; display: flex; align-items: center; justify-content: center; }
  &__copy { display: flex; flex-direction: column; gap: 4px; }
  &__title { font-size: 20px; font-weight: 600; margin: 0; color: #18181b; }
  &__sub { font-size: 13px; color: #71717a; margin: 0; }
  &__cta { display: flex; gap: 10px; }
}

.zg-filterband {
  padding: 14px 16px; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 18px;
  &__row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
  &__hint { margin-left: auto; font-size: 12px; color: #71717a; }
}

.zg-process-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(420px, 1fr)); gap: 18px;
}

.zg-process-card {
  background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 18px;
  display: flex; flex-direction: column; gap: 12px;
  transition: all 0.25s;
  &.is-expanded { box-shadow: 0 12px 32px -12px rgba(15,23,42,0.2); border-color: #6366f1; }
  &__head { display: flex; gap: 12px; align-items: center; cursor: pointer; }
  &__icon { width: 44px; height: 44px; border-radius: 10px; color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  &__meta { flex: 1; min-width: 0; }
  &__name { font-size: 16px; font-weight: 700; color: #18181b; margin: 0; }
  &__scene { font-size: 12px; color: #71717a; margin: 2px 0 0; }
  &__tags { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
  &__version { font-family: ui-monospace, monospace; font-size: 11px; color: #94a3b8; }
  &__applications { display: flex; flex-wrap: wrap; gap: 6px; }
  &__steps { background: #f8fafc; border-radius: 10px; padding: 10px 14px; }
  &__steps-title { font-size: 12px; font-weight: 600; color: #52525b; display: flex; align-items: center; gap: 6px; margin-bottom: 10px; }
  &__footer { display: flex; gap: 4px; justify-content: flex-end; padding-top: 10px; border-top: 1px dashed #e2e8f0; flex-wrap: wrap; }
}

.zg-step-numbers { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.zg-step-number {
  width: 28px; height: 28px; border-radius: 50%; color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700; flex-shrink: 0;
}
.zg-step-more { font-size: 12px; color: #6366f1; font-weight: 600; }

.zg-process-card__detail {
  border-top: 1px solid #e2e8f0; padding-top: 12px;
  display: flex; flex-direction: column; gap: 16px;
}

.zg-detail-section__title {
  display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: #52525b;
  margin: 0 0 10px; padding-bottom: 8px; border-bottom: 1px solid #f1f5f9;
  &--warn { color: #b45309; border-bottom-color: #fef3c7; }
  &--success { color: #047857; border-bottom-color: #d1fae5; }
}

.zg-step-detailed {
  list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px;
}
.zg-step-detailed li {
  display: flex; gap: 10px; padding: 8px 12px; background: #f8fafc; border-radius: 8px;
}
.zg-step-detailed__num {
  width: 26px; height: 26px; border-radius: 50%; color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; flex-shrink: 0;
}
.zg-step-detailed__body { flex: 1; }
.zg-step-detailed__title { font-size: 13px; font-weight: 600; color: #18181b; margin-bottom: 2px; }
.zg-step-detailed__desc { font-size: 12px; color: #52525b; line-height: 1.5; }

.zg-warning-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px;
  li { font-size: 12px; color: #52525b; padding: 6px 10px; background: #fef3c7; border-left: 3px solid #f59e0b; border-radius: 4px; line-height: 1.5; }
}

.zg-acceptance-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px;
  li { display: flex; align-items: flex-start; gap: 6px; font-size: 12px; color: #52525b; padding: 6px 10px; background: #d1fae5; border-radius: 4px; line-height: 1.5; }
}

.text-emerald-500 { color: #10b981; flex-shrink: 0; margin-top: 2px; }
</style>
