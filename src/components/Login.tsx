"use client";

import React, { useState } from 'react';
import { MapPin, Camera } from 'lucide-react';

export default function Login({ onLogin }: { onLogin: (user: { username: string, nickname: string, phone: string }) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  
  // Form fields
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !phone) return;
    if (!isLogin && !nickname) return; // Require nickname only on signup for this simple demo
    
    // In a real app, you would verify credentials with a backend here.
    onLogin({
      username,
      nickname: nickname || username, // fallback
      phone
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row">
        
        {/* Left Side: Image & Branding */}
        <div className="md:w-1/2 bg-blue-600 relative p-8 text-white flex flex-col justify-center items-center min-h-[300px]">
          <div className="absolute inset-0 opacity-20">
            <img 
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=800&fit=crop" 
              alt="Map Background" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative z-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white text-blue-600 rounded-full mb-6 shadow-lg">
              <MapPin size={32} />
            </div>
            <h1 className="text-4xl font-extrabold mb-2">CrazyGo</h1>
            <p className="text-blue-100 text-lg mb-8">Drop your snaps on the map and leave your mark on the world.</p>
            
            <div className="flex gap-4 justify-center">
              <Camera size={24} className="text-blue-200" />
              <MapPin size={24} className="text-blue-200" />
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-1/2 p-8 md:p-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {isLogin ? 'Welcome Back!' : 'Create your Account'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input 
                type="text" 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black bg-white"
                placeholder="Enter your username"
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nickname (shown on map)</label>
                <input 
                  type="text" 
                  required={!isLogin}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black bg-white"
                  placeholder="e.g. CrazyExplorer"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input 
                type="tel" 
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black bg-white"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg mt-6"
            >
              {isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center text-gray-600 text-sm">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 font-bold hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
