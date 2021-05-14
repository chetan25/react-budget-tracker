import {useState, useEffect} from "react";
import { ILoggedUser } from 'Components/interface';
import { auth } from "Root/firebase-settings";

export function useProvideAuth(): {
    loggedUser: ILoggedUser | null;
    loading: boolean;
    clearUser: () => void
} {
    const [loggedUser, setLoggedUser] = useState<ILoggedUser | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
  
    /**
     * Callback for when firebase signOut.
     * Sets auth state to null and loading to true.
     */
    const clearUser = () => {
      setLoggedUser(null);
      setLoading(true);
    };
  
    /**
     * Watches for state change for firebase auth and calls the handleUser callback
     * on every change.
     */
    useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged((userAuth) => {
            const user = userAuth ? {
                uid: userAuth.uid,
                displayName: userAuth.displayName,
                photoURL: userAuth.photoURL,
                email: userAuth.email,
            } : null;
            setLoggedUser(user);
            setLoading(false);
        });
      return () => unsubscribe();
    }, []);
  
    // returns state values and callbacks for signIn and signOut.
    return {
      loggedUser,
      loading,
      clearUser,
    };
  }
