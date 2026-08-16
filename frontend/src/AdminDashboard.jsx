import React, { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [data, setData] = useState({ users: [], jobs: [] });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await fetch('http://localhost:5000/api/admin/stats');
    const result = await res.json();
    setData(result);
  };

  const deleteUser = async (id) => {
    if(!window.confirm('Delete this user and all their data?')) return;
    await fetch(`http://localhost:5000/api/admin/users/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const deleteJob = async (id) => {
    if(!window.confirm('Delete this job?')) return;
    await fetch(`http://localhost:5000/api/jobs/${id}`, { method: 'DELETE' });
    fetchData();
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Admin Control Panel</h2>
      
      {/* Users Section */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h3 className="font-bold text-lg mb-4">Manage Users</h3>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b"><th className="pb-2">Name</th><th className="pb-2">Email</th><th className="pb-2">Role</th><th className="pb-2">Action</th></tr>
          </thead>
          <tbody>
            {data.users.map(u => (
              <tr key={u.id} className="border-b">
                <td className="py-2">{u.name}</td><td>{u.email}</td><td>{u.role}</td>
                <td><button onClick={() => deleteUser(u.id)} className="text-red-600 hover:underline">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Jobs Section */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h3 className="font-bold text-lg mb-4">Manage Jobs</h3>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b"><th className="pb-2">Title</th><th className="pb-2">Company</th><th className="pb-2">Action</th></tr>
          </thead>
          <tbody>
            {data.jobs.map(j => (
              <tr key={j.id} className="border-b">
                <td className="py-2">{j.title}</td><td>{j.company}</td>
                <td><button onClick={() => deleteJob(j.id)} className="text-red-600 hover:underline">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}