import { Router } from "express";
import { createTour, deleteTour, getTour, getTours, updateTour, validateId, validateCreateTourReqBody } from '../controllers/tourController.js'

export const tourRoutes = Router();

tourRoutes.param('id', validateId)

tourRoutes.route('/')
    .get(getTours)
    .post(validateCreateTourReqBody, createTour)

tourRoutes.route('/:id')
    .patch(updateTour)
    .get(getTour)
    .delete(deleteTour)


