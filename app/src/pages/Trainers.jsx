import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, CalendarHeart, FileText } from 'lucide-react';
import { apiFetch } from '../utils/api';
import PayrollModal from '../components/PayrollModal';

// Simplified Monthly Report Component inside Trainers scope
const MonthlyReportModal = ({ onClose }) => {
    const [month, setMonth] = useState(() => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    });
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchReport = async () => {
            setLoading(true);
            try {
                const res = await apiFetch(`/api/payroll/report?month=${month}`);
                setReport(res);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [month]);

    return (
        <>
            <div className="modal-backdrop fade show overlay"></div>
            <div className="modal fade show d-block" tabIndex="-1">
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content border-0 shadow-lg rounded-4">
                        <div className="modal-header border-bottom-0 pb-0 d-flex justify-content-between align-items-center">
                            <h5 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                                <FileText size={20} className="text-primary" /> Payroll Summary Report
                            </h5>
                            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
                        </div>
                        <div className="modal-body p-4">
                            <div className="mb-4">
                                <label className="form-label text-muted fw-bold small">Select Month</label>
                                <input
                                    type="month"
                                    className="form-control form-control-lg bg-light w-50"
                                    value={month}
                                    onChange={(e) => setMonth(e.target.value)}
                                />
                            </div>

                            {loading ? (
                                <div className="text-center py-5 text-muted">Loading report...</div>
                            ) : !report || report.length === 0 ? (
                                <div className="text-center py-5 text-muted">No payroll data available for {month}.</div>
                            ) : (
                                <div className="table-responsive rounded-4 shadow-sm border overflow-hidden">
                                    <table className="table table-hover mb-0 align-middle">
                                        <thead className="bg-light">
                                            <tr>
                                                <th className="py-3 px-4 border-0 text-muted small fw-bold text-uppercase">Trainer</th>
                                                <th className="py-3 px-4 border-0 text-muted small fw-bold text-uppercase">Pay Type</th>
                                                <th className="py-3 px-4 border-0 text-muted small fw-bold text-uppercase">Attendance Days</th>
                                                <th className="py-3 px-4 border-0 text-muted small fw-bold text-uppercase text-end">Total Payable</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {report.map((r, i) => (
                                                <tr key={i}>
                                                    <td className="py-3 px-4 fw-bold">{r.trainer}</td>
                                                    <td className="py-3 px-4"><span className="badge bg-secondary bg-opacity-10 text-secondary">{r.type}</span></td>
                                                    <td className="py-3 px-4 text-muted">{r.days !== null ? r.days : '-'}</td>
                                                    <td className="py-3 px-4 text-end fw-bold text-success">₹{(r.payable || 0).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                            <tr className="bg-light border-top border-2 border-dark border-opacity-10">
                                                <td colSpan="3" className="py-3 px-4 fw-bold text-end">Total Gym Payroll:</td>
                                                <td className="py-3 px-4 text-end fw-bold text-dark fs-5">
                                                    ₹{report.reduce((acc, curr) => acc + curr.payable, 0).toFixed(2)}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const Trainers = () => {
    const [trainers, setTrainers] = useState([
  { id: 1, name: 'Vikram Rao', phone: '9871234560', specialty: 'Strength & HIIT' },
  { id: 2, name: 'Pooja Sharma', phone: '9845678901', specialty: 'Yoga & Pilates' },
  { id: 3, name: 'Rahul Desai', phone: '9823456780', specialty: 'CrossFit & Cardio' },
  { id: 4, name: 'Neha Kulkarni', phone: '9867890123', specialty: 'Zumba & Dance Fitness' },
]);
    const [loading, setLoading] = useState(false);

    // UI states
    const [showModal, setShowModal] = useState(false);
    const [showReport, setShowReport] = useState(false);
    const [payrollTrainer, setPayrollTrainer] = useState(null);

    const [formData, setFormData] = useState({ name: '', phone: '', specialty: '', salary: 0, pay_type: 'FIXED' });

    const fetchTrainers = async () => {
        setLoading(true);
        try {
            const res = await apiFetch('/api/trainers');
            setTrainers(res);
        } catch (err) {
            console.error("Failed to fetch trainers", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTrainers(); }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await apiFetch('/api/trainers', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            setShowModal(false);
            setFormData({ name: '', phone: '', specialty: '', salary: 0, pay_type: 'FIXED' });
            fetchTrainers();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Remove this trainer?")) return;
        try {
            await apiFetch(`/api/trainers/${id}`, { method: 'DELETE' });
            fetchTrainers();
        } catch (err) { }
    };

    return (
        <div className="container-fluid p-0 max-w-7xl mx-auto">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold text-dark d-flex align-items-center gap-2 mb-1">
                        <Users className="text-primary" /> Trainers & Payroll
                    </h3>
                    <p className="text-muted mb-0">Manage your gym's coaching roster and salaries.</p>
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-primary rounded-pill px-4 d-flex align-items-center gap-2 shadow-sm bg-white" onClick={() => setShowReport(true)}>
                        <FileText size={16} /> Monthly Report
                    </button>
                    <button className="btn btn-primary rounded-pill px-4 d-flex align-items-center gap-2 shadow-sm" onClick={() => setShowModal(true)}>
                        <Plus size={16} /> Add Trainer
                    </button>
                </div>
            </div>

            <div className="row g-4">
                {loading ? (
                    <div className="col-12 text-center py-5 text-muted">Loading trainers...</div>
                ) : trainers.length === 0 ? (
                    <div className="col-12 text-center py-5 text-muted">No trainers added yet.</div>
                ) : trainers.map(t => (
                    <div className="col-md-4" key={t.id}>
                        <div className="card border-0 shadow-sm h-100 rounded-4 position-relative">
                            <button className="btn btn-sm btn-light btn-icon position-absolute top-0 end-0 m-3 rounded-circle" title="Delete" onClick={() => handleDelete(t.id)}>
                                <Trash2 size={16} className="text-danger" />
                            </button>
                            <div className="card-body p-4 text-center">
                                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-3 text-primary mb-3">
                                    <Users size={24} />
                                </div>
                                <h5 className="fw-bold text-dark mb-1">{t.name}</h5>
                                <div className="text-muted small mb-2 font-monospace">{t.phone}</div>
                                <div className="d-flex flex-column gap-2 mt-3">
                                    <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 rounded-pill px-3 py-2 text-wrap">
                                        {t.specialty || 'General Training'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modals */}
            {payrollTrainer && (
                <PayrollModal trainer={payrollTrainer} onClose={() => setPayrollTrainer(null)} />
            )}

            {showReport && (
                <MonthlyReportModal onClose={() => setShowReport(false)} />
            )}

            {showModal && (
                <>
                    <div className="modal-backdrop fade show overlay"></div>
                    <div className="modal fade show d-block" tabIndex="-1">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content border-0 shadow-lg rounded-4">
                                <div className="modal-header border-bottom-0 pb-0">
                                    <h5 className="fw-bold">Add New Trainer</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <form id="trainerForm" onSubmit={handleSave}>
                                        <div className="mb-3">
                                            <label className="form-label small fw-medium text-muted">Full Name *</label>
                                            <input type="text" className="form-control rounded-3 bg-light" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label small fw-medium text-muted">Phone Number *</label>
                                            <input type="text" className="form-control rounded-3 bg-light" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label small fw-medium text-muted">Specialty / Role *</label>
                                            <input type="text" className="form-control rounded-3 bg-light" placeholder="e.g. Yoga Instructor" value={formData.specialty} onChange={e => setFormData({ ...formData, specialty: e.target.value })} required />
                                        </div>
                                        <div className="row g-2 mb-4">
                                            <div className="col-6">
                                                <label className="form-label small fw-medium text-muted">Monthly Pay Strategy *</label>
                                                <select className="form-select rounded-3 bg-light" value={formData.pay_type} onChange={(e) => setFormData({ ...formData, pay_type: e.target.value })} required>
                                                    <option value="FIXED">Fixed Salary</option>
                                                    <option value="ATTENDANCE">Per-Attendance Pro-rata</option>
                                                </select>
                                            </div>
                                            <div className="col-6">
                                                <label className="form-label small fw-medium text-muted">Salary Value (₹) *</label>
                                                <input type="number" min="0" step="any" className="form-control rounded-3 bg-light" value={formData.salary} onChange={e => setFormData({ ...formData, salary: e.target.value })} required />
                                            </div>
                                        </div>
                                    </form>
                                </div>
                                <div className="modal-footer border-top-0 pt-0">
                                    <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" form="trainerForm" className="btn btn-primary rounded-pill px-4 shadow-sm">Save Trainer</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Trainers;
