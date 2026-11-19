import WaiterNotifications from "./pages/WaiterNotifications";
import Queue from "./pages/QueueManagement";
import LiveTracking from "./pages/LiveTracking";
import OrderPriority from "./pages/OrderPriority";
import Cooking from "./pages/CookingStatus";
import Dashboard from "./pages/Dashboard";
import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate
} from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import CustomerOrdering from "./pages/CustomerOrdering";

import "./App.css";

const pageTitles = {
  "/": "Overview Dashboard",
  "/ordering": "Customer Ordering",
  "/tracking": "Live Order Tracking",
  "/priority": "Order Priority Display",
  "/cooking": "Cooking Status",
  "/queue": "Queue Management",
  "/notifications": "Waiter Notifications"
};

function ComingSoon({ title }) {
  return (
    <div className="coming-soon">
      <h2>{title}</h2>
      <p>This module will be connected to your Django backend.</p>
    </div>
  );
}

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;
  const currentTitle = pageTitles[currentPath] || "Smart Kitchen";

  return (
    <div className="admin-layout">

      <Sidebar
        activePage={currentPath}
        onNavigate={navigate}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="admin-main">
        <Navbar
          title={currentTitle}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="admin-content">
          <Routes>
            <Route
              path="/"
              element={<Dashboard />}
            />

            <Route
              path="/ordering"
              element={<CustomerOrdering />}
            />

            <Route
              path="/tracking"
              element={<LiveTracking />}
            />

            <Route
              path="/priority"
              element={<OrderPriority />}
            />

            <Route
              path="/cooking"
              element={<Cooking Status />}
            />

            <Route
              path="/queue"
              element={<Queue Management />}
            />

            <Route
              path="/notifications"
              element={<WaiterNotifications />}
            />
          </Routes>
        </main>
      </div>

    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
