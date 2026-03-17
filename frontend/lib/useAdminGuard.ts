'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from './api';
import { useAuth } from '@/authContext/authContext';

type GuardState = 'checking' | 'allowed' | 'denied';

type MeResponse = {
    success: boolean; 
    id?: string;
    name?: string;
    email?: string;
    role?: string;
  };


export function useAdminGuard() {
  const { user, loading } = useAuth();
  const [guardState, setGuardState] = useState<GuardState>('checking');

  useEffect(() => {
    let cancelled = false;

    async function verifyAdmin() {
      if (loading) return;

      if (!user) {
        if (!cancelled) setGuardState('denied');
        return;
      }

      try {
        setGuardState('checking');

        const res = await apiFetch('/auth/admin', {
          method: 'GET',
        });
        
        if (!res.ok) {
          if (!cancelled) setGuardState('denied');
          return;
        }

        const json: MeResponse = await res.json();        
        const role = json?.role;

        if (!cancelled) {
          setGuardState(role === 'admin' ? 'allowed' : 'denied');
        }
      } catch (error) {
        if (!cancelled) {
          setGuardState('denied');
        }
      }
    }

    verifyAdmin();

    return () => {
      cancelled = true;
    };
  }, [loading, user]);

  return {
    isChecking: loading || guardState === 'checking',
    isAllowed: guardState === 'allowed',
    isDenied: !loading && guardState === 'denied',
  };
}