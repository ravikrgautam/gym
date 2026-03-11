import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { Dumbbell, LayoutDashboard, Users, Calculator, CalendarClock, LogOut } from 'lucide-react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ReceiptGenerator from './pages/ReceiptGenerator';
import ExpiryReminders from './pages/ExpiryReminders';
import Members from './pages/Members';
import Plans from './pages/Plans';
import Trainers from './pages/Trainers';
import Attendance from './pages/Attendance';
import Classes from './pages/Classes';
import MemberPortal from './pages/MemberPortal';

// Auth Guard
const ProtectedRoute = ({ isAuth, children }) => {
    if (!isAuth) return <Navigate to="/login" replace />;
    return children;
};

// Sidebar Layout for Phase 4
function Layout({ gymData, handleLogout }) {
    const location = useLocation();

    // Default to Owner/Manager links if role is missing for fallback
    const role = gymData?.role || 'OWNER';
    const isMember = role === 'MEMBER';

    const ownerNavItems = [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/attendance', label: 'Attendance', icon: CalendarClock },
        { path: '/members', label: 'Member Base', icon: Users },
        { path: '/classes', label: 'Classes', icon: Dumbbell },
        { path: '/plans', label: 'Membership Plans', icon: Dumbbell },
        { path: '/receipt', label: 'Billing & Invoices', icon: Calculator },
        { path: '/reminders', label: 'Expiry Reminders', icon: CalendarClock },
        { path: '/trainers', label: 'Trainers & Batches', icon: Users },
    ];

    const memberNavItems = [
        { path: '/', label: 'My Portal', icon: LayoutDashboard },
        { path: '/classes', label: 'Book Classes', icon: Dumbbell },
    ];

    const navItems = isMember ? memberNavItems : ownerNavItems;

    return (
        <div className="d-flex min-vh-100" style={{ background: '#f8fafc' }}>

            {/* Sidebar Navigation */}
            <div className="bg-dark text-white d-flex flex-column flex-shrink-0 p-4 shadow" style={{ width: '280px', position: 'fixed', height: '100vh', zIndex: 1000 }}>
                <Link to="/" className="d-flex align-items-center mb-4 link-light text-decoration-none gap-2">
                    <Dumbbell className="text-primary" size={28} />
                    <span className="fs-4 fw-bold tracking-tight">GymSuite Pro</span>
                </Link>
                <hr className="bg-secondary mb-4 opacity-25" />

                <ul className="nav nav-pills flex-column mb-auto gap-2">
                    {navItems.map((item) => (
                        <li className="nav-item" key={item.path}>
                            <Link
                                to={item.path}
                                className={`nav-link d-flex align-items-center gap-3 py-3 px-3 fw-medium text-white transition-all ${location.pathname === item.path ? 'active bg-primary shadow-sm rounded-3' : 'hover-bg-secondary rounded-3'}`}
                                style={{ opacity: location.pathname === item.path ? 1 : 0.8 }}
                            >
                                <item.icon size={20} />
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>

                <hr className="bg-secondary mb-4 opacity-25 mt-auto" />
                <div className="d-flex align-items-center justify-content-between bg-dark border border-secondary border-opacity-25 p-3 rounded-3 w-100 mb-2">
                    <div className="d-flex align-items-center text-white text-decoration-none">
                        <div className="bg-primary rounded-circle d-flex justify-content-center align-items-center text-white fw-bold me-3 shadow-sm" style={{ width: '38px', height: '38px' }}>
                            {gymData?.name ? gymData.name.charAt(0).toUpperCase() : 'G'}
                        </div>
                        <div>
                            <strong className="d-block mb-0 text-truncate" style={{ maxWidth: '100px' }}>{gymData?.name || 'Workspace'}</strong>
                            <span className="small text-muted opacity-75">{gymData?.role || 'Admin'}</span>
                        </div>
                    </div>
                </div>
                <button className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2" onClick={handleLogout}>
                    <LogOut size={16} /> Sign out
                </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-grow-1" style={{ marginLeft: '280px' }}>
                <nav className="navbar navbar-expand-lg border-bottom sticky-top py-3" style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
                    <div className="container-fluid px-5">
                        <h4 className="fw-bold mb-0 text-dark">
                            {navItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
                        </h4>
                        <div className="d-flex">
                            <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 fw-medium border border-primary border-opacity-25 rounded-pill">
                                Phase 4 Environment
                            </span>
                        </div>
                    </div>
                </nav>
                <div className="p-xl-5 p-4 pb-5">
                    <Outlet context={{ gymData }} />
                </div>
            </div>

        </div>
    );
}

function App() {
    const [token, setToken] = useState(localStorage.getItem('gymSaaS_token'));
    const [gymData, setGymData] = useState(JSON.parse(localStorage.getItem('gymSaaS_info')) || null);

    const setAuthParams = (newToken, newGymData) => {
        setToken(newToken);
        setGymData(newGymData);
    };

    const handleLogout = () => {
        localStorage.removeItem('gymSaaS_token');
        localStorage.removeItem('gymSaaS_info');
        setToken(null);
        setGymData(null);
    };

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={
                    token ? <Navigate to="/" replace /> : <Login setAuthParams={setAuthParams} />
                } />

                {/* Protected Saas Routes */}
                <Route path="/" element={<ProtectedRoute isAuth={!!token}><Layout gymData={gymData} handleLogout={handleLogout} /></ProtectedRoute>}>
                    <Route index element={gymData?.role === 'MEMBER' ? <MemberPortal /> : <Dashboard />} />
                    <Route path="attendance" element={<Attendance />} />
                    <Route path="classes" element={<Classes />} />
                    <Route path="members" element={<Members />} />
                    <Route path="plans" element={<Plans />} />
                    <Route path="trainers" element={<Trainers />} />
                    <Route path="receipt" element={<ReceiptGenerator />} />
                    <Route path="reminders" element={<ExpiryReminders />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
