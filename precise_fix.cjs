// 精准修复坏图标：只替换 element-plus 确实没有的
const fs = require('fs'), path = require('path');
const icons = require('@element-plus/icons-vue');
const VALID = new Set(Object.keys(icons));

// 确认不存在的图标 → 用存在的替代
const FIX = {
  'MagicBrush': 'Edit',
  'Print': 'Document',
  'BoxChecked': 'Box',
  // 空字符串（脚本 bug 产生）跳过
};

function walk(d) {
  return fs.readdirSync(d).flatMap(i => {
    const f = path.join(d, i);
    const s = fs.statSync(f);
    if (s.isDirectory()) return walk(f);
    if (f.endsWith('.vue') || f.endsWith('.js')) return [f];
    return [];
  });
}

let total = 0;
for (const f of walk('src')) {
  let c = fs.readFileSync(f, 'utf8');
  let changed = false;
  c = c.replace(/import \{([^}]+)\} from ['"]@element-plus\/icons-vue['"]/g, (match, names) => {
    const arr = names.split(',').map(s => s.trim()).filter(Boolean);
    const seen = new Set(), unique = [];
    for (let n of arr) {
      if (FIX[n]) { n = FIX[n]; changed = true; total++; }
      if (!VALID.has(n)) {
        console.log(`⚠️ 不存在: ${n} in ${path.relative('.', f)}`);
        n = 'Monitor'; // 终极兜底
        changed = true; total++;
      }
      if (!seen.has(n)) { seen.add(n); unique.push(n); }
      else { changed = true; total++; }
    }
    return "import { " + unique.join(', ') + " } from '@element-plus/icons-vue'";
  });
  if (changed) { fs.writeFileSync(f, c, 'utf8'); console.log(path.relative('.', f)); }
}
console.log('TOTAL FIXES:', total);
