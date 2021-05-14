import { Subject } from 'rxjs';
import { auth } from "Root/firebase-settings";

const subject = new Subject();
let state = null;
let unSubscribeAuth; 

/**
 * Deprecated, used in tandem with with-auth HOC
 */
export const userService = {
    subscribe: setState => subject.subscribe(setState),
    init: () => {
        if (state) {
            subject.next(state);
        } else {
            unSubscribeAuth = auth.onAuthStateChanged((userAuth) => {
                const loggedUser = userAuth ? {
                    uid: userAuth.uid,
                    displayName: userAuth.displayName,
                    photoURL: userAuth.photoURL,
                    email: userAuth.email,
                } : null;
                state = loggedUser;
                subject.next(loggedUser);
            });
        }
    },
    clearUser: () => {
        unSubscribeAuth();
        state = null;
        subject.unsubscribe()
    },
    // getUser: () => subject.asObservable()
};