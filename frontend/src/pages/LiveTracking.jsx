
import { useEffect, useState } from "react";
import api from "../services/api";
import "./LiveTracking.css";

function LiveTracking() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      const response = await api.get("orders/");
      const data = response.data;

      setOrders(Array.isArray(data) ? data : data.results || []);
      setError("");
    } catch (err) {
      setError("Unable to fetch live orders.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const interval = setInterval(fetchOrders, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusClass = (status) => {
    return status?.toLowerCase() || "pending";
  };

  if (loading) return <h2>Loading orders...</h2>;

  return (
    <div className="tracking-page">
      <div className="tracking-header">
        <div>
          <h1>Live Order Tracking</h1>
          <p>Monitor kitchen orders and their current status.</p>
        </div>
        <button onClick={fetchOrders}>Refresh</button>
      </div>

      {error && <p className="tracking-error">{error}</p>}

      <div className="tracking-table-wrapper">
        <table className="tracking-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Table</th>
              <th>Order Status</th>
              <th>Estimated Time</th>
            </tr>
          </thead>

          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.order_number || order.id}</td>
                  <td>{order.customer_name}</td>
                  <td>{order.table_number}</td>
                  <td>
                    <span className={`tracking-status ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{order.estimated_preparation_time} min</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No orders available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="tracking-refresh-note">
        Automatically refreshes every 5 seconds.
      </p>
    </div>
  );
}

export default LiveTracking;
