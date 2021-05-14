import React from 'react';
import { AppProps } from 'next/app';
import { AuthProvider } from 'Services/useAuth';

export default function MyApp({ Component, pageProps }: AppProps): JSX.Element {
    return (
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    );
}
