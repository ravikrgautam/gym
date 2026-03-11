import React from 'react';
import { Phone, Calendar, CalendarCheck } from 'lucide-react';
import { formatCurrency, formatDateDisplay } from '../utils/dateUtils';

const ReceiptPreview = ({ data }) => {
    const {
        gymName,
        gymPhone,
        gymLogo,
        memberName,
        planDuration,
        startDate,
        endDate,
        amountPaid,
        paymentMode,
        enableGst,
        gstPercentage,
        invoiceNo,
        issueDate
    } = data;

    // Derive subtotal vs tax if GST is enabled.
    // We assume 'amountPaid' is the total final amount.
    // total = subtotal + (subtotal * gst / 100) -> subtotal = total / (1 + gst/100)
    let totalNum = parseFloat(amountPaid) || 0;
    let subtotal = totalNum;
    let taxAmount = 0;
    let gstNum = parseFloat(gstPercentage) || 0;

    if (enableGst && gstNum > 0) {
        subtotal = totalNum / (1 + (gstNum / 100));
        taxAmount = totalNum - subtotal;
    }

    return (
        <div className="receipt-preview-container bg-secondary bg-opacity-10 p-2 p-sm-4 rounded d-flex justify-content-center overflow-auto shadow-inner w-100">
            <div id="receipt-document" className="receipt-document bg-white shadow-sm position-relative">

                <div className="p-4 p-md-5">
                    {/* Header */}
                    <div className="row align-items-center mb-4 pb-4 border-bottom border-2 border-dark">
                        <div className="col-7">
                            {gymLogo && <img src={gymLogo} alt="Gym Logo" className="img-fluid mb-2 rounded" style={{ maxHeight: '80px' }} />}
                            <h2 className="fw-bold mb-1 text-uppercase mb-0 text-dark" style={{ wordBreak: 'break-word' }}>
                                {gymName || 'Gym Name'}
                            </h2>
                            <p className="mb-0 text-secondary d-flex align-items-center gap-1">
                                <Phone size={14} /> <span>{gymPhone || '-----'}</span>
                            </p>
                        </div>
                        <div className="col-5 text-end">
                            <h1 className="text-uppercase fw-bold text-primary opacity-75 mb-2" style={{ letterSpacing: '2px' }}>RECEIPT</h1>
                            <p className="mb-1 text-muted small fw-bold text-uppercase">Receipt No.</p>
                            <h5 className="fw-bold text-dark font-monospace mb-0">{invoiceNo || 'GYM-0001'}</h5>
                        </div>
                    </div>

                    {/* Meta Info */}
                    <div className="row mb-5">
                        <div className="col-6">
                            <h6 className="text-muted fw-bold small text-uppercase mb-2">Received From</h6>
                            <h4 className="fw-bold mb-0 text-dark" style={{ wordBreak: 'break-word' }}>{memberName || 'Member Name'}</h4>
                        </div>
                        <div className="col-6 text-end">
                            <h6 className="text-muted fw-bold small text-uppercase mb-2">Issue Date</h6>
                            <h5 className="fw-medium mb-0 text-dark">{formatDateDisplay(issueDate)}</h5>
                        </div>
                    </div>

                    {/* Details Table */}
                    <div className="table-responsive rounded border mb-4">
                        <table className="table table-borderless mb-0">
                            <thead className="bg-light">
                                <tr className="border-bottom">
                                    <th scope="col" className="py-3 text-uppercase small fw-bold text-muted w-50">Description</th>
                                    <th scope="col" className="py-3 text-uppercase small fw-bold text-muted text-center">Duration</th>
                                    <th scope="col" className="py-3 text-uppercase small fw-bold text-muted text-end">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="py-4 align-middle">
                                        <h6 className="fw-bold mb-2 text-dark">Gym Membership</h6>
                                        <p className="mb-0 text-muted small d-flex flex-column gap-1">
                                            <span className="d-flex align-items-center gap-2"><Calendar size={14} /> <span className="fw-medium text-dark">From:</span> {formatDateDisplay(startDate)}</span>
                                            <span className="d-flex align-items-center gap-2"><CalendarCheck size={14} /> <span className="fw-medium text-dark">To:</span> {endDate || '--/--/----'}</span>
                                        </p>
                                    </td>
                                    <td className="py-4 align-middle text-center fw-medium text-dark">
                                        <span>{planDuration || '1'} Month(s)</span>
                                    </td>
                                    <td className="py-4 align-middle text-end fw-bold text-dark fs-5">
                                        {formatCurrency(subtotal)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Totals Section */}
                    <div className="row justify-content-end mb-5">
                        <div className="col-sm-8 col-md-6">

                            {enableGst && (
                                <div className="d-flex justify-content-between mb-2 text-muted border-bottom pb-2 px-2">
                                    <span className="fw-medium">GST ({gstPercentage || 0}%)</span>
                                    <span>{formatCurrency(taxAmount)}</span>
                                </div>
                            )}

                            <div className="d-flex justify-content-between align-items-center bg-light p-3 rounded border">
                                <span className="text-uppercase fw-bold text-dark">Total Paid</span>
                                <h3 className="mb-0 fw-bold text-primary">{formatCurrency(totalNum)}</h3>
                            </div>
                            <div className="text-end mt-2 text-muted small pe-2">
                                Payment Mode: <strong className="text-dark">{paymentMode || 'Cash'}</strong>
                            </div>
                        </div>
                    </div>

                    {/* Footer Section */}
                    <div className="row mt-5 pt-4 border-top position-absolute bottom-0 w-100 start-0 px-4 pb-4">
                        <div className="col-12 text-center text-muted">
                            <p className="mb-1 fw-medium text-dark">Thank you for your business!</p>
                            <p className="small opacity-75 mb-0">This is a computer-generated receipt.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReceiptPreview;
