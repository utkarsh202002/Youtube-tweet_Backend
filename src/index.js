import dotenv from "dotenv"
import dbConnect from "./db/db.js";
import { app } from "./app.js";
import mongoose from "mongoose";

dotenv.config({path:"./.env"})


dbConnect().
then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log(`server is running at ${process.env.PORT}`)
    })
}).catch(()=>{
    console.log("Mongo Db connection failed")
})



