import { Router } from "express";
import { createTour, deleteTour, getTour, getTours, updateTour, validateCreateTourReqBody } from '../controllers/tourController.js'

export const tourRoutes = Router();

tourRoutes.route('/')
    .get(getTours)
    .post(validateCreateTourReqBody, createTour)

tourRoutes.route('/:id')
    .patch(updateTour)
    .get(getTour)
    .delete(deleteTour)


