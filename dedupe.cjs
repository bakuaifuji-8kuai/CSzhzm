const fs = require('fs'), path = require('path');
function walk(d) {
  return fs.readdirSync(d).flatMap(i => {
    const f = path.join(d, i);
    const s = fs.statSync(f);
    return s.isDirectory() ? walk(f) : (f.endsWith('.vue') || f.endsWith('.js')) ? [f] : [];
  });
}
let total = 0;
for (const f of walk('src')) {
  let c = fs.readFileSync(f, 'utf8');
  let changed = false;
  c = c.replace(/import \{([^}]+)\} from ['"]@element-plus\/icons-vue['"]/g, (match, names) => {
    const arr = names.split(',').map(s => s.trim()).filter(Boolean);
    const seen = new Set(), unique = [];
    for (const n of arr) {
      if (!seen.has(n)) { seen.add(n); unique.push(n); }
      else { changed = true; total++; }
    }
    return "import { " + unique.join(', ') + " } from '@element-plus/icons-vue'";
  });
  if (changed) { fs.writeFileSync(f, c, 'utf8'); console.log(path.relative('.', f)); }
}
console.log('TOTAL fixed:', total);
