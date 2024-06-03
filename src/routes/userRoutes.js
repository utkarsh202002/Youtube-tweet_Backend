import { changeAvatarImage, 
        changeCoverImage,
        changeCurrentUserPassword,
        getUserChannelProfile,
        getWatchHistory,
        loginUser,
        logoutUser,
        registerUser,
        updateAccountDetails } from "../controllers/userController.js";
import { verifyJWT } from "../middlewares/auth.js";
//importing multer

import {upload} from "../middlewares/multer.js"

import  {Router}  from "express"

import { incomingRefreshToken } from "../controllers/userController.js";

import { getCurrentUser } from "../controllers/userController.js";
import multer from "multer";

const router=Router();

// url --> http://localhost:8000/api/v1/users/register
router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]
       
    )
    ,registerUser
    );

router.route("/login").post(loginUser)

router.route("/logout").post(verifyJWT,logoutUser)

router.route('/refresh-token').post(incomingRefreshToken)

router.route('/change-password').post(verifyJWT,changeCurrentUserPassword)

router.route('/current-user').get(verifyJWT,getCurrentUser)

router.route('/update-account').patch(verifyJWT,updateAccountDetails)

router.route('/avatar').patch(verifyJWT,upload.single("avatar"),changeAvatarImage)

router.route('/cover').patch(verifyJWT,upload.single("coverImage"),changeCoverImage)

router.route("/c/:username").get(verifyJWT,getUserChannelProfile)

router.route("/history").get(verifyJWT,getWatchHistory)


// router.route('/cover-image').post(verifyJWT,)






export default router


//export default means it can imported with any name