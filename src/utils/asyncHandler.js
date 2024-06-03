//WRAPPER CLASS

const asyncHandler=(requestHandler)=>{
    return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch(err=>next(err))
    }

}





//Higher order function
//try-catch method


// const asyncHandler=(fn)=>async(req,res,next)=>{
//     try {
//         await fn(req,res,next)
        
//     } catch (error) {
//         res.status(500).json({
//             success:false,
//             message:error.message
//         })
        
        
//     }

// }

export {asyncHandler};