import React, { useState } from 'react';

export default function ApplyJob({ job, onBack, user }) {
  const [resumeFile, setResumeFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resumeFile) return alert("Please upload a resume.");
    
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append('job_id', job.id);
    formData.append('seeker_id', user.id);
    formData.append('resume', resumeFile);

    try {
      const res = await fetch('http://localhost:5000/api/applications', {
        method: 'POST',
        body: formData 
      });
      
      const data = await res.json();
      if (res.ok) {
        alert('🎉 Application submitted successfully!');
        onBack();
      } else {
        alert(`Failed: ${data.error}`);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
      <button onClick={onBack} className="text-gray-500 hover:text-gray-900 text-sm mb-4 font-medium">&larr; Back to Jobs</button>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Apply for {job.title}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Upload Resume (PDF/DOC)</label>
          <input 
            type="file" 
            accept=".pdf,.doc,.docx"
            required 
            onChange={(e) => setResumeFile(e.target.files[0])} 
            className="w-full p-2 border border-gray-300 rounded-lg" 
          />
        </div>
        <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
          {isSubmitting ? 'Uploading...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
}