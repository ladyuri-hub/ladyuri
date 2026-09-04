const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  projectId: "utopian-radar-28chg",
  appId: "1:345946862987:web:e75e392abc6a29b798ab8e",
  apiKey: "AIzaSyAKNNNa0SP9R1xyTR0MJYFf-PmLDG6Z0rM",
  authDomain: "utopian-radar-28chg.firebaseapp.com",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "ai-studio-c64e667b-a479-47ec-97d4-832937e96fe5");

async function check() {
  const colRef = collection(db, 'appData');
  const snap = await getDocs(colRef);
  snap.forEach(doc => {
    console.log(doc.id, "=>", doc.data());
  });
  process.exit(0);
}
check();
