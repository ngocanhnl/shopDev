const asyncHandler = fn =>{
    return (req,res,next) =>{
        console.log("AsysncHandler")
        fn(req,res,next).catch(next)
    }
}

module.exports = asyncHandler