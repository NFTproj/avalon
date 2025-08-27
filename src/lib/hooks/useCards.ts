// lib/hooks/useCards.ts
'use client'

import useSWR from 'swr'
import { getAllCards } from '../api/cards';

export function useCards() {
  const { data, error, isLoading, mutate } = useSWR(
    'cards:all',
    async () => {
      const res = await getAllCards(); // sua função já existente
      return res?.data ?? [];
    },
    {
      dedupingInterval: 30_000,     // evita refetch por 30s
      revalidateOnFocus: false,     // não refaz ao focar a aba
    }
  );

  return { cards: data, isLoading, error, mutate };
}
