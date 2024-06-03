import  {Router}  from "express"
import { verifyJWT } from "../middlewares/auth.js";
import { getLikedVideos, toggleCommentLike, toggleTweetLike, toggleVideoLike } from "../controllers/likesController.js";

const router=Router();

router.route("/:videoId").post(verifyJWT, toggleVideoLike)

router.route("/toggle-like-comment/:commentId").post(verifyJWT,toggleCommentLike)

router.route("/toggle-like-tweet/:tweetId").post(verifyJWT,toggleTweetLike)

router.route("/liked-videos").get(verifyJWT, getLikedVideos)



export default router;