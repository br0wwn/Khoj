import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import statisticsService from '../services/statisticsService';
import areaData from '../data/area.json';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom red marker icon
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const Statistics = () => {
  const [districtStats, setDistrictStats] = useState([]);
  const [upazilaStats, setUpazilaStats] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedUpazila, setSelectedUpazila] = useState('');
  const [mapAlerts, setMapAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [districts] = useState([...areaData].sort((a, b) => a.district.localeCompare(b.district)));
  const [availableUpazilas, setAvailableUpazilas] = useState([]);

  useEffect(() => {
    fetchDistrictStatistics();
  }, []);

  useEffect(() => {
    if (selectedDistrict) {
      fetchUpazilaStatistics();
      fetchMapAlerts();
      
      // Update available upazilas
      const district = districts.find(d => d.district === selectedDistrict);
      setAvailableUpazilas(district ? [...district.upazilas].sort() : []);
      setSelectedUpazila('');
    } else {
      setUpazilaStats([]);
      setMapAlerts([]);
      setAvailableUpazilas([]);
      setSelectedUpazila('');
    }
  }, [selectedDistrict]);

  useEffect(() => {
    if (selectedDistrict) {
      fetchMapAlerts();
    }
  }, [selectedUpazila]);

  const fetchDistrictStatistics = async () => {
    try {
      setLoading(true);
      const response = await statisticsService.getAllDistrictStatistics();
      if (response.success) {
        setDistrictStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching district statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUpazilaStatistics = async () => {
    try {
      const response = await statisticsService.getUpazilaStatistics(selectedDistrict);
      if (response.success) {
        setUpazilaStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching upazila statistics:', error);
      setUpazilaStats([]);
    }
  };

  const fetchMapAlerts = async () => {
    try {
      const response = await statisticsService.getAlertsForMap(selectedDistrict, selectedUpazila);
      if (response.success) {
        setMapAlerts(response.data);
      }
    } catch (error) {
      console.error('Error fetching map alerts:', error);
      setMapAlerts([]);
    }
  };

  const getDangerLevelColor = (level) => {
    switch (level) {
      case 'danger':
        return 'bg-red-600 text-white';
      case 'cautious':
        return 'bg-yellow-500 text-white';
      case 'safe':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getMapCenter = () => {
    if (mapAlerts.length > 0) {
      // Calculate center from alerts
      const avgLat = mapAlerts.reduce((sum, alert) => sum + alert.geo.latitude, 0) / mapAlerts.length;
      const avgLng = mapAlerts.reduce((sum, alert) => sum + alert.geo.longitude, 0) / mapAlerts.length;
      return [avgLat, avgLng];
    }
    // Default to Bangladesh center
    return [23.8103, 90.4125];
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

  const totalAlerts = districtStats.reduce((sum, d) => sum + d.alertCount, 0);
  const totalActiveAlerts = districtStats.reduce((sum, d) => sum + d.activeAlerts, 0);
  const dangerousDistricts = districtStats.filter(d => d.dangerLevel === 'danger').length;
  const cautiousDistricts = districtStats.filter(d => d.dangerLevel === 'cautious').length;
  const safeDistricts = districtStats.filter(d => d.dangerLevel === 'safe').length;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Safety Statistics</h1>
          <p className="text-gray-600">Track alert activity in the last 30 days and identify risk areas</p>
        </div>

        {/* Overall Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Alerts (30 days)</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalAlerts}</p>
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
                <p className="text-3xl font-bold text-orange-600 mt-2">{totalActiveAlerts}</p>
              </div>
              <div className="bg-orange-100 rounded-full p-3">
                <span className="text-3xl">⚠️</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Danger Zones</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{dangerousDistricts}</p>
              </div>
              <div className="bg-red-100 rounded-full p-3">
                <span className="text-3xl">🔴</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Cautious Zones</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{cautiousDistricts}</p>
              </div>
              <div className="bg-yellow-100 rounded-full p-3">
                <span className="text-3xl">🟡</span>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Level Distribution */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Area Safety Levels</h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center group relative">
              <div className="bg-red-600 rounded-lg p-6 mb-2 transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-2">
                <span className="text-4xl block mb-2">🔴</span>
                <p className="text-3xl font-bold text-white">{dangerousDistricts}</p>
              </div>
              <p className="text-sm text-gray-600 font-medium">Danger</p>
              <p className="text-xs text-gray-500">≥12 alerts (district) / ≥4 alerts (upazila)</p>
              {/* Hover tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-10 group-hover:translate-y-0 translate-y-2">
                <div className="relative">
                  <p className="font-semibold mb-1">High Risk Area</p>
                  <p>This area has experienced significant incidents recently. Exercise extreme caution, avoid traveling alone, and stay updated with local news.</p>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </div>
            <div className="text-center group relative">
              <div className="bg-yellow-500 rounded-lg p-6 mb-2 transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-2">
                <span className="text-4xl block mb-2">🟡</span>
                <p className="text-3xl font-bold text-white">{cautiousDistricts}</p>
              </div>
              <p className="text-sm text-gray-600 font-medium">Cautious</p>
              <p className="text-xs text-gray-500">5-11 alerts (district) / 2-3 alerts (upazila)</p>
              {/* Hover tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-10 group-hover:translate-y-0 translate-y-2">
                <div className="relative">
                  <p className="font-semibold mb-1">Moderate Risk Area</p>
                  <p>Some incidents reported in this area. Stay alert, inform family of your whereabouts, and avoid unfamiliar places at night.</p>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </div>
            <div className="text-center group relative">
              <div className="bg-green-500 rounded-lg p-6 mb-2 transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-2">
                <span className="text-4xl block mb-2">🟢</span>
                <p className="text-3xl font-bold text-white">{safeDistricts}</p>
              </div>
              <p className="text-sm text-gray-600 font-medium">Safe</p>
              <p className="text-xs text-gray-500">&lt;5 alerts (district) / &lt;2 alerts (upazila)</p>
              {/* Hover tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-10 group-hover:translate-y-0 translate-y-2">
                <div className="relative">
                  <p className="font-semibold mb-1">Low Risk Area</p>
                  <p>Few or no recent incidents reported. While generally safe, always maintain basic safety awareness and precautions.</p>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtering and Map */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left: Filters and Lists */}
          <div className="lg:col-span-1 space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Filters</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select District
                  </label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Districts</option>
                    {districts.map((d) => (
                      <option key={d.district} value={d.district}>
                        {d.district}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedDistrict && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Upazila
                    </label>
                    <select
                      value={selectedUpazila}
                      onChange={(e) => setSelectedUpazila(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Upazilas</option>
                      {availableUpazilas.map((upazila) => (
                        <option key={upazila} value={upazila}>
                          {upazila}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* District List */}
            {!selectedDistrict && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Districts</h2>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {districtStats.map((district) => (
                    <div
                      key={district.district}
                      onClick={() => setSelectedDistrict(district.district)}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">{district.district}</p>
                        <p className="text-xs text-gray-500">{district.alertCount} alerts</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDangerLevelColor(district.dangerLevel)}`}>
                        {district.dangerLevel.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upazila List */}
            {selectedDistrict && upazilaStats.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Upazilas in {selectedDistrict}
                </h2>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {upazilaStats.map((upazila) => (
                    <div
                      key={upazila.upazila}
                      onClick={() => setSelectedUpazila(upazila.upazila)}
                      className={`flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer ${
                        selectedUpazila === upazila.upazila
                          ? 'bg-blue-100 border-2 border-blue-500'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-gray-900">{upazila.upazila}</p>
                        <p className="text-xs text-gray-500">{upazila.alertCount} alerts</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDangerLevelColor(upazila.dangerLevel)}`}>
                        {upazila.dangerLevel.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Alert Locations</h2>
                  {selectedDistrict && (
                    <p className="text-sm text-gray-600">
                      {selectedUpazila ? `${selectedUpazila}, ` : ''}{selectedDistrict} - {mapAlerts.length} alerts
                    </p>
                  )}
                </div>
                {selectedDistrict && (
                  <button
                    onClick={() => {
                      setSelectedDistrict('');
                      setSelectedUpazila('');
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
              
              <div className="h-[600px] rounded-lg overflow-hidden border border-gray-300 relative z-0">
                <MapContainer
                  center={getMapCenter()}
                  zoom={selectedUpazila ? 12 : selectedDistrict ? 10 : 7}
                  style={{ height: '100%', width: '100%' }}
                  key={`${selectedDistrict}-${selectedUpazila}`}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {mapAlerts.map((alert) => (
                    <React.Fragment key={alert._id}>
                      <Marker
                        position={[alert.geo.latitude, alert.geo.longitude]}
                        icon={redIcon}
                      >
                        <Popup>
                          <div className="text-sm">
                            <strong className="text-red-600">{alert.title}</strong><br />
                            📍 {alert.location}<br />
                            📅 {new Date(alert.createdAt).toLocaleDateString()}<br />
                            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs ${
                              alert.status === 'active' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {alert.status}
                            </span>
                          </div>
                        </Popup>
                      </Marker>
                      <Circle
                        center={[alert.geo.latitude, alert.geo.longitude]}
                        radius={200}
                        pathOptions={{
                          color: 'red',
                          fillColor: 'red',
                          fillOpacity: 0.2,
                          weight: 2
                        }}
                      />
                    </React.Fragment>
                  ))}
                </MapContainer>
              </div>

              {!selectedDistrict && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💡 Select a district to view alert locations on the map
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* General Safety Advice */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-600 rounded-full p-3">
              <span className="text-3xl">🛡️</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">General Safety Guidelines</h2>
          </div>
          
          <p className="text-gray-700 mb-6 text-lg">
            Stay safe and vigilant in Bangladesh by following these essential safety practices:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Safety */}
            <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow">
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-1">👤</span>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Personal Safety</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>Always share your location with family or friends when traveling</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>Avoid walking alone in unfamiliar areas, especially after dark</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>Keep valuables hidden and avoid displaying expensive items</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>Trust your instincts - if something feels wrong, leave immediately</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Transportation Safety */}
            <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow">
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-1">🚗</span>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Transportation Safety</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>Use registered ride-sharing services like Uber, Pathao, or Obhai</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>Verify driver and vehicle details before getting in</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>Avoid overcrowded public transport during peak hours</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>Keep emergency contacts saved and easily accessible</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Emergency Preparedness */}
            <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow">
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-1">🚨</span>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Emergency Preparedness</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>Save emergency numbers: Police 999, Fire 102, Ambulance 199</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>Know the nearest police station and hospital locations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>Keep copies of important documents in a safe place</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>Have a charged power bank and backup phone battery</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Community Awareness */}
            <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow">
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-1">👥</span>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Community Awareness</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>Report suspicious activities to local authorities immediately</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>Stay informed about local news and community alerts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>Join neighborhood watch groups or community safety initiatives</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>Look out for others - community safety is everyone's responsibility</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Important Contact Numbers */}
          <div className="mt-6 bg-red-50 border-2 border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-red-900 mb-3 flex items-center gap-2">
              <span>📞</span>
              <span>Emergency Contact Numbers in Bangladesh</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-white rounded p-3 text-center">
                <p className="font-bold text-gray-900">Police</p>
                <p className="text-2xl font-bold text-blue-600">999</p>
              </div>
              <div className="bg-white rounded p-3 text-center">
                <p className="font-bold text-gray-900">Fire Service</p>
                <p className="text-2xl font-bold text-red-600">102</p>
              </div>
              <div className="bg-white rounded p-3 text-center">
                <p className="font-bold text-gray-900">Ambulance</p>
                <p className="text-2xl font-bold text-green-600">199</p>
              </div>
              <div className="bg-white rounded p-3 text-center">
                <p className="font-bold text-gray-900">Women Helpline</p>
                <p className="text-2xl font-bold text-purple-600">109</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
