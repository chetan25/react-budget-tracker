import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

const config = {
    apiKey: process.env.NEXT_PUBLIC_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
    databaseURL: process.env.NEXT_PUBLIC_DATABASE_URL,
    projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_APP_ID,
};

if (!firebase.apps.length) {
    firebase.initializeApp(config);
}
export const firestore = firebase.firestore();
export const auth = firebase.auth();

export type UserType = firebase.auth.UserCredential;
export type AuthType = firebase.User;

export const provider = new firebase.auth.GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
export const signInWithGoogle = (): Promise<UserType> => auth.signInWithPopup(provider);
export const signInWithEmail = (email: string, password: string): Promise<UserType> => auth.signInWithEmailAndPassword(email, password);
export const createUserWithEmailPassword = (email: string, password: string):Promise<UserType> => auth.createUserWithEmailAndPassword(email, password);
firebase.auth.Auth.Persistence.SESSION = 'session';

export const createUserProfileDocument = async (
    user: AuthType | null, additionalData?: Record<string, any>): Promise<Record<string, any> | null>  => {
   if (!user) { return null; }
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
            // response
        } catch (error) {
            // console.log(error);
        }
    }

    return getUserDocument(user.uid);
};

export const getUserDocument = async (uid: AuthType['uid']): Promise<Record<string, any> | null> => {
    if (!uid) { return null; }

    try {
        const userDoc = await firestore.collection('users')
            .doc(uid).get();

        return { uid, ...userDoc.data() };
    } catch {
       // console.log('error');
       return null;
    }
};

export const addExpense = async (data: firebase.firestore.DocumentData): Promise<Record<'added', boolean>> => {
    try {
        const exp = await firestore.collection('expenses')
            .add(data);
        if (exp) {
            return {added: true};
        }
        return {added: false};
    } catch(error) {
        // console.log('error', error);
        return {added: false};
    }

};

export const deleteExpense = async (id: string): Promise<Record<'deleted', boolean>> => {
    try {
        await firestore.collection('expenses')
            .doc(id)
            .delete();
        return {deleted: true};
    } catch(error) {
        // console.log('error', error);
        return {deleted: false};
    }

};

// window.firebase = firebase; //for testing purposes
export default firebase;
