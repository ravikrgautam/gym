import html2pdf from 'html2pdf.js';

export const exportToPdf = (elementId, filename) => {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element not found: ${elementId}`);
        return;
    }

    // Force .pdf extension to prevent "file is not pdf" OS issues
    const finalFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

    const opt = {
        margin: 0,
        filename: finalFilename,
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Use html2pdf for robust cross-browser generation
    html2pdf().set(opt).from(element).save()
        .then(() => {
            console.log(`PDF successfully saved as ${finalFilename}`);
        })
        .catch(err => {
            console.error('PDF generation encountered an error:', err);
        });
};
