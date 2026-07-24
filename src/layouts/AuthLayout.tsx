import { Outlet } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';

export function AuthLayout() {
  return (
    <div className="auth-shell">
      <div className="auth-panel auth-brand-panel">
        <div>
          <span className="brand-chip">RollSync</span>
          <h1>Factory stock flow, user login, and dashboard access in one clean system.</h1>
          <p>
            Start with authentication first, then expand safely into materials, stores, stock entries,
            and role-based tools.
          </p>
        </div>

        <div className="auth-brand-footer">
          <ThemeToggle />
        </div>
      </div>

      <div className="auth-panel auth-form-panel">
        <div className="auth-form-wrap">
          <Outlet />
        </div>
      </div>
    </div>
  );
}