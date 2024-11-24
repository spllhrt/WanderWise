import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import MetaData from '../Layout/MetaData';
import Loader from '../Layout/Loader';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { authenticate, getUser } from '../../utils/helpers';
import { GoogleLogin } from '@react-oauth/google';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';


const Login = () => {
    const location = useLocation();
    const navigate = useNavigate();


    const redirect = location.search ? new URLSearchParams(location.search).get('redirect') : '';


    const login = async (email, password) => {
        try {
            const config = { headers: { 'Content-Type': 'application/json' } };
            const { data } = await axios.post('http://localhost:5000/api/auth/login', { email, password }, config);


            if (data.user.role === 'user') {
                authenticate(data, () => navigate('/user-dashboard'));
            } else if (data.user.role === 'admin') {
                authenticate(data, () => navigate('/admin-dashboard'));
            } else {
                toast.error("You don't have the necessary privileges", { position: 'bottom-right' });
                navigate('/');
            }
        } catch (error) {
            toast.error("Invalid email or password", { position: 'bottom-right' });
        }
    };


    const handleGoogleLogin = async (response) => {
        try {
            const { credential } = response;
            const config = { headers: { 'Content-Type': 'application/json' } };


            const { data } = await axios.post('http://localhost:5000/api/auth/google-login', { token: credential }, config);


            if (data.user.role === 'user') {
                authenticate(data, () => navigate('/user-dashboard'));
            } else if (data.user.role === 'admin') {
                authenticate(data, () => navigate('/admin-dashboard'));
            } else {
                toast.error("You don't have the necessary privileges", { position: 'bottom-right' });
                navigate('/');
            }
        } catch (error) {
            toast.error("Google login failed", { position: 'bottom-right' });
        }
    };


    const validationSchema = Yup.object({
        email: Yup.string()
            .email('Invalid email format')
            .matches(/@.+\.com$/, 'Email format incorrect')
            .required('Email is required'),
        password: Yup.string().required('Password is required'),
    });


    return (
        <>
            <MetaData title="Login" />
            <div className="row wrapper">
                <div className="col-10 col-lg-5">
                    <Formik
                        initialValues={{ email: '', password: '' }}
                        validationSchema={validationSchema}
                        onSubmit={(values, { setSubmitting }) => {
                            login(values.email, values.password);
                            setSubmitting(false);
                        }}
                    >
                        {({ isSubmitting }) => (
                            <Form className="shadow-lg">
                                <h1 className="mb-3">Login</h1>
                                <div className="form-group">
                                    <label htmlFor="email_field">Email</label>
                                    <Field
                                        type="email"
                                        id="email_field"
                                        name="email"
                                        className="form-control"
                                    />
                                    <ErrorMessage name="email" component="div" className="text-danger" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="password_field">Password</label>
                                    <Field
                                        type="password"
                                        id="password_field"
                                        name="password"
                                        className="form-control"
                                    />
                                    <ErrorMessage name="password" component="div" className="text-danger" />
                                </div>
                                <Link to="/password/forgot" className="float-right mb-4">Forgot Password?</Link>
                                <button
                                    type="submit"
                                    className="btn btn-block py-3"
                                    disabled={isSubmitting}
                                >
                                    LOGIN
                                </button>
                                <p>Don't have an account? <Link to="/register" className="float-right mb-4">Register</Link></p>
                                <div className="my-3">
                                    <h6>Or Continue with Google</h6>
                                    <GoogleLogin
                                        onSuccess={handleGoogleLogin}
                                        onError={() => toast.error("Google login failed", { position: 'bottom-right' })}
                                    />
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </>
    );
};


export default Login;
