
import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { uploadFileCloudinary } from "../utils/cloudinary.js";
import { json } from "express"




const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    const pipeline = [];

    // for using Full Text based search u need to create a search index in mongoDB atlas
    // you can include field mapppings in search index eg.title, description, as well
    // Field mappings specify which fields within your documents should be indexed for text search.
    // this helps in seraching only in title, desc providing faster search results
    // here the name of search index is 'search-videos'
    if (query) {
        pipeline.push({
            $search: {
                index: "search-videos",
                text: {
                    query: query,
                    path: ["title", "description"] //search only on title, desc
                }
            }
        });
    }

    if (userId) {
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid userId");
        }

        pipeline.push({
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        });
    }

    // fetch videos only that are set isPublished as true
    pipeline.push({ $match: { isPublished: true } });

    //sortBy can be views, createdAt, duration
    //sortType can be ascending(-1) or descending(1)
    if (sortBy && sortType) {
        pipeline.push({
            $sort: {
                [sortBy]: sortType === "asc" ? 1 : -1
            }
        });
    } else {
        pipeline.push({ $sort: { createdAt: -1 } });
    }

    pipeline.push(
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            "avatar.url": 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$ownerDetails"
        }
    )

    const videoAggregate = Video.aggregate(pipeline);

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    };

    const video = await Video.aggregatePaginate(videoAggregate, options);

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Videos fetched successfully"));
    

    



    

    




})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    const videoPath= req.files?.videoFile[0]?.path
    const thumbnailPath= req.files?.thumbnail[0]?.path

    if (!videoPath) {
        throw new ApiError(400,"video path not stored on server")
        
    }

    if (!thumbnailPath) {
        throw new ApiError(400,"thumbnail path not stored on server")
        
    }

    const videoUpload=await uploadFileCloudinary(videoPath)
    console.log(videoUpload)

    if (!videoUpload) {
        throw new ApiError(400,"problem occuring while uploading video on cloudinary  ")
        
    }

    const thumbnailUpload=await uploadFileCloudinary(thumbnailPath)

    if (!thumbnailUpload) {
        throw new ApiError(400,"problem occuring while uploading thumbnail on cloudinary  ")
        
    }

    const video=await Video.create({
        title:title,
        description:description,
        videoFile:videoUpload.url,
        thumbnail:thumbnailUpload.url,
        duration:videoUpload.duration,
        owner:req.user?._id
        



    })

    if(!video){
        throw new ApiError(400,"video doesn't created")
    }

     return res
     .status(200)
     .json(
        new ApiResponse(201,video,"video uploaded successfully")
     )
    


})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

   const video=await Video.findById(videoId)
//    console.log(video)
  
   

   if (!video) {
    throw new ApiError(400,"Video not found")
    
   }

   return res
   .status(200)
   .json(
    new ApiResponse(201,video,"video fetched succesfully")

   )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const {title,description}=req.body


    //TODO: update video details like title, description, thumbnail
    const thumbnailLocalPath=req.file?.path

    if (!thumbnailLocalPath) {
        throw new ApiError(400,"Problem while uploading it on Server" )
        
    }
    const thumbnailUpload=await uploadFileCloudinary(thumbnailLocalPath)

    if (!thumbnailUpload) {
        throw new ApiError(400,"problem occurring while uploading on cloudinary ")
        
    }

    const video=await Video.findByIdAndUpdate(videoId,
        {
            title:title,
            description:description,
            thumbnail:thumbnailUpload.url
        },
        {
            new:true
        }
    )
    if (!video) {
        throw new ApiError(400," Unable to update video details")
        
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,video,"Video details updated successfully")
    )

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    const video=await Video.findByIdAndDelete(videoId)
    return res
    .status(200)
    .json(
        new ApiResponse(201,video,"Video deleted successfully")
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const video = await Video.findById(videoId);
        
    if (!video) {
        throw new ApiError(400,"Video not found")
    }

    video.isPublished = !video.isPublished; // Toggle the publish status
    await video.save();

    return res
    .status(200)
    .json(
        new ApiResponse(200,video,"Video published successfully")
    )


     
   




    

})



export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
