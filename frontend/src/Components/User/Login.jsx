import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import MetaData from '../Layout/MetaData';
import Loader from '../Layout/Loader';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { authenticate } from '../../utils/helpers';
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
            <div className="login-container" style={styles.container}>
                <div className="login-form" style={styles.formContainer}>
                    {/* Logo Placeholder */}
                    <div style={styles.logoContainer}>
                        <img src="images/wanderwise.jpg" alt="WanderWise Logo" style={styles.logo} />
                    </div>


                    <h1 style={styles.title}>WanderWise Login</h1>


                    <Formik
                        initialValues={{ email: '', password: '' }}
                        validationSchema={validationSchema}
                        onSubmit={(values, { setSubmitting }) => {
                            login(values.email, values.password);
                            setSubmitting(false);
                        }}
                    >
                        {({ isSubmitting }) => (
                            <Form style={styles.form}>
                                <div className="form-group" style={styles.inputGroup}>
                                    <label htmlFor="email_field" style={styles.label}>Email</label>
                                    <Field
                                        type="email"
                                        id="email_field"
                                        name="email"
                                        className="form-control"
                                        style={styles.input}
                                    />
                                    <ErrorMessage name="email" component="div" style={styles.errorMessage} />
                                </div>
                                <div className="form-group" style={styles.inputGroup}>
                                    <label htmlFor="password_field" style={styles.label}>Password</label>
                                    <Field
                                        type="password"
                                        id="password_field"
                                        name="password"
                                        className="form-control"
                                        style={styles.input}
                                    />
                                    <ErrorMessage name="password" component="div" style={styles.errorMessage} />
                                </div>


                                <Link to="/password/forgot" style={styles.forgotPasswordLink}>
                                    Forgot Password?
                                </Link>


                                <button
                                    type="submit"
                                    className="btn btn-block py-3"
                                    style={styles.loginButton}
                                    disabled={isSubmitting}
                                >
                                    LOGIN
                                </button>


                                <p style={styles.registerText}>
                                    Don't have an account? <Link to="/register" style={styles.registerLink}>Register</Link>
                                </p>


                                <div className="my-3" style={styles.googleLoginContainer}>
                                    <h6 style={styles.orText}>Or Continue with Google</h6>
                                    <GoogleLogin
                                        onSuccess={handleGoogleLogin}
                                        onError={() => toast.error("Google login failed", { position: 'bottom-right' })}
                                        theme="outline"
                                        useOneTap
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


const styles = {
    container: {
        backgroundColor: '#E5E3D4',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '20px',
    },
    formContainer: {
        backgroundColor: '#9ABF80',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px',
    },
    logoContainer: {
        textAlign: 'center',
        marginBottom: '20px',
    },
    logo: {
        width: '120px',
        height: 'auto',
    },
    title: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#1C325B',
        marginBottom: '20px',
        textAlign: 'center',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
    },
    inputGroup: {
        marginBottom: '20px',
    },
    label: {
        fontWeight: 'bold',
        color: '#1C325B',
    },
    input: {
        width: '100%',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid #6A669D',
        marginTop: '5px',
        marginBottom: '5px',
    },
    errorMessage: {
        color: 'red',
        fontSize: '12px',
    },
    forgotPasswordLink: {
        color: '#6A669D',
        fontSize: '14px',
        textAlign: 'right',
        display: 'block',
        marginBottom: '10px',
    },
    loginButton: {
        backgroundColor: '#1C325B',
        color: 'white',
        padding: '12px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        marginBottom: '20px',
    },
    registerText: {
        textAlign: 'center',
        fontSize: '14px',
        color: '#1C325B',
    },
    registerLink: {
        color: '#6A669D',
        textDecoration: 'underline',
    },
    googleLoginContainer: {
        textAlign: 'center',
        marginTop: '20px',
    },
    orText: {
        fontSize: '16px',
        color: '#1C325B',
    },
};


export default Login;
