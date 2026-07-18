import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { addToCart } from '../store/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../store/slices/wishlistSlice';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedVariantWeight, setSelectedVariantWeight] = useState(null);

  const thumbnailContainerRef = useRef(null);
  const activeThumbnailRef = useRef(null);

  const API_URL = process.env.REACT_APP_API_URL || 'https://biharkaswaad.in/api';

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API_URL}/products/${id}`);
        setProduct(data.data);
        setSelectedImage(data.data.imageUrl);

        if (data.data.variants && data.data.variants.length > 0) {
          setSelectedVariantWeight(data.data.variants[0].weight);
        } else {
          setSelectedVariantWeight(null);
        }

        // Fetch related products (same category)
        if (data.data.category) {
          const relatedRes = await axios.get(`${API_URL}/products?category=${data.data.category}`);
          const related = relatedRes.data.data.filter(p => p.id !== parseInt(id)).slice(0, 4);
          setRelatedProducts(related);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo(0, 0);
  }, [id, API_URL]);

  const displayPrice = useMemo(() => {
    if (!product) return 0;
    if (selectedVariantWeight && product.variants && product.variants.length > 0) {
      const v = product.variants.find(v => v.weight === selectedVariantWeight);
      if (v && v.price) return parseFloat(v.price);
    }
    return parseFloat(product.price);
  }, [product, selectedVariantWeight]);

  // Center thumbnail when selected
  useEffect(() => {
    if (activeThumbnailRef.current && thumbnailContainerRef.current) {
      const container = thumbnailContainerRef.current;
      const thumbnail = activeThumbnailRef.current;
      
      const containerHalfWidth = container.offsetWidth / 2;
      const thumbnailHalfWidth = thumbnail.offsetWidth / 2;
      
      const scrollPosition = thumbnail.offsetLeft - containerHalfWidth + thumbnailHalfWidth;
      
      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  }, [selectedImage]);

  // Check if product is in wishlist
  const isInWishlist = wishlistItems.some(item => (item.productId === product?.id || item.product?.id === product?.id || item.product?._id === product?._id));

  // Quantity handlers
  const increaseQuantity = () => {
    if (quantity < (product?.stock || 0)) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleQuantityInput = (e) => {
    const value = parseInt(e.target.value) || 1;
    if (value >= 1 && value <= (product?.stock || 0)) {
      setQuantity(value);
    }
  };

  // Add to cart handler
  const handleAddToCart = () => {
    if (!isAuthenticated) {
      alert('Please login to add items to cart');
      navigate('/login');
      return;
    }

    if (product.stock === 0) {
      alert('❌ Product is out of stock');
      return;
    }

    dispatch(addToCart({ productId: product.id, quantity, variantWeight: selectedVariantWeight }));
    alert(`✅ Added ${quantity} item(s) to cart!`);
  };

  // Buy now handler
  const handleBuyNow = () => {
    if (!isAuthenticated) {
      alert('Please login to proceed');
      navigate('/login');
      return;
    }

    if (product.stock === 0) {
      alert('❌ Product is out of stock');
      return;
    }

    dispatch(addToCart({ productId: product.id, quantity, variantWeight: selectedVariantWeight }));
    navigate('/cart');
  };

  // Wishlist toggle
  const handleWishlistToggle = () => {
    if (!isAuthenticated) {
      alert('Please login to add to wishlist');
      navigate('/login');
      return;
    }

    if (isInWishlist) {
      dispatch(removeFromWishlist(product.id || product._id));
    } else {
      dispatch(addToWishlist(product.id || product._id));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Product Not Found</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Link
              to="/products"
              className="inline-block bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
            >
              Back to Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8 text-sm" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-2">
            <li>
              <Link to="/" className="text-gray-500 hover:text-orange-600">Home</Link>
            </li>
            <li>
              <span className="text-gray-400 mx-2">/</span>
            </li>
            <li>
              <Link to="/products" className="text-gray-500 hover:text-orange-600">Products</Link>
            </li>
            <li>
              <span className="text-gray-400 mx-2">/</span>
            </li>
            <li className="text-gray-700 font-medium">{product.name}</li>
          </ol>
        </nav>

        {/* Product Details Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4 md:p-8">
            {/* Product Image Section */}
            {/* Product Image Section */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative mb-4 md:mb-0">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt={product.name}
                    className="w-full h-[500px] object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-[500px] bg-gray-200 rounded-lg flex items-center justify-center">
                    <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}

                {/* Wishlist Button on Image */}
                <button
                  onClick={handleWishlistToggle}
                  className="absolute top-4 right-4 bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
                >
                  <svg
                    className={`w-6 h-6 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                    fill={isInWishlist ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>

                {/* Stock Badge */}
                {product.stock === 0 && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Out of Stock
                  </div>
                )}

                {product.featured && product.stock > 0 && (
                  <div className="absolute top-4 left-4 bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Featured
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {product.images && product.images.length > 0 && (
                <div 
                  ref={thumbnailContainerRef}
                  className="flex flex-row md:flex-col gap-4 overflow-x-auto md:overflow-y-auto py-2 md:py-0 md:pr-2 md:h-[500px]" 
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  <style>{`
                    .flex.gap-4.overflow-x-auto::-webkit-scrollbar, .md\\:overflow-y-auto::-webkit-scrollbar { display: none; }
                  `}</style>
                  {[product.imageUrl, ...(product.images.filter(img => img !== product.imageUrl))].filter(Boolean).map((imgUrl, index) => (
                    <button
                      key={index}
                      ref={selectedImage === imgUrl ? activeThumbnailRef : null}
                      onClick={() => setSelectedImage(imgUrl)}
                      className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === imgUrl ? 'border-orange-500 shadow-md transform scale-105' : 'border-transparent hover:border-orange-300'
                      }`}
                    >
                      <img src={imgUrl} alt={`Thumbnail ${index}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info Section */}
            <div className="flex flex-col">
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="inline-block bg-orange-100 text-orange-800 text-xs font-semibold px-3 py-1 rounded-full">
                  {product.category}
                </span>
                {product.subCategory && (
                  <span className="inline-block bg-gray-100 text-gray-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {product.subCategory}
                  </span>
                )}
                {(selectedVariantWeight || product.packet) && (
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                    Size: {selectedVariantWeight || product.packet}
                  </span>
                )}
                {product.sku && (
                  <span className="inline-block bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">
                    SKU: {product.sku}
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              {/* Ratings */}
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-5 h-5 ${star <= (product.ratings?.average || 0)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                        }`}
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">
                  ({product.ratings?.count || 0} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-green-600">
                    ₹{displayPrice}
                  </span>
                  {product.mrp && product.mrp > displayPrice && (
                    <span className="text-xl text-gray-400 line-through">
                      ₹{product.mrp}
                    </span>
                  )}
                  <span className="text-sm text-gray-500">
                    (Inclusive of all taxes)
                  </span>
                </div>
                {product.mrp && product.mrp > displayPrice && (
                  <div className="text-sm text-green-600 font-semibold mt-1">
                    You save ₹{(product.mrp - displayPrice).toFixed(2)} ({Math.round(((product.mrp - displayPrice) / product.mrp) * 100)}%)
                  </div>
                )}
              </div>

              {/* Variants Selector */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Available Variants</h3>
                  <div className="flex flex-wrap gap-3">
                    {product.variants.map((v, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedVariantWeight(v.weight)}
                        className={`px-4 py-2 rounded-full border-2 text-sm font-semibold transition-all ${
                          selectedVariantWeight === v.weight
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-gray-200 text-gray-600 hover:border-orange-300 hover:bg-gray-50'
                        }`}
                      >
                        {v.weight}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock Status */}
              <div className="mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Availability:</span>
                  {product.stock > 0 ? (
                    <span className="text-green-600 font-semibold">
                      In Stock ({product.stock} units available)
                    </span>
                  ) : (
                    <span className="text-red-600 font-semibold">Out of Stock</span>
                  )}
                </div>
              </div>


              {/* Quantity Selector */}
              {product.stock > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center border-2 border-gray-300 rounded-lg">
                      <button
                        onClick={decreaseQuantity}
                        disabled={quantity <= 1}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                        </svg>
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={product.stock}
                        value={quantity}
                        onChange={handleQuantityInput}
                        className="w-20 text-center py-2 border-x-2 border-gray-300 focus:outline-none font-semibold"
                      />
                      <button
                        onClick={increaseQuantity}
                        disabled={quantity >= product.stock}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                    <span className="text-sm text-gray-600">
                      Max {product.stock} units
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 bg-orange-600 text-white px-8 py-4 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 font-semibold text-lg flex items-center justify-center gap-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="flex-1 bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 font-semibold text-lg flex items-center justify-center gap-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Buy Now
                </button>
              </div>

              {product.flipkartLink && (
                <div className="mb-6">
                  <a
                    href={product.flipkartLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition duration-200 font-semibold text-lg flex items-center justify-center gap-2 shadow-md"
                  >
                    Buy on Flipkart
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}

              {/* Description */}
              <div className="mb-6 border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>

              {/* Additional Info */}
              <div className="border-t pt-6 space-y-3">
                <div className="flex items-center gap-3 text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm">100% Authentic Products</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="text-sm">Easy 7 days return policy</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  to={`/products/${relatedProduct.id}`}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  {relatedProduct.imageUrl && (
                    <img
                      src={relatedProduct.imageUrl}
                      alt={relatedProduct.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {relatedProduct.name}
                    </h3>
                    <p className="text-2xl font-bold text-green-600">₹{relatedProduct.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
