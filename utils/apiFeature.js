export class APIFeatures {
    constructor(reqQuery, mongoQuery) {
        this.reqQuery = reqQuery;
        this.mongoQuery = mongoQuery;
    }

    filter() {
        // 1A) FILTERING THE TOURS BASED ON QUERY
        const queryObject = { ...this.reqQuery };

        // Remove these query from req.query since these queries will be used for sorting, pagination, limit
        const fieldsToExcludeFromQuery = ['limit', 'page', 'sort', 'fields']
        fieldsToExcludeFromQuery.forEach(el => delete queryObject[el]);

        // 1B) ADVANCED FILTERING: {duration:{lte:'5}} / for lt,lte,gt,gte in query we need to append $ in front
        // to prepare mongodb query
        let queryString = JSON.stringify(queryObject);
        queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)

        // PREPARE THE QUERY
        this.mongoQuery = this.mongoQuery.find(JSON.parse(queryString));
        return this
    }

    sort() {
        // 2) SORTING
        if (this.reqQuery?.sort) {
            // in request query if multiple fields are there in sort they will be seperated by comma, so
            // we will split it and join it with space for mongodb query. 
            const sortBy = this.reqQuery.sort.split(',').join(' ')
            this.mongoQuery = this.mongoQuery.sort(sortBy);
        } else {
            this.mongoQuery = this.mongoQuery.sort('-createdAt _id')
        }

        return this
    }

    limitFields() {
        // 3) FIELD LIMITING
        if (this.reqQuery.fields) {
            const fields = this.reqQuery.fields.split(',').join(' ');
            this.mongoQuery = this.mongoQuery.select(fields)
        } else {
            this.mongoQuery = this.mongoQuery.select('-__v')
        }
        return this
    }

    paginate() {
        const page = Number(this.reqQuery.page) || 1;
        const limit = Number(this.reqQuery.limit) || 100;
        const skip = (page - 1) * limit;

        this.mongoQuery = this.mongoQuery.skip(skip).limit(limit)
        return this
    }
}