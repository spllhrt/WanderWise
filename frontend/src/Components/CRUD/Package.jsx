import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MUIDataTable from "mui-datatables";
import { getUser, logout } from '../../utils/helpers';
import MetaData from '../Layout/MetaData';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';


const Packages = () => {
    const [packages, setPackages] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedPackage, setSelectedPackage] = useState({});
    const [newPackage, setNewPackage] = useState({
        name: '',
        description: '',
        price: '',
        features: '',
        status: 'Available',
        category: '',
        images: [],
        itinerary: ''  
    });
    const [updateMode, setUpdateMode] = useState(false);
    const [modalShow, setModalShow] = useState(false);
    const navigate = useNavigate();
    const user = getUser();


    useEffect(() => {
        const user = getUser(); // Fetch user data here
        if (!user || user.role !== 'admin') {
            navigate('/login'); // Redirect to login if not an admin
        }
        const fetchPackages = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/admin/packages');
                setPackages(res.data.packages);
            } catch (err) {
                toast.error('Error loading packages');
            }
        };
   
        const fetchCategories = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/admin/categories');
                setCategories(res.data.categories);
            } catch (err) {
                toast.error('Error loading categories');
            }
        };
   
        fetchPackages();
        fetchCategories();
    }, [navigate]); // Remove `user` from dependencies, since it's already fetched inside the useEffect


    // Validation schema with Yup
    const validationSchema = Yup.object({
        name: Yup.string().min(3, 'Must be at least 3 characters').required('Package name is required'),
        description: Yup.string().min(3, 'Must be at least 3 characters').required('Description is required'),
        price: Yup.number().required('Price is required').positive('Price must be positive'),
        features: Yup.string().min(3, 'Must be at least 3 characters').required('Features are required'),
        category: Yup.string().required('Category is required'),
        itinerary: Yup.string().min(3, 'Must be at least 3 characters').required('Itinerary is required'),
    });


    const handleNewPackage = async (values) => {
        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('description', values.description);
        formData.append('price', values.price);
        formData.append('features', values.features);
        formData.append('status', newPackage.status);
        formData.append('category', values.category); // Send the category _id
        formData.append('itinerary', values.itinerary); // Send itinerary field
   
        newPackage.images.forEach((image) => {
            formData.append('images', image);
        });
   
        try {
            const res = await axios.post('http://localhost:5000/api/admin/package/new', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
           
            // Directly update the state with the newly created package
            setPackages(prevPackages => [...prevPackages, res.data.package]);
   
            // Update categories if necessary (e.g., new category added)
            const updatedCategories = [...categories];
            if (!updatedCategories.find(cat => cat._id === values.category)) {
                // Fetch the new category if it doesn't exist in the list
                const resCategory = await axios.get(`http://localhost:5000/api/admin/category/${values.category}`);
                updatedCategories.push(resCategory.data.category);
            }
            setCategories(updatedCategories);
   
            toast.success('Package created successfully');
            setNewPackage({
                name: '',
                description: '',
                price: '',
                features: '',
                status: 'Available',
                category: '',
                images: [],
                itinerary: '' // Reset itinerary field
            });
            setModalShow(false);
        } catch (err) {
            toast.error('Error creating package');
        }
    };
   
    const handleUpdatePackage = async (values) => {
        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('description', values.description);
        formData.append('price', values.price);
        formData.append('features', values.features);
        formData.append('status', selectedPackage.status);
        formData.append('category', values.category); // Send the category _id
        formData.append('itinerary', values.itinerary); // Send itinerary field
   
        if (selectedPackage.images) {
            selectedPackage.images.forEach((image) => {
                formData.append('images', image);
            });
        }
   
        try {
            const res = await axios.put(`http://localhost:5000/api/admin/package/${selectedPackage._id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
   
            // Directly update the state with the updated package
            setPackages(prevPackages =>
                prevPackages.map(pkg => (pkg._id === res.data.package._id ? res.data.package : pkg))
            );
   
            // Update categories if necessary (e.g., new category added or updated)
            const updatedCategories = [...categories];
            if (!updatedCategories.find(cat => cat._id === values.category)) {
                // Fetch the updated category if not already in the list
                const resCategory = await axios.get(`http://localhost:5000/api/admin/category/${values.category}`);
                updatedCategories.push(resCategory.data.category);
            }
            setCategories(updatedCategories);
   
            toast.success('Package updated successfully');
            setUpdateMode(false);
            setSelectedPackage({});
            setModalShow(false);
        } catch (err) {
            toast.error('Error updating package');
        }
    };
   
   


    const handleEditPackage = (id) => {
        const selectedPkg = packages.find(pkg => pkg._id === id);
        if (selectedPkg) {
            setSelectedPackage(selectedPkg);
            setUpdateMode(true);
            setModalShow(true);
        }
    };


    const handleDeletePackage = async (rowsDeleted) => {
        try {
            const idsToDelete = rowsDeleted.data.map(row => packages[row.dataIndex]._id);
            await Promise.all(idsToDelete.map(id => axios.delete(`http://localhost:5000/api/admin/package/${id}`)));
            setPackages(packages.filter(pkg => !idsToDelete.includes(pkg._id)));
            toast.success('Selected packages deleted successfully');
        } catch (err) {
            toast.error('Error deleting packages');
        }
    };


    const columns = [
        { name: "name", label: "Package Name" },
        {
            name: "images",
            label: "Images",
            options: {
                customBodyRender: (images) => (
                    images.map((img, index) => (
                        <img key={index} src={img.url} alt="package" style={{ width: '50px', height: '50px', marginRight: '5px' }} />
                    ))
                )
            }
        },
        { name: "description", label: "Description" },
        { name: "price", label: "Price" },
        {
            name: "status",
            label: "Status",
            options: {
                customBodyRender: (status) => <span>{status}</span>
            }
        },
        {
            name: "category",
            label: "Category",
            options: {
                customBodyRender: (category) => {
                    return category ? category.name : 'N/A';
                }
            }
        },
       
        {
            name: "edit",
            label: "Edit",
            options: {
                customBodyRender: (_, tableMeta) => (
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleEditPackage(packages[tableMeta.rowIndex]._id)}
                    >
                        Edit
                    </button>
                )
            }
        }
    ];


    const options = {
        filter: false,
        selectableRows: "multiple",
        onRowSelectionChange: (currentRowsSelected, allRowsSelected) => {
            const ids = allRowsSelected.map(row => packages[row.dataIndex]._id);
        },
        onRowsDelete: handleDeletePackage,
    };


    return (
        <>
            <MetaData title="Packages" />
            <div className="container mt-5">
                <h1 className="mb-4">Packages</h1>
                <button className="btn btn-primary mb-4" onClick={() => { setNewPackage({ name: '', description: '', price: '', features: '', status: 'Available', category: '', images: [], itinerary: '' }); setUpdateMode(false); setModalShow(true); }}>
                    Add New Package
                </button>
                <MUIDataTable
                    title={"Package List"}
                    data={packages}
                    columns={columns}
                    options={options}
                />


                {/* Modal for Add/Edit Package */}
                {modalShow && (
                    <div className={`modal fade show`} style={{ display: 'block' }} tabIndex="-1">
                        <div className="modal-dialog" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">{updateMode ? 'Edit Package' : 'Add New Package'}</h5>
                                    <button type="button" className="close" onClick={() => setModalShow(false)} aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <Formik
                                    initialValues={updateMode ? selectedPackage : newPackage}
                                    validationSchema={validationSchema}
                                    onSubmit={updateMode ? handleUpdatePackage : handleNewPackage}
                                >
                                    {() => (
                                        <Form encType="multipart/form-data">
                                            <div className="modal-body">
                                                <div className="form-group">
                                                    <label htmlFor="name">Package Name</label>
                                                    <Field name="name" type="text" className="form-control" />
                                                    <ErrorMessage name="name" component="div" className="text-danger" />
                                                </div>


                                                <div className="form-group">
                                                    <label htmlFor="description">Description</label>
                                                    <Field name="description" type="text" className="form-control" />
                                                    <ErrorMessage name="description" component="div" className="text-danger" />
                                                </div>


                                                <div className="form-group">
                                                    <label htmlFor="price">Price</label>
                                                    <Field name="price" type="number" className="form-control" />
                                                    <ErrorMessage name="price" component="div" className="text-danger" />
                                                </div>


                                                <div className="form-group">
                                                    <label htmlFor="features">Features</label>
                                                    <Field name="features" type="text" className="form-control" />
                                                    <ErrorMessage name="features" component="div" className="text-danger" />
                                                </div>


                                                <div className="form-group">
                                                    <label htmlFor="itinerary">Itinerary</label>
                                                    <Field name="itinerary" type="text" className="form-control" />
                                                    <ErrorMessage name="itinerary" component="div" className="text-danger" />
                                                </div>


                                                <div className="form-group">
                                                    <label htmlFor="category">Category</label>
                                                    <Field as="select" name="category" className="form-control">
                                                        <option value="">Select Category</option>
                                                        {categories.map((category) => (
                                                            <option key={category._id} value={category._id}>
                                                                {category.name}
                                                            </option>
                                                        ))}
                                                    </Field>
                                                    <ErrorMessage name="category" component="div" className="text-danger" />
                                                </div>


                                                <div className="form-group">
                                                    <label htmlFor="images">Images</label>
                                                    <input
                                                        name="images"
                                                        type="file"
                                                        multiple
                                                        className="form-control-file"
                                                        onChange={(e) => setNewPackage({ ...newPackage, images: Array.from(e.target.files) })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="modal-footer">
                                                <button type="button" className="btn btn-secondary" onClick={() => setModalShow(false)}>
                                                    Close
                                                </button>
                                                <button type="submit" className="btn btn-primary">
                                                    {updateMode ? 'Update' : 'Save'}
                                                </button>
                                            </div>
                                        </Form>
                                    )}
                                </Formik>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};


export default Packages;
