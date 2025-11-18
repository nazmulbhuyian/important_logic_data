// import Dashboard from "../components/Dashboard/Dashboard";

import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthProvider";
import { SocketProvider } from "../context/SocketContext";
import Dashboard from "./Dashboard";
import OrderTracking from "./OrderTracking";
import ChatSystem from "./ChatSystem";

// const Home = () => {
//   return (
//     <div className="">
//       <div>
//         <Dashboard />
//       </div>
//     </div>
//   );
// };

// export default Home;

const Home = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const { user, loading } = useContext(AuthContext);
  return (
    <div className="min-h-screen bg-gray-100">
      
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
};

export default Home;
