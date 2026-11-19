
import { useEffect, useState } from "react";
import api from "../services/api";
import "./QueueManagement.css";

function QueueManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchQueue = async () => {
    try {
      const response = await api.get("orders/");
      const data = response.data;
      const allOrders = Array.isArray(data) ? data : data.results || [];

      // Only active kitchen orders belong in the queue.
      const activeOrders = allOrders.filter((order) =>
        ["pending", "preparing"].includes(
          order.status?.toLowerCase()
        )
      );

      // Sort by priority first, then by order creation time.
      const priorityRank = {
        urgent: 1,
        high: 2,
        normal: 3,
      };

      activeOrders.sort((a, b) => {
        const aPriority = priorityRank[a.priority?.toLowerCase()] || 3;
        const bPriority = priorityRank[b.priority?.toLowerCase()] || 3;

        if (aPriority !== bPriority) {
          return aPriority - bPriority;
        }

        return new Date(a.created_at) - new Date(b.created_at);
      });

      setOrders(activeOrders);
      setError("");
    } catch (err) {
      console.error("Queue error:", err);
      setError("Unable to load queue. Please check the backend server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();

    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  const getPriorityClass = (priority) => {
    return priority?.toLowerCase() || "normal";
  };

  const getStatusClass = (status) => {
    return status?.toLowerCase() || "pending";
  };

  if (loading) {
    return <div className="queue-page">Loading queue...</div>;
  }

  return (
    <div className="queue-page">
      <div className="queue-header">
        <div>
          <h1>Queue Management</h1>
          <p>Monitor and manage active kitchen orders.</p>
        </div>

        <button className="queue-refresh" onClick={fetchQueue}>
          Refresh Queue
        </button>
      </div>

      <div className="queue-summary">
        <div className="queue-summary-card">
          <span>Total Active Orders</span>
          <h2>{orders.length}</h2>
        </div>

        <div className="queue-summary-card">
          <span>Pending Orders</span>
          <h2>
            {orders.filter((o) => o.status?.toLowerCase() === "pending").length}
          </h2>
        </div>

        <div className="queue-summary-card">
          <span>Preparing Orders</span>
          <h2>
            {orders.filter((o) => o.status?.toLowerCase() === "preparing").length}
          </h2>
        </div>
      </div>

      {error && <p className="queue-error">{error}</p>}

      <div className="queue-list">
        <h2>Current Kitchen Queue</h2>

        {orders.length === 0 ? (
          <div className="queue-empty">
            No active orders in the queue.
          </div>
        ) : (
          orders.map((order, index) => (
            <div className="queue-order-card" key={order.id}>
              <div className="queue-position">
                <span>QUEUE</span>
                <strong>#{index + 1}</strong>
              </div>

              <div className="queue-order-details">
                <h3>{order.order_number || `Order #${order.id}`}</h3>
                <p>Customer: {order.customer_name || "N/A"}</p>
                <p>Table: {order.table_number || "N/A"}</p>

                <div className="queue-food-items">
                  {order.items?.length
                    ? order.items.map((item, itemIndex) => (
                        <span key={item.id || itemIndex}>
                          {item.item_name} × {item.quantity}
                        </span>
                      ))
                    : "No item details"}
                </div>
              </div>

              <div className="queue-order-meta">
                <span className={`queue-priority ${getPriorityClass(order.priority)}`}>
                  {order.priority || "Normal"}
                </span>

                <span className={`queue-status ${getStatusClass(order.status)}`}>
                  {order.status}
                </span>

                <p>
                  Estimated: {order.estimated_preparation_time ?? "N/A"} min
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <p className="queue-auto-refresh">
        Queue automatically refreshes every 5 seconds.
      </p>
    </div>
  );
}

export default QueueManagement;
