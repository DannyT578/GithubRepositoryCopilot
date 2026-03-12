'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { account } from '@/lib/appwrite';
import { useAppStore } from '@/lib/store';
import { getMe, setApiToken } from '@/lib/api';

export default function AuthCallback() {
  const router = useRouter();
  const { setUser, setAuthChecked } = useAppStore();

  useEffect(() => {
    (async () => {
      let session;
      try {
        session = await account.getSession('current');
      } catch (e) {
        console.error('[auth/callback] getSession failed:', e);
        setUser(null);
        setAuthChecked(true);
        router.replace('/?error=session_failed');
        return;
      }

      const token = session.providerAccessToken;
      if (!token) {
        console.error('[auth/callback] session exists but providerAccessToken is empty:', session);
        setUser(null);
        setAuthChecked(true);
        router.replace('/?error=no_token');
        return;
      }

      try {
        setApiToken(token);
        const user = await getMe();
        setUser(user);
        setAuthChecked(true);
        router.replace('/');
      } catch (e) {
        console.error('[auth/callback] getMe() failed:', e);
        setUser(null);
        setAuthChecked(true);
        router.replace('/?error=backend_failed');
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground text-sm">Completing sign in…</p>
    </div>
  );
}
