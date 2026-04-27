import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD8QTgaTDT2w8zYJ5v3oFia436ldywdzJo",
  authDomain: "ai-business-consultant-9bbd7.firebaseapp.com",
  projectId: "ai-business-consultant-9bbd7",
  storageBucket: "ai-business-consultant-9bbd7.firebasestorage.app",
  messagingSenderId: "1007790039524",
  appId: "1:1007790039524:web:9981db98c98f726dcd27f1",
  measurementId: "G-J0VNPZN3Y5",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;