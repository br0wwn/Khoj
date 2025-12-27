import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import alertService from '../services/alertService';
import reportService from '../services/reportService';

const useQuery = () => new URLSearchParams(useLocation().search);

const Search = () => {
  const query = useQuery();
  const q = query.get('q') || '';
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [reports, setReports] = useState([]);
  const [profiles, setProfiles] = useState([]); // inferred from creators

  useEffect(() => {
    if (!q.trim()) {
      setAlerts([]);
      setReports([]);
      setProfiles([]);
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        const [alertsResp, reportsResp] = await Promise.all([
          alertService.getAllAlerts(),
          reportService.getAllReports()
        ]);

        const allAlerts = alertsResp.success ? alertsResp.data : [];
        const allReports = reportsResp.success ? reportsResp.data : [];

        const qLower = q.toLowerCase();

        const matchedAlerts = allAlerts.filter(a =>
          (a.title && a.title.toLowerCase().includes(qLower)) ||
          (a.description && a.description.toLowerCase().includes(qLower))
        );

        const matchedReports = allReports.filter(r =>
          (r.title && r.title.toLowerCase().includes(qLower)) ||
          (r.description && r.description.toLowerCase().includes(qLower))
        );

        // Infer profiles from createdBy fields in alerts/reports
        const creators = {};
        const addCreator = (item) => {
          const cb = item.createdBy;
          if (cb && cb.userId && cb.userType && cb.userId.name) {
            const id = cb.userId._id || cb.userId;
            const name = cb.userId.name || cb.userId;
            if (name.toLowerCase().includes(qLower)) {
              creators[id] = { id, name, userType: cb.userType };
            }
          }
        };

        allAlerts.forEach(addCreator);
        allReports.forEach(addCreator);

        setAlerts(matchedAlerts);
        setReports(matchedReports);
        setProfiles(Object.values(creators));
      } catch (err) {
        console.error('Search load error', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [q]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Search results for "{q}"</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-2">Alerts ({alerts.length})</h2>
            {alerts.length === 0 ? (
              <p className="text-gray-600">No alerts found.</p>
            ) : (
              <ul className="space-y-2">
                {alerts.map(a => (
                  <li key={a._id} className="p-3 bg-white rounded shadow">
                    <Link to={`/alerts/${a._id}`} className="font-semibold text-primary-700">{a.title}</Link>
                    <p className="text-sm text-gray-600">{a.description?.slice(0, 150)}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">Reports ({reports.length})</h2>
            {reports.length === 0 ? (
              <p className="text-gray-600">No reports found.</p>
            ) : (
              <ul className="space-y-2">
                {reports.map(r => (
                  <li key={r._id} className="p-3 bg-white rounded shadow">
                    <Link to={`/reports/${r._id}`} className="font-semibold text-primary-700">{r.title}</Link>
                    <p className="text-sm text-gray-600">{r.description?.slice(0, 150)}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">Profiles ({profiles.length})</h2>
            {profiles.length === 0 ? (
              <p className="text-gray-600">No profiles found (searches profiles inferred from alert/report creators).</p>
            ) : (
              <ul className="space-y-2">
                {profiles.map(p => (
                  <li key={p.id} className="p-3 bg-white rounded shadow">
                    <Link to={`/view-profile/${p.userType.toLowerCase()}/${p.id}`} className="font-semibold text-primary-700">{p.name}</Link>
                    <p className="text-sm text-gray-600">{p.userType === 'Police' ? '👮 Police Officer' : '👤 Citizen'}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default Search;
