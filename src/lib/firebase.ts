import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
// import { MOCK_USERS } from "./mock-data";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app);
const storage = getStorage(app);

// NOTE: The following logic is for populating a new Firebase project with mock data.
// It should only be run once.
/*
import { collection, doc, setDoc, writeBatch } from "firebase/firestore"; 
import { MOCK_CARS, MOCK_USERS, MOCK_BRANDS, MOCK_MODELS, MOCK_YEARS } from './mock-data';

const populateFirestore = async () => {
    console.log("Populating Firestore with mock data...");
    try {
        const batch = writeBatch(db);

        // Add users
        MOCK_USERS.forEach(user => {
            const { id, ...userData } = user;
            const userRef = doc(db, "users", id);
            batch.set(userRef, userData);
        });

        // Add cars
        MOCK_CARS.forEach(car => {
            const { id, ...carData } = car;
            const carRef = doc(db, "cars", id);
            batch.set(carRef, carData);
        });
        
        // Add filters config
        const filtersRef = doc(db, "config", "filters");
        batch.set(filtersRef, {
            brands: MOCK_BRANDS,
            models: MOCK_MODELS,
            years: MOCK_YEARS
        });

        await batch.commit();
        console.log("Firestore populated successfully!");
    } catch(e) {
        console.error("Error populating Firestore: ", e);
    }
}
// Run this function from a browser console or a temporary script if you need to seed your database.
//
// window.populateFirestore = populateFirestore;
//
*/


export { app, auth, db, rtdb, storage };
