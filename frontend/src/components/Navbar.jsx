import "./Navbar.css";
import { Menu, Bell, Search } from "lucide-react";

function Navbar({ title, onMenuClick }) {
  return (
    <header className="top-navbar">

      <div className="navbar-left">
        <button className="mobile-menu" onClick={onMenuClick}>
          <Menu size={22} />
        </button>

        <div>
          <h2>{title}</h2>
          <p>Manage your restaurant operations</p>
        </div>
      </div>

      <div className="navbar-right">
        <div className="navbar-search">
          <Search size={17} />
          <span>Smart Kitchen System</span>
        </div>

        <button className="navbar-notification" aria-label="Notifications">
          <Bell size={19} />
        </button>

        <div className="profile-avatar">UK</div>
      </div>

    </header>
  );
}

export default Navbar;
