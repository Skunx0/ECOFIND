
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import {
  ArrowLeft, MapPin, RefreshCw, AlertTriangle,
  CheckCircle2, Clock3, Camera, CalendarDays
} from 'lucide-react';

import {
  MapContainer, TileLayer, Marker, Popup, useMap
} from 'react-leaflet';

import L from 'leaflet';
import './publicreports.css';

const publicStatuses = ['verified', 'in_progress', 'resolved'];

const statusLabels = {
  verified: 'Verified',
  in_progress: 'In progress',
  resolved: 'Resolved'
};

const marker = L.divIcon({
  className: 'public-report-marker',
  html: '<span></span>',
  iconSize: [25, 25],
  iconAnchor: [12, 12]
});

function MapFocus({ report }) {
  const map = useMap();

  useEffect(() => {
    if (
      report?.lat != null &&
      report?.long != null
    ) {
      map.flyTo(
        [Number(report.lat), Number(report.long)],
        14
      );
    }
  }, [report, map]);

  return null;
}

function formatDate(value) {
  if (!value) return 'Date unavailable';

  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export default function PublicReports({ onBack }) {
  const [reports, setReports] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadReports() {
    if (!supabase) {
      setError('Database connection unavailable.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    const { data, error } = await supabase
      .from('environmental_reports')
      .select('*')
      .in('status', publicStatuses)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      setError('Could not load environmental reports.');
    } else {
      setReports(data || []);
      setSelected(current => {
        if (current && data?.some(report => report.id === current)) {
          return current;
        }

        return data?.[0]?.id || null;
      });
    }

    setLoading(false);
  }

  useEffect(() => {
    loadReports();
  }, []);

  const activeReport =
    reports.find(report => report.id === selected) || reports[0];

  return (
    <div className="public-reports">

      <button className="public-reports-back" onClick={onBack}>
        <ArrowLeft size={17} />
        Back to ECOFIND
      </button>

      <div className="public-reports-heading">
        <span className="public-reports-eyebrow">
          ECOGUARD · COMMUNITY ENVIRONMENTAL MONITORING
        </span>

        <h1>Environmental reports.</h1>

        <p>
          Explore verified environmental issues reported by
          communities across Algeria.
        </p>
      </div>

      <div className="public-reports-toolbar">
        <div>
          <span className="public-reports-count">
            {reports.length}
          </span>
          <span> published reports</span>
        </div>

        <button
          className="public-reports-refresh"
          onClick={loadReports}
          disabled={loading}
        >
          <RefreshCw size={15} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {loading && (
        <div className="public-reports-message">
          Loading environmental reports...
        </div>
      )}

      {error && (
        <div className="public-reports-error">
          <AlertTriangle size={17} />
          {error}
          <button onClick={loadReports}>Try again</button>
        </div>
      )}

      {!loading && !error && reports.length === 0 && (
        <div className="public-reports-empty">
          <Camera size={35} />
          <h2>No published reports yet.</h2>
          <p>
            Verified environmental reports will appear here
            after moderator approval.
          </p>
        </div>
      )}

      {!loading && !error && reports.length > 0 && (
        <div className="public-reports-layout">

          <div className="public-reports-map">
            <MapContainer
              center={[36.365, 6.6147]}
              zoom={6}
              className="public-reports-leaflet"
            >
              <TileLayer
                attribution="&copy; OpenStreetMap"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapFocus report={activeReport} />

              {reports
                .filter(report =>
                  report.lat != null &&
                  report.long != null
                )
                .map(report => (
                  <Marker
                    key={report.id}
                    position={[
                      Number(report.lat),
                      Number(report.long)
                    ]}
                    icon={marker}
                    eventHandlers={{
                      click: () => setSelected(report.id)
                    }}
                  >
                    <Popup>
                      <strong>{report.category}</strong>
                      <br />
                      {report.address || 'Location provided'}
                      <br />
                      {statusLabels[report.status] || report.status}
                    </Popup>
                  </Marker>
                ))}
            </MapContainer>
          </div>

          <aside className="public-reports-list">
            <h2>Published reports</h2>

            {reports.map(report => (
              <button
                key={report.id}
                className={`public-report-card ${
                  activeReport?.id === report.id ? 'selected' : ''
                }`}
                onClick={() => setSelected(report.id)}
              >
                <div className="public-report-card-top">
                  <span className="public-report-category">
                    {report.category}
                  </span>

                  <span className={`public-report-status ${report.status}`}>
                    {report.status === 'resolved'
                      ? <CheckCircle2 size={13} />
                      : <Clock3 size={13} />}

                    {statusLabels[report.status] || report.status}
                  </span>
                </div>

                <p className="public-report-description">
                  {report.description}
                </p>

                <div className="public-report-meta">
                  <span>
                    <MapPin size={13} />
                    {report.address || 'Location provided'}
                  </span>

                  <span>
                    <CalendarDays size={13} />
                    {formatDate(report.created_at)}
                  </span>
                </div>

                {report.photo_url && (
                  <div className="public-report-photo-label">
                    <Camera size={13} />
                    Evidence photo available
                  </div>
                )}
              </button>
            ))}
          </aside>

        </div>
      )}

      {!loading && !error && activeReport && (
        <section className="public-report-details">
          <div className="public-report-details-heading">
            <div>
              <span className="public-reports-eyebrow">
                SELECTED ENVIRONMENTAL REPORT
              </span>

              <h2>{activeReport.category}</h2>
            </div>

            <span className={`public-report-status ${activeReport.status}`}>
              {statusLabels[activeReport.status] || activeReport.status}
            </span>
          </div>

          <p>{activeReport.description}</p>

          {activeReport.address && (
            <div className="public-report-detail-location">
              <MapPin size={16} />
              {activeReport.address}
            </div>
          )}

          {activeReport.photo_url && (
            <div className="public-report-evidence">
              <h3>
                <Camera size={16} />
                Evidence photo
              </h3>

              <a
                href={activeReport.photo_url}
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src={activeReport.photo_url}
                  alt="Environmental report evidence"
                />
              </a>
            </div>
          )}
        </section>
      )}

      <footer className="public-reports-footer">
        ECOGUARD · Environmental awareness through community action
      </footer>

    </div>
  );
}
