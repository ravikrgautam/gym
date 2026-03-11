import React, { useState, useEffect } from 'react';
import { Dumbbell, Plus, Trash2 } from 'lucide-react';
import { apiFetch } from '../utils/api';

const Plans = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', duration_months: 1, price: 0 });
    const [error, setError] = useState(null);
    const [editingPlanId, setEditingPlanId] = useState(null);

    const fetchPlans = async () => {
        try {
            const data = await apiFetch('/api/plans');
            setPlans(data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPlans(); }, []);

    const handleEditClick = (plan) => {
        setFormData({ name: plan.name, duration_months: plan.duration_months, price: plan.price });
        setEditingPlanId(plan.id);
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (editingPlanId) {
                await apiFetch(`/api/plans/${editingPlanId}`, {
                    method: 'PUT',
                    body: JSON.stringify(formData)
                });
            } else {
                await apiFetch('/api/plans', {
                    method: 'POST',
                    body: JSON.stringify(formData)
                });
            }
            setShowModal(false);
            setEditingPlanId(null);
            setFormData({ name: '', duration_months: 1, price: 0 });
            setError(null);
            fetchPlans();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this plan?")) return;
        try {
            await apiFetch(`/api/plans/${id}`, {
                method: 'DELETE'
            });
            setError(null);
            fetchPlans();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="container-fluid p-0 max-w-7xl mx-auto">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold text-dark d-flex align-items-center gap-2 mb-1">
                        <Dumbbell className="text-primary" /> Membership Plans
                    </h3>
                    <p className="text-muted mb-0">Create and manage your subscription tiers.</p>
                </div>
                <button className="btn btn-primary rounded-pill px-4 d-flex align-items-center gap-2 shadow-sm" onClick={() => {
                    setEditingPlanId(null);
                    setFormData({ name: '', duration_months: 1, price: 0 });
                    setShowModal(true);
                }}>
                    <Plus size={16} /> Add Plan
                </button>
            </div>

            {error && (
                <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
                    {error}
                    <button type="button" className="btn-close" onClick={() => setError(null)}></button>
                </div>
            )}

            <div className="row g-4">
                {loading ? (
                    <div className="col-12 text-center py-5 text-muted">Loading plans...</div>
                ) : plans.length === 0 ? (
                    <div className="col-12 text-center py-5 text-muted">No plans created yet. Click 'Add Plan' to start.</div>
                ) : plans.map(p => (
                    <div className="col-md-4" key={p.id}>
                        <div className="card border-0 shadow-sm h-100 rounded-4 position-relative hover-shadow transition-all">
                            <div className="position-absolute top-0 end-0 m-3 d-flex gap-2">
                                <button className="btn btn-sm btn-light btn-icon rounded-circle" onClick={() => handleEditClick(p)} title="Edit Plan">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                                </button>
                                <button className="btn btn-sm btn-light btn-icon rounded-circle" onClick={() => handleDelete(p.id)} title="Delete Plan">
                                    <Trash2 size={16} className="text-danger" />
                                </button>
                            </div>
                            <div className="card-body p-4 text-center mt-3">
                                <h4 className="fw-bold text-dark mb-1">{p.name}</h4>
                                <div className="text-muted small mb-4">{p.duration_months} Months Duration</div>
                                <h2 className="display-6 fw-bold text-primary mb-0">₹{p.price.toLocaleString()}</h2>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <>
                    <div className="modal-backdrop fade show overlay"></div>
                    <div className="modal fade show d-block" tabIndex="-1">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content border-0 shadow-lg rounded-4">
                                <div className="modal-header border-bottom-0 pb-0">
                                    <h5 className="fw-bold">{editingPlanId ? 'Edit Plan' : 'Create New Plan'}</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <form id="planForm" onSubmit={handleSave}>
                                        <div className="mb-3">
                                            <label className="form-label small fw-medium text-muted">Plan Name</label>
                                            <input type="text" className="form-control rounded-3 bg-light" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Pro Yearly" required />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label small fw-medium text-muted">Duration (Months)</label>
                                            <input type="number" min="1" className="form-control rounded-3 bg-light" value={formData.duration_months} onChange={e => setFormData({ ...formData, duration_months: parseInt(e.target.value) })} required />
                                        </div>
                                        <div className="mb-4">
                                            <label className="form-label small fw-medium text-muted">Price (₹)</label>
                                            <input type="number" min="0" className="form-control rounded-3 bg-light" value={formData.price} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })} required />
                                        </div>
                                    </form>
                                </div>
                                <div className="modal-footer border-top-0 pt-0">
                                    <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" form="planForm" className="btn btn-primary rounded-pill px-4 shadow-sm">{editingPlanId ? 'Save Changes' : 'Save Plan'}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Plans;
