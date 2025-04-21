import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';
import API_BASE_URL from '../../../utils/config';

// Thành phần đệ quy để hiển thị danh mục
const RecursiveCategory = ({ category, activeCategory, handleCategoryClick, expandedCategories, toggleSubcategories, level = 0 }) => {
    return (
        <li key={category.id}>
            <div className="d-flex justify-content-between fruite-name" style={{ marginLeft: `${level * 15}px` }}>
                <a href="#" onClick={() => handleCategoryClick(category)}>
                    <i className="fas fa-apple-alt me-2"></i>{category.name}
                </a>
                {category.subCategories?.length > 0 && (
                    <i
                        className={`fas fa-caret-${expandedCategories[category.id] ? 'down' : 'right'} me-2`}
                        onClick={() => toggleSubcategories(category.id)}
                        style={{ cursor: 'pointer' }}
                    ></i>
                )}
            </div>
            {expandedCategories[category.id] && category.subCategories?.length > 0 && (
                <ul className="list-unstyled ms-3">
                    {category.subCategories.map(subCategory => (
                        <RecursiveCategory
                            key={subCategory.id}
                            category={subCategory}
                            activeCategory={activeCategory}
                            handleCategoryClick={handleCategoryClick}
                            expandedCategories={expandedCategories}
                            toggleSubcategories={toggleSubcategories}
                            level={level + 1}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
};

const Shop = () => {
    const [rangeValue, setRangeValue] = useState(15000);
    const [keyword, setKeyword] = useState('');
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState('All Products');
    const [expandedCategories, setExpandedCategories] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const productsPerPage = 6;

    useEffect(() => {
        // Gọi API lấy danh mục
        axios.get(`${API_BASE_URL}/categories`)
            .then(response => {
                console.log("Dữ liệu danh mục:", response.data);
                if (Array.isArray(response.data)) {
                    setCategories(response.data);
                } else {
                    console.error("Dữ liệu danh mục không phải mảng:", response.data);
                    setCategories([]);
                    setError("Dữ liệu danh mục không hợp lệ.");
                }
                setLoading(false);
            })
            .catch(error => {
                console.error("Lỗi khi lấy danh sách danh mục!", error);
                setError("Không thể tải danh mục.");
                setLoading(false);
            });

        // Gọi API lấy sản phẩm
        fetchProducts(currentPage, productsPerPage, keyword, rangeValue);
    }, [currentPage, activeCategory, keyword, rangeValue]);

    const fetchProducts = (page, size, keyword, maxPrice) => {
        const endpoint = activeCategory === 'All Products'
            ? `${API_BASE_URL}/products/search?page=${page - 1}&size=${size}&keyword=${keyword}&maxPrice=${maxPrice}`
            : `${API_BASE_URL}/products/search?page=${page - 1}&size=${size}&keyword=${keyword}&maxPrice=${maxPrice}&category=${activeCategory}`;

        axios.get(endpoint)
            .then(response => {
                if (response.data.content && Array.isArray(response.data.content)) {
                    setProducts(response.data.content);
                    setTotalPages(response.data.totalPages);
                } else {
                    console.error("Dữ liệu sản phẩm không hợp lệ:", response.data);
                    setProducts([]);
                    setError("Dữ liệu sản phẩm không hợp lệ.");
                }
            })
            .catch(error => {
                console.error(`Lỗi khi lấy sản phẩm cho danh mục ${activeCategory}!`, error);
                setError("Không thể tải sản phẩm.");
            });
    };

    const handleCategoryClick = (category) => {
        setActiveCategory(category.name);
        setCurrentPage(1);
    };

    const toggleSubcategories = (categoryId) => {
        setExpandedCategories(prevState => ({
            ...prevState,
            [categoryId]: !prevState[categoryId]
        }));
    };

    const handleAddToCart = (productId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.');
            return;
        }

        axios.post(`${API_BASE_URL}/cart/add`, {
            productId: productId,
            quantity: 1
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(response => {
                toast.success('Đã thêm sản phẩm vào giỏ hàng!');
            })
            .catch(error => {
                console.error('Lỗi khi thêm sản phẩm vào giỏ hàng!', error);
                toast.error('Lỗi khi thêm sản phẩm vào giỏ hàng.');
            });
    };

    const handleRangeChange = (event) => {
        setRangeValue(event.target.value);
    };

    const handleKeywordChange = (event) => {
        setKeyword(event.target.value);
        setCurrentPage(1);
    };

    const paginate = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    return (
        <>
            <div className="container-fluid fixed-top">
                <div className="container topbar bg-primary d-none d-lg-block">
                    <div className="d-flex justify-content-between">
                        <div className="top-info ps-2">
                            <small className="me-3"><i className="fas fa-map-marker-alt me-2 text-secondary"></i> <a href="#" className="text-white">123 Street, New York</a></small>
                            <small className="me-3"><i className="fas fa-envelope me-2 text-secondary"></i><a href="#" className="text-white">Email@Example.com</a></small>
                        </div>
                        <div className="top-link pe-2">
                            <a href="#" className="text-white"><small className="text-white mx-2">Chính sách bảo mật</small>/</a>
                            <a href="#" className="text-white"><small className="text-white mx-2">Điều khoản sử dụng</small>/</a>
                            <a href="#" className="text-white"><small className="text-white ms-2">Hoàn tiền và đổi trả</small></a>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal fade" id="searchModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-fullscreen">
                    <div className="modal-content rounded-0">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">Tìm kiếm theo từ khóa</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body d-flex align-items-center">
                            <div className="input-group w-75 mx-auto d-flex">
                                <input type="search" className="form-control p-3" placeholder="Từ khóa" aria-describedby="search-icon-1" onChange={handleKeywordChange} />
                                <span id="search-icon-1" className="input-group-text p-3"><i className="fa fa-search"></i></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container-fluid page-header py-5">
                <h1 className="text-center text-white display-6">Cửa hàng</h1>
                <ol className="breadcrumb justify-content-center mb-0">
                    <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
                    <li className="breadcrumb-item"><a href="#">Trang</a></li>
                    <li className="breadcrumb-item active text-white">Cửa hàng</li>
                </ol>
            </div>
            <div className="container-fluid fruite py-5">
                <div className="container py-5">
                    <h1 className="mb-4">Cửa hàng trái cây tươi</h1>
                    <div className="row g-4">
                        <div className="col-lg-12">
                            <div className="row g-4">
                                <div className="col-xl-3">
                                    <div className="input-group w-100 mx-auto d-flex">
                                        <input type="search" className="form-control p-3" placeholder="Từ khóa" aria-describedby="search-icon-1" onChange={handleKeywordChange} />
                                        <span id="search-icon-1" className="input-group-text p-3"><i className="fa fa-search"></i></span>
                                    </div>
                                </div>
                                <div className="col-6"></div>
                                <div className="col-xl-3">
                                    <div className="bg-light ps-3 py-3 rounded d-flex justify-content-between mb-4">
                                        <label htmlFor="fruits">Sắp xếp mặc định:</label>
                                        <select id="fruits" name="fruitlist" className="border-0 form-select-sm bg-light me-3" form="fruitform">
                                            <option value="volvo">Không sắp xếp</option>
                                            <option value="saab">Phổ biến</option>
                                            <option value="opel">Hữu cơ</option>
                                            <option value="audi">Nổi bật</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="row g-4">
                                <div className="col-lg-3">
                                    <div className="row g-4">
                                        <div className="col-lg-12">
                                            <div className="mb-3">
                                                <h4>Danh mục</h4>
                                                {loading ? (
                                                    <p>Đang tải danh mục...</p>
                                                ) : error ? (
                                                    <p className="text-danger">{error}</p>
                                                ) : (
                                                    <ul className="list-unstyled fruite-categorie">
                                                        <li>
                                                            <div className="d-flex justify-content-between fruite-name">
                                                                <a href="#" onClick={() => handleCategoryClick({ name: 'All Products' })}>
                                                                    <i className="fas fa-apple-alt me-2"></i>Tất cả sản phẩm
                                                                </a>
                                                            </div>
                                                        </li>
                                                        {Array.isArray(categories) && categories.map(category => (
                                                            <RecursiveCategory
                                                                key={category.id}
                                                                category={category}
                                                                activeCategory={activeCategory}
                                                                handleCategoryClick={handleCategoryClick}
                                                                expandedCategories={expandedCategories}
                                                                toggleSubcategories={toggleSubcategories}
                                                            />
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-lg-12">
                                            <div className="mb-3">
                                                <h4 className="mb-2">Giá</h4>
                                                <input
                                                    type="range"
                                                    className="form-range w-100"
                                                    id="rangeInput"
                                                    name="rangeInput"
                                                    min="0"
                                                    max="40000"
                                                    value={rangeValue}
                                                    onChange={handleRangeChange}
                                                />
                                                <output id="amount" name="amount" htmlFor="rangeInput">
                                                    {formatCurrency(rangeValue)}
                                                </output>
                                            </div>
                                        </div>
                                        <div className="col-lg-12">
                                            <div className="position-relative">
                                                <img src="img/banner-fruits.jpg" className="img-fluid w-100 rounded" alt="Banner trái cây" />
                                                <div className="position-absolute" style={{ top: '50%', right: '10px', transform: 'translateY(-50%)' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-9">
                                    <div className="row g-4 justify-content-center">
                                        {loading ? (
                                            <p>Đang tải sản phẩm...</p>
                                        ) : error ? (
                                            <p className="text-danger">{error}</p>
                                        ) : products.length === 0 ? (
                                            <p>Không có sản phẩm nào phù hợp.</p>
                                        ) : (
                                            products.map(product => (
                                                <div className="col-md-6 col-lg-6 col-xl-4" key={product.id}>
                                                    <div className="rounded position-relative fruite-item">
                                                        <div className="fruite-img">
                                                            <Link to={`/shopdetail/${product.id}`}>
                                                                <img
                                                                    src={product.image}
                                                                    className="product-image img-fluid w-100 rounded-top"
                                                                    alt={product.name}
                                                                />
                                                            </Link>
                                                        </div>
                                                        <div
                                                            className="text-white bg-secondary px-3 py-1 rounded position-absolute"
                                                            style={{ top: '10px', left: '10px' }}
                                                        >
                                                            {product.category?.name || 'Không xác định'}
                                                        </div>
                                                        <div className="p-4 border border-secondary border-top-0 rounded-bottom">
                                                            <Link to={`/shopdetail/${product.id}`} className="text-dark">
                                                                <h4 className="text-lg font-semibold">{product.name}</h4>
                                                            </Link>
                                                            <p className="DesProductShop text-gray-600">{product.description}</p>
                                                            <div className="d-flex justify-content-between flex-lg-wrap">
                                                                <p className="text-dark fs-5 fw-bold mb-0">
                                                                    {formatCurrency(product.price)}
                                                                </p>
                                                                <a
                                                                    href="#"
                                                                    className="btn border border-primary rounded-pill px-3 text-primary"
                                                                    onClick={() => handleAddToCart(product.id)}
                                                                >
                                                                    <i className="fa fa-shopping-bag me-2 text-primary"></i> Thêm vào giỏ
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                        <div className="col-12">
                                            <div className="pagination d-flex justify-content-center mt-5">
                                                <a
                                                    href="#"
                                                    className="rounded"
                                                    onClick={() => paginate(currentPage - 1)}
                                                    disabled={currentPage === 1}
                                                >
                                                    «
                                                </a>
                                                {Array.from({ length: totalPages }, (_, index) => (
                                                    <a
                                                        key={index}
                                                        href="#"
                                                        className={`rounded ${currentPage === index + 1 ? 'active' : ''}`}
                                                        onClick={() => paginate(index + 1)}
                                                    >
                                                        {index + 1}
                                                    </a>
                                                ))}
                                                <a
                                                    href="#"
                                                    className="rounded"
                                                    onClick={() => paginate(currentPage + 1)}
                                                    disabled={currentPage === totalPages}
                                                >
                                                    »
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <a href="#" className="btn btn-primary border-3 border-primary rounded-circle back-to-top">
                <i className="fa fa-arrow-up"></i>
            </a>
            <ToastContainer />

            {/* CSS để đồng bộ kích thước và cải thiện giao diện */}
            <style>
                {`
                    .fruite-item {
                        display: flex;
                        flex-direction: column;
                        height: 450px; /* Cố định chiều cao của thẻ sản phẩm */
                        overflow: hidden; /* Ẩn nội dung vượt quá chiều cao */
                    }

                    .fruite-img img {
                        width: 100%;
                        height: 250px; /* Cố định chiều cao của hình ảnh */
                        object-fit: cover; /* Ảnh sẽ được cắt để lấp đầy khung mà không bị méo */
                        display: block;
                    }

                    .fruite-item .p-4 {
                        flex: 1; /* Phần nội dung sẽ mở rộng để lấp đầy không gian còn lại */
                        display: flex;
                        flex-direction: column;
                        justify-content: space-between; /* Đảm bảo nội dung và nút "Thêm" được căn đều */
                    }

                    .DesProductShop {
                        display: -webkit-box;
                        -webkit-line-clamp: 2; /* Giới hạn mô tả tối đa 2 dòng */
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        margin-bottom: 10px;
                        color: #4B5563; /* Màu xám đậm cho mô tả */
                    }

                    .text-lg {
                        font-size: 1.125rem; /* Kích thước chữ tiêu đề */
                    }

                    .font-semibold {
                        font-weight: 600; /* Độ đậm của chữ tiêu đề */
                    }

                    .text-dark.fs-5.fw-bold {
                        color: #1F2937; /* Màu đen đậm cho giá */
                    }

                    .btn.border-primary {
                        border-color: #3B82F6; /* Màu viền xanh dương cho nút */
                        color: #3B82F6; /* Màu chữ xanh dương */
                    }

                    .btn.border-primary:hover {
                        background-color: #3B82F6; /* Màu nền xanh dương khi hover */
                        color: white; /* Màu chữ trắng khi hover */
                    }

                    .text-primary {
                        color: #3B82F6 !important; /* Màu xanh dương cho biểu tượng và chữ trong nút */
                    }

                    @media (max-width: 576px) {
                        .img-fluid.w-100.rounded {
                            display: none;
                        }
                    }

                    .fruite-categorie li {
                        margin-bottom: 5px;
                    }
                `}
            </style>
        </>
    );
};

export default Shop;