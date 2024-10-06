import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext'; // Adjust the path to your AuthContext

const PrivateRoute = ({ element }) => {
  const { currentUser } = useContext(AuthContext);

  return currentUser ? element : <Navigate to="/login" />;
};

export default PrivateRoute;