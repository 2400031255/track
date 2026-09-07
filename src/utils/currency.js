// Currency: store as paise (integer), display as rupees
export const toPaise = (rupees) => Math.round(parseFloat(rupees || 0) * 100)
export const toRupees = (paise) => (paise || 0) / 100
export const formatCurrency = (paise) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(toRupees(paise))
export const formatRupees = (rupees) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(rupees)
