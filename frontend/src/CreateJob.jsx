import React, { useState } from 'react';

export default function CreateJob({ onJobCreated, user }) {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    salary_range: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // We hardcode recruiter_id to 1 for now until we build the Login system
    const payload = { ...formData, recruiter_id: user.id};

    try {
      const res = await fetch('http://localhost:5000/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        alert('Job posted successfully!');
        onJobCreated(); // Switches the view back to the job list
      } else {
        alert('Failed to post job. Check terminal for errors.');
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Post a New Job</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
          <input type="text" name="title" required onChange={handleChange} placeholder="e.g. Senior React Developer" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input type="text" name="company" required onChange={handleChange} placeholder="Acme Corp" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input type="text" name="location" required onChange={handleChange} placeholder="Remote, India" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
          <input type="text" name="salary_range" onChange={handleChange} placeholder="₹12LPA - ₹20LPA" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
          <textarea name="description" required rows="5" onChange={handleChange} placeholder="Describe the responsibilities and requirements..." className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"></textarea>
        </div>

        <div className="pt-4">
          <button type="submit" className="w-full bg-gray-900 text-white font-semibold px-6 py-3 rounded-lg hover:bg-gray-800 transition">
            Publish Job Post
          </button>
        </div>
      </form>
    </div>
  );
}