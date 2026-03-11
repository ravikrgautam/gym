import React, { useState, useEffect } from 'react';
import { Download, Plus, FileText, ChevronRight } from 'lucide-react';
import PaymentModal from './PaymentModal';
import { exportToPdf } from '../utils/pdfExport';

const PaymentHistoryModal = ({ show, onClose, member, plans }) => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddPayment, setShowAddPayment] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null); // For PDF generation

    const fetchPayments = async () => {
        if (!member) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('gymSaaS_token');
            const res = await fetch(`http://localhost:3001/api/members/${member.id}/invoices`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setPayments(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (show && !showAddPayment) fetchPayments();
    }, [show, member, showAddPayment]);

    const handleSavePayment = async (payload) => {
        try {
            const token = localStorage.getItem('gymSaaS_token');
            const res = await fetch(`http://localhost:3001/api/members/${member.id}/invoices`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setShowAddPayment(false);
                fetchPayments();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDownloadPDF = async (invoice) => {
        setSelectedInvoice(invoice);
        // Wait for state to update and render the hidden DOM element
        setTimeout(() => {
            exportToPdf('hidden-invoice-template', `Invoice_${invoice.invoice_number}`);
            setTimeout(() => setSelectedInvoice(null), 1000); // clear after a bit
        }, 100);
    };

    if (!show && !showAddPayment) return null;

    if (showAddPayment) {
        return <PaymentModal show={true} onClose={() => setShowAddPayment(false)} member={member} plans={plans} onSave={handleSavePayment} />;
    }

    return (
        <>
            <div className="modal-backdrop fade show overlay"></div>
            <div className="modal fade show d-block" tabIndex="-1">
                <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                    <div className="modal-content border-0 shadow-lg rounded-4">
                        <div className="modal-header border-bottom-0 pb-0 d-flex justify-content-between">
                            <h5 className="fw-bold mb-0">Payment History: {member?.name}</h5>
                            <button type="button" className="btn-close" onClick={onClose}></button>
                        </div>
                        <div className="modal-body p-4">
                            <div className="d-flex justify-content-end mb-3">
                                <button className="btn btn-primary btn-sm rounded-pill px-3 d-flex align-items-center gap-1 shadow-sm" onClick={() => setShowAddPayment(true)}>
                                    <Plus size={16} /> Record New Payment
                                </button>
                            </div>

                            {loading ? (
                                <p className="text-center text-muted py-4">Loading history...</p>
                            ) : payments.length === 0 ? (
                                <div className="text-center py-5 bg-light rounded-4">
                                    <FileText className="text-muted mb-2 opacity-50" size={40} />
                                    <h6 className="text-muted">No payment records found</h6>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table align-middle">
                                        <thead className="table-light">
                                            <tr>
                                                <th className="small text-muted py-2 border-0 rounded-start">Date</th>
                                                <th className="small text-muted py-2 border-0">Invoice #</th>
                                                <th className="small text-muted py-2 border-0">Plan</th>
                                                <th className="small text-muted py-2 border-0">Amount</th>
                                                <th className="small text-muted py-2 border-0 text-end rounded-end">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {payments.map(p => (
                                                <tr key={p.id}>
                                                    <td>{p.issue_date.split('T')[0]}</td>
                                                    <td className="font-monospace text-muted">{p.invoice_number}</td>
                                                    <td>{p.pack_name || '-'}</td>
                                                    <td className="fw-medium text-success">₹{p.total_payable}</td>
                                                    <td className="text-end">
                                                        <button className="btn btn-sm btn-outline-secondary rounded-pill d-flex align-items-center gap-1 ms-auto" onClick={() => handleDownloadPDF(p)}>
                                                            <Download size={14} /> PDF
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden DOM for PDF Export */}
            {selectedInvoice && (
                <div style={{ display: 'none' }}>
                    <div id="hidden-invoice-template" style={{ width: '210mm', padding: '15mm', backgroundColor: 'white', color: 'black', fontFamily: 'sans-serif' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '20px' }}>
                            <div>
                                <h1 style={{ margin: 0, color: '#333' }}>INVOICE</h1>
                                <p style={{ margin: '5px 0 0 0', color: '#666' }}>Invoice #: {selectedInvoice.invoice_number}</p>
                                <p style={{ margin: '0', color: '#666' }}>Date: {selectedInvoice.issue_date.split('T')[0]}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                {/* Gym Logo Placeholder */}
                                <div style={{ width: '50px', height: '50px', backgroundColor: '#ddd', borderRadius: '5px', display: 'inline-block', marginBottom: '10px' }}></div>
                                <h3 style={{ margin: 0 }}>Gym Fitness Center</h3>
                                <p style={{ margin: '0', color: '#666' }}>{selectedInvoice.branch_name || 'Main Branch'}</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                            <div>
                                <h4 style={{ margin: '0 0 10px 0', color: '#555' }}>Billed To:</h4>
                                <strong style={{ fontSize: '1.1em' }}>{selectedInvoice.buyer_name || member?.name}</strong>
                                <p style={{ margin: '5px 0 0 0', color: '#666' }}>Phone: {selectedInvoice.buyer_phone || member?.phone}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <h4 style={{ margin: '0 0 10px 0', color: '#555' }}>Payment Info:</h4>
                                <p style={{ margin: '0', color: '#666' }}>Method: <strong>{selectedInvoice.payment_mode}</strong></p>
                                {selectedInvoice.order_receipt_no && <p style={{ margin: '0', color: '#666' }}>Receipt No: {selectedInvoice.order_receipt_no}</p>}
                            </div>
                        </div>

                        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                                    <th style={{ padding: '12px', textAlign: 'left', color: '#444' }}>Description</th>
                                    <th style={{ padding: '12px', textAlign: 'center', color: '#444' }}>Validity Period</th>
                                    <th style={{ padding: '12px', textAlign: 'right', color: '#444' }}>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '12px' }}>
                                        <strong>{selectedInvoice.pack_name || 'Custom Membership'}</strong>
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'center', color: '#666' }}>
                                        {selectedInvoice.pack_validity_from} to {selectedInvoice.pack_validity_to}
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'right' }}>₹{selectedInvoice.mrp}</td>
                                </tr>
                            </tbody>
                        </table>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
                            <div style={{ width: '300px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                                    <span>Subtotal:</span>
                                    <span>₹{selectedInvoice.mrp}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', color: '#dc3545' }}>
                                    <span>Discount:</span>
                                    <span>- ₹{selectedInvoice.discount}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                                    <span>Tax ({selectedInvoice.tax_percentage}%):</span>
                                    <span>₹{selectedInvoice.tax_amount}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '2px solid #333', marginTop: '5px' }}>
                                    <strong style={{ fontSize: '1.2em' }}>Total Paid:</strong>
                                    <strong style={{ fontSize: '1.2em' }}>₹{selectedInvoice.total_payable}</strong>
                                </div>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid #eee', paddingTop: '20px', textAlign: 'center', color: '#888', fontSize: '0.9em' }}>
                            <p style={{ margin: '0 0 5px 0' }}>{selectedInvoice.notes}</p>
                            <p style={{ margin: '0', fontWeight: 'bold' }}>Thank you for your business!</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PaymentHistoryModal;
