'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/hooks/useAuth';
 
 /**
  * Minimal guard for protected pages:
  * - If user exists -> ready
  * - If new Firebase user -> go to /complete-profile
  * - Otherwise -> go to /auth
  */
 export function useRequireAuth() {
   const router = useRouter();
   const { isLoading, isAuthenticated, pendingFirebaseUser } = useAuth();
 
   useEffect(() => {
     if (isLoading) return;
 
     if (pendingFirebaseUser) {
       router.replace('/complete-profile');
       return;
     }
 
     if (!isAuthenticated) {
       router.replace('/auth');
     }
   }, [isLoading, isAuthenticated, pendingFirebaseUser, router]);
 
   const ready = !isLoading && isAuthenticated && !pendingFirebaseUser;
   return { ready };
 }

