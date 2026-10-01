"use client";

import { useState, useEffect } from "react";
import MapComponent from "@/components/Map";
import Login from "@/components/Login";

export default function Home() {
  const [user, setUser] = useState<{ username: string, nickname: string, phone: string } | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Avoid hydration mismatch by only rendering after mount
    setIsClient(true);
    // Simple mock persistence using localStorage
    const savedUser = localStorage.getItem('crazygo_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const handleLogin = (userData: { username: string, nickname: string, phone: string }) => {
    setUser(userData);
    localStorage.setItem('crazygo_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('crazygo_user');
  };

  if (!isClient) return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Loading...</div>;

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      {!user ? (
        <div className="w-full">
          <Login onLogin={handleLogin} />
        </div>
      ) : (
        <div className="w-full relative">
          <MapComponent currentUser={user} />
          <button 
            onClick={handleLogout}
            className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur text-red-600 px-4 py-2 rounded-lg shadow-md font-medium hover:bg-white transition-colors"
          >
            Logout
          </button>
        </div>
      )}
    </main>
  );
}
