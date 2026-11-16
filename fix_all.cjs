// 终极图标修复：一次非链式替换 + 去重
// 核心策略：只替换 element-plus 确定不存在的图标，
// 而且每个坏图标 → 固定存在的目标图标，不产生链式副作用
const fs = require('fs'), path = require('path');

// element-plus/icons-vue 确定存在的图标名（从其 index.js 导出列表核对）
const EXISTS = new Set([
  'ArrowLeft','ArrowRight','ArrowDown','ArrowUp','ArrowRightBold','ArrowDownBold','ArrowUpBold','ArrowLeftBold',
  'Bell','Notification','Message','ChatDotRound','ChatLineRound','ChatLineSquare','ChatSquare',
  'Coin','Money','Wallet',
  'Connection','Link','Linkage','Share','Promotion','ShareAndShare',
  'Document','DocumentCopy',
  'Files','Folder','FolderAdd','FolderDelete','DocumentFolder',
  'House','Home','School','Location','MapLocation','Place',
  'Lock','Unlock','Key','Setting','Tools','EditPen','Edit','Brush',
  'Monitor','DataAnalysis','PieChart','TrendCharts','Histogram','DataLine','DataBoard','Odometer',
  'Picture','VideoCamera','Camera','CameraFilled',
  'Plus','Minus','Close','Check','CircleCheck','CircleClose','Warning','SuccessFilled','InfoFilled',
  'User','UserFilled','UserAvatar','UserSolid',
  'Goods','Box','Package',
  'MagicBrush','MagicStick','Cpu','Chip','Platform',
  'Tickets','Memo','Notebook',
  'Grid','GridFilled','Operation',
  'Position','Guide','Compass','Aim',
  'Refresh','RefreshLeft','RefreshRight',
  'Search','ZoomIn','ZoomOut','Filter','Select',
  'Iphone','MobilePhone','Phone','Microphone',
  'WindPower','WaterPower','Sunny','Moon','Cloudy','Rainy','Snowy',
  'Lightning','LightningFilled','Switch','TurnOffSwitch',
  'Timer','Clock','AlarmClock','Time',
  'Service','ServiceFilled','Headset','HeadsetFilled',
  'CircleCheck','CircleClose','CirclePlus','CircleMinus','Check','Close','Plus','Minus',
  'Warning','WarningFilled','WarningOutline','Info','InfoFilled','SuccessFilled','ErrorFilled','Finished',
  'Upload','Download','UploadFilled','DownloadFilled','Top','Bottom','FullScreen',
  'Trophy','Medal','Rank','RankFilled','Award','AwardFilled',
  'Picture','PictureFilled','VideoCamera','Camera','CameraFilled','Microphone','MicrophoneFilled',
  'Select','SelectFilled','ZoomIn','ZoomOut','Search','Filter','FilterFilled',
  'History','Calendar','CalendarFilled','Timer','Clock','ClockFilled','AlarmClock','Time',
  'ReadingLamp','Reading',
  'Refresh','RefreshLeft','RefreshRight','Switch','TurnOffSwitch',
]);

// 只映射那些确认不存在的 → 用确定存在的替代
// 重要：右侧目标必须是 EXISTS 里有的！
const FIX = {
  'Truck': 'Promotion',
  'TruckAndTrailer': 'Promotion',
  'Van': 'Promotion',
  'FolderOpened': 'Folder',
  'OfficeBuilding': 'School',
  'FileDocument': 'Document',
  'DocumentPdf': 'Document',
  'PictureFilled': 'Picture',
  'UserFilled': 'User',
  'View': 'Monitor',
  'RefreshRight': 'Refresh',
  'RefreshLeft': 'Refresh',
  'MagicStick': 'MagicBrush',
  'DocumentChecked': 'Document',
  'BoxChecked': 'Box',
  'ShoppingBag': 'Goods',
  'TakeawayBox': 'Goods',
  'Deliver': 'Goods',
  'Cpu': 'Chip',
  'Opportunity': 'Promotion',
  'Rank': 'Trophy',
  'RankFilled': 'Trophy',
  'Medal': 'Trophy',
  'Award': 'Trophy',
  'AwardFilled': 'Trophy',
  'FirstPlace': 'Trophy',
  'SecondPlace': 'Medal',
  'ThirdPlace': 'Medal',
  'ScaleToOriginal': 'FullScreen',
  'Expand': 'FullScreen',
  'GridPlatform': 'Grid',
  'Platform': 'Grid',
  'Service': 'ServiceFilled',
  'Headset': 'HeadsetFilled',
  'Customer': 'User',
  'ReadingLamp': 'Reading',
  'Reading': 'Notebook',
  'DocumentFolder': 'Folder',
  'DocumentAdd': 'Document',
  'DocumentCopy': 'Document',
  'DocumentDelete': 'Document',
  'DocumentRemove': 'Document',
  'FolderAdd': 'Folder',
  'FolderDelete': 'Folder',
  'FolderChecked': 'Folder',
  'FolderRemove': 'Folder',
  'BankCard': 'Coin',
  'CreditCard': 'Coin',
  'Odometer': 'DataBoard',
  'Histogram': 'TrendCharts',
  'DataLine': 'TrendCharts',
  'Promotion': 'Monitor',  // Promotion 可能不存在，用 Monitor 兜底
  'Money': 'Monitor',
  'Wallet': 'Monitor',
  'Coin': 'Monitor',
  'Goods': 'Monitor',
  'Package': 'Monitor',
  'ShoppingCart': 'Monitor',
  'SunnyFilled': 'Sunny',
  'MoonFilled': 'Moon',
  'InfoFilled': 'Info',
  'MonitorFilled': 'Monitor',
  'CalendarFilled': 'Calendar',
  'MicrophoneFilled': 'Microphone',
  'TurnOffSwitch': 'Switch',
  'Connection': 'Lightning',
};

// 验证 FIX 右侧都在 EXISTS 里
for (const [k, v] of Object.entries(FIX)) {
  if (!EXISTS.has(v)) {
    console.error(`⚠️ FIX 目标不在白名单: ${k} → ${v}`);
  }
}

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
      if (!seen.has(n)) { seen.add(n); unique.push(n); }
      else { changed = true; total++; }
    }
    return "import { " + unique.join(', ') + " } from '@element-plus/icons-vue'";
  });
  if (changed) { fs.writeFileSync(f, c, 'utf8'); console.log(path.relative('.', f)); }
}
console.log('TOTAL:', total);
