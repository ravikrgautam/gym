import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Users, TrendingUp, AlertCircle, ArrowUpRight, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { apiFetch } from '../utils/api';

const StatCard = ({ title, value, icon: Icon, trend, colorClass }) => (
    <div className="card border-0 shadow-sm h-100 transition-all hover-elevate">
        <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h6 className="text-muted fw-semibold text-uppercase tracking-wider mb-0">{title}</h6>
                <div className={`p-2 rounded-circle ${colorClass} bg-opacity-10 text-${colorClass.replace('bg-', '')}`}>
                    <Icon size={20} />
                </div>
            </div>
            <h2 className="fs-2 fw-bold text-dark mb-2">{value}</h2>
            {trend && (
                <p className="text-success small fw-medium mb-0 d-flex align-items-center gap-1">
                    <ArrowUpRight size={14} /> {trend} this month
                </p>
            )}
        </div>
    </div>
);

const Dashboard = () => {
    const { gymData } = useOutletContext();
    const [stats, setStats] = useState({
        activeMembers: 0,
        expiredMembers: 0,
        expiringSoon: 0,
        totalRevenue: 0,
        trainersCount: 0,
        recentInvoices: []
    });
    const [revenueTrend, setRevenueTrend] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const [res, trendRes] = await Promise.all([
                    apiFetch('/api/dashboard'),
                    apiFetch('/api/dashboard/revenue-trend')
                ]);
                setStats(res);
                setRevenueTrend(trendRes);
            } catch (err) {
                console.error("Failed to load dashboard stats", err);
            } finally {
                setLoading(false);
            }
        };
        loadDashboard();
    }, []);

    return (
        <div className="container-fluid p-0 max-w-7xl mx-auto">

            {/* Welcome Banner */}
            <div className="card border-0 bg-primary text-white shadow-sm mb-5 overflow-hidden position-relative" style={{ borderRadius: '16px' }}>
                {/* Decorative gradient overlay */}
                <div className="position-absolute w-100 h-100 top-0 start-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)', zIndex: 1 }}></div>

                <div className="card-body p-5 position-relative" style={{ zIndex: 2 }}>
                    <div className="row align-items-center">
                        <div className="col-md-8">
                            <h2 className="fw-bold mb-2 tracking-tight">Welcome back, Alpha Fitness Gym! 👋</h2>
                            <p className="lead mb-0 opacity-75">Here's what is happening with your gym today.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Primary Stats */}
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-5 g-3 mb-5">
                <div className="col">
                    <StatCard
                        title="Active"
                        value={loading ? '-' : stats.activeMembers}
                        icon={Users}
                        trend="+New!"
                        colorClass="bg-primary"
                    />
                </div>
                <div className="col">
                    <StatCard
                        title="Expiring (<7d)"
                        value={loading ? '-' : stats.expiringSoon}
                        icon={AlertCircle}
                        colorClass="bg-warning"
                    />
                </div>
                <div className="col">
                    <StatCard
                        title="Expired"
                        value={loading ? '-' : stats.expiredMembers}
                        icon={AlertCircle}
                        colorClass="bg-danger"
                    />
                </div>
                <div className="col">
                    <StatCard
                        title="Trainers"
                        value={loading ? '-' : stats.trainersCount}
                        icon={Activity}
                        colorClass="bg-info"
                    />
                </div>
                <div className="col">
                    <StatCard
                        title="Revenue"
                        value={loading ? '-' : `₹ ${stats.totalRevenue}`}
                        icon={TrendingUp}
                        trend="Stable"
                        colorClass="bg-success"
                    />
                </div>
            </div>

            {/* Revenue Trend Chart */}
            <div className="card border-0 shadow-sm rounded-4 mb-5 p-4 bg-white">
                <h5 className="fw-bold text-dark mb-4 d-flex align-items-center gap-2">
                    <TrendingUp className="text-primary" /> Revenue Trend (Last 6 Months)
                </h5>
                <div style={{ width: '100%', height: 300 }}>
                    {loading ? (
                        <div className="h-100 d-flex align-items-center justify-content-center text-muted">Loading chart data...</div>
                    ) : revenueTrend.length === 0 ? (
                        <div className="h-100 d-flex align-items-center justify-content-center text-muted">No revenue data available.</div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0d6efd" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#0d6efd" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="month" tick={{ fill: '#6c757d', fontSize: 12 }} tickLine={false} axisLine={false} />
                                <YAxis tick={{ fill: '#6c757d', fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val >= 1000 ? val / 1000 + 'k' : val}`} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                <Tooltip
                                    formatter={(value) => [`₹${value}`, 'Revenue']}
                                    labelStyle={{ color: '#212529', fontWeight: 'bold' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#0d6efd" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Bottom Row */}
            <div className="row g-4">
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm h-100 p-4">
                        <h5 className="fw-bold text-dark mb-4">Recent Invoices</h5>
                        {stats.recentInvoices && stats.recentInvoices.length > 0 ? (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="bg-light">
                                        <tr>
                                            <th className="small text-muted text-uppercase fw-semibold py-3 border-0">Invoice #</th>
                                            <th className="small text-muted text-uppercase fw-semibold py-3 border-0">Member</th>
                                            <th className="small text-muted text-uppercase fw-semibold py-3 border-0">Amount</th>
                                            <th className="small text-muted text-uppercase fw-semibold py-3 border-0 text-end">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.recentInvoices.map(inv => (
                                            <tr key={inv.id}>
                                                <td className="fw-medium text-dark">{inv.invoice_number}</td>
                                                <td className="text-muted">{inv.member_name}</td>
                                                <td className="fw-bold text-success">₹{inv.amount_paid}</td>
                                                <td className="text-muted text-end">{new Date(inv.issue_date).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center p-5 opacity-50">
                                <p className="mb-0">No recent invoices found.</p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm h-100 p-4 bg-light">
                        <h5 className="fw-bold text-dark mb-4">Quick Actions</h5>
                        <div className="d-flex flex-column gap-3">
                            <Link to="/members" className="btn btn-white shadow-sm border py-3 text-start fw-medium hover-elevate transition-all text-decoration-none text-dark">
                                ➕ Add New Member
                            </Link>
                            <Link to="/receipt" className="btn btn-white shadow-sm border py-3 text-start fw-medium hover-elevate transition-all text-decoration-none text-dark">
                                🧾 Generate Invoice
                            </Link>
                            <Link to="/reminders" className="btn btn-white shadow-sm border py-3 text-start fw-medium hover-elevate transition-all text-danger text-decoration-none">
                                🚨 Send Reminders ({loading ? 0 : stats.expiredMembers})
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Dashboard;
