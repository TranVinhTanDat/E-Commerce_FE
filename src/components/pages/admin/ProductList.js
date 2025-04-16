import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../../utils/config';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, MenuItem, Select, InputLabel, FormControl, Table, TableHead, TableBody, TableRow, TableCell, Snackbar, Alert } from '@mui/material';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [open, setOpen] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState(''); // Thêm state cho từ khóa tìm kiếm
    const [newProduct, setNewProduct] = useState({
        name: '',
        description: '',
        price: '',
        quantity: '',
        image: '',
        category: ''
    });
    const [editingProduct, setEditingProduct] = useState(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [alertOpen, setAlertOpen] = useState(false); 
    const [alertMessage, setAlertMessage] = useState(''); 
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false); 
    const [productToDelete, setProductToDelete] = useState(null); 
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        fetchProducts(page);
        fetchCategories();
        checkAdminRole();
    }, [page]);

    
    useEffect(() => {
        if (searchKeyword === '') {
            fetchProducts(page);  // Nếu từ khóa rỗng, hiển thị tất cả sản phẩm
        } else {
            handleSearch();  // Nếu có từ khóa, tìm kiếm sản phẩm
        }
    }, [searchKeyword]);  // Lắng nghe sự thay đổi của từ khóa tìm kiếm
    

    const checkAdminRole = () => {
        const role = localStorage.getItem('role');
        if (role === 'ADMIN') {
            setIsAdmin(true);
        }
    };

    const fetchProducts = async (page) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/admin/products/page?page=${page}&size=10`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setProducts(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (e) {
            console.log('Error fetching products:', e);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/categories`);
            setCategories(response.data);
        } catch (e) {
            console.log('Error fetching categories:', e);
        }
    };

    const handleSearch = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/admin/products/Search?keyword=${searchKeyword}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setProducts(response.data.data);  // Cập nhật danh sách sản phẩm theo kết quả tìm kiếm
        } catch (e) {
            console.log('Error searching products:', e);
            setAlertMessage(`Không tìm thấy sản phẩm nào với từ khóa "${searchKeyword}"`);
            setAlertOpen(true);
        }
    };
    

    const handleClickOpen = (product = null) => {
        if (product) {
            setNewProduct(product);
            setEditingProduct(product.id);
        } else {
            setNewProduct({ name: '', description: '', price: '', quantity: '', image: '', category: '' });
            setEditingProduct(null);
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProduct({ ...newProduct, [name]: value });
    };

    const handleSubmit = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            };

            if (editingProduct) {
                await axios.put(`${API_BASE_URL}/admin/products/edit-product/${editingProduct}`, newProduct, config);
                setAlertMessage('Sửa sản phẩm thành công!');
            } else {
                await axios.post(`${API_BASE_URL}/admin/products/add-product`, newProduct, config);
                setAlertMessage('Thêm sản phẩm thành công!');
            }
            setAlertOpen(true); 
            fetchProducts(page);
            handleClose();
        } catch (e) {
            console.log('Error submitting product:', e);
        }
    };

    const handleDeleteClick = (productId) => {
        setProductToDelete(productId);
        setConfirmDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await axios.delete(`${API_BASE_URL}/admin/products/delete-product`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                params: {
                    id: productToDelete
                }
            });
            fetchProducts(page);
            setConfirmDeleteOpen(false); 
            setAlertMessage('Xóa sản phẩm thành công!');
            setAlertOpen(true); 
        } catch (e) {
            console.log('Error deleting product:', e);
        }
    };

    const handleCancelDelete = () => {
        setConfirmDeleteOpen(false);
    };

    const handleNextPage = () => {
        if (page < totalPages - 1) {
            setPage(page + 1);
        }
    };

    const handlePreviousPage = () => {
        if (page > 0) {
            setPage(page - 1);
        }
    };

    const handleAlertClose = () => {
        setAlertOpen(false);
    };

    return (
        <div className="product-list-container">
            <h1>Product List</h1>

            {/* Nút thêm sản phẩm, chỉ Admin mới thấy */}
            {isAdmin && (
                <div className="add-product-button-container">
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleClickOpen()}
                        className="btn-add"
                    >
                        THÊM
                    </Button>
                </div>
            )}

            {/* Ô tìm kiếm sản phẩm */}
            <TextField
                label="Search Product"
                variant="outlined"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}  // Cập nhật từ khóa tìm kiếm
                fullWidth
                style={{ marginBottom: '20px' }}
            />


            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Tên sản phẩm"
                        name="name"
                        value={newProduct.name}
                        onChange={handleInputChange}
                        fullWidth
                    />
                    <TextField
                        margin="dense"
                        label="Mô tả"
                        name="description"
                        value={newProduct.description}
                        onChange={handleInputChange}
                        fullWidth
                    />
                    <TextField
                        margin="dense"
                        label="Giá"
                        name="price"
                        type="number"
                        value={newProduct.price}
                        onChange={handleInputChange}
                        fullWidth
                    />
                    <TextField
                        margin="dense"
                        label="Số lượng"
                        name="quantity"
                        type="number"
                        value={newProduct.quantity}
                        onChange={handleInputChange}
                        fullWidth
                    />
                    <TextField
                        margin="dense"
                        label="Hình ảnh"
                        name="image"
                        value={newProduct.image}
                        onChange={handleInputChange}
                        fullWidth
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Danh mục</InputLabel>
                        <Select
                            name="category"
                            value={newProduct.category}
                            onChange={handleInputChange}
                        >
                            {categories.map((category) => (
                                <MenuItem key={category.id} value={category}>
                                    {category.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="secondary">Hủy</Button>
                    <Button onClick={handleSubmit} style={{ padding: '5 10px' }} color="primary">
                        {editingProduct ? 'Sửa' : 'Thêm'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Hiển thị danh sách sản phẩm */}
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Image</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell>Action</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {products.map((product) => (
                        <TableRow key={product.id}>
                            <TableCell>
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                />
                            </TableCell>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>{product.description}</TableCell>
                            <TableCell>${product.price.toFixed(2)}</TableCell>
                            <TableCell>{product.quantity}</TableCell>
                            <TableCell>
                                {isAdmin && (
                                    <>
                                        <Button style={{ marginBottom: '8px' }} variant="contained" color="success" onClick={() => handleClickOpen(product)}>Sửa</Button>
                                        <Button variant="contained" color="error" onClick={() => handleDeleteClick(product.id)}>Xóa</Button>
                                    </>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', gap: '10px' }}>
                <Button
                    onClick={handlePreviousPage}
                    disabled={page === 0}
                    style={{ padding: '5px 10px', marginRight: '10px', maxWidth: '100px' }}
                >
                    Previous
                </Button>
                <div style={{ display: 'flex', gap: '5px' }}>
                    {[...Array(totalPages)].map((_, index) => (
                        <Button
                            key={index}
                            variant={index === page ? 'contained' : 'outlined'}
                            color="primary"
                            onClick={() => setPage(index)}
                            style={{ width: '30px', height: '35px' }}
                        >
                            {index + 1}
                        </Button>
                    ))}
                </div>
                <Button
                    onClick={handleNextPage}
                    disabled={page === totalPages - 1}
                    style={{ padding: '5px 10px', marginLeft: '10px', maxWidth: '100px' }}
                >
                    Next
                </Button>
            </div>

            <Snackbar open={alertOpen} autoHideDuration={3000} onClose={handleAlertClose}>
                <Alert onClose={handleAlertClose} severity="success">
                    {alertMessage}
                </Alert>
            </Snackbar>

            <Dialog open={confirmDeleteOpen} onClose={handleCancelDelete}>
                <DialogTitle>Xác nhận</DialogTitle>
                <DialogContent>
                    <p>Bạn có chắc chắn muốn xóa sản phẩm này không?</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelDelete} color="secondary">Hủy</Button>
                    <Button onClick={handleConfirmDelete} color="primary">Xóa</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default ProductList;
