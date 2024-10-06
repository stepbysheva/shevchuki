import React, { useState } from 'react';
import { auth } from '../components/firebase';
import './LoginPage.css';
import {useNavigate} from "react-router-dom";
import { signInWithEmailAndPassword } from 'firebase/auth';
import {enqueueSnackbar, useSnackbar} from "notistack";
import CustomSnackbarContent from "../components/snackbar";


const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Use navigate hook for redirection
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const handleLogin = async (e) => {
    e.preventDefault();

      await signInWithEmailAndPassword(auth, email, password);
      enqueueSnackbar('Successfully logged in!', {
        content: (key) => (
          <CustomSnackbarContent
            message="Successfully logged in!"
          />
        ),
      });
      navigate('/')
      // Redirect or perform other actions after successful login
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <h2>Login</h2>
        <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
        />
        <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
        />
        {error && <p className="error-text">{error}</p>}
        <button type="submit" style={{marginBottom: '2vh', width: '305px'}} >Login</button>
      </form>
    </div>
  );
};

export default LoginPage;