import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import styles from '../CSS/Home.module.css';
import { UserContext } from '../components/UserContext';
import ProtectedRoute from '../components/ProtectedRoute';
import Travel from '../pages/Travel';

function Home() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [regUsername, setRegUsername] = useState('');

  useEffect(() => {
    fetch('https://website-backend-env.eba-6eqympxa.us-east-1.elasticbeanstalk.com/verify', {
      method: 'GET',
      credentials: 'include',  // include credentials to send the cookies
    })
    .then(response => response.json())
    .then(data => {
      if (data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    })
    .catch(err => {
      console.error('Error verifying token:', err);
      setUser(null);
    })
    .finally(() => {
      setIsLoading(false);  // set isLoading to false once the request is complete
    });
  }, [setUser]);
  

  const handleLogin = e => {
    e.preventDefault();
  
    fetch('https://website-backend-env.eba-6eqympxa.us-east-1.elasticbeanstalk.com/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      credentials: 'include',
    })
      .then(response => response.json())
      .then(data => {
        setUser(data.user);
        if (data.user) {
          navigate('/travel');
        }
      })
      .catch(err => console.error('Error logging in:', err));
  };
  
  const handleRegister = e => {
    e.preventDefault();
  
    fetch('https://website-backend-env.eba-6eqympxa.us-east-1.elasticbeanstalk.com/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: regEmail, username: regUsername, password: regPassword }),
      credentials: 'include',
    })
      .then(response => response.json())
      .then(data => {
        setUser(data.user);
      })
      .catch(err => console.error('Error registering:', err));
  };

  const handleLogout = () => {
    setUser(null);
    navigate('/'); // Redirect to home page
  };

  return (
    <div>
      <Routes>
        <Route
          path="/"
          element={
            <div className={styles.homeContainer}>
              {/* Login and registration forms */}
              <div className={styles.container}>
                <div className={styles.formContainer}>
                  <h1 className={styles.registerHeading}>Register</h1>
                  <form onSubmit={handleRegister}>
                    <input
                      type="email"
                      placeholder="Email"
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                    />
                    <input
                      type="username"
                      placeholder="Username"
                      value={regUsername}
                      onChange={e => setRegUsername(e.target.value)}
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                    />
                    <button type="submit">Register</button>
                  </form>
                </div>
                <div className={styles.formContainer}>
                  <h1 className={styles.loginHeading}>Login</h1>
                  <form onSubmit={handleLogin}>
                    <input
                      type="email"
                      placeholder="Email"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                    />
                    <button type="submit">Login</button>
                  </form>
                </div>
              </div>
              {user && (
                <div className={styles.userContainer}>
                  <h2>User</h2>
                  <p>Email: {user.email}</p>
                  <button onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          }
        />
        <Route
          path="/travel"
          element={
            <ProtectedRoute>
              <Travel />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default Home;
