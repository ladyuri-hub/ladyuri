const fs = require('fs');
let code = fs.readFileSync('src/store.tsx', 'utf8');

code = code.replace(
  "saveDisabledSlots: (newSlots: Record<string, Record<string, boolean>>) => void;",
  `saveDisabledSlots: (newSlots: Record<string, Record<string, boolean>>) => void;
  updateDisabledSlot: (cls: string, slotKey: string, disabled: boolean) => void;`
);

const functionsToAdd = `
  const updateDisabledSlot = async (cls: string, slotKey: string, disabled: boolean) => {
    const docRef = doc(db, 'appData', 'global');
    if (disabled) {
      await updateDoc(docRef, {
        [\`disabledSlots.\${cls}.\${slotKey}\`]: true
      });
    } else {
      await updateDoc(docRef, {
        [\`disabledSlots.\${cls}.\${slotKey}\`]: deleteField()
      });
    }
  };
`;

code = code.replace(
  "const saveDisabledSlots = (newSlots:",
  functionsToAdd + "\n  const saveDisabledSlots = (newSlots:"
);

code = code.replace(
  "updateBookingSlot, removeBookingSlot, disabledSlots, saveDisabledSlots,",
  "updateBookingSlot, removeBookingSlot, disabledSlots, saveDisabledSlots, updateDisabledSlot,"
);

fs.writeFileSync('src/store.tsx', code);
