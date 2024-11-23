import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MetaData from '../Layout/MetaData';
import 'bootstrap/dist/css/bootstrap.min.css';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [user, setUser] = useState({});
    const [newUser, setNewUser] = useState({ name: '', email: '', role: '', status: 'active' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalShow, setModalShow] = useState(false);
    const [updateMode, setUpdateMode] = useState(false);
    const [viewMode, setViewMode] = useState(false);

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/login');
        }
        const fetchUsers = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/auth/admin/users');
                setUsers(res.data.users);
                setLoading(false);
            } catch (err) {
                setError('Error loading users');
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleNewUser = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/auth/register', newUser);
            setUsers([...users, res.data.user]);
            toast.success('User created successfully');
            setNewUser({ name: '', email: '', role: '', status: 'active' });
            setModalShow(false);
        } catch (err) {
            setError('Error creating user');
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put(`http://localhost:5000/api/auth/admin/user/${user._id}`, user);
            setUsers(users.map(u => (u._id === res.data.user._id ? res.data.user : u)));
            toast.success('User updated successfully');
            setUpdateMode(false);
            setUser({});
            setModalShow(false);
        } catch (err) {
            setError('Error updating user');
        }
    };

    const handleDeleteUser = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/auth/admin/user/${id}`);
            setUsers(users.filter(u => u._id !== id));
            toast.success('User deleted successfully');
        } catch (err) {
            setError('Error deleting user');
        }
    };

    const handleViewUser = (usr) => {
        setUser(usr);
        setViewMode(true);
        setModalShow(true);
    };

    if (loading) return <div>Loading...</div>;

    return (
        <>
            <MetaData title="Users" />
            <div className="container mt-5">
                <h1 className="mb-4">Users</h1>
                <button className="btn btn-primary mb-4" onClick={() => { setNewUser({ name: '', email: '', role: '', status: 'active' }); setUpdateMode(false); setViewMode(false); setModalShow(true); }}>
                    Add New User
                </button>
                {error && <div className="alert alert-danger">{error}</div>}
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(usr => (
                            <tr key={usr._id}>
                                <td>{usr.name}</td>
                                <td>{usr.email}</td>
                                <td>{usr.role}</td>
                                <td>{usr.status}</td>
                                <td>
                                    <button className="btn btn-info mr-2" onClick={() => handleViewUser(usr)}>View</button>
                                    <button className="btn btn-warning mr-2" onClick={() => { setUser(usr); setUpdateMode(true); setViewMode(false); setModalShow(true); }}>Edit</button>
                                    <button className="btn btn-danger" onClick={() => handleDeleteUser(usr._id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Modal for Add/Edit/View User */}
                <div className={`modal fade ${modalShow ? 'show' : ''}`} style={{ display: modalShow ? 'block' : 'none' }} tabIndex="-1" role="dialog" aria-labelledby="userModalLabel" aria-hidden={!modalShow}>
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="userModalLabel">{viewMode ? 'View User' : (updateMode ? 'Edit User' : 'Add New User')}</h5>
                                <button type="button" className="close" onClick={() => setModalShow(false)} aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <form onSubmit={updateMode ? handleUpdateUser : handleNewUser}>
                                <div className="modal-body">
                                    {viewMode ? (
                                        <>
                                            <div className="form-group">
                                                <label>Name</label>
                                                <input type="text" className="form-control" value={user.name} readOnly />
                                            </div>
                                            <div className="form-group">
                                                <label>Email</label>
                                                <input type="text" className="form-control" value={user.email} readOnly />
                                            </div>
                                            <div className="form-group">
                                                <label>Role</label>
                                                <input type="text" className="form-control" value={user.role} readOnly />
                                            </div>
                                            <div className="form-group">
                                                <label>Status</label>
                                                <input type="text" className="form-control" value={user.status} readOnly />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="form-group">
                                                <input type="text" className="form-control" value={updateMode ? user.name : newUser.name} onChange={(e) => updateMode ? setUser({ ...user, name: e.target.value }) : setNewUser({ ...newUser, name: e.target.value })} placeholder="Name" required />
                                            </div>
                                            <div className="form-group">
                                                <input type="email" className="form-control" value={updateMode ? user.email : newUser.email} onChange={(e) => updateMode ? setUser({ ...user, email: e.target.value }) : setNewUser({ ...newUser, email: e.target.value })} placeholder="Email" required />
                                            </div>
                                            <div className="form-group">
                                                <input type="text" className="form-control" value={updateMode ? user.role : newUser.role} onChange={(e) => updateMode ? setUser({ ...user, role: e.target.value }) : setNewUser({ ...newUser, role: e.target.value })} placeholder="Role" required />
                                            </div>
                                            <div className="form-group">
                                                <select className="form-control" value={updateMode ? user.status : newUser.status} onChange={(e) => updateMode ? setUser({ ...user, status: e.target.value }) : setNewUser({ ...newUser, status: e.target.value })} required>
                                                    <option value="active">Active</option>
                                                    <option value="inactive">Inactive</option>
                                                </select>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setModalShow(false)}>Close</button>
                                    {!viewMode && <button type="submit" className="btn btn-primary">{updateMode ? 'Update User' : 'Add User'}</button>}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Users;
