const fs = require('fs');

function fixWarnings(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');
  // replace `json.warning` with `json.data?.warning`
  code = code.replace(/json\.warning/g, 'json.data?.warning');
  fs.writeFileSync(filePath, code);
}

fixWarnings('src/app/dashboard/events/page.tsx');
fixWarnings('src/app/dashboard/notifications/page.tsx');
console.log('Fixed warnings in frontend');
