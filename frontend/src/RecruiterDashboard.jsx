import React, { useState, useEffect } from 'react';

export default function RecruiterDashboard({ user }) {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/recruiter/applications/${user.id}`);
      const data = await res.json();
      setApplications(data);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  const updateStatus = async (appId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/applications/${appId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        // Update the UI locally without refreshing
        setApplications(applications.map(app => 
          app.application_id === appId ? { ...app, status: newStatus } : app
        ));
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Applicant Dashboard</h2>
      
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-900 border-b border-gray-200">
            <tr>
              <th className="p-4 font-semibold">Candidate</th>
              <th className="p-4 font-semibold">Applied For</th>
              <th className="p-4 font-semibold">Resume</th>
              <th className="p-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-8 text-center text-gray-500">No applications received yet.</td>
              </tr>
            ) : (
              applications.map((app) => (
                <tr key={app.application_id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="p-4">
                    <p className="font-medium text-gray-900">{app.applicant_name}</p>
                    <p className="text-xs text-gray-500">{app.applicant_email}</p>
                  </td>
                  <td className="p-4 font-medium text-gray-800">{app.job_title}</td>
                  <td className="p-4">
                    <a href={app.resume_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                      View Resume ↗
                    </a>
                  </td>
                  <td className="p-4">
                    <select 
                      value={app.status} 
                      onChange={(e) => updateStatus(app.application_id, e.target.value)}
                      className="bg-white border border-gray-300 text-gray-700 rounded p-1.5 focus:outline-none focus:border-blue-500"
                    >
                      <option value="applied">Applied</option>
                      <option value="reviewing">Reviewing</option>
                      <option value="interview">Interview</option>
                      <option value="rejected">Rejected</option>
                      <option value="hired">Hired</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}