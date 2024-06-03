import multer from "multer";
//multer -- a middle(dablu)are
// to save the file in local disk
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      
      cb(null, file.originalname)
    }
  })
  
  export const upload = multer({
     storage,
     })