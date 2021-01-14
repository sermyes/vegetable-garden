import { Process } from '../env.js';

const firebaseConfig = {
  apiKey: Process.ENV_API_KEY,
  authDomain: Process.ENV_AUTH_DOMAIN,
  projectId: Process.ENV_PROJECT_ID,
};

// Initialize Firebase
const firebaseApp = firebase.initializeApp(firebaseConfig);

export default firebaseApp;
