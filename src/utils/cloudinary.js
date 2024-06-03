import { v2 as cloudinary } from "cloudinary";

import fs from 'fs'

cloudinary.config({ 
    cloud_name: 'utkarsh20', 
    api_key:'635119963491939', 
    api_secret: 'kZNWsLO3lHM9wKYJ1I2Y8gtO_so' // Click 'View Credentials' below to copy your API secret
});



const uploadFileCloudinary= async (localPathFile)=>{

    try {
        if (!localPathFile) return null;
        const response=await cloudinary.uploader.upload(localPathFile,{
            resource_type:"auto"
        });
        //file succesfully uploaded
        console.log('file successfully added',response.url);
        fs.unlinkSync(localPathFile)
        return response;// return the response to user
        
        
    } catch (error) {
        fs.unlinkSync(localPathFile); //remove the locally saved file as the upload operation failed
        return null;
        
    }

}

export {uploadFileCloudinary}