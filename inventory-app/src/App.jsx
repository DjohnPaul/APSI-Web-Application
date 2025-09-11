import React, { createContext, useContext, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";
import "./styles.css";

/* ------------------- Mock data (replace with API calls) ------------------- */
const mockUsers = [
  { id: 1, email: "admin@company.com", name: "Admin", role: "admin" },
  { id: 2, email: "csr@company.com", name: "CSR Staff", role: "staff" },
  { id: 3, email: "tl@company.com", name: "Team Lead", role: "tl" },
  { id: 4, email: "acct@company.com", name: "Accounting", role: "accounting" },
];

const mockDashboard = {
  mostOrdered: [
    { name: "Item A", qty: 320 },
    { name: "Item B", qty: 210 },
  ],
  leastOrdered: [
    { name: "Item X", qty: 2 },
    { name: "Item Y", qty: 4 },
  ],
  categories: [
    { name: "Beverages", count: 120 },
    { name: "Snacks", count: 90 },
  ],
  topCustomer: { name: "Retailer 1", orders: 145 },
};

/* ------------------- Auth Context ------------------- */
const AuthContext = createContext();
export function useAuth() {
  return useContext(AuthContext);
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("inventory_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) localStorage.setItem("inventory_user", JSON.stringify(user));
    else localStorage.removeItem("inventory_user");
  }, [user]);

  const login = async ({ email }) => {
    const found = mockUsers.find((u) => u.email === email) || {
      id: 999,
      email,
      name: email.split("@")[0],
      role: "staff",
    };
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
  if (allowed.length && !allowed.includes(user.role))
    return <div className="page">Access denied for role: {user.role}</div>;
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
            <span>
              {user.name} ({user.role})
            </span>
            <button
              onClick={async () => {
                await logout();
                navigate("/login");
              }}
            >
              Logout
            </button>
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
        <li>
          <Link to="/dashboard">Dashboard</Link>
        </li>
        <li>
          <Link to="/customers">Customers</Link>
        </li>
        <li>
          <Link to="/distributors">Distributors</Link>
        </li>
        <li>
          <Link to="/purchasers">Purchasers</Link>
        </li>
        <li>
          <Link to="/warehouse">Warehouse</Link>
        </li>
        <li>
          <Link to="/staffs">Staffs</Link>
        </li>
        <li>
          <Link to="/tl">TL (Approvals)</Link>
        </li>
        <li>
          <Link to="/accounting">Accounting</Link>
        </li>
      </ul>
    </aside>
  );
}

function Container({ children }) {
  return <div className="container">{children}</div>;
}

/* ------------------- Pages ------------------- */
function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState();
  const navigate = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    try {
      await login({ email });
      navigate("/dashboard");
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div className="page">
      <h2>Login</h2>
      <form onSubmit={handle} className="form">
        <label>Email </label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
        <button type="submit">Sign in</button>
      </form>
    </div>
  );
}

function DashboardPage() {
  const data = mockDashboard;
  return (
    <div className="page">
      <h2>Dashboard</h2>
      <div className="card-grid">
        <Card title="Most Ordered">
          <ul>
            {data.mostOrdered.map((i) => (
              <li key={i.name}>
                {i.name}: {i.qty}
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Least Ordered">
          <ul>
            {data.leastOrdered.map((i) => (
              <li key={i.name}>
                {i.name}: {i.qty}
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Top Customer">
          {data.topCustomer.name} — {data.topCustomer.orders} orders
        </Card>
      </div>
      <Card title="Categories">
        <ul className="inline-list">
          {data.categories.map((c) => (
            <li key={c.name}>
              {c.name}: {c.count}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function CustomersPage() {
  const sample = Array.from({ length: 8 }).map((_, i) => ({
    id: i + 1,
    name: `Retailer ${i + 1}`,
    orders: Math.floor(Math.random() * 200),
  }));
  return (
    <div className="page">
      <h2>Customers</h2>
      <Table
        columns={["ID", "Name", "Orders"]}
        data={sample.map((r) => [r.id, r.name, r.orders])}
      />
    </div>
  );
}

function DistributorsPage() {
  const sample = Array.from({ length: 6 }).map((_, i) => ({
    id: i + 1,
    name: `Distributor ${i + 1}`,
    supplies: Math.floor(Math.random() * 50),
  }));
  return (
    <div className="page">
      <h2>Distributors</h2>
      <Table
        columns={["ID", "Name", "Supplies"]}
        data={sample.map((r) => [r.id, r.name, r.supplies])}
      />
    </div>
  );
}

function PurchasersPage() {
  return (
    <div className="page">
      <h2>Purchasers</h2>
      <p>Tracks who places orders. TODO: Implement purchaser form + backend.</p>
    </div>
  );
}

function WarehousePage() {
  const sample = [
    [1, "Item A", "Received", "OK"],
    [2, "Item B", "Received", "Damaged"],
    [3, "Item C", "Pending", "Missing"],
  ];
  return (
    <div className="page">
      <h2>Warehouse</h2>
      <Table columns={["ID", "Item", "Status", "Notes"]} data={sample} />
    </div>
  );
}

function StaffsPage() {
  return (
    <div className="page">
      <h2>Staffs</h2>
      <p>Assign items to customers. TODO: add UI + backend hooks.</p>
    </div>
  );
}

function TLPage() {
  return (
    <div className="page">
      <h2>Team Lead Approvals</h2>
      <p>Approve assignments. TODO: show pending list.</p>
    </div>
  );
}

function AccountingPage() {
  const sample = Array.from({ length: 5 }).map((_, i) => ({
    id: i + 1,
    client: `Client ${i + 1}`,
    invoices: Math.floor(Math.random() * 12),
  }));
  return (
    <div className="page">
      <h2>Accounting</h2>
      <Table
        columns={["ID", "Client", "Invoices"]}
        data={sample.map((r) => [r.id, r.client, r.invoices])}
      />
    </div>
  );
}

/* ------------------- Small UI bits ------------------- */
function Card({ title, children }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <div>{children}</div>
    </div>
  );
}

function Table({ columns = [], data = [] }) {
  return (
    <table className="table">
      <thead>
        <tr>
          {columns.map((c, i) => (
            <th key={i}>{c}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rIdx) => (
          <tr key={rIdx}>
            {row.map((cell, cIdx) => (
              <td key={cIdx}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ------------------- App shell ------------------- */
export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <TopNav />
          <div className="main">
            <Sidebar />
            <Container>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customers"
                  element={
                    <ProtectedRoute>
                      <CustomersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/distributors"
                  element={
                    <ProtectedRoute>
                      <DistributorsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/purchasers"
                  element={
                    <ProtectedRoute>
                      <PurchasersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/warehouse"
                  element={
                    <ProtectedRoute>
                      <WarehousePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/staffs"
                  element={
                    <ProtectedRoute>
                      <StaffsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tl"
                  element={
                    <ProtectedRoute>
                      <TLPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/accounting"
                  element={
                    <ProtectedRoute>
                      <AccountingPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/"
                  element={<Navigate to="/dashboard" replace />}
                />
              </Routes>
            </Container>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}
