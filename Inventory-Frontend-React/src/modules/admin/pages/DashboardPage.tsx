import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Activity,
    Package,
    TrendingUp,
    Users as UsersIcon,
    RefreshCw,
    CheckCircle2,
    XCircle,
    Clock
} from 'lucide-react';
import { authApi, inventoryApi, supplierApi, salesApi } from '../../../services/api';

const DashboardPage: React.FC = () => {
    const [statuses, setStatuses] = useState({
        auth: 'loading',
        inventory: 'loading',
        supplier: 'loading',
        sales: 'loading',
    });

    const checkServices = async () => {
        const check = async (api: any, key: string) => {
            try {
                await api.get('/'); // Basic health check
                setStatuses(prev => ({ ...prev, [key]: 'online' }));
            } catch (e) {
                setStatuses(prev => ({ ...prev, [key]: 'offline' }));
            }
        };

        check(authApi, 'auth');
        check(inventoryApi, 'inventory');
        check(supplierApi, 'supplier');
        check(salesApi, 'sales');
    };

    useEffect(() => {
        checkServices();
        const interval = setInterval(checkServices, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, []);

    const stats = [
        { title: 'Total Revenue', value: '128,430', change: '+12.5%', icon: TrendingUp, color: '#6366f1' },
        { title: 'Active Products', value: '2,840', change: '+3.2%', icon: Package, color: '#10b981' },
        { title: 'Total Users', value: '156', change: '+8.1%', icon: UsersIcon, color: '#8b5cf6' },
        { title: 'System Load', value: '14%', change: '-2.4%', icon: Activity, color: '#f59e0b' },
    ];

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div>
                    <h1>Admin Overview</h1>
                    <p>Welcome back! Here's what's happening with the inventory system.</p>
                </div>
                <button className="refresh-btn" onClick={checkServices}>
                    <RefreshCw size={18} />
                    <span>Refresh Data</span>
                </button>
            </div>

            <div className="stats-grid">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="stat-card glass-card"
                    >
                        <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                            <stat.icon size={24} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-title">{stat.title}</span>
                            <div className="stat-value-row">
                                <span className="stat-value">{stat.value}</span>
                                <span className={`stat-change ${stat.change.startsWith('+') ? 'up' : 'down'}`}>
                                    {stat.change}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="dashboard-grid">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="service-status glass-card"
                >
                    <div className="card-header">
                        <h3>Microservices Status</h3>
                        <span className="badge">Real-time</span>
                    </div>
                    <div className="service-list">
                        {Object.entries(statuses).map(([name, status]) => (
                            <div key={name} className="service-item">
                                <div className="service-info">
                                    <div className={`status-indicator ${status}`}></div>
                                    <span className="service-name">{name.toUpperCase()} Service</span>
                                </div>
                                <div className="service-meta">
                                    {status === 'loading' && <Clock size={16} className="text-dim animate-spin" />}
                                    {status === 'online' && <CheckCircle2 size={16} color="var(--success)" />}
                                    {status === 'offline' && <XCircle size={16} color="var(--danger)" />}
                                    <span className={`status-text ${status}`}>{status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="recent-activity glass-card"
                >
                    <div className="card-header">
                        <h3>Recent System Logs</h3>
                        <a href="#" className="view-all">View All</a>
                    </div>
                    <div className="activity-list">
                        <div className="activity-item">
                            <div className="activity-point"></div>
                            <div className="activity-content">
                                <p><strong>Admin</strong> created new user <em>jane_doe</em></p>
                                <span>2 minutes ago</span>
                            </div>
                        </div>
                        <div className="activity-item">
                            <div className="activity-point"></div>
                            <div className="activity-content">
                                <p><strong>Inventory</strong> stock alert: <em>MacBook Pro M2</em> is low</p>
                                <span>15 minutes ago</span>
                            </div>
                        </div>
                        <div className="activity-item">
                            <div className="activity-point"></div>
                            <div className="activity-content">
                                <p><strong>System</strong> database backup completed successfully</p>
                                <span>1 hour ago</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            <style>{`
        .dashboard {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .dashboard-header h1 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .dashboard-header p {
          color: var(--text-dim);
          font-size: 15px;
        }

        .refresh-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border);
          padding: 10px 16px;
          border-radius: 10px;
          color: var(--text-main);
          font-weight: 500;
          font-size: 14px;
        }

        .refresh-btn:hover {
          background: var(--border);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 24px;
        }

        .stat-card {
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-title {
          font-size: 13px;
          color: var(--text-dim);
          font-weight: 500;
        }

        .stat-value-row {
          display: flex;
          align-items: baseline;
          gap: 12px;
        }

        .stat-value {
          font-size: 22px;
          font-weight: 700;
        }

        .stat-change {
          font-size: 12px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 6px;
        }

        .stat-change.up { color: var(--success); background: rgba(16, 185, 129, 0.1); }
        .stat-change.down { color: var(--danger); background: rgba(244, 63, 94, 0.1); }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 24px;
        }

        @media (max-width: 1200px) {
          .dashboard-grid { grid-template-columns: 1fr; }
        }

        .card-header {
          padding: 24px;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .card-header h3 {
          font-size: 17px;
          font-weight: 600;
        }

        .badge {
          font-size: 11px;
          font-weight: 700;
          color: var(--primary);
          background: var(--primary-glow);
          padding: 4px 10px;
          border-radius: 20px;
          text-transform: uppercase;
        }

        .service-list {
          padding: 12px;
          display: flex;
          flex-direction: column;
        }

        .service-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 12px;
          border-radius: 12px;
          transition: background 0.2s;
        }

        .service-item:hover {
          background: rgba(255, 255, 255, 0.03);
        }

        .service-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .status-indicator.online { background: var(--success); box-shadow: 0 0 10px var(--success); }
        .status-indicator.offline { background: var(--danger); }
        .status-indicator.loading { background: var(--text-dim); }

        .service-name {
          font-size: 14px;
          font-weight: 500;
        }

        .service-meta {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .status-text {
          font-size: 12px;
          font-weight: 600;
          text-transform: capitalize;
        }

        .status-text.online { color: var(--success); }
        .status-text.offline { color: var(--danger); }

        .activity-list {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .activity-item {
          display: flex;
          gap: 16px;
        }

        .activity-point {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: 2px solid var(--primary);
          background: var(--bg-main);
          margin-top: 5px;
          flex-shrink: 0;
          position: relative;
        }

        .activity-item:not(:last-child) .activity-point::after {
          content: '';
          position: absolute;
          top: 10px;
          left: 50%;
          transform: translateX(-50%);
          width: 2px;
          height: 30px;
          background: var(--border);
        }

        .activity-content p {
          font-size: 14px;
          margin-bottom: 4px;
        }

        .activity-content span {
          font-size: 12px;
          color: var(--text-dim);
        }

        .view-all {
          font-size: 13px;
          color: var(--primary);
          font-weight: 500;
        }
      `}</style>
        </div>
    );
};

export default DashboardPage;
