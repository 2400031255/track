import { format, differenceInDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from 'date-fns'

export const formatDate = (date) => {
  if (!date) return '—'
  const d = date?.toDate ? date.toDate() : new Date(date)
  return format(d, 'dd MMM yyyy')
}

export const formatDateTime = (date) => {
  if (!date) return '—'
  const d = date?.toDate ? date.toDate() : new Date(date)
  return format(d, 'dd MMM yyyy, hh:mm a')
}

export const daysOverdue = (dueDate) => {
  const due = dueDate?.toDate ? dueDate.toDate() : new Date(dueDate)
  const diff = differenceInDays(new Date(), due)
  return diff > 0 ? diff : 0
}

export const isThisWeek = (date) => {
  const d = date?.toDate ? date.toDate() : new Date(date)
  return isWithinInterval(d, { start: startOfWeek(new Date(), { weekStartsOn: 1 }), end: endOfWeek(new Date(), { weekStartsOn: 1 }) })
}

export const isThisMonth = (date) => {
  const d = date?.toDate ? date.toDate() : new Date(date)
  return isWithinInterval(d, { start: startOfMonth(new Date()), end: endOfMonth(new Date()) })
}

export const isThisYear = (date) => {
  const d = date?.toDate ? date.toDate() : new Date(date)
  return isWithinInterval(d, { start: startOfYear(new Date()), end: endOfYear(new Date()) })
}

export const isToday = (date) => {
  const d = date?.toDate ? date.toDate() : new Date(date)
  return format(d, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
}

export const daysRemainingInMonth = () => {
  const today = new Date()
  const end = endOfMonth(today)
  return differenceInDays(end, today) + 1
}
