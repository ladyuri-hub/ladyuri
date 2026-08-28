import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "utopian-radar-28chg",
  appId: "1:345946862987:web:e75e392abc6a29b798ab8e",
  apiKey: "AIzaSyAKNNNa0SP9R1xyTR0MJYFf-PmLDG6Z0rM",
  authDomain: "utopian-radar-28chg.firebaseapp.com",
  storageBucket: "utopian-radar-28chg.firebasestorage.app",
  messagingSenderId: "345946862987"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "ai-studio-c64e667b-a479-47ec-97d4-832937e96fe5");
