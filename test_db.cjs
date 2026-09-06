const { initializeApp } = require('firebase/app');
const { getFirestore, getDoc, doc } = require('firebase/firestore');

const firebaseConfig = {
  projectId: "ai-studio-c64e667b-a479-47ec-97d4-832937e96fe5",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkBackups() {
  const docRef = doc(db, 'backups', 'auto_2026-09-06T00');
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    console.log("Found 12AM backup: " + JSON.stringify(docSnap.data().label));
  } else {
    console.log("No 12AM backup");
  }
}
checkBackups().then(() => process.exit(0));
