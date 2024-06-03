import  {ApiError}  from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Jwt from 'jsonwebtoken';
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.
        replace("Bearer ", "");

        if (!token) {
            throw new ApiError(400, "Unauthorized access");
        }

        const decodedToken = Jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        // console.log(decodedToken)
        

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        // Setting a new object in request object
        //adding a new field in request object
        req.user = user;

        // next() method transfers the route to next method
        next();
    } catch (error) {
        throw new ApiError(401, "Invalid Token");
    }
});
