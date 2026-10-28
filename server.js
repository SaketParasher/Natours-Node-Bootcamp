import { app } from "./app.js";
import { connect } from "mongoose";

const PORT = process.env.PORT
const DB_URL = process.env.DATABASE_URL.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)

connect(DB_URL).then(con => {
    // console.log(con.connection);
    console.log('Connected to Database...')
}).catch(err => {
    console.log('Error while connecting to DB ', err)
})


app.listen(PORT, () => {
    console.log(`Server Running on PORT: ${PORT}`)
})