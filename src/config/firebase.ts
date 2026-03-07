import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBRvcvn87JU00xafrzVCN4BI8kA4t6xMqU",
  authDomain: "ecowatch-d0a18.firebaseapp.com",
  projectId: "ecowatch-d0a18",
  storageBucket: "ecowatch-d0a18.firebasestorage.app",
  messagingSenderId: "833920214455",
  appId: "1:833920214455:web:2506cbcefd9d5f05ff3432",
  measurementId: "G-LZJJLFR3QB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
