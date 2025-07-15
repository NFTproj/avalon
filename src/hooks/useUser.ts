'use client';

import { useEffect, useState } from 'react';

export function useUser() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/me');
        if (!res.ok) throw new Error('Erro ao buscar usuário');
        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        console.error(err);
      }
    }

    fetchUser();
  }, []);

  return { user };
}
