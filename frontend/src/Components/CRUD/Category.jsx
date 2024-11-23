import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MUIDataTable from "mui-datatables";
import MetaData from '../Layout/MetaData';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [newCategory, setNewCategory] = useState({ name: '', images: [] });
    const [updateMode, setUpdateMode] = useState(false);
    const [modalShow, setModalShow] = useState(false);
    const [category, setCategory] = useState({});
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/login');
        }
        const fetchCategories = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/admin/categories');
                setCategories(res.data.categories);
            } catch (err) {
                toast.error('Error loading categories');
            }
        };
        fetchCategories();
    }, []);

    const handleNewCategory = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', newCategory.name);
        newCategory.images.forEach((image) => {
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

    const handleUpdateCategory = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', category.name);
        
        if (category.images) {
            category.images.forEach((image) => {
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

    return (
        <>
            <MetaData title="Categories" />
            <div className="container mt-5">
                <h1 className="mb-4">Categories</h1>
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
                                <form onSubmit={updateMode ? handleUpdateCategory : handleNewCategory}>
                                    <div className="modal-body">
                                        <div className="form-group">
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={updateMode ? category.name : newCategory.name}
                                                onChange={(e) => updateMode ? setCategory({ ...category, name: e.target.value }) : setNewCategory({ ...newCategory, name: e.target.value })}
                                                placeholder="Category Name"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <input
                                                type="file"
                                                className="form-control-file"
                                                onChange={(e) => {
                                                    const files = Array.from(e.target.files);
                                                    if (updateMode) {
                                                        setCategory({ ...category, images: files });
                                                    } else {
                                                        setNewCategory({ ...newCategory, images: files });
                                                    }
                                                }}
                                                multiple
                                            />
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={() => setModalShow(false)}>Close</button>
                                        <button type="submit" className="btn btn-primary">
                                            {updateMode ? 'Update Category' : 'Add Category'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Categories;
