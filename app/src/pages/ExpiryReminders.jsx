import React, { useState, useEffect } from 'react';
import { Send, CheckCircle, AlertCircle, Settings, Users, CalendarClock, RefreshCw } from 'lucide-react';
import { differenceInDays, parseISO, isValid } from 'date-fns';
import { apiFetch } from '../utils/api';

const defaultTemplate = "Hi {{name}}, friendly reminder that your membership at {{gym_name}} expires on {{expiry_date}}. Please renew soon to avoid interruption. 🏋️‍♂️";

const ExpiryReminders = () => {
    const [dbData, setDbData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [template, setTemplate] = useState(defaultTemplate);
    const [gymName, setGymName] = useState('Our Gym');
    const [timingSelections, setTimingSelections] = useState({
        sevenDays: true,
        threeDays: true,
        today: true,
        expired: true
    });

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const data = await apiFetch('/api/members');

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const processed = data
                .filter(m => m.status === 'ACTIVE' || m.status === 'EXPIRED')
                .map(member => {
                    let daysUntilExpiry = null;
                    const endDateStr = member.plan_expiry_date;

                    if (endDateStr) {
                        const dateObj = parseISO(endDateStr);
                        if (isValid(dateObj)) {
                            dateObj.setHours(0, 0, 0, 0);
                            daysUntilExpiry = differenceInDays(dateObj, today);
                        }
                    }

                    return {
                        ...member,
                        endDate: endDateStr,
                        daysUntilExpiry,
                        valid: !!endDateStr && isValid(parseISO(endDateStr)),
                        sent: false
                    };
                });

            setDbData(processed);
        } catch (err) {
            console.error("Failed to load members", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    // Filtered data based on timing settings
    const filteredMembers = dbData.filter(member => {
        if (!member.valid || member.daysUntilExpiry === null) return false;

        let show = false;
        if (timingSelections.sevenDays && member.daysUntilExpiry > 3 && member.daysUntilExpiry <= 7) show = true;
        if (timingSelections.threeDays && member.daysUntilExpiry > 0 && member.daysUntilExpiry <= 3) show = true;
        if (timingSelections.today && member.daysUntilExpiry === 0) show = true;
        if (timingSelections.expired && member.daysUntilExpiry < 0) show = true;

        return show;
    });

    const buildMessage = (member) => {
        let text = template;
        text = text.replace(/{{name}}/g, member.name || '');
        text = text.replace(/{{expiry_date}}/g, member.endDate || '');
        text = text.replace(/{{gym_name}}/g, gymName || 'Gym');
        return encodeURIComponent(text);
    };

    const handleSendAction = (id) => {
        const actualIndex = dbData.findIndex(m => m.id === id);

        if (actualIndex > -1) {
            const member = dbData[actualIndex];
            const newData = [...dbData];
            newData[actualIndex] = { ...member, sent: true };
            setDbData(newData);

            const phone = member.phone || '';
            const url = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${buildMessage(member)}`;
            window.open(url, '_blank');
        }
    };

    return (
        <div className="container px-xl-5 py-4 pb-5 max-w-6xl mx-auto">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1 text-dark d-flex align-items-center gap-2">
                        <CalendarClock className="text-warning" size={28} /> Fee Reminders & Follow-Ups
                    </h2>
                    <p className="text-muted mb-0">Automate your renewals and WhatsApp messaging directly from your live database.</p>
                </div>
                <button className="btn btn-outline-primary shadow-sm rounded-pill px-4 d-flex align-items-center gap-2" onClick={fetchMembers} disabled={loading}>
                    <RefreshCw size={16} className={loading ? "spin" : ""} /> Sync Database
                </button>
            </div>

            <div className="row g-4">
                {/* Left Column: Settings */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-header bg-white pt-4 pb-0 border-0">
                            <h6 className="fw-bold text-uppercase text-muted mx-2 mb-0 d-flex align-items-center gap-2">
                                <span className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px', fontSize: '12px' }}>1</span> Configuration
                            </h6>
                        </div>
                        <div className="card-body p-4">
                            {/* Timing */}
                            <div className="mb-4">
                                <label className="form-label fw-medium text-dark small mb-2 d-flex align-items-center gap-1">
                                    <Settings size={14} /> Group by Expiry
                                </label>
                                <div className="bg-light rounded p-3 border">
                                    <div className="form-check form-switch mb-2">
                                        <input className="form-check-input" type="checkbox" role="switch" id="t7" checked={timingSelections.sevenDays} onChange={(e) => setTimingSelections(p => ({ ...p, sevenDays: e.target.checked }))} />
                                        <label className="form-check-label small pt-1" htmlFor="t7">Expiring Soon (4-7 days)</label>
                                    </div>
                                    <div className="form-check form-switch mb-2">
                                        <input className="form-check-input" type="checkbox" role="switch" id="t3" checked={timingSelections.threeDays} onChange={(e) => setTimingSelections(p => ({ ...p, threeDays: e.target.checked }))} />
                                        <label className="form-check-label small pt-1" htmlFor="t3">Very Soon (1-3 days)</label>
                                    </div>
                                    <div className="form-check form-switch mb-2">
                                        <input className="form-check-input" type="checkbox" role="switch" id="t0" checked={timingSelections.today} onChange={(e) => setTimingSelections(p => ({ ...p, today: e.target.checked }))} />
                                        <label className="form-check-label small pt-1" htmlFor="t0">Expires Today</label>
                                    </div>
                                    <div className="form-check form-switch">
                                        <input className="form-check-input" type="checkbox" role="switch" id="tEx" checked={timingSelections.expired} onChange={(e) => setTimingSelections(p => ({ ...p, expired: e.target.checked }))} />
                                        <label className="form-check-label small pt-1 text-danger fw-medium" htmlFor="tEx">Already Expired</label>
                                    </div>
                                </div>
                            </div>

                            {/* Template */}
                            <div className="mb-3">
                                <label className="form-label fw-medium text-dark small mb-2 d-flex align-items-center justify-content-between">
                                    <span>Message Template</span>
                                    <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 fw-normal">WhatsApp</span>
                                </label>
                                <input type="text" className="form-control form-control-sm mb-2" value={gymName} onChange={(e) => setGymName(e.target.value)} placeholder="Your Gym Name (for {{gym_name}})" />
                                <textarea
                                    className="form-control text-sm font-monospace"
                                    rows="5"
                                    value={template}
                                    onChange={(e) => setTemplate(e.target.value)}
                                    style={{ fontSize: '13px' }}
                                />
                                <div className="form-text mt-1" style={{ fontSize: '11px' }}>
                                    Tags: <code>{`{{name}}`}</code>, <code>{`{{expiry_date}}`}</code>, <code>{`{{gym_name}}`}</code>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Execution Queue */}
                <div className="col-lg-8">
                    <div className="card h-100 border-0 shadow-sm">
                        <div className="card-header bg-white pt-4 pb-3 border-bottom px-4">
                            <h6 className="fw-bold text-uppercase text-muted mb-0 d-flex align-items-center gap-2">
                                <span className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px', fontSize: '12px' }}>2</span> Execution Queue
                            </h6>
                        </div>
                        <div className="card-body p-0">
                            {loading ? (
                                <div className="text-center p-5 opacity-50">
                                    <h5 className="fw-medium text-dark">Loading Database...</h5>
                                </div>
                            ) : (
                                <>
                                    <div className="p-3 bg-light border-bottom d-flex justify-content-between align-items-center">
                                        <span className="small text-muted fw-medium">
                                            Found <strong className="text-dark fs-6">{filteredMembers.length}</strong> members out of {dbData.length} active/expired.
                                        </span>
                                    </div>

                                    <div className="table-responsive" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                        <table className="table table-hover align-middle mb-0">
                                            <thead className="bg-white sticky-top shadow-sm z-1" style={{ top: 0 }}>
                                                <tr>
                                                    <th className="small text-muted text-uppercase fw-semibold py-3 ps-4 border-0">Member Name</th>
                                                    <th className="small text-muted text-uppercase fw-semibold py-3 border-0">Expiry Date</th>
                                                    <th className="small text-muted text-uppercase fw-semibold py-3 border-0">Group</th>
                                                    <th className="small text-muted text-uppercase fw-semibold py-3 border-0 text-end pe-4">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredMembers.map((member) => (
                                                    <tr key={member.id} className={member.sent ? 'table-success bg-opacity-25' : ''}>
                                                        <td className="ps-4">
                                                            <span className="fw-bold text-dark d-block">{member.name}</span>
                                                            <span className="small text-muted font-monospace">{member.phone}</span>
                                                        </td>
                                                        <td>
                                                            <span className="d-block text-dark fw-medium">{member.endDate}</span>
                                                        </td>
                                                        <td>
                                                            {member.daysUntilExpiry < 0 ? (
                                                                <span className="badge bg-danger">Expired {-member.daysUntilExpiry}d ago</span>
                                                            ) : member.daysUntilExpiry === 0 ? (
                                                                <span className="badge bg-danger">Expires Today</span>
                                                            ) : member.daysUntilExpiry <= 3 ? (
                                                                <span className="badge bg-warning text-dark">Very Soon ({member.daysUntilExpiry}d)</span>
                                                            ) : (
                                                                <span className="badge bg-info text-dark">Expiring ({member.daysUntilExpiry}d)</span>
                                                            )}
                                                        </td>
                                                        <td className="text-end pe-4">
                                                            <button
                                                                className={`btn btn-sm rounded-pill px-3 fw-medium d-inline-flex align-items-center gap-1 ${member.sent ? 'btn-outline-success' : 'btn-success shadow-sm'}`}
                                                                onClick={() => handleSendAction(member.id)}
                                                            >
                                                                <Send size={14} /> {member.sent ? 'Sent' : 'Remind'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {filteredMembers.length === 0 && (
                                                    <tr>
                                                        <td colSpan="4" className="text-center py-5 text-muted">
                                                            <Users size={40} className="mb-3 opacity-25 mx-auto d-block" />
                                                            <h6 className="fw-medium">No members need reminders right now.</h6>
                                                            <p className="small mb-0 opacity-75">Adjust the filters on the left to see more.</p>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExpiryReminders;
