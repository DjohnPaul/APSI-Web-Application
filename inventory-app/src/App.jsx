import React, { createContext, useContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import './styles.css';

/* ------------------- Mock data (replace with API calls) ------------------- */
const mockUsers = [
  { id: 1, email: 'admin@company.com', name: 'Admin', role: 'admin' },
  { id: 2, email: 'csr@company.com', name: 'CSR Staff', role: 'staff' },
  { id: 3, email: 'tl@company.com', name: 'Team Lead', role: 'tl' },
  { id: 4, email: 'acct@company.com', name: 'Accounting', role: 'accounting' },
];

const mockDashboard = {
  mostOrdered: [{ name: 'Item A', qty: 320 }, { name: 'Item B', qty: 210 }],
  leastOrdered: [{ name: 'Item X', qty: 2 }, { name: 'Item Y', qty: 4 }],
  categories: [{ name: 'Beverages', count: 120 }, { name: 'Snacks', count: 90 }],
  topCustomer: { name: 'Retailer 1', orders: 145 },
};

/* ------------------- Auth Context ------------------- */
const AuthContext = createContext();
export function useAuth() {
  return useContext(AuthContext);
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('inventory_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) localStorage.setItem('inventory_user', JSON.stringify(user));
    else localStorage.removeItem('inventory_user');
  }, [user]);

  const login = async ({ email }) => {
    const found = mockUsers.find(u => u.email === email) || { id: 999, email, name: email.split('@')[0], role: 'staff' };
    setUser(found);
    return found;
  };
  const logout = async () => setUser(null);

  const value = { user, login, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* ------------------- Routing helpers ------------------- */
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function RoleGuard({ allowed = [], children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowed.length && !allowed.includes(user.role)) return <div className="page">Access denied for role: {user.role}</div>;
  return children;
}

/* ------------------- UI Components ------------------- */
function TopNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="topnav">
      <div className="topnav-left">
        <h1 className="logo">Inventory System</h1>
        <nav className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/customers">Customers</Link>
          <Link to="/distributors">Distributors</Link>
          <Link to="/warehouse">Warehouse</Link>
          <Link to="/accounting">Accounting</Link>
        </nav>
      </div>
      <div className="topnav-right">
        {user ? (
          <>
            <span>{user.name} ({user.role})</span>
            <button onClick={async () => { await logout(); navigate('/login'); }}>Logout</button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </header>
  );
}

function Sidebar() {
  return (
    <aside className="sidebar">
      <ul>
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/customers">Customers</Link></li>
        <li><Link to="/distributors">Distributors</Link></li>
        <li><Link to="/purchasers">Purchasers</Link></li>
        <li><Link to="/warehouse">Warehouse</Link></li>
        <li><Link to="/staffs">Staffs</Link></li>
        <li><Link to="/tl">TL (Approvals)</Link></li>
        <li><Link to="/accounting">Accounting</Link></li>
      </ul>
    </aside>
  );
}