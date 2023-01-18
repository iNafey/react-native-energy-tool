//Firebase config key setup

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// Import the functions you need from the SDKs you need
//import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
    apiKey: "AIzaSyA9FKQ7m5tcoxOHrzE6-Poo0rWv-YLvQxc",
    authDomain: "igse-tool-db.firebaseapp.com",
    projectId: "igse-tool-db",
    storageBucket: "igse-tool-db.appspot.com",
    messagingSenderId: "563322076205",
    appId: "1:563322076205:web:b7d1a3195cb96eb5988ca4",
    measurementId: "G-W6CCL6SF6V"
}

// Initialize Firebase
//const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);

if (!firebase.apps.length){
    firebase.initializeApp(firebaseConfig);
    firebase.firestore().settings({ experimentalForceLongPolling: true , merge:true});
}

export {firebase} ;