// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { GoogleAuthProvider,getAuth, signInWithPopup } from 'firebase/auth'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey:`${import.meta.env.VITE_APIKEY}`,
  authDomain: `${import.meta.env.VITE_DOMAIN}`,
  projectId: `${import.meta.env.VITE_PROJECTID}`,
  storageBucket: `${import.meta.env.VITE_STORAGEBUCKET}`,
  messagingSenderId: `${import.meta.env.VITE_MESS_SENDERID}`,
  appId:`${import.meta.env.VITE_APP_ID}`
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