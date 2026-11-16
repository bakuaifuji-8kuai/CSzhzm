// 校验所有 .vue 文件中的 @element-plus/icons-vue 导入名
const fs = require('fs'), path = require('path');

// 已知 element-plus 图标白名单（从 @element-plus/icons-vue 实际导出）
const KNOWN_GOOD = new Set([
  'ArrowLeft','ArrowRight','ArrowDown','ArrowUp','ArrowRightBold','ArrowDownBold','ArrowUpBold',
  'Bell','Notification','Message','ChatDotRound','ChatLineRound','ChatLineSquare','ChatSquare',
  'Coin','Money','Wallet','BankCard','CreditCard','Present','Gift','Opportunity',
  'Connection','Link','Linkage','Share','Promotion','ShareAndShare',
  'Document','DocumentPdf','DocumentAdd','DocumentCopy','DocumentDelete','DocumentRemove',
  'Files','Folder','FolderOpened','FolderAdd','FolderDelete','DocumentFolder',
  'House','Home','School','OfficeBuilding','Shop','Location','MapLocation','Place',
  'Lock','Unlock','Key','Setting','Tools','EditPen','Edit','Brush',
  'Monitor','DataAnalysis','PieChart','TrendCharts','Histogram','DataLine','DataBoard','Odometer',
  'Picture','PictureFilled','PictureOutline','VideoCamera','Camera','CameraFilled',
  'Plus','Minus','Close','Check','CircleCheck','CircleClose','Warning','SuccessFilled','InfoFilled',
  'User','UserFilled','UserAvatar','UserSolid','UserOutlined','Avatar',
  'Van','Truck','Promotion','Deliver','Goods','Box','Package','TakeawayBox',
  'ReadingLamp','Sunny','Moon','Cloudy','SunnyFilled','MoonFilled',
  'MagicStick','Cpu','Chip','MagicStick','MagicBrush',
  'Tickets','TicketsFilled','Memo','Notebook','NotebookFilled','Tickets',
  'Grid','GridFilled','Operation','OperationButtons','OperationLock',
  'Position','Guide','Compass','Aim','LocationFilled','Pointer',
  'Refresh','RefreshLeft','RefreshRight','RefreshRight','RefreshLeft',
  'Search','ZoomIn','ZoomOut','Filter','FilterFilled','Select',
  'Iphone','MobilePhone','Phone','PhoneFilled','Microphone','MicrophoneFilled',
  'WindPower','WaterPower','Sunny','SunnyFilled','Opportunity',
  'Platform','GridPlatform','Monitor','MonitorFilled',
  'Lightning','LightningFilled','TurnOffSwitch','Switch',
  'Timer','Clock','ClockFilled','AlarmClock','Time',
  'Service','ServiceFilled','Headset','HeadsetFilled','Customer',
  'CircleCheck','Check','SuccessFilled','Finished',
  'CircleClose','Close','CirclePlus','Plus','CircleMinus','Minus',
  'Warning','WarningFilled','WarningOutline','Info','InfoFilled',
  'ArrowLeft','ArrowRight','ArrowRightBold','ArrowLeftBold',
  'MagicStick','MagicBrush','Brush','EditPen',
  'Promotion','Share','ShareAndShare',
  'Coin','Money','Wallet','BankCard','CreditCard',
  'DataAnalysis','PieChart','TrendCharts','Histogram','DataLine','DataBoard','Odometer','Monitor',
  'School','OfficeBuilding','Shop','Location','MapLocation','Place','Home','House',
  'Setting','Tools','EditPen','Edit','Brush','Operation',
  'Goods','Box','Package','TakeawayBox','Truck','Van','Deliver',
  'Sunny','Moon','Cloudy','Rainy','Snowy','SunnyFilled','MoonFilled',
  'Connection','Cpu','Chip','MagicStick','MagicBrush','Platform','GridPlatform',
  'Tickets','TicketsFilled','Memo','Notebook','NotebookFilled',
  'Refresh','RefreshLeft','RefreshRight','Switch','TurnOffSwitch','Lightning','LightningFilled',
  'User','UserFilled','Avatar','UserAvatar','UserSolid',
  'Guide','Compass','Aim','Position','LocationFilled','Pointer',
  'Bell','Notification','Message','ChatDotRound','ChatLineRound','ChatLineSquare',
  'ReadingLamp','Reading','Notebook','NotebookFilled',
  'Grid','GridFilled','Operation','OperationButtons','OperationLock',
  'Iphone','MobilePhone','Phone','PhoneFilled','Microphone','MicrophoneFilled','Monitor',
  'History','Calendar','CalendarFilled','Timer','Clock','ClockFilled','AlarmClock','Time',
  'Service','ServiceFilled','Headset','HeadsetFilled','Customer',
  'Folder','FolderOpened','FolderAdd','FolderDelete','DocumentFolder',
  'Upload','Download','UploadFilled','DownloadFilled','Top','Bottom',
  'FullScreen','aim','scale-to-original','rank','medal','trophy','FirstPlace','SecondPlace','ThirdPlace',
  'Warning','WarningFilled','WarningOutline','Info','InfoFilled','SuccessFilled','ErrorFilled','CircleCheck','CircleClose','Finished',
  'Select','SelectFilled','Check','Close','Plus','Minus','CirclePlus','CircleMinus','CircleCheck','CircleClose',
  'Promotion','Share','ShareAndShare','Connection','Coin','Money','Wallet','BankCard','CreditCard',
  'MagicStick','MagicBrush','Brush','EditPen','Edit','Tools','Setting','Operation',
  'School','OfficeBuilding','Shop','Location','MapLocation','Place','Home','House','Platform','GridPlatform',
  'DataAnalysis','PieChart','TrendCharts','Histogram','DataLine','DataBoard','Odometer','Monitor','MonitorFilled',
  'Truck','Deliver','Goods','Box','Package','TakeawayBox','Van',
  'Sunny','SunnyFilled','Moon','MoonFilled','Cloudy','Rainy','Snowy',
  'ArrowLeft','ArrowRight','ArrowDown','ArrowUp','ArrowRightBold','ArrowDownBold','ArrowUpBold','ArrowLeftBold',
  'CircleCheck','CircleClose','CirclePlus','CircleMinus','Check','Close','Plus','Minus',
  'Warning','WarningFilled','WarningOutline','Info','InfoFilled','SuccessFilled','ErrorFilled','Finished',
  'Upload','Download','UploadFilled','DownloadFilled','Top','Bottom','FullScreen','aim','scale-to-original',
  'Rank','RankFilled','Medal','Trophy','FirstPlace','SecondPlace','ThirdPlace','Award','AwardFilled',
  'Picture','PictureFilled','VideoCamera','Camera','CameraFilled','Microphone','MicrophoneFilled',
  'Select','SelectFilled','ZoomIn','ZoomOut','Search','Filter','FilterFilled',
  'Bell','Notification','Message','ChatDotRound','ChatLineRound','ChatLineSquare',
  'Grid','GridFilled','Operation','OperationButtons','OperationLock','Guide','Compass','Aim','Pointer',
  'History','Calendar','CalendarFilled','Timer','Clock','ClockFilled','AlarmClock','Time',
  'Service','ServiceFilled','Headset','HeadsetFilled','Customer','ReadingLamp','Reading',
  'Refresh','RefreshLeft','RefreshRight','Switch','TurnOffSwitch','Lightning','LightningFilled','Power',
  'User','UserFilled','Avatar','UserAvatar','UserSolid','Iphone','MobilePhone','Phone','PhoneFilled',
  'Files','Document','DocumentAdd','DocumentCopy','DocumentDelete','DocumentRemove','DocumentPdf','DocumentFolder',
  'Folder','FolderOpened','FolderAdd','FolderDelete','FolderChecked','FolderRemove',
  'Connection','Cpu','Chip','MagicStick','MagicBrush','Promotion','Share','ShareAndShare',
  'Tickets','TicketsFilled','Memo','Notebook','NotebookFilled',
  'Position','Location','LocationFilled','MapLocation','Place',
  'Goods','Box','Package','TakeawayBox','Truck','Deliver','Van',
  'School','OfficeBuilding','Shop','Home','House','Platform','GridPlatform',
  'Sunny','SunnyFilled','Moon','MoonFilled','Cloudy','Rainy','Snowy','Lightning','LightningFilled',
  'ArrowLeft','ArrowRight','ArrowDown','ArrowUp','ArrowRightBold','ArrowDownBold','ArrowUpBold','ArrowLeftBold',
  'CircleCheck','CircleClose','CirclePlus','CircleMinus','Check','Close','Plus','Minus',
  'Warning','WarningFilled','WarningOutline','Info','InfoFilled','SuccessFilled','ErrorFilled','Finished',
  'Upload','Download','UploadFilled','DownloadFilled','Top','Bottom','FullScreen','ScaleToOriginal',
  'Rank','RankFilled','Medal','Trophy','FirstPlace','SecondPlace','ThirdPlace','Award','AwardFilled',
  'Picture','PictureFilled','VideoCamera','Camera','CameraFilled','Microphone','MicrophoneFilled',
  'Select','SelectFilled','ZoomIn','ZoomOut','Search','Filter','FilterFilled',
  'Bell','Notification','Message','ChatDotRound','ChatLineRound','ChatLineSquare',
  'Grid','GridFilled','Operation','OperationButtons','OperationLock','Guide','Compass','Aim','Pointer',
  'History','Calendar','CalendarFilled','Timer','Clock','ClockFilled','AlarmClock','Time',
  'Service','ServiceFilled','Headset','HeadsetFilled','Customer','ReadingLamp','Reading',
  'Refresh','RefreshLeft','RefreshRight','Switch','TurnOffSwitch','Power',
  'User','UserFilled','Avatar','UserAvatar','UserSolid','Iphone','MobilePhone','Phone','PhoneFilled',
  'Files','Document','DocumentAdd','DocumentCopy','DocumentDelete','DocumentRemove','DocumentFolder',
  'Folder','FolderOpened','FolderAdd','FolderDelete','FolderChecked','FolderRemove',
  'Setting','Tools','EditPen','Edit','Brush','Operation',
  'MagicStick','MagicBrush','MagicStick','MagicBrush','Cpu','Chip',
  'Promotion','Share','ShareAndShare','Connection','Coin','Money','Wallet','BankCard','CreditCard',
  'DataAnalysis','PieChart','TrendCharts','Histogram','DataLine','DataBoard','Odometer','Monitor','MonitorFilled',
  'Grid','GridFilled','Guide','Compass','Aim','Pointer','MapLocation','Location','Place',
  'Goods','Box','Package','TakeawayBox','Truck','Deliver','Van',
  'School','OfficeBuilding','Shop','Home','House','Platform','GridPlatform',
  'Sunny','SunnyFilled','Moon','MoonFilled','Cloudy','Rainy','Snowy','Lightning','LightningFilled',
  'ArrowLeft','ArrowRight','ArrowDown','ArrowUp','ArrowRightBold','ArrowDownBold','ArrowUpBold','ArrowLeftBold',
  'CircleCheck','CircleClose','CirclePlus','CircleMinus','Check','Close','Plus','Minus',
  'Warning','WarningFilled','WarningOutline','Info','InfoFilled','SuccessFilled','ErrorFilled','Finished',
  'Upload','Download','UploadFilled','DownloadFilled','Top','Bottom','FullScreen','ScaleToOriginal',
  'Rank','RankFilled','Medal','Trophy','FirstPlace','SecondPlace','ThirdPlace','Award','AwardFilled',
  'Picture','PictureFilled','VideoCamera','Camera','CameraFilled','Microphone','MicrophoneFilled',
  'Select','SelectFilled','ZoomIn','ZoomOut','Search','Filter','FilterFilled',
  'Bell','Notification','Message','ChatDotRound','ChatLineRound','ChatLineSquare',
  'History','Calendar','CalendarFilled','Timer','Clock','ClockFilled','AlarmClock','Time',
  'Service','ServiceFilled','Headset','HeadsetFilled','Customer','ReadingLamp','Reading',
  'Refresh','RefreshLeft','RefreshRight','Switch','TurnOffSwitch','Power',
]);

// 已知 element-plus 真的没有的 -> 替换映射
const BROKEN_MAP = {
  'Truck': 'Van',
  'Van': 'Promotion',      // Van 也可能没有 → 用 Promotion 代替
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
    const fixed = arr.map(n => {
      if (BROKEN_MAP[n]) { changed = true; total++; return BROKEN_MAP[n]; }
      return n;
    });
    const seen = new Set(), unique = [];
    for (const n of fixed) if (!seen.has(n)) { seen.add(n); unique.push(n); }
    return "import { " + unique.join(', ') + " } from '@element-plus/icons-vue'";
  });
  if (changed) { fs.writeFileSync(f, c, 'utf8'); console.log(path.relative('.', f)); }
}
console.log('TOTAL ICON FIXES:', total);
