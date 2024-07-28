import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';

const Chat = () => {
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [chatData, setChatData] = useState([]);
  const location = useLocation();
  const currentUser = location.state?.currentUser;
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:5000', {
      auth: { token: localStorage.getItem('token') }
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket.IO connected');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
    });

    newSocket.on('receiveMessage', (messageData) => {
      console.log('Message received:', messageData);
      if (selectedUser && selectedUser._id === messageData.senderId) {
        setChatData((prev) => [...prev, messageData]);
      }
    });

    return () => newSocket.close();
  }, [selectedUser]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/auth/all');
        const filteredUsers = response.data.filter(user => user._id !== currentUser._id);
        setUsers(filteredUsers);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };

    fetchUsers();
  }, [currentUser]);

  useEffect(() => {
    if (selectedUser) {
      const fetchChatData = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/api/chats/${currentUser._id}/${selectedUser._id}`);
          setChatData(response.data);
        } catch (err) {
          console.error('Error fetching chat data:', err);
        }
      };

      fetchChatData();
    }
  }, [selectedUser]);

  const handleUserClick = (user) => {
    setSelectedUser(user);
  };

  const handleSendMessage = () => {
    if (message.trim() && selectedUser && socket) {
      socket.emit('sendMessage', {
        recipientId: selectedUser._id,
        message,
      });
      console.log('Message sent:', { recipientId: selectedUser._id, message });

      setChatData((prev) => [
        ...prev,
        { senderId: currentUser._id, message, time: new Date().toISOString() },
      ]);

      setMessage('');
    }
  };

  return (
    <div className="chat-container">
      <div className="sidebar">
        <div className="search-container">
          <input type="text" placeholder="Search" className="search-input" />
          <span className="search-icon">🔍</span>
        </div>
        <div className="chats-section">
          <h2>You</h2>
          {currentUser && (
            <div className="chat-item">
              <img src={currentUser.picturePath ? `http://localhost:5000/${currentUser.picturePath}` : '/default-profile.png'} alt="Profile" className="add-image" />
              <span>{currentUser.firstName} {currentUser.lastName}</span>
            </div>
          )}
          <h2>Chats</h2>
          {users.map((user) => (
            <div
              key={user._id}
              className={`chat-item ${selectedUser?._id === user._id ? 'selected' : ''}`}
              onClick={() => handleUserClick(user)}
            >
              <img src={user.picturePath ? `http://localhost:5000/${user.picturePath}` : '/default-profile.png'} alt="Profile" className="add-image" />
              <span>{user.firstName} {user.lastName}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="chat-area">
        <div className="chat-header">
          {selectedUser && (
            <>
              <img src={selectedUser.picturePath ? `http://localhost:5000/${selectedUser.picturePath}` : '/default-profile.png'} alt="Profile" className="image" />
              <h1>{selectedUser.firstName} {selectedUser.lastName}</h1>
            </>
          )}
          {!selectedUser && <h1>Select a user to chat</h1>}
          <div className="header-icons">
            <span className="icon">🌙</span>
            <span className="icon">⚙️</span>
          </div>
        </div>
        <div className="messages">
          {chatData.map((chat, index) => (
            <div key={index} className={`message ${chat.senderId === currentUser._id ? 'sent' : 'received'}`}>
              <div className="message-content">
                <p>{chat.message}</p>
                <span className="message-time">{new Date(chat.time).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
        </div>
        {selectedUser && (
          <div className="input-area">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write a message..."
              className="message-input"
            />
            <button className="send-button" onClick={handleSendMessage}>
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
