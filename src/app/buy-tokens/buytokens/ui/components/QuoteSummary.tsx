'use client'
export default function QuoteSummary({
  show, pixPrefix, usdcPrefix, pixText, usdcText,
}: {
  show: boolean
  pixPrefix: string
  usdcPrefix: string
  pixText: string
  usdcText: string
}) {
  if (!show) return null
  return (
    <>
      <p className="mt-2 text-sm text-gray-700">
        {pixPrefix} <strong>{pixText}</strong>
      </p>
      <p className="mt-2 text-sm text-gray-700">
        {usdcPrefix} <strong>{usdcText}</strong>
      </p>
    </>
  )
}
