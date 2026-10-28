import { Tour } from "../models/tourModel.js";


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

export const getTours = (req, res) => {
    res.status(200).json({
        status: 'success',
        data: {
            natours: []
        }
    })
}

export const createTour = async (req, res) => {

    try {
        const newTourData = req.body;

        const tour = new Tour({
            name: newTourData.name,
            price: newTourData.price,
            rating: newTourData.rating
        })

        const data = await tour.save()

        console.log(data)

        res.status(201).json({
            status: 'success',
            data: {
                tour: []
            }
        })
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Something Went wrong while creating tour'
        })
    }
}

export const getTour = (req, res) => {
    const id = +req.params.id

    res.status(200).json({
        status: 'success',
        data: {

        }
    })
}

export const updateTour = (req, res) => {

    res.status(200).json({
        status: 'success',
        data: {
            message: '<Updated Tour Here...>'
        }
    })
}

export const deleteTour = (req, res) => {

    res.status(204).json({
        status: 'success',
        data: null
    })
}