
import { useEffect, useState } from "react";
import {
  ShoppingBag,
  Clock,
  ChefHat,
  CheckCircle,
  AlertTriangle,
  RefreshCw
} from "lucide-react";

import api from "../services/api";
import "./Dashboard.css";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchDashboard() {
    try {
      setError("");
      const response = await api.get("dashboard/");
      setStats(response.data);
    } catch (err) {
      setError(
        err.response
          ? `API Error: ${err.response.status}`
          : "Cannot connect to Django server."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboard();

    const interval = setInterval(fetchDashboard, 10000);

    return () => clearInterval(interval);
  }, []);

  const cards = [
    {
      title: "Total Orders",
      value: stats?.total_orders ?? 0,
      icon: ShoppingBag,
      color: "#4778c7"
    },
    {
      title: "Pending Orders",
      value: stats?.pending_orders ?? 0,
      icon: Clock,
      color: "#d49a43"
    },
    {
      title: "Preparing",
      value: stats?.preparing_orders ?? 0,
      icon: ChefHat,
      color: "#9271c5"
    },
    {
      title: "Ready Orders",
      value: stats?.ready_orders ?? 0,
      icon: CheckCircle,
      color: "#399b72"
    },
    {
      title: "Served Orders",
      value: stats?.served_orders ?? 0,
      icon: CheckCircle,
      color: "#508b87"
    },
    {
      title: "Urgent Orders",
      value: stats?.urgent_orders ?? 0,
      icon: AlertTriangle,
      color: "#d65d55"
    }
  ];

  return (
    <div className="dashboard-page">

      <div className="dashboard-heading">
        <div>
          <span className="dashboard-eyebrow">
            RESTAURANT OPERATIONS
          </span>
          <h1>Kitchen Overview</h1>
          <p>Monitor your restaurant orders and kitchen activity.</p>
        </div>

        <button
          className="refresh-button"
          onClick={fetchDashboard}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {loading && <p>Loading dashboard...</p>}

      {error && (
        <div className="dashboard-error">
          {error}
          <button onClick={fetchDashboard}>Try again</button>
        </div>
      )}

      {stats && (
        <>
          <div className="stats-grid">
            {cards.map((card) => {
              const Icon = card.icon;

              return (
                <div className="dashboard-stat" key={card.title}>
                  <div className="stat-heading">
                    <span>{card.title}</span>
                    <div
                      className="stat-icon"
                      style={{
                        color: card.color,
                        background: `${card.color}18`
                      }}
                    >
                      <Icon size={21} />
                    </div>
                  </div>

                  <h2>{card.value}</h2>
                  <p>Orders in the system</p>
                </div>
              );
            })}
          </div>

          <div className="dashboard-information">
            <div className="information-heading">
              <div>
                <h2>Kitchen Activity</h2>
                <p>Current order distribution</p>
              </div>
              <span className="live-indicator">
                <span></span> Auto refresh · 10 sec
              </span>
            </div>

            {[
              ["Pending", stats.pending_orders, "#d49a43"],
              ["Preparing", stats.preparing_orders, "#9271c5"],
              ["Ready", stats.ready_orders, "#399b72"],
              ["Served", stats.served_orders, "#508b87"]
            ].map(([label, value, color]) => {
              const percentage = stats.total_orders > 0
                ? (value / stats.total_orders) * 100
                : 0;

              return (
                <div className="activity-row" key={label}>
                  <div className="activity-label">
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>

                  <div className="activity-track">
                    <div
                      className="activity-fill"
                      style={{
                        width: `${percentage}%`,
                        background: color
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

    </div>
  );
}

export default Dashboard;
