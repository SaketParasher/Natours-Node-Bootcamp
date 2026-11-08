import { Tour } from "../models/tourModel.js";
import { connect } from "mongoose";
import fs from 'fs';
import path from "path";

const DB_URL = process.env.DATABASE_URL.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)

async function connectDB() {
    return new Promise((resolve, reject) => {
        connect(DB_URL).then(con => {
            // console.log(con.connection);
            console.log('Connected to Database...')
            resolve()
        }).catch(err => {
            console.log('Error while connecting to DB ', err)
            reject()
        })
    })
}

const importDevData = async () => {
    try {
        await connectDB();
        const tours = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '/data/tours-simple.json')));
        await Tour.create(tours)
        console.log('Dev Data Imported...')
    } catch (error) {
        console.log("Error while importing dev data ", error)
    } finally {
        process.exit()
    }
}

const deleteDevData = async () => {
    try {
        await connectDB();
        await Tour.deleteMany()
        console.log('Dev Data Deleted')
    } catch (error) {
        console.log("Error while deleting dev data ", error)
    } finally {
        process.exit()
    }
}

if (process.argv[2] === "--import") {
    await importDevData()
} else if (process.argv[2] === "--delete") [
    await deleteDevData()
]
