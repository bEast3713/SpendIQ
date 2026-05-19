export const CURRENCIES = [
  { code: 'AED', label: 'UAE Dirham (AED)', symbol: 'AED' },
  { code: 'USD', label: 'US Dollar (USD)', symbol: '$' },
  { code: 'EUR', label: 'Euro (EUR)', symbol: '€' },
  { code: 'GBP', label: 'British Pound (GBP)', symbol: '£' },
  { code: 'INR', label: 'Indian Rupee (INR)', symbol: '₹' },
];

export const getCurrencySymbol = (code: string = 'AED') => {
  return CURRENCIES.find(c => c.code === code)?.symbol || '$';
};

export const formatAmount = (amount: number, code: string = 'AED') => {
  const symbol = getCurrencySymbol(code);
  return `${symbol}${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};
