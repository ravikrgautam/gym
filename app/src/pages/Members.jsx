import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Users, Plus, Edit2, Trash2, Search, Download, CreditCard, QrCode } from 'lucide-react';
import Papa from 'papaparse';
import PaymentHistoryModal from '../components/PaymentHistoryModal';
import QRCodeModal from '../components/QRCodeModal';

const Members = () => {
    const { gymData } = useOutletContext();
    const [members, setMembers] = useState([]);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sortByExpiry, setSortByExpiry] = useState(false);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMember, setPaymentMember] = useState(null);
    const [showQRModal, setShowQRModal] = useState(false);
    const [qrMember, setQrMember] = useState(null);
    const [showDirectPaymentModal, setShowDirectPaymentModal] = useState(false);
    const [dateError, setDateError] = useState('');
    const [formData, setFormData] = useState({ name: '', phone: '', status: 'ACTIVE', join_date: new Date().toISOString().split('T')[0], plan_id: '', plan_expiry_date: '', shift: '' });

    const getExpiryBadge = (expiryDate) => {
        if (!expiryDate) return <span className="badge bg-secondary ms-2">No Plan</span>;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const exp = new Date(expiryDate);
        const diffTime = exp.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return <span className="badge bg-secondary ms-2">Expired</span>;
        if (diffDays <= 6) return <span className="badge bg-danger ms-2">{diffDays} days left</span>;
        if (diffDays <= 30) return <span className="badge bg-warning text-dark ms-2">{diffDays} days left</span>;
        return <span className="badge bg-success ms-2">{diffDays} days left</span>;
    };

    const fetchMembers = async () => {
        try {
            const token = localStorage.getItem('gymSaaS_token');
            const res = await fetch('http://localhost:3001/api/members', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setMembers(data);
        } catch (err) {
            console.error("Error fetching members:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchPlans = async () => {
        try {
            const token = localStorage.getItem('gymSaaS_token');
            const res = await fetch('http://localhost:3001/api/plans', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setPlans(data);
        } catch (err) {
            console.error("Error fetching plans:", err);
        }
    };

    useEffect(() => {
        fetchMembers();
        fetchPlans();
    }, []);

    const openAddModal = () => {
        setEditingMember(null);
        setDateError('');
        setFormData({ name: '', phone: '', status: 'ACTIVE', join_date: new Date().toISOString().split('T')[0], plan_id: '', plan_expiry_date: '', shift: '' });
        setShowModal(true);
    };

    const openEditModal = (member) => {
        setEditingMember(member);
        setDateError('');
        const jd = member.join_date ? (member.join_date.includes(' ') ? member.join_date.split(' ')[0] : member.join_date) : new Date().toISOString().split('T')[0];
        const expiry = member.plan_expiry_date ? member.plan_expiry_date.split('T')[0] : (member.end_date ? member.end_date.split('T')[0] : '');
        setFormData({ name: member.name, phone: member.phone, status: member.status, join_date: jd, plan_id: member.plan_id || '', plan_expiry_date: expiry, shift: member.shift || '' });
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('gymSaaS_token');
        const isEditing = !!editingMember;
        const url = isEditing
            ? `http://localhost:3001/api/members/${editingMember.id}`
            : `http://localhost:3001/api/members`;

        try {
            const res = await fetch(url, {
                method: isEditing ? 'PUT' : 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                setShowModal(false);
                fetchMembers();
                if (!isEditing) {
                    setPaymentMember(data);
                    setShowDirectPaymentModal(true);
                }
            }
        } catch (err) {
            console.error("Failed to save member:", err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this member?")) return;

        try {
            const token = localStorage.getItem('gymSaaS_token');
            const res = await fetch(`http://localhost:3001/api/members/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) fetchMembers();
        } catch (err) {
            console.error("Failed to delete member:", err);
        }
    };

    const handleExportCSV = () => {
        const csv = Papa.unparse(members.map(m => ({
            "ID": m.id,
            "Name": m.name,
            "Phone": m.phone,
            "Status": m.status,
            "Current Plan": m.plan_name || 'None',
            "Plan Expiry": m.end_date || 'N/A'
        })));

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${gymData?.name || 'gym'}_members.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getDaysRemainingText = (expiryDate) => {
        if (!expiryDate) return '';
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const exp = new Date(expiryDate);
        const diffTime = exp.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays < 0) return 'Expired';
        return `${diffDays} days left`;
    };

    let filteredMembers = members.filter(m =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.phone.includes(search)
    );

    if (sortByExpiry) {
        filteredMembers.sort((a, b) => {
            const dateA = new Date(a.plan_expiry_date || a.end_date || '9999-12-31').getTime();
            const dateB = new Date(b.plan_expiry_date || b.end_date || '9999-12-31').getTime();
            return dateA - dateB;
        });
    }

    return (
        <div className="container-fluid p-0 max-w-7xl mx-auto">

            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold text-dark d-flex align-items-center gap-2 mb-1">
                        <Users className="text-primary" /> Member Base
                    </h3>
                    <p className="text-muted mb-0">Manage your active, inactive, and lead members securely.</p>
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary rounded-pill px-4 d-flex align-items-center gap-2 shadow-sm bg-white" onClick={handleExportCSV}>
                        <Download size={16} /> Export CSV
                    </button>
                    <button className="btn btn-primary rounded-pill px-4 d-flex align-items-center gap-2 shadow-sm" onClick={openAddModal}>
                        <Plus size={16} /> Add Member
                    </button>
                </div>
            </div>

            {/* List Card */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center">
                    <div className="position-relative" style={{ width: '300px' }}>
                        <Search className="position-absolute text-muted" size={16} style={{ top: '10px', left: '16px' }} />
                        <input
                            type="text"
                            className="form-control rounded-pill ps-5 bg-light border-0"
                            placeholder="Search members..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div>
                        <button className={`btn btn-sm ${sortByExpiry ? 'btn-primary' : 'btn-outline-secondary'} rounded-pill`} onClick={() => setSortByExpiry(!sortByExpiry)}>
                            Sort by Expiry
                        </button>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="small text-muted text-uppercase fw-semibold py-3 ps-4 border-0">Member</th>
                                <th className="small text-muted text-uppercase fw-semibold py-3 border-0">Shift</th>
                                <th className="small text-muted text-uppercase fw-semibold py-3 border-0">Plan Name</th>
                                <th className="small text-muted text-uppercase fw-semibold py-3 border-0">Expiry Date</th>
                                <th className="small text-muted text-uppercase fw-semibold py-3 border-0">Fee Info</th>
                                <th className="small text-muted text-uppercase fw-semibold py-3 border-0 text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-5 text-muted">Loading secure data...</td></tr>
                            ) : filteredMembers.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-5 text-muted">No members found.</td></tr>
                            ) : (
                                filteredMembers.map(m => (
                                    <tr key={m.id}>
                                        <td className="ps-4">
                                            <span className="fw-medium text-dark d-block">{m.name}</span>
                                            <small className="font-monospace text-muted">{m.phone}</small>
                                        </td>
                                        <td>
                                            {m.shift ?
                                                <span className="badge bg-light text-dark border border-secondary border-opacity-25">{m.shift}</span>
                                                : '-'}
                                        </td>
                                        <td>
                                            <span className="fw-medium text-dark">{m.current_plan_name || m.plan_name || 'No Plan'}</span>
                                        </td>
                                        <td>
                                            {(m.plan_expiry_date || m.end_date) ? (
                                                <div>
                                                    <span className="d-block text-muted">{new Date(m.plan_expiry_date || m.end_date).toLocaleDateString()}</span>
                                                    {getExpiryBadge(m.plan_expiry_date || m.end_date)}
                                                </div>
                                            ) : (
                                                <span className="text-muted opacity-50">N/A</span>
                                            )}
                                        </td>
                                        <td>
                                            {(m.current_plan_fee !== undefined || m.plan_name) ? (
                                                <div>
                                                    <span className="d-block fw-bold text-dark">₹{m.current_plan_fee || 0}</span>
                                                    <span className={`badge ${m.fee_status === 'Paid' ? 'bg-success' : (m.fee_status === 'Overdue' ? 'bg-danger' : 'bg-warning')} bg-opacity-10 text-${m.fee_status === 'Paid' ? 'success' : (m.fee_status === 'Overdue' ? 'danger' : 'warning')} border`}>
                                                        {m.fee_status || 'Paid'}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-muted opacity-50">-</span>
                                            )}
                                        </td>
                                        <td className="text-end pe-4">
                                            <button className="btn btn-sm btn-light btn-icon me-2 rounded-circle" title="QR Code" onClick={() => { setQrMember(m); setShowQRModal(true); }}>
                                                <QrCode size={16} className="text-dark opacity-75" />
                                            </button>
                                            <button className="btn btn-sm btn-light btn-icon me-2 rounded-circle" title="Payments" onClick={() => { setPaymentMember(m); setShowPaymentModal(true); }}>
                                                <CreditCard size={16} className="text-success" />
                                            </button>
                                            <button className="btn btn-sm btn-light btn-icon me-2 rounded-circle" title="Edit" onClick={() => openEditModal(m)}>
                                                <Edit2 size={16} className="text-primary" />
                                            </button>
                                            <button className="btn btn-sm btn-light btn-icon rounded-circle" title="Delete" onClick={() => handleDelete(m.id)}>
                                                <Trash2 size={16} className="text-danger" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Simulated Bootstrap Modal for CRUD */}
            {showQRModal && qrMember && (
                <QRCodeModal member={qrMember} onClose={() => { setShowQRModal(false); setQrMember(null); }} />
            )}

            {showModal && (
                <>
                    <div className="modal-backdrop fade show overlay"></div>
                    <div className="modal fade show d-block" tabIndex="-1">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content border-0 shadow-lg rounded-4">
                                <div className="modal-header border-bottom-0 pb-0">
                                    <h5 className="fw-bold">{editingMember ? 'Edit Member' : 'Add New Member'}</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <form id="memberForm" onSubmit={handleSave}>
                                        <div className="mb-3">
                                            <label className="form-label small fw-medium text-muted">Full Name</label>
                                            <input type="text" className="form-control rounded-3 bg-light" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label small fw-medium text-muted">Phone Number</label>
                                            <input type="text" className="form-control rounded-3 bg-light" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label small fw-medium text-muted">Join Date</label>
                                            <input type="date" className="form-control rounded-3 bg-light" value={formData.join_date} onChange={e => {
                                                const newJoin = e.target.value;
                                                let err = '';
                                                if (formData.plan_expiry_date && newJoin && new Date(formData.plan_expiry_date) <= new Date(newJoin)) {
                                                    err = "Plan Expiry Date must be after Join Date";
                                                }
                                                setDateError(err);
                                                setFormData({ ...formData, join_date: newJoin });
                                            }} required />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label small fw-medium text-muted">Plan Expiry Date *</label>
                                            <input type="date" className={`form-control rounded-3 bg-light ${dateError ? 'is-invalid' : ''}`} value={formData.plan_expiry_date}
                                                onChange={e => {
                                                    const expiry = e.target.value;
                                                    let newStatus = formData.status;
                                                    let err = '';
                                                    if (expiry && formData.join_date && new Date(expiry) <= new Date(formData.join_date)) {
                                                        err = "Plan Expiry Date must be after Join Date";
                                                    } else if (expiry && new Date(expiry) < new Date(new Date().setHours(0, 0, 0, 0))) {
                                                        newStatus = 'INACTIVE';
                                                    }
                                                    setDateError(err);
                                                    setFormData({ ...formData, plan_expiry_date: expiry, status: newStatus });
                                                }} required />
                                            {dateError && <div className="invalid-feedback">{dateError}</div>}
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label small fw-medium text-muted">Gym Shift *</label>
                                            <select className="form-select rounded-3 bg-light" value={formData.shift} onChange={e => setFormData({ ...formData, shift: e.target.value })} required>
                                                <option value="" disabled>Select Shift</option>
                                                <option value="Morning">Morning</option>
                                                <option value="Evening">Evening</option>
                                                <option value="Both">Both</option>
                                            </select>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label small fw-medium text-muted">Status</label>
                                            <select className="form-select rounded-3 bg-light" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                                <option value="ACTIVE">Active (Current Member)</option>
                                                <option value="INACTIVE">Inactive (Expired/Lead)</option>
                                            </select>
                                        </div>
                                        <div className="mb-4">
                                            <label className="form-label small fw-medium text-muted">Initial Membership Plan</label>
                                            <select className="form-select rounded-3 bg-light" value={formData.plan_id} onChange={e => setFormData({ ...formData, plan_id: e.target.value })}>
                                                <option value="">No Plan</option>
                                                {plans.map(plan => (
                                                    <option key={plan.id} value={plan.id}>
                                                        {plan.name} ({plan.duration_months} mo) - ₹{plan.price}
                                                    </option>
                                                ))}
                                            </select>
                                            <small className="text-muted d-block mt-1">You will assign payment details in the next step.</small>
                                        </div>
                                    </form>
                                </div>
                                <div className="modal-footer border-top-0 pt-0">
                                    <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" form="memberForm" className="btn btn-primary rounded-pill px-4 shadow-sm" disabled={!!dateError}>Save Member</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {showPaymentModal && paymentMember && (
                <PaymentHistoryModal
                    show={showPaymentModal}
                    onClose={() => { setShowPaymentModal(false); setPaymentMember(null); fetchMembers(); }}
                    member={paymentMember}
                    plans={plans}
                />
            )}

            {/* Direct Plan Assign flow for new members */}
            {showDirectPaymentModal && paymentMember && (
                <div style={{ position: 'fixed', zIndex: 9999 }}>
                    <PaymentHistoryModal
                        show={showDirectPaymentModal}
                        onClose={() => { setShowDirectPaymentModal(false); setPaymentMember(null); fetchMembers(); }}
                        member={paymentMember}
                        plans={plans}
                    />
                </div>
            )}

        </div>
    );
};

export default Members;
