import * as userService from '../services/user.service.js';

export const getUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    res.json({ users });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const updated = await userService.updateUser(req.params.id, currentUserId, req.body);
    res.json({ user: updated, message: 'Usuario actualizado con éxito' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const result = await userService.deleteUser(req.params.id, currentUserId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

