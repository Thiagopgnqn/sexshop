import * as categoryService from '../services/category.service.js';

export const getCategories = async (req, res, next) => {
  try {
    const flat = req.query.flat === 'true';
    const categories = await categoryService.getCategories({ flat });
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res) => {
  try {
    const newCategory = await categoryService.createCategory(req.body);
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const updated = await categoryService.updateCategory(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await categoryService.deleteCategory(id);
    res.json({ message: 'Categoría eliminada con éxito' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
