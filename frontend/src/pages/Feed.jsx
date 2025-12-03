import React from 'react';
import { useAuth } from '../context/AuthContext';

const Feed = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Feed</h1>
      
      {isAuthenticated ? (
        <div>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <p className="text-gray-700">Welcome back, <span className="font-semibold text-blue-600">{user?.name}</span>!</p>
          </div>

          {/* Placeholder for feed content */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Sample Post 1</h2>
              <p className="text-gray-600">This is where your feed content will appear. Posts, updates, and more will be displayed here.</p>
              <div className="mt-4 text-sm text-gray-500">Posted 2 hours ago</div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Sample Post 2</h2>
              <p className="text-gray-600">Connect with your community and stay updated with the latest posts and activities.</p>
              <div className="mt-4 text-sm text-gray-500">Posted 5 hours ago</div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Sample Post 3</h2>
              <p className="text-gray-600">Share your thoughts, ideas, and experiences with others in your network.</p>
              <div className="mt-4 text-sm text-gray-500">Posted 1 day ago</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Welcome to Khoj</h2>
          <p className="text-gray-600 mb-6">Sign in to see your personalized feed and connect with others.</p>
          <a
            href="/login"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Sign In
          </a>
        </div>
      )}
    </div>
  );
};

export default Feed;
