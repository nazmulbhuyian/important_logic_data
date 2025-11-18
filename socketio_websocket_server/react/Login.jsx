import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'CUSTOMER'
  });

  // Mock users for demonstration
  const mockUsers = {
    CUSTOMER: {
      id: 'customer123',
      fullName: 'John Customer',
      email: 'customer@example.com',
      role: 'CUSTOMER',
      token: 'mock-customer-token'
    },
    DRIVER: {
      id: 'driver123', 
      fullName: 'Mike Driver',
      email: 'driver@example.com',
      role: 'DRIVER',
      token: 'mock-driver-token'
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    //在实际项目中, এখানে API call করতে হবে
    const user = mockUsers[formData.role];
    if (user) {
      onLogin(user);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-600">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Delivery Tracker
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="CUSTOMER">Customer</option>
              <option value="DRIVER">Driver</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition duration-200 font-semibold"
          >
            Login
          </button>
        </form>

        <div className="mt-6 p-4 bg-yellow-50 rounded-md">
          <p className="text-sm text-yellow-800 text-center">
            <strong>Demo Credentials:</strong><br/>
            Select role and click Login (No actual credentials needed)
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;