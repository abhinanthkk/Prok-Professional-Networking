import React from 'react';

const NotFound: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-white">
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8 text-center">
      <h1 className="text-3xl font-bold text-[#0a66c2] mb-4">Page Not Available</h1>
      <p className="text-gray-700 mb-6">This page is not available yet.</p>
      <a href="/" className="inline-block px-6 py-2 bg-[#0a66c2] text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">Go Home</a>
    </div>
  </div>
);

export default NotFound; 