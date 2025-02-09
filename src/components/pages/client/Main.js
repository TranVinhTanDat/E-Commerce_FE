import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import API_BASE_URL from '../../../utils/config';
 // Giả định rằng bạn đã định nghĩa API_BASE_URL trong file config.js

export default function Main() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState('All Products');
    const [showAllProducts, setShowAllProducts] = useState(false);

    useEffect(() => {
        axios.get(`${API_BASE_URL}/products`)
            .then(response => {
                setProducts(response.data);
            })
            .catch(error => {
                console.error("There was an error fetching the products!", error);
            });

        axios.get(`${API_BASE_URL}/categories`)
            .then(response => {
                setCategories(response.data);
            })
            .catch(error => {
                console.error("There was an error fetching the categories!", error);
            });
    }, []);

    const handleAddToCart = (productId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Please login to add items to cart.');
            return;
        }

        axios.post(`${API_BASE_URL}/cart/add`, {
            productId: productId,
            quantity: 1
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
            toast.success('Product added to cart!');
        })
        .catch(error => {
            console.error('There was an error adding the product to the cart!', error);
            toast.error('Error adding product to cart.');
        });
    };

    const filteredProducts = activeCategory === 'All Products' 
        ? products 
        : products.filter(product => product.category.name === activeCategory);

    const productsToShow = showAllProducts ? filteredProducts : filteredProducts.slice(0, 8);


    return (
        <>
            {/* Modal Search Start */}
            <div className="modal fade" id="searchModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-fullscreen">
                    <div className="modal-content rounded-0">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">Search by keyword</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body d-flex align-items-center">
                            <div className="input-group w-75 mx-auto d-flex">
                                <input type="search" className="form-control p-3" placeholder="keywords" aria-describedby="search-icon-1" />
                                <span id="search-icon-1" className="input-group-text p-3"><i className="fa fa-search"></i></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Modal Search End */}

            {/* Hero Start */}
            <div className="container-fluid py-5 mb-5 hero-header">
                <div className="container py-5">
                    <div className="row g-5 align-items-center">
                        <div className="col-md-12 col-lg-7">
                            <h4 className="mb-3 text-secondary">100% Organic Foods</h4>
                            <h1 className="mb-5 display-3 text-primary">Organic Veggies & Fruits Foods</h1>
                        </div>
                        <div className="col-md-12 col-lg-5">
                            <div id="carouselId" className="carousel slide position-relative" data-bs-ride="carousel">
                                <div className="carousel-inner" role="listbox">
                                    <div className="carousel-item active rounded">
                                        <img src="img/hero-img-1.png" className="img-fluid w-100 h-100 bg-secondary rounded" alt="First slide" />
                                        <a href="#" className="btn px-4 py-2 text-white rounded">Fruits</a>
                                    </div>
                                    <div className="carousel-item rounded">
                                        <img src="img/hero-img-2.jpg" className="img-fluid w-100 h-100 rounded" alt="Second slide" />
                                        <a href="#" className="btn px-4 py-2 text-white rounded">Vegetables</a>
                                    </div>
                                </div>
                                <button className="carousel-control-prev" type="button" data-bs-target="#carouselId" data-bs-slide="prev">
                                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                                    <span className="visually-hidden">Previous</span>
                                </button>
                                <button className="carousel-control-next" type="button" data-bs-target="#carouselId" data-bs-slide="next">
                                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                                    <span className="visually-hidden">Next</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Hero End */}

            {/* Featurs Section Start */}
            <div className="container-fluid featurs py-5">
                <div className="container py-5">
                    <div className="row g-4">
                        <div className="col-md-6 col-lg-3">
                            <div className="featurs-item text-center rounded bg-light p-4">
                                <div className="featurs-icon btn-square rounded-circle bg-secondary mb-5 mx-auto">
                                    <i className="fas fa-car-side fa-3x text-white"></i>
                                </div>
                                <div className="featurs-content text-center">
                                    <h5>Free Shipping</h5>
                                    <p className="mb-0" style={{color:'black'}}>Free on order over $300</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-3">
                            <div className="featurs-item text-center rounded bg-light p-4">
                                <div className="featurs-icon btn-square rounded-circle bg-secondary mb-5 mx-auto">
                                    <i className="fas fa-user-shield fa-3x text-white"></i>
                                </div>
                                <div className="featurs-content text-center">
                                    <h5>Security Payment</h5>
                                    <p className="mb-0" style={{color:'black'}}>100% security payment</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-3">
                            <div className="featurs-item text-center rounded bg-light p-4">
                                <div className="featurs-icon btn-square rounded-circle bg-secondary mb-5 mx-auto">
                                    <i className="fas fa-exchange-alt fa-3x text-white"></i>
                                </div>
                                <div className="featurs-content text-center">
                                    <h5>30 Day Return</h5>
                                    <p className="mb-0" style={{color:'black'}}>30 day money guarantee</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-3">
                            <div className="featurs-item text-center rounded bg-light p-4">
                                <div className="featurs-icon btn-square rounded-circle bg-secondary mb-5 mx-auto">
                                    <i className="fa fa-phone-alt fa-3x text-white"></i>
                                </div>
                                <div className="featurs-content text-center">
                                    <h5>24/7 Support</h5>
                                    <p className="mb-0" style={{color:'black'}}>Support every time fast</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Featurs Section End */}

            {/* Fruits Shop Start */}
            <div className="container-fluid fruite py-5">
                <div className="container py-5">
                    <div className="tab-class text-center">
                        <div className="row g-4">
                            <div className="col-lg-4 text-start">
                                <h1>Our Organic Products</h1>
                            </div>
                            <div className="col-lg-8 text-end">
                                <ul className="nav nav-pills d-inline-flex text-center mb-5">
                                    <li className="nav-item">
                                        <a className={`d-flex m-2 py-2 bg-light rounded-pill ${activeCategory === 'All Products' ? 'active' : ''}`} onClick={() => setActiveCategory('All Products')} style={{ cursor: 'pointer' }}>
                                            <span className="text-dark" style={{ width: '130px' }}>All Products</span>
                                        </a>
                                    </li>
                                    {categories.map(category => (
                                        <li className="nav-item" key={category.id}>
                                            <a className={`d-flex py-2 m-2 bg-light rounded-pill ${activeCategory === category.name ? 'active' : ''}`} onClick={() => setActiveCategory(category.name)} style={{ cursor: 'pointer' }}>
                                                <span className="text-dark" style={{ width: '130px' }}>{category.name}</span>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="tab-content">
                            <div className="tab-pane fade show p-0 active">
                                <div className="row g-4">
                                    {productsToShow.map(product => (
                                        <div key={product.id} className="col-md-6 col-lg-4 col-xl-3">
                                            <div className="rounded position-relative fruite-item">
                                                <div className="fruite-img">
                                                    <Link to={`/shopdetail/${product.id}`}>
                                                        <img src={product.image} className="product-image img-fluid w-100 rounded-top" alt={product.name} />
                                                    </Link>
                                                </div>
                                                <div className="text-white bg-secondary px-3 py-1 rounded position-absolute" style={{ top: '10px', left: '10px' }}>
                                                    {product.category.name}
                                                </div>
                                                <div className="p-4 border border-secondary border-top-0 rounded-bottom">
                                                    <h4>{product.name}</h4>
                                                    <p className='DesProduct' style={{color:'black'}}>{product.description}</p>
                                                    <div className="d-flex justify-content-between flex-lg-wrap">
                                                        <p className="text-dark fs-5 fw-bold mb-0">${product.price}</p>
                                                        <a href="#" className="btn border border-secondary rounded-pill px-3 text-primary" onClick={() => handleAddToCart(product.id)}>
                                                            <i className="fa fa-shopping-bag me-2 text-primary"></i> Add to cart
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {!showAllProducts && filteredProducts.length > 9 && (
                                    <div className="text-center mt-4">
                                        <button className="btn btn-primary btn-custom-view-more" onClick={() => setShowAllProducts(true)}>View More</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Fruits Shop End */}

            {/* Bestseller Product Start */}
            <div className="container-fluid py-5">
                <div className="container py-5">
                    <div className="text-center mx-auto mb-5" style={{ maxWidth: '700px' }}>
                        <h1 className="display-4">Bestseller Products</h1>
                        <p style={{color:'black'}}>Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable.</p>
                    </div>
                    <div className="row g-4">
                        {productsToShow.map(product => (
                            <div key={product.id} className="col-lg-6 col-xl-4">
                                <div className="p-4 rounded bg-light product-card">
                                    <div className="row align-items-center">
                                        <div className="col-12 text-center">
                                            <Link to={`/shopdetail/${product.id}`}>
                                                <img src={product.image} className="product-image img-fluid rounded w-100" alt={product.name} />
                                            </Link>
                                        </div>
                                        <div className="col-12 mt-3 text-center">
                                            <Link to={`/shopdetail/${product.id}`} className="h5 d-block">{product.name}</Link>
                                            <div className="d-flex justify-content-center my-3">
                                                <i className="fas fa-star text-primary"></i>
                                                <i className="fas fa-star text-primary"></i>
                                                <i className="fas fa-star text-primary"></i>
                                                <i className="fas fa-star text-primary"></i>
                                                <i className="fas fa-star"></i>
                                            </div>
                                            <h4 className="mb-3">${product.price}</h4>
                                            <a href="#" className="btn border border-secondary rounded-pill px-3 text-primary" onClick={() => handleAddToCart(product.id)}>
                                                <i className="fa fa-shopping-bag me-2 text-primary"></i> Add to cart
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {!showAllProducts && filteredProducts.length > 9 && (
                        <div className="text-center mt-4">
                            <button className="btn btn-primary btn-custom-view-more" onClick={() => setShowAllProducts(true)}>View More</button>
                        </div>
                    )}
                </div>
            </div>
            {/* Bestseller Product End */}

            {/* Fact Start */}
            <div className="container-fluid py-5">
                <div className="container">
                    <div className="bg-light p-5 rounded">
                        <div className="row g-4 justify-content-center">
                            <div className="col-md-6 col-lg-6 col-xl-3">
                                <div className="counter bg-white rounded p-5">
                                    <i className="fa fa-users text-secondary"></i>
                                    <h4>Satisfied Customers</h4>
                                    <h1>1963</h1>
                                </div>
                            </div>
                            <div className="col-md-6 col-lg-6 col-xl-3">
                                <div className="counter bg-white rounded p-5">
                                    <i className="fa fa-users text-secondary"></i>
                                    <h4>Quality of Service</h4>
                                    <h1>99%</h1>
                                </div>
                            </div>
                            <div className="col-md-6 col-lg-6 col-xl-3">
                                <div className="counter bg-white rounded p-5">
                                    <i className="fa fa-users text-secondary"></i>
                                    <h4>Quality Certificates</h4>
                                    <h1>33</h1>
                                </div>
                            </div>
                            <div className="col-md-6 col-lg-6 col-xl-3">
                                <div className="counter bg-white rounded p-5">
                                    <i className="fa fa-users text-secondary"></i>
                                    <h4>Available Products</h4>
                                    <h1>789</h1>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Fact End */}

            {/* Testimonial Start */}
            <div className="container-fluid testimonial py-5">
                <div className="container py-5">
                    <div className="testimonial-header text-center">
                        <h4 className="text-primary">Our Testimonial</h4>
                        <h1 className="display-5 mb-5 text-dark">Our Clients Saying!</h1>
                    </div>
                    <div className="owl-carousel testimonial-carousel">
                        <div className="testimonial-item img-border-radius bg-light rounded p-4">
                            <div className="position-relative">
                                <i className="fa fa-quote-right fa-2x text-secondary position-absolute" style={{ bottom: '30px', right: 0 }}></i>
                                <div className="mb-4 pb-4 border-bottom border-secondary">
                                    <p className="mb-0">Lorem Ipsum is simply dummy text of the printing. Ipsum has been the industry's standard dummy text ever since the 1500s.</p>
                                </div>
                                <div className="d-flex align-items-center flex-nowrap">
                                    <div className="bg-secondary rounded">
                                        <img src="img/testimonial-1.jpg" className="img-fluid rounded" style={{ width: '100px', height: '100px' }} alt="" />
                                    </div>
                                    <div className="ms-4 d-block">
                                        <h4 className="text-dark">Client Name</h4>
                                        <p className="m-0 pb-3">Profession</p>
                                        <div className="d-flex pe-5">
                                            <i className="fas fa-star text-primary"></i>
                                            <i className="fas fa-star text-primary"></i>
                                            <i className="fas fa-star text-primary"></i>
                                            <i className="fas fa-star text-primary"></i>
                                            <i className="fas fa-star"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="testimonial-item img-border-radius bg-light rounded p-4">
                            <div className="position-relative">
                                <i className="fa fa-quote-right fa-2x text-secondary position-absolute" style={{ bottom: '30px', right: 0 }}></i>
                                <div className="mb-4 pb-4 border-bottom border-secondary">
                                    <p className="mb-0">Lorem Ipsum is simply dummy text of the printing. Ipsum has been the industry's standard dummy text ever since the 1500s.</p>
                                </div>
                                <div className="d-flex align-items-center flex-nowrap">
                                    <div className="bg-secondary rounded">
                                        <img src="img/testimonial-1.jpg" className="img-fluid rounded" style={{ width: '100px', height: '100px' }} alt="" />
                                    </div>
                                    <div className="ms-4 d-block">
                                        <h4 className="text-dark">Client Name</h4>
                                        <p className="m-0 pb-3">Profession</p>
                                        <div className="d-flex pe-5">
                                            <i className="fas fa-star text-primary"></i>
                                            <i className="fas fa-star text-primary"></i>
                                            <i className="fas fa-star text-primary"></i>
                                            <i className="fas fa-star text-primary"></i>
                                            <i className="fas fa-star"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="testimonial-item img-border-radius bg-light rounded p-4">
                            <div className="position-relative">
                                <i className="fa fa-quote-right fa-2x text-secondary position-absolute" style={{ bottom: '30px', right: 0 }}></i>
                                <div className="mb-4 pb-4 border-bottom border-secondary">
                                    <p className="mb-0">Lorem Ipsum is simply dummy text of the printing. Ipsum has been the industry's standard dummy text ever since the 1500s.</p>
                                </div>
                                <div className="d-flex align-items-center flex-nowrap">
                                    <div className="bg-secondary rounded">
                                        <img src="img/testimonial-1.jpg" className="img-fluid rounded" style={{ width: '100px', height: '100px' }} alt="" />
                                    </div>
                                    <div className="ms-4 d-block">
                                        <h4 className="text-dark">Client Name</h4>
                                        <p className="m-0 pb-3">Profession</p>
                                        <div className="d-flex pe-5">
                                            <i className="fas fa-star text-primary"></i>
                                            <i className="fas fa-star text-primary"></i>
                                            <i className="fas fa-star text-primary"></i>
                                            <i className="fas fa-star text-primary"></i>
                                            <i className="fas fa-star"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Testimonial End */}
            <ToastContainer />
        </>
    );
}
