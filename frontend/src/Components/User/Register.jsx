import React from 'react';
import { useNavigate } from 'react-router-dom';
import MetaData from '../Layout/MetaData';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';


const Register = () => {
    const navigate = useNavigate();


    // Validation schema
    const validationSchema = Yup.object({
        name: Yup.string()
            .required('Name is required')
            .min(3, 'Name must be at least 3 characters long')
            .matches(/^[A-Za-z\s]+$/, 'Name must not contain numbers'),
        email: Yup.string()
            .email('Invalid email format')
            .matches(/@.+\.com$/, 'Email must include @something.com')
            .required('Email is required'),
        password: Yup.string()
            .required('Password is required')
            .min(8, 'Password must be at least 8 characters long'),
    });


    const register = async (values, { resetForm, setSubmitting, setFieldError }) => {
        try {
            const { data } = await axios.post(
                'http://localhost:5000/api/auth/register',
                values,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );


            console.log(data.user);
            resetForm(); // Clear the form
            navigate('/login'); // Redirect after successful registration
        } catch (error) {
            const errorMsg = error.response?.data?.error || 'An error occurred';
            setFieldError('email', errorMsg); // Set the error on the email field
            console.error(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };


    return (
        <>
            <MetaData title={'Register'} />
            <div className="row wrapper">
                <div className="col-10 col-lg-5">
                    <Formik
                        initialValues={{ name: '', email: '', password: '' }}
                        validationSchema={validationSchema}
                        onSubmit={register}
                    >
                        {({ isSubmitting }) => (
                            <Form className="shadow-lg">
                                <h1 className="mb-3">Register</h1>


                                <div className="form-group">
                                    <label htmlFor="name_field">Name</label>
                                    <Field
                                        type="text"
                                        id="name_field"
                                        name="name"
                                        className="form-control"
                                    />
                                    <ErrorMessage name="name" component="div" className="text-danger" />
                                </div>


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


                                <button
                                    type="submit"
                                    className="btn btn-block py-3"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'REGISTERING...' : 'REGISTER'}
                                </button>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </>
    );
};


export default Register;


