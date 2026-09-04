const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

const firebaseConfig = {
  projectId: "utopian-radar-28chg",
  appId: "1:345946862987:web:e75e392abc6a29b798ab8e",
  apiKey: "AIzaSyAKNNNa0SP9R1xyTR0MJYFf-PmLDG6Z0rM",
  authDomain: "utopian-radar-28chg.firebaseapp.com",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "ai-studio-c64e667b-a479-47ec-97d4-832937e96fe5");

async function check() {
  const docRef = doc(db, 'appData', 'global');
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    console.log(JSON.stringify(snap.data(), null, 2));
  } else {
    console.log("Document does not exist");
  }
  process.exit(0);
}
check();
