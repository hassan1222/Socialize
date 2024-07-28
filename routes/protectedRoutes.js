const express = require('express');
const { auth, checkRole } = require('../middleware/auth');

const router = express.Router();

// Public route
router.get('/public', (req, res) => res.send('Public route'));

// Protected route (only authenticated users)
router.get('/protected', auth, (req, res) => res.send('Protected route'));

// Admin route (only users with 'admin' role)
router.get('/admin', auth, checkRole(['admin']), (req, res) => res.send('Admin route'));

const ProtectedRoute = ({ children, roles }) => {
    const { isAuthenticated, role } = useSelector(state => state.auth);
  
    if (!isAuthenticated) {
      return <Navigate to="/signin" />;
    }
  
    if (roles && !roles.includes(role)) {
      return <Navigate to="/unauthorized" />;
    }
  
    return children;
  };
  
module.exports = router;
