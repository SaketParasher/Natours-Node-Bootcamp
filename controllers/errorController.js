import { AppError } from "../utils/appError.js"

const DB_ERROR_CONSTANTS = {
    CAST_ERROR: 'CastError',
    VALIDATION_ERROR: 'ValidationError'
}

const sendErrorsDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        error: err,
        stack: err.stack
    })
}

const sendErrorsProd = (err, res) => {
    // if known errors/valid errors then we send status and message in prod
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        })
    } else {
        // Log Error
        console.error("ERROR ❌ ", err);
        // if other code or unexpected error we send generic error message and 500
        res.status(500).json({
            status: 'error',
            message: 'Something Went Wrong!'
        })
    }
}

/**
 * 
 * By Default if we use 4 parameters in in a middleware then that middleware is error handler with 1st
 * parameter as error and then req, res and next. this is our global error handler that will trigger
 * whenever next() in any other middleware is called with an error
 * 
 */

export const GlobalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorsDev(err, res)
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err, name: err.name, message: err.message };

        if (error.name === DB_ERROR_CONSTANTS.CAST_ERROR) {
            error = new AppError(`Invalid ${error.path} : ${error.value}`, 400)
        }

        if (error.code === 11000) {
            const keyValue = error.keyValue.name;
            error = new AppError(`Duplicate key : ${keyValue}`, 400)
        }

        if (error.name === DB_ERROR_CONSTANTS.VALIDATION_ERROR) {
            const errors = error.errors;
            const errorKeys = Object.keys(errors);
            let errorMessage = ''
            errorKeys.forEach(key => {
                errorMessage = `${errorMessage}${errors[key].message}.\n`
            })

            error = new AppError(errorMessage, 400)
        }

        if (error.name === "JsonWebTokenError") {
            error = new AppError(`Invalid Token. Please Login and get a new Token`, 401);
        }

        if (error.name = "TokenExpiredError") {
            error = new AppError(`Token Expired. Please login again and get a new Token`, 401)
        }

        sendErrorsProd(error, res)
    }
}