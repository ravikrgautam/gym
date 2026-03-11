import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import { Loader2, DollarSign, Calculator } from 'lucide-react';

const PayrollModal = ({ trainer, onClose }) => {
    const [month, setMonth] = useState(() => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    });
    const [payroll, setPayroll] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!trainer || !month) return;
        const fetchPayroll = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await apiFetch(`/api/trainers/${trainer.id}/payroll?month=${month}`);
                setPayroll(res);
            } catch (err) {
                setError(err.message);
                setPayroll(null);
            } finally {
                setLoading(false);
            }
        };
        fetchPayroll();
    }, [trainer, month]);

    return (
        <>
            <div className="modal-backdrop fade show overlay"></div>
            <div className="modal fade show d-block" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 shadow-lg rounded-4">
                        <div className="modal-header border-bottom-0 pb-0 d-flex justify-content-between">
                            <h5 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                                <Calculator size={20} className="text-primary" /> Payroll: {trainer.name}
                            </h5>
                            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
                        </div>
                        <div className="modal-body p-4">
                            <div className="mb-4">
                                <label className="form-label text-muted fw-bold small">Select Month</label>
                                <input
                                    type="month"
                                    className="form-control form-control-lg bg-light"
                                    value={month}
                                    onChange={(e) => setMonth(e.target.value)}
                                />
                            </div>

                            {loading ? (
                                <div className="text-center py-5 text-primary">
                                    <Loader2 size={30} className="spin mb-2 mx-auto" />
                                    <p className="small text-muted mb-0">Calculating...</p>
                                </div>
                            ) : error ? (
                                <div className="alert alert-danger mb-0">{error}</div>
                            ) : payroll ? (
                                <div className="card bg-primary bg-opacity-10 border-0 rounded-4">
                                    <div className="card-body p-4 text-center">
                                        <small className="text-primary text-uppercase fw-bold d-block mb-1">
                                            {payroll.trainer?.pay_type} compensation
                                        </small>
                                        <h2 className="fw-bold text-dark display-5 mb-0 d-flex justify-content-center align-items-center">
                                            <DollarSign size={32} className="text-success me-1" /> {payroll.payable}
                                        </h2>

                                        {payroll.trainer?.pay_type === 'ATTENDANCE' && (
                                            <div className="mt-3 py-2 px-3 bg-white rounded-pill d-inline-block border border-primary border-opacity-25 shadow-sm">
                                                <span className="text-muted small fw-medium">Based on </span>
                                                <span className="fw-bold text-dark">{payroll.attendance_days} member attendance days</span>
                                                <span className="text-muted small fw-medium text-lowercase"> assigned to their classes</span>
                                            </div>
                                        )}
                                        {payroll.trainer?.pay_type === 'FIXED' && (
                                            <div className="mt-3 py-2 px-3 bg-white rounded-pill d-inline-block border border-primary border-opacity-25 shadow-sm">
                                                <span className="text-muted small fw-medium">Based on fixed monthly salary of </span>
                                                <span className="fw-bold text-dark">₹{payroll.trainer.salary}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PayrollModal;
