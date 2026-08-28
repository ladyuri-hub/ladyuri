const fs = require('fs');
let code = fs.readFileSync('src/components/ScheduleGrid.tsx', 'utf8');

code = code.replace(
  "const { currentClass, bookings, disabledSlots, isAdminMode, isTeacherMode, searchQuery, setSearchQuery, addToast, saveDisabledSlots, settings } = useAppContext();",
  "const { currentClass, bookings, disabledSlots, isAdminMode, isTeacherMode, searchQuery, setSearchQuery, addToast, updateDisabledSlot, settings } = useAppContext();"
);

code = code.replace(
  /const toggleDisableSlot \([^}]+?addToast\([\s\S]+?\);\s*\};/m,
  `const toggleDisableSlot = (date: string, time: string) => {
    const slotKey = \`\${date}_\${time}\`;
    const isCurrentlyDisabled = !!classDisabled[slotKey];
    updateDisabledSlot(currentClass, slotKey, !isCurrentlyDisabled);
    addToast(
      !isCurrentlyDisabled ? '해당 시간이 상담 불가로 설정되었습니다.' : '해당 시간이 신청 가능 상태로 변경되었습니다.',
      'info'
    );
  };`
);

fs.writeFileSync('src/components/ScheduleGrid.tsx', code);
