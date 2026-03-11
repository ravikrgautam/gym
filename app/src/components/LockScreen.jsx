import React from 'react';
import { Lock, ArrowRight } from 'lucide-react';

const LockScreen = ({ isUnlocked, onUnlock }) => {
    if (isUnlocked) return null;

    return (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
                    <div className="modal-body p-5 text-center">
                        <div className="mb-4 bg-primary bg-opacity-10 p-4 rounded-circle d-inline-block text-primary">
                            <Lock size={48} />
                        </div>
                        <h3 className="fw-bold mb-3">Premium Access Required</h3>
                        <p className="text-muted mb-4 pb-2">
                            Purchase lifetime access to generate unlimited, professional, ad-free PDF receipts for your gym.
                        </p>
                        <div className="d-grid gap-3">
                            {/* Simulate Payment Link */}
                            <button
                                className="btn btn-primary btn-lg rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 py-3"
                                onClick={() => alert("In a real app, this would integrate with Stripe/Razorpay.")}
                            >
                                <span>Get Lifetime Access</span> <ArrowRight size={20} />
                            </button>

                            {/* Only for demo/testing purposes: A bypass */}
                            <button
                                className="btn btn-link text-muted small text-decoration-none p-0 mt-2"
                                onClick={onUnlock}
                            >
                                I already paid (Simulate Unlock)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LockScreen;
