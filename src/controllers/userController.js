import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { upload } from "../middlewares/multer.js";
import { uploadFileCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import  Jwt from "jsonwebtoken";
import mongoose from "mongoose";



const generateAccessAndRefreshToken=async(userId)=>{
    try {
       const user= await User.findById(userId)
       const accessToken=user.generateAccessToken()
       const refreshToken=user.generateRefreshToken()

       //saving the refresh token in database
       user.refreshToken=refreshToken;
       await user.save({ validateBeforeSave:false })

       return {accessToken,refreshToken}
        
    } catch (error) {
        throw new ApiError(500,"Something went wrong")
        
    }



}



const registerUser=asyncHandler(async(req,res)=>{
   const {username,password,email,fullName}=req.body;
   //console.log("email:",email)

   if (fullName===""){
    throw new ApiError(400,"full name field required")

   
   }

   if (email===""){
    throw new Error(
        res.status(200).json({
            message:"email field required"
        })
    )

   
   }

   if (password===""){
    throw new Error(
        res.status(200).json({
            message:"password field required"
        })
    )

   
   }

   if (username===""){
   
    throw new Error(
        res.status(200).json({
            message:"username field required"
        })
    )

   
   }

   const existedUser=await User.findOne({
    $or:[{email},{username}]
   })



   if (existedUser) {
        throw new Error(res.status(400).json({
            message:"User already existed"
        }))

    
   }

   //storing the avatar and cover image path to local storage in server
   const avatarLocalPath=req.files?.avatar[0]?.path

//    const coverLocalPath=req.files?.coverImage[0]?.path

   //check hether user upload the avatar image or not
   console.log(req.files)
   let coverLocalPath;
   if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0  ){
        coverLocalPath=req.files.coverImage
        


   }
   

   if(!avatarLocalPath){
    throw new ApiError(400,"avatar file is required")
   }

   const avatarUpload=await uploadFileCloudinary(avatarLocalPath);

//    console.log(avatarUpload)

   const coverUpload=await uploadFileCloudinary(coverLocalPath);

   if(!avatarUpload){
    throw new ApiError(500,"file not uploaded on cloudinary")
   }

   //creating User Object

   const user=await User.create({
    username,
    fullName,
    avatar:avatarUpload.url,
    coverImage:coverUpload?.url || "",
    password,
    email

    })
    // console.log(user)

   const userCreated=await User.findById(user._id).select(
    "-password -refreshToken"

    ).lean()

    if(!userCreated){
        throw new ApiError(500,"Something wrong creating the user")
    }

    return res.status(201).json(
        new ApiResponse (200,userCreated,"User successfully  created")
    )






   
   
  
})

const loginUser=asyncHandler(async(req,res)=>{
    //access email and password from user
    //validate all the field(empty or not)
    //find the user in db
    //password check
    //send access and refresh token to user
    //send cookie
    //send response

    const {email,username,password}=req.body

    if (!email && !username) {
        throw new ApiError(300,"Username or email is required")

        
    }
    const user=await User.findOne({
        $or:[{ email }, { password }]
    })

    if (!user){
        throw new ApiError(404,"User doesn't existed...Sign Up")
    }

    const isPasswordValid=await user.isPasswordCorrect(password)
    if (!isPasswordValid){
        throw new ApiError(300,"Invalid Password")
    }

    //deconstructing access and refresh token

    const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id);

    const loggedInUser=await User.findById(user._id).select(
        "-password -refreshToken"
    ).lean()

    // console.log(loggedInUser)


    //seeting cookie

    //options? cookie can be changed from frontend 
     //now cookie can be changed only from server
     
    const options={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged in successfully"));


})

const logoutUser=asyncHandler(async(req,res)=>{
    // remove the cookie
    //create custom middleware to access userid
    

    await User.findByIdAndUpdate(req.user._id,
    {
        $set:{
            refreshToken:undefined
        }

    },{
        new:true
    }
    )
    const options={
        httpOnly:true,
        secure:true
    }

    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse (200,"User Logout Succesfully")
    )



})

const incomingRefreshToken=asyncHandler(async(req,res)=>{

    const incomingToken=req.cookies.refreshToken || req.body.refreshToken;
    

    if (!incomingToken) {
        throw new ApiError(401,"Unable to fetch Token")
        
    }

    const decodedToken= Jwt.verify(incomingToken,process.env.REFRESH_TOKEN_SECRET)

    console.log(decodedToken)

    if(!decodedToken){
        throw new ApiError(401,"Invalid Token")

    }

    const user=await User.findById(decodedToken?._id) 
    // console.log(user)

    if(!user){
        throw new ApiError(401,"Ivalid refresh Token")
    }

    if(incomingToken!== user.refreshToken ){
        throw new ApiError(401,"Token expired")
    }

    const options={
        httpOnly:true,
        secure:true
    }

    const {accessToken,newRefreshToken}=generateAccessAndRefreshToken(user._id)


    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newRefreshToken,options)
    .json(
        new ApiResponse (200,{
            accessToken,refreshToken:newRefreshToken
        },"Access Token Refreshed successfully")
    )

    

})

const changeCurrentUserPassword= asyncHandler(async(req,res)=>{

    const {oldPassword, newPassword}=req.body

    const user= await User.findById(req.user?._id)

    if (!user) {
        throw new ApiError(400,"unable to access user")
        
    }

    

    const passwordCorrect= await user.isPasswordCorrect(oldPassword)

    if (!passwordCorrect) {
        throw new ApiError(401, "Invalid old password")
        
    }

    user.password=newPassword

     await user.save({validateBeforeSave:false})

     return res
     .status(201)
     .json(
         new ApiResponse(200,{}, "Password Changed Succesfully")
     )









})

const getCurrentUser=asyncHandler(async(req,res)=>{
   const currentUser=await User.findById(req.user?._id)

   if(!currentUser){
    throw new ApiError(400,"unable to fetch current User")
   }
//    console.log(currentUser)

   return res
   .status(201)
   .json(
    new ApiResponse(201,currentUser," current user fetched successfully")
   )





})

const updateAccountDetails=asyncHandler(async(req,res)=>{
    const { fullName, email }=req.body

    if(!fullName || !email){
        throw new ApiError (400,"All fields are required")
    }

    const updatedUser=await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                fullName:fullName,
                email:email

            }

        },
        {
            new:true
        }

    ).select("-password")


    return res
    .status(201)
    .json(
         new ApiResponse(201,updatedUser,"Account Details updated successfully")
    )





})

const changeAvatarImage=asyncHandler(async(req,res)=>{

    const avatarLocalPath=req.file?.path

    if (!avatarLocalPath) {

        throw new ApiError(400,"avatar file is missing")
        
    }

    const avatar=await uploadFileCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400,"Problem occurring while uploading files on cloudinary ")
        
    }

    const user=await User.findByIdAndUpdate(req.user?._id,
        {
            avatar:avatar.url

        },{
            new:true

        }
    ).select("-password")

    return res
    .status(201)
    .json(
        new ApiResponse(201,user,"Avatar image updated successfully")
    )




})

const changeCoverImage=asyncHandler(async(req,res)=>{

    const coverLocalPath=req.file?.path

    if (!coverLocalPath) {

        throw new ApiError(400,"cover file is missing")
        
    }

    const cover=await uploadFileCloudinary(coverLocalPath)

    if (!avatar.url) {
        throw new ApiError(400,"Problem occurring while uploading file on cloudinary ")
        
    }

    const user=await User.findByIdAndUpdate(req.user?._id,
        {
            coverImage:cover.url

        },{
            new:true

        }
    ).select("-password")

    return res
    .status(201)
    .json(
        new ApiResponse(201,user,"Cover image updated successfully")
    )




})


// const getUserChannelProfile=asyncHandler(async(req,res)=>{

//     const {username}=req.params

//     if (!username?.trim()) {
//         throw new ApiError(400,"Username is missing")
        
//     }

//    const channel=await User.aggregate([
//         {
//             //match the username
//             $match:{
//                 username:username
//             }

//         },
//         {
//             //lookup joint the two table-->here,user and subscription model
//             $lookup:{
//                 from:"subscriptions",
//                 localField:"_id",
//                 foreignField:"channel",
//                 as:"subscribers"


//             }
//         },
//         {
//             $lookup:{
//                 from:"subscriptions",
//                 localField:"_id",
//                 foreignField:"subscriber",
//                 as:"subscribedTo"


//             }

//         },
//         {
//             //addfields add an extra field in user model
//             $addFields:{
//                 subscribersCount:{
                    
//                     $size: "subscribers"

//                 },
//                 channelsSubscribedToCount:{
//                     $size:"subscribedTo"
//                 },
//                 isSubscribed:{
//                     $cond:{
//                         if:{
//                             $in:[req.user?._id,"$subscribers.subscribe"],
                            
//                         },
//                         then:true,
//                         false:true
//                     }
                    
//                 }
                
                
//             }
//         },
//         {
//             $project:{
//                 fullName:1,
//                 username:1,
//                 channelsSubscribedToCount:1,
//                 subscribersCount:1,
//                 avatar:1,
//                 coverImage:1
//             }
//         }
//     ])

//     if (!channel?.length) {
//         throw new ApiError(400,"CHANNEL DOESNT EXIST")
        
//     }

//     return res
//     .status(200)
//     .json(
//         new ApiResponse(200,channel[0],"User channel fetched successfully")
//     )






// })

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username?.trim()) {
        throw new ApiError(400, "Username is missing");
    }

    const channel = await User.aggregate([
        {
            // Match the username
            $match: {
                username: username
            }
        },
        {
            // Lookup to join the User and Subscription models
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            // Add fields to the user model
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            // Project the necessary fields
            $project: {
                fullName: 1,
                username: 1,
                channelsSubscribedToCount: 1,
                subscribersCount: 1,
                avatar: 1,
                coverImage: 1
            }
        }
    ]);
    console.log(channel)

    if (!channel?.length) {
        throw new ApiError(400, "CHANNEL DOESN'T EXIST");
    }

    return res.status(200).json(new ApiResponse(200, channel[0], "User channel fetched successfully"));
});


const getWatchHistory=asyncHandler(async(req,res)=>{

    const user = await User.aggregate(
        [
            {
                $match:{
                    _id:new mongoose.Types.ObjectId(req.user._id)
                }

            },
            {
                $lookup:{
                    from:"videos",
                    localField:"watchHistory",
                    foreignField:"_id",
                    as:"watchHistory",

                    //nested pipeline

                    pipeline:[
                        {
                            $lookup:{
                                from:"users",
                                localField:"owner",
                                foreignField:"_id",
                                as:"owner",
                                pipeline:
                                [
                                    {
                                        //project is used to filter the fields
                                        $project:{
                                            fullName:1,
                                            username:1,
                                            avatar:1
                                        }
                                    }
                                ]

                            }
                        },
                        {
                            $addFields:{
                                owner:{
                                    $first:"$owner"
                                }
                            }
                        }
                    ]

                }

            }
        ]
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200,user[0].watchHistory,"watched History fetched successfully ")
    )




})



export {registerUser,
        loginUser,
        logoutUser,
        incomingRefreshToken,
        changeCurrentUserPassword,
        getCurrentUser,
        updateAccountDetails,
        changeAvatarImage,
        changeCoverImage,
        getUserChannelProfile,
        getWatchHistory
    
    
    }


