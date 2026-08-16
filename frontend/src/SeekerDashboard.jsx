import React, { useState, useEffect } from 'react';

export default function SeekerDashboard({ user }) {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    fetchMyApplications();
  }, []);

  const fetchMyApplications = async () => {
    const res = await fetch(`http://localhost:5000/api/seeker/applications/${user.id}`);
    const data = await res.json();
    setApplications(data);
  };

  const getStatusColor = (status) => {
    const colors = {
      applied: 'bg-blue-100 text-blue-800',
      reviewing: 'bg-yellow-100 text-yellow-800',
      interview: 'bg-purple-100 text-purple-800',
      rejected: 'bg-red-100 text-red-800',
      hired: 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <h2 className="text-2xl font-bold mb-6">My Applications</h2>
      <div className="space-y-4">
        {applications.length === 0 ? (
          <p className="text-gray-500">You haven't applied to any jobs yet.</p>
        ) : (
          applications.map(app => (
            <div key={app.id} className="bg-white p-6 border border-gray-200 rounded-xl flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg">{app.title}</h3>
                <p className="text-gray-600">{app.company} • {app.location}</p>
                <p className="text-sm text-gray-400 mt-1">Applied on {new Date(app.applied_at).toLocaleDateString()}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(app.status)}`}>
                {app.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}