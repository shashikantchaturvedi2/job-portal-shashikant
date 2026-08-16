import React, { useState, useEffect } from 'react';

export default function JobList({ onApply, user }) {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async (searchQuery = '') => {
    try {
      const res = await fetch(`http://localhost:5000/api/jobs?search=${searchQuery}`);
      const data = await res.json();
      setJobs(data);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs(search);
  };

  // NEW: Function to handle deleting a job
  const handleDelete = async (jobId) => {
    // Add a confirmation so they don't click it by accident
    if (!window.confirm("Are you sure you want to delete this job post? This cannot be undone.")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/jobs/${jobId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        // Remove the job from the screen immediately without refreshing
        setJobs(jobs.filter(job => job.id !== jobId));
      } else {
        alert("Failed to delete the job.");
      }
    } catch (error) {
      console.error("Error deleting job:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-8 flex gap-2">
        <input 
          type="text" 
          placeholder="Search jobs by title or company..." 
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
          Find Jobs
        </button>
      </form>

      {/* Job Feed */}
      <div className="space-y-4">
        {jobs.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No jobs found. Try posting one!</p>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="bg-white p-6 border border-gray-200 rounded-xl hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{job.title}</h2>
                  <p className="text-gray-600 font-medium mt-1">{job.company}</p>
                  <div className="flex gap-4 mt-3 text-sm text-gray-500">
                    <span className="flex items-center">📍 {job.location}</span>
                    <span className="flex items-center">💰 {job.salary_range}</span>
                  </div>
                </div>
                
                {/* CONDITIONAL RENDERING: Delete for Recruiters, Apply for Seekers */}
                {user?.role === 'recruiter' ? (
                  <button 
                    onClick={() => handleDelete(job.id)}
                    className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition cursor-pointer border border-red-100"
                  >
                    Delete Job
                  </button>
                ) : (
                  <button 
                    onClick={() => onApply(job)}
                    className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition cursor-pointer"
                  >
                    Apply Now
                  </button>
                )}

              </div>
              <p className="mt-4 text-gray-600 text-sm line-clamp-2">{job.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}