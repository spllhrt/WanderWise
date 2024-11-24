import React, { useEffect, useState } from 'react';
import './profile.css';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../../utils/helpers';
import { AppBar, Toolbar, Typography, Button, CircularProgress } from '@mui/material';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Fetch user data on component mount
    useEffect(() => {
        const loggedInUser = getUser();
        console.log('Logged in user:', loggedInUser);

        if (loggedInUser) {
            setUser(loggedInUser);
        } else {
            alert('Please log in.');
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user'); // Clear user data from localStorage
        alert('Logged out!');
        navigate('/login');
    };

    const validationSchema = Yup.object({
        name: Yup.string().required('Name is required'),
        email: Yup.string()
            .email('Invalid email address')
            .matches(/@.+\..+$/, 'Email must include a domain (e.g., @gmail.com)')
            .required('Email is required'),
    });

    const handleSaveChanges = async (values) => {
        if (!user || !user._id) {
            console.error('User ID is not available', user);
            alert('User ID is missing. Please log in again.');
            return;
        }
    
        setLoading(true); // Start loading state
    
        try {
            const response = await fetch(`http://localhost:5000/api/auth/user/${user._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`, // Include the token
                },
                body: JSON.stringify(values),
            });
    
            if (response.ok) {
                const updatedUser = await response.json();
                setUser(updatedUser.user);
                setIsEditing(false);
    
                // Update the user data in both sessionStorage and localStorage
                sessionStorage.setItem('user', JSON.stringify(updatedUser.user));
                localStorage.setItem('user', JSON.stringify(updatedUser.user));
            } else {
                const errorData = await response.json();
                console.error('Error updating user:', errorData.message);
                alert(`Error: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setLoading(false); // Stop loading state
        }
    };
    

    return (
        <>
            {/* Navbar */}
            <AppBar position="sticky" color="primary">
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        User Dashboard
                    </Typography>
                    <Button color="inherit" onClick={() => navigate('/user-dashboard')}>
                        Dashboard
                    </Button>
                    <Button color="inherit" onClick={() => navigate('/booking-history')}>
                        Booking History
                    </Button>
                    <Button color="inherit" onClick={handleLogout}>
                        Logout
                    </Button>
                    <img
                        src="/images/profile.png"
                        alt="Profile"
                        style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            marginLeft: '10px',
                            marginRight: '10px',
                            cursor: 'pointer',
                        }}
                        onClick={() => navigate('/profile')}
                    />
                </Toolbar>
            </AppBar>

            <div className="profile-container">
                {user ? (
                    <>
                        <div className="profile-image-placeholder">
                            <img
                                src="/images/profile.png"
                                alt="Profile"
                                className="profile-image"
                            />
                        </div>
                        <div className="profile-details">
                            {isEditing ? (
                                <Formik
                                    initialValues={{
                                        name: user.name,
                                        email: user.email,
                                    }}
                                    validationSchema={validationSchema}
                                    onSubmit={handleSaveChanges}
                                >
                                    {({ isSubmitting }) => (
                                        <Form className="profile-edit-form">
                                            <div className="form-group">
                                                <label htmlFor="name">Name</label>
                                                <Field
                                                    type="text"
                                                    id="name"
                                                    name="name"
                                                    placeholder="Enter your name"
                                                    className="form-control"
                                                />
                                                <ErrorMessage
                                                    name="name"
                                                    component="div"
                                                    className="error-message"
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="email">Email</label>
                                                <Field
                                                    type="email"
                                                    id="email"
                                                    name="email"
                                                    placeholder="Enter your email"
                                                    className="form-control"
                                                />
                                                <ErrorMessage
                                                    name="email"
                                                    component="div"
                                                    className="error-message"
                                                />
                                            </div>

                                            <Button
                                                type="submit"
                                                className="edit-profile-btn"
                                                disabled={isSubmitting || loading}
                                            >
                                                {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                                            </Button>
                                        </Form>
                                    )}
                                </Formik>
                            ) : (
                                <>
                                    <h2>{user.name}</h2>
                                    <p>Email: {user.email}</p>
                                    <Button
                                        className="edit-profile-btn"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        Edit Profile
                                    </Button>
                                </>
                            )}
                        </div>
                    </>
                ) : (
                    <p>Loading profile...</p>
                )}
            </div>
        </>
    );
};

export default Profile;
