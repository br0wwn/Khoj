import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUserColors } from '../hooks/useUserColors';
import reportService from '../services/reportService';
import CreateReportModal from '../components/CreateReportModal';
import ReportCard from '../components/ReportCard';
import ReportDetailModal from '../components/ReportDetailModal';
import areaData from '../data/area.json';
import { ReportCardSkeleton } from '../components/SkeletonLoader';

const Report = () => {
  const { user } = useAuth();
  const colors = useUserColors();

  const [activeTab, setActiveTab] = useState(user ? 'my-reports' : 'feed');
  const [myReports, setMyReports] = useState([]);
  const [feedReports, setFeedReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedUpazila, setSelectedUpazila] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [anonymousFilter, setAnonymousFilter] = useState('all');

  const [districts] = useState(() => {
    return [...areaData].sort((a, b) => a.district.localeCompare(b.district));
  });
  const [upazilas, setUpazilas] = useState([]);
  const [viewMode, setViewMode] = useState('list');

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const response = await reportService.getAllReports();

      // Extract data from response - check both response.data and response.data.data
      let reportsArray = [];
      if (response.success && response.data) {
        reportsArray = Array.isArray(response.data) ? response.data : [];
      } else if (Array.isArray(response)) {
        reportsArray = response;
      }

      if (user) {
        const userReportsList = reportsArray.filter(report => {
          const hasCreator = report.createdBy && report.createdBy.userId;
          if (!hasCreator) return false;

          // Handle both populated (object) and unpopulated (string) userId
          const creatorId = typeof report.createdBy.userId === 'object'
            ? report.createdBy.userId._id || report.createdBy.userId.id
            : report.createdBy.userId;

          // User ID can be at user._id or user.id
          const userId = user._id || user.id;

          if (!userId || !creatorId) return false;

          return creatorId.toString() === userId.toString();
        });

        setMyReports(userReportsList);
      } else {
        setMyReports([]);
      }

      setFeedReports(reportsArray);
      setFilteredReports(reportsArray);
    } catch (error) {
      console.error('Error fetching reports:', error);
      // Set empty arrays on error
      setFeedReports([]);
      setFilteredReports([]);
      setMyReports([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const applyFilters = useCallback(() => {
    let filtered = [...feedReports];

    // Anonymous filter - based on whether createdBy exists
    if (anonymousFilter === 'anonymous') {
      filtered = filtered.filter(report => !report.createdBy || !report.createdBy.userId);
    } else if (anonymousFilter === 'non-anonymous') {
      filtered = filtered.filter(report => report.createdBy && report.createdBy.userId);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // District filter
    if (selectedDistrict) {
      filtered = filtered.filter(report => report.district === selectedDistrict);
    }

    // Upazila filter
    if (selectedUpazila) {
      filtered = filtered.filter(report => report.upazila === selectedUpazila);
    }

    // Date filter
    if (selectedDate) {
      filtered = filtered.filter(report => {
        const reportDate = new Date(report.createdAt).toISOString().split('T')[0];
        return reportDate === selectedDate;
      });
    }

    setFilteredReports(filtered);
  }, [feedReports, searchTerm, selectedDistrict, selectedUpazila, selectedDate, anonymousFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    if (selectedDistrict) {
      const district = districts.find(d => d.district === selectedDistrict);
      setUpazilas(district ? [...district.upazilas].sort() : []);
      setSelectedUpazila('');
    } else {
      setUpazilas([]);
      setSelectedUpazila('');
    }
  }, [selectedDistrict, districts]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDistrict('');
    setSelectedUpazila('');
    setSelectedDate('');
    setAnonymousFilter('all');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (selectedDistrict) count++;
    if (selectedUpazila) count++;
    if (selectedDate) count++;
    if (anonymousFilter !== 'all') count++;
    return count;
  };

  const handleDeleteReport = async (reportId) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await reportService.deleteReport(reportId);
        fetchReports();
      } catch (error) {
        console.error('Error deleting report:', error);
        alert('Failed to delete report');
      }
    }
  };

  const handleReportCreated = () => {
    fetchReports();
    setIsCreateModalOpen(false);
  };

  const handleReportClick = (report) => {
    setSelectedReport(report);
    setIsDetailModalOpen(true);
  };

  const handleReportUpdated = (updatedReport) => {
    setSelectedReport(updatedReport);
    fetchReports();
  };

  const handleReportDeleted = async (reportId) => {
    try {
      await reportService.deleteReport(reportId);
      fetchReports();
      setIsDetailModalOpen(false);
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('Failed to delete report');
    }
  };

  return (
    <div className="min-h-screen bg-primary py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Reports</h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className={`px-6 py-3 ${colors.bg} text-white rounded-lg hover:opacity-90 transition-all shadow-md hover:shadow-lg font-medium flex items-center gap-2`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Report
          </button>
        </div>

        {/* Tabs */}
        {user && (
          <div className="flex gap-4 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('my-reports')}
              className={`pb-3 px-4 font-medium transition-colors border-b-2 ${activeTab === 'my-reports'
                  ? `${colors.text} ${colors.border}`
                  : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
            >
              My Reports ({myReports.length})
            </button>
            <button
              onClick={() => setActiveTab('feed')}
              className={`pb-3 px-4 font-medium transition-colors border-b-2 ${activeTab === 'feed'
                  ? `${colors.text} ${colors.border}`
                  : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
            >
              Report Feed ({feedReports.length})
            </button>
          </div>
        )}

        {/* Filters - Only show in feed tab */}
        {activeTab === 'feed' && (
          <div className="mb-6">
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-3 mb-4">
              <button
                onClick={() => setAnonymousFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${anonymousFilter === 'all'
                    ? `${colors.bg} text-white shadow-md`
                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'
                  }`}
              >
                All
              </button>

              <button
                onClick={() => setAnonymousFilter('anonymous')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${anonymousFilter === 'anonymous'
                    ? `${colors.bg} text-white shadow-md`
                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'
                  }`}
              >
                Anonymous
              </button>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${showFilters
                    ? `${colors.bg} text-white shadow-md`
                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'
                  }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Advanced Filters
                {getActiveFiltersCount() > 0 && (
                  <span className="bg-white text-gray-800 px-2 py-0.5 rounded-full text-xs font-bold">
                    {getActiveFiltersCount()}
                  </span>
                )}
              </button>

              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm font-medium flex items-center gap-2"
              >
                {viewMode === 'grid' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search
                    </label>
                    <input
                      type="text"
                      placeholder="Search by title or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      District
                    </label>
                    <select
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    >
                      <option value="">All Districts</option>
                      {districts.map((districtObj) => (
                        <option key={districtObj.district} value={districtObj.district}>
                          {districtObj.district}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upazila / Thana
                    </label>
                    <select
                      value={selectedUpazila}
                      onChange={(e) => setSelectedUpazila(e.target.value)}
                      disabled={!selectedDistrict}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">All Upazilas</option>
                      {upazilas.map((upazila) => (
                        <option key={upazila} value={upazila}>
                          {upazila}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {getActiveFiltersCount() > 0 && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Results Count */}
        {activeTab === 'feed' && (
          <div className="mb-4">
            <p className="text-gray-600">
              Showing <span className="font-semibold">{filteredReports.length}</span> of{' '}
              <span className="font-semibold">{feedReports.length}</span> reports
            </p>
          </div>
        )}

        {/* Reports Grid/List */}
        {loading ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {[...Array(6)].map((_, i) => (
              <ReportCardSkeleton key={i} variant={viewMode} />
            ))}
          </div>
        ) : (
          <>
            {activeTab === 'my-reports' ? (
              myReports.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Reports Yet</h3>
                  <p className="text-gray-500 mb-6">You haven't created any reports yet.</p>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className={`px-6 py-3 ${colors.bg} text-white rounded-lg hover:opacity-90 transition-all`}
                  >
                    Create Your First Report
                  </button>
                </div>
              ) : (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                  {myReports.map((report) => (
                    <ReportCard
                      key={report._id}
                      report={report}
                      variant={viewMode}
                      showActions={true}
                      onDelete={handleDeleteReport}
                      onClick={() => handleReportClick(report)}
                      currentUser={user}
                    />
                  ))}
                </div>
              )
            ) : (
              filteredReports.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Reports Found</h3>
                  <p className="text-gray-500">Try adjusting your filters or create a new report.</p>
                </div>
              ) : (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                  {filteredReports.map((report) => (
                    <ReportCard
                      key={report._id}
                      report={report}
                      variant={viewMode}
                      showActions={false}
                      onClick={() => handleReportClick(report)}
                      currentUser={user}
                    />
                  ))}
                </div>
              )
            )}
          </>
        )}
      </div>

      {/* Create Report Modal */}
      {isCreateModalOpen && (
        <CreateReportModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onReportCreated={handleReportCreated}
        />
      )}

      {/* Report Detail Modal */}
      {isDetailModalOpen && selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedReport(null);
          }}
          onReportUpdated={handleReportUpdated}
          onReportDeleted={handleReportDeleted}
        />
      )}
    </div>
  );
};

export default Report;
