import { format, formatDistance, parseISO } from 'date-fns';
import { enGB } from 'date-fns/locale';

// Zimbabwe uses en-GB date format (dd/MM/yyyy)
const locale = enGB;

// Format date for display (Zimbabwe format)
export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'dd/MM/yyyy', { locale });
};

// Format date and time for display
export const formatDateTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'dd/MM/yyyy HH:mm', { locale });
};

// Format date for API (ISO format)
export const formatForAPI = (date: Date): string => {
  return date.toISOString();
};

// Format relative time (e.g., "2 days ago")
export const formatRelative = (date: string | Date): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistance(d, new Date(), { addSuffix: true, locale });
};

// Format currency (Zimbabwe uses comma for thousands)
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  const formatter = new Intl.NumberFormat('en-ZW', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(amount);
};

// Get current time in Harare
export const getHarareTime = (): Date => {
  // This will be handled by the backend, but for display we can use local time
  return new Date();
};