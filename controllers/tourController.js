import { Tour } from "../models/tourModel.js";
import { APIFeatures } from "../utils/apiFeature.js";
import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchErrors.js";


export const validateCreateTourReqBody = (req, res, next) => {
    const reqBody = req.body;
    if (!reqBody.price || !reqBody.name) {
        return res.status(400).json({
            status: 'failure',
            message: 'name and price is required to create a tour'
        })
    }
    next()
}

export const getTours = catchAsync(async (req, res) => {

    // // 1A) FILTERING THE TOURS BASED ON QUERY
    // const queryObject = { ...req.query };

    // // Remove these query from req.query since these queries will be used for sorting, pagination, limit
    // const fieldsToExcludeFromQuery = ['limit', 'page', 'sort', 'fields']
    // fieldsToExcludeFromQuery.forEach(el => delete queryObject[el]);

    // // 1B) ADVANCED FILTERING: {duration:{lte:'5}} / for lt,lte,gt,gte in query we need to append $ in front
    // // to prepare mongodb query
    // let queryString = JSON.stringify(queryObject);
    // queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)

    // // PREPARE THE QUERY
    // let query = Tour.find(JSON.parse(queryString));

    // // 2) SORTING
    // if (req?.query?.sort) {
    //     // in request query if multiple fields are there in sort they will be seperated by comma, so
    //     // we will split it and join it with space for mongodb query. 
    //     const sortBy = req.query.sort.split(',').join(' ')
    //     query = query.sort(sortBy);
    // } else {
    //     query = query.sort('-createdAt _id')
    // }

    // // 3) FIELD LIMITING
    // if (req.query.fields) {
    //     const fields = req.query.fields.split(',').join(' ');
    //     query = query.select(fields)
    // } else {
    //     query = query.select('-__v')
    // }

    // PAGINATION / ?page=2&limit=10 --> for pagination query will be something like this
    // if no page and limit paased in api query then we will use the default page = 1 & limit = 100
    // it is not ideal to pass all the results in api at once

    // const page = Number(req.query.page) || 1;
    // const limit = Number(req.query.limit) || 100;
    // const skip = (page - 1) * limit;

    // query = query.skip(skip).limit(limit)

    // EXECUTE THE QUERY

    const apiFeatures = new APIFeatures(req.query, Tour);

    const features = apiFeatures.filter().sort().limitFields().paginate();
    const tours = await features.mongoQuery;

    res.status(200).json({
        status: 'success',
        data: {
            length: tours.length,
            tours
        }
    })

})

export const createTour = catchAsync(async (req, res, next) => {
    const newTour = await Tour.create(req.body)

    res.status(201).json({
        status: 'success',
        data: {
            tour: newTour
        }
    })
})

export const getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.id);

    // If no tour found we are calling next with our AppError and then our global error handler will trigger
    if (!tour) {
        return next(new AppError(`Could not find a Tour with ID ${req.params.id}`, 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    })
})

export const updateTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    // If no tour found we are calling next with our AppError and then our global error handler will trigger
    if (!tour) {
        return next(new AppError(`Could not find a Tour with ID ${req.params.id}`, 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    })
})

export const deleteTour = catchAsync(async (req, res, next) => {

    const tour = await Tour.findByIdAndDelete(req.params.id)

    // If no tour found we are calling next with our AppError and then our global error handler will trigger
    if (!tour) {
        return next(new AppError(`Could not find a Tour with ID ${req.params.id}`, 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    })
})

export const getToursForYearByMonth = catchAsync(async (req, res, next) => {
    const year = req.params.year

    const stats = await Tour.aggregate([
        {
            $unwind: {
                path: '$startDates'
            }
        },
        {
            $match: {
                'startDates': {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTours: { $sum: 1 },
                tours: { $push: '$name' }
            }
        },
        {
            $addFields: {
                month: '$_id'
            }
        },
        {
            $sort: {
                _id: 1
            }
        }
    ])

    res.status(200).json({
        status: 'success',
        data: {
            stats
        }
    })

})

export const getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            "$group": {
                _id: "$difficulty",
                numTours: { $sum: 1 },
                averagePrice: { $avg: '$price' },
                averageRating: { $avg: '$ratingsAverage' },
                totalRating: { $sum: '$ratingsQuantity' }
            }
        }
    ])

    res.status(200).json({
        status: 'success',
        data: {
            stats
        }
    })

})