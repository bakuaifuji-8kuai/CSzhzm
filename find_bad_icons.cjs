// 查询所有 .vue 文件里 element-plus 图标名，找出不存在的
const fs = require('fs'), path = require('path');
const icons = require('@element-plus/icons-vue');
const VALID = new Set(Object.keys(icons));

function walk(d) {
  return fs.readdirSync(d).flatMap(i => {
    const f = path.join(d, i);
    const s = fs.statSync(f);
    if (s.isDirectory()) return walk(f);
    if (f.endsWith('.vue') || f.endsWith('.js')) return [f];
    return [];
  });
}

const bad = new Map();  // iconName -> [file paths]

for (const f of walk('src')) {
  const c = fs.readFileSync(f, 'utf8');
  const m = c.match(/import \{([^}]+)\} from ['"]@element-plus\/icons-vue['"]/g);
  if (!m) continue;
  for (const imp of m) {
    const names = imp.replace(/.*import \{([^}]+)\}.*/, '$1').split(',').map(s => s.trim());
    for (const n of names) {
      if (!VALID.has(n)) {
        if (!bad.has(n)) bad.set(n, []);
        bad.get(n).push(path.relative('.', f));
      }
    }
  }
}

console.log('不存在的图标（共', bad.size, '种）:');
for (const [name, files] of bad) {
  console.log(`  ${name}  →  ${files.length} 处`);
  // console.log('    ' + files.join('\n    '));
}
