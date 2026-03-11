import React, { useEffect, useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Dumbbell, CalendarClock, CreditCard, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';
import { apiFetch } from '../utils/api';
import { differenceInDays, parseISO, isValid } from 'date-fns';

export default function MemberPortal() {
    const { gymData } = useOutletContext();
    const [attendance, setAttendance] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [memberInfo, setMemberInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('attendance');

    useEffect(() => {
        const fetchMyData = async () => {
            try {
                // For phase 5, we fetch data specific to the member entity
                const entityId = gymData?.entity_id;
                if (!entityId) {
                    setLoading(false);
                    return;
                }

                // Fetch attendance
                const resAtt = await apiFetch('/api/attendance');
                const myLogs = resAtt.filter(r => r.member_id === entityId);
                setAttendance(myLogs);

                // Fetch invoices
                const resInv = await apiFetch(`/api/members/${entityId}/invoices`);
                setInvoices(resInv);

                // Fetch member info
                const resMem = await apiFetch('/api/members');
                const me = resMem.find(m => m.id === entityId);
                setMemberInfo(me);

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchMyData();
    }, [gymData]);

    const getDaysRemainingBadge = (expiryDate) => {
        if (!expiryDate) return <span className="badge bg-secondary">No Plan</span>;

        const dateObj = parseISO(expiryDate);
        if (!isValid(dateObj)) return <span className="badge bg-secondary">Invalid</span>;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        dateObj.setHours(0, 0, 0, 0);

        const diffDays = differenceInDays(dateObj, today);

        if (diffDays < 0) return <span className="badge bg-danger rounded-pill px-3 py-2"><AlertCircle size={14} className="me-1" /> Expired {-diffDays} days ago</span>;
        if (diffDays === 0) return <span className="badge bg-danger rounded-pill px-3 py-2"><AlertCircle size={14} className="me-1" /> Expires Today</span>;
        if (diffDays <= 6) return <span className="badge bg-warning text-dark rounded-pill px-3 py-2"><AlertCircle size={14} className="me-1" /> {diffDays} days left</span>;
        return <span className="badge bg-success rounded-pill px-3 py-2"><CheckCircle size={14} className="me-1" /> {diffDays} days left</span>;
    };

    return (
        <div className="container-fluid p-0">
            {/* Welcome Banner */}
            <div className="bg-primary bg-opacity-10 border border-primary border-opacity-25 rounded-4 p-5 mb-4 position-relative overflow-hidden">
                <div className="position-relative z-1 d-flex justify-content-between align-items-center">
                    <div>
                        <h2 className="fw-bold mb-2 text-primary">Welcome back, {gymData?.email?.split('@')[0] || 'Member'}!</h2>
                        <p className="text-secondary mb-0 fs-5">Ready to crush your goals today?</p>
                    </div>
                    {/* Membership Status Card */}
                    {memberInfo && (
                        <div className="bg-white p-3 rounded-4 shadow-sm border border-primary border-opacity-10 text-end" style={{ minWidth: '200px' }}>
                            <small className="text-muted fw-bold text-uppercase d-block mb-1">Current Plan</small>
                            <h5 className="fw-bold text-dark mb-2">{memberInfo.current_plan_name || 'Free/No Plan'}</h5>
                            <div className="mb-2">
                                <small className="text-muted d-block mb-1">Expires: {memberInfo.plan_expiry_date || 'N/A'}</small>
                                {getDaysRemainingBadge(memberInfo.plan_expiry_date)}
                            </div>
                        </div>
                    )}
                </div>
                {/* Decorative element */}
                <Dumbbell
                    size={200}
                    className="position-absolute text-primary opacity-25"
                    style={{ top: '-40px', left: '-20px', transform: 'rotate(45deg)' }}
                />
            </div>

            <div className="row g-4 mb-4">
                {/* Quick Action: Book Class */}
                <div className="col-md-6">
                    <Link to="/classes" className="text-decoration-none">
                        <div className="card text-white border-0 shadow-sm rounded-4 h-100 overflow-hidden hover-elevate transition-all" style={{ background: 'linear-gradient(135deg, #0d6efd 0%, #0043a8 100%)' }}>
                            <div className="card-body p-4 d-flex justify-content-between align-items-center">
                                <div>
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <Dumbbell size={24} className="opacity-75" />
                                        <span className="fw-medium text-uppercase tracking-wider small opacity-75">Classes</span>
                                    </div>
                                    <h4 className="fw-bold mb-0">Book a Session</h4>
                                </div>
                                <div className="bg-white bg-opacity-25 rounded-circle p-2 d-flex justify-content-center align-items-center" style={{ width: '48px', height: '48px' }}>
                                    <ChevronRight size={24} />
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Quick Action: Billing Info */}
                <div className="col-md-6">
                    <div className="card bg-dark text-white border-0 shadow-sm rounded-4 h-100 overflow-hidden hover-elevate transition-all cursor-pointer" onClick={() => setActiveTab('receipts')}>
                        <div className="card-body p-4 d-flex justify-content-between align-items-center">
                            <div>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <CreditCard size={24} className="opacity-75" />
                                    <span className="fw-medium text-uppercase tracking-wider small opacity-75">Billing</span>
                                </div>
                                <h4 className="fw-bold mb-0">View Receipts</h4>
                            </div>
                            <div className="bg-white bg-opacity-10 rounded-circle p-2 d-flex justify-content-center align-items-center border border-white border-opacity-25 mt-2" style={{ width: '48px', height: '48px' }}>
                                <ChevronRight size={24} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <ul className="nav nav-pills mb-4">
                <li className="nav-item">
                    <button className={`nav-link rounded-pill px-4 py-2 fw-medium ${activeTab === 'attendance' ? 'active shadow-sm' : 'text-muted'}`} onClick={() => setActiveTab('attendance')}>
                        <CalendarClock size={18} className="me-2" inline="true" /> My Check-ins
                    </button>
                </li>
                <li className="nav-item ms-2">
                    <button className={`nav-link rounded-pill px-4 py-2 fw-medium ${activeTab === 'receipts' ? 'active shadow-sm bg-dark text-white' : 'text-muted'}`} onClick={() => setActiveTab('receipts')}>
                        <CreditCard size={18} className="me-2" inline="true" /> My Receipts
                    </button>
                </li>
            </ul>

            <div className="card border-0 shadow-sm rounded-4 mb-5">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        {activeTab === 'attendance' ? (
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="px-4 py-3 text-muted small fw-bold text-uppercase border-0">Date</th>
                                        <th className="px-4 py-3 text-muted small fw-bold text-uppercase border-0">Time</th>
                                        <th className="px-4 py-3 text-muted small fw-bold text-uppercase border-0 text-end">Method</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="3" className="text-center py-5 text-muted">Loading history...</td></tr>
                                    ) : attendance.length === 0 ? (
                                        <tr><td colSpan="3" className="text-center py-5 text-muted">No recent check-ins found.</td></tr>
                                    ) : (
                                        attendance.map(record => (
                                            <tr key={record.id}>
                                                <td className="px-4 py-3 fw-medium">{record.date}</td>
                                                <td className="px-4 py-3 text-muted">{record.check_in_time}</td>
                                                <td className="px-4 py-3 text-end">
                                                    <span className={`badge ${record.method === 'QR' ? 'bg-success' : 'bg-primary'} bg-opacity-10 text-${record.method === 'QR' ? 'success' : 'primary'} border border-${record.method === 'QR' ? 'success' : 'primary'} border-opacity-25 rounded-pill`}>
                                                        {record.method}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        ) : (
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="px-4 py-3 text-muted small fw-bold text-uppercase border-0">Invoice #</th>
                                        <th className="px-4 py-3 text-muted small fw-bold text-uppercase border-0">Pack Name</th>
                                        <th className="px-4 py-3 text-muted small fw-bold text-uppercase border-0">Date</th>
                                        <th className="px-4 py-3 text-muted small fw-bold text-uppercase border-0">Amount</th>
                                        <th className="px-4 py-3 text-muted small fw-bold text-uppercase border-0 text-end">Payment Mode</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="5" className="text-center py-5 text-muted">Loading receipts...</td></tr>
                                    ) : invoices.length === 0 ? (
                                        <tr><td colSpan="5" className="text-center py-5 text-muted">No receipts found.</td></tr>
                                    ) : (
                                        invoices.map(inv => (
                                            <tr key={inv.id}>
                                                <td className="px-4 py-3 font-monospace text-muted">{inv.invoice_number}</td>
                                                <td className="px-4 py-3 fw-medium">{inv.pack_name || 'Custom Membership'}</td>
                                                <td className="px-4 py-3 text-muted">{inv.issue_date?.split('T')[0]}</td>
                                                <td className="px-4 py-3 fw-bold text-success">₹{inv.total_payable}</td>
                                                <td className="px-4 py-3 text-end">
                                                    <span className="badge bg-light text-dark border rounded-pill px-3 py-2">
                                                        {inv.payment_mode}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
