// lib/hooks/useCards.ts
'use client'

import useSWR from 'swr'
import { getAllCards } from '../api/cards'

export function useCards(page: number = 1) {
  const { data, error, isLoading, mutate } = useSWR(
    `cards:all:page:${page}`,
    async () => {
      const res = await getAllCards(page)
      return res
    },
    {
      dedupingInterval: 30_000, // evita refetch por 30s
      revalidateOnFocus: false, // não refaz ao focar a aba
    },
  )

  return {
    cards: data?.data ?? [],
    pagination: data?.meta,
    isLoading,
    error,
    mutate,
  }
}
