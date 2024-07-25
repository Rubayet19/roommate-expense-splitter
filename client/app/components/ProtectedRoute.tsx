'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '../services/authService';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  console.log('ProtectedRoute rendered (client-side)');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        console.log("Checking authentication...");
        const user = await getCurrentUser();
        console.log("User:", user);
        if (user) {
          console.log("User is authenticated");
          setIsAuthenticated(true);
        } else {
          console.log("User is not authenticated, redirecting to login");
          router.push('/login');
        }
      } catch (error) {
        console.error('Authentication error:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <>{children}</> : null;
}