import React, { useContext } from 'react';
import { Route, Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext'; // Adjust path to your AuthContext

const PublicR = ({ element: Element, ...rest }) => {
  const { currentUser } = useContext(AuthContext);
  console.log(currentUser)
  return currentUser ? <Navigate to="/" /> : Element
};

export default PublicR;