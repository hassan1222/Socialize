import { combineReducers } from 'redux';
import authReducer from './authReducer'; // Ensure the path is correct

const rootReducer = combineReducers({
  auth: authReducer
});

export default rootReducer;
