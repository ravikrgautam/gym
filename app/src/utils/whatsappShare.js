export const shareViaWhatsApp = (receiptData) => {
    const {
        gymName,
        gymPhone,
        memberName,
        amountPaid,
        planDuration,
        invoiceNo,
        endDate
    } = receiptData;

    // Formatting a professional WhatsApp message
    const message = `*${gymName.toUpperCase() || 'GYM'} - Payment Receipt* 🧾
    
Hello ${memberName || 'Member'},
Thank you for your payment! Here are your receipt details:

*Receipt No:* ${invoiceNo}
*Plan:* ${planDuration} Month(s)
*Valid Until:* ${endDate || '--/--/----'}
*Amount Paid:* ₹${amountPaid || '0.00'}

Please let us know if you need the PDF version.
    
Regards,
*${gymName || 'Gym Management'}*
${gymPhone ? `📞 ${gymPhone}` : ''}`;

    // Encode the message
    const encodedMessage = encodeURIComponent(message);

    // Create WhatsApp link (wa.me)
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;

    // Open in new tab
    window.open(whatsappUrl, '_blank');
};
