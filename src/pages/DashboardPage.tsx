import { useAuth } from '../contexts/AuthContext';

export function DashboardPage() {
  return (
    <section className="dashboard-page">
      <div className="dashboard-hero dashboard-hero-single">
        <div>
          <span className="eyebrow">Dashboard overview</span>
          <h1>RollSync is live.</h1>
          <p>
            Login and signup are working, routing is protected, and the layout already supports
            mobile screens plus dark and light theme switching.
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <article className="stat-card">
          <span>Auth</span>
          <strong>Ready</strong>
          <p>Email/password flow connected to Supabase.</p>
        </article>

        <article className="stat-card">
          <span>Theme</span>
          <strong>Ready</strong>
          <p>Dark and light mode toggle available now.</p>
        </article>

        <article className="stat-card">
          <span>Responsive</span>
          <strong>Ready</strong>
          <p>Sidebar layout is adapted for mobile widths.</p>
        </article>
      </div>
    </section>
  );
}