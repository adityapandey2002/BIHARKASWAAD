const Category = require('../models/Category');
const fs = require('fs');
const path = require('path');

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.status(200).json({ status: 'success', data: categories });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, imageUrl } = req.body;
    let imagePath = imageUrl || null;
    if (req.file) {
      imagePath = `/uploads/categories/${req.file.filename}`;
    }

    const existing = await Category.findOne({ where: { name } });
    if (existing) {
      // If updating an existing category with a new image, delete old image maybe?
      if (imagePath && existing.imagePath) {
        const oldPath = path.join(__dirname, '..', existing.imagePath);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      existing.imagePath = imagePath || existing.imagePath;
      await existing.save();
      return res.status(200).json({ status: 'success', data: existing });
    }

    const category = await Category.create({ name, imagePath });
    res.status(201).json({ status: 'success', data: category });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);
    if (!category) return res.status(404).json({ status: 'error', message: 'Not found' });
    
    if (category.imagePath) {
      const oldPath = path.join(__dirname, '..', category.imagePath);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    
    await category.destroy();
    res.status(200).json({ status: 'success', message: 'Deleted' });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};
