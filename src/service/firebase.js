import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.13.0/firebase-app.js';
import * as FIREBASE from '../env.js';

const firebaseConfig = {
  apiKey: FIREBASE.API_KEY,
  databaseURL: FIREBASE.DB_URL,
  projectId: FIREBASE.PROJECT_ID
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

export default firebaseApp;
