import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithCredential,
  GoogleAuthProvider,
} from "firebase/auth";
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAHmoN_WdrtTzuht2Ufyb9mE-48PxJcCcI",
  authDomain: "rest-link.firebaseapp.com",
  projectId: "rest-link",
  storageBucket: "rest-link.firebasestorage.app",
  messagingSenderId: "1055502627876",
  appId: "1:1055502627876:web:b52e2928913138778994b1",
  measurementId: "G-5QYN2GGGFX",
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

// Function to exchange Auth Code for Firebase Credential
export const firebaseSignInWithGoogle = async (authCode: string) => {
  try {
    const credential = GoogleAuthProvider.credential(authCode);
    const result = await signInWithCredential(auth, credential);
    console.log("Firebase User:", result.user);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Firebase:", error);
  }
};

export { firebaseApp, auth };

// const analytics = getAnalytics(app);
