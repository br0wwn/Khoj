import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const [userType, setUserType] = useState('citizen');
  const [formData, setFormData] = useState({
    // Common fields
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',

    // Citizen-specific
    bio: '',

    // Police-specific
    policeId: '',
    badgeNumber: '',
    rank: 'Constable',
    department: '',
    station: '',
    district: '',
    phoneNumber: '',
    joiningDate: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Common validation
    if (!formData.name || !formData.email || !formData.password || !formData.dateOfBirth) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    // Police-specific validation
    if (userType === 'police') {
      if (!formData.policeId || !formData.badgeNumber || !formData.rank ||
        !formData.department || !formData.station || !formData.district ||
        !formData.phoneNumber || !formData.joiningDate) {
        setError('Please fill in all required police officer fields');
        setLoading(false);
        return;
      }

      // Phone number validation (11 digits)
      if (!/^[0-9]{11}$/.test(formData.phoneNumber)) {
        setError('Phone number must be exactly 11 digits');
        setLoading(false);
        return;
      }
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    // Prepare data based on user type
    const userData = userType === 'citizen'
      ? {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        dateOfBirth: formData.dateOfBirth,
        bio: formData.bio
      }
      : {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        policeId: formData.policeId,
        badgeNumber: formData.badgeNumber,
        rank: formData.rank,
        department: formData.department,
        station: formData.station,
        district: formData.district,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth,
        joiningDate: formData.joiningDate
      };

    const result = await signup(userData, userType);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-citizen hover:text-citizen-light">
              Sign in
            </Link>
          </p>
        </div>

        {/* User Type Toggle */}
        <div className="flex rounded-lg overflow-hidden border border-gray-300">
          <button
            type="button"
            onClick={() => setUserType('citizen')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${userType === 'citizen'
              ? 'bg-citizen text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
          >
            Citizen Signup
          </button>
          <button
            type="button"
            onClick={() => setUserType('police')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${userType === 'police'
              ? 'bg-police text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
          >
            Police Officer Signup
          </button>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Common Fields */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Email address"
              />
            </div>

            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                required
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* Citizen-specific Fields */}
            {userType === 'citizen' && (
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                  Bio (Optional)
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows="3"
                  value={formData.bio}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Tell us about yourself"
                />
              </div>
            )}

            {/* Police-specific Fields */}
            {userType === 'police' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="policeId" className="block text-sm font-medium text-gray-700 mb-1">
                      Police ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="policeId"
                      name="policeId"
                      type="text"
                      required
                      value={formData.policeId}
                      onChange={handleChange}
                      className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Police ID"
                    />
                  </div>

                  <div>
                    <label htmlFor="badgeNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Badge Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="badgeNumber"
                      name="badgeNumber"
                      type="text"
                      required
                      value={formData.badgeNumber}
                      onChange={handleChange}
                      className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Badge Number"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="rank" className="block text-sm font-medium text-gray-700 mb-1">
                    Rank <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="rank"
                    name="rank"
                    required
                    value={formData.rank}
                    onChange={handleChange}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="Constable">Constable</option>
                    <option value="Assistant Sub-Inspector">Assistant Sub-Inspector</option>
                    <option value="Sub-Inspector">Sub-Inspector</option>
                    <option value="Inspector">Inspector</option>
                    <option value="Additional Superintendent">Additional Superintendent</option>
                    <option value="Superintendent">Superintendent</option>
                    <option value="Deputy Inspector General">Deputy Inspector General</option>
                    <option value="Additional Inspector General">Additional Inspector General</option>
                    <option value="Inspector General">Inspector General</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="department"
                    name="department"
                    type="text"
                    required
                    value={formData.department}
                    onChange={handleChange}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="e.g., Criminal Investigation"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="station" className="block text-sm font-medium text-gray-700 mb-1">
                      Police Station <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="station"
                      name="station"
                      type="text"
                      required
                      value={formData.station}
                      onChange={handleChange}
                      className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Station Name"
                    />
                  </div>

                  <div>
                    <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
                      District <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="district"
                      name="district"
                      type="text"
                      required
                      value={formData.district}
                      onChange={handleChange}
                      className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="District"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    required
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="11-digit phone number"
                    maxLength="11"
                  />
                </div>

                <div>
                  <label htmlFor="joiningDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Joining Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="joiningDate"
                    name="joiningDate"
                    type="date"
                    required
                    value={formData.joiningDate}
                    onChange={handleChange}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </>
            )}

            {/* Password Fields */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Password (min. 6 characters)"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Confirm your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                userType === 'police' 
                  ? 'bg-police hover:bg-police-light focus:ring-police' 
                  : 'bg-citizen hover:bg-citizen-light focus:ring-citizen'
              }`}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
