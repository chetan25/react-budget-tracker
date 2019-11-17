import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import axios from 'axios';

const config = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    databaseURL: process.env.DATABASE_URL,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
};

if (!firebase.apps.length) {
    firebase.initializeApp(config);
}
export const firestore = firebase.firestore();
export const auth = firebase.auth();

export const provider = new firebase.auth.GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
export const signInWithGoogle = () => auth.signInWithPopup(provider);
export const signInWithEmail = (email, password) => auth.signInWithEmailAndPassword(email, password);
export const createUserWithEmailPassword = (email, password) => auth.createUserWithEmailAndPassword(email, password);
firebase.auth.Auth.Persistence.SESSION = 'session';


export const createUserProfileDocument = async (user, additionalData) => {
   if (!user) { return; }
   //Get a reference for the user  in the db where user profile might be
   const userRef = firestore.doc(`users/${user.uid}`);

   // Go and fetch document form that location
    const snapshot = await userRef.get();
    if (!snapshot.exists) {
        const createdAt = new Date();
        const lastLogin = new Date();
        const { displayName, email, photoURL, uid } = user;
        try {
            await userRef.set({
                uid,
                displayName,
                email,
                photoURL,
                createdAt,
                lastLogin,
                ...additionalData,
            });
            response  } catch (error) {
            console.log(error);
        }
    }

    return getUserDocument(user.uid);
};

export const getUserDocument = async (uid) => {
    if (!uid) { return null; }

    try {
        const userDoc = await firestore.collection('users')
            .doc(uid).get();

        return { uid, ...userDoc.data() };
    } catch {
       console.log('error');
    }
};

export const addExpense = async (data) => {
    try {
        const exp = await firestore.collection('expenses')
            .add(data);
        if (exp) {
            return {added: true};
        }
    } catch {
        console.log('error');
        return {added: false};
    }

};

export const getData = () => {
    axios.get('/data')
        .then(function (response) {
            // console.log(response);
            // handle success
        })
        .catch(function (error) {
            // handle error
            console.log(error);
        })
        .finally(function () {
            // always executed
        });
};
// window.firebase = firebase; //for testing purposes
export default firebase;