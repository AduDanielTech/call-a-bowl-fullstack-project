// Registration.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Registration({ setIsAuthenticated }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  const handleRegistration = async () => {
    try {
      const response = await axios.post('/api/register', {
        username,
        password,
        code,
      });

      setIsAuthenticated(true);
      console.log(response);

      // Assuming your backend returns a success message in the response
      if (response.data.message === 'User registered successfully') {
        // Redirect to the admin page after successful registration
        return navigate('/admin');
      } else {
        console.error('Registration failed'); // Handle other possible responses
      }
    } catch (error) {
      // Check if error.response exists and has the expected structure
      if (error.response && error.response.data && error.response.data.error) {
        console.error(error.response.data.error);
      } else {
        console.error('An unknown error occurred');
      }
    }
  };

  return (
    <div>
      <h1>Registration</h1>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        type="text"
        placeholder="Code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <button onClick={handleRegistration}>Register</button>
      <a href="/login">Login instead</a>
    </div>
  );
}

export default Registration;
