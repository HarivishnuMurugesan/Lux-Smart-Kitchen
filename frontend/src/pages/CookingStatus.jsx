
import { useEffect, useState, useCallback } from "react";
import {
  Clock,
  ChefHat,
  CheckCircle2,
  RefreshCw,
  Utensils,
  ArrowRight
} from "lucide-react";

import api from "../services/api";
import "./CookingStatus.css";

const statusColumns = [
  {
    key: "pending",
    title: "New Orders",
    color: "#d49a43"
  },
  {
    key: "preparing",
    title: "Preparing",
    color: "#9271c5"
  },
  {
    key: "ready",
    title: "Ready",
    color: "#399b72"
  },
  {
    key: "served",
    title: "Served",
    color: "#508b87"
  }
];

function CookingStatus() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

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
          ? `Unable to load orders. API status: ${err.response.status}`
          : "Cannot connect to Django backend."
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

  async function updateStatus(orderId, newStatus) {
    try {
      setUpdatingId(orderId);
      setError("");

      await api.patch(
        `orders/${orderId}/update_status/`,
        { status: newStatus }
      );

      await fetchOrders();
    } catch (err) {
      setError(
        err.response?.data
          ? JSON.stringify(err.response.data)
          : "Unable to update order status."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  function getNextStatus(status) {
    const transitions = {
      pending: "preparing",
      preparing: "ready",
      ready: "served"
    };

    return transitions[status];
  }

  function getButtonLabel(status) {
    const labels = {
      pending: "Start Cooking",
      preparing: "Mark as Ready",
      ready: "Mark as Served"
    };

    return labels[status];
  }

  return (
    <div className="cooking-page">

      <div className="cooking-heading">
        <div>
          <span className="cooking-eyebrow">
            KITCHEN OPERATIONS
          </span>
          <h1>Cooking Status</h1>
          <p>Manage incoming orders and cooking progress.</p>
        </div>

        <button
          className="cooking-refresh"
          onClick={fetchOrders}
        >
          <RefreshCw size={16} />
          Refresh Orders
        </button>
      </div>

      {error && (
        <div className="cooking-error">{error}</div>
      )}

      <div className="cooking-summary">
        {statusColumns.map(column => (
          <div className="cooking-summary-card" key={column.key}>
            <span
              className="summary-dot"
              style={{ background: column.color }}
            />
            <div>
              <span>{column.title}</span>
              <strong>
                {orders.filter(o => o.status === column.key).length}
              </strong>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <p className="cooking-message">Loading kitchen orders...</p>
      ) : (
        <div className="cooking-columns">

          {statusColumns.map(column => {
            const columnOrders = orders.filter(
              order => order.status === column.key
            );

            return (
              <section className="cooking-column" key={column.key}>

                <div className="cooking-column-heading">
                  <div>
                    <span
                      className="summary-dot"
                      style={{ background: column.color }}
                    />
                    <h2>{column.title}</h2>
                  </div>
                  <span className="column-count">
                    {columnOrders.length}
                  </span>
                </div>

                {columnOrders.length === 0 && (
                  <div className="empty-column">
                    No orders here
                  </div>
                )}

                {columnOrders.map(order => {
                  const nextStatus = getNextStatus(order.status);

                  return (
                    <article
                      className="cooking-order-card"
                      key={order.id}
                    >
                      <div className="order-card-top">
                        <strong>
                          {order.order_number}
                        </strong>

                        <span className={`priority-tag ${order.priority}`}>
                          {order.priority}
                        </span>
                      </div>

                      <h3>{order.customer_name}</h3>

                      <p className="table-number">
                        Table {order.table_number}
                      </p>

                      <div className="order-food-list">
                        {(order.items || []).map((item, index) => (
                          <div key={item.id || index}>
                            <span>{item.item_name}</span>
                            <strong>× {item.quantity}</strong>
                          </div>
                        ))}
                      </div>

                      <div className="order-time">
                        <Clock size={14} />
                        {order.estimated_preparation_time} min preparation
                      </div>

                      {nextStatus && (
                        <button
                          className="cooking-action"
                          disabled={updatingId === order.id}
                          onClick={() =>
                            updateStatus(order.id, nextStatus)
                          }
                        >
                          {updatingId === order.id
                            ? "Updating..."
                            : getButtonLabel(order.status)}

                          <ArrowRight size={16} />
                        </button>
                      )}

                      {order.status === "served" && (
                        <div className="served-label">
                          <CheckCircle2 size={16} />
                          Order served
                        </div>
                      )}

                    </article>
                  );
                })}

              </section>
            );
          })}

        </div>
      )}

      <div className="cooking-footer-note">
        <ChefHat size={17} />
        Kitchen orders refresh automatically every 10 seconds.
      </div>

    </div>
  );
}

export default CookingStatus;
