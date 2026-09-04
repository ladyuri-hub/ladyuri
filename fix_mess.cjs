const fs = require('fs');
let code = fs.readFileSync('src/components/TeacherPanel.tsx', 'utf8');

// Replace the duplicated tail end
code = code.replace(/  \};\s*\};\s*reader\.readAsText\(file\);\s*e\.target\.value = '';\s*\};\s*const titleText/g, '  };\n\n  const titleText');

fs.writeFileSync('src/components/TeacherPanel.tsx', code);
