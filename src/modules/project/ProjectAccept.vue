<!--
  智光云枢 · 工程项目管理 · 验收与结项
  卡片列表 + 验收表 + 结项归档
  关联 gridKnowledge/Drawings 竣工图纸
-->
<template>
  <section class="zg-pj-accept">
    <header class="zg-pj-accept__head">
      <div class="zg-pj-accept__headline">
        <div class="zg-pj-accept__sigil"><el-icon :size="22"><CircleCheck /></el-icon></div>
        <div class="zg-pj-accept__copy">
          <h1 class="zg-pj-accept__title">验收与结项</h1>
          <p class="zg-pj-accept__sub">
            竣工验收管理 · {{ acceptList.length }} 项 ·
            待验收 {{ kpiAgg.pending }} ·
            验收中 {{ kpiAgg.accepting }} ·
            已通过 {{ kpiAgg.passed }} ·
            整改中 {{ kpiAgg.rectify }}
          </p>
        </div>
      </div>
    </header>

    <!-- 筛选条 -->
    <div class="zg-pj-accept__filterbar">
      <div class="zg-filter-row">
        <div class="zg-filter-item">
          <span class="zg-filter-item__lbl">验收状态</span>
          <el-radio-group v-model="activeStatus" size="default">
            <el-radio-button value="all">全部</el-radio-button>
            <el-radio-button value="pending">待验收</el-radio-button>
            <el-radio-button value="accepting">验收中</el-radio-button>
            <el-radio-button value="passed">已通过</el-radio-button>
            <el-radio-button value="rectify">整改中</el-radio-button>
          </el-radio-group>
        </div>
        <div class="zg-filter-item zg-filter-item--actions">
          <el-input v-model="keyword" placeholder="搜索项目名称/编号" clearable style="width:240px">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </div>
      </div>
    </div>

    <!-- 验收项目卡片 -->
    <div class="zg-pj-accept__cards">
      <article v-for="p in filteredList" :key="p.id"
        class="zg-pj-accept__card"
        :class="'zg-pj-accept__card--' + p.statusKey"
        @click="onSelect(p)">
        <div class="zg-pj-accept__cardhead">
          <span class="zg-pj-accept__code">{{ p.code }}</span>
          <span class="zg-pj-accept__status" :class="'zg-pj-accept__status--' + p.statusKey">
            <i class="dot"></i>{{ p.statusLabel }}
          </span>
        </div>
        <h3 class="zg-pj-accept__cardtitle">{{ p.name }}</h3>
        <div class="zg-pj-accept__cardmeta">
          <div class="zg-pj-accept__metaitem">
            <el-icon><User /></el-icon>
            <span>验收组长：{{ p.acceptLead }}</span>
          </div>
          <div class="zg-pj-accept__metaitem">
            <el-icon><Calendar /></el-icon>
            <span>验收日期：{{ p.acceptDate || '—' }}</span>
          </div>
          <div class="zg-pj-accept__metaitem">
            <el-icon><School /></el-icon>
            <span>乙方：{{ p.contractorShort }}</span>
          </div>
        </div>
        <div v-if="p.summary" class="zg-pj-accept__cardsummary">{{ p.summary }}</div>
        <div class="zg-pj-accept__cardfoot">
          <el-tag v-if="p.score != null" :type="scoreTagType(p.score)" effect="dark" size="small">
            验收评分 {{ p.score }}
          </el-tag>
          <el-button v-if="currentSelected?.id !== p.id" type="primary" size="small" plain>查看详情</el-button>
          <el-button v-else type="primary" size="small">当前选中</el-button>
        </div>
      </article>
    </div>

    <!-- 验收详情区 -->
    <div v-if="currentSelected" class="zg-pj-accept__detail">
      <el-tabs v-model="activeDetailTab">
        <el-tab-pane label="验收表" name="sheet">
          <div class="zg-pj-accept__sheet">
            <div class="zg-pj-accept__sheet-head">
              <h4><el-icon><Document /></el-icon>分项验收清单 · {{ currentSelected.name }}</h4>
              <el-tag :type="resultTagType(currentSelected.conclusion)" effect="dark">
                结论：{{ currentSelected.conclusion }}
              </el-tag>
            </div>

            <!-- 分项表格 -->
            <el-table :data="currentSelected.items" border stripe style="margin-bottom:18px">
              <el-table-column prop="category" label="分项工程" width="140" fixed="left" />
              <el-table-column prop="name" label="验收项目" min-width="180" show-overflow-tooltip />
              <el-table-column prop="standard" label="验收标准" min-width="200" show-overflow-tooltip />
              <el-table-column label="检测结果" width="100" align="center">
                <template #default="{ row }">
                  <el-tag :type="row.pass ? 'success' : 'danger'" size="small">
                    {{ row.pass ? '合格' : '不合格' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="remark" label="备注" min-width="160" show-overflow-tooltip />
            </el-table>

            <!-- 专项测试 -->
            <div class="zg-pj-accept__tests">
              <h5><el-icon><Monitor /></el-icon>专项测试记录</h5>
              <div class="zg-pj-accept__testgrid">
                <div class="zg-pj-accept__testcard" v-for="t in currentSelected.tests" :key="t.name">
                  <div class="zg-pj-accept__testhead">
                    <span class="zg-pj-accept__testname">{{ t.name }}</span>
                    <el-tag :type="t.pass ? 'success' : 'danger'" size="small">{{ t.pass ? '通过' : '未通过' }}</el-tag>
                  </div>
                  <div class="zg-pj-accept__testbody">
                    <span>测试值：{{ t.value }} {{ t.unit }}</span>
                    <span>标准：{{ t.standard }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 验收结论 -->
            <div class="zg-pj-accept__conclusion">
              <div class="zg-pj-accept__conclusion-head">
                <el-icon><CircleCheck /></el-icon>
                <span>验收结论</span>
              </div>
              <div class="zg-pj-accept__conclusion-body">{{ currentSelected.conclusionDetail }}</div>
              <div class="zg-pj-accept__conclusion-foot">
                <span>验收组长签字：{{ currentSelected.acceptLead }}</span>
                <span>日期：{{ currentSelected.acceptDate || '待定' }}</span>
                <span>验收小组成员：{{ currentSelected.team }}</span>
              </div>
              <div class="zg-pj-accept__conclusion-actions">
                <el-button type="success" :disabled="currentSelected.conclusion === '合格'">签核通过</el-button>
                <el-button type="warning" plain>退回整改</el-button>
                <el-button plain>打印验收单</el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="结项归档" name="archive">
          <div class="zg-pj-accept__archive">
            <h4 class="zg-pj-accept__archive-title">
              <el-icon><Folder /></el-icon> 竣工资料归档清单
              <el-tag size="small" style="margin-left:8px">共 {{ currentSelected.drawings.length + currentSelected.reports.length + currentSelected.manuals.length }} 项</el-tag>
            </h4>

            <!-- 竣工图纸 -->
            <div class="zg-pj-accept__archive-section">
              <h5><el-icon><MapLocation /></el-icon>竣工图纸 <span class="count">{{ currentSelected.drawings.length }}</span></h5>
              <div class="zg-pj-accept__filegrid">
                <div v-for="f in currentSelected.drawings" :key="f.id" class="zg-pj-accept__filecard">
                  <div class="zg-pj-accept__fileicon">
                    <el-icon :size="28"><PictureFilled /></el-icon>
                  </div>
                  <div class="zg-pj-accept__filebody">
                    <div class="zg-pj-accept__filename">{{ f.name }}</div>
                    <div class="zg-pj-accept__filemeta">{{ f.version }} · {{ f.size }}</div>
                  </div>
                  <div class="zg-pj-accept__fileactions">
                    <el-button link type="primary" size="small">预览</el-button>
                    <el-button link size="small">下载</el-button>
                    <el-button link type="primary" size="small" @click="onOpenDrawings(f)">
                      <el-icon><Link /></el-icon> 联动图纸库
                    </el-button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 检测报告 -->
            <div class="zg-pj-accept__archive-section">
              <h5><el-icon><Document /></el-icon>检测报告 <span class="count">{{ currentSelected.reports.length }}</span></h5>
              <div class="zg-pj-accept__filegrid">
                <div v-for="f in currentSelected.reports" :key="f.id" class="zg-pj-accept__filecard">
                  <div class="zg-pj-accept__fileicon zg-pj-accept__fileicon--pdf">
                    <el-icon :size="28"><Document /></el-icon>
                  </div>
                  <div class="zg-pj-accept__filebody">
                    <div class="zg-pj-accept__filename">{{ f.name }}</div>
                    <div class="zg-pj-accept__filemeta">{{ f.org }} · {{ f.date }}</div>
                  </div>
                  <div class="zg-pj-accept__fileactions">
                    <el-button link type="primary" size="small">查看</el-button>
                    <el-button link size="small">下载</el-button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 操作手册 -->
            <div class="zg-pj-accept__archive-section">
              <h5><el-icon><Reading /></el-icon>操作手册 <span class="count">{{ currentSelected.manuals.length }}</span></h5>
              <div class="zg-pj-accept__filegrid">
                <div v-for="f in currentSelected.manuals" :key="f.id" class="zg-pj-accept__filecard">
                  <div class="zg-pj-accept__fileicon zg-pj-accept__fileicon--manual">
                    <el-icon :size="28"><Reading /></el-icon>
                  </div>
                  <div class="zg-pj-accept__filebody">
                    <div class="zg-pj-accept__filename">{{ f.name }}</div>
                    <div class="zg-pj-accept__filemeta">编制单位：{{ f.org }}</div>
                  </div>
                  <div class="zg-pj-accept__fileactions">
                    <el-button link type="primary" size="small">查看</el-button>
                    <el-button link size="small">下载</el-button>
                  </div>
                </div>
              </div>
            </div>

            <div class="zg-pj-accept__archive-actions">
              <el-button type="primary"><el-icon><Upload /></el-icon>上传竣工资料</el-button>
              <el-button><el-icon><Download /></el-icon>打包下载全部</el-button>
              <el-button type="success" :disabled="currentSelected.statusKey !== 'passed'">
                <el-icon><CircleCheck /></el-icon>完成结项归档
              </el-button>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <div v-else class="zg-pj-accept__empty">
      <el-empty description="点击左侧卡片查看验收详情" />
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * 智光云枢 · 工程项目管理 · 验收与结项
 */
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { CircleCheck, User, Calendar, School, Search, Document, Monitor, Folder, MapLocation, Picture, Link, Reading, Upload, Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()

// ============================================================
// 类型
// ============================================================
interface AcceptItem { category: string, name: string, standard: string, pass: boolean, remark: string }
interface Test { name: string, value: string, unit: string, standard: string, pass: boolean }
interface Drawing { id: number, name: string, version: string, size: string }
interface Report { id: number, name: string, org: string, date: string }
interface Manual { id: number, name: string, org: string }

interface AcceptRow {
  id: number
  code: string
  name: string
  contractorShort: string
  acceptLead: string
  acceptDate: string
  statusKey: 'pending' | 'accepting' | 'passed' | 'rectify'
  statusLabel: string
  score: number | null
  summary: string
  conclusion: string
  conclusionDetail: string
  team: string
  items: AcceptItem[]
  tests: Test[]
  drawings: Drawing[]
  reports: Report[]
  manuals: Manual[]
}

// ============================================================
// Mock 验收项目
// ============================================================
const acceptList = ref<AcceptRow[]>([
  {
    id: 1, code: 'PJ-CS-2026-003', name: '先导路智慧路灯新建设备及安装项目',
    contractorShort: '湖南光明照明', acceptLead: '王建国', acceptDate: '2026-10-10',
    statusKey: 'accepting', statusLabel: '验收中', score: null,
    summary: '已完成竣工验收，正在进行照度及安全专项检测',
    conclusion: '—',
    conclusionDetail: '工程已按合同及设计图纸完成，分项工程施工质量良好，待专项检测完成后出具正式验收报告。',
    team: '张海涛、李明辉、陈晓东、刘芳',
    items: [
      { category: '基础工程', name: '灯杆基坑开挖与回填', standard: 'GB 50204-2015', pass: true,  remark: '符合要求' },
      { category: '基础工程', name: '预埋件与法兰盘',       standard: 'GB 50204-2015', pass: true,  remark: '防腐处理到位' },
      { category: '灯杆工程', name: '灯杆垂直度',           standard: '偏差≤3‰',        pass: true,  remark: '实测 1.2‰' },
      { category: '灯杆工程', name: '灯杆镀锌与喷塑',       standard: 'GB/T 13912',    pass: true,  remark: '厚度 86μm' },
      { category: '灯具安装', name: '灯具安装牢固度',       standard: '无松动',          pass: true,  remark: '全部合格' },
      { category: '灯具安装', name: '灯具水平俯仰角度',     standard: '符合设计',        pass: true,  remark: '一致' },
      { category: '电气系统', name: '电缆敷设与标识',       standard: 'GB 50168-2018', pass: true,  remark: '标识清晰' },
      { category: '电气系统', name: '接地电阻测试',         standard: '≤4Ω',             pass: true,  remark: '实测 2.3Ω' },
      { category: '控制系统', name: '智慧路灯控制模块',     standard: 'ZGSQ-V5',        pass: true,  remark: '功能正常' },
      { category: '控制系统', name: 'NB-IoT 信号覆盖',       standard: '覆盖率≥95%',      pass: true,  remark: '97.2%' },
    ],
    tests: [
      { name: '路面平均照度', value: '32.6', unit: 'lx',   standard: '≥20 lx',     pass: true  },
      { name: '照度均匀度',   value: '0.72', unit: '',     standard: '≥0.6',       pass: true  },
      { name: '显色指数',     value: 'Ra=78', unit: '',    standard: '≥70',        pass: true  },
      { name: '功率因数',     value: '0.96', unit: '',     standard: '≥0.9',       pass: true  },
      { name: '接地电阻',     value: '2.3',  unit: 'Ω',    standard: '≤4 Ω',       pass: true  },
      { name: '绝缘电阻',     value: '520',  unit: 'MΩ',   standard: '≥50 MΩ',     pass: true  },
      { name: '漏电保护',     value: '正常', unit: '',     standard: '≤30mA',      pass: true  },
      { name: '夜间眩光测试', value: '无眩光', unit: '',   standard: '≤20cd/m²',   pass: true  },
    ],
    drawings: [
      { id: 1, name: '先导路照明平面布置图',            version: 'V2.1', size: '8.6 MB' },
      { id: 2, name: '先导路照明系统接线原理图',        version: 'V1.3', size: '4.2 MB' },
      { id: 3, name: '先导路智慧路灯杆型结构图',        version: 'V1.0', size: '6.1 MB' },
      { id: 4, name: '先导路配电箱系统图',              version: 'V1.1', size: '3.8 MB' },
    ],
    reports: [
      { id: 1, name: '电气绝缘与接地电阻检测报告',  org: '湖南电力科学研究院', date: '2026-09-28' },
      { id: 2, name: '路面照度检测报告',            org: '中国建筑科学研究院', date: '2026-10-08' },
      { id: 3, name: '灯具光色电性能检测报告',      org: '国家电光源质检中心', date: '2026-09-20' },
    ],
    manuals: [
      { id: 1, name: 'ZGSQ-CTRL-V5 智慧路灯控制模块操作手册', org: '深圳洲明科技' },
      { id: 2, name: 'LED 灯具维护保养手册',                  org: '上海三思电子' },
      { id: 3, name: '先导路照明系统运维指南',                  org: '湖南光明照明' },
    ]
  },
  {
    id: 2, code: 'PJ-CS-2026-005', name: '岳麓大道下穿隧道照明专项整治',
    contractorShort: '长沙华电电气', acceptLead: '张海涛', acceptDate: '2026-07-26',
    statusKey: 'passed', statusLabel: '已通过', score: 95,
    summary: '整体验收评分 95 分，分项全部合格，已完成结项归档',
    conclusion: '合格',
    conclusionDetail: '本工程严格按照合同及设计文件要求施工，经现场实测及资料核查，分项工程全部合格，路面照度、均匀度、接地电阻等关键指标均满足 GB/T 24994 及 GB 50168 规范要求。施工过程规范，竣工资料齐全，同意通过竣工验收。',
    team: '王建国、李明辉、陈晓东',
    items: [
      { category: '隧道灯具', name: '灯具安装牢固度',       standard: '无松动',       pass: true,  remark: '全部合格' },
      { category: '隧道灯具', name: '隧道段照度均匀度',     standard: '≥0.7',         pass: true,  remark: '实测 0.75' },
      { category: '电气系统', name: '电缆防火封堵',         standard: 'GB 20801',    pass: true,  remark: '防火泥封堵到位' },
      { category: '电气系统', name: '双回路供电切换',       standard: '≤0.3s',        pass: true,  remark: '实测 0.18s' },
      { category: '应急照明', name: '应急照明启动时间',     standard: '≤5s',          pass: true,  remark: '实测 2.1s' },
      { category: '应急照明', name: '应急照度',             standard: '≥5 lx',        pass: true,  remark: '实测 12 lx' },
    ],
    tests: [
      { name: '隧道内平均照度', value: '48.2', unit: 'lx',   standard: '≥40 lx',   pass: true },
      { name: '隧道口加强照明', value: '165',   unit: 'lx',   standard: '≥150 lx',  pass: true },
      { name: '应急照明照度',   value: '12',    unit: 'lx',   standard: '≥5 lx',    pass: true },
      { name: '接地电阻',       value: '2.8',   unit: 'Ω',    standard: '≤4 Ω',     pass: true },
      { name: '双回路切换',     value: '0.18',  unit: 's',    standard: '≤0.3 s',   pass: true },
    ],
    drawings: [
      { id: 1, name: '岳麓大道隧道照明平面布置图', version: 'V1.0', size: '5.3 MB' },
      { id: 2, name: '隧道照明配电系统图',         version: 'V1.0', size: '3.1 MB' },
      { id: 3, name: '应急照明系统原理图',         version: 'V1.0', size: '2.8 MB' },
    ],
    reports: [
      { id: 1, name: '隧道照明照度检测报告',   org: '中国建筑科学研究院', date: '2026-07-22' },
      { id: 2, name: '电气安全检测报告',       org: '湖南电力科学研究院', date: '2026-07-20' },
    ],
    manuals: [
      { id: 1, name: '隧道照明应急处置操作手册', org: '长沙华电电气' },
    ]
  },
  {
    id: 3, code: 'PJ-CS-2026-001', name: '橘子洲景区 LED 照明改造工程',
    contractorShort: '湖南光明照明', acceptLead: '陈晓东', acceptDate: '',
    statusKey: 'pending', statusLabel: '待验收', score: null,
    summary: '施工接近尾声，施工 90%，尚未提交验收申请',
    conclusion: '—', conclusionDetail: '', team: '',
    items: [], tests: [], drawings: [], reports: [], manuals: []
  },
  {
    id: 4, code: 'PJ-CS-2025-012', name: '湘江新区夜间经济照明示范项目',
    contractorShort: '湖南光明照明', acceptLead: '李明辉', acceptDate: '2026-06-28',
    statusKey: 'rectify', statusLabel: '整改中', score: 72,
    summary: '首次验收发现 3 项问题，已下发整改通知书，预计 7 月 10 日前完成整改',
    conclusion: '整改后复验',
    conclusionDetail: '首次验收发现：① 部分景观灯角度偏移需重新调整；② 江北区段接地电阻实测 4.8Ω 超标；③ 控制模块软件版本未升级。已下发整改通知书，要求 7 月 10 日前完成整改后复验。',
    team: '王建国、陈晓东、张海涛',
    items: [
      { category: '景观照明', name: '景观灯俯仰角度',       standard: '偏差≤5°',       pass: false, remark: '5 处需调整' },
      { category: '电气系统', name: '江北段接地电阻',       standard: '≤4Ω',           pass: false, remark: '实测 4.8Ω，需增加接地极' },
      { category: '控制系统', name: '控制模块软件版本',     standard: 'ZGSQ-V5.2',    pass: false, remark: '当前为 V5.0，需升级' },
      { category: '电气系统', name: '江南段接地电阻',       standard: '≤4Ω',           pass: true,  remark: '实测 2.6Ω' },
      { category: '灯具安装', name: '灯具安装牢固度',       standard: '无松动',         pass: true,  remark: '全部合格' },
    ],
    tests: [
      { name: '江北区段接地电阻', value: '4.8', unit: 'Ω',  standard: '≤4 Ω',   pass: false },
      { name: '江南区段接地电阻', value: '2.6', unit: 'Ω',  standard: '≤4 Ω',   pass: true  },
      { name: '平均照度',         value: '28.5', unit: 'lx', standard: '≥20 lx', pass: true  },
    ],
    drawings: [
      { id: 1, name: '湘江新区夜景照明总平面图', version: 'V2.0', size: '12.6 MB' },
      { id: 2, name: '江北区段接地系统图',       version: 'V1.1', size: '4.8 MB' },
    ],
    reports: [
      { id: 1, name: '首次验收检测报告', org: '中国建筑科学研究院', date: '2026-06-25' },
    ],
    manuals: [
      { id: 1, name: '湘江新区景观照明运维手册', org: '湖南光明照明' },
    ]
  },
  {
    id: 5, code: 'PJ-CS-2026-009', name: '地铁 6 号线车站出入口照明配套工程',
    contractorShort: '湖南光明照明', acceptLead: '张海涛', acceptDate: '',
    statusKey: 'pending', statusLabel: '待验收', score: null,
    summary: '主体施工中，预计 2027 年 2 月提交验收',
    conclusion: '—', conclusionDetail: '', team: '',
    items: [], tests: [], drawings: [], reports: [], manuals: []
  }
])

// ============================================================
// 状态 & 筛选
// ============================================================
const activeStatus = ref('all')
const keyword = ref('')
const currentSelected = ref<AcceptRow | null>(acceptList.value[1])
const activeDetailTab = ref('sheet')

const filteredList = computed(() => {
  let list = acceptList.value.slice()
  if (activeStatus.value !== 'all') {
    list = list.filter(p => p.statusKey === activeStatus.value)
  }
  if (keyword.value.trim()) {
    const kw = keyword.value.trim().toLowerCase()
    list = list.filter(p =>
      p.name.toLowerCase().includes(kw) || p.code.toLowerCase().includes(kw)
    )
  }
  return list
})

const kpiAgg = computed(() => {
  const list = acceptList.value
  return {
    pending:   list.filter(p => p.statusKey === 'pending').length,
    accepting: list.filter(p => p.statusKey === 'accepting').length,
    passed:    list.filter(p => p.statusKey === 'passed').length,
    rectify:   list.filter(p => p.statusKey === 'rectify').length,
  }
})

function scoreTagType(score: number): 'danger' | 'warning' | 'success' | '' {
  if (score >= 90) return 'success'
  if (score >= 80) return ''
  if (score >= 60) return 'warning'
  return 'danger'
}
function resultTagType(result: string): 'success' | 'warning' | 'danger' | 'info' {
  const map: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
    '合格': 'success', '整改后复验': 'warning', '—': 'info', '不合格': 'danger'
  }
  return map[result] || 'info'
}

function onSelect(p: AcceptRow) {
  currentSelected.value = p
  activeDetailTab.value = 'sheet'
}

function onOpenDrawings(d: Drawing) {
  // 跳转到 gridKnowledge/Drawings 查看图纸
  router.push({ path: '/gridKnowledge/drawings', query: { name: d.name, id: d.id } })
  ElMessage.info(`已跳转到图纸库：${d.name}`)
}
</script>

<style scoped lang="scss">
.zg-pj-accept {
  --zg-brand-primary: var(--zg-amber-glow, #d97706);
  --zg-success: var(--zg-emerald-success, #059669);
  --zg-warning: var(--zg-amber-glow, #d97706);
  --zg-danger: var(--zg-rose-danger, #dc2626);
  --zg-info: var(--zg-sky-info, #0284c7);
  --zg-success-soft: var(--zg-emerald-soft, #d1fae5);
  --zg-warning-soft: var(--zg-amber-soft, #fef3c7);
  --zg-danger-soft: var(--zg-rose-soft, #fee2e2);
  --zg-info-soft: var(--zg-sky-soft, #e0f2fe);
  --zg-line-soft: rgba(241,245,249,0.8);
  --zg-ink-primary: #18181b;
  --zg-ink-secondary: #52525b;
  --zg-ink-tertiary: #71717a;
  --zg-surface-card: #ffffff;
  --zg-surface-muted: #f8fafc;
  --zg-gradient-surface: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
  --zg-gradient-primary: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
  --zg-radius-sm: 6px;
  --zg-radius-md: 10px;
  --zg-radius-lg: 16px;
  --zg-radius-pill: 999px;
  padding: 24px;
  background: var(--zg-gradient-surface);
  min-height: calc(100vh - 120px);

  &__head {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 20px; padding-bottom: 18px; border-bottom: 1px solid var(--zg-line-soft);
  }
  &__headline { display: flex; align-items: center; gap: 14px; }
  &__sigil {
    width: 44px; height: 44px; border-radius: var(--zg-radius-md);
    background: var(--zg-gradient-primary); color: #fff;
    display: flex; align-items: center; justify-content: center;
  }
  &__copy { display: flex; flex-direction: column; gap: 4px; }
  &__title { font-size: 20px; font-weight: 600; margin: 0; }
  &__sub { font-size: 13px; color: var(--zg-ink-tertiary); margin: 0; }
}

.zg-pj-accept__filterbar {
  background: var(--zg-surface-card); border-radius: var(--zg-radius-md);
  border: 1px solid var(--zg-line-soft); padding: 14px 18px; margin-bottom: 16px;
}
.zg-filter-row { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
.zg-filter-item { display: flex; gap: 6px; align-items: center; }
.zg-filter-item__lbl { font-size: 13px; color: var(--zg-ink-secondary); }
.zg-filter-item--actions { margin-left: auto; }

.zg-pj-accept__cards {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 14px; margin-bottom: 18px;
}
.zg-pj-accept__card {
  background: var(--zg-surface-card); border-radius: var(--zg-radius-lg);
  border: 1px solid var(--zg-line-soft); padding: 16px;
  cursor: pointer; transition: all 200ms ease;
  border-left: 4px solid #cbd5e1;
  &:hover { transform: translateY(-2px); box-shadow: 0 8px 24px -8px rgba(15,23,42,0.15); }
  &--pending   { border-left-color: var(--zg-info); }
  &--accepting { border-left-color: var(--zg-warning); }
  &--passed    { border-left-color: var(--zg-success); }
  &--rectify   { border-left-color: var(--zg-danger); }
  &.is-current { border-color: var(--zg-brand-primary); box-shadow: 0 0 0 2px rgba(217,119,6,0.15); }
}
.zg-pj-accept__cardhead {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;
}
.zg-pj-accept__code { font-family: ui-monospace, monospace; font-size: 12px; color: var(--zg-ink-tertiary); }
.zg-pj-accept__status {
  display: inline-flex; align-items: center; gap: 4px; font-size: 11px;
  padding: 2px 10px; border-radius: var(--zg-radius-pill); font-weight: 500;
  .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
  &--pending   { color: var(--zg-info);    background: var(--zg-info-soft); }
  &--accepting { color: var(--zg-warning); background: var(--zg-warning-soft); }
  &--passed    { color: var(--zg-success); background: var(--zg-success-soft); }
  &--rectify   { color: var(--zg-danger);  background: var(--zg-danger-soft); }
}
.zg-pj-accept__cardtitle { font-size: 15px; font-weight: 600; margin: 0 0 10px; color: var(--zg-ink-primary); }
.zg-pj-accept__cardmeta { display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px; }
.zg-pj-accept__metaitem {
  display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--zg-ink-secondary);
}
.zg-pj-accept__cardsummary {
  font-size: 12px; color: var(--zg-ink-tertiary); line-height: 1.5;
  border-top: 1px dashed var(--zg-line-soft); padding-top: 10px; margin-bottom: 10px;
}
.zg-pj-accept__cardfoot {
  display: flex; justify-content: space-between; align-items: center;
}

.zg-pj-accept__detail {
  background: var(--zg-surface-card); border-radius: var(--zg-radius-lg);
  border: 1px solid var(--zg-line-soft); padding: 4px 18px 18px;
}
.zg-pj-accept__sheet-head {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid var(--zg-line-soft);
  h4 { margin: 0; display: flex; align-items: center; gap: 8px; font-size: 15px; }
}

.zg-pj-accept__tests { margin: 18px 0; }
.zg-pj-accept__tests h5 {
  display: flex; align-items: center; gap: 8px; margin: 0 0 12px; font-size: 14px;
}
.zg-pj-accept__testgrid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px;
}
.zg-pj-accept__testcard {
  border: 1px solid var(--zg-line-soft); border-radius: var(--zg-radius-md);
  padding: 12px; background: var(--zg-surface-muted);
}
.zg-pj-accept__testhead {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;
}
.zg-pj-accept__testname { font-size: 13px; font-weight: 600; color: var(--zg-ink-primary); }
.zg-pj-accept__testbody {
  display: flex; flex-direction: column; gap: 2px;
  font-size: 12px; color: var(--zg-ink-secondary); font-family: ui-monospace, monospace;
}

.zg-pj-accept__conclusion {
  background: var(--zg-surface-muted); border-radius: var(--zg-radius-md);
  padding: 16px; border: 1px solid var(--zg-line-soft);
}
.zg-pj-accept__conclusion-head {
  display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600;
  margin-bottom: 10px;
}
.zg-pj-accept__conclusion-body {
  font-size: 13px; line-height: 1.7; color: var(--zg-ink-secondary);
  margin-bottom: 12px; white-space: pre-wrap;
}
.zg-pj-accept__conclusion-foot {
  display: flex; gap: 20px; font-size: 12px; color: var(--zg-ink-tertiary);
  padding-top: 10px; border-top: 1px dashed var(--zg-line-soft); margin-bottom: 12px;
}
.zg-pj-accept__conclusion-actions {
  display: flex; gap: 10px; justify-content: flex-end;
}

/* ========== 归档 ========== */
.zg-pj-accept__archive-title {
  display: flex; align-items: center; gap: 8px; font-size: 15px;
  margin: 18px 0 16px;
}
.zg-pj-accept__archive-section { margin-bottom: 20px; }
.zg-pj-accept__archive-section h5 {
  display: flex; align-items: center; gap: 8px; margin: 0 0 12px; font-size: 14px;
  color: var(--zg-ink-primary);
  .count {
    font-size: 11px; padding: 1px 8px; border-radius: var(--zg-radius-pill);
    background: var(--zg-brand-primary); color: #fff; font-weight: 500;
  }
}
.zg-pj-accept__filegrid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 12px;
}
.zg-pj-accept__filecard {
  display: grid; grid-template-columns: 56px 1fr; gap: 12px;
  border: 1px solid var(--zg-line-soft); border-radius: var(--zg-radius-md);
  padding: 12px; background: var(--zg-surface-muted); transition: border-color 200ms;
  &:hover { border-color: var(--zg-brand-primary); }
}
.zg-pj-accept__fileicon {
  width: 56px; height: 56px; border-radius: var(--zg-radius-md);
  background: linear-gradient(135deg, #0284c7, #38bdf8); color: #fff;
  display: flex; align-items: center; justify-content: center;
  &--pdf   { background: linear-gradient(135deg, #dc2626, #f97316); }
  &--manual { background: linear-gradient(135deg, #7c3aed, #a78bfa); }
}
.zg-pj-accept__filebody { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.zg-pj-accept__filename {
  font-size: 13px; font-weight: 600; color: var(--zg-ink-primary);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.zg-pj-accept__filemeta { font-size: 11px; color: var(--zg-ink-tertiary); }
.zg-pj-accept__fileactions {
  grid-column: 2; display: flex; gap: 6px; justify-content: flex-end;
}
.zg-pj-accept__archive-actions {
  display: flex; gap: 10px; justify-content: center;
  padding-top: 18px; border-top: 1px solid var(--zg-line-soft); margin-top: 10px;
}

.zg-pj-accept__empty {
  background: var(--zg-surface-card); border-radius: var(--zg-radius-lg);
  border: 1px dashed var(--zg-line-soft); padding: 40px;
}
</style>
