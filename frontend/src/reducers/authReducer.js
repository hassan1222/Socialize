// reducers/authReducer.js
import {
  SIGNUP_SUCCESS,
  SIGNUP_FAIL,
  SIGNIN_SUCCESS,
  SIGNIN_FAIL,
  LOGOUT
} from '../actions/types';

const initialState = {
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  user: null,
  error: null,
  role: null // Add role to state
};

export default function authReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case SIGNUP_SUCCESS:
    case SIGNIN_SUCCESS:
      localStorage.setItem('token', payload.token);
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: payload.user,
        role: payload.role, // Store role
        error: null
      };
    case SIGNUP_FAIL:
    case SIGNIN_FAIL:
    case LOGOUT:
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
        role: null, // Clear role
        error: payload
      };
    default:
      return state;
  }
}
