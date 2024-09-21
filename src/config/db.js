// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyADOZEgfapTYsVWYI58cwn1Q6uYXZ_hkCA",
  authDomain: "bingoreeactgame2023.firebaseapp.com",
  projectId: "bingoreeactgame2023",
  storageBucket: "bingoreeactgame2023.appspot.com",
  messagingSenderId: "671124800328",
  appId: "1:671124800328:web:ebef792ee3f1ffde18e97d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export { db };

