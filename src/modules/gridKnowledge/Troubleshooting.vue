<!--
  智光云枢 · 电网知识库 · 故障处置知识库
  业务域：gridKnowledge
  功能：故障树结构化展示，每条步骤可展开详情，含可能原因、处置方案、关联工具
-->
<template>
  <section class="zg-troubleshoot">
    <header class="zg-troubleshoot__head">
      <div class="zg-troubleshoot__headline">
        <div class="zg-troubleshoot__sigil">
          <el-icon :size="22"><Warning /></el-icon>
        </div>
        <div class="zg-troubleshoot__copy">
          <h1 class="zg-troubleshoot__title">故障处置知识库</h1>
          <p class="zg-troubleshoot__sub">故障树结构化排查 · 根因分析 · 处置方案 · 历史案例沉淀</p>
        </div>
      </div>
      <div class="zg-troubleshoot__cta">
        <el-input v-model="keyword" placeholder="搜索故障现象 / 代码" clearable style="width: 260px">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-button type="primary"><el-icon><Plus /></el-icon><span>新增故障树</span></el-button>
      </div>
    </header>

    <!-- 故障树列表 -->
    <div class="zg-fault-list">
      <article v-for="fault in filteredFaults" :key="fault.id" class="zg-fault-card">
        <!-- 头部：故障现象 -->
        <header class="zg-fault-card__head">
          <div class="zg-fault-card__phenomenon">
            <div class="zg-fault-card__code">{{ fault.code }}</div>
            <h3 class="zg-fault-card__name">{{ fault.name }}</h3>
          </div>
          <div class="zg-fault-card__stats">
            <div class="zg-stat-chip zg-stat-chip--total">
              <span class="zg-stat-chip__num">{{ fault.cases }}</span>
              <span class="zg-stat-chip__lbl">累计案例</span>
            </div>
            <div class="zg-stat-chip zg-stat-chip--success">
              <span class="zg-stat-chip__num">{{ fault.success }}</span>
              <span class="zg-stat-chip__lbl">成功处置</span>
            </div>
            <div class="zg-stat-chip zg-stat-chip--rate">
              <span class="zg-stat-chip__num">{{ Math.round(fault.success / fault.cases * 100) }}%</span>
              <span class="zg-stat-chip__lbl">成功率</span>
            </div>
          </div>
        </header>

        <!-- 可能原因 -->
        <div class="zg-fault-card__cause">
          <div class="zg-section-label">
            <el-icon><Warning /></el-icon><span>可能原因</span>
          </div>
          <div class="zg-cause-tags">
            <el-tag v-for="(c, i) in fault.possibleCauses" :key="i" type="danger" effect="plain" size="small">
              {{ c }}
            </el-tag>
          </div>
        </div>

        <!-- 故障树：排查步骤 -->
        <div class="zg-fault-tree">
          <div class="zg-section-label">
            <el-icon><Connection /></el-icon><span>排查步骤（故障树）</span>
          </div>

          <div class="zg-step-list">
            <div v-for="(step, idx) in fault.steps" :key="idx" class="zg-step"
              :class="{ 'is-expanded': expandedSteps.includes(fault.id + '-' + idx) }">
              <div class="zg-step__header" @click="toggleStep(fault.id, idx)">
                <div class="zg-step__num">{{ String(idx + 1).padStart(2, '0') }}</div>
                <div class="zg-step__title">{{ step.title }}</div>
                <el-icon class="zg-step__arrow" :class="{ 'is-open': expandedSteps.includes(fault.id + '-' + idx) }">
                  <ArrowDown />
                </el-icon>
              </div>
              <div v-if="expandedSteps.includes(fault.id + '-' + idx)" class="zg-step__detail">
                <div class="zg-step__content">{{ step.detail }}</div>
                <div class="zg-step__solution">
                  <span class="zg-step__solution-label">处置方案：</span>
                  {{ step.solution }}
                </div>
                <div class="zg-step__tools">
                  <el-tag v-for="t in step.tools" :key="t" size="small" effect="plain">
                    <el-icon class="mr-1"><Tools /></el-icon>{{ t }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 关联工具 -->
        <footer class="zg-fault-card__footer">
          <span class="zg-fault-card__tools-lbl">常用工具：</span>
          <el-tag v-for="t in fault.commonTools" :key="t" size="small" effect="light">{{ t }}</el-tag>
          <el-button link type="primary" size="small" class="ml-auto">查看全部案例 →</el-button>
        </footer>
      </article>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Warning, Search, Plus, Connection, ArrowDown, Tools } from "@element-plus/icons-vue"

const keyword = ref('')
const expandedSteps = ref([])

function toggleStep(faultId, stepIdx) {
  const key = faultId + '-' + stepIdx
  const idx = expandedSteps.value.indexOf(key)
  if (idx >= 0) expandedSteps.value.splice(idx, 1)
  else expandedSteps.value.push(key)
}

// 故障树 mock - 6 条（每条有 5-7 步详细排查步骤）
const faultTree = ref([
  {
    id: 1, code: 'ELEC-001', name: '电缆接头发热/烧蚀',
    possibleCauses: ['接触电阻过大', '螺栓松动', '氧化腐蚀', '负荷过载', '未做导电膏'],
    cases: 48, success: 47,
    commonTools: ['红外热像仪', '力矩扳手', '导电膏', '砂纸'],
    steps: [
      { title: '红外测温定位发热接头', detail: '使用红外热像仪在非接触状态下扫描电缆接头区域，记录热点位置和温度值，正常温度应 ≤ 70℃，超过 90℃ 为异常。', solution: '标记发热点，安排停电检修计划。', tools: ['红外热像仪', '测温枪'] },
      { title: '停电验电挂牌上锁', detail: '断开该接头所在回路断路器，验电笔确认无电后挂"禁止合闸"标志牌并上锁，钥匙由操作人保管。', solution: '严格执行停电→验电→挂牌→上锁安全规程。', tools: ['验电器', '标志牌'] },
      { title: '拆开接头检查', detail: '拆开电缆接头绝缘层和密封，检查导体接触面是否有氧化发黑、烧蚀痕迹，检查螺栓力矩是否达标（铜铝过渡 50N·m）。', solution: '清除氧化层，更换烧蚀部件。', tools: ['力矩扳手', '螺丝刀组'] },
      { title: '打磨接触面、涂导电膏', detail: '用细砂纸打磨导体接触面至露出金属光泽，均匀涂抹导电膏（厚度约 0.5mm），注意涂抹范围不超出接触面。', solution: '保证接触电阻 ≤ 20μΩ。', tools: ['细砂纸', '导电膏'] },
      { title: '按要求力矩紧固', detail: '对角均匀紧固螺栓，达到规定力矩后再回松 1/4 圈再复紧，确保压力均匀。', solution: '记录紧固力矩值，存档备查。', tools: ['力矩扳手'] },
      { title: '恢复绝缘防护', detail: '半叠绕包自粘防水胶带 2 层，热缩护套加热收缩，外层缠绕绝缘胶带，最后恢复电缆井/线槽。', solution: '绝缘电阻测试 ≥ 10MΩ。', tools: ['热缩套管', '绝缘胶带'] },
      { title: '工频耐压试验并送电观察', detail: '接头制作完成后做工频耐压试验 2.5kV/5min，合格后送电运行 30 分钟，红外复测温度正常。', solution: '记录试验数据，归档。', tools: ['耐压测试仪', '兆欧表'] }
    ]
  },
  {
    id: 2, code: 'ELEC-002', name: '单相接地故障跳闸',
    possibleCauses: ['电缆绝缘破损碰外壳', '设备外壳带电', '互感器故障', '误碰外壳'],
    cases: 26, success: 25,
    commonTools: ['兆欧表', '跨步电压探测器', '电缆故障测试仪', '万用表'],
    steps: [
      { title: '确认故障类型', detail: '查看断路器面板故障指示，用万用表测三相对地电压，单相接地时故障相电压降低、非故障相升高。', solution: '判定是否真接地，排除仪表误报。', tools: ['万用表'] },
      { title: '断开支路定位故障段', detail: '分段断开馈线各支路，每断开一支路后合总开关试送，找到引起跳闸的故障支路。', solution: '缩小故障范围。', tools: ['断路器操作手柄'] },
      { title: '绝缘电阻测试', detail: '断开故障支路所有负荷，用 500V 兆欧表测相线对地绝缘电阻，指针归零或接近零即为接地点在该段。', solution: '绝缘电阻 ≥ 10MΩ 为正常。', tools: ['兆欧表 500V'] },
      { title: '跨步电压法精确定位', detail: '沿故障电缆路径用跨步电压探测器移动，当探测器读数突变处即为接地点，精度可达 ±30cm。', solution: '标记故障点地面位置。', tools: ['跨步电压探测器'] },
      { title: '地面开挖确认故障点', detail: '在标记位置人工开挖，确认电缆破损位置和破损程度，拍照记录。', solution: '设置安全围栏。', tools: ['开挖工具组'] },
      { title: '故障段隔离切除', detail: '切除破损电缆段，制作中间接头，确保两端绝缘完好且长度充足。', solution: '中间接头预留 20cm 余量。', tools: ['电缆剪', '剥线钳'] },
      { title: '绝缘恢复 + 耐压试验', detail: '按中间接头制作工艺恢复绝缘，做工频耐压 2.5kV/5min，合格后回填并测绝缘确认。', solution: '归档接头位置和测试数据。', tools: ['耐压测试仪', '热缩套管'] }
    ]
  },
  {
    id: 3, code: 'ELEC-003', name: '照明支路漏电保护器频繁跳闸',
    possibleCauses: ['线路绝缘下降', '灯具进水漏电', '保护参数配置过大', '保护器本身故障', '负荷侧有接地故障'],
    cases: 32, success: 31,
    commonTools: ['钳形漏电流表', '兆欧表', '万用表', '试灯'],
    steps: [
      { title: '确认跳闸情况', detail: '记录跳闸时运行状态：时间、天气（雨天/晴天）、负载情况，用钳形漏电流表测正常运行时的漏电流值。', solution: '区分间歇性还是持续性。', tools: ['钳形漏电流表'] },
      { title: '分段排除法定位', detail: '在支路末端逐步断开灯具分组，每断开一组试合保护器，直到找到引起跳闸的具体灯具或段。', solution: '一次断开一组，缩小范围。', tools: ['螺丝刀', '电工胶布'] },
      { title: '绝缘检查故障灯具', detail: '拆开故障灯具接线，用兆欧表测相线与灯具外壳之间绝缘电阻，判断是否内部漏电。', solution: '灯具内部绝缘 ≥ 5MΩ。', tools: ['兆欧表 500V'] },
      { title: '检查线路绝缘', detail: '断开所有灯具，测整段线路对地绝缘电阻，若仍偏低则为电缆或接线盒故障。', solution: '重点检查接线盒进水、破损处。', tools: ['兆欧表'] },
      { title: '修复故障点', detail: '更换进水灯具 / 包扎破损线缆 / 清理接线盒积水，确保绝缘恢复。', solution: '测试绝缘合格再装回。', tools: ['防水胶带', '自粘防水条'] },
      { title: '保护器测试', detail: '按 T 按钮测试漏电保护器动作功能，确认动作电流 30mA、动作时间 ≤ 0.3s。', solution: '若不动作则更换保护器。', tools: ['漏保测试仪'] }
    ]
  },
  {
    id: 4, code: 'CTRL-001', name: '智能控制器离线/频繁重启',
    possibleCauses: ['电源电压异常', '散热不良过热', '固件版本bug', '内存溢出', '通讯线松动', '硬件故障'],
    cases: 19, success: 18,
    commonTools: ['万用表', '示波器', '串口调试工具', '升级工具'],
    steps: [
      { title: '检查输入电源电压', detail: '万用表测控制器 L/N 端电压，正常应在 220V±10%，过低或过高均可能导致异常。', solution: '排查前端供电。', tools: ['万用表'] },
      { title: '测量工作电流和温度', detail: '用钳形电流表测工作电流是否异常偏大，触摸外壳或用红外测温确认是否过热（正常 ≤ 55℃）。', solution: '过热则清理散热。', tools: ['钳形电流表', '红外测温枪'] },
      { title: '查看日志分析', detail: '连接串口或导出日志文件，查找重启原因、报错代码、内存/CPU使用情况记录。', solution: '定位问题根因。', tools: ['串口工具', 'FTP'] },
      { title: '固件升级验证', detail: '下载最新稳定版固件，按官方教程升级，升级后观察 24 小时是否仍异常。', solution: '备份原固件可回退。', tools: ['固件升级工具'] },
      { title: '检查通讯链路', detail: '检查 NBIoT / 4G / RS485 通讯模块信号强度、天线连接、SIM 卡状态。', solution: '信号强度 ≥ -90dBm。', tools: ['信号测试 App'] },
      { title: '硬件故障排查/更换', detail: '若以上均排除，大概率为 CPU 板或电源板故障，需整体更换控制器。', solution: '送厂返修或更换备品。', tools: ['备用控制器'] }
    ]
  },
  {
    id: 5, code: 'LAMP-001', name: 'LED 灯具整灯不亮/间歇性闪烁',
    possibleCauses: ['驱动电源故障', '光源板损坏', '接线端子松脱', '输入电压异常', '地线干扰'],
    cases: 54, success: 53,
    commonTools: ['万用表', 'LED 测试仪', '热像仪', '螺丝刀'],
    steps: [
      { title: '测输入电压', detail: '接线端子处测 L/N 电压是否正常，排除前端供电问题。', solution: '电压正常则往灯具内部排查。', tools: ['万用表'] },
      { title: '测驱动电源输出', detail: '驱动电源输出端测 DC 电压（常见 12V/24V/48V），无输出或输出不稳则驱动损坏。', solution: '更换驱动电源。', tools: ['万用表 DC 档'] },
      { title: '拆壳检查光源板', detail: '拆开灯具外壳，目视检查光源板灯珠是否发黑、烧毁、锡焊虚焊。', solution: '发黑则整板更换。', tools: ['一字螺丝刀'] },
      { title: 'LED 测试仪检测', detail: '用 LED 测试仪逐颗测试灯珠正反向导通特性，异常灯珠导致串联回路不亮。', solution: '整板更换效率更高。', tools: ['LED 测试仪'] },
      { title: '排除接线松动', detail: '检查输入端子、驱动输出端子、光源板连接器是否松动、氧化、接触不良。', solution: '紧固 / 打磨氧化层。', tools: ['螺丝刀组', '细砂纸'] },
      { title: '地线干扰排查', detail: '若接地不良或与其他零线共地干扰，可能导致闪烁。用万用表测 L-G、N-G 电压。', solution: '修正接地方式。', tools: ['万用表'] }
    ]
  },
  {
    id: 6, code: 'TXT-001', name: '箱变变压器油位异常/油温告警',
    possibleCauses: ['散热器堵塞', '负载过载', '温控器误报', '缺油/漏油', '风机故障'],
    cases: 22, success: 21,
    commonTools: ['油位计', '红外测温仪', '温控测试仪', '油泵'],
    steps: [
      { title: '现场确认告警真实性', detail: '到现场看油位计实际油位、听运行声音、用红外测油温，确认是否真实告警还是远程误报。', solution: '排除温控模块误报。', tools: ['红外测温枪'] },
      { title: '检查负载电流', detail: '用钳形电流表测低压侧三相电流，计算负载率（额定 800kVA 的 10kV/0.4kV 变额定电流约 1155A）。', solution: '夏季高峰负载率 ≤ 85%。', tools: ['钳形电流表'] },
      { title: '检查散热器和风机', detail: '手摸散热器各散热片温度是否均匀，风机是否正常运转（风量足、无异响），翅片是否积尘堵塞。', solution: '清理积尘 / 更换风机。', tools: ['毛刷', '扳手'] },
      { title: '检查油位和油质', detail: '看油位计油位是否在正常范围（20-80%），观察油色是否发黑、有无悬浮物、有无渗漏痕迹。', solution: '缺油则补加同牌号变压器油。', tools: ['油样瓶'] },
      { title: '温控器参数校准', detail: '测试温控器设定值与实际油温对比，确认启动温度、报警温度设定是否正确。', solution: '夏季调高启动温度 5℃。', tools: ['温控测试仪'] },
      { title: '油泵/强油循环检查', detail: '强油循环风冷型检查油泵运转、油流继电器动作，确认油循环通畅无堵塞。', solution: '检查油过滤器。', tools: ['油泵测试台'] }
    ]
  }
])

const filteredFaults = computed(() => {
  if (!keyword.value.trim()) return faultTree.value
  const kw = keyword.value.trim().toLowerCase()
  return faultTree.value.filter(f => f.name.includes(keyword.value) || f.code.toLowerCase().includes(kw))
})
</script>

<style scoped lang="scss">
.zg-troubleshoot {
  padding: 24px;
  &__head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 18px; padding-bottom: 18px; border-bottom: 1px solid #e2e8f0; }
  &__headline { display: flex; align-items: center; gap: 14px; }
  &__sigil { width: 44px; height: 44px; border-radius: 10px; background: linear-gradient(135deg, #f59e0b, #ef4444); color: #fff; display: flex; align-items: center; justify-content: center; }
  &__copy { display: flex; flex-direction: column; gap: 4px; }
  &__title { font-size: 20px; font-weight: 600; margin: 0; color: #18181b; }
  &__sub { font-size: 13px; color: #71717a; margin: 0; }
  &__cta { display: flex; gap: 10px; align-items: center; }
}

.zg-fault-list { display: flex; flex-direction: column; gap: 20px; }

.zg-fault-card {
  background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px;
  border-left: 4px solid #f59e0b;

  &__head { display: flex; justify-content: space-between; gap: 16px; margin-bottom: 16px; padding-bottom: 14px; border-bottom: 1px dashed #e2e8f0; }
  &__phenomenon { display: flex; flex-direction: column; gap: 4px; }
  &__code { font-family: ui-monospace, monospace; font-size: 12px; color: #94a3b8; font-weight: 600; }
  &__name { font-size: 18px; font-weight: 700; color: #18181b; margin: 0; }
  &__stats { display: flex; gap: 10px; }
  &__cause { margin-bottom: 16px; }
  &__tools-lbl { font-size: 12px; color: #71717a; margin-right: 6px; }
  &__footer { display: flex; align-items: center; gap: 8px; padding-top: 12px; border-top: 1px solid #e2e8f0; flex-wrap: wrap; }
}

.zg-stat-chip {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 6px 14px; border-radius: 8px; min-width: 60px;
  &--total { background: #f1f5f9; }
  &--success { background: #d1fae5; }
  &--rate { background: #ede9fe; }
  &__num { font-size: 18px; font-weight: 700; color: #18181b; }
  &__lbl { font-size: 11px; color: #71717a; }
}

.zg-section-label {
  display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: #52525b; margin-bottom: 10px;
}

.zg-cause-tags { display: flex; flex-wrap: wrap; gap: 6px; }

.zg-fault-tree { margin-bottom: 16px; }
.zg-step-list { display: flex; flex-direction: column; gap: 6px; }
.zg-step {
  border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;
  &.is-expanded { border-color: #6366f1; background: #faf9ff; }
}
.zg-step__header {
  display: flex; align-items: center; gap: 12px; padding: 10px 14px; cursor: pointer;
  transition: background 0.15s;
  &:hover { background: #f8fafc; }
}
.zg-step__num {
  font-family: ui-monospace, monospace; font-size: 14px; font-weight: 700;
  width: 32px; height: 32px; border-radius: 50%; background: #ede9fe; color: #6366f1;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.zg-step__title { flex: 1; font-size: 14px; font-weight: 500; color: #18181b; }
.zg-step__arrow { color: #94a3b8; transition: transform 0.2s;
  &.is-open { transform: rotate(180deg); }
}
.zg-step__detail {
  padding: 12px 14px; border-top: 1px solid #e2e8f0; background: #faf9ff;
  display: flex; flex-direction: column; gap: 10px;
}
.zg-step__content { font-size: 13px; color: #475569; line-height: 1.6; }
.zg-step__solution { font-size: 13px; color: #047857; background: #d1fae5; padding: 8px 12px; border-radius: 6px;
  &-label { font-weight: 600; margin-right: 4px; }
}
.zg-step__tools { display: flex; flex-wrap: wrap; gap: 6px; }

.mr-1 { margin-right: 4px; }
.ml-auto { margin-left: auto; }
</style>
