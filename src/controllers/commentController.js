
import mongoose from "mongoose"
import {Comment} from "../models/comment.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

import {Video} from "../models/video.model.js"



const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(400, "Video not found");
    }

    const pipeline = [
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "comment",
                as: "likes"
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner"
                },
                likesCount: {
                    $size: "$likes"
                }
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $project: {
                likesCount: 1,
                owner: {
                    username: 1,
                    "avatar.url": 1
                },
                content: 1,
                createdAt: 1,
            }
        }
    ];

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    };

    const commentsAggregate = Comment.aggregate(pipeline);

    const comments = await Comment.aggregatePaginate(commentsAggregate, options);

    return res
        .status(200)
        .json(new ApiResponse(200, comments, "Comments fetched successfully"));
});


const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { content }=req.body
    const {videoId}=req.params 

    const comment=await Comment.create({
        content:content,
        owner: req.user?._id,
        video:videoId   


    })   
    
    if(!comment){
        throw new ApiError(400,"Comment not created")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(201,comment,"Comment created succesfully")
    )

    



})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment

    const {commentId}=req.params
    const {content}=req.body
    const comment = await Comment.findByIdAndUpdate(commentId,
        {
            content:content,
            
        }
        ,{
            new:true
        }
    )
    console.log(comment)

    if(!comment){
        throw new ApiError(400,"Comment not updated")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(201,comment,"Comment updated succesfully")
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment

    const {commentId}=req.params

    const comment= await Comment.findByIdAndDelete(commentId)

    if(!comment){
        throw new ApiError(400,"comment not deleted")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(201,comment,"Commnt deleted succesfully")
    )




})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }
