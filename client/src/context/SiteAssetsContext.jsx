import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const SiteAssetsContext = createContext();

export const useSiteAssets = () => {
  const context = useContext(SiteAssetsContext);
  if (!context) {
    throw new Error('useSiteAssets must be used within SiteAssetsProvider');
  }
  return context;
};

export const SiteAssetsProvider = ({ children }) => {
  const [assets, setAssets] = useState({
    logoUrl: null,
    siteName: 'Bihar Ka Swaad',
    tagline: 'Authentic Flavors from Bihar',
    heroImage: null,
    heroVideo1: null,
    heroVideo2: null,
    slideshow: [],
    loading: true,
    error: null
  });

  const API_URL = process.env.REACT_APP_API_URL || 'https://biharkaswaad.in/api';

  useEffect(() => {
    const fetchSiteAssets = async () => {
      try {
        console.log('🔄 Fetching site assets...');
        const { data } = await axios.get(`${API_URL}/site-assets`);

        setAssets({
          logoUrl: data.data.logoUrl || null,
          siteName: data.data.siteName || 'Bihar Ka Swaad',
          tagline: data.data.tagline || 'Authentic Flavors from Bihar',
          heroImage: data.data.heroImage || null,
          heroVideo1: data.data.heroVideo1 || null,
          heroVideo2: data.data.heroVideo2 || null,
          slideshow: data.data.slideshow || [],
          loading: false,
          error: null
        });

        if (data.data.logoUrl) {
          const img = new Image();
          img.crossOrigin = 'Anonymous';
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const size = Math.min(img.width, img.height);
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            
            // Draw circular mask
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            
            // Draw image centered and covering the circle
            const scale = Math.max(size / img.width, size / img.height);
            const x = (size / 2) - (img.width / 2) * scale;
            const y = (size / 2) - (img.height / 2) * scale;
            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
            
            // Completely replace the link element to force browser refresh
            const oldLink = document.getElementById('favicon');
            if (oldLink) document.head.removeChild(oldLink);
            
            const newLink = document.createElement('link');
            newLink.id = 'favicon';
            newLink.rel = 'icon';
            newLink.type = 'image/png';
            newLink.href = canvas.toDataURL('image/png');
            document.head.appendChild(newLink);
          };
          img.onerror = () => {
            console.error('❌ Failed to load logo for favicon canvas crop. CORS issue or invalid URL.');
          };
          // Try fetching with cache busting to avoid tainted canvas if cached without CORS
          img.src = data.data.logoUrl + '?c=' + new Date().getTime();
        }

        console.log('✅ Site assets loaded successfully');
      } catch (error) {
        console.error('❌ Error fetching site assets:', error);
        setAssets(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
      }
    };

    fetchSiteAssets();
  }, [API_URL]);

  const refreshAssets = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/site-assets`);
      setAssets({
        logoUrl: data.data.logoUrl || null,
        siteName: data.data.siteName || 'Bihar Ka Swaad',
        tagline: data.data.tagline || 'Authentic Flavors from Bihar',
        heroImage: data.data.heroImage || null,
        heroVideo1: data.data.heroVideo1 || null,
        heroVideo2: data.data.heroVideo2 || null,
        slideshow: data.data.slideshow || [],
        loading: false,
        error: null
      });
      console.log('✅ Site assets refreshed');
    } catch (error) {
      console.error('❌ Error refreshing site assets:', error);
    }
  };

  return (
    <SiteAssetsContext.Provider value={{ ...assets, refreshAssets }}>
      {children}
    </SiteAssetsContext.Provider>
  );
};