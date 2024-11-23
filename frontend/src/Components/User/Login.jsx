import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import MetaData from '../Layout/MetaData';
import Loader from '../Layout/Loader';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { authenticate, getUser } from '../../utils/helpers';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const redirect = location.search ? new URLSearchParams(location.search).get('redirect') : '';

    const login = async (email, password) => {
        try {
            setLoading(true); // Set loading state
            const config = { headers: { 'Content-Type': 'application/json' } };
            const { data } = await axios.post('http://localhost:5000/api/auth/login', { email, password }, config);

            // Redirect based on user role
            if (data.user.role === 'user') {
                authenticate(data, () => navigate('/user-dashboard')); // Redirect to /user-dashboard for role `user`
            } else if (data.user.role === 'admin') {
                authenticate(data, () => navigate('/admin-dashboard')); // Redirect to /admin-dashboard for role `admin`
            } else {
                toast.error("You don't have the necessary privileges", { position: 'bottom-right' });
                navigate('/'); // Redirect to home for any other role
            }
        } catch (error) {
            toast.error("Invalid email or password", { position: 'bottom-right' });
        } finally {
            setLoading(false);
        }
    };

    
    const submitHandler = (e) => {
        e.preventDefault();
        login(email, password);
    };

    useEffect(() => {
        // Redirect to a specific page if logged in and `redirect` is set
        if (getUser() && redirect === 'shipping') {
            navigate(`/${redirect}`);
        }
    }, [redirect, navigate]);

    return (
        <>
            {loading ? <Loader /> : (
                <>
                    <MetaData title="Login" />
                    <div className="row wrapper">
                        <div className="col-10 col-lg-5">
                            <form className="shadow-lg" onSubmit={submitHandler}>
                                <h1 className="mb-3">Login</h1>
                                <div className="form-group">
                                    <label htmlFor="email_field">Email</label>
                                    <input
                                        type="email"
                                        id="email_field"
                                        className="form-control"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="password_field">Password</label>
                                    <input
                                        type="password"
                                        id="password_field"
                                        className="form-control"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                                <Link to="/password/forgot" className="float-right mb-4">Forgot Password?</Link>
                                <button id="login_button" type="submit" className="btn btn-block py-3">
                                    LOGIN
                                </button>
                                <p>Don't have an account? <Link to="/register" className="float-right mb-4">Register</Link></p>
                                <div className="my-3">
                                    <h6>Or Continue with Google</h6>
                                    <GoogleLogin
                                        onSuccess={response => console.log('Google login success:', response)}
                                        onError={() => toast.error("Google login failed", { position: 'bottom-right' })}
                                    />
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default Login;
