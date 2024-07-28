import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { signin } from '../actions/authActions';
import './Signin.css'; // Ensure you have the corresponding CSS file

const Signin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error, isAuthenticated } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(signin(formData));
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/Socialize'); // Change this to the route you want to navigate after signing in
    }
  }, [isAuthenticated, navigate]);

  return (
    <div id="outerContainer">
      <div id="signinContainer">
        <h1 id="header">Socialize</h1>
        <h2 id="subtitle">Welcome to Socialize!</h2>
        {error && <p id="error">{error}</p>}
        <form onSubmit={handleSubmit} id="form">
          <input
            type="email"
            placeholder="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="input"
            required
          />
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="input"
            required
          />
          <button type="submit" className="button">SIGN IN</button>
        </form>
        <p className="signupText">Don't have an account? <a href="/signup" className="signupLink">Register here.</a></p>
      </div>
    </div>
  );
};

export default Signin;
