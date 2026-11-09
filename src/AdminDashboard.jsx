
import { useEffect, useMemo, useState } from 'react';
import { supabase } from './lib/supabase';

import {
  ShieldCheck,
  LogOut,
  RefreshCw,
  Search,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  X,
  LayoutDashboard,
  ClipboardList,
  ChevronRight,
  Menu,
  CalendarDays,
  Eye,
  Activity,
  ArrowUpRight,
  Filter,
  Leaf,
  ExternalLink
} from 'lucide-react';

import './admindashboard.css';

const statuses = [
  'pending',
  'under_review',
  'verified',
  'in_progress',
  'resolved',
  'rejected'
];

const statusLabels = {
  pending: 'Pending',
  under_review: 'Under review',
  verified: 'Verified',
  in_progress: 'In progress',
  resolved: 'Resolved',
  rejected: 'Rejected'
};

const categories = [
  'Illegal dumping',
  'Air pollution',
  'Water pollution',
  'Overflowing bins',
  'Environmental damage',
  'Other'
];

function formatDate(date) {
  if (!date) return 'Date unavailable';

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return 'Date unavailable';
  }

  return parsed.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function formatDateTime(date) {
  if (!date) return 'Date unavailable';

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return 'Date unavailable';
  }

  return parsed.toLocaleString();
}

export default function AdminDashboard({ onBack }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [checking, setChecking] = useState(true);
  const [accessError, setAccessError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [selectedReport, setSelectedReport] = useState(null);
  const [notes, setNotes] = useState({});
  const [updatingId, setUpdatingId] = useState(null);
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    if (!supabase) {
      setAccessError('Database connection is unavailable.');
      setChecking(false);
      return;
    }

    const { data, error } = await supabase.auth.getSession();

    if (error) {
      setAccessError(error.message);
      setChecking(false);
      return;
    }

    if (data.session?.user) {
      await checkProfile(data.session.user);
    }

    setChecking(false);
  }

  async function checkProfile(authUser) {
    setUser(authUser);
    setAccessError('');

    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authUser.id)
      .maybeSingle();

    if (error) {
      setAccessError(error.message);
      setProfile(null);
      return;
    }

    if (!data || !['admin', 'moderator'].includes(data.role)) {
      setAccessError('Your account does not have moderator access.');
      setProfile(null);
      return;
    }

    setProfile(data);
    await loadReports();
  }

  async function login(e) {
    e.preventDefault();

    if (!supabase) {
      setLoginError('Database connection is unavailable.');
      return;
    }

    setLoginLoading(true);
    setLoginError('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setLoginError(error.message);
    } else if (data.user) {
      await checkProfile(data.user);
      setPassword('');
    }

    setLoginLoading(false);
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      setAccessError(error.message);
      return;
    }

    setUser(null);
    setProfile(null);
    setReports([]);
    setSelectedReport(null);
    setAccessError('');
    setActiveSection('overview');
  }

  async function loadReports() {
    if (!supabase) return;

    setLoading(true);
    setError('');

    const { data, error } = await supabase
      .from('environmental_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setReports(data || []);
    }

    setLoading(false);
  }

  async function updateReport(report, newStatus) {
    setUpdatingId(report.id);
    setActionMessage('');
    setActionError(false);

    const moderatorNote =
      notes[report.id] ?? report.moderator_note ?? null;

    const { data, error } = await supabase
      .from('environmental_reports')
      .update({
        status: newStatus,
        moderator_note: moderatorNote
      })
      .eq('id', report.id)
      .select()
      .single();

    if (error) {
      setActionMessage(error.message);
      setActionError(true);
    } else {
      setReports(previous =>
        previous.map(item =>
          item.id === report.id ? data : item
        )
      );

      setSelectedReport(data);
      setActionMessage('Report updated successfully.');
    }

    setUpdatingId(null);
  }

  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchesStatus =
        filterStatus === 'all' || report.status === filterStatus;

      const matchesCategory =
        filterCategory === 'all' ||
        report.category === filterCategory;

      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        `${report.category || ''} ${report.description || ''} ${report.address || ''}`
          .toLowerCase()
          .includes(searchText);

      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [reports, filterStatus, filterCategory, search]);

  const count = status =>
    reports.filter(report => report.status === status).length;

  const todayReports = reports.filter(report => {
    if (!report.created_at) return false;

    const date = new Date(report.created_at);
    const today = new Date();

    return date.toDateString() === today.toDateString();
  }).length;

  const pendingReports = reports
    .filter(report =>
      ['pending', 'under_review'].includes(report.status)
    )
    .slice(0, 5);

  const recentReports = reports.slice(0, 5);

  function navigate(section) {
    setActiveSection(section);
    setSidebarOpen(false);
  }

  function openReport(report) {
    setSelectedReport(report);
    setActionMessage('');
    setActionError(false);
  }

  if (checking) {
    return (
      <div className="admin-loading">
        <RefreshCw className="admin-spin" size={28} />
        <p>Verifying secure administrator access...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-card">
          <div className="admin-login-brand">
            <div className="admin-logo">
              <ShieldCheck size={30} />
            </div>

            <span>ECOGUARD</span>
          </div>

          <span className="admin-eyebrow">
            SECURE CONTROL CENTER
          </span>

          <h1>Welcome back.</h1>

          <p>
            Sign in to access the environmental monitoring
            administration panel.
          </p>

          {accessError && (
            <div className="admin-error">
              <AlertTriangle size={17} />
              {accessError}
            </div>
          )}

          <form onSubmit={login}>
            <label>
              Email address

              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@example.com"
              />
            </label>

            <label>
              Password

              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </label>

            {loginError && (
              <div className="admin-error">
                <AlertTriangle size={17} />
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="admin-primary"
              disabled={loginLoading}
            >
              {loginLoading ? 'Signing in...' : 'Access dashboard'}
              {!loginLoading && <ChevronRight size={18} />}
            </button>
          </form>

          <div className="admin-login-footer">
            <ShieldCheck size={15} />
            Protected by Supabase Authentication
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">

      {/* MOBILE OVERLAY */}

      {sidebarOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}

      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-brand">
          <div className="admin-logo">
            <ShieldCheck size={26} />
          </div>

          <div>
            <strong>ECOGUARD</strong>
            <span>ENVIRONMENTAL INTELLIGENCE</span>
          </div>
        </div>

        <div className="admin-sidebar-label">
          WORKSPACE
        </div>

        <nav className="admin-navigation">
          <button
            className={activeSection === 'overview' ? 'active' : ''}
            onClick={() => navigate('overview')}
          >
            <LayoutDashboard size={19} />
            <span>Overview</span>
          </button>

          <button
            className={activeSection === 'reports' ? 'active' : ''}
            onClick={() => navigate('reports')}
          >
            <ClipboardList size={19} />
            <span>Environmental reports</span>

            {count('pending') > 0 && (
              <span className="admin-nav-count">
                {count('pending')}
              </span>
            )}
          </button>
        </nav>

        <div className="admin-sidebar-bottom">
          <div className="admin-sidebar-info">
            <div className="admin-sidebar-info-icon">
              <Leaf size={20} />
            </div>

            <strong>Protecting our environment</strong>

            <p>
              Every verified report contributes to a cleaner
              and safer community.
            </p>
          </div>

          <div className="admin-sidebar-account">
            <div className="admin-avatar">
              <ShieldCheck size={18} />
            </div>

            <div>
              <strong>{profile.role}</strong>
              <span>Authorized account</span>
            </div>

            <button
              onClick={logout}
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}

      <div className="admin-content">

        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              className="admin-menu-button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={21} />
            </button>

            <div className="admin-breadcrumb">
              <span>Workspace</span>
              <ChevronRight size={14} />
              <strong>
                {activeSection === 'overview'
                  ? 'Overview'
                  : 'Environmental reports'}
              </strong>
            </div>
          </div>

          <div className="admin-topbar-right">
            <div className="admin-secure-indicator">
              <span />
              System active
            </div>

            <div className="admin-user-badge">
              <div className="admin-avatar">
                <ShieldCheck size={17} />
              </div>

              <span>{profile.role}</span>
            </div>

            <button
              className="admin-topbar-logout"
              onClick={logout}
              title="Sign out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <main className="admin-main">

          {/* OVERVIEW */}

          {activeSection === 'overview' && (
            <>
              <section className="admin-page-heading">
                <div>
                  <span className="admin-eyebrow">
                    ENVIRONMENTAL INTELLIGENCE
                  </span>

                  <h1>Dashboard overview</h1>

                  <p>
                    Monitor community reports and track environmental
                    activity across the platform.
                  </p>
                </div>

                <button
                  className="admin-refresh"
                  onClick={loadReports}
                  disabled={loading}
                >
                  <RefreshCw
                    size={17}
                    className={loading ? 'admin-spin' : ''}
                  />
                  Refresh data
                </button>
              </section>

              {error && (
                <div className="admin-error">
                  <AlertTriangle size={17} />
                  {error}
                </div>
              )}

              <section className="admin-stat-grid">

                <div className="admin-stat-card">
                  <div className="admin-stat-top">
                    <span>Total reports</span>
                    <div className="admin-stat-icon green">
                      <FileText size={20} />
                    </div>
                  </div>

                  <strong>{reports.length}</strong>

                  <span className="admin-stat-caption">
                    All community submissions
                  </span>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-top">
                    <span>Pending review</span>
                    <div className="admin-stat-icon amber">
                      <Clock size={20} />
                    </div>
                  </div>

                  <strong>{count('pending')}</strong>

                  <span className="admin-stat-caption">
                    Awaiting moderator review
                  </span>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-top">
                    <span>Verified</span>
                    <div className="admin-stat-icon blue">
                      <ShieldCheck size={20} />
                    </div>
                  </div>

                  <strong>{count('verified')}</strong>

                  <span className="admin-stat-caption">
                    Confirmed environmental reports
                  </span>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-top">
                    <span>Resolved</span>
                    <div className="admin-stat-icon teal">
                      <CheckCircle2 size={20} />
                    </div>
                  </div>

                  <strong>{count('resolved')}</strong>

                  <span className="admin-stat-caption">
                    Successfully resolved reports
                  </span>
                </div>

              </section>

              <section className="admin-secondary-stats">
                <div>
                  <div className="admin-secondary-stat-icon">
                    <Activity size={19} />
                  </div>

                  <div>
                    <span>Reports submitted today</span>
                    <strong>{todayReports}</strong>
                  </div>
                </div>

                <div>
                  <div className="admin-secondary-stat-icon">
                    <ClipboardList size={19} />
                  </div>

                  <div>
                    <span>Under review</span>
                    <strong>{count('under_review')}</strong>
                  </div>
                </div>

                <div>
                  <div className="admin-secondary-stat-icon">
                    <AlertTriangle size={19} />
                  </div>

                  <div>
                    <span>In progress</span>
                    <strong>{count('in_progress')}</strong>
                  </div>
                </div>
              </section>

              <section className="admin-overview-grid">

                <div className="admin-panel admin-priority-panel">
                  <div className="admin-panel-heading">
                    <div>
                      <span className="admin-eyebrow">
                        ATTENTION REQUIRED
                      </span>

                      <h2>Reports requiring attention</h2>

                      <p>
                        Recent submissions awaiting review.
                      </p>
                    </div>

                    <button
                      className="admin-text-button"
                      onClick={() => navigate('reports')}
                    >
                      View all <ArrowUpRight size={16} />
                    </button>
                  </div>

                  {loading ? (
                    <div className="admin-empty">
                      <RefreshCw className="admin-spin" />
                      Loading reports...
                    </div>
                  ) : pendingReports.length === 0 ? (
                    <div className="admin-empty">
                      <CheckCircle2 size={30} />
                      <h3>All caught up</h3>
                      <p>
                        There are no reports waiting for review.
                      </p>
                    </div>
                  ) : (
                    <div className="admin-priority-list">
                      {pendingReports.map(report => (
                        <div
                          className="admin-priority-item"
                          key={report.id}
                        >
                          <div className="admin-priority-icon">
                            <FileText size={19} />
                          </div>

                          <div className="admin-priority-info">
                            <strong>{report.category}</strong>

                            <span>
                              {report.address || 'Location not provided'}
                            </span>

                            <small>
                              {formatDate(report.created_at)}
                            </small>
                          </div>

                          <span className={`admin-status ${report.status}`}>
                            {statusLabels[report.status] || report.status}
                          </span>

                          <button
                            onClick={() => openReport(report)}
                            aria-label="View report"
                            title="View report"
                          >
                            <ChevronRight size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="admin-panel admin-status-panel">
                  <div className="admin-panel-heading">
                    <div>
                      <span className="admin-eyebrow">
                        REPORT BREAKDOWN
                      </span>

                      <h2>Status overview</h2>

                      <p>Current report distribution.</p>
                    </div>
                  </div>

                  <div className="admin-status-breakdown">
                    {statuses.map(status => {
                      const percentage = reports.length
                        ? (count(status) / reports.length) * 100
                        : 0;

                      return (
                        <div
                          className="admin-breakdown-item"
                          key={status}
                        >
                          <div className="admin-breakdown-heading">
                            <span>
                              <i className={`admin-dot ${status}`} />
                              {statusLabels[status]}
                            </span>

                            <strong>{count(status)}</strong>
                          </div>

                          <div className="admin-progress-track">
                            <div
                              className={`admin-progress-fill ${status}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    className="admin-full-button"
                    onClick={() => navigate('reports')}
                  >
                    Manage all reports
                    <ChevronRight size={17} />
                  </button>
                </div>

              </section>

              <section className="admin-panel admin-recent-panel">
                <div className="admin-panel-heading">
                  <div>
                    <span className="admin-eyebrow">
                      LATEST ACTIVITY
                    </span>

                    <h2>Recent submissions</h2>

                    <p>
                      The latest reports submitted by the community.
                    </p>
                  </div>

                  <button
                    className="admin-text-button"
                    onClick={() => navigate('reports')}
                  >
                    All reports <ArrowUpRight size={16} />
                  </button>
                </div>

                {loading ? (
                  <div className="admin-empty">
                    Loading submissions...
                  </div>
                ) : recentReports.length === 0 ? (
                  <div className="admin-empty">
                    <FileText size={30} />
                    <h3>No submissions yet</h3>
                    <p>Community reports will appear here.</p>
                  </div>
                ) : (
                  <div className="admin-table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Report</th>
                          <th>Location</th>
                          <th>Date submitted</th>
                          <th>Status</th>
                          <th />
                        </tr>
                      </thead>

                      <tbody>
                        {recentReports.map(report => (
                          <tr key={report.id}>
                            <td>
                              <strong>{report.category}</strong>
                              <small>
                                {report.description?.slice(0, 65) || 'No description'}
                                {report.description?.length > 65 ? '...' : ''}
                              </small>
                            </td>

                            <td>
                              <span className="admin-table-location">
                                <MapPin size={14} />
                                {report.address || 'Not provided'}
                              </span>
                            </td>

                            <td>{formatDate(report.created_at)}</td>

                            <td>
                              <span className={`admin-status ${report.status}`}>
                                {statusLabels[report.status] || report.status}
                              </span>
                            </td>

                            <td>
                              <button
                                className="admin-view-button"
                                onClick={() => openReport(report)}
                              >
                                <Eye size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}

          {/* REPORT MANAGEMENT */}

          {activeSection === 'reports' && (
            <>
              <section className="admin-page-heading">
                <div>
                  <span className="admin-eyebrow">
                    COMMUNITY MANAGEMENT
                  </span>

                  <h1>Environmental reports</h1>

                  <p>
                    Review submissions, verify environmental issues
                    and update report progress.
                  </p>
                </div>

                <button
                  className="admin-refresh"
                  onClick={loadReports}
                  disabled={loading}
                >
                  <RefreshCw
                    size={17}
                    className={loading ? 'admin-spin' : ''}
                  />
                  Refresh
                </button>
              </section>

              <section className="admin-report-summary">
                <div>
                  <strong>{reports.length}</strong>
                  <span>Total submissions</span>
                </div>

                <div>
                  <strong>{count('pending')}</strong>
                  <span>Pending</span>
                </div>

                <div>
                  <strong>{count('in_progress')}</strong>
                  <span>In progress</span>
                </div>

                <div>
                  <strong>{count('resolved')}</strong>
                  <span>Resolved</span>
                </div>
              </section>

              <section className="admin-panel admin-management-panel">
                <div className="admin-panel-heading">
                  <div>
                    <h2>All submissions</h2>
                    <p>
                      {filteredReports.length} reports found
                    </p>
                  </div>
                </div>

                <div className="admin-filters">
                  <div className="admin-search">
                    <Search size={18} />

                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search reports, descriptions or locations..."
                    />

                    {search && (
                      <button
                        onClick={() => setSearch('')}
                        aria-label="Clear search"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  <div className="admin-filter-select">
                    <Filter size={16} />

                    <select
                      value={filterStatus}
                      onChange={e => setFilterStatus(e.target.value)}
                    >
                      <option value="all">All statuses</option>

                      {statuses.map(status => (
                        <option key={status} value={status}>
                          {statusLabels[status]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-filter-select">
                    <ClipboardList size={16} />

                    <select
                      value={filterCategory}
                      onChange={e => setFilterCategory(e.target.value)}
                    >
                      <option value="all">All categories</option>

                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {error && (
                  <div className="admin-error">
                    <AlertTriangle size={17} />
                    {error}
                  </div>
                )}

                {loading ? (
                  <div className="admin-empty">
                    <RefreshCw className="admin-spin" size={25} />
                    <p>Loading environmental reports...</p>
                  </div>
                ) : filteredReports.length === 0 ? (
                  <div className="admin-empty">
                    <FileText size={34} />
                    <h3>No reports found</h3>
                    <p>
                      Try changing your filters or search terms.
                    </p>
                  </div>
                ) : (
                  <div className="admin-report-grid">
                    {filteredReports.map(report => (
                      <article
                        className="admin-report-card"
                        key={report.id}
                      >
                        <div className="admin-report-card-top">
                          <span className={`admin-status ${report.status}`}>
                            {statusLabels[report.status] || report.status}
                          </span>

                          <small>
                            <CalendarDays size={13} />
                            {formatDate(report.created_at)}
                          </small>
                        </div>

                        <h3>{report.category}</h3>

                        <p className="admin-report-description">
                          {report.description || 'No description provided.'}
                        </p>

                        <div className="admin-report-location">
                          <MapPin size={15} />
                          <span>
                            {report.address || 'Location not provided'}
                          </span>
                        </div>

                        <div className="admin-report-card-footer">
                          <span>
                            {report.photo_url ? (
                              <>
                                <Eye size={15} />
                                Evidence attached
                              </>
                            ) : (
                              'No evidence photo'
                            )}
                          </span>

                          <button
                            onClick={() => openReport(report)}
                          >
                            Review report
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}

          <footer className="admin-footer">
            <span>
              <ShieldCheck size={15} />
              ECOGUARD Administration
            </span>

            <span>
              Environmental monitoring and community protection
            </span>
          </footer>

        </main>
      </div>

      {/* REPORT DETAILS MODAL */}

      {selectedReport && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setSelectedReport(null)}
        >
          <div
            className="admin-modal"
            onClick={e => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div>
                <span className="admin-eyebrow">
                  REPORT REVIEW
                </span>

                <h2>{selectedReport.category}</h2>

                <span className="admin-modal-date">
                  Submitted {formatDateTime(selectedReport.created_at)}
                </span>
              </div>

              <button
                onClick={() => setSelectedReport(null)}
                aria-label="Close report"
              >
                <X size={22} />
              </button>
            </div>

            <div className="admin-modal-content">

              <div className="admin-modal-status-row">
                <span className={`admin-status ${selectedReport.status}`}>
                  {statusLabels[selectedReport.status] || selectedReport.status}
                </span>
              </div>

              <div className="admin-detail-block">
                <h3>Description</h3>
                <p>
                  {selectedReport.description || 'No description provided.'}
                </p>
              </div>

              <div className="admin-detail-block">
                <h3>Location</h3>

                <p>
                  <MapPin size={16} />
                  {selectedReport.address || 'No address provided.'}
                </p>

                {selectedReport.lat != null &&
                  selectedReport.long != null && (
                    <a
                      className="admin-map-link"
                      href={`https://www.openstreetmap.org/?mlat=${selectedReport.lat}&mlon=${selectedReport.long}#map=16/${selectedReport.lat}/${selectedReport.long}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open report location
                      <ExternalLink size={15} />
                    </a>
                  )}
              </div>

              {selectedReport.photo_url && (
                <div className="admin-detail-block">
                  <h3>Evidence photograph</h3>

                  <a
                    href={selectedReport.photo_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      className="admin-evidence"
                      src={selectedReport.photo_url}
                      alt="Environmental report evidence"
                    />
                  </a>
                </div>
              )}

              <div className="admin-detail-block">
                <h3>Moderator notes</h3>

                <p className="admin-note-description">
                  Record findings, verification details or the reason
                  for rejecting a submission.
                </p>

                <textarea
                  value={
                    notes[selectedReport.id] ??
                    selectedReport.moderator_note ??
                    ''
                  }
                  onChange={e =>
                    setNotes(previous => ({
                      ...previous,
                      [selectedReport.id]: e.target.value
                    }))
                  }
                  placeholder="Write your moderation notes here..."
                />
              </div>

              {actionMessage && (
                <div className={
                  actionError
                    ? 'admin-error'
                    : 'admin-action-message'
                }>
                  {actionError
                    ? <AlertTriangle size={17} />
                    : <CheckCircle2 size={17} />}
                  {actionMessage}
                </div>
              )}

              <div className="admin-detail-block">
                <h3>Update report status</h3>

                <p className="admin-note-description">
                  Select the appropriate status for this report.
                </p>

                <div className="admin-status-buttons">
                  {statuses.map(status => (
                    <button
                      key={status}
                      className={
                        selectedReport.status === status
                          ? 'active'
                          : ''
                      }
                      disabled={updatingId === selectedReport.id}
                      onClick={() =>
                        updateReport(selectedReport, status)
                      }
                    >
                      {statusLabels[status]}
                    </button>
                  ))}
                </div>
              </div>

              <button
                className="admin-primary admin-save-note"
                disabled={updatingId === selectedReport.id}
                onClick={() =>
                  updateReport(
                    selectedReport,
                    selectedReport.status
                  )
                }
              >
                {updatingId === selectedReport.id
                  ? 'Saving changes...'
                  : 'Save moderator notes'}
              </button>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
