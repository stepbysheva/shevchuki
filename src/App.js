import React from 'react';
import {BrowserRouter as Router, Route, Routes, useLocation} from 'react-router-dom';
import LoginPage from "./pages/LoginPage";


import { AuthProvider } from './components/AuthContext'; // Adjust path to your AuthContext
import PrivateRoute from './components/PrivateRoute'; // Adjust path to your PrivateRoute
import PublicRoute from './components/PublicRoute';
import {SnackbarProvider} from "notistack";
import {Slide} from "@mui/material";
import Scrabble from "./pages/Scrabble";
import Home from "./pages/HomePage";
import Gallery from "./pages/Gallery";
import Videos from "./pages/Videos";

const App = () => {
  const Layout = ({ children }) => {
    const location = useLocation();

    // Define paths where the header should be hidden
    const hideHeaderRoutes = ['/login', '/signup', '/login/', '/signup/'];

    return (
      <>
        {children}
      </>
    );
  };

  return (
    <AuthProvider>
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        autoHideDuration={1800}
        TransitionComponent={Slide} // Use Slide transition
        hideIconVariant={false} // Optional: hides icons for default variants
        preventDuplicate // Prevent multiple identical toasts
        dense
      >
      <Router>
        <Layout>
          <Routes>
            <Route
              path="/scrabble"
              element={<PrivateRoute element={<Scrabble />} />}
            />
            <Route
              path="/login"
              element={<PublicRoute element={<LoginPage />} />}
            />
            <Route
              path="/"
              element={<PrivateRoute element={<Home />} />}
            />
            <Route
              path="/gallery"
              element={<PrivateRoute element={<Gallery />} />}
            />
            <Route
              path="/videos"
              element={<PrivateRoute element={<Videos />} />}
            />
          </Routes>
        </Layout>
      </Router>
      </SnackbarProvider>
    </AuthProvider>
  );
};

export default App;