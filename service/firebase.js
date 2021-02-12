
const firebaseConfig = {
  apiKey: "AIzaSyD9FrJ-bsNIIkl6ld52vucKIEoe2QzLJvo",
  authDomain: "vegetable-game.firebaseapp.com",
  databaseURL: "https://vegetable-game-default-rtdb.firebaseio.com",
  projectId: "vegetable-game",
};

// Initialize Firebase
const firebaseApp = firebase.initializeApp(firebaseConfig);

export default firebaseApp;
