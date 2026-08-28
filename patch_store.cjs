const fs = require('fs');
let code = fs.readFileSync('src/store.tsx', 'utf8');

// Add to AppContextType
code = code.replace(
  "saveBookings: (newBookings: Record<string, Record<string, Booking>>) => void;",
  `saveBookings: (newBookings: Record<string, Record<string, Booking>>) => void;
  updateBookingSlot: (cls: string, slotKey: string, data: Booking) => void;
  removeBookingSlot: (cls: string, slotKey: string) => void;`
);

// Add the functions
const functionsToAdd = `
  const updateBookingSlot = async (cls: string, slotKey: string, data: Booking) => {
    const docRef = doc(db, 'appData', 'global');
    await updateDoc(docRef, {
      [\`bookings.\${cls}.\${slotKey}\`]: data
    });
  };

  const removeBookingSlot = async (cls: string, slotKey: string) => {
    const docRef = doc(db, 'appData', 'global');
    // We need deleteField from firestore
    const { deleteField } = require('firebase/firestore');
    await updateDoc(docRef, {
      [\`bookings.\${cls}.\${slotKey}\`]: deleteField()
    });
  };
`;
code = code.replace(
  "const saveBookings = (newBookings:",
  functionsToAdd + "\n  const saveBookings = (newBookings:"
);

// Add to AppContext.Provider value
code = code.replace(
  "bookings, saveBookings, disabledSlots, saveDisabledSlots,",
  "bookings, saveBookings, updateBookingSlot, removeBookingSlot, disabledSlots, saveDisabledSlots,"
);

// add deleteField to imports
code = code.replace(
  "import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';",
  "import { doc, onSnapshot, setDoc, updateDoc, deleteField } from 'firebase/firestore';"
);

// remove the require from the function
code = code.replace(
  "const { deleteField } = require('firebase/firestore');",
  ""
);

fs.writeFileSync('src/store.tsx', code);
