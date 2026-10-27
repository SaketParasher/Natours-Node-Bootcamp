import { readFileSync, writeFile } from 'fs'
import { join } from 'path';
const natours = JSON.parse(readFileSync(join(import.meta.dirname, '../dev-data/data/tours-simple.json')))

export const validateId = (req, res, next, param) => {
    if (+param > natours.length - 1) {
        return res.status(404).json({
            status: 'failed',
            message: `No Tour found with ID : ${param}`
        })
    }
    next();
}

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
            natours
        }
    })
}

export const createTour = (req, res) => {
    const newTourId = natours.length + 1;
    const newTourData = req.body;

    const newTour = { id: newTourId, ...newTourData }
    natours.push(newTour)
    writeFile(join(import.meta.dirname, '../dev-data/data/tours.json'), JSON.stringify(natours), err => {
        if (err) {
            console.error(err)
            return res.status(500).json({
                status: 'error',
                message: 'Something Went Wrong!'
            })
        }

        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        })
    })
}

export const getTour = (req, res) => {
    const tour = natours.find(tour => tour.id === +req.params.id)

    res.status(200).json({
        status: 'success',
        data: {
            tour
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