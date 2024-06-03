import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    if (!(name && description)) {
        throw new ApiError(400,"All teh fileds are compulsory")
        
    }

    const playlist=Playlist.create({
        name:name,
        description:description,
        owner:req.user?._id


    })

    if (!playlist) {
        throw new ApiError(400,"playlist not created")
        
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,playlist,"playlist successfully created")
    )

    

    //TODO: create playlist
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    
    if(!userId){
        throw new ApiError(400,"Invalid userId")
        
    }

    const playlist=await Playlist.find({owner:userId})

    if (!playlist) {
        throw new ApiError(400,"Playlist not found")
        
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,playlist,"playlist fetched successfully by userId")
    )


})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id

    if (!getPlaylistById) {
        throw new ApiError(400,"Invalid playlist Id")
        
    }
    const playlist=await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(400,"playlist not found")
        
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,playlist,"playlist fetched successfully by playlistId")
    )






})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!(playlistId && videoId)){
        throw new ApiError(400,"Invalid playlist and video Id")

    

    }

    const video= await Video.findById(videoId)

    const playlist=await Playlist.findById(playlistId)

    if (!video) {
        throw new ApiError(400,"Video  not found")
        
    }

    if (!playlist) {
        throw new ApiError(400,"Playlist  not found")
        
    }

    if (video.owner?.toString() && playlist.owner?.toString() !== req.user?._id) {

        throw new ApiError(400,"Only owner can add video to playlist")
        
    }



    const updatedPlaylist=await Playlist.findByIdAndUpdate(playlist?._id,
        {
            $addToSet:{

                videos:videoId

            }
        },
        {
            new:true
        })

    if(!updatedPlaylist){
        throw new ApiError(400,"Video not added to playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,updatedPlaylist,"Video added successfully in playlist")
    )








})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if (!(playlistId && videoId)){
        throw new ApiError(400,"Invalid video and playlist id")


    }

    const video=await Video.findById(videoId)

    const playlist=Playlist.findById(playlistId)

    const updatedPlaylist=await Playlist.findByIdAndUpdate(playlistId,
        {
            $pull:{
                videos:videoId

            }
        },
        {
            new:true
        }
        )

        if(!updatedPlaylist){
            throw new ApiError(400,"Video not found in playlist")
        }
    
        return res
        .status(200)
        .json(
            new ApiResponse(200,updatedPlaylist,"Video removed successfully from playlist")
        )
    





})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist

    const playlist=await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(400,"Playlist not found")
        
    }

    const delPlaylist= await Playlist.findByIdAndDelete(playlistId)

    if (!delPlaylist) {
        throw new ApiError(404,"Playlist not found")
        
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,delPlaylist,"playlist deleted successfully")
    )







    


    





})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist

    const playlist=await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(400,"Playlist not found")
        
    }

    const updatedPlaylist=await Playlist.findByIdAndUpdate(playlist?._id,
        {
            name:name,
            description:description
        },
        {
            new:true
        })



        return res
        .status(200)
        .json(
            new ApiResponse(200,updatedPlaylist,"playlist deleted successfully")
        )
    


})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}