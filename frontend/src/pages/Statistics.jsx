import React, { useState, useEffect } from 'react';
import statisticsService from '../services/statisticsService';
import areaData from '../data/area.json';

const Statistics = () => {
  const [overallStats, setOverallStats] = useState(null);
  const [dangerousAreas, setDangerousAreas] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [districtStats, setDistrictStats] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [districts] = useState([...areaData].sort((a, b) => a.district.localeCompare(b.district)));

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedDistrict) {
      fetchDistrictStatistics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDistrict]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [overall, dangerous] = await Promise.all([
        statisticsService.getOverallStatistics(),
        statisticsService.getDangerousAreas(10)
      ]);

      if (overall.success) setOverallStats(overall.data);
      if (dangerous.success) setDangerousAreas(dangerous.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDistrictStatistics = async () => {
    try {
      const response = await statisticsService.getDistrictStatistics(selectedDistrict);
      if (response.success) {
        setDistrictStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching district statistics:', error);
    }
  };

  const fetchAreaDetails = async (district, upazila) => {
    try {
      const response = await statisticsService.getAreaStatistics(district, upazila);
      if (response.success) {
        setSelectedArea(response.data);
      }
    } catch (error) {
      console.error('Error fetching area details:', error);
    }
  };

  const getDangerLevelColor = (level) => {
    switch (level) {
      case 'critical':
        return 'bg-red-600 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'moderate':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-green-500 text-white';
    }
  };

  const getDangerLevelIcon = (level) => {
    switch (level) {
      case 'critical':
        return '🔴';
      case 'high':
        return '🟠';
      case 'moderate':
        return '🟡';
      case 'low':
        return '🔵';
      default:
        return '🟢';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Safety Statistics</h1>
          <p className="text-gray-600">Track alert activity and identify dangerous areas in your region</p>
        </div>

        {/* Overall Statistics */}
        {overallStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total Alerts</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{overallStats.totalAlerts}</p>
                </div>
                <div className="bg-blue-100 rounded-full p-3">
                  <span className="text-3xl">🚨</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Active Alerts</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">{overallStats.activeAlerts}</p>
                </div>
                <div className="bg-orange-100 rounded-full p-3">
                  <span className="text-3xl">⚠️</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total Reports</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{overallStats.totalReports}</p>
                </div>
                <div className="bg-purple-100 rounded-full p-3">
                  <span className="text-3xl">📝</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Critical Areas</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">{overallStats.criticalAreas}</p>
                </div>
                <div className="bg-red-100 rounded-full p-3">
                  <span className="text-3xl">🔴</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Danger Level Distribution */}
        {overallStats && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Area Safety Levels</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(overallStats.dangerLevelCounts).map(([level, count]) => (
                <div key={level} className="text-center">
                  <div className={`${getDangerLevelColor(level)} rounded-lg p-4 mb-2`}>
                    <span className="text-3xl block mb-2">{getDangerLevelIcon(level)}</span>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                  <p className="text-sm text-gray-600 font-medium capitalize">{level}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Most Dangerous Areas */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🔴 Most Dangerous Areas</h2>
          {dangerousAreas.length === 0 ? (
            <p className="text-gray-500">No high-risk areas identified</p>
          ) : (
            <div className="space-y-3">
              {dangerousAreas.map((area, index) => (
                <div
                  key={area._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => fetchAreaDetails(area.district, area.upazila)}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {area.upazila}, {area.district}
                      </p>
                      <p className="text-sm text-gray-500">
                        {area.statistics.activeAlerts} active alerts • {area.statistics.totalReports} reports
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-600">{area.dangerScore}</p>
                      <p className="text-xs text-gray-500">Danger Score</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDangerLevelColor(area.dangerLevel)}`}>
                      {area.dangerLevel.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* District Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">District Statistics</h2>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a district</option>
            {districts.map((d) => (
              <option key={d.district} value={d.district}>
                {d.district}
              </option>
            ))}
          </select>

          {districtStats && (
            <div className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Total Alerts</p>
                  <p className="text-2xl font-bold text-blue-600">{districtStats.aggregate.totalAlerts}</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Active Alerts</p>
                  <p className="text-2xl font-bold text-orange-600">{districtStats.aggregate.activeAlerts}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Average Danger Score</p>
                  <p className="text-2xl font-bold text-purple-600">{districtStats.aggregate.averageDangerScore}</p>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 mb-3">Areas in {selectedDistrict}</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {districtStats.areas.map((area) => (
                  <div
                    key={area._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => fetchAreaDetails(area.district, area.upazila)}
                  >
                    <span className="font-medium text-gray-900">{area.upazila}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">
                        Score: <span className="font-semibold">{area.dangerScore}</span>
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getDangerLevelColor(area.dangerLevel)}`}>
                        {area.dangerLevel}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Selected Area Details Modal */}
        {selectedArea && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedArea.upazila}, {selectedArea.district}
                    </h2>
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${getDangerLevelColor(selectedArea.dangerLevel)}`}>
                      {selectedArea.dangerLevel.toUpperCase()} RISK
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedArea(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Danger Score</p>
                    <p className="text-3xl font-bold text-red-600">{selectedArea.dangerScore}/100</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Total Alerts</p>
                    <p className="text-3xl font-bold text-blue-600">{selectedArea.statistics.totalAlerts}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Active Alerts</p>
                    <p className="text-3xl font-bold text-orange-600">{selectedArea.statistics.activeAlerts}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Total Reports</p>
                    <p className="text-3xl font-bold text-purple-600">{selectedArea.statistics.totalReports}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-500">
                    Last updated: {new Date(selectedArea.lastUpdated).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Statistics;
