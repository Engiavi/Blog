// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { GoogleAuthProvider,getAuth, signInWithPopup } from 'firebase/auth'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
<<<<<<< HEAD
  apiKey: "AIzaSyBoHh07cN3KSmAQc3BZiVrKGGDmHj66pNo",
  authDomain: "advance-blog-eac3a.firebaseapp.com",
  projectId: "advance-blog-eac3a",
  storageBucket: "advance-blog-eac3a.appspot.com",
  messagingSenderId: "697875701566",
  appId: "1:697875701566:web:0ca8d9ac4694435be6166f"
=======
  apiKey:`${import.meta.env.VITE_APIKEY}`,
  authDomain: `${import.meta.env.VITE_DOMAIN}`,
  projectId: `${import.meta.env.VITE_PROJECTID}`,
  storageBucket: `${import.meta.env.VITE_STORAGEBUCKET}`,
  messagingSenderId: `${import.meta.env.VITE_MESS_SENDERID}`,
  appId:`${import.meta.env.VITE_APP_ID}`
>>>>>>> master
};
const app = initializeApp(firebaseConfig);

// Initialize Firebase


// google auth
const provider = new GoogleAuthProvider();
const auth = getAuth();
export const authWithGoogle = async()=>{
    let user = null;
    await signInWithPopup(auth,provider)
    .then((result)=>{
        user = result.user
    })
    .catch(err=>console.log(err))
    return user;
}