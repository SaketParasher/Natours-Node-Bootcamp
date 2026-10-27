import express from 'express';
import morgan from 'morgan';

import { tourRoutes } from './routes/tourRoutes.js';
import { userRoutes } from './routes/userRoutes.js';

export const app = express();

// 1. MIDDLEWARES
if (process.env.NODE_ENV === 'development')
    app.use(morgan('dev'))
app.use(express.json())

// 2. STATIC FILES MIDDLEWARE
app.use(express.static(`${import.meta.dirname}/public`))

// 3. ROUTES MIDDLEWARES
app.use('/api/v1/tours', tourRoutes)
app.use('/api/v1/users', userRoutes)