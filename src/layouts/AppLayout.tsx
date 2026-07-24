import {
  CircleUserRound,
  Home,
  LogOut,
  Mail,
  Menu,
  Package2,
  Settings,
  TriangleAlert,
  User,
  Warehouse,
  X,
} from 'lucide-react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ThemeToggle } from '../components/ThemeToggle';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

  const user = session?.user;
  const email = user?.email ?? 'No email';
  const fullName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.user_metadata?.username ||
    'RollSync User';

const initials = fullName
  .split(' ')
  .filter(Boolean)
  .slice(0, 2)
  .map((part: string) => part[0]?.toUpperCase())
  .join('');
  useEffect(() => {
    setSidebarOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 720) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    if (profileOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [profileOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  const pageTitle = useMemo(() => {
    if (location.pathname.startsWith('/low-stock')) return 'Low Stock';
    if (location.pathname.startsWith('/settings')) return 'Settings';
    if (location.pathname.startsWith('/dashboard')) return 'Dashboard';
    return 'RollSync';
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-top">
          <div className="sidebar-mobile-head">
            <div className="logo-block">
              <div className="logo-mark" aria-hidden="true">
                <Warehouse size={22} strokeWidth={2.2} />
              </div>
              <div>
                <h2>RollSync</h2>
                <p>Factory Control</p>
              </div>
            </div>

            <button
              className="icon-button sidebar-close-button"
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          </div>

          <div className="logo-block desktop-logo">
            <div className="logo-mark" aria-hidden="true">
              <Warehouse size={22} strokeWidth={2.2} />
            </div>
            <div>
              <h2>RollSync</h2>
              <p>Factory Control</p>
            </div>
          </div>

          <nav className="sidebar-nav">
            <NavLink
              to="/dashboard"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              <Home size={18} />
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/low-stock"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              <TriangleAlert size={18} />
              <span>Low Stock</span>
            </NavLink>

            <button className="nav-link nav-link-muted" type="button">
              <Package2 size={18} />
              <span>Stores</span>
            </button>

            <NavLink
              to="/settings"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              <Settings size={18} />
              <span>Settings</span>
            </NavLink>
          </nav>
        </div>

        <div className="sidebar-bottom">
          <button className="logout-button" onClick={handleLogout} type="button">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {sidebarOpen ? (
        <button
          className="sidebar-backdrop"
          type="button"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar backdrop"
        />
      ) : null}

      <main className="content-area">
        <div className="mobile-topbar">
  <button
    className="icon-button"
    type="button"
    onClick={() => setSidebarOpen(true)}
    aria-label="Open sidebar"
  >
    <Menu size={20} />
  </button>

  <div className="mobile-topbar-brand">
    <strong>RollSync</strong>
    <span>{pageTitle}</span>
  </div>

  <div className="mobile-topbar-actions" ref={profileRef}>
    <ThemeToggle />

    <button
      type="button"
      className="profile-trigger"
      aria-label="Open profile menu"
      aria-expanded={profileOpen}
      onClick={() => setProfileOpen((prev) => !prev)}
    >
      <CircleUserRound size={20} />
    </button>

    {profileOpen ? (
      <div className="profile-popover mobile-profile-popover">
        <div className="profile-popover-head">
          <div className="profile-avatar">
            {initials || <CircleUserRound size={22} />}
          </div>

          <div className="profile-copy">
            <strong>{fullName}</strong>
            <span>{pageTitle}</span>
          </div>
        </div>

        <div className="profile-info-list">
          <div className="profile-info-row">
            <div className="profile-info-label">
              <User size={16} />
              <span>Name</span>
            </div>
            <strong>{fullName}</strong>
          </div>

          <div className="profile-info-row">
            <div className="profile-info-label">
              <Mail size={16} />
              <span>Email</span>
            </div>
            <strong className="profile-email">{email}</strong>
          </div>
        </div>

        <button className="logout-button profile-logout" onClick={handleLogout} type="button">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    ) : null}
  </div>
</div>
<div className="dashboard-top-actions desktop-top-actions" ref={profileRef}>
  <ThemeToggle />

  <button
    type="button"
    className="profile-trigger"
    aria-label="Open profile menu"
    aria-expanded={profileOpen}
    onClick={() => setProfileOpen((prev) => !prev)}
  >
    <CircleUserRound size={20} />
  </button>

  {profileOpen ? (
    <div className="profile-popover">
      <div className="profile-popover-head">
        <div className="profile-avatar">
          {initials || <CircleUserRound size={22} />}
        </div>

        <div className="profile-copy">
          <strong>{fullName}</strong>
          <span>{pageTitle}</span>
        </div>
      </div>

      <div className="profile-info-list">
        <div className="profile-info-row">
          <div className="profile-info-label">
            <User size={16} />
            <span>Name</span>
          </div>
          <strong>{fullName}</strong>
        </div>

        <div className="profile-info-row">
          <div className="profile-info-label">
            <Mail size={16} />
            <span>Email</span>
          </div>
          <strong className="profile-email">{email}</strong>
        </div>
      </div>

      <button className="logout-button profile-logout" onClick={handleLogout} type="button">
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    </div>
  ) : null}
</div>
        <Outlet />
      </main>
    </div>
  );
}