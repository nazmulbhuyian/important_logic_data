import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';

const OrderTracking = ({ user }) => {
  const { socket } = useSocket();
  const [driverLocation, setDriverLocation] = useState(null);
  const [customerLocation, setCustomerLocation] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [orderId, setOrderId] = useState('order123');

  useEffect(() => {
    if (socket) {
      // Driver location updates (for customer)
      socket.on('ORDER_TRACKING_UPDATE', (data) => {
        if (data.userType === 'driver') {
          setDriverLocation({ lat: data.lat, lon: data.lon });
        }
      });

      // Customer location updates (for driver)
      socket.on('CUSTOMER_TRACKING_UPDATE', (data) => {
        if (data.userType === 'customer') {
          setCustomerLocation({ lat: data.lat, lon: data.lon });
        }
      });

      return () => {
        socket.off('ORDER_TRACKING_UPDATE');
        socket.off('CUSTOMER_TRACKING_UPDATE');
      };
    }
  }, [socket]);

  const startTracking = () => {
    setIsTracking(true);
    
    // Start sending location updates
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition((position) => {
        const { latitude, longitude } = position.coords;
        
        if (user.role === 'DRIVER') {
          socket.emit('ORDER_TRACKING_UPDATE', {
            orderId,
            lat: latitude,
            lon: longitude
          });
        } else if (user.role === 'CUSTOMER') {
          socket.emit('CUSTOMER_TRACKING_UPDATE', {
            orderId, 
            lat: latitude,
            lon: longitude
          });
        }
      });
    }

    // Request current locations
    if (user.role === 'CUSTOMER') {
      socket.emit('ORDER_TRACKING_REQUEST', { orderId });
    } else if (user.role === 'DRIVER') {
      socket.emit('CUSTOMER_TRACKING_REQUEST', { orderId });
    }
  };

  const stopTracking = () => {
    setIsTracking(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Live Order Tracking</h2>
        
        {/* Tracking Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-lg font-semibold">Order: {orderId}</span>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              isTracking ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {isTracking ? 'Live Tracking ON' : 'Tracking OFF'}
            </span>
          </div>
          
          {!isTracking ? (
            <button
              onClick={startTracking}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition duration-200"
            >
              Start Tracking
            </button>
          ) : (
            <button
              onClick={stopTracking}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition duration-200"
            >
              Stop Tracking
            </button>
          )}
        </div>

        {/* Map Simulation */}
        <div className="bg-gray-200 rounded-lg h-96 relative overflow-hidden mb-4">
          {/* This is a simplified map simulation */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100">
            {/* Driver Marker */}
            {driverLocation && (
              <div 
                className="absolute w-8 h-8 bg-red-500 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
                style={{ 
                  left: '70%', 
                  top: '60%',
                  animation: 'pulse 2s infinite'
                }}
                title="Driver"
              >
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                  Driver
                </span>
              </div>
            )}

            {/* Customer Marker */}
            {customerLocation && (
              <div 
                className="absolute w-8 h-8 bg-blue-500 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2"
                style={{ 
                  left: '30%', 
                  top: '40%' 
                }}
                title="Customer"
              >
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                  Customer
                </span>
              </div>
            )}

            {/* Connection Line */}
            {driverLocation && customerLocation && (
              <div className="absolute inset-0">
                <div 
                  className="absolute h-1 bg-purple-500 transform origin-left"
                  style={{
                    left: '30%',
                    top: '40%',
                    width: '40%',
                    transform: 'rotate(45deg)',
                    opacity: 0.6
                  }}
                ></div>
              </div>
            )}
          </div>
        </div>

        {/* Location Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Driver Location</h3>
            {driverLocation ? (
              <p className="text-sm">
                Lat: {driverLocation.lat?.toFixed(6)}<br/>
                Lon: {driverLocation.lon?.toFixed(6)}
              </p>
            ) : (
              <p className="text-sm text-gray-500">No location data</p>
            )}
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Customer Location</h3>
            {customerLocation ? (
              <p className="text-sm">
                Lat: {customerLocation.lat?.toFixed(6)}<br/>
                Lon: {customerLocation.lon?.toFixed(6)}
              </p>
            ) : (
              <p className="text-sm text-gray-500">No location data</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;