const fs = require('fs');
let code = fs.readFileSync('src/components/Modals.tsx', 'utf8');

code = code.replace(
  "const { currentClass, bookings, saveBookings, addToast } = useAppContext();",
  "const { currentClass, bookings, updateBookingSlot, addToast } = useAppContext();"
);

code = code.replace(
  /const newBookings = \{\s*\.\.\.bookings,\s*\[currentClass\]: \{\s*\.\.\.classBookings,\s*\[slotKey\]: (\{[^}]+\})\s*\}\s*\};\s*saveBookings\(newBookings\);/,
  "updateBookingSlot(currentClass, slotKey, $1);"
);

code = code.replace(
  "const { currentClass, bookings, isAdminMode, isTeacherMode, saveBookings, addToast } = useAppContext();",
  "const { currentClass, bookings, isAdminMode, isTeacherMode, removeBookingSlot, addToast } = useAppContext();"
);

code = code.replace(
  "const newBookings = { ...bookings };\n        delete newBookings[currentClass][slotKey];\n        saveBookings(newBookings);",
  "removeBookingSlot(currentClass, slotKey);"
);

code = code.replace(
  "const newBookings = { ...bookings };\n      delete newBookings[currentClass][slotKey];\n      saveBookings(newBookings);",
  "removeBookingSlot(currentClass, slotKey);"
);

// We need to also patch ConfirmModal just in case
code = code.replace(
  "const { currentClass, bookings, saveBookings, disabledSlots, saveDisabledSlots, addToast } = useAppContext();",
  "const { currentClass, bookings, saveBookings, removeBookingSlot, disabledSlots, saveDisabledSlots, addToast } = useAppContext();"
);
code = code.replace(
  "const newBookings = { ...bookings };\n      delete newBookings[currentClass][info.slotKey];\n      saveBookings(newBookings);",
  "removeBookingSlot(currentClass, info.slotKey);"
);

fs.writeFileSync('src/components/Modals.tsx', code);
