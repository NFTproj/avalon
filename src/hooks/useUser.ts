'use client';

import { useEffect, useState } from 'react';

export function useUser() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        setLoading(true);
        const res = await fetch('/api/auth/me', {
          credentials: 'include',
          cache: 'no-store'
        });
        if (!res.ok) throw new Error('Erro ao buscar usuário');
        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        console.error(err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  return { user, loading };
}
