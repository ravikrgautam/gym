import React, { useState, useEffect } from 'react';
import { Receipt, Download, Share2, RefreshCw } from 'lucide-react';
import ReceiptForm from '../components/ReceiptForm';
import ReceiptPreview from '../components/ReceiptPreview';
import LockScreen from '../components/LockScreen';
import { calculateEndDate } from '../utils/dateUtils';
import { getNextInvoiceNumber, incrementInvoiceNumber, resetInvoiceCounter } from '../utils/invoiceCounter';
import { exportToPdf } from '../utils/pdfExport';
import { shareViaWhatsApp } from '../utils/whatsappShare';

function App() {
  const [isUnlocked, setIsUnlocked] = useState(false);

  // App State matching the required data structure
  const [receiptData, setReceiptData] = useState({
    gymName: '',
    gymPhone: '',
    gymLogo: null,
    memberName: '',
    planDuration: '1',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    amountPaid: '',
    paymentMode: 'Cash',
    enableGst: false,
    gstPercentage: '18',
    invoiceNo: '',
    issueDate: new Date().toISOString()
  });

  // Init logic
  useEffect(() => {
    // Check lock status
    const unlocked = localStorage.getItem('gymAppUnlocked') === 'true';
    setIsUnlocked(unlocked);

    // Init invoice number
    setReceiptData(prev => ({
      ...prev,
      invoiceNo: getNextInvoiceNumber()
    }));
  }, []);

  // Recalculate End Date whenever startDate or planDuration changes
  useEffect(() => {
    if (receiptData.startDate && receiptData.planDuration) {
      const end = calculateEndDate(receiptData.startDate, receiptData.planDuration);
      setReceiptData(prev => ({ ...prev, endDate: end }));
    }
  }, [receiptData.startDate, receiptData.planDuration]);

  // Handlers
  const handleDataChange = (updates) => {
    setReceiptData(prev => ({ ...prev, ...updates }));
  };

  const handleUnlock = () => {
    localStorage.setItem('gymAppUnlocked', 'true');
    setIsUnlocked(true);
  };

  const handleResetCounter = () => {
    if (window.confirm("Are you sure you want to reset the invoice counter to GYM-0001?")) {
      const newNum = resetInvoiceCounter();
      setReceiptData(prev => ({ ...prev, invoiceNo: newNum }));
    }
  };

  const handleDownloadPDF = () => {
    exportToPdf('receipt-document', `Receipt_${receiptData.invoiceNo}`);

    // Auto increment after successful download assumption (per standard behavior, though spec didn't strictly say *when* to increment)
    const nextInvoice = incrementInvoiceNumber();
    setReceiptData(prev => ({ ...prev, invoiceNo: nextInvoice }));
  };

  const handleWhatsAppShare = () => {
    shareViaWhatsApp(receiptData);

    // Auto increment on share too
    const nextInvoice = incrementInvoiceNumber();
    setReceiptData(prev => ({ ...prev, invoiceNo: nextInvoice }));
  };

  return (
    <>
      <LockScreen isUnlocked={isUnlocked} onUnlock={handleUnlock} />

      {/* Main Content */}
      <div className="container-fluid px-xl-5 py-4 pb-5">
        <div className="row g-4">

          {/* Left Column: Input Form */}
          <div className="col-lg-5 col-xl-4">
            <ReceiptForm data={receiptData} onChange={handleDataChange} />
          </div>

          {/* Right Column: Live A4 Preview */}
          <div className="col-lg-7 col-xl-8">

            {/* Action Buttons Overlay */}
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-3 gap-3">
              <h5 className="mb-0 fw-bold d-none d-lg-block text-secondary">Live Receipt Preview</h5>
              <div className="d-flex gap-2 w-100 w-sm-auto justify-content-end">
                <button
                  className="btn btn-success rounded-pill px-4 shadow-sm d-flex align-items-center gap-2 flex-grow-1 flex-sm-grow-0"
                  onClick={handleWhatsAppShare}
                >
                  <Share2 size={18} /> <span>Share <span className="d-none d-md-inline">WA</span></span>
                </button>
                <button
                  className="btn btn-primary rounded-pill px-4 shadow-sm d-flex align-items-center gap-2 flex-grow-1 flex-sm-grow-0"
                  onClick={handleDownloadPDF}
                >
                  <Download size={18} /> <span>Download <span className="d-none d-md-inline">PDF</span></span>
                </button>
              </div>
            </div>

            {/* A4 Wrapper */}
            <ReceiptPreview data={receiptData} />

          </div>
        </div>
      </div>
    </>
  );
}

export default App;
