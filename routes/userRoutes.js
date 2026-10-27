import { Router } from "express";
import { createUser, deleteUser, getUser, getUsers, updateUser } from '../controllers/userController.js';

export const userRoutes = Router();

userRoutes.route('/')
    .get(getUsers)
    .post(createUser)

userRoutes.route('/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser)
