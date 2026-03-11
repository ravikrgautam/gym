export const getNextInvoiceNumber = () => {
    const current = localStorage.getItem('gymReceiptCounter');
    if (!current) {
        return 'GYM-0001';
    }
    const nextNum = parseInt(current, 10) + 1;
    return `GYM-${nextNum.toString().padStart(4, '0')}`;
};

export const incrementInvoiceNumber = () => {
    const current = localStorage.getItem('gymReceiptCounter');
    let nextNum = 1;
    if (current) {
        nextNum = parseInt(current, 10) + 1;
    }
    localStorage.setItem('gymReceiptCounter', nextNum.toString());
    return `GYM-${nextNum.toString().padStart(4, '0')}`;
};

export const resetInvoiceCounter = () => {
    localStorage.removeItem('gymReceiptCounter');
    return 'GYM-0001';
}
