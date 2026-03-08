import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Truck,
  LogOut,
  Bell,
  Search,
  Menu,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const user = localStorage.getItem('user') || 'Admin';

  const menuItems = [
    { title: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { title: 'User Management', icon: Users, path: '/admin/users' },
    { title: 'Inventory', icon: Package, path: '/admin/inventory' },
    { title: 'Sales', icon: ShoppingCart, path: '/admin/sales' },
    { title: 'Suppliers', icon: Truck, path: '/admin/suppliers' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="sidebar"
          >
            <div className="sidebar-header">
              <div className="logo">
                <div className="logo-box">AG</div>
                <span>Antigravity</span>
              </div>
            </div>

            <nav className="sidebar-nav">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`nav-link ${isActive ? 'active' : ''}`}
                  >
                    <item.icon size={20} />
                    <span>{item.title}</span>
                    {isActive && <motion.div layoutId="active-pill" className="active-pill" />}
                  </Link>
                );
              })}
            </nav>

            <div className="sidebar-footer">
              <button onClick={handleLogout} className="logout-btn">
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={`main-content ${!sidebarOpen ? 'expanded' : ''}`}>
        <header className="top-header">
          <div className="header-left">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="toggle-btn">
              {sidebarOpen ? <Menu size={20} /> : <ChevronRight size={20} />}
            </button>
            <div className="search-bar">
              <Search size={18} />
              <input type="text" placeholder="Search anything..." />
            </div>
          </div>

          <div className="header-right">
            <button className="icon-badge">
              <Bell size={20} />
              <span className="dot"></span>
            </button>
            <div className="user-profile">
              <div className="user-info">
                <span className="user-name">{user}</span>
                <span className="user-role">Administrator</span>
              </div>
              <div className="avatar">
                {user.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <section className="content-area">
          <Outlet />
        </section>
      </main>

      <style>{`
        .admin-container {
          display: flex;
          min-height: 100vh;
          background-color: var(--bg-main);
        }

        .sidebar {
          width: 280px;
          height: 100vh;
          background: var(--bg-surface);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          position: fixed;
          z-index: 50;
        }

        .sidebar-header {
          padding: 32px 24px;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 700;
          font-size: 20px;
          letter-spacing: -0.5px;
        }

        .logo-box {
          width: 36px;
          height: 36px;
          background: var(--primary);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: white;
        }

        .sidebar-nav {
          padding: 0 12px;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          color: var(--text-muted);
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
          position: relative;
        }

        .nav-link:hover {
          color: var(--text-main);
          background: var(--bg-surface-elevated);
        }

        .nav-link.active {
          color: var(--primary);
          background: var(--primary-glow);
        }

        .active-pill {
          position: absolute;
          left: 0;
          width: 3px;
          height: 18px;
          background: var(--primary);
          border-radius: 0 4px 4px 0;
        }

        .sidebar-footer {
          padding: 24px;
          border-top: 1px solid var(--border);
        }

        .logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 12px;
          color: var(--danger);
          font-weight: 500;
        }

        .logout-btn:hover {
          background: rgba(244, 63, 94, 0.1);
        }

        .main-content {
          flex: 1;
          margin-left: 280px;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .main-content.expanded {
          margin-left: 0;
        }

        .top-header {
          height: 80px;
          background: var(--glass);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          position: sticky;
          top: 0;
          z-index: 40;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .toggle-btn {
          color: var(--text-muted);
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-surface-elevated);
        }

        .search-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--bg-surface-elevated);
          padding: 8px 16px;
          border-radius: 12px;
          border: 1px solid var(--border);
          width: 320px;
          color: var(--text-dim);
        }

        .search-bar input {
          background: none;
          border: none;
          color: var(--text-main);
          width: 100%;
          font-size: 14px;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .icon-badge {
          position: relative;
          color: var(--text-muted);
        }

        .dot {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 8px;
          height: 8px;
          background: var(--danger);
          border: 2px solid var(--bg-surface);
          border-radius: 50%;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-left: 24px;
          border-left: 1px solid var(--border);
        }

        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .user-name {
          font-size: 14px;
          font-weight: 600;
        }

        .user-role {
          font-size: 12px;
          color: var(--text-dim);
        }

        .avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, var(--primary), #818cf8);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: white;
        }

        .content-area {
          padding: 32px;
          flex: 1;
        }

        @media (max-width: 1024px) {
          .sidebar { transform: translateX(-280px); }
          .main-content { margin-left: 0; }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
