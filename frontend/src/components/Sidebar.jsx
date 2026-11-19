
import {
  LayoutDashboard,
  ShoppingBag,
  Activity,
  ArrowUpWideNarrow,
  ChefHat,
  ListOrdered,
  Bell,
  Utensils,
  PanelLeftClose
} from "lucide-react";

import "./Sidebar.css";

const menuItems = [
  { label: "Overview", path: "/", icon: LayoutDashboard },
  { label: "Customer Ordering", path: "/ordering", icon: ShoppingBag },
  { label: "Live Tracking", path: "/tracking", icon: Activity },
  { label: "Order Priority", path: "/priority", icon: ArrowUpWideNarrow },
  { label: "Cooking Status", path: "/cooking", icon: ChefHat },
  { label: "Queue Management", path: "/queue", icon: ListOrdered },
  { label: "Waiter Notifications", path: "/notifications", icon: Bell }
];

function Sidebar({ activePage, onNavigate, open, onClose }) {
  return (
    <>
      {open && (
        <div className="sidebar-backdrop" onClick={onClose}></div>
      )}

      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>

        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <Utensils size={23} />
          </div>

          <div>
            <h2>LUX Smart Kitchen</h2>
            <span>MANAGEMENT SYSTEM</span>
          </div>

          <button className="sidebar-close" onClick={onClose}>
            <PanelLeftClose size={20} />
          </button>
        </div>

        <div className="sidebar-label">MAIN MENU</div>

        <nav className="sidebar-nav">
          {menuItems.map(item => {
            const Icon = item.icon;

            return (
              <button
                key={item.path}
                className={
                  activePage === item.path
                    ? "sidebar-link active"
                    : "sidebar-link"
                }
                onClick={() => {
                  onNavigate(item.path);
                  onClose();
                }}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-status"></div>
          <div>
            <strong>System Online</strong>
            <span>Kitchen operations active</span>
          </div>
        </div>

      </aside>
    </>
  );
}

export default Sidebar;
