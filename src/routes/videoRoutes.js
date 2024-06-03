import  {Router}  from "express"
import { verifyJWT } from "../middlewares/auth.js";
import {upload} from "../middlewares/multer.js"
import { deleteVideo,
      getAllVideos,
      getVideoById, 
      publishAVideo, 
      togglePublishStatus, 
      updateVideo } from "../controllers/videoController.js";

const router=Router();


router.route('/get-video').get(getAllVideos)
router.route("/publish-video").post(verifyJWT,
    upload.fields([
        {
            name:"videoFile",
            maxCount:1
        },
        {
            name:"thumbnail",
            maxCount:1
        }
    ]
       
    )
    ,publishAVideo
    );

router.route("/v/:videoId").get(getVideoById)

router.route("/v/update/:videoId").patch(verifyJWT,upload.single("thumbnail"),updateVideo)

router.route("/v/delete/:videoId").post(verifyJWT,deleteVideo)

router.route("/v/toggle/:videoId").post(verifyJWT,togglePublishStatus)







export default router
