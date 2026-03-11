import { addMonths, addYears, format } from 'date-fns';

export const calculateEndDate = (startDateStr, planDurationStr) => {
  if (!startDateStr || !planDurationStr) return null;
  
  const startDate = new Date(startDateStr);
  const duration = parseInt(planDurationStr, 10);
  
  let endDate;
  if (duration === 12) {
    endDate = addYears(startDate, 1);
  } else {
    endDate = addMonths(startDate, duration);
  }
  
  return format(endDate, 'dd/MM/yyyy');
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount || 0);
};

export const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '--/--/----';
    return format(new Date(dateStr), 'dd/MM/yyyy');
}
