const hexToRgb = (hex?: string) => {
  if (!hex) {
    return ''
  }

  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r}, ${g}, ${b}`
}

export default hexToRgb

export const hexToRgba = (hex?: string, opacity?: number) => {
  if (!hex) {
    return ''
  }

  const rgb = hexToRgb(hex)
  return `rgba(${rgb}, ${opacity})`
}
