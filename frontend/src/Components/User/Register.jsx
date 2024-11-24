import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MetaData from '../Layout/MetaData'; // Ensure this is defined
import axios from 'axios';

const Register = () => {
    const [user, setUser] = useState({
        name: '',
        email: '',
        password: '',
    });

    const { name, email, password } = user;

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    let navigate = useNavigate();

    useEffect(() => {
        if (error) {
            console.log(error);
            setError('');
        }
    }, [error, navigate]);

    const submitHandler = (e) => {
        e.preventDefault();
        const userData = new FormData();
        userData.append('name', name);
        userData.append('email', email);
        userData.append('password', password);

        register(userData);
    };
    const register = async (userData) => {
        try {
            setLoading(true);
            const { data } = await axios.post(
                'http://localhost:5000/api/auth/register', 
                userData, // Send as JSON directly
                {
                    headers: {
                        'Content-Type': 'application/json', // Set content type to JSON
                    },
                }
            );
            console.log(data.user);
    
            setLoading(false);
            setUser({ name: '', email: '', password: '' });
            navigate('/login'); // Redirect to login or home after registration
        } catch (error) {
            setLoading(false);
            setUser({ name: '', email: '', password: '' });
            setError(error.response?.data?.error || 'An error occurred');
            console.log(error.response?.data?.error || error);
        }
    };
    

    return (
        <>
            <MetaData title={'Register'} />
            <div className="row wrapper">
                <div className="col-10 col-lg-5">
                    <form className="shadow-lg" onSubmit={submitHandler} encType='multipart/form-data'>
                        <h1 className="mb-3">Register</h1>

                        <div className="form-group">
                            <label htmlFor="name_field">Name</label>
                            <input
                                type="text"
                                id="name_field"
                                className="form-control"
                                name='name'
                                value={name}
                                onChange={(e) => setUser({ ...user, name: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email_field">Email</label>
                            <input
                                type="email"
                                id="email_field"
                                className="form-control"
                                name='email'
                                value={email}
                                onChange={(e) => setUser({ ...user, email: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password_field">Password</label>
                            <input
                                type="password"
                                id="password_field"
                                className="form-control"
                                name='password'
                                value={password}
                                onChange={(e) => setUser({ ...user, password: e.target.value })}
                            />
                        </div>

                        <button
                            id="register_button"
                            type="submit"
                            className="btn btn-block py-3"
                            disabled={loading}
                        >
                            {loading ? 'REGISTERING...' : 'REGISTER'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default Register;
