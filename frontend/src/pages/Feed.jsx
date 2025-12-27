import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUserColors } from '../hooks/useUserColors';
import alertService from '../services/alertService';
import AlertCard from '../components/AlertCard';
import CreateAlertModal from '../components/CreateAlertModal';
import { AlertCardSkeleton } from '../components/SkeletonLoader';
import areaData from '../data/area.json';

const Feed = () => {
  const { user, isAuthenticated } = useAuth();
  const colors = useUserColors();
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAlerts, setTotalAlerts] = useState(0);
  const alertsPerPage = 8;

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedUpazila, setSelectedUpazila] = useState('all');
  const [dateFilter, setDateFilter] = useState('all'); // all, today, week, month
  const location = useLocation();
  const [districts] = useState([...areaData].sort((a, b) => a.district.localeCompare(b.district)));
  const [upazilas, setUpazilas] = useState([]);

  useEffect(() => {
    fetchAlerts();
  }, [currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchAlerts();
    }
  }, [statusFilter, selectedDistrict, selectedUpazila, dateFilter]);

  // Sync searchQuery with ?q= in URL (global navbar search)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q') || '';
    setSearchQuery(q);
  }, [location.search]);

  // Update upazilas when district changes
  useEffect(() => {
    if (selectedDistrict !== 'all') {
      const district = districts.find(d => d.district === selectedDistrict);
      setUpazilas(district ? [...district.upazilas].sort() : []);
      setSelectedUpazila('all');
    } else {
      setUpazilas([]);
      setSelectedUpazila('all');
    }
  }, [selectedDistrict, districts]);

  // Apply client-side filters (search, district, upazila, date)
  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...alerts];

      // Search by title (client-side)
      if (searchQuery.trim()) {
        filtered = filtered.filter(alert =>
          alert.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // District filter (client-side)
      if (selectedDistrict !== 'all') {
        filtered = filtered.filter(alert => alert.district === selectedDistrict);
      }

      // Upazila filter (client-side)
      if (selectedUpazila !== 'all') {
        filtered = filtered.filter(alert => alert.upazila === selectedUpazila);
      }

      // Date filter (client-side)
      if (dateFilter !== 'all') {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        filtered = filtered.filter(alert => {
          const alertDate = new Date(alert.createdAt);

          switch (dateFilter) {
            case 'today':
              return alertDate >= today;
            case 'week':
              const weekAgo = new Date(today);
              weekAgo.setDate(weekAgo.getDate() - 7);
              return alertDate >= weekAgo;
            case 'month':
              const monthAgo = new Date(today);
              monthAgo.setMonth(monthAgo.getMonth() - 1);
              return alertDate >= monthAgo;
            default:
              return true;
          }
        });
      }

      setFilteredAlerts(filtered);
    };

    applyFilters();
  }, [alerts, searchQuery, selectedDistrict, selectedUpazila, dateFilter]);

  const fetchAlerts = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: currentPage,
        limit: alertsPerPage
      };

      // Add filters to params
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await alertService.getAllAlerts(params);
      if (response.success) {
        setAlerts(response.data);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotalAlerts(response.pagination?.total || 0);
      }
    } catch (err) {
      setError('Failed to load alerts');
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAlertCreated = (newAlert) => {
    setAlerts([newAlert, ...alerts]);
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setSearchQuery('');
    setSelectedDistrict('all');
    setSelectedUpazila('all');
    setDateFilter('all');
    setCurrentPage(1);
  };

  const hasActiveFilters = statusFilter !== 'all' || searchQuery.trim() !== '' ||
    selectedDistrict !== 'all' || selectedUpazila !== 'all' || dateFilter !== 'all';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Community Alerts</h1>
          {isAuthenticated && (
            <p className="text-gray-600">Welcome back, <span className={`font-semibold ${colors.text}`}>{user?.name}</span>!</p>
          )}
        </div>
        {isAuthenticated && (
          <button
            onClick={() => setIsModalOpen(true)}
            className={`px-6 py-3 text-white rounded-lg transition-colors font-medium flex items-center gap-2 ${colors.bg} ${colors.hoverBgLight}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Alert
          </button>
        )}
      </div>

      {/* Status Filter Buttons & Advanced Filters Toggle */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {/* Status filter buttons */}
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-md transition-colors ${statusFilter === 'all'
              ? `${colors.bg} text-white`
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-4 py-2 rounded-md transition-colors ${statusFilter === 'active'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            Active
          </button>
          <button
            onClick={() => setStatusFilter('resolved')}
            className={`px-4 py-2 rounded-md transition-colors ${statusFilter === 'resolved'
              ? `${colors.bg} text-white`
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            Resolved
          </button>

          {/* Advanced Filters Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="ml-auto px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Advanced Filters
            {hasActiveFilters && (searchQuery || selectedDistrict !== 'all' || selectedUpazila !== 'all' || dateFilter !== 'all') && (
              <span className={`px-2 py-0.5 text-xs rounded-full text-white ${colors.bg}`}>
                {[searchQuery.trim() !== '', selectedDistrict !== 'all', selectedUpazila !== 'all', dateFilter !== 'all'].filter(Boolean).length}
              </span>
            )}
            <svg className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Results count */}
        <div className="text-sm text-gray-600">
          Showing {filteredAlerts.length} of {alerts.length} alerts on page {currentPage} (Total: {totalAlerts})
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="ml-3 text-gray-600 hover:text-gray-800 underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filter Section (Collapsible) */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Advanced Filters</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search by title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search by Title
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search alerts..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>

            {/* District filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                District
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                <option value="all">All Districts</option>
                {districts.map((district) => (
                  <option key={district.district} value={district.district}>
                    {district.district}
                  </option>
                ))}
              </select>
            </div>

            {/* Upazila filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thana/Upazila
              </label>
              <select
                value={selectedUpazila}
                onChange={(e) => setSelectedUpazila(e.target.value)}
                disabled={selectedDistrict === 'all'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="all">All Upazilas</option>
                {upazilas.map((upazila) => (
                  <option key={upazila} value={upazila}>
                    {upazila}
                  </option>
                ))}
              </select>
            </div>

            {/* Date filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Posted
              </label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mb-6">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-md transition-colors ${
              currentPage === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Previous
          </button>
          
          <div className="flex gap-1">
            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;
              // Show first, last, current, and pages around current
              const showPage = page === 1 || 
                             page === totalPages || 
                             Math.abs(page - currentPage) <= 1;
              
              if (!showPage && page === 2) {
                return <span key={page} className="px-2 py-2 text-gray-500">...</span>;
              }
              if (!showPage && page === totalPages - 1) {
                return <span key={page} className="px-2 py-2 text-gray-500">...</span>;
              }
              if (!showPage) return null;
              
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    currentPage === page
                      ? `${colors.bg} text-white`
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-md transition-colors ${
              currentPage === totalPages
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Next
          </button>
        </div>
      )}

      {/* Alerts Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-fr">
          {[...Array(8)].map((_, index) => (
            <AlertCardSkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {hasActiveFilters ? 'No alerts match your filters' : 'No alerts yet'}
          </h2>
          <p className="text-gray-600 mb-4">
            {hasActiveFilters
              ? 'Try adjusting your filter criteria to see more results.'
              : isAuthenticated
                ? 'Be the first to create an alert in your community!'
                : 'Sign in to view and create community alerts.'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className={`inline-block text-white px-6 py-3 rounded-md transition-colors ${colors.bg} ${colors.hoverBgLight}`}
            >
              Clear Filters
            </button>
          )}
          {!isAuthenticated && !hasActiveFilters && (
            <a
              href="/login"
              className={`inline-block text-white px-6 py-3 rounded-md transition-colors ${colors.bg} ${colors.hoverBgLight}`}
            >
              Sign In
            </a>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-fr">
            {filteredAlerts.map((alert) => (
              <AlertCard key={alert._id} alert={alert} variant="grid" showContactButton={true} />
            ))}
          </div>

          {/* Pagination Controls at Bottom */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-md transition-colors ${
                  currentPage === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  // Show first, last, current, and pages around current
                  const showPage = page === 1 || 
                                 page === totalPages || 
                                 Math.abs(page - currentPage) <= 1;
                  
                  if (!showPage && page === 2) {
                    return <span key={page} className="px-2 py-2 text-gray-500">...</span>;
                  }
                  if (!showPage && page === totalPages - 1) {
                    return <span key={page} className="px-2 py-2 text-gray-500">...</span>;
                  }
                  if (!showPage) return null;
                  
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-md transition-colors ${
                        currentPage === page
                          ? `${colors.bg} text-white`
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-md transition-colors ${
                  currentPage === totalPages
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Create Alert Modal */}
      <CreateAlertModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAlertCreated={handleAlertCreated}
      />
    </div>
  );
};

export default Feed;

