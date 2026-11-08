
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import {
  ArrowLeft,
  ShieldCheck,
  LogOut,
  RefreshCw,
  Search,
  MapPin,
  Image,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  X
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

  const [selectedReport, setSelectedReport] = useState(null);
  const [notes, setNotes] = useState({});
  const [updatingId, setUpdatingId] = useState(null);
  const [actionMessage, setActionMessage] = useState('');

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
  }

  async function loadReports() {
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

  const filteredReports = reports.filter(report => {
    const matchesStatus =
      filterStatus === 'all' || report.status === filterStatus;

    const matchesCategory =
      filterCategory === 'all' || report.category === filterCategory;

    const searchText = search.toLowerCase();

    const matchesSearch =
      `${report.category} ${report.description} ${report.address || ''}`
        .toLowerCase()
        .includes(searchText);

    return matchesStatus && matchesCategory && matchesSearch;
  });

  const count = status =>
    reports.filter(report => report.status === status).length;

  if (checking) {
    return (
      <div className="admin-loading">
        <RefreshCw className="admin-spin" size={25} />
        <p>Checking administrator access...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-card">
          <div className="admin-logo">
            <ShieldCheck size={35} />
          </div>

          <span className="admin-eyebrow">ECOGUARD CONTROL CENTER</span>
          <h1>Administrator login</h1>
          <p>Sign in with your authorized ECOGUARD account.</p>

          {accessError && (
            <div className="admin-error">
              <AlertTriangle size={16} />
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
                placeholder="Your password"
              />
            </label>

            {loginError && (
              <div className="admin-error">
                <AlertTriangle size={16} />
                {loginError}
              </div>
            )}

            <button
              className="admin-primary"
              disabled={loginLoading}
            >
              {loginLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <small>Protected by Supabase Authentication</small>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-brand">
          <div className="admin-logo">
            <ShieldCheck size={27} />
          </div>

          <div>
            <b>ECOGUARD</b>
            <small>ADMINISTRATION</small>
          </div>
        </div>

        <div className="admin-user">
          <span>{profile.role}</span>

          <button
            onClick={onBack}
            className="admin-back-button"
          >
            <ArrowLeft size={17} />
            Back to ECOFIND
          </button>

          <button onClick={logout} title="Sign out">
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-welcome">
          <div>
            <span className="admin-eyebrow">CONTROL CENTER</span>
            <h1>Environmental reports</h1>
            <p>Review and manage reports submitted by the community.</p>
          </div>

          <button
            className="admin-refresh"
            onClick={loadReports}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <section className="admin-stats">
          <div className="admin-stat">
            <FileText />
            <strong>{reports.length}</strong>
            <span>Total reports</span>
          </div>

          <div className="admin-stat">
            <Clock />
            <strong>{count('pending')}</strong>
            <span>Pending</span>
          </div>

          <div className="admin-stat">
            <ShieldCheck />
            <strong>{count('verified')}</strong>
            <span>Verified</span>
          </div>

          <div className="admin-stat">
            <CheckCircle2 />
            <strong>{count('resolved')}</strong>
            <span>Resolved</span>
          </div>
        </section>

        <section className="admin-reports">
          <div className="admin-section-heading">
            <div>
              <h2>Community submissions</h2>
              <p>{filteredReports.length} reports found</p>
            </div>
          </div>

          <div className="admin-filters">
            <div className="admin-search">
              <Search size={17} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search reports..."
              />
            </div>

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

          {loading && (
            <div className="admin-empty">
              <RefreshCw className="admin-spin" />
              Loading reports...
            </div>
          )}

          {error && (
            <div className="admin-error">
              <AlertTriangle size={17} />
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="admin-report-list">
              {filteredReports.length === 0 ? (
                <div className="admin-empty">
                  <FileText size={30} />
                  <h3>No reports found</h3>
                  <p>New community submissions will appear here.</p>
                </div>
              ) : (
                filteredReports.map(report => (
                  <article className="admin-report-card" key={report.id}>
                    <div className="admin-report-top">
                      <span className={`admin-status ${report.status}`}>
                        {statusLabels[report.status] || report.status}
                      </span>

                      <small>
                        {new Date(report.created_at).toLocaleString()}
                      </small>
                    </div>

                    <h3>{report.category}</h3>

                    <p className="admin-description">
                      {report.description}
                    </p>

                    {report.address && (
                      <p className="admin-location">
                        <MapPin size={15} />
                        {report.address}
                      </p>
                    )}

                    <div className="admin-report-actions">
                      <button
                        className="admin-secondary"
                        onClick={() => {
                          setSelectedReport(report);
                          setActionMessage('');
                        }}
                      >
                        View report
                      </button>

                      {report.lat != null && report.long != null && (
                        <a
                          className="admin-secondary"
                          href={`https://www.openstreetmap.org/?mlat=${report.lat}&mlon=${report.long}#map=16/${report.lat}/${report.long}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <MapPin size={14} />
                          View map
                        </a>
                      )}
                    </div>
                  </article>
                ))
              )}
            </div>
          )}
        </section>
      </main>

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
                <span className="admin-eyebrow">REPORT DETAILS</span>
                <h2>{selectedReport.category}</h2>
              </div>

              <button onClick={() => setSelectedReport(null)}>
                <X />
              </button>
            </div>

            <div className="admin-modal-content">
              <span className={`admin-status ${selectedReport.status}`}>
                {statusLabels[selectedReport.status]}
              </span>

              <h3>Description</h3>
              <p>{selectedReport.description}</p>

              {selectedReport.address && (
                <>
                  <h3>Location</h3>
                  <p>{selectedReport.address}</p>
                </>
              )}

              {selectedReport.lat != null &&
                selectedReport.long != null && (
                  <a
                    className="admin-map-link"
                    href={`https://www.openstreetmap.org/?mlat=${selectedReport.lat}&mlon=${selectedReport.long}#map=16/${selectedReport.lat}/${selectedReport.long}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MapPin size={16} />
                    Open report location
                  </a>
                )}

              {selectedReport.photo_url && (
                <>
                  <h3>Evidence photo</h3>
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
                </>
              )}

              <h3>Moderator notes</h3>
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
                placeholder="Write a review note or rejection reason..."
              />

              {actionMessage && (
                <p className="admin-action-message">
                  {actionMessage}
                </p>
              )}

              <h3>Update report status</h3>

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
                    onClick={() => updateReport(selectedReport, status)}
                  >
                    {statusLabels[status]}
                  </button>
                ))}
              </div>

              <button
                className="admin-primary admin-save-note"
                disabled={updatingId === selectedReport.id}
                onClick={() =>
                  updateReport(selectedReport, selectedReport.status)
                }
              >
                {updatingId === selectedReport.id
                  ? 'Saving...'
                  : 'Save moderator note'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
