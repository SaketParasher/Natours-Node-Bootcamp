import { Schema, model } from "mongoose";
import slugify from 'slugify';

const tourSchema = new Schema({
    name: {
        type: String,
        required: [true, 'A Tour must have a Name'],
        unique: true,
        minlength: [10, 'A tour name must have at least 10 characters'],
        maxlength: [40, 'A tour name must have at max 40 characters']
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'difficulty must be either easy, medium or difficult'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1.0, 'Rating must be at least 1.0'],
        max: [5.0, 'Rating must be less than or equal to 5.0']
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A Tour must have a price']
    },
    priceDiscount: Number,
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a summary']
    },
    description: {
        type: String,
        trim: true,
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image']
    },
    imgaes: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],

}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

// durationWeeks will be a virtual property and will be available in Tours but we can't select this property
// explicitly
tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7
})

// DOCUMENT MIDDLEWARE : pre save middleware will execute only on .save() & .create()
// this will execute before the document is saved , this inside the function will refer the document
// before save. we can add or modify and property in this middleware, that property needs to be defined
// on schema. in new mongoose v9 calling next() in middleware is not needed and works without calling next
tourSchema.pre('save', function () {
    this.slug = slugify(this.name, { lower: true })
})


// QUERY MIDDLEWARE: these middlewares execute on query so first arg will be name of query like 'find',
// 'delete'or a regular expression. inside the cb function this will refer to the query itself and hence
// we can modify the query itself
tourSchema.pre(/^find/, function () {
    this.queryStart = Date.now()
})

tourSchema.post(/^find/, function () {
    console.log(`Query Took : ${Date.now() - this.queryStart} milliseconds`)
})

export const Tour = model('Tour', tourSchema)