import  {Router}  from "express"
import { verifyJWT } from "../middlewares/auth.js";
import { createTweet, deleteTweet, getUserTweets, updateTweet } from "../controllers/tweetController.js";

const router=Router();

router.route("/create-tweet").post(verifyJWT,createTweet)

router.route("/get-tweet/:userId").get(verifyJWT,getUserTweets)

router.route("/update-tweet/:tweetId").patch(verifyJWT,updateTweet)

router.route("/delete-tweet/:tweetId").delete(verifyJWT,deleteTweet)


export default router