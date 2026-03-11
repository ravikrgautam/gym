import React, { useState, useEffect } from 'react';
import { Dumbbell, Plus, Users } from 'lucide-react';
import { apiFetch } from '../utils/api';
import { useOutletContext } from 'react-router-dom';

export default function Classes() {
    const { gymData } = useOutletContext();
    const isOwner = gymData?.role === 'OWNER' || gymData?.role === 'MANAGER';

    const [classes, setClasses] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', trainer_id: '', start_time: '', end_time: '', capacity: '' });
    const [editingClassId, setEditingClassId] = useState(null);

    useEffect(() => {
        fetchClasses();
        if (isOwner) fetchTrainers();
    }, [isOwner]);

    const fetchClasses = async () => {
        try {
            setLoading(true);
            const res = await apiFetch('/api/classes');
            setClasses(res);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchTrainers = async () => {
        try {
            const res = await apiFetch('/api/trainers');
            setTrainers(res);
        } catch (err) {
            console.error("Error fetching trainers:", err);
        }
    };

    const handleEditClick = (cls) => {
        setFormData({
            name: cls.name,
            trainer_id: cls.trainer_id || '',
            start_time: cls.start_time,
            end_time: cls.end_time,
            capacity: cls.capacity
        });
        setEditingClassId(cls.id);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingClassId) {
                await apiFetch(`/api/classes/${editingClassId}`, {
                    method: 'PUT',
                    body: JSON.stringify(formData)
                });
            } else {
                await apiFetch('/api/classes', {
                    method: 'POST',
                    body: JSON.stringify(formData)
                });
            }
            setFormData({ name: '', trainer_id: '', start_time: '', end_time: '', capacity: '' });
            setShowForm(false);
            setEditingClassId(null);
            fetchClasses();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEnroll = async (classId) => {
        // Only if logged in as a member
        if (gymData?.role !== 'MEMBER') return;
        try {
            await apiFetch(`/api/classes/${classId}/enroll`, {
                method: 'POST',
                body: JSON.stringify({ member_id: gymData.entity_id })
            });
            alert('Successfully enrolled!');
            fetchClasses();
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="container-fluid p-0">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1 text-dark d-flex align-items-center gap-2">
                        <Dumbbell className="text-primary" /> Class Schedule
                    </h2>
                    <p className="text-muted mb-0">{isOwner ? 'Manage group classes and batches' : 'Book your next workout session'}</p>
                </div>
                {isOwner && (
                    <button onClick={() => {
                        if (showForm) {
                            setShowForm(false);
                            setEditingClassId(null);
                            setFormData({ name: '', trainer_id: '', start_time: '', end_time: '', capacity: '' });
                        } else {
                            setShowForm(true);
                        }
                    }} className="btn btn-primary fw-bold shadow-sm d-flex align-items-center gap-2 px-4 py-2">
                        <Plus size={20} /> {showForm ? 'Cancel' : 'New Class'}
                    </button>
                )}
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {showForm && isOwner && (
                <div className="card border-0 shadow-sm rounded-4 mb-4">
                    <div className="card-body p-4">
                        <h5 className="fw-bold mb-3">{editingClassId ? 'Edit Class' : 'Schedule New Class'}</h5>
                        <form onSubmit={handleSubmit} className="row g-3">
                            <div className="col-md-3">
                                <label className="form-label text-muted small fw-bold">Class Name</label>
                                <input type="text" className="form-control bg-light" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. HIIT Training" />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label text-muted small fw-bold">Trainer</label>
                                <select className="form-select bg-light" required value={formData.trainer_id} onChange={e => setFormData({ ...formData, trainer_id: e.target.value })}>
                                    <option value="">Select Trainer...</option>
                                    {trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                            <div className="col-md-2">
                                <label className="form-label text-muted small fw-bold">Start Time</label>
                                <input type="time" className="form-control bg-light" required value={formData.start_time} onChange={e => setFormData({ ...formData, start_time: e.target.value })} />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label text-muted small fw-bold">End Time</label>
                                <input type="time" className="form-control bg-light" required value={formData.end_time} onChange={e => setFormData({ ...formData, end_time: e.target.value })} />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label text-muted small fw-bold">Capacity</label>
                                <input type="number" className="form-control bg-light" required value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: e.target.value })} placeholder="Max members" min="1" />
                            </div>
                            <div className="col-12 text-end mt-4">
                                <button type="submit" className="btn btn-primary px-4 fw-bold shadow-sm">{editingClassId ? 'Save Changes' : 'Schedule Class'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="row g-4">
                {loading ? (
                    <div className="col-12 text-center py-5">Loading schedule...</div>
                ) : classes.length === 0 ? (
                    <div className="col-12 text-center py-5 text-muted bg-white rounded-4 shadow-sm">No classes scheduled currently.</div>
                ) : (
                    classes.map(cls => (
                        <div key={cls.id} className="col-md-6 col-lg-4">
                            <div className="card border-0 shadow-sm rounded-4 h-100 position-relative overflow-hidden transition-all hover-shadow">
                                <div className="card-body p-4">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <h5 className="fw-bold mb-0">{cls.name}</h5>
                                        <div className="d-flex gap-2 align-items-center">
                                            {isOwner && (
                                                <button className="btn btn-sm btn-light btn-icon rounded-circle" onClick={() => handleEditClick(cls)} title="Edit Class">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                                                </button>
                                            )}
                                            <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill px-3 py-2">
                                                {cls.start_time} - {cls.end_time}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-muted d-flex align-items-center gap-2 mb-4">
                                        <Users size={16} /> Trainer: <span className="fw-medium text-dark">{cls.trainer_name || 'Unassigned'}</span>
                                    </p>

                                    <div className="d-flex justify-content-between align-items-center mt-auto pt-3 border-top">
                                        <div>
                                            <div className="small text-muted fw-bold text-uppercase mb-1">Capacity</div>
                                            <div className="fw-bold fs-5">{cls.enrolled_count} <span className="text-muted fs-6">/ {cls.capacity}</span></div>
                                        </div>

                                        {!isOwner && (
                                            <button
                                                className="btn btn-primary fw-bold px-4"
                                                onClick={() => handleEnroll(cls.id)}
                                                disabled={cls.enrolled_count >= cls.capacity}
                                            >
                                                {cls.enrolled_count >= cls.capacity ? 'Full' : 'Book'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div
                                    className="progress bg-light rounded-0"
                                    style={{ height: '4px', position: 'absolute', bottom: 0, left: 0, right: 0 }}
                                >
                                    <div
                                        className={`progress-bar ${cls.enrolled_count >= cls.capacity ? 'bg-danger' : 'bg-primary'}`}
                                        role="progressbar"
                                        style={{ width: `${(cls.enrolled_count / cls.capacity) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
