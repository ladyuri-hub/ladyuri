const fs = require('fs');

let code = fs.readFileSync('src/components/TeacherPanel.tsx', 'utf8');

// I will just remove the broken functions and re-insert them cleanly.

// 1. Remove all instances of handleRestoreBriefingCSV
code = code.replace(/const handleRestoreBriefingCSV = \([\s\S]*?e\.target\.value = '';\n  \};/g, '');
code = code.replace(/const handleRestoreBriefingCSV = \([\s\S]*?e\.target\.value = '';\n    \};/g, '');

// 2. Remove all instances of handleRestoreCSV
code = code.replace(/const handleRestoreCSV = \([\s\S]*?e\.target\.value = '';\n  \};/g, '');
code = code.replace(/const handleRestoreCSV = \([\s\S]*?e\.target\.value = '';\n    \};/g, '');


// 3. Re-insert them once, properly
const cleanCode = `
  const handleRestoreBriefingCSV = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split('\\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        alert('올바른 CSV 파일이 아니거나 데이터가 없습니다.');
        return;
      }
      
      const newSubmissions = { ...briefingSubmissions };
      let restoredCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map(s => s.replace(/^"|"$/g, '').trim());
        if (row.length < 3) continue;
        
        const classNameFull = row[0];
        const studentName = row[1];
        const status = row[2];
        
        if (classNameFull && status) {
            newSubmissions[classNameFull] = { studentName, status };
            restoredCount++;
        }
      }
      
      if (restoredCount > 0) {
        if (confirm(\`총 \${restoredCount}건의 설명회 참석 데이터를 복구하시겠습니까?\`)) {
           saveBriefingSubmissions(newSubmissions);
           alert('복구가 완료되었습니다.');
        }
      } else {
        alert('복구할 데이터 형식을 찾을 수 없습니다.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleRestoreCSV = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split('\\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        alert('올바른 CSV 파일이 아니거나 데이터가 없습니다.');
        return;
      }
      
      const newBookings = { ...bookings };
      let restoredCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map(s => s.replace(/^"|"$/g, '').trim());
        if (row.length < 6) continue;
        
        const className = row[0];
        const datetime = row[1];
        const studentName = row[2];
        const parentName = row[3];
        const phone = row[4];
        const type = row[5] === '방문 상담' || row[5] === '방문' ? '방문' : '전화';
        const note = row[6] || '';
        
        const dateMatch = settings.dates.find(d => datetime.startsWith(d.label));
        if (dateMatch) {
            const timePart = datetime.replace(dateMatch.label, '').trim();
            if (settings.times.includes(timePart)) {
                const slotKey = \`\${dateMatch.date}_\${timePart}\`;
                
                if (!newBookings[className]) newBookings[className] = {};
                newBookings[className][slotKey] = {
                   studentName, parentName, phone, type, note
                };
                restoredCount++;
            }
        }
      }
      
      if (restoredCount > 0) {
        if (confirm(\`총 \${restoredCount}건의 예약 데이터를 복구하시겠습니까?\`)) {
           saveBookings(newBookings);
           alert('복구가 완료되었습니다.');
        }
      } else {
        alert('복구할 데이터 형식을 찾을 수 없습니다.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };
`;

// Find where to insert them
code = code.replace(/const activeBriefingEntries = isAdminMode \? allBriefings : classBriefings;/, 'const activeBriefingEntries = isAdminMode ? allBriefings : classBriefings;\n' + cleanCode);

// Fix trailing }
code = code.replace(/\n\s*\}\s*\}\s*$/m, ''); // Try to clean up stray brackets if they exist

fs.writeFileSync('src/components/TeacherPanel.tsx', code);

