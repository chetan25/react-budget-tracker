import React, {Context, createContext, useContext} from 'react';

import { ILoggedUser } from 'Components/interface';
import { useProvideAuth } from './useProvideAuth';

interface AuthContext {
    loggedUser: ILoggedUser | null;
    loading: boolean;
    clearUser?: () => void;
}
  
// Create context with a default state.
const AuthContext: Context<AuthContext> = createContext<AuthContext>({
    loggedUser: null,
    loading: true,
});
  
export function AuthProvider({ children }: { children: React.ReactNode}): JSX.Element {
    const auth = useProvideAuth();
    return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

// Helper to easily get auth context within components
export const useAuth = () => useContext(AuthContext);