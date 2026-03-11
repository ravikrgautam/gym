import React, { useState } from 'react';
import { Mail, KeyRound, Building2 } from 'lucide-react';

const Login = ({ setAuthParams }) => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // 1 = Request, 2 = Verify
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleRequestOTP = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('http://localhost:3001/api/auth/request-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();

            if (res.ok) {
                setSuccessMessage(data.message); // Will show the "Use 123456" for demo
                setStep(2);
            } else {
                setError(data.error || 'Failed to request OTP');
            }
        } catch (err) {
            setError('Cannot connect to backend server. Is it running?');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('http://localhost:3001/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp })
            });
            const data = await res.json();

            if (res.ok) {
                // Save to localStorage
                localStorage.setItem('gymSaaS_token', data.token);
                localStorage.setItem('gymSaaS_info', JSON.stringify(data.user));
                // Update App level state to route inside
                setAuthParams(data.token, data.user);
            } else {
                setError(data.error || 'Invalid OTP');
            }
        } catch (err) {
            setError('Cannot connect to backend server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center px-3" style={{ background: 'var(--bg-gradient)' }}>
            <div className="card border-0 shadow-lg" style={{ maxWidth: '400px', width: '100%', borderRadius: '24px' }}>
                <div className="card-body p-5">

                    <div className="text-center mb-5">
                        <div className="bg-primary bg-opacity-10 d-inline-flex p-3 rounded-circle text-primary mb-3">
                            <Building2 size={32} />
                        </div>
                        <h3 className="fw-bold tracking-tight mb-1">GymSaaS Pro</h3>
                        <p className="text-muted small">Sign in to manage your workspace</p>
                    </div>

                    {error && <div className="alert alert-danger py-2 small fw-medium">{error}</div>}
                    {successMessage && <div className="alert alert-success py-2 small fw-medium">{successMessage}</div>}

                    {step === 1 ? (
                        <form onSubmit={handleRequestOTP}>
                            <div className="mb-4">
                                <label className="form-label small fw-medium text-dark">Email Address</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white border-end-0 text-muted"><Mail size={16} /></span>
                                    <input
                                        type="email"
                                        className="form-control border-start-0 ps-0"
                                        placeholder="admin@mygym.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <button className="btn btn-primary w-100 rounded-pill py-2 fw-medium shadow-sm transition-all text-white" type="submit" disabled={loading}>
                                {loading ? 'Sending...' : 'Get Login Code'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOTP}>
                            <div className="mb-4">
                                <label className="form-label small fw-medium text-dark d-flex justify-content-between">
                                    <span>One-Time Password</span>
                                    <button type="button" className="btn btn-link p-0 small text-decoration-none" onClick={() => setStep(1)}>Change Email</button>
                                </label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white border-end-0 text-muted"><KeyRound size={16} /></span>
                                    <input
                                        type="text"
                                        className="form-control border-start-0 ps-0 text-center font-monospace fs-5 tracking-widest"
                                        placeholder="------"
                                        maxLength="6"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                </div>
                                <small className="text-muted mt-2 d-block text-center">Hint: For testing purposes, use <b>123456</b></small>
                            </div>
                            <button className="btn btn-success w-100 rounded-pill py-2 fw-medium shadow-sm transition-all text-white" type="submit" disabled={loading || otp.length < 6}>
                                {loading ? 'Verifying...' : 'Sign In Securely'}
                            </button>
                        </form>
                    )}

                </div>
            </div>
        </div>
    );
};

export default Login;
