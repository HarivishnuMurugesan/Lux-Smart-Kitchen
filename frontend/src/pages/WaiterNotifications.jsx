
import { useEffect, useState } from "react";
import api from "../services/api";
import "./WaiterNotifications.css";

function WaiterNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

const handleMarkAsRead = async (notificationId) => {
  try {
    await api.patch(`notifications/${notificationId}/`, {
      is_read: true,
    });

    setNotifications((previousNotifications) =>
      previousNotifications.map((notification) =>
        notification.id === notificationId
          ? { ...notification, is_read: true }
          : notification
      )
    );

    setError("");
  } catch (err) {
    console.error("Mark as read error:", err);
    setError("Unable to mark notification as read.");
  }
};


  const fetchNotifications = async () => {
    try {
      const response = await api.get("notifications/");
      const data = response.data;

      setNotifications(
        Array.isArray(data) ? data : data.results || []
      );
      setError("");
    } catch (err) {
      console.error("Notification error:", err);
      setError("Unable to load notifications. Check your backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  const formatDate = (date) => {
    if (!date) return "Time unavailable";

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="waiter-notifications-page">
      <div className="waiter-notifications-header">
        <div>
          <h1>Waiter Notifications</h1>
          <p>Stay updated with kitchen order alerts.</p>
        </div>

        <button onClick={fetchNotifications}>
          Refresh
        </button>
      </div>

      <div className="notification-summary">
        <div className="notification-summary-card">
          <span>Total Notifications</span>
          <h2>{notifications.length}</h2>
        </div>

        <div className="notification-summary-card">
          <span>Unread Notifications</span>
          <h2>{unreadCount}</h2>
        </div>

        <div className="notification-summary-card">
          <span>Read Notifications</span>
          <h2>{notifications.length - unreadCount}</h2>
        </div>
      </div>

      {error && (
        <p className="notification-error">{error}</p>
      )}

      <div className="notification-list">
        <h2>Recent Alerts</h2>

        {loading ? (
          <p>Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <div className="notification-empty">
            No notifications available.
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              className={`notification-card ${
                notification.is_read ? "read" : "unread"
              }`}
              key={notification.id}
            >
              <div className="notification-icon">
                {notification.is_read ? "✓" : "!"}
              </div>

              <div className="notification-content">
                <h3>
                  {notification.message}
                </h3>

                <p>
                  Order ID: #{notification.order}
                </p>

                <span>
                  {formatDate(notification.created_at)}
                </span>
              </div>

              <div className="notification-actions">
                <span
                  className={`notification-badge ${
                    notification.is_read ? "read-badge" : "unread-badge"
                  }`}
                >
                  {notification.is_read ? "Read" : "Unread"}
                </span>
                {!notification.is_read && (
                    <button
                    className="mark-read-button"
                    onClick={() => handleMarkAsRead(notification.id)}
                    > 
                      Mark as Read
                    </button>
                )}
              </div>
              
            </div>
          ))
        )}
      </div>

      <p className="notification-refresh-note">
        Notifications automatically refresh every 5 seconds.
      </p>
    </div>
  );
}

export default WaiterNotifications;
