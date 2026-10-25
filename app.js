import { readFileSync, writeFile } from 'fs'
import { join } from 'path';
import express from 'express';
import { error } from 'console';

const PORT = process.env.PORT
const app = express();

const natours = JSON.parse(readFileSync(join(import.meta.dirname, 'dev-data/data/tours.json')))

app.use(express.json())

app.get('/api/v1/natours', (req, res) => {
    res.status(200).json({
        status: 'success',
        data: {
            natours
        }
    })
})

app.post('/api/v1/natours', (req, res) => {
    const newTourId = natours.length + 1;
    const newTourData = req.body;

    const newTour = { id: newTourId, ...newTourData }
    natours.push(newTour)
    writeFile(join(import.meta.dirname, 'dev-data/data/tours.json'), JSON.stringify(natours), err => {
        if (err) {
            console.error(error)
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
})


app.listen(PORT, () => {
    console.log(`Server Running on PORT: ${PORT}`)
})