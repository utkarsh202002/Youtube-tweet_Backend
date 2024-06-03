import  {Router}  from "express"
import { verifyJWT } from "../middlewares/auth.js";
import { app } from "../app.js";
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlistController.js";


const router=Router();

router.route("/create-playlist").post(verifyJWT,createPlaylist)
router.route("/get-user-playlist/:userId").get(verifyJWT,getUserPlaylists)

router.route("/get-playlist/:playlistId").post(verifyJWT,getPlaylistById)

router.route("/add-video/:playlistId/:videoId").post(verifyJWT,addVideoToPlaylist)

router.route("/remove-video/:playlistId/:videoId").post(verifyJWT,removeVideoFromPlaylist)

router.route("/remove-playlist/:playlistId").post(verifyJWT,deletePlaylist)

router.route("/update-playlist/:playlistId").patch(verifyJWT,updatePlaylist)



export default router

