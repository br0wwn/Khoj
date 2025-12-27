import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import alertService from '../services/alertService';
import areaData from '../data/area.json';
import { Turnstile } from '@marsidev/react-turnstile';

const Homepage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedUpazila, setSelectedUpazila] = useState('');
  const [alertCount, setAlertCount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [districts] = useState([...areaData].sort((a, b) => a.district.localeCompare(b.district)));
  const [upazilas, setUpazilas] = useState([]);
  const [showVerification, setShowVerification] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // Check if user has been verified before
  useEffect(() => {
    const verified = sessionStorage.getItem('turnstile_verified');
    if (verified === 'true') {
      setIsVerified(true);
    } else {
      // Show verification modal after a short delay
      const timer = setTimeout(() => {
        setShowVerification(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleTurnstileSuccess = (token) => {
    // Store verification in session storage
    sessionStorage.setItem('turnstile_verified', 'true');
    setIsVerified(true);
    setShowVerification(false);
  };

  // Update upazilas when district changes
  useEffect(() => {
    if (selectedDistrict) {
      const district = districts.find(d => d.district === selectedDistrict);
      setUpazilas(district ? [...district.upazilas].sort() : []);
      setSelectedUpazila('');
      setAlertCount(null);
    } else {
      setUpazilas([]);
      setSelectedUpazila('');
      setAlertCount(null);
    }
  }, [selectedDistrict, districts]);

  // Fetch alert count when location is selected
  const fetchAlertCount = async () => {
    if (!selectedDistrict) return;
    
    setLoading(true);
    try {
      const params = {
        status: 'active'
      };
      const response = await alertService.getAllAlerts(params);
      
      // Filter alerts by district and upazila on client side
      let alerts = response.data || [];
      
      // Filter by district
      alerts = alerts.filter(alert => alert.district === selectedDistrict);
      
      // Filter by upazila if selected
      if (selectedUpazila) {
        alerts = alerts.filter(alert => alert.upazila === selectedUpazila);
      }
      
      setAlertCount(alerts.length);
    } catch (error) {
      console.error('Error fetching alert count:', error);
      setAlertCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDistrict) {
      fetchAlertCount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDistrict, selectedUpazila]);

  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      title: 'Real-Time Alerts',
      description: 'Stay informed about safety concerns in your community with instant notifications.'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: 'Location-Based Tracking',
      description: 'View alerts specific to your district and upazila for relevant safety information.'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: 'Community Collaboration',
      description: 'Connect with neighbors and local authorities to build a safer community together.'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Anonymous Reporting',
      description: 'Report safety concerns anonymously to protect your privacy while helping others.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Verification Modal for First Visit */}
      {showVerification && !isVerified && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-gray-700 animate-fade-in">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">🔒</div>
              <h2 className="text-2xl font-bold text-white mb-2">Security Verification</h2>
              <p className="text-gray-300">
                Please verify you're human to access Khoj
              </p>
            </div>
            
            <div className="flex justify-center mb-4">
              <Turnstile
                siteKey={process.env.REACT_APP_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}
                onSuccess={handleTurnstileSuccess}
                onError={() => setShowVerification(true)}
                theme="dark"
                size="normal"
              />
            </div>
            
            <p className="text-xs text-gray-400 text-center">
              This verification helps protect our community from automated threats
            </p>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-red-900 opacity-90"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-orange-600 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-700 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-blue-800 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
              Welcome to <span className="text-orange-400">Khoj</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto animate-fade-in-delay">
              Your Community Safety Network - Stay Alert, Stay Safe, Stay Connected
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-delay-2">
              <Link
                to="/feed"
                className="px-8 py-4 bg-white text-blue-900 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
              >
                View Alerts
              </Link>
              {!isAuthenticated && (
                <Link
                  to="/signup"
                  className="px-8 py-4 bg-orange-500 text-white rounded-lg font-semibold text-lg hover:bg-orange-600 transition-all transform hover:scale-105 shadow-lg"
                >
                  Get Started
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Key Features</h2>
            <p className="text-xl text-gray-300">Everything you need to stay safe and informed</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-900 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 animate-slide-up border border-gray-700"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-orange-500 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Alert Count Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-red-900 to-blue-900">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12 border border-gray-700">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Check Alerts in Your Area
              </h2>
              <p className="text-lg text-gray-300">
                Select your location to see active safety alerts
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select District
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                >
                  <option value="">Choose a district...</option>
                  {districts.map((districtObj) => (
                    <option key={districtObj.district} value={districtObj.district}>
                      {districtObj.district}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Upazila / Thana (Optional)
                </label>
                <select
                  value={selectedUpazila}
                  onChange={(e) => setSelectedUpazila(e.target.value)}
                  disabled={!selectedDistrict}
                  className="w-full px-4 py-3 border-2 border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all disabled:bg-gray-800 disabled:cursor-not-allowed"
                >
                  <option value="">All Upazilas</option>
                  {upazilas.map((upazila) => (
                    <option key={upazila} value={upazila}>
                      {upazila}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {alertCount !== null && (
              <div className="text-center animate-fade-in">
                <div className="inline-block bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-8 text-white transform hover:scale-105 transition-all">
                  <div className="text-5xl font-bold mb-2">{alertCount}</div>
                  <div className="text-xl">Active Alert{alertCount !== 1 ? 's' : ''}</div>
                  <div className="text-sm opacity-90 mt-2">
                    {selectedUpazila ? `in ${selectedUpazila}, ${selectedDistrict}` : `in ${selectedDistrict}`}
                  </div>
                </div>
              </div>
            )}

            {loading && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-red-700 to-orange-600 rounded-2xl shadow-2xl p-8 md:p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-20"></div>
            <div className="relative z-10">
              <div className="text-6xl mb-6 animate-bounce">🚨</div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                See Something? Say Something!
              </h2>
              <p className="text-xl mb-8 text-gray-100">
                Your report could save lives. Help keep your community safe by reporting safety concerns immediately.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/report"
                  className="px-8 py-4 bg-white text-red-700 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
                >
                  Report Now
                </Link>
                <Link
                  to="/feed"
                  className="px-8 py-4 bg-red-800 text-white border-2 border-white rounded-lg font-semibold text-lg hover:bg-red-900 transition-all transform hover:scale-105"
                >
                  View Active Alerts
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-gray-900 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Making Communities Safer Together</h2>
            <p className="text-xl text-gray-300">Join thousands of community members working together</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-8">
              <div className="text-5xl font-bold text-orange-500 mb-2">Real-Time</div>
              <div className="text-xl text-gray-300">Alert Updates</div>
            </div>
            <div className="p-8">
              <div className="text-5xl font-bold text-red-500 mb-2">24/7</div>
              <div className="text-xl text-gray-300">Community Support</div>
            </div>
            <div className="p-8">
              <div className="text-5xl font-bold text-blue-400 mb-2">Secure</div>
              <div className="text-xl text-gray-300">Anonymous Reporting</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;
