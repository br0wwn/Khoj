import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import alertService from '../services/alertService';
import reportService from '../services/reportService';
import groupService from '../services/groupService';
import ReportDetailModal from '../components/ReportDetailModal';

const useQuery = () => new URLSearchParams(useLocation().search);

const Search = () => {
  const query = useQuery();
  const q = query.get('q') || '';
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [reports, setReports] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all'); // all, alerts, reports, people
  const [selectedReport, setSelectedReport] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

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
        const [alertsResp, reportsResp, usersResp] = await Promise.all([
          alertService.getAllAlerts(),
          reportService.getAllReports(),
          groupService.getAllUsersForInvite()
        ]);

        const allAlerts = alertsResp.success ? alertsResp.data : [];
        const allReports = reportsResp.success ? reportsResp.data : [];
        const allUsers = usersResp.success ? usersResp.data : [];

        const qLower = q.toLowerCase();

        // Search alerts by title/description
        const matchedAlerts = allAlerts.filter(a =>
          (a.title && a.title.toLowerCase().includes(qLower)) ||
          (a.description && a.description.toLowerCase().includes(qLower))
        );

        // Search reports by title/description
        const matchedReports = allReports.filter(r =>
          (r.title && r.title.toLowerCase().includes(qLower)) ||
          (r.description && r.description.toLowerCase().includes(qLower))
        );

        // Search users by name
        const matchedProfiles = allUsers.filter(u =>
          u.name && u.name.toLowerCase().includes(qLower)
        );

        setAlerts(matchedAlerts);
        setReports(matchedReports);
        setProfiles(matchedProfiles);
      } catch (err) {
        console.error('Search load error', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [q]);

  const filteredAlerts = activeFilter === 'all' || activeFilter === 'alerts' ? alerts : [];
  const filteredReports = activeFilter === 'all' || activeFilter === 'reports' ? reports : [];
  const filteredProfiles = activeFilter === 'all' || activeFilter === 'people' ? profiles : [];

  const totalResults = alerts.length + reports.length + profiles.length;

  const handleReportClick = (report) => {
    setSelectedReport(report);
    setIsReportModalOpen(true);
  };

  const handleReportUpdated = (updatedReport) => {
    setReports(reports.map(r => r._id === updatedReport._id ? updatedReport : r));
    setSelectedReport(updatedReport);
  };

  const handleReportDeleted = async (reportId) => {
    try {
      await reportService.deleteReport(reportId);
      setReports(reports.filter(r => r._id !== reportId));
      setIsReportModalOpen(false);
      setSelectedReport(null);
    } catch (err) {
      console.error('Error deleting report:', err);
      alert('Failed to delete report');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-16 z-10">
          <h1 className="text-xl font-semibold text-gray-800 mb-4">Search Results</h1>
          
          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                activeFilter === 'all'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All ({totalResults})
            </button>
            <button
              onClick={() => setActiveFilter('alerts')}
              className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                activeFilter === 'alerts'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🚨 Alerts ({alerts.length})
            </button>
            <button
              onClick={() => setActiveFilter('reports')}
              className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                activeFilter === 'reports'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              📋 Reports ({reports.length})
            </button>
            <button
              onClick={() => setActiveFilter('people')}
              className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                activeFilter === 'people'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              👥 People ({profiles.length})
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="px-6 py-4">
          {loading ? (
            <div className="text-center text-gray-600 py-12">Loading...</div>
          ) : totalResults === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">No results found for "{q}"</h2>
              <p className="text-gray-600">Try different keywords or check your spelling</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* People Results */}
              {filteredProfiles.length > 0 && (
                <>
                  {activeFilter === 'all' && (
                    <h2 className="text-lg font-semibold text-gray-700 px-2 py-3">People</h2>
                  )}
                  {filteredProfiles.map(p => {
                    const isCurrentUser = currentUser && (currentUser._id === p._id || currentUser.id === p._id);
                    const profileLink = isCurrentUser ? '/profile' : `/view-profile/${p.userType.toLowerCase()}/${p._id}`;
                    
                    return (
                      <Link
                        key={p._id}
                        to={profileLink}
                        className="flex items-center gap-3 bg-white hover:bg-gray-50 p-3 rounded-lg transition"
                      >
                        <div className="w-12 h-12 bg-[#8E1616] text-white rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">
                          {p.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 truncate">
                            {p.name} {isCurrentUser && <span className="text-[#8E1616] text-sm">(You)</span>}
                          </div>
                          <div className="text-sm text-gray-500">
                            {p.userType === 'police' ? 'Police Officer' : 'Citizen'}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </>
              )}

              {/* Alerts Results */}
              {filteredAlerts.length > 0 && (
                <>
                  {activeFilter === 'all' && (
                    <h2 className="text-lg font-semibold text-gray-700 px-2 py-3 mt-4">Alerts</h2>
                  )}
                  {filteredAlerts.map(a => (
                    <Link
                      key={a._id}
                      to={`/alerts/${a._id}`}
                      className="flex items-start gap-3 bg-white hover:bg-gray-50 p-3 rounded-lg transition"
                    >
                      {a.media && a.media.length > 0 ? (
                        <img
                          src={a.media[0].media_url}
                          alt={a.title}
                          className="w-12 h-12 rounded object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded flex items-center justify-center text-xl flex-shrink-0">
                          🚨
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 truncate">{a.title}</div>
                        <div className="text-sm text-gray-600 line-clamp-2 mb-1">{a.description}</div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>📍 {a.location}</span>
                          <span>•</span>
                          <span className={`px-2 py-0.5 rounded ${
                            a.status === 'active' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {a.status}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </>
              )}

              {/* Reports Results */}
              {filteredReports.length > 0 && (
                <>
                  {activeFilter === 'all' && (
                    <h2 className="text-lg font-semibold text-gray-700 px-2 py-3 mt-4">Reports</h2>
                  )}
                  {filteredReports.map(r => (
                    <div
                      key={r._id}
                      onClick={() => handleReportClick(r)}
                      className="flex items-start gap-3 bg-white hover:bg-gray-50 p-3 rounded-lg transition cursor-pointer"
                    >
                      {r.media && r.media.length > 0 ? (
                        <img
                          src={r.media[0].media_url}
                          alt={r.title}
                          className="w-12 h-12 rounded object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded flex items-center justify-center text-xl flex-shrink-0">
                          📋
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 truncate">{r.title}</div>
                        <div className="text-sm text-gray-600 line-clamp-2 mb-1">{r.description}</div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>📍 {r.location}</span>
                          <span>•</span>
                          <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Report Detail Modal */}
      <ReportDetailModal
        report={selectedReport}
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setSelectedReport(null);
        }}
        onReportUpdated={handleReportUpdated}
        onReportDeleted={handleReportDeleted}
      />
    </div>
  );
};

export default Search;
