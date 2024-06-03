import mongoose, {Mongoose, isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscriptions.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


// const toggleSubscription = asyncHandler(async (req, res) => {
//     const {channelId} = req.params
//     // TODO: toggle subscription
 
   

//     const channel= await Subscription.findById(channelId)

    
//     if (!channel) {
//         throw new ApiError(400,"Invalid channel id")
//     }

//     const isSubscribed=await Subscription.findOne(
//         {
//             channel:channelId,
//             subscriber:req.user?._id
//         }
//         )

//     if (isSubscribed) {
//         await Subscription.findByIdAndDelete(isSubscribed?._id)

//         return res
//         .status(200)
//         .json(new ApiResponse(201,{subscribed:false},"Unsubscribed"))
        
//     }

//     await Subscription.create(channel?._id,
//         {
//             channel: channel?._id,
//             subscriber:req.user?._id


//         }
//         )
//     return res
//     .status(200)
//     .json(
//         new ApiResponse(201,{subscribed:true},"Subscribed")
//     )

    







// })

// controller to return subscriber list of a channel


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    // TODO: toggle subscription

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId");
    }

    const isSubscribed = await Subscription.findOne({
        subscriber: req.user?._id,
        channel: channelId,
    });

    if (isSubscribed) {
        await Subscription.findByIdAndDelete(isSubscribed?._id);

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { subscribed: false },
                    "unsubscribed successfully"
                )
            );
    }

    await Subscription.create({
        subscriber: req.user?._id,
        channel: channelId,
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { subscribed: true },
                "subscribed successfully"
            )
        );
});

// const getUserChannelSubscribers = asyncHandler(async (req, res) => {
//     const {channelId} = req.params

//     if (!isValidObjectId(channelId)){
//         throw new ApiError(400,"Invalid channel Id")
//     }
//     // console.log(channelId)

//     const subscribers = await Subscription.aggregate([
//         {
//             $match: {
//                 channel: channelId,
//             },
//         },
//         {
//             $lookup: {
//                 from: "users",
//                 localField: "subscriber",
//                 foreignField: "_id",
//                 as: "subscriber",
//                 pipeline: [
//                     {
//                         $lookup: {
//                             from: "subscriptions",
//                             localField: "_id",
//                             foreignField: "channel",
//                             as: "subscribedToSubscriber",
//                         },
                        
//                     },
//                     {
//                         $addFields: {
//                             subscribedToSubscriber: {
//                                 $cond: {
//                                     if: {
//                                         $in: [
//                                             channelId,
//                                             "$subscribedToSubscriber.subscriber",
//                                         ],
//                                     },
//                                     then: true,
//                                     else: false,
//                                 },
//                             },
//                             subscribersCount: {
//                                 $size: "$subscribedToSubscriber",
//                             },
//                         },
//                     },
//                 ],
//             },
//         },
//         {
//             $unwind: "$subscriber",
//         },
//         {
//             $project: {
//                 _id: 0,
//                 subscriber: {
//                     _id: 1,
//                     username: 1,
//                     fullName: 1,
//                     "avatar.url": 1,
//                     subscribedToSubscriber: 1,
//                     subscribersCount: 1,
                    
//                 },
//             },
//         },
//     ]);

//     console.log(subscribers)


//     return res
//     .status(200)
//     .json(new ApiResponse(200,subscribers,"Susbcriber fetched successfully"))


// })


// controller to return channel list to which user has subscribed

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    let { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId");
    }

    channelId = new mongoose.Types.ObjectId(channelId);

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: channelId,
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
                pipeline: [
                    {
                        $lookup: {
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "channel",
                            as: "subscribedToSubscriber",
                        },
                    },
                    {
                        $addFields: {
                            subscribedToSubscriber: {
                                $cond: {
                                    if: {
                                        $in: [
                                            channelId,
                                            "$subscribedToSubscriber.subscriber",
                                        ],
                                    },
                                    then: true,
                                    else: false,
                                },
                            },
                            subscribersCount: {
                                $size: "$subscribedToSubscriber",
                            },
                        },
                    },
                ],
            },
        },
        {
            $unwind: "$subscriber",
        },
        {
            $project: {
                _id: 0,
                subscriber: {
                    _id: 1,
                    username: 1,
                    fullName: 1,
                    "avatar.url": 1,
                    subscribedToSubscriber: 1,
                    subscribersCount: 1,
                },
            },
        },
    ]);
    console.log(subscribers)

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                subscribers,
                "subscribers fetched successfully"
            )
        );
});
// const getSubscribedChannels = asyncHandler(async (req, res) => {
     
//     const { subscriberId } = req.params

//     if (!isValidObjectId(subscriberId)){
//         throw new ApiError(400,"Invalid subscriber id")
//     }

//     const subscribedChannel=await Subscription.aggregate([
//         {
//             $match:new mongoose.Types.ObjectId( subscriberId)
//         },
//         {
//             $lookup:{
//                 from:"users",
//                 localField:"channel",
//                 foreignField:"_id",
//                 as:"subcribedToChannels",
               
                

//             }
//         },
//         {
//             $unwind: "$subscribedToChannel",

//         },
//         {
//             $project:{
//                 _id:0,
//                 subscribedToChannels:{
//                     _id:1,
//                     username:1,
//                     avatar:1,
//                     fullName:1
//                 }
//             }
//         }
//     ])

//     return res
//         .status(200)
//         .json(
//             new ApiResponse(
//                 200,
//                 subscribedChannel,
//                 "channels fetched successfully"
//             )
//         );




// })

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber id");
    }

    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "subscribedToChannels",
            },
        },
        {
            $unwind: "$subscribedToChannels",
        },
        {
            $project: {
                _id: 0,
                "subscribedToChannels._id": 1,
                "subscribedToChannels.username": 1,
                "subscribedToChannels.avatar": 1,
                "subscribedToChannels.fullName": 1,
            },
        },
    ]);

    return res.status(200).json(
        new ApiResponse(200, subscribedChannels, "Channels fetched successfully")
    );
});



export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}