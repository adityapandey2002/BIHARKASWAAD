const path = require('path');
const fs = require('fs');
const { SiteAssets, SlideshowItem } = require('../models/index');

const buildImageUrl = (req, imagePath) => {
  if (!imagePath) return null;
  return `${req.protocol}://${req.get('host')}/api/${imagePath.replace(/^\\/, '')}`;
};

const deleteImageFile = (imagePath) => {
  if (!imagePath) return;
  const full = path.join(__dirname, '..', imagePath);
  if (fs.existsSync(full)) fs.unlinkSync(full);
};

// Helper: get or create the single site assets row
const getOrCreateAssets = async () => {
  let assets = await SiteAssets.findOne();
  if (!assets) {
    assets = await SiteAssets.create({ siteName: 'Bihar Ka Swaad', tagline: 'Authentic Flavors from Bihar' });
  }
  return assets;
};

// ── GET Site Assets ───────────────────────────────────────────────────────────
exports.getSiteAssets = async (req, res) => {
  try {
    const assets = await getOrCreateAssets();
    const slideshow = await SlideshowItem.findAll({ where: { active: true }, order: [['orderNum', 'ASC']] });

    const obj = assets.toJSON();
    obj.logoUrl = buildImageUrl(req, obj.logoPath);
    obj.slideshow = slideshow.map((s) => {
      const so = s.toJSON();
      so.imageUrl = buildImageUrl(req, so.imagePath);
      return so;
    });

    console.log('✅ Site assets sent');
    res.status(200).json({ status: 'success', data: obj });
  } catch (error) {
    console.error('❌ Error fetching site assets:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ── UPLOAD Logo (Admin) ───────────────────────────────────────────────────────
exports.uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'Please upload a logo image' });
    }

    const assets = await getOrCreateAssets();

    // Delete old logo file
    deleteImageFile(assets.logoPath);

    assets.logoPath = req.file.path.replace(/\\/g, '/');
    assets.logoContentType = req.file.mimetype;
    await assets.save();

    const obj = assets.toJSON();
    obj.logoUrl = buildImageUrl(req, obj.logoPath);

    console.log('✅ Logo updated');
    res.status(200).json({ status: 'success', message: 'Logo updated successfully', data: obj });
  } catch (error) {
    console.error('❌ Error uploading logo:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ── ADD Slideshow Image (Admin) ───────────────────────────────────────────────
exports.addSlideshow = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'Please upload a slideshow image' });
    }

    const { title, subtitle, buttonText, buttonLink, order } = req.body;
    const count = await SlideshowItem.count();

    const slide = await SlideshowItem.create({
      title: title || 'Welcome to Bihar Ka Swaad',
      subtitle: subtitle || '',
      buttonText: buttonText || 'Shop Now',
      buttonLink: buttonLink || '/products',
      imagePath: req.file.path.replace(/\\/g, '/'),
      imageContentType: req.file.mimetype,
      orderNum: parseInt(order) || count,
      uploadedAt: new Date(),
    });

    const obj = slide.toJSON();
    obj.imageUrl = buildImageUrl(req, obj.imagePath);

    console.log('✅ Slideshow added');
    res.status(200).json({ status: 'success', message: 'Slideshow image added successfully', data: obj });
  } catch (error) {
    console.error('❌ Error adding slideshow:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ── DELETE Slideshow Image (Admin) ────────────────────────────────────────────
exports.deleteSlideshow = async (req, res) => {
  try {
    const { slideId } = req.params;
    const slide = await SlideshowItem.findByPk(slideId);

    if (!slide) {
      return res.status(404).json({ status: 'error', message: 'Slideshow item not found' });
    }

    deleteImageFile(slide.imagePath);
    await slide.destroy();

    console.log('🗑️ Slideshow deleted');
    res.status(200).json({ status: 'success', message: 'Slideshow image deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting slideshow:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ── UPDATE Site Settings (Admin) ──────────────────────────────────────────────
exports.updateSiteSettings = async (req, res) => {
  try {
    const { siteName, tagline } = req.body;
    const assets = await getOrCreateAssets();

    if (siteName) assets.siteName = siteName;
    if (tagline) assets.tagline = tagline;
    await assets.save();

    console.log('✅ Site settings updated');
    res.status(200).json({ status: 'success', message: 'Site settings updated successfully', data: assets });
  } catch (error) {
    console.error('❌ Error updating site settings:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};
