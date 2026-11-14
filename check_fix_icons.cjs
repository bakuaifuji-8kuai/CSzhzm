// 用白名单彻底校验
const fs = require('fs');
const path = require('path');
const icons = require('./node_modules/@element-plus/icons-vue');
const validNames = new Set(Object.keys(icons).filter(k => !k.startsWith('_')));

// 常见替代映射（不在白名单 → 在白名单）
const fallbackMap = {
  'Wind': 'WindPower',
  'OfficeBuilding': 'House',
  'DoorOpening': 'Key',
  'Sun': 'Sunny',
  'Bus': 'Box',
  'Leaf': 'Sunny',
  'Van': 'Monitor',
  'Alert': 'AlarmClock',
};

const dirs = [
  'src/modules/energyCore',
  'src/modules/safety',
  'src/modules/publicReport',
  'src/modules/opsTicket',
  'src/modules/opsOrg',
  'src/modules/assetManage',
  'src/modules/gridKnowledge',
  'src/modules/powerApply',
];

let totalFixed = 0;
for (const dir of dirs) {
  const fullDir = path.resolve(dir);
  if (!fs.existsSync(fullDir)) continue;
  for (const file of fs.readdirSync(fullDir)) {
    if (!file.endsWith('.vue')) continue;
    const fp = path.join(fullDir, file);
    let content = fs.readFileSync(fp, 'utf-8');
    const orig = content;
    
    // 找出所有 import 里的图标名
    const importMatches = [...content.matchAll(/import \{([^}]+)\} from ['"]@element-plus\/icons-vue['"]/g)];
    const usedBad = new Set();
    
    for (const m of importMatches) {
      const names = m[1].split(',').map(s => {
        const parts = s.trim().split(' as ');
        return parts[parts.length - 1].trim();
      }).filter(Boolean);
      
      for (const n of names) {
        if (!validNames.has(n) && !validNames.has(n + 'Filled') && !validNames.has(n + 'Bold')) {
          // 试试 fallback
          const fb = fallbackMap[n];
          if (fb) {
            usedBad.add({ bad: n, good: fb });
          } else {
            console.log('UNKNOWN BAD:', n, 'in', file);
          }
        }
      }
    }
    
    for (const { bad, good } of usedBad) {
      const re = new RegExp('\\b' + bad + '\\b', 'g');
      content = content.replace(re, good);
    }
    
    if (content !== orig) {
      fs.writeFileSync(fp, content, 'utf-8');
      console.log('Fixed:', file, [...usedBad].map(u => u.bad + '→' + u.good).join(', '));
      totalFixed++;
    }
  }
}
console.log('\nTotal fixed:', totalFixed);
