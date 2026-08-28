const fs = require('fs');
let code = fs.readFileSync('src/store.tsx', 'utf8');

code = code.replace(
  "const [currentClass, setCurrentClass] = useState<string>('3학년 3반');",
  \`const [currentClassState, setCurrentClassState] = useState<string>('3학년 3반');
  const currentClass = currentClassState;
  
  const setCurrentClass = (cls: string | ((prev: string) => string)) => {
    setCurrentClassState(cls);
    setAuthTeacherClasses([]); // 해제
    sessionStorage.removeItem('parent_conference_teacher_auth_classes');
  };\`);

fs.writeFileSync('src/store.tsx', code);
