import { Router } from "express";
import { createUser, deleteUser, getUser, getUsers, updateUser } from '../controllers/userController.js';
import { Signup, Signin } from "../controllers/authController.js";

export const userRoutes = Router();

userRoutes.post('/signup', Signup);
userRoutes.post('/login', Signin);

userRoutes.route('/')
    .get(getUsers)
    .post(createUser)

userRoutes.route('/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser)
