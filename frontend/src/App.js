import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import Signup from './components/Signup';
import Signin from './components/Signin';
import Socialize from './components/Socialize/Socialize';
import AdminPage from './components/AdminPage'; // Example admin page
import ProtectedRoute from './components/ProtectedRoute';
import Chat from './components/Chat';

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/chat" element={<ProtectedRoute><Chat/></ProtectedRoute>} />
          <Route path="/Socialize" element={
  <ProtectedRoute>
    <Socialize />
  </ProtectedRoute>
} />

          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminPage/></ProtectedRoute>} />
          {/* Add more routes as needed */}
        </Routes>
      </Router>
    </Provider>
  );
};

export default App;

