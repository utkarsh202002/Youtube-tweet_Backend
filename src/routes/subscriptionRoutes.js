import  {Router}  from "express"
import { verifyJWT } from "../middlewares/auth.js";
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscriptionController.js";

const router=Router();

router.route("/toggle-subscription/:channelId").post(verifyJWT, toggleSubscription)

router.route("/get-subscriber/:channelId").get(verifyJWT, getUserChannelSubscribers)

router.route("/get-subscribed-channels/:subscriberId").get(verifyJWT, getSubscribedChannels)

export default router