import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';

const ChatSystem = ({ user }) => {
  const { socket } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [receiverId, setReceiverId] = useState('');
  const messagesEndRef = useRef(null);

  // Mock users for chat
  const mockUsers = {
    customer123: { id: 'customer123', fullName: 'John Customer', role: 'CUSTOMER' },
    driver123: { id: 'driver123', fullName: 'Mike Driver', role: 'DRIVER' }
  };

  useEffect(() => {
    if (socket) {
      // New message received
      socket.on('MESSAGE', (message) => {
        setMessages(prev => [...prev, message]);
      });

      // Conversations list
      socket.on('MESSAGE_LIST', (messageList) => {
        setConversations(messageList);
      });

      // Fetch conversations
      socket.emit('MESSAGE_LIST');

      return () => {
        socket.off('MESSAGE');
        socket.off('MESSAGE_LIST');
      };
    }
  }, [socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const startChat = (receiverId) => {
    setReceiverId(receiverId);
    setActiveChat(mockUsers[receiverId]);
    
    // Fetch chat history
    socket.emit('FETCH_CHATS', { receiverId });
    socket.on('FETCH_CHATS', (chats) => {
      setMessages(chats);
    });
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !receiverId) return;

    socket.emit('MESSAGE', {
      receiverId,
      message: newMessage
    });

    setNewMessage('');
  };

  const getOtherUser = () => {
    if (user.role === 'CUSTOMER') return mockUsers.driver123;
    return mockUsers.customer123;
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      <div className="flex h-[600px]">
        {/* Conversations Sidebar */}
        <div className="w-1/3 border-r border-gray-200 bg-gray-50">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
          </div>
          
          <div className="overflow-y-auto h-full">
            {conversations.length > 0 ? (
              conversations.map((conv, index) => (
                <div
                  key={index}
                  onClick={() => startChat(conv.user.id)}
                  className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-white transition duration-200 ${
                    activeChat?.id === conv.user.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {conv.user.fullName?.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">
                        {conv.user.fullName}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
                        {conv.lastMessage?.message || 'No messages yet'}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                No conversations yet
              </div>
            )}
          </div>

          {/* Start New Chat */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => startChat(getOtherUser().id)}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200 font-semibold"
            >
              Chat with {getOtherUser().role.toLowerCase()}
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {activeChat.fullName?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {activeChat.fullName}
                    </h3>
                    <p className="text-sm text-gray-500 capitalize">
                      {activeChat.role.toLowerCase()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.senderId === user.id
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p className={`text-xs mt-1 ${
                        message.senderId === user.id ? 'text-blue-200' : 'text-gray-500'
                      }`}>
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 bg-white">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200 font-semibold"
                  >
                    Send
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-xl font-semibold mb-2">No chat selected</h3>
                <p>Select a conversation or start a new chat</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatSystem;