
import mongoose, {Mongoose, isValidObjectId} from "mongoose"
import {Like} from "../models/likes.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"

import {Tweet} from  "../models/tweets.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    const video=await Video.findById(videoId)

    if (!video) {
        throw new ApiError(400,"video not found")
        
    }


    const likedAlready=await Like.findOne({
            video:videoId,
            likedBy:req.user?._id
        })

    // console.log(likedAlready);

    if (likedAlready) {
        await Like.findByIdAndDelete(likedAlready?._id)

        return res
        .status(200)
        .json(
            new ApiResponse(200,{isLiked:false},"video unliked")
        )
    
        
    }

    




 


    console.log(req.user?._id)
   
    await Like.create({

    video:videoId,
    likedBy:req.user?._id
   })
   res.status(200)
   .json(new ApiResponse(200,{isLiked:true },"Video Liked"))
})

// const toggleCommentLike = asyncHandler(async (req, res) => {
//     const {commentId} = req.params
//     //TODO: toggle like on comment

//     if (!commentId){
//         throw new ApiResponse(400,"Invalid Comment id ")
//     }
    

//     const commentLikedAlready=await Like.findOne({
//         comment:commentId,
//         likedBy:req.user?._id



//     })
//     console.log(commentLikedAlready)
//     //checking whether user liked the comment or not
//     //if liked remove it from database

//     if (commentLikedAlready) {
//         await Like.findByIdAndDelete(commentLikedAlready?._id)

//         return res
//         .status(200)
//         .json(200,{isLiked:false})
        
//     }

//     await Like.create({

//         commentId:commentId,
//         likedBy:req.user?._id
//        })
//        res.status(200)
//        .json(new ApiResponse(200,{isLiked:true},"Comment Liked"))

   





// })

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid commentId");
    }


    const likedAlready = await Like.findOne({
        comment: commentId,
        likedBy: req.user?._id,
    });

    if (likedAlready) {
        await Like.findByIdAndDelete(likedAlready?._id);

        return res
            .status(200)
            .json(new ApiResponse(200, { isLiked: false }));
    }

    await Like.create({
        comment: commentId,
        likedBy: req.user?._id,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, { isLiked: true },"comment liked"));
});


const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet

    if (!tweetId) {
        throw new ApiError(400,"Invalid tweet")
        
    }

    const likeAlready=await Like.findOne({
        tweet:tweetId,
        likedBy:req.user?._id
    })

    if (likeAlready) {
        await Like.findByIdAndDelete(likeAlready?._id)

        return res
        .status(201)
        .json(
            new ApiResponse(200,{isLiked:false})
        )
        
    }

    await Like.create({
        tweet: tweetId
        ,likedBy:req.user?._id
    })

    return res
    .status(201)
    .json(
        new ApiResponse(200,{isLiked:true},"tweet liked succesfully")
    )








}
)

// const getLikedVideos = asyncHandler(async (req, res) => {
//     //TODO: get all liked videos

//     const userLikes=await Like.aggregate([
//         {
//             $match:{
//                 likedBy: new mongoose.Types.ObjectId(req.user?._id)
//             }
//         },
//         {
//             $lookup:{
//                 from:"videos",
//                 localField:"video",
//                 foreignField:"_id",
//                 as:"likedVideo",
//                 pipeline:[
//                     {
//                         $lookup:{
//                             from:"users",
//                             localField:"owner",
//                             foreignField:"_id",
//                             as:"ownerDetails"
//                         }
//                     },
//                     {
//                         // $unwind:"$ownerDetails"
//                     }
//                 ]
//             },
            
            
//         },
//         {
//             // $unwind:"likedVideo"
//         },
//         {
//             $sort:{
//                 createdAt:-1
//             }
//         },
//         {
//             $project:{
//                 _id:0,
//                 likedVideo:{
//                     _id:1,
//                     "videoFile.url":1,
//                     "thumbnail.url":1,
//                     owner:1,
//                     duration:1,
//                     views:1,
//                     isPublished:1,
//                     ownerDetails: {
//                         username: 1,
//                         fullName: 1,
//                         "avatar.url": 1,
//                     }


//                 },


//             }
//         }
//     ])

//     return res
//             .status(200)
//             .json(new ApiResponse(200, userLikes, "Liked videos fetched successfully"));

    
// })

// const getLikedVideos = asyncHandler(async (req, res) => {
//     const userLikes = await Like.aggregate([
//         {
//             $match: {
//                 likedBy: new mongoose.Types.ObjectId(req.user._id)
//             }
//         },
//         {
//             $lookup: {
//                 from: "videos",
//                 localField: "video",
//                 foreignField: "_id",
//                 as: "likedVideo",
//                 pipeline: [
//                     {
//                         $lookup: {
//                             from: "users",
//                             localField: "owner",
//                             foreignField: "_id",
//                             as: "ownerDetails"
//                         }
//                     },
//                     {
//                         $unwind: "$ownerDetails"
//                     },
//                     {
//                         $project: {
//                             _id: 1,
//                             "videoFile.url": 1,
//                             "thumbnail.url": 1,
//                             owner: 1,
//                             duration: 1,
//                             views: 1,
//                             isPublished: 1,
//                             ownerDetails: {
//                                 username: 1,
//                                 fullName: 1,
//                                 "avatar.url": 1
//                             }
//                         }
//                     }
//                 ]
//             }
//         },
//         {
//             $unwind: "$likedVideo"
//         },
//         {
//             $sort: {
//                 "likedVideo.createdAt": -1
//             }
//         },
//         {
//             $project: {
//                 _id: 0,
//                 likedVideo: 1
//             }
//         }
//     ]);

//     return res
//         .status(200)
//         .json(new ApiResponse(200, userLikes, "Liked videos fetched successfully"));
// });

const getLikedVideos = asyncHandler(async (req, res) => {
    const likedVideosAggegate = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user?._id),
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "likedVideo",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline:[
                                {
                                    $project:{
                                        username:1,
                                        _id:1,
                                        fullName:1
                                    }
                                }
                            ]
                        },
                    },
                    
                ],
            },
        },
        {
            $project: {
                _id: 0,
                likedVideo: {
                    _id: 1,
                    "videoFile.url": 1,
                    "thumbnail.url": 1,
                    owner:1

                   
                    


                    
                    
                    
                },
            },
        },
    ]);

    console.log(likedVideosAggegate)

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                likedVideosAggegate,
                "liked videos fetched successfully"
            )
        );
});


export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}
