import express from "express";
import cors from 'cors';

import cookieParser from "cookie-parser";

const app=express();

app.use(cors());

//tells the server that it only accept json data -limit of 16kb
app.use(express.json({limit:"16kb"}));

//to accept the data from url
app.use(express.urlencoded());
//use to store pdf files temp files
app.use(express.static("public"));

app.use(cookieParser())

//import Router
import userRouter from "./routes/userRoutes.js"; 
 //use()is a middleware

app.use("/api/v1/users",userRouter);
import videoRouter from "./routes/videoRoutes.js"

app.use("/api/v1/videos",videoRouter)


//api of comment

import commentRouter from "./routes/commentRouter.js"
app.use("/api/v1/comment",commentRouter)

//api of likes

import likesRouter from "./routes/likesRouter.js"
app.use("/api/v1/likes",likesRouter)

//api of playlist

import playlistRouter from "./routes/playlistRouter.js"

app.use("/api/v1/playlist",playlistRouter)

//import of subscription

import subscriptionRouter from "./routes/subscriptionRoutes.js"

app.use("/api/v1/subscription",subscriptionRouter)



//api of tweet
import tweetRouter from "./routes/tweetRouter.js"
app.use("/api/v1/tweet",tweetRouter)

//api of healthcheck

import { healthcheck } from "./controllers/healthcheckController.js";
app.use("/api/v1/healthcheck",healthcheck)







// url --> http://localhost:8000/api/v1/users/register



export {app};