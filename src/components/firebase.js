import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCBpkqdQGH2e-8eWbAAPBPs9W_w2YN1J0g",
  authDomain: "shevchuki-de83e.firebaseapp.com",
  projectId: "shevchuki-de83e",
  storageBucket: "shevchuki-de83e.appspot.com",
  messagingSenderId: "652805876173",
  appId: "1:652805876173:web:6715fcfcf902ac6da97c84"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };