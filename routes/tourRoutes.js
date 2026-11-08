import { Router } from 'express';
import {
  createTour,
  deleteTour,
  getTour,
  getTours,
  updateTour,
  validateCreateTourReqBody,
  getTourStats,
  getToursForYearByMonth,
} from '../controllers/tourController.js';
import { verifyAuth, protectToRoles } from '../controllers/authController.js';

export const tourRoutes = Router();

tourRoutes.route('/tour-stats').get(getTourStats);
tourRoutes.route('/tours-by-year/:year').get(getToursForYearByMonth);

tourRoutes
  .route('/')
  .get(verifyAuth, getTours)
  .post(validateCreateTourReqBody, createTour);

tourRoutes
  .route('/:id')
  .patch(updateTour)
  .get(getTour)
  .delete(verifyAuth, protectToRoles('admin', 'lead-guide'), deleteTour);
