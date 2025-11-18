import React, { useState } from 'react';
import { SocketProvider } from './context/SocketContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import OrderTracking from './components/OrderTracking';
import ChatSystem from './components/ChatSystem';

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('login');

  // Mock login -实际项目中 API call করতে হবে
  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {currentView === 'login' && (
        <Login onLogin={handleLogin} />
      )}
      
      {currentView !== 'login' && user && (
        <SocketProvider user={user}>
          {/* Navigation Bar */}
          <nav className="bg-blue-600 text-white p-4 shadow-lg">
            <div className="container mx-auto flex justify-between items-center">
              <h1 className="text-2xl font-bold">Delivery Tracker</h1>
              <div className="flex items-center space-x-4">
                <span>Welcome, {user.fullName} ({user.role})</span>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setCurrentView('dashboard')}
                    className="bg-blue-500 hover:bg-blue-700 px-4 py-2 rounded"
                  >
                    Dashboard
                  </button>
                  <button 
                    onClick={() => setCurrentView('tracking')}
                    className="bg-green-500 hover:bg-green-700 px-4 py-2 rounded"
                  >
                    Tracking
                  </button>
                  <button 
                    onClick={() => setCurrentView('chat')}
                    className="bg-purple-500 hover:bg-purple-700 px-4 py-2 rounded"
                  >
                    Messages
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-700 px-4 py-2 rounded"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <div className="container mx-auto p-4">
            {currentView === 'dashboard' && <Dashboard user={user} />}
            {currentView === 'tracking' && <OrderTracking user={user} />}
            {currentView === 'chat' && <ChatSystem user={user} />}
          </div>
        </SocketProvider>
      )}
    </div>
  );
}

export default App;