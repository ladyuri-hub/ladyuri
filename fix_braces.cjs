const fs = require('fs');
let code = fs.readFileSync('src/components/TeacherPanel.tsx', 'utf8');

// I will extract the two functions entirely, and put them back safely.
// First, strip them.

code = code.replace(/const handleRestoreBriefingCSV = \([\s\S]*?e\.target\.value = '';\n  \};/g, '');
code = code.replace(/const handleRestoreCSV = \([\s\S]*?e\.target\.value = '';\n  \};/g, '');


const cleanCode = `
  const handleRestoreBriefingCSV = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split('\\n').filter((line: string) => line.trim());
      
      if (lines.length < 2) {
        alert('올바른 CSV 파일이 아니거나 데이터가 없습니다.');
        return;
      }
      
      const newSubmissions = JSON.parse(JSON.stringify(briefingSubmissions));
      let rCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map((s: string) => s.replace(/^"|"$/g, '').trim());
        if (row.length < 3) continue;
        
        const classNameFull = row[0];
        const studentName = row[1];
        const status = row[2];
        
        if (classNameFull && status) {
            newSubmissions[classNameFull] = { studentName, status };
            rCount++;
        }
      }
      
      if (rCount > 0) {
        if (confirm(\`총 \${rCount}건의 설명회 참석 데이터를 복구합니다.\\n(현재 입력된 기존 데이터는 지워지지 않고 빈자리에 추가/병합됩니다.)\\n계속하시겠습니까?\`)) {
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
      const lines = text.split('\\n').filter((line: string) => line.trim());
      
      if (lines.length < 2) {
        alert('올바른 CSV 파일이 아니거나 데이터가 없습니다.');
        return;
      }
      
      const newBookings = JSON.parse(JSON.stringify(bookings));
      let rCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map((s: string) => s.replace(/^"|"$/g, '').trim());
        if (row.length < 6) continue;
        
        const className = row[0];
        const datetime = row[1];
        const studentName = row[2];
        const parentName = row[3];
        const phone = row[4];
        const type = row[5] === '방문 상담' || row[5] === '방문' ? '방문' : '전화';
        const note = row[6] || '';
        
        const dateMatch = settings.dates.find((d: any) => datetime.startsWith(d.label));
        if (dateMatch) {
            const timePart = datetime.replace(dateMatch.label, '').trim();
            if (settings.times.includes(timePart)) {
                const slotKey = \`\${dateMatch.date}_\${timePart}\`;
                
                if (!newBookings[className]) newBookings[className] = {};
                newBookings[className][slotKey] = {
                   studentName, parentName, phone, type, note
                };
                rCount++;
            }
        }
      }
      
      if (rCount > 0) {
        if (confirm(\`총 \${rCount}건의 예약 데이터를 복구합니다.\\n(현재 새로 접수된 예약은 유지되며, 빈 시간대에만 과거 데이터가 추가/병합됩니다.)\\n계속하시겠습니까?\`)) {
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

code = code.replace(/const activeBriefingEntries = isAdminMode \? allBriefings : classBriefings;/, 'const activeBriefingEntries = isAdminMode ? allBriefings : classBriefings;\n' + cleanCode);

fs.writeFileSync('src/components/TeacherPanel.tsx', code);
