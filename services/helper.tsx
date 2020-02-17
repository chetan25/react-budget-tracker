const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

export const formatCurrency = (currency: number) => {
    return formatter.format(currency);
};