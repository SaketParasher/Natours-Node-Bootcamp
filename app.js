import express from 'express';
import morgan from 'morgan';

import { tourRoutes } from './routes/tourRoutes.js';
import { userRoutes } from './routes/userRoutes.js';

import { AppError } from './utils/appError.js';
import { GlobalErrorHandler } from './controllers/errorController.js';

export const app = express();

// 1. MIDDLEWARES
if (process.env.NODE_ENV === 'development')
    app.use(morgan('dev'))
app.set('query parser', 'extended')
app.use(express.json())

// 2. STATIC FILES MIDDLEWARE
app.use(express.static(`${import.meta.dirname}/public`))

// 3. ROUTES MIDDLEWARES
app.use('/api/v1/tours', tourRoutes)
app.use('/api/v1/users', userRoutes)

// CATCH ALL NOT FOUND ROUTE HANDLER
app.all(/(.*)/, (req, res, next) => {
    const error = new AppError(`This route ${req.originalUrl} is not handled by server!`, 404);
    next(error)
})

// THIS IS EXPRESS ERROR MIDDLEWARE WHICH GETS TRIGGERED WHENEVER next() is called with an error
app.use(GlobalErrorHandler)