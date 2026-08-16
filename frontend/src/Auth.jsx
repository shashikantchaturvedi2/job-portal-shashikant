import React, { useState } from 'react';

export default function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'seeker' 
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? '/api/login' : '/api/register';
    
    try {
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();

      if (res.ok) {
        if (isLogin) {
          // If login is successful, pass the user data to App.jsx
          onLogin(data.user, data.token);
        } else {
          alert('Registration successful! Please log in.');
          setIsLogin(true); // Switch to login view
        }
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Auth error:", error);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
        {isLogin ? 'Welcome Back' : 'Create an Account'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" name="name" required onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">I am a...</label>
              <select name="role" onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                <option value="seeker">Job Seeker</option>
                <option value="recruiter">Recruiter</option>
              </select>
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input type="email" name="email" required onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input type="password" name="password" required onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition">
          {isLogin ? 'Log In' : 'Sign Up'}
        </button>
      </form>

      <p className="text-center text-gray-600 mt-4 text-sm">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button onClick={() => setIsLogin(!isLogin)} className="text-blue-600 font-medium hover:underline">
          {isLogin ? 'Sign up' : 'Log in'}
        </button>
      </p>
    </div>
  );
}