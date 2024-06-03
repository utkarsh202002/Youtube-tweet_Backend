import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweets.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { json } from "express"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content}=req.body

    if(!content){
        throw new ApiError(400,'Field required')
    }

    

    const tweet=await Tweet.create({
        content:content,
        owner:req.user?._id
    })

    if (!tweet) {
        throw new ApiError(400,"Tweet not created")
        
    }

    return res
    .status(201)
    .json(
        new ApiResponse(201,tweet,"tweet created successfully")
    )

    

    


})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId}=req.params

    const tweet= await Tweet.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId( req.user?._id)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
                pipeline:[
                    {
                        $project:{
                            username:1,
                            "avatar.url":1,
                            _id:1,
                            fullName:1
                        }
                    }
                ]
            }
        }
    ])

    // const tweets = await Tweet.aggregate([
    //     {
    //         $match: {
    //             owner: new mongoose.Types.ObjectId(userId),
    //         },
    //     },
    //     {
    //         $lookup: {
    //             from: "users",
    //             localField: "owner",
    //             foreignField: "_id",
    //             as: "ownerDetails",
    //             pipeline: [
    //                 {
    //                     $project: {
    //                         username: 1,
    //                         "avatar.url": 1,
    //                     },
    //                 },
    //             ],
    //         },
    //     },
    //     {
    //         $lookup: {
    //             from: "likes",
    //             localField: "_id",
    //             foreignField: "tweet",
    //             as: "likeDetails",
    //             pipeline: [
    //                 {
    //                     $project: {
    //                         likedBy: 1,
    //                     },
    //                 },
    //             ],
    //         },
    //     },
    //     {
    //         $addFields: {
    //             likesCount: {
    //                 $size: "$likeDetails",
    //             },
    //             ownerDetails: {
    //                 $first: "$ownerDetails",
    //             },
    //             isLiked: {
    //                 $cond: {
    //                     if: {$in: [req.user?._id, "$likeDetails.likedBy"]},
    //                     then: true,
    //                     else: false
    //                 }
    //             }
    //         },
    //     },
    //     {
    //         $sort: {
    //             createdAt: -1
    //         }
    //     },
    //     {
    //         $project: {
    //             content: 1,
    //             ownerDetails: 1,
    //             likesCount: 1,
    //             createdAt: 1,
    //             isLiked: 1
    //         },
    //     },
    // ]);

    return res
    .status(201)
    .json(
        new ApiResponse(201,tweet,"tweet fetched successfully")
    )
    
    







})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet

    const {content}=req.body

    const {tweetId}=req.params

    if (!tweetId) {
        throw new ApiError(400,"tweet not found")
        
    }

    

    const updatedTweet=await Tweet.findByIdAndUpdate(tweetId,
        {
            content:content,
        }
    )

    return res
    .status(201)
    .json(
        new ApiResponse(201,updatedTweet,"tweet created successfully")
    )
    
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet

    const {tweetId}=req.params

    const tweet=await Tweet.findByIdAndDelete(tweetId)

    if (!tweet) {
        throw new ApiError(400,"tweet not found")
        
    }


    return res
    .status(201)
    .json(
        new ApiResponse(201,tweet,"tweet deleted successfully")
    )
    
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}