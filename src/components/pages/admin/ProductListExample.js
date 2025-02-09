// import React, { useState, useEffect } from "react";
// import axiosInstance from "./axiosInstance"; // Import Axios instance
// import {
//   Button,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   TextField,
//   Table,
//   TableHead,
//   TableBody,
//   TableRow,
//   TableCell,
//   Snackbar,
//   Alert,
// } from "@mui/material";

// const ProductListExample = () => {
//   const [products, setProducts] = useState([]);
//   const [openDialog, setOpenDialog] = useState(false);
//   const [selectedProduct, setSelectedProduct] = useState({
//     name: "",
//     description: "",
//     price: 0,
//     quantity: 0,
//     image: "",
//     category: { id: 1 },
//   });
//   const [notification, setNotification] = useState({
//     open: false,
//     message: "",
//     type: "success",
//   });

//   const API_BASE_URL = "/admin/productexample"; // Chỉ cần endpoint, baseURL đã cấu hình sẵn

//   // Lấy danh sách sản phẩm
//   useEffect(() => {
//     fetchProducts();
//   }, []);

//   const fetchProducts = async () => {
//     try {
//       const response = await axiosInstance.get(API_BASE_URL); // Sử dụng axiosInstance
//       setProducts(response.data.data || []);
//     } catch (error) {
//       console.error("Error fetching products: ", error);
//     }
//   };

//   const handleSaveProduct = async () => {
//     try {
//       if (selectedProduct.id) {
//         await axiosInstance.put(`${API_BASE_URL}/edit-product/${selectedProduct.id}`, selectedProduct);
//         setNotification({ open: true, message: "Sản phẩm đã được cập nhật!", type: "success" });
//       } else {
//         await axiosInstance.post(`${API_BASE_URL}/add-product`, selectedProduct);
//         setNotification({ open: true, message: "Sản phẩm mới đã được thêm!", type: "success" });
//       }
//       fetchProducts();
//       setOpenDialog(false);
//     } catch (error) {
//       setNotification({ open: true, message: "Lỗi khi lưu sản phẩm!", type: "error" });
//     }
//   };

//   const handleDeleteProduct = async (id) => {
//     if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) {
//       try {
//         await axiosInstance.delete(`${API_BASE_URL}/delete-product`, { params: { id } });
//         setNotification({ open: true, message: "Sản phẩm đã được xóa!", type: "success" });
//         fetchProducts();
//       } catch (error) {
//         setNotification({ open: true, message: "Có lỗi khi xóa sản phẩm!", type: "error" });
//       }
//     }
//   };

//   const handleOpenDialog = (product = null) => {
//     setSelectedProduct(
//       product || {
//         name: "",
//         description: "",
//         price: 0,
//         quantity: 0,
//         image: "",
//         category: { id: 1 },
//       }
//     );
//     setOpenDialog(true);
//   };

//   return (
//     <div>
//       <h2 style={{ marginTop: "20px" }}>Quản lý sản phẩm</h2>
//       <Button
//         variant="contained"
//         color="primary"
//         onClick={() => handleOpenDialog()}
//       >
//         Thêm sản phẩm
//       </Button>

//       {/* Bảng hiển thị sản phẩm */}
//       <Table>
//         <TableHead>
//           <TableRow>
//             <TableCell>ID</TableCell>
//             <TableCell>Tên sản phẩm</TableCell>
//             <TableCell>Mô tả</TableCell>
//             <TableCell>Giá</TableCell>
//             <TableCell>Số lượng</TableCell>
//             <TableCell>Hành động</TableCell>
//           </TableRow>
//         </TableHead>
//         <TableBody>
//           {products.map((product) => (
//             <TableRow key={product.id}>
//               <TableCell>{product.id}</TableCell>
//               <TableCell>{product.name}</TableCell>
//               <TableCell>{product.description}</TableCell>
//               <TableCell>{product.price}</TableCell>
//               <TableCell>{product.quantity}</TableCell>
//               <TableCell>
//                 <Button
//                   variant="contained"
//                   color="primary"
//                   onClick={() => handleOpenDialog(product)}
//                 >
//                   Sửa
//                 </Button>
//                 <Button
//                   variant="contained"
//                   color="secondary"
//                   onClick={() => handleDeleteProduct(product.id)}
//                 >
//                   Xóa
//                 </Button>
//               </TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>

//       {/* Dialog thêm/sửa sản phẩm */}
//       <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
//         <DialogTitle>
//           {selectedProduct.id ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}
//         </DialogTitle>
//         <DialogContent>
//           <TextField
//             margin="dense"
//             label="Tên sản phẩm"
//             fullWidth
//             value={selectedProduct.name}
//             onChange={(e) =>
//               setSelectedProduct({ ...selectedProduct, name: e.target.value })
//             }
//           />
//           <TextField
//             margin="dense"
//             label="Mô tả"
//             fullWidth
//             value={selectedProduct.description}
//             onChange={(e) =>
//               setSelectedProduct({
//                 ...selectedProduct,
//                 description: e.target.value,
//               })
//             }
//           />
//           <TextField
//             margin="dense"
//             label="Giá"
//             type="number"
//             fullWidth
//             value={selectedProduct.price}
//             onChange={(e) =>
//               setSelectedProduct({
//                 ...selectedProduct,
//                 price: parseFloat(e.target.value),
//               })
//             }
//           />
//           <TextField
//             margin="dense"
//             label="Số lượng"
//             type="number"
//             fullWidth
//             value={selectedProduct.quantity}
//             onChange={(e) =>
//               setSelectedProduct({
//                 ...selectedProduct,
//                 quantity: parseInt(e.target.value, 10),
//               })
//             }
//           />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpenDialog(false)} color="secondary">
//             Hủy
//           </Button>
//           <Button onClick={handleSaveProduct} color="primary">
//             Lưu
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Snackbar thông báo */}
//       <Snackbar
//         open={notification.open}
//         autoHideDuration={3000}
//         onClose={() => setNotification({ ...notification, open: false })}
//       >
//         <Alert severity={notification.type}>{notification.message}</Alert>
//       </Snackbar>
//     </div>
//   );
// };

// export default ProductListExample;
