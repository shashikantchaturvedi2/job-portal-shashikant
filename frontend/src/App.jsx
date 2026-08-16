import React, { useState } from 'react';
import JobList from './JobList';
import CreateJob from './CreateJob';
import ApplyJob from './ApplyJob';
import Auth from './Auth';
import RecruiterDashboard from './RecruiterDashboard';
import SeekerDashboard from './SeekerDashboard';
import AdminDashboard from './AdminDashboard';

function App() {
  const [currentView, setCurrentView] = useState('jobs'); 
  const [selectedJob, setSelectedJob] = useState(null);
  
  // Authentication State
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);

  const handleLogin = (user, jwtToken) => {
    setCurrentUser(user);
    setToken(jwtToken);
    setCurrentView('jobs');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setToken(null);
    setCurrentView('jobs');
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <header className="max-w-4xl mx-auto px-4 md:px-8 mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Tech Jobs Portal</h1>
          <p className="text-gray-500">Sign in to find or post jobs.</p>
        </header>
        <Auth onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <header className="max-w-5xl mx-auto px-4 md:px-8 mb-8 flex justify-between items-center border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tech Jobs Portal</h1>
          <p className="text-gray-500">
            Welcome, {currentUser.name} <span className="capitalize">({currentUser.role})</span>
          </p>
        </div>
        
        <div className="flex gap-4 items-center">
          {/* Seeker Navigation */}
          {currentUser.role === 'seeker' && (
            <button 
              onClick={() => setCurrentView('seeker-dashboard')} 
              className={`font-medium ${currentView === 'seeker-dashboard' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              My Applications
            </button>
          )}

          {/* Recruiter Navigation */}
          {currentUser.role === 'recruiter' && (
            <>
              <button 
                onClick={() => setCurrentView('dashboard')} 
                className={`font-medium ${currentView === 'dashboard' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Dashboard
              </button>
              {currentView === 'jobs' && (
                <button 
                  onClick={() => setCurrentView('create')} 
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  + Post a Job
                </button>
              )}
            </>
          )}

          {/* Admin Navigation */}
          {currentUser.role === 'admin' && (
            <button 
              onClick={() => setCurrentView('admin-dashboard')} 
              className={`font-medium ${currentView === 'admin-dashboard' ? 'text-purple-600' : 'text-gray-600 hover:text-purple-900'}`}
            >
              Admin Panel
            </button>
          )}

          {/* Universal Navigation */}
          {currentView !== 'jobs' && (
            <button 
              onClick={() => setCurrentView('jobs')} 
              className="text-gray-600 hover:text-gray-900 font-medium underline"
            >
              &larr; Back to Jobs
            </button>
          )}

          <button 
            onClick={handleLogout} 
            className="text-red-500 hover:text-white hover:bg-red-500 font-medium ml-4 border border-red-200 px-4 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto">
        {/* Dynamic View Rendering Based on State */}
        {currentView === 'jobs' && (
          <JobList 
            user={currentUser} 
            onApply={(job) => { 
              setSelectedJob(job); 
              setCurrentView('apply'); 
            }} 
          />
        )}
        
        {currentView === 'create' && (
          <CreateJob 
            user={currentUser} 
            onJobCreated={() => setCurrentView('jobs')} 
          />
        )}
        
        {currentView === 'apply' && (
          <ApplyJob 
            job={selectedJob} 
            user={currentUser} 
            onBack={() => setCurrentView('jobs')} 
          />
        )}
        
        {currentView === 'dashboard' && <RecruiterDashboard user={currentUser} />}
        
        {currentView === 'seeker-dashboard' && <SeekerDashboard user={currentUser} />}
        
        {currentView === 'admin-dashboard' && <AdminDashboard />}
      </main>
    </div>
  );
}

export default App;