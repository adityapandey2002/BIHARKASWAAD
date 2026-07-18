const path = require('path');
const fs = require('fs');
const { Blog } = require('../models/index');

const buildImageUrl = (req, imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
  return `${req.protocol}://${req.get('host')}/api/${imagePath.replace(/^\\/, '')}`;
};

const deleteImageFile = (imagePath) => {
  if (!imagePath) return;
  const full = path.join(__dirname, '..', imagePath);
  if (fs.existsSync(full)) fs.unlinkSync(full);
};

// ── GET All Blogs ─────────────────────────────────────────────────────────────
exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.findAll({ where: { published: true }, order: [['createdAt', 'DESC']] });

    const result = blogs.map((b) => {
      const obj = b.toJSON();
      obj.imageUrl = buildImageUrl(req, obj.imagePath);
      return obj;
    });

    console.log(`✅ Sending ${result.length} blogs`);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    console.error('❌ Error fetching blogs:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ── GET Single Blog ───────────────────────────────────────────────────────────
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findByPk(req.params.id);

    if (!blog || !blog.published) {
      return res.status(404).json({ status: 'error', message: 'Blog not found' });
    }

    const obj = blog.toJSON();
    obj.imageUrl = buildImageUrl(req, obj.imagePath);

    res.status(200).json({ status: 'success', data: obj });
  } catch (error) {
    res.status(400).json({ status: 'error', message: 'Invalid blog ID' });
  }
};

// ── GET Blog Image (serve file directly) ──────────────────────────────────────
exports.getBlogImage = async (req, res) => {
  try {
    const blog = await Blog.findByPk(req.params.id);

    if (!blog || !blog.imagePath) {
      return res.status(404).json({ status: 'error', message: 'Image not found' });
    }

    const fullPath = path.join(__dirname, '..', blog.imagePath);
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ status: 'error', message: 'Image file not found' });
    }

    res.set('Content-Type', blog.imageContentType || 'image/jpeg');
    res.sendFile(fullPath);
  } catch (error) {
    res.status(400).json({ status: 'error', message: 'Invalid blog ID' });
  }
};

// ── CREATE Blog (Admin) ───────────────────────────────────────────────────────
exports.createBlog = async (req, res) => {
  try {
    const { title, excerpt, content, author, category, imagePath } = req.body;

    if (!req.file && !imagePath) {
      return res.status(400).json({ status: 'error', message: 'Please provide an image URL or upload a blog image' });
    }

    if (req.file) {
      console.log('📸 Blog image saved:', req.file.path);
    }

    const blog = await Blog.create({
      title,
      excerpt,
      content,
      author,
      category,
      imagePath: imagePath || req.file.path.replace(/\\/g, '/'),
      imageContentType: imagePath ? 'url' : req.file.mimetype,
    });

    const obj = blog.toJSON();
    obj.imageUrl = buildImageUrl(req, obj.imagePath);

    console.log('✅ Blog created:', blog.id);
    res.status(201).json({ status: 'success', data: obj });
  } catch (error) {
    if (req.file) deleteImageFile(req.file.path);
    console.error('❌ Error creating blog:', error);
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// ── DELETE Blog (Admin) ───────────────────────────────────────────────────────
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByPk(req.params.id);

    if (!blog) {
      return res.status(404).json({ status: 'error', message: 'Blog not found' });
    }

    if (blog.imagePath && !blog.imagePath.startsWith('http')) {
      deleteImageFile(blog.imagePath);
    }

    await blog.destroy();

    console.log('🗑️ Blog deleted:', req.params.id);
    res.status(200).json({ status: 'success', message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};
