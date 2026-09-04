const fs = require('fs');
let code = fs.readFileSync('src/components/TeacherPanel.tsx', 'utf8');

// Find duplicate handleRestoreCSV as well
const rIdx1 = code.indexOf('const handleRestoreCSV =');
const rIdx2 = code.indexOf('const handleRestoreCSV =', rIdx1 + 1);

if (rIdx2 > -1) {
    const rIdx2End = code.indexOf('};', rIdx2) + 2;
    code = code.slice(0, rIdx2) + code.slice(rIdx2End);
}

// Check brackets
fs.writeFileSync('src/components/TeacherPanel.tsx', code);
