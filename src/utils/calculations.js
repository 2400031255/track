import { toPaise } from './currency'

export const calculateMonthlyInterest = (principalPaise, interestType, interestValue) => {
  if (interestType === 'fixed') return toPaise(interestValue)
  if (interestType === 'percentage') return Math.round((principalPaise * parseFloat(interestValue)) / 100)
  return 0
}

export const calculateLateFee = (monthlyInterestPaise, lateFeePerDay, daysLate) => {
  if (!lateFeePerDay || daysLate <= 0) return 0
  return toPaise(lateFeePerDay) * daysLate
}

export const calculateTotalDue = (monthlyInterestPaise, lateFee) => monthlyInterestPaise + lateFee

export const generateLoanId = () => {
  const ts = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `LN-${ts}-${rand}`
}

export const generateBorrowerId = () => {
  const ts = Date.now().toString(36).toUpperCase()
  return `BR-${ts}`
}

export const generateCollateralId = () => {
  const ts = Date.now().toString(36).toUpperCase()
  return `COL-${ts}`
}
