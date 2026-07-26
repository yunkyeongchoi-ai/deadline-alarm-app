import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// ⚠️ 발급받으신 Firebase 웹 설정값으로 교체해서 사용하세요.
const firebaseConfig = {
  apiKey: "AIzaSyB4SBNqv40Tj4LTgqlBfMtni1wRRtbuaFk",
  authDomain: "deadline-alarm-app.firebaseapp.com",
  projectId: "deadline-alarm-app",
  storageBucket: "deadline-alarm-app.firebasestorage.app",
  messagingSenderId: "477829363987",
  appId: "1:477829363987:web:1df18d241e4c2f2ae282e6"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
