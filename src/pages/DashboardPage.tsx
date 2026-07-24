import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const monthlyOrders = [
  { name: 'Jan', orders: 82, production: 74 },
  { name: 'Feb', orders: 96, production: 88 },
  { name: 'Mar', orders: 104, production: 97 },
  { name: 'Apr', orders: 118, production: 110 },
  { name: 'May', orders: 128, production: 119 },
  { name: 'Jun', orders: 136, production: 131 },
];

const stockByType = [
  { name: 'Tissue', value: 34 },
  { name: 'Napkin', value: 26 },
  { name: 'Jumbo', value: 18 },
  { name: 'Kitchen', value: 22 },
];

const approvalFlow = [
  { stage: 'Pending', count: 18 },
  { stage: 'Approved', count: 29 },
  { stage: 'Scheduled', count: 21 },
  { stage: 'Produced', count: 16 },
];

const recentActivity = [
  { id: '260724_01', item: 'Rose Tissue 250g', status: 'Manager Approved', user: 'Nethmi', time: '10 min ago' },
  { id: '260724_02', item: 'Blue Napkin Pack', status: 'Pending Review', user: 'Kasun', time: '18 min ago' },
  { id: '260724_03', item: 'Kitchen Roll Maxi', status: 'Factory Scheduling', user: 'Ayesha', time: '32 min ago' },
  { id: '260724_04', item: 'Jumbo Roll White', status: 'Production Ready', user: 'Rashmi', time: '1 hour ago' },
  { id: '260724_05', item: 'Soft Tissue Mini', status: 'Low Stock', user: 'Dilan', time: '1 hour ago' },
];

const lowStockTable = [
  { id: '260724_11', name: 'Rose Tissue 250g', type: 'Tissue', pcs: '24', stock: '120', order: '400', priority: 'High', addedBy: 'Nethmi' },
  { id: '260724_12', name: 'Blue Napkin Pack', type: 'Napkin', pcs: '48', stock: '90', order: '280', priority: 'Normal', addedBy: 'Kasun' },
  { id: '260724_13', name: 'Kitchen Roll Maxi', type: 'Kitchen', pcs: '12', stock: '60', order: '150', priority: 'High', addedBy: 'Ayesha' },
  { id: '260724_14', name: 'Jumbo Roll White', type: 'Jumbo', pcs: '6', stock: '22', order: '80', priority: 'Normal', addedBy: 'Rashmi' },
  { id: '260724_15', name: 'Soft Tissue Mini', type: 'Tissue', pcs: '36', stock: '74', order: '220', priority: 'High', addedBy: 'Dilan' },
];

const donutColors = ['#9ce64e', '#79bf34', '#4f8f1f', '#c6f18d'];

export function DashboardPage() {
  return (
    <section className="dashboard-page">
      <div className="dashboard-hero">
        <div>
          <span className="eyebrow">Dashboard overview</span>
          <h1>RollSync control center.</h1>
          <p>
            This is a dummy dashboard preview with sample KPIs, charts, workflow activity,
            and a stock table so the final layout can be reviewed before real data is connected.
          </p>
        </div>

        <div className="hero-card">
          <span>Today&apos;s sync status</span>
          <strong>Operational</strong>
          <p>Orders, approvals, and production stages are shown here as preview data only.</p>
        </div>
      </div>

      <div className="stats-grid dashboard-kpi-grid">
        <article className="stat-card">
          <span>Total Orders</span>
          <strong>136</strong>
          <p>Orders logged in the current month preview.</p>
        </article>

        <article className="stat-card">
          <span>Manager Approved</span>
          <strong>29</strong>
          <p>Items currently approved in the sample workflow.</p>
        </article>

        <article className="stat-card">
          <span>Low Stock Alerts</span>
          <strong>18</strong>
          <p>Items still waiting for ordering or review.</p>
        </article>

        <article className="stat-card">
          <span>Factory Scheduled</span>
          <strong>21</strong>
          <p>Approved items assigned for scheduling.</p>
        </article>
      </div>

      <div className="dashboard-chart-grid">
        <article className="dashboard-panel chart-panel chart-panel-wide">
          <div className="panel-head">
            <div>
              <span className="panel-kicker">Orders vs production</span>
              <h3>Monthly trend</h3>
            </div>
          </div>

          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyOrders}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--muted)" />
                <YAxis stroke="var(--muted)" />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#9ce64e"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="production"
                  stroke="#79bf34"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="dashboard-panel chart-panel">
          <div className="panel-head">
            <div>
              <span className="panel-kicker">Current stock mix</span>
              <h3>By product type</h3>
            </div>
          </div>

          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip />
                <Pie
                  data={stockByType}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={92}
                  paddingAngle={3}
                >
                  {stockByType.map((entry, index) => (
                    <Cell key={entry.name} fill={donutColors[index % donutColors.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="dashboard-panel chart-panel">
          <div className="panel-head">
            <div>
              <span className="panel-kicker">Workflow status</span>
              <h3>Approval pipeline</h3>
            </div>
          </div>

          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={approvalFlow}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="stage" stroke="var(--muted)" />
                <YAxis stroke="var(--muted)" />
                <Tooltip />
                <Bar dataKey="count" fill="#9ce64e" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>

      <div className="dashboard-bottom-grid">
        <article className="dashboard-panel">
          <div className="panel-head">
            <div>
              <span className="panel-kicker">Recent activity</span>
              <h3>Workflow updates</h3>
            </div>
          </div>

          <div className="activity-list" role="list">
            {recentActivity.map((entry) => (
              <div key={entry.id} className="activity-row" role="listitem">
                <div className="activity-dot" />
                <div className="activity-copy">
                  <strong>{entry.item}</strong>
                  <span>
                    {entry.id} • {entry.status}
                  </span>
                </div>
                <div className="activity-meta">
                  <strong>{entry.user}</strong>
                  <span>{entry.time}</span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="dashboard-panel">
          <div className="panel-head">
            <div>
              <span className="panel-kicker">Quick summary</span>
              <h3>Today</h3>
            </div>
          </div>

          <div className="summary-stack">
            <div className="summary-item">
              <span>Pending manager review</span>
              <strong>18 items</strong>
            </div>
            <div className="summary-item">
              <span>High priority items</span>
              <strong>7 items</strong>
            </div>
            <div className="summary-item">
              <span>Production completion</span>
              <strong>84%</strong>
            </div>
            <div className="summary-item">
              <span>Average lead time</span>
              <strong>2.4 days</strong>
            </div>
          </div>
        </article>
      </div>

      <article className="dashboard-panel">
        <div className="panel-head">
          <div>
            <span className="panel-kicker">Low stock table</span>
            <h3>Preview data</h3>
          </div>
        </div>

        <div className="dashboard-table-wrap">
          <table className="dashboard-table">
            <caption className="sr-only">Low stock preview items</caption>
            <thead>
              <tr>
                <th scope="col">#ID</th>
                <th scope="col">Name</th>
                <th scope="col">Type</th>
                <th scope="col">PCS</th>
                <th scope="col">Stock</th>
                <th scope="col">Order</th>
                <th scope="col">Priority</th>
                <th scope="col">Added By</th>
              </tr>
            </thead>
            <tbody>
              {lowStockTable.map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>{row.name}</td>
                  <td>{row.type}</td>
                  <td>{row.pcs}</td>
                  <td>{row.stock}</td>
                  <td>{row.order}</td>
                  <td>
                    <span
                      className={
                        row.priority === 'High'
                          ? 'priority-badge'
                          : 'priority-badge priority-badge-approved'
                      }
                    >
                      {row.priority}
                    </span>
                  </td>
                  <td>{row.addedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}