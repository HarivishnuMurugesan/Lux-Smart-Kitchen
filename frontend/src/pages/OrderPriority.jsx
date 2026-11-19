
import { useEffect, useState, useCallback } from "react";
import {
  AlertTriangle,
  ArrowUp,
  Clock,
  RefreshCw,
  ShoppingBag
} from "lucide-react";

import api from "../services/api";
import "./OrderPriority.css";

function OrderPriority() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchOrders = useCallback(async () => {
    try {
      setError("");

      const response = await api.get("orders/");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      setOrders(data);
    } catch (err) {
      setError(
        err.response
          ? `Unable to load orders (${err.response.status})`
          : "Cannot connect to Django server."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();

    const interval = setInterval(fetchOrders, 10000);

    return () => clearInterval(interval);
  }, [fetchOrders]);

  async function changePriority(orderId, priority) {
    try {
      setUpdating(orderId);
      setError("");
      setSuccess("");

      await api.patch(
        `orders/${orderId}/update_priority/`,
        { priority }
      );

      setSuccess(`Order priority updated to ${priority}.`);

      await fetchOrders();
    } catch (err) {
      setError(
        err.response?.data
          ? JSON.stringify(err.response.data)
          : "Unable to update priority."
      );
    } finally {
      setUpdating(null);
    }
  }

  const priorityConfig = {
    urgent: {
      label: "Urgent",
      icon: AlertTriangle,
      className: "urgent"
    },
    high: {
      label: "High",
      icon: ArrowUp,
      className: "high"
    },
    normal: {
      label: "Normal",
      icon: Clock,
      className: "normal"
    }
  };

  const counts = {
    urgent: orders.filter(o => o.priority === "urgent").length,
    high: orders.filter(o => o.priority === "high").length,
    normal: orders.filter(o => o.priority === "normal").length
  };

  const sortedOrders = [...orders].sort((a, b) => {
    const rank = { urgent: 0, high: 1, normal: 2 };

    return (rank[a.priority] ?? 3) - (rank[b.priority] ?? 3);
  });

  return (
    <div className="priority-page">

      <div className="priority-heading">
        <div>
          <span className="priority-eyebrow">
            KITCHEN OPERATIONS
          </span>
          <h1>Order Priority</h1>
          <p>Manage order urgency and kitchen workload.</p>
        </div>

        <button
          className="priority-refresh"
          onClick={fetchOrders}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="priority-summary">
        {Object.entries(priorityConfig).map(([key, config]) => {
          const Icon = config.icon;

          return (
            <div className={`priority-stat ${config.className}`} key={key}>
              <div className="priority-stat-icon">
                <Icon size={21} />
              </div>
              <div>
                <span>{config.label} Orders</span>
                <strong>{counts[key]}</strong>
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="priority-error">{error}</div>
      )}

      {success && (
        <div className="priority-success">{success}</div>
      )}

      <div className="priority-list-container">

        <div className="priority-list-heading">
          <div>
            <h2>All Orders</h2>
            <p>Urgent orders are displayed first.</p>
          </div>
          <span>{orders.length} Orders</span>
        </div>

        {loading ? (
          <p className="priority-empty">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="priority-empty">No orders available.</p>
        ) : (
          <div className="priority-table-wrapper">
            <table className="priority-table">
              <thead>
                <tr>
                  <th>ORDER</th>
                  <th>CUSTOMER</th>
                  <th>TABLE</th>
                  <th>STATUS</th>
                  <th>PRIORITY</th>
                  <th>CHANGE PRIORITY</th>
                </tr>
              </thead>

              <tbody>
                {sortedOrders.map(order => {
                  const config =
                    priorityConfig[order.priority] ||
                    priorityConfig.normal;

                  return (
                    <tr key={order.id}>
                      <td>
                        <strong>{order.order_number}</strong>
                      </td>

                      <td>{order.customer_name}</td>

                      <td>Table {order.table_number}</td>

                      <td>
                        <span className="order-status">
                          {order.status}
                        </span>
                      </td>

                      <td>
                        <span className={`priority-badge ${config.className}`}>
                          {config.label}
                        </span>
                      </td>

                      <td>
                        <select
                          value={order.priority || "normal"}
                          disabled={updating === order.id}
                          onChange={e =>
                            changePriority(order.id, e.target.value)
                          }
                          className="priority-select"
                        >
                          <option value="normal">Normal</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>

                        {updating === order.id && (
                          <span className="priority-saving">
                            Saving...
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      <div className="priority-note">
        <ShoppingBag size={17} />
        Priority changes are saved through the Django API.
      </div>

    </div>
  );
}

export default OrderPriority;
