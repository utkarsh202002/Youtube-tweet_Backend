import  {Router}  from "express"
import { verifyJWT } from "../middlewares/auth.js";
import { addComment, deleteComment, getVideoComments, updateComment } from "../controllers/commentController.js";

const router=Router();

router.route("/create-comment/:videoId").post(verifyJWT,addComment)

router.route("/get-all-comment/:videoId").get(getVideoComments)

router.route("/update-comment/:commentId").patch(verifyJWT,updateComment)

router.route("/delete-comment/:commentId").delete(verifyJWT,deleteComment)


export default router




