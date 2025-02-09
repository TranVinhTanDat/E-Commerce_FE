import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import moment from 'moment';
import API_BASE_URL from '../../../utils/config';


function ShopDetail() {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [rating, setRating] = useState(0);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        axios.get(`${API_BASE_URL}/products/${productId}`, { headers })
            .then(response => {
                setProduct(response.data);
            })
            .catch(error => {
                console.error("There was an error fetching the product!", error);
            });

        fetchComments(token);
    }, [productId]);

    const fetchComments = (token) => {
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        axios.get(`${API_BASE_URL}/comments/product/${productId}`, { headers })
            .then(response => {
                setComments(response.data);
            })
            .catch(error => {
                console.error("There was an error fetching the comments!", error);
            });
    };

    const handleAddToCart = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Please login to add items to cart.');
            return;
        }

        axios.post(`${API_BASE_URL}/cart/add`, {
            productId: product.id,
            quantity: quantity
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

    const handleQuantityChange = (amount) => {
        setQuantity(prevQuantity => Math.max(prevQuantity + amount, 1));
    };

    const handleAddComment = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Please login to add a comment.');
            return;
        }

        axios.post(`${API_BASE_URL}/comments/add`, {
            productId: product.id,
            commentText: commentText,
            rating: rating
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
            toast.success('Comment added successfully!');
            setCommentText('');
            setRating(0);
            fetchComments(token); // Refresh comments after adding
        })
        .catch(error => {
            console.error('Please purchase product to review!!', error);
            toast.error('Please purchase product to review!');
        });
    };

    if (!product) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            {/* Single Page Header start */}
            <div className="container-fluid page-header py-5">
                <h1 className="text-center text-white display-6">Shop Detail</h1>
                <ol className="breadcrumb justify-content-center mb-0">
                    <li className="breadcrumb-item"><a href="#">Home</a></li>
                    <li className="breadcrumb-item"><a href="#">Pages</a></li>
                    <li className="breadcrumb-item active text-white">Shop Detail</li>
                </ol>
            </div>
            {/* Single Page Header End */}

            {/* Single Product Start */}
            <div className="container-fluid py-5 mt-5">
                <div className="container py-5">
                    <div className="row g-4 mb-5">
                        <div className="col-lg-8 col-xl-9">
                            <div className="row g-4">
                                <div className="col-lg-6">
                                    <div className="border rounded">
                                        <a href="#">
                                            <img src={product.image} className="product-detail-image img-fluid rounded" alt="Image" />
                                        </a>
                                    </div>
                                </div>
                                <div className="col-lg-6 text-start">
                                    <h4 className="fw-bold mb-3">{product.name}</h4>
                                    <p className="mb-3 text-start" style={{color:'black'}}>Category: {product.category.name}</p>
                                    <h5 className="fw-bold mb-3">${product.price}</h5>
                                    <div className="d-flex mb-4">
                                        <i className="fa fa-star text-secondary"></i>
                                        <i className="fa fa-star text-secondary"></i>
                                        <i className="fa fa-star text-secondary"></i>
                                        <i className="fa fa-star text-secondary"></i>
                                        <i className="fa fa-star"></i>
                                    </div>
                                    <p className="mb-4 text-start" style={{color:'black'}}>{product.description}</p>
                                    <div className="input-group quantity mb-5" style={{ width: '100px' }}>
                                        <div className="input-group-btn">
                                            <button className="btn btn-sm btn-minus rounded-circle bg-light border" onClick={() => handleQuantityChange(-1)}>
                                                <i className="fa fa-minus"></i>
                                            </button>
                                        </div>
                                        <input type="text" className="form-control form-control-sm text-center border-0" style={{marginBottom:'10px'}} value={quantity} readOnly />
                                        <div className="input-group-btn">
                                            <button className="btn btn-sm btn-plus rounded-circle bg-light border" onClick={() => handleQuantityChange(1)}>
                                                <i className="fa fa-plus"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <button className="btn border border-secondary rounded-pill px-4 py-2 mb-4 text-primary" onClick={handleAddToCart}>
                                        <i className="fa fa-shopping-bag me-2 text-primary"></i> Add to cart
                                    </button>
                                </div>
                                <div className="col-lg-12">
                                <nav>
                                    <div className="nav nav-tabs mb-3 justify-content-center" role="tablist">
                                        <button className="nav-link active border-white border-bottom-0" type="button" role="tab"
                                            id="nav-about-tab" data-bs-toggle="tab" data-bs-target="#nav-about"
                                            aria-controls="nav-about" aria-selected="true">Description</button>
                                        <button className="nav-link border-white border-bottom-0" type="button" role="tab"
                                            id="nav-mission-tab" data-bs-toggle="tab" data-bs-target="#nav-mission"
                                            aria-controls="nav-mission" aria-selected="false">Reviews</button>
                                    </div>
                                </nav>

                                    <div className="tab-content mb-5">
                                        <div className="tab-pane active" id="nav-about" role="tabpanel" aria-labelledby="nav-about-tab">
                                            <p className="text-start" style={{color:'black', marginLeft:'19px'}}>{product.description}</p>
                                        </div>
                                        <div className="tab-pane" id="nav-mission" role="tabpanel" aria-labelledby="nav-mission-tab">
                                            {comments.map(comment => (
                                                <div className="d-flex mt-4 align-items-start" key={comment.id}>
                                                    <img src={comment.user.avatar || "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png"} className="img-fluid rounded-circle p-3" style={{ width: '100px', height: '100px' }} alt={comment.user.username} />
                                                    <div className="ms-3 flex-grow-1">
                                                        <p className="mb-2 text-start" style={{ fontSize: '14px', color:'black' }}>{moment(comment.createdAt).format('MMMM DD, YYYY')}</p>
                                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                                            <h5 className="text-start">{comment.user.username}</h5>
                                                            <div className="d-flex">
                                                                {[...Array(comment.rating)].map((_, i) => (
                                                                    <i className="fa fa-star text-secondary" key={i}></i>
                                                                ))}
                                                                {[...Array(5 - comment.rating)].map((_, i) => (
                                                                    <i className="fa fa-star" key={i}></i>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <p className="text-dark text-start">{comment.commentText}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="tab-pane" id="nav-vision" role="tabpanel">
                                            <p className="text-dark text-start">Tempor erat elitr rebum at clita. Diam dolor diam ipsum et tempor sit. Aliqu diam
                                                amet diam et eos labore. 3</p>
                                            <p className="mb-0 text-start">Diam dolor diam ipsum et tempor sit. Aliqu diam amet diam et eos labore.
                                                Clita erat ipsum et lorem et sit</p>
                                        </div>
                                    </div>
                                </div>
                                <form>
                                    <h4 className="mb-5 fw-bold text-start">Leave a Reply</h4>
                                    <div className="row g-4">
                                        <div className="col-lg-12">
                                            <div className="border-bottom rounded my-4">
                                                <textarea 
                                                    name="" 
                                                    id="" 
                                                    className="form-control border-0 text-start" 
                                                    cols="30" 
                                                    rows="8" 
                                                    placeholder="Your Review *" 
                                                    spellCheck="false"
                                                    value={commentText}
                                                    onChange={(e) => setCommentText(e.target.value)}
                                                ></textarea>
                                            </div>
                                        </div>
                                        <div className="col-lg-12">
                                            <div className="d-flex justify-content-between py-3 mb-5">
                                                <div className="d-flex align-items-center">
                                                    <p className="mb-0 me-3">Please rate:</p>
                                                    <div className="d-flex align-items-center" style={{ fontSize: '12px' }}>
                                                        {[...Array(5)].map((_, i) => (
                                                            <i
                                                                key={i}
                                                                className={`fa fa-star ${i < rating ? 'text-secondary' : 'text-muted'}`}
                                                                onClick={() => setRating(i + 1)}
                                                            ></i>
                                                        ))}
                                                    </div>
                                                </div>
                                                <button 
                                                    type="button" 
                                                    className="btn border border-secondary text-primary rounded-pill px-4 py-3"
                                                    onClick={handleAddComment}
                                                >
                                                    Post Comment
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div className="col-lg-4 col-xl-3">
                            <div className="row g-4 fruite">
                                <div className="col-lg-12">
                                    <div className="mb-4 text-start">
                                        <h4>Categories</h4>
                                        <ul className="list-unstyled fruite-categorie">
                                            <li>
                                                <div className="d-flex justify-content-between fruite-name">
                                                    <a href="#"><i className="fas fa-apple-alt me-2"></i>Apples</a>
                                                    <span>(3)</span>
                                                </div>
                                            </li>
                                            <li>
                                                <div className="d-flex justify-content-between fruite-name">
                                                    <a href="#"><i className="fas fa-apple-alt me-2"></i>Oranges</a>
                                                    <span>(5)</span>
                                                </div>
                                            </li>
                                            <li>
                                                <div className="d-flex justify-content-between fruite-name">
                                                    <a href="#"><i className="fas fa-apple-alt me-2"></i>Strawbery</a>
                                                    <span>(2)</span>
                                                </div>
                                            </li>
                                            <li>
                                                <div className="d-flex justify-content-between fruite-name">
                                                    <a href="#"><i className="fas fa-apple-alt me-2"></i>Banana</a>
                                                    <span>(8)</span>
                                                </div>
                                            </li>
                                            <li>
                                                <div className="d-flex justify-content-between fruite-name">
                                                    <a href="#"><i className="fas fa-apple-alt me-2"></i>Pumpkin</a>
                                                    <span>(5)</span>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Single Product End */}
            <ToastContainer />
        </div>
    );
}

export default ShopDetail;
