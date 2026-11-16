// 批量替换 element-plus 图标名
// 运行：node fix_icons.cjs
const fs = require('fs');
const path = require('path');

const replacements = {
  'DocumentPdf': 'Document',      // element-plus 没有 DocumentPdf → Document
  'FileDocument': 'Document',      // → Document
  'Picture': 'PictureFilled',      // Picture 可能有 → PictureFilled
  'Van': 'Truck',                  // Van 不存在 → Truck
  'View': 'Monitor',               // View 不存在 → Monitor
  'FolderOpened': 'Folder',        // FolderOpened 可能有但不稳 → Folder
  'RefreshRight': 'Refresh',       // → Refresh
  'UserFilled': 'User',            // → User
  'OfficeBuilding': 'School',      // OfficeBuilding 可能有问题 → School
};

function walk(dir) {
  const results = [];
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results.push(...walk(full));
    } else if (item.endsWith('.vue')) {
      results.push(full);
    }
  }
  return results;
}

const files = walk(path.join(__dirname, 'src'));
let totalFixed = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  for (const [bad, good] of Object.entries(replacements)) {
    if (content.includes(bad)) {
      content = content.replace(new RegExp(bad, 'g'), good);
      changed = true;
      totalFixed++;
      console.log(`  ${path.relative(__dirname, file)}: ${bad} → ${good}`);
    }
  }
  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
  }
}

console.log(`\n✓ 修复完成，共 ${totalFixed} 处替换`);
