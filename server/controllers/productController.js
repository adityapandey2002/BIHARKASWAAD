const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');
const { Product } = require('../models/index');

// Helper: build public URL for an image
// Images are served via /api/media/ to bypass ModSecurity rules targeting /uploads/
const buildImageUrl = (req, imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath; // Return external URL directly (e.g. Cloudinary)
  const cleanPath = imagePath.replace(/\\/g, '/').replace(/^\//, '');
  const relativePath = cleanPath.replace(/^uploads\//, '');
  const host = `${req.protocol}://${req.get('host')}`;
  return `${host}/api/media/${relativePath}`;
};

// Helper: safely map images array
const safeMapImages = (images, req) => {
  if (!images) return [];
  let parsed = images;
  if (typeof images === 'string') {
    try {
      parsed = JSON.parse(images);
    } catch (e) {
      return [];
    }
  }
  return Array.isArray(parsed) ? parsed.map(img => buildImageUrl(req, img)) : [];
};

// Helper: safely parse JSON field (MySQL sometimes returns JSON columns as strings)
const safeParseJSON = (val, fallback = []) => {
  if (!val) return fallback;
  if (Array.isArray(val) || (typeof val === 'object' && val !== null)) return val;
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch (e) { return fallback; }
  }
  return fallback;
};

// Helper: delete old image file from disk
const deleteImageFile = (imagePath) => {
  if (!imagePath) return;
  try {
    const fullPath = path.join(__dirname, '..', imagePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (err) {
    console.error(`❌ Failed to delete image file: ${imagePath}`, err);
  }
};

// ── GET All Products ──────────────────────────────────────────────────────────
exports.getAllProducts = async (req, res) => {
  try {
    const { category, search, featured } = req.query;

    const where = { published: true };
    if (category) where.category = category;
    if (featured === 'true') where.featured = true;
    if (search) where.name = { [Op.like]: `%${search}%` };

    const products = await Product.findAll({ where, order: [['createdAt', 'DESC']] });

    const result = products.map((p) => {
      const obj = p.toJSON();
      obj.imageUrl = buildImageUrl(req, obj.imagePath);
      obj.images = safeMapImages(obj.images, req);
      obj.variants = safeParseJSON(obj.variants, []);
      return obj;
    });

    console.log(`✅ Sending ${result.length} products`);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ── GET Single Product ────────────────────────────────────────────────────────
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product || !product.published) {
      return res.status(404).json({ status: 'error', message: 'Product not found' });
    }

    const obj = product.toJSON();
    obj.imageUrl = buildImageUrl(req, obj.imagePath);
    obj.images = safeMapImages(obj.images, req);
    obj.variants = safeParseJSON(obj.variants, []);

    res.status(200).json({ status: 'success', data: obj });
  } catch (error) {
    res.status(400).json({ status: 'error', message: 'Invalid product ID' });
  }
};

// ── CREATE Product (Admin) ────────────────────────────────────────────────────
exports.createProduct = async (req, res) => {
  try {
    let parsedVariants = [];
    if (req.body.variants) {
      try {
        parsedVariants = JSON.parse(req.body.variants);
      } catch (e) {
        console.error('Invalid variants JSON');
      }
    }

    // Support for multiple images provided as an array of URLs or a single URL string
    let finalImages = [];
    if (req.body.images) {
      let parsedImages = req.body.images;
      if (typeof parsedImages === 'string') {
        try {
          parsedImages = JSON.parse(parsedImages);
        } catch (e) {
          // If it's a comma-separated string or single URL
          parsedImages = parsedImages.split(',').map(url => url.trim());
        }
      }
      finalImages = Array.isArray(parsedImages) ? parsedImages : [];
    }

    // Merge uploaded local files if they exist
    if (req.files && req.files.length > 0) {
      const imagePaths = req.files.map(f => f.path.replace(/\\/g, '/'));
      finalImages = [...finalImages, ...imagePaths];
    }

    if (finalImages.length === 0) {
      return res.status(400).json({ status: 'error', message: 'Please provide at least one product image' });
    }

    const product = await Product.create({
      name: req.body.name,
      description: req.body.description,
      price: parseFloat(req.body.price),
      mrp: req.body.mrp ? parseFloat(req.body.mrp) : null,
      category: req.body.category,
      subCategory: req.body.subCategory || null,
      sku: req.body.sku || null,
      packet: req.body.packet || null,
      flipkartLink: req.body.flipkartLink || null,
      stock: parseInt(req.body.stock || 0),
      featured: req.body.featured === 'true' || req.body.featured === true,
      imagePath: finalImages[0], // primary image
      imageContentType: req.files && req.files.length > 0 ? req.files[0].mimetype : 'url',
      images: finalImages,
      variants: parsedVariants
    });

    const obj = product.toJSON();
    obj.imageUrl = buildImageUrl(req, obj.imagePath);
    obj.images = safeMapImages(obj.images, req);
    obj.variants = safeParseJSON(obj.variants, []);

    console.log('✅ Product created:', product.id);
    res.status(201).json({ status: 'success', data: obj });
  } catch (error) {
    // Clean up uploaded files on error
    if (req.files) req.files.forEach(f => deleteImageFile(f.path));
    console.error('❌ Error creating product:', error.message, error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ── UPDATE Product (Admin) ────────────────────────────────────────────────────
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Product not found' });
    }

    // Update fields
    if (req.body.name) product.name = req.body.name;
    if (req.body.description) product.description = req.body.description;
    if (req.body.price) product.price = parseFloat(req.body.price);
    if (req.body.mrp) product.mrp = parseFloat(req.body.mrp);
    if (req.body.category) product.category = req.body.category;
    if (req.body.subCategory !== undefined) product.subCategory = req.body.subCategory;
    if (req.body.sku !== undefined) product.sku = req.body.sku;
    if (req.body.packet !== undefined) product.packet = req.body.packet;
    if (req.body.flipkartLink !== undefined) product.flipkartLink = req.body.flipkartLink;
    if (req.body.stock !== undefined) product.stock = parseInt(req.body.stock);
    if (req.body.featured !== undefined) product.featured = req.body.featured === 'true' || req.body.featured === true;

    if (req.body.variants) {
      try {
        product.variants = JSON.parse(req.body.variants);
      } catch (e) {
        console.error('Invalid variants JSON');
      }
    }

    // Handle images: Admin panel can send an array of URLs directly (including reordered ones)
    let finalImages = product.images ? [...product.images] : [];
    
    if (req.body.images) {
      let parsedImages = req.body.images;
      if (typeof parsedImages === 'string') {
        try {
          parsedImages = JSON.parse(parsedImages);
        } catch (e) {
          parsedImages = parsedImages.split(',').map(url => url.trim());
        }
      }
      if (Array.isArray(parsedImages)) {
        finalImages = parsedImages; // completely overwrite if array is provided
      }
    }

    // Replace or append if new files uploaded
    if (req.files && req.files.length > 0) {
      const imagePaths = req.files.map(f => f.path.replace(/\\/g, '/'));
      finalImages = [...finalImages, ...imagePaths];
    }

    if (finalImages.length > 0) {
      product.images = finalImages;
      product.imagePath = finalImages[0];
      if (req.files && req.files.length > 0) {
        product.imageContentType = req.files[0].mimetype;
      }
    }

    await product.save();

    const obj = product.toJSON();
    obj.imageUrl = buildImageUrl(req, obj.imagePath);
    obj.images = safeMapImages(obj.images, req);
    obj.variants = safeParseJSON(obj.variants, []);

    console.log('✅ Product updated:', product.id);
    res.status(200).json({ status: 'success', data: obj });
  } catch (error) {
    if (req.files) req.files.forEach(f => deleteImageFile(f.path));
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// ── DELETE Product (Admin) ────────────────────────────────────────────────────
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Product not found' });
    }

    // Delete image file from disk ONLY IF it's a local file (not http URL)
    if (product.imagePath && !product.imagePath.startsWith('http')) {
       deleteImageFile(product.imagePath);
    }
    if (product.images) {
       product.images.forEach(img => {
          if (img && !img.startsWith('http')) deleteImageFile(img);
       });
    }

    // Delete dependent items first to prevent foreign key constraint errors
    const { CartItem, Wishlist, OrderItem } = require('../models');
    await CartItem.destroy({ where: { productId: product.id } });
    await Wishlist.destroy({ where: { productId: product.id } });
    
    // Set productId to null for OrderItems to preserve order history but remove product link
    await OrderItem.update({ productId: null }, { where: { productId: product.id } });

    await product.destroy();

    console.log('🗑️ Product deleted:', req.params.id);
    res.status(200).json({ status: 'success', message: 'Product deleted successfully' });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// ── BULK UPLOAD Products (Admin) ──────────────────────────────────────────────
exports.bulkUploadProducts = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'Please upload an Excel/CSV file' });
    }

    const xlsx = require('xlsx');
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (data.length === 0) {
      return res.status(400).json({ status: 'error', message: 'The uploaded file is empty' });
    }

    const createdProducts = [];
    const updatedProducts = [];
    const errors = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      try {
        // Map Excel columns based on the provided format
        const title = row['Product Title'] || row['name'];
        if (!title) {
          errors.push(`Row ${i + 1}: Missing Product Title`);
          continue;
        }

        const sku = row['SKU'] ? String(row['SKU']).trim() : null;
        const category = row['Category'] || 'Snacks';
        const subCategory = row['Sub -Category'] || row['Sub-Category'] || null;
        const packet = row['Packet'] ? String(row['Packet']).trim() : null;
        
        let mrp = parseFloat(row['MRP'] || row['mrp']);
        mrp = isNaN(mrp) ? null : mrp;
        
        let sellingPrice = parseFloat(row['Selling Price'] || row['price']);
        if (isNaN(sellingPrice)) sellingPrice = 0;

        let discountPercentage = parseFloat(row['Discount Percentage'] || row['discountPercentage']);
        discountPercentage = isNaN(discountPercentage) ? null : discountPercentage;

        const flipkartLink = row['FLIPKART LINK'] || null;

        // Collect images from Image 1 to Image 6
        const images = [];
        for (let j = 1; j <= 6; j++) {
          const imgUrl = row[`Image ${j}`];
          if (imgUrl && typeof imgUrl === 'string' && imgUrl.startsWith('http')) {
            images.push(imgUrl.trim());
          }
        }

        let stockValue = parseInt(row['Stock']);
        if (isNaN(stockValue)) stockValue = 100;

        let featuredValue = false;
        if (row['Featured']) {
          const f = String(row['Featured']).toLowerCase().trim();
          featuredValue = (f === 'yes' || f === 'true' || f === '1');
        }

        let publishedValue = true;
        if (row['Published']) {
          const p = String(row['Published']).toLowerCase().trim();
          publishedValue = (p !== 'no' && p !== 'false' && p !== '0');
        }

        const productData = {
          name: title,
          description: row['Description'] || title,
          price: sellingPrice,
          mrp: mrp,
          discountPercentage: discountPercentage,
          category: category,
          subCategory: subCategory,
          sku: sku,
          packet: packet,
          flipkartLink: flipkartLink,
          stock: stockValue,
          featured: featuredValue,
          images: images,
          imagePath: images.length > 0 ? images[0] : null,
          imageContentType: 'url',
          published: publishedValue
        };

        // If SKU exists, try to update. Otherwise, create new.
        if (sku) {
          const existing = await Product.findOne({ where: { sku } });
          if (existing) {
            await existing.update(productData);
            updatedProducts.push(existing.id);
            continue;
          }
        }
        
        const newProduct = await Product.create(productData);
        createdProducts.push(newProduct.id);
      } catch (err) {
        errors.push(`Row ${i + 1} (${row['Product Title']}): ${err.message}`);
      }
    }

    // Clean up the uploaded Excel file
    try {
      fs.unlinkSync(req.file.path);
    } catch (e) {
      console.error('Failed to delete excel file:', e);
    }

    res.status(200).json({
      status: 'success',
      message: 'Bulk upload completed',
      created: createdProducts.length,
      updated: updatedProducts.length,
      errors: errors
    });
  } catch (error) {
    if (req.file) {
      try { fs.unlinkSync(req.file.path); } catch(e){}
    }
    console.error('❌ Error in bulk upload:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};
