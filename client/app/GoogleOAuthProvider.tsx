'use client';

import { GoogleOAuthProvider as Provider } from '@react-oauth/google';
import { ReactNode, useEffect } from 'react';

export function GoogleOAuthProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    console.log("GoogleOAuthProvider mounted");
    console.log("Client ID being used:", process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
  }, []);

  if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
    console.error("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not defined");
    return <div>Error: Google Client ID is not configured</div>;
  }

  return (
    <Provider 
      clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
      onScriptLoadError={() => {
        console.error("Google OAuth script failed to load");
      }}
    >
      {children}
    </Provider>
  );
}