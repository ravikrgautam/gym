import React, { useState, useEffect } from 'react';

const PaymentModal = ({ show, onClose, member, plans, onSave }) => {
    const [formData, setFormData] = useState({
        invoice_date: new Date().toISOString().split('T')[0],
        invoice_number: `INV-${Math.floor(Math.random() * 10000)}`, // Basic auto-gen for now
        order_receipt_no: '',
        pack_name: '',
        pack_validity_from: new Date().toISOString().split('T')[0],
        pack_validity_to: '',
        branch_name: '',
        mrp: 0,
        discount: 0,
        tax_percentage: 18,
        payment_mode: 'UPI',
        notes: ''
    });

    useEffect(() => {
        if (show && member) {
            setFormData(prev => ({
                ...prev,
                invoice_number: `INV-${Date.now().toString().slice(-6)}`,
                pack_validity_from: new Date().toISOString().split('T')[0],
                pack_validity_to: member.plan_expiry_date ? member.plan_expiry_date.split('T')[0] : '',
                pack_name: member.plan_name || ''
            }));
        }
    }, [show, member]);

    const base_price = Math.max(0, formData.mrp - formData.discount);
    const tax_amount = (base_price * (formData.tax_percentage / 100)).toFixed(2);
    const total_payable = (base_price + parseFloat(tax_amount)).toFixed(2);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            base_price,
            tax_amount,
            total_payable,
            buyer_name: member.name,
            buyer_phone: member.phone
        };
        onSave(payload);
    };

    if (!show) return null;

    return (
        <>
            <div className="modal-backdrop fade show overlay"></div>
            <div className="modal fade show d-block" tabIndex="-1">
                <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                    <div className="modal-content border-0 shadow-lg rounded-4">
                        <div className="modal-header border-bottom-0 pb-0">
                            <h5 className="fw-bold">Record Payment for {member?.name}</h5>
                            <button type="button" className="btn-close" onClick={onClose}></button>
                        </div>
                        <div className="modal-body p-4">
                            <form id="paymentForm" onSubmit={handleSubmit}>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label small text-muted">Invoice Date</label>
                                        <input type="date" className="form-control" value={formData.invoice_date} onChange={e => setFormData({ ...formData, invoice_date: e.target.value })} required />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small text-muted">Invoice Number</label>
                                        <input type="text" className="form-control bg-light" value={formData.invoice_number} readOnly />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label small text-muted">Pack / Plan Name</label>
                                        <select className="form-select" value={formData.pack_name} onChange={e => {
                                            const selectedPlan = plans.find(p => p.name === e.target.value);
                                            if (selectedPlan) {
                                                const fromDate = new Date(formData.pack_validity_from);
                                                fromDate.setMonth(fromDate.getMonth() + selectedPlan.duration_months);
                                                setFormData({ ...formData, pack_name: selectedPlan.name, mrp: selectedPlan.price, pack_validity_to: fromDate.toISOString().split('T')[0] });
                                            } else {
                                                setFormData({ ...formData, pack_name: e.target.value });
                                            }
                                        }}>
                                            <option value="">Select Plan...</option>
                                            {plans.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                                            <option value="Custom">Custom / Other</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small text-muted">Order / Receipt No</label>
                                        <input type="text" className="form-control" value={formData.order_receipt_no} onChange={e => setFormData({ ...formData, order_receipt_no: e.target.value })} />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label small text-muted">Validity From</label>
                                        <input type="date" className="form-control" value={formData.pack_validity_from} onChange={e => setFormData({ ...formData, pack_validity_from: e.target.value })} required />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small text-muted">Validity To</label>
                                        <input type="date" className="form-control" value={formData.pack_validity_to} onChange={e => setFormData({ ...formData, pack_validity_to: e.target.value })} required />
                                    </div>

                                    <div className="col-md-4">
                                        <label className="form-label small text-muted">MRP (₹)</label>
                                        <input type="number" className="form-control" value={formData.mrp} onChange={e => setFormData({ ...formData, mrp: parseFloat(e.target.value) || 0 })} required />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label small text-muted">Discount (₹)</label>
                                        <input type="number" className="form-control" value={formData.discount} onChange={e => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })} />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label small text-muted">Base Price (₹)</label>
                                        <input type="number" className="form-control bg-light" value={base_price} readOnly />
                                    </div>

                                    <div className="col-md-4">
                                        <label className="form-label small text-muted">Tax %</label>
                                        <input type="number" className="form-control" value={formData.tax_percentage} onChange={e => setFormData({ ...formData, tax_percentage: parseFloat(e.target.value) || 0 })} />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label small text-muted">Tax Amount (₹)</label>
                                        <input type="number" className="form-control bg-light" value={tax_amount} readOnly />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label small fw-bold text-dark">Total Payable (₹)</label>
                                        <input type="number" className="form-control fw-bold bg-success bg-opacity-10 text-success" value={total_payable} readOnly />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label small text-muted">Payment Mode</label>
                                        <select className="form-select" value={formData.payment_mode} onChange={e => setFormData({ ...formData, payment_mode: e.target.value })} required>
                                            <option value="Cash">Cash</option>
                                            <option value="UPI">UPI</option>
                                            <option value="Card">Card</option>
                                            <option value="Bank Transfer">Bank Transfer</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small text-muted">Branch / Center Name</label>
                                        <input type="text" className="form-control" value={formData.branch_name} onChange={e => setFormData({ ...formData, branch_name: e.target.value })} />
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label small text-muted">Notes</label>
                                        <textarea className="form-control" rows="2" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })}></textarea>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer border-top-0 pt-0">
                            <button type="button" className="btn btn-light rounded-pill px-4" onClick={onClose}>Cancel</button>
                            <button type="submit" form="paymentForm" className="btn btn-primary rounded-pill px-4 shadow-sm">Save Payment</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PaymentModal;
