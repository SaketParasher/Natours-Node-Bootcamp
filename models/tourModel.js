import { Schema, model } from "mongoose";

const tourSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Tour Name is Required'],
        unique: true
    },
    rating: {
        type: Number,
        default: 4.5
    },
    price: {
        type: Number,
        required: [true, 'A Tour must have a price']
    }
})

export const Tour = model('Tour', tourSchema)