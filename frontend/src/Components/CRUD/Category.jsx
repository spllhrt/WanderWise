import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MUIDataTable from "mui-datatables";
import MetaData from '../Layout/MetaData';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';


const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [newCategory, setNewCategory] = useState({ name: '', images: [] });
    const [updateMode, setUpdateMode] = useState(false);
    const [modalShow, setModalShow] = useState(false);
    const [category, setCategory] = useState({});
    const [loggedUser, setLoggedUser] = useState(null); // State for logged-in user
    const navigate = useNavigate();
    const { id } = useParams();


    useEffect(() => {
        // Fetch categories
        const fetchCategories = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/admin/categories');
                setCategories(res.data.categories);
            } catch (err) {
                toast.error('Error loading categories');
            }
        };
        fetchCategories();


        // Fetch logged-in user details (Example: from localStorage, session, or an API)
        const user = JSON.parse(localStorage.getItem('loggedUser')); // Assuming logged-in user is stored in localStorage
        if (user) {
            setLoggedUser(user);
        }
    }, []);


    const handleNewCategory = async (values) => {
        const formData = new FormData();
        formData.append('name', values.name);
        values.images.forEach((image) => {
            formData.append('images', image);
        });
        try {
            const res = await axios.post('http://localhost:5000/api/admin/category/new', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setCategories([...categories, res.data.category]);
            toast.success('Category created successfully');
            setNewCategory({ name: '', images: [] });
            setModalShow(false);
        } catch (err) {
            toast.error('Error creating category');
        }
    };


    const handleUpdateCategory = async (values) => {
        const formData = new FormData();
        formData.append('name', values.name);
       
        if (values.images) {
            values.images.forEach((image) => {
                formData.append('images', image);
            });
        }
       
        try {
            const res = await axios.put(`http://localhost:5000/api/admin/category/${category._id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setCategories(categories.map(cat => (cat._id === res.data.category._id ? res.data.category : cat)));
            toast.success('Category updated successfully');
            setUpdateMode(false);
            setCategory({});
            setModalShow(false);
        } catch (err) {
            toast.error('Error updating category');
        }
    };


    const handleDeleteCategories = async (rowsDeleted) => {
        try {
            // Get the IDs of the selected rows from the rowsDeleted parameter
            const idsToDelete = rowsDeleted.data.map(row => categories[row.dataIndex]._id);
           
            // Delete categories from the backend
            await Promise.all(idsToDelete.map(id => axios.delete(`http://localhost:5000/api/admin/category/${id}`)));
           
            // Update the state by filtering out the deleted categories
            setCategories(categories.filter(cat => !idsToDelete.includes(cat._id)));
           
            // Show success toast
            toast.success('Selected categories deleted successfully');
        } catch (err) {
            toast.error('Error deleting categories');
        }
    };


    const handleEditCategory = (id) => {
        const selectedCategory = categories.find(cat => cat._id === id);
        if (selectedCategory) {
            setCategory(selectedCategory);
            setUpdateMode(true);
            setModalShow(true);
        }
    };


    const columns = [
        { name: "name", label: "Category Name" },
        {
            name: "images",
            label: "Images",
            options: {
                customBodyRender: (images) => (
                    images.map((img, index) => (
                        <img key={index} src={img.url} alt="category" style={{ width: '50px', height: '50px', marginRight: '5px' }} />
                    ))
                )
            }
        },
        {
            name: "edit",
            label: "Edit",
            options: {
                customBodyRender: (_, tableMeta) => (
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleEditCategory(categories[tableMeta.rowIndex]._id)}
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
            const ids = allRowsSelected.map(row => categories[row.dataIndex]._id);
            setSelectedCategories(ids);
        },
        onRowsDelete: handleDeleteCategories,
    };


    const validationSchema = Yup.object({
        name: Yup.string()
            .min(3, 'Category name must be at least 3 characters long')
            .required('Category name is required'),
        images: Yup.array().required('At least one image is required'),
    });


    return (
        <>
            <MetaData title="Categories" />
            <div className="container mt-5">
                <h1 className="mb-4">Categories</h1>
                {loggedUser && (
                    <div>
                        <p>Welcome, {loggedUser.username}</p> {/* Display logged-in user's name */}
                    </div>
                )}
                <button className="btn btn-primary mb-4" onClick={() => { setNewCategory({ name: '', images: [] }); setUpdateMode(false); setModalShow(true); }}>
                    Add New Category
                </button>
                <MUIDataTable
                    title={"Category List"}
                    data={categories}
                    columns={columns}
                    options={options}
                />


                {/* Modal for Add/Edit Category */}
                {modalShow && (
                    <div className={`modal fade show`} style={{ display: 'block' }} tabIndex="-1">
                        <div className="modal-dialog" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">{updateMode ? 'Edit Category' : 'Add New Category'}</h5>
                                    <button type="button" className="close" onClick={() => setModalShow(false)} aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <Formik
                                    initialValues={{
                                        name: updateMode ? category.name : newCategory.name,
                                        images: updateMode ? category.images : newCategory.images,
                                    }}
                                    validationSchema={validationSchema}
                                    onSubmit={updateMode ? handleUpdateCategory : handleNewCategory}
                                >
                                    {({ setFieldValue }) => (
                                        <Form>
                                            <div className="modal-body">
                                                <div className="form-group">
                                                    <Field
                                                        type="text"
                                                        className="form-control"
                                                        name="name"
                                                        placeholder="Category Name"
                                                    />
                                                    <ErrorMessage name="name" component="div" className="text-danger" />
                                                </div>
                                                <div className="form-group">
                                                    <input
                                                        type="file"
                                                        className="form-control-file"
                                                        onChange={(e) => {
                                                            const files = Array.from(e.target.files);
                                                            setFieldValue('images', files);
                                                        }}
                                                        multiple
                                                    />
                                                    <ErrorMessage name="images" component="div" className="text-danger" />
                                                </div>
                                            </div>
                                            <div className="modal-footer">
                                                <button type="button" className="btn btn-secondary" onClick={() => setModalShow(false)}>Close</button>
                                                <button type="submit" className="btn btn-primary">
                                                    {updateMode ? 'Update Category' : 'Add Category'}
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


export default Categories;



