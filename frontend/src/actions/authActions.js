// actions/authActions.js
import axios from 'axios';
import {
  SIGNUP_SUCCESS,
  SIGNUP_FAIL,
  SIGNIN_SUCCESS,
  SIGNIN_FAIL,
  LOGOUT
} from './types';


export const signup = (formData) => async (dispatch) => {
  try {
    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }

    const res = await axios.post('http://localhost:5000/api/users/signup', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });

    dispatch({
      type: SIGNUP_SUCCESS,
      payload: res.data
    });
  } catch (error) {
    dispatch({
      type: SIGNUP_FAIL,
      payload: error.response.data.message || 'Signup failed'
    });
  }
};

export const signin = (userData) => async (dispatch) => {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/signin', userData);
    dispatch({
      type: SIGNIN_SUCCESS,
      payload: res.data
    });
  } catch (error) {
    dispatch({
      type: SIGNIN_FAIL,
      payload: error.response.data.message
    });
  }
};


export const logout = () => (dispatch) => {
  // Remove the token from local storage
  localStorage.removeItem('token');

  // Dispatch the logout action
  dispatch({ type: LOGOUT });
};

