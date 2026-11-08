
/**
 * 
 * catchAsync is used to wrap all the controller functions so that we centralised the error handling
 * Now all the sync controllers don't need to use try catch block, if there will be any error in 
 * controller then our catchAsync utility function will trigger our GlobalErroHandler middleware
 * by passing error to the next.
 * 
 */

export const catchAsync = fn => {
    return (req, res, next) => {
        fn(req, res, next).catch(next)
    }
}
