import React, { useState, useEffect } from 'react';

// Task 1: Import urlConfig from `giftlink-frontend/src/config.js
import {urlConfig} from '../../config';

// Task 2: Import useAppContext `giftlink-frontend/context/AuthContext.js`
import { useAppContext } from '../../context/AuthContext';

// Task 3: Import useNavigate from `react-router-dom` to handle navigation after successful registration.
import { useNavigate } from 'react-router-dom';

import './LoginPage.css';

function LoginPage() {
    //insert code here to create useState hook variables for email, password
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Do these tasks inside the RegisterPage function after the useStates definition
    // Task 4: Include a state for incorrect password.
    const [errorMsg, setErrorMsg ] = useState('');

    // Task 5: Create a local variable for `navigate`,`bearerToken`   and `setIsLoggedIn`.
    const navigate = useNavigate();
    const bearerToken = sessionStorage.getItem('bearer-token');
    const { setIsLoggedIn } = useAppContext();

    // Task 6. If the bearerToken has a value (user already logged in), navigate to MainPage
    useEffect(() => {
        if (sessionStorage.getItem('auth-token')) {
            navigate('/app');
        }
    }, [navigate]);


    // insert code here to create handleLogin function and include console.log
    const handleLogin = async (e) => {
        e.preventDefault();
        console.log("Login invoked");

        //Step 1: Implement API call
        const fetchLogin = async() => {
            try {
                let url = `${urlConfig.backendUrl}/api/auth/login`;
                console.log(`fetchLogin: ${url}`);
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                        'Authorization': bearerToken ? `Bearer ${bearerToken}` : "",
                    },
                    body: JSON.stringify({
                        email, password
                    })
                });

                if (!response.ok) {
                    //something went wrong
                    throw new Error(`HTTP error; ${response.status}`)
                }

                // Step 2: Access data, login, set the AuthContext and set user details
                // Task 1: Access data coming from fetch API
                const json = await response.json();

                // Task 2: Set user details
                if (json.authtoken) {
                    setErrorMsg('');
                    sessionStorage.setItem('auth-token', json.authtoken);
                    sessionStorage.setItem('name', json.userName);
                    sessionStorage.setItem('email', json.userEmail);

                    // Task 3: Set the user's state to log in using the `useAppContext`.
                    setIsLoggedIn(true);
                    
                    // Task 4: Navigate to the MainPage after logging in.
                    navigate('/app');
                } 
                
                // Task 5: Clear input and set an error message if the password is incorrect
                if (json.error) {
                    document.getElementById("email").value = "";
                    document.getElementById("password").value = "";
                    setErrorMsg(json.error);

                    // Below is optional, but recommended - Clear out error message after 4 seconds
                    setTimeout(() => { setErrorMsg(""); }, 4000);
                }
            } catch (error) {
                console.log('Fetch error: ' + error.message);
            }
        }

        fetchLogin();

        //Step 2: Access data and set user details
    }
        return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="login-card p-4 border rounded">
              <h2 className="text-center mb-4 font-weight-bold">Login</h2>
                {/* // Task 6: Display error message to enduser. */}
                <span style={{color:'red',height:'.5cm',display:'block',fontStyle:'italic',fontSize:'12px'}}>{errorMsg}</span>

                {/* insert code here to create input elements for the variables email and  password */}
                <div className="mb-4">
                    <label htmlFor="email" className="form label"> Email</label>
                    <input
                        id="email"
                        type="email"
                        className="form-control"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="password" className="form label"> Password</label>
                    <input
                        id="password"
                        type="password"
                        className="form-control"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                
                {/* insert code here to create a button that performs the `handleLogin` function on click */}
                <button className="btn btn-primary w-100 mb-3" onClick={handleLogin}>Login</button>
                         
                <p className="mt-4 text-center">
                    New here? <a href="/app/register" className="text-primary">Register Here</a>
                </p>
            </div>
          </div>
        </div>
      </div>
    )
}
export default LoginPage;