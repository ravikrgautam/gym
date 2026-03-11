import React from 'react';
import { Link } from 'react-router-dom';
import { Receipt, CalendarClock, ArrowRight } from 'lucide-react';

const Home = () => {
    return (
        <div className="container px-xl-5 py-5 pb-5">
            <div className="text-center mb-5 mt-3">
                <h1 className="display-5 fw-bold text-dark mb-3">Welcome to GymSuite Pro</h1>
                <p className="lead text-muted max-w-2xl mx-auto">
                    Manage your gym efficiently with our suite of modern, fast, and secure tools. No database required – all data stays on your device.
                </p>
            </div>

            <div className="row g-4 justify-content-center max-w-5xl mx-auto">

                {/* Phase 1: Receipt Generator */}
                <div className="col-md-6 col-lg-5">
                    <div className="card h-100 border-0 shadow-sm hover-elevate transition-all cursor-pointer text-decoration-none" style={{ background: 'rgba(255, 255, 255, 0.9)' }}>
                        <div className="card-body p-5">
                            <div className="mb-4 bg-primary bg-opacity-10 d-inline-flex p-3 rounded-circle text-primary">
                                <Receipt size={32} />
                            </div>
                            <h3 className="fw-bold mb-3">Invoice & Receipt Generator</h3>
                            <p className="text-muted mb-4">
                                Instantly generate professional, A4 printable PDF receipts. Easily share via WhatsApp. Includes live preview and GST auto-calculation.
                            </p>

                            <Link to="/receipt" className="btn btn-primary rounded-pill px-4 py-2 fw-medium d-inline-flex align-items-center gap-2 mt-auto">
                                Open Tool <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Phase 2: Expiry Reminders */}
                <div className="col-md-6 col-lg-5">
                    <div className="card h-100 border-0 shadow-sm hover-elevate transition-all text-decoration-none" style={{ background: 'rgba(255, 255, 255, 0.9)' }}>
                        <div className="card-body p-5">
                            <div className="mb-4 bg-success bg-opacity-10 d-inline-flex p-3 rounded-circle text-success" style={{ color: '#10b981' }}>
                                <CalendarClock size={32} color="#10b981" />
                            </div>
                            <h3 className="fw-bold mb-3">Expiry Reminders</h3>
                            <p className="text-muted mb-4">
                                Boost your renewals. Upload your member CSV and instantly send personalized WhatsApp expiration reminders 7 days or 3 days in advance.
                            </p>

                            <Link to="/reminders" className="btn btn-success rounded-pill px-4 py-2 fw-medium d-inline-flex align-items-center gap-2 mt-auto">
                                Open Tool <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Home;
