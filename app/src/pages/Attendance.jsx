import React, { useState, useEffect } from 'react';
import { CalendarClock, CheckCircle, Clock, Search, Edit2, Trash2, QrCode } from 'lucide-react';
import { apiFetch } from '../utils/api';

export default function Attendance() {
    const [attendanceList, setAttendanceList] = useState([]);
    const [members, setMembers] = useState([]);

    // Check-in Form State
    const [selectedMember, setSelectedMember] = useState('');
    const [shift, setShift] = useState('');
    const [checkInTime, setCheckInTime] = useState('');

    // QR State
    const [activeTab, setActiveTab] = useState('manual');
    const [qrToken, setQrToken] = useState('');
    const [qrShift, setQrShift] = useState('');

    // Filters State
    const [filters, setFilters] = useState({ date: new Date().toISOString().split('T')[0], month: '', member_name: '', shift: '' });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Edit Modal State
    const [editingRecord, setEditingRecord] = useState(null);

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line
    }, [filters]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filters.date) params.append('date', filters.date);
            if (filters.month) params.append('month', filters.month);
            if (filters.member_name) params.append('member_name', filters.member_name);
            if (filters.shift) params.append('shift', filters.shift);

            const [attRes, memRes] = await Promise.all([
                apiFetch(`/api/attendance?${params.toString()}`),
                apiFetch('/api/members')
            ]);
            setAttendanceList(attRes);

            // Only update members once if we already have them unless we want them fresh
            if (members.length === 0) setMembers(memRes);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => {
            const next = { ...prev, [name]: value };
            // If month is selected, clear date to avoid conflict
            if (name === 'month' && value) next.date = '';
            if (name === 'date' && value) next.month = '';
            return next;
        });
    };

    const handleCheckIn = async (e) => {
        e.preventDefault();
        setError(null);
        if (!selectedMember || !shift) return;

        // Frontend Duplicate Check for today
        const today = new Date().toISOString().split('T')[0];
        const isDuplicate = attendanceList.some(a =>
            a.member_id === parseInt(selectedMember) &&
            a.date === today &&
            a.shift === shift
        );

        if (isDuplicate) {
            const memberObj = members.find(m => m.id === parseInt(selectedMember));
            setError(`${memberObj?.name || 'Member'} is already checked in for the ${shift} shift today. Edit the existing entry instead.`);
            return;
        }

        try {
            const payload = { member_id: selectedMember, method: 'MANUAL', shift };
            if (checkInTime) {
                payload.check_in_time = checkInTime; // Optional custom time
            }

            await apiFetch('/api/attendance', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            setSelectedMember('');
            setShift('');
            setCheckInTime('');

            // Force fetch with today's date if we aren't already viewing it
            if (filters.date !== today) {
                setFilters({ ...filters, date: today });
            } else {
                fetchData();
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const handleQrSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!qrToken || !qrShift) return;

        try {
            const res = await apiFetch('/api/attendance/qr', {
                method: 'POST',
                body: JSON.stringify({ token: qrToken, shift: qrShift })
            });
            setQrToken('');
            setQrShift('');

            const today = new Date().toISOString().split('T')[0];
            if (filters.date !== today) {
                setFilters({ ...filters, date: today });
            } else {
                fetchData();
            }
            alert(`Success: ${res.memberName} checked in for ${qrShift} shift!`);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEditSave = async (e) => {
        e.preventDefault();
        try {
            await apiFetch(`/api/attendance/${editingRecord.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    date: editingRecord.date,
                    shift: editingRecord.shift,
                    check_in_time: editingRecord.check_in_time,
                    method: editingRecord.method
                })
            });
            setEditingRecord(null);
            fetchData();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this record?")) return;
        try {
            await apiFetch(`/api/attendance/${id}`, { method: 'DELETE' });
            fetchData();
        } catch (err) {
            alert(err.message);
        }
    };

    const getDayName = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', { weekday: 'short' });
    };

    return (
        <div className="container-fluid p-0">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1 text-dark d-flex align-items-center gap-2">
                        <CalendarClock className="text-primary" /> Attendance Log
                    </h2>
                    <p className="text-muted mb-0">Record and manage member check-ins</p>
                </div>
            </div>

            {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    {error}
                    <button type="button" className="btn-close" onClick={() => setError(null)}></button>
                </div>
            )}

            <div className="row g-4">
                {/* Check In Panel */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-header bg-white border-bottom pt-4 px-4 pb-0">
                            <ul className="nav nav-tabs border-0 gap-3">
                                <li className="nav-item">
                                    <button
                                        className={`nav-link border-0 pb-3 fw-medium ${activeTab === 'manual' ? 'active border-bottom border-primary border-3 text-primary bg-transparent' : 'text-muted'}`}
                                        onClick={() => setActiveTab('manual')}
                                    >
                                        Manual Entry
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link border-0 pb-3 fw-medium d-flex align-items-center gap-2 ${activeTab === 'qr' ? 'active border-bottom border-primary border-3 text-primary bg-transparent' : 'text-muted'}`}
                                        onClick={() => setActiveTab('qr')}
                                    >
                                        <QrCode size={16} /> Scan QR
                                    </button>
                                </li>
                            </ul>
                        </div>
                        <div className="card-body p-4 pt-3">
                            {activeTab === 'manual' ? (
                                <form onSubmit={handleCheckIn}>
                                    <div className="mb-3 mt-2">
                                        <label className="form-label text-muted small fw-bold">Select Member *</label>
                                        <select className="form-select form-select-lg bg-light" value={selectedMember} onChange={(e) => setSelectedMember(e.target.value)} required>
                                            <option value="">Search member...</option>
                                            {members.map(m => (
                                                <option key={m.id} value={m.id}>{m.name} ({m.phone})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label text-muted small fw-bold">Shift *</label>
                                        <select className="form-select form-select-lg bg-light" value={shift} onChange={(e) => setShift(e.target.value)} required>
                                            <option value="" disabled>Select shift</option>
                                            <option value="Morning">Morning</option>
                                            <option value="Evening">Evening</option>
                                        </select>
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label text-muted small fw-bold">Time (Optional)</label>
                                        <input type="time" className="form-control bg-light" value={checkInTime} onChange={(e) => setCheckInTime(e.target.value)} />
                                        <small className="text-muted">Leave empty for current time</small>
                                    </div>
                                    <button type="submit" className="btn btn-primary btn-lg w-100 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2">
                                        <CheckCircle size={20} /> Submit Record
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleQrSubmit}>
                                    <div className="mb-3 mt-2">
                                        <label className="form-label text-muted small fw-bold">QR Token String *</label>
                                        <input type="text" className="form-control form-control-lg bg-light" value={qrToken} onChange={(e) => setQrToken(e.target.value)} placeholder="Paste or scan token here..." required autoFocus />
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label text-muted small fw-bold">Shift *</label>
                                        <select className="form-select form-select-lg bg-light" value={qrShift} onChange={(e) => setQrShift(e.target.value)} required>
                                            <option value="" disabled>Select shift</option>
                                            <option value="Morning">Morning</option>
                                            <option value="Evening">Evening</option>
                                        </select>
                                    </div>
                                    <button type="submit" className="btn btn-success btn-lg w-100 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2">
                                        <QrCode size={20} /> Verify & Check In
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>

                {/* Log Table & Filters */}
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm rounded-4 h-100 d-flex flex-column">
                        <div className="card-header bg-white border-bottom p-4">
                            <h5 className="fw-bold mb-3 d-flex justify-content-between">
                                Log Filters
                                <span className="badge bg-secondary rounded-pill fw-normal">{attendanceList.length} records</span>
                            </h5>
                            <div className="row g-2">
                                <div className="col-md-3">
                                    <input type="date" className="form-control form-control-sm bg-light" name="date" value={filters.date} onChange={handleFilterChange} title="Filter by exact date" />
                                </div>
                                <div className="col-md-3">
                                    <input type="month" className="form-control form-control-sm bg-light" name="month" value={filters.month} onChange={handleFilterChange} title="Filter by month" />
                                </div>
                                <div className="col-md-3 relative">
                                    <input type="text" className="form-control form-control-sm bg-light" name="member_name" value={filters.member_name} onChange={handleFilterChange} placeholder="Search Name..." />
                                </div>
                                <div className="col-md-3">
                                    <select className="form-select form-select-sm bg-light" name="shift" value={filters.shift} onChange={handleFilterChange}>
                                        <option value="">All Shifts</option>
                                        <option value="Morning">Morning</option>
                                        <option value="Evening">Evening</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="card-body p-0 flex-grow-1" style={{ overflowY: 'auto', minHeight: '400px' }}>
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light sticky-top">
                                        <tr>
                                            <th className="px-4 py-3 text-muted small fw-bold text-uppercase">Member</th>
                                            <th className="px-3 py-3 text-muted small fw-bold text-uppercase">Date</th>
                                            <th className="px-3 py-3 text-muted small fw-bold text-uppercase">Shift</th>
                                            <th className="px-3 py-3 text-muted small fw-bold text-uppercase">Time</th>
                                            <th className="px-3 py-3 text-muted small fw-bold text-uppercase">Method</th>
                                            <th className="px-4 py-3 text-muted small fw-bold text-uppercase text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr><td colSpan="6" className="text-center py-5">Loading secure data...</td></tr>
                                        ) : attendanceList.length === 0 ? (
                                            <tr><td colSpan="6" className="text-center py-5 text-muted">No attendance found for selected filters.</td></tr>
                                        ) : (
                                            attendanceList.map(record => (
                                                <tr key={record.id}>
                                                    <td className="px-4 py-3 fw-medium">{record.member_name}</td>
                                                    <td className="px-3 py-3 text-muted">
                                                        {record.date} <span className="small text-secondary">({getDayName(record.date)})</span>
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25">{record.shift || '-'}</span>
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <span className="badge bg-light text-dark border d-inline-flex align-items-center gap-1">
                                                            <Clock size={14} /> {record.check_in_time}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <span className={`badge ${record.method === 'QR' ? 'bg-success' : 'bg-secondary'} bg-opacity-10 text-${record.method === 'QR' ? 'success' : 'secondary'} border border-${record.method === 'QR' ? 'success' : 'secondary'} border-opacity-25`}>
                                                            {record.method}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-end">
                                                        <button className="btn btn-sm btn-light btn-icon me-2 rounded-circle" onClick={() => setEditingRecord(record)} title="Edit">
                                                            <Edit2 size={16} className="text-primary" />
                                                        </button>
                                                        <button className="btn btn-sm btn-light btn-icon rounded-circle" onClick={() => handleDelete(record.id)} title="Delete">
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
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {editingRecord && (
                <>
                    <div className="modal-backdrop fade show overlay"></div>
                    <div className="modal fade show d-block" tabIndex="-1">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content border-0 shadow-lg rounded-4">
                                <div className="modal-header border-bottom-0 pb-0">
                                    <h5 className="fw-bold">Edit Entry: {editingRecord.member_name}</h5>
                                    <button type="button" className="btn-close" onClick={() => setEditingRecord(null)}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <form id="editRecordForm" onSubmit={handleEditSave}>
                                        <div className="mb-3">
                                            <label className="form-label small fw-medium text-muted">Date</label>
                                            <input type="date" className="form-control" value={editingRecord.date} onChange={e => setEditingRecord({ ...editingRecord, date: e.target.value })} required />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label small fw-medium text-muted">Shift</label>
                                            <select className="form-select" value={editingRecord.shift} onChange={e => setEditingRecord({ ...editingRecord, shift: e.target.value })} required>
                                                <option value="Morning">Morning</option>
                                                <option value="Evening">Evening</option>
                                            </select>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label small fw-medium text-muted">Check-in Time</label>
                                            <input type="time" className="form-control" value={editingRecord.check_in_time} onChange={e => setEditingRecord({ ...editingRecord, check_in_time: e.target.value })} required />
                                        </div>
                                    </form>
                                </div>
                                <div className="modal-footer border-top-0 pt-0">
                                    <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setEditingRecord(null)}>Cancel</button>
                                    <button type="submit" form="editRecordForm" className="btn btn-primary rounded-pill px-4 shadow-sm">Save Changes</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
