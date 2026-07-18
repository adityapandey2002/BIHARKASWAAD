import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSiteAssets } from '../context/SiteAssetsContext';

const Blogs = () => {
  const { slideshow, loading: assetsLoading } = useSiteAssets();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const API_URL = process.env.REACT_APP_API_URL || 'https://biharkaswaad.in/api';

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/blogs`);
        setBlogs(data.data || []);
      } catch (error) {
        console.error('Error fetching blogs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, [API_URL]);

  // Auto-play slideshow
  useEffect(() => {
    if (!slideshow || slideshow.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideshow.length);
    }, 5000); // 5 seconds per slide
    return () => clearInterval(timer);
  }, [slideshow]);

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Slideshow Section */}
      {!assetsLoading && slideshow && slideshow.length > 0 && (
        <div className="relative w-full h-[300px] md:h-[500px] overflow-hidden mb-12 bg-black">
          {slideshow.map((slide, index) => (
            <div
              key={slide.id || index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <img
                src={slide.imageUrl}
                alt={slide.title}
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">{slide.title}</h2>
                {slide.subtitle && (
                  <p className="text-lg md:text-xl text-white mb-6 drop-shadow-md">{slide.subtitle}</p>
                )}
                {slide.buttonText && slide.buttonLink && (
                  <a href={slide.buttonLink} className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-full font-bold shadow-lg transition-transform transform hover:scale-105">
                    {slide.buttonText}
                  </a>
                )}
              </div>
            </div>
          ))}
          {/* Dots */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-20">
            {slideshow.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-3 h-3 rounded-full transition-colors ${idx === currentSlide ? 'bg-orange-500' : 'bg-white bg-opacity-50'}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Blogs Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-4">Our Heritage & Stories</h1>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">Discover the rich culture, traditional recipes, and stories behind Bihar's authentic flavors.</p>

        {loading ? (
          <div className="text-center py-12">Loading blogs...</div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No blogs published yet.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <article key={blog.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow flex flex-col">
                {blog.imageUrl && (
                  <img
                    src={blog.imageUrl}
                    alt={blog.title}
                    className="w-full h-56 object-cover"
                  />
                )}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-2.5 py-0.5 rounded uppercase tracking-wide">
                      {blog.category}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">{blog.title}</h2>
                  <p className="text-gray-600 mb-4 flex-1">{blog.excerpt}</p>
                  <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
                    <span>By {blog.author}</span>
                    <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blogs;
