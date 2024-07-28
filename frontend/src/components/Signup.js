import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { signup } from '../actions/authActions';
import './Signup.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    location: '',
    occupation: '',
    picture: null, // Change to null for file
  });

  const [notification, setNotification] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error, isAuthenticated } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, picture: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(signup(formData));
  };

  useEffect(() => {
    if (isAuthenticated) {
      setNotification('Registration successful! Redirecting to login page...');
      setTimeout(() => {
        navigate('/signin');
      }, 3000);
    } else if (error) {
      setNotification(`Error: ${error}`);
    }
  }, [isAuthenticated, error, navigate]);

  return (
    <div id="outerContainer">
      <div id="signupContainer">
        <h1 id="header">Socialize</h1>
        {error && <p id="error">{error}</p>}
        {notification && <p id="notification">{notification}</p>}
        <form onSubmit={handleSubmit} id="form">
          <div id="row">
            <input
              type="text"
              placeholder="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="input"
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="input"
              required
            />
          </div>
          <input
            type="text"
            placeholder="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="input"
          />
          <input
            type="text"
            placeholder="Occupation"
            name="occupation"
            value={formData.occupation}
            onChange={handleChange}
            className="input"
          />
          <div className="fileUpload">
            <input
              type="file"
              onChange={handleFileChange}
              className="fileInput"
              accept="image/*"
            />
            <button
              type="button"
              onClick={() => document.querySelector('.fileInput').click()}
              className="uploadButton"
            >
              Upload
            </button>
            <span className="filePath">{formData.picture ? formData.picture.name : 'No file chosen'}</span>
          </div>
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
          <button type="submit" className="button">REGISTER</button>
        </form>
        <p className="loginText">
          Already have an account? <a href="/signin" className="loginLink">Login here.</a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
