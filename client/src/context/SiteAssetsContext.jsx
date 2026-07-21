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
          const link = document.getElementById('favicon');
          if (link) {
            link.href = data.data.logoUrl;
          }
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