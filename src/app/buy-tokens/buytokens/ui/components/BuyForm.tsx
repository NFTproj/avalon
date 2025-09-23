'use client'
import FloatingField from '@/components/core/Inputs/FloatingField'
import CurrencyPill from './CurrencyPill'

export default function BuyForm({
  amount, qty, tokenTicker, accent,
  onAmountChange, onQtyChange,
  payLabel = 'Pagar', receiveLabel = 'Receber', placeholderAmount = '0.00'
}: {
  amount: string
  qty: string
  tokenTicker: string
  accent: string
  onAmountChange: (v: string) => void
  onQtyChange: (v: string) => void
  payLabel?: string
  receiveLabel?: string
  placeholderAmount?: string
}) {
  return (
    <>
      <FloatingField
        className="mt-2"
        id="fiat-amount"
        label={payLabel}
        type="number"
        value={amount}
        onChange={onAmountChange}
        placeholder={placeholderAmount}
        accent={accent}
        rightSlot={<CurrencyPill label="USD" />}
      />

      <FloatingField
        className="mt-6"
        label={receiveLabel}
        value={qty}
        onChange={onQtyChange}
        placeholder="0"
        accent={accent}
        rightSlot={<CurrencyPill label={tokenTicker} />}
      />
    </>
  )
}
