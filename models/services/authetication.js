const jwt=require('jsonwebtoken');

const secret="$123karthi";

function createtoken(user){
    const playload={
        _id:user._id,
        email:user.email,
        profileimageurl:user.profileimageurl,
        role:user.role,
        fullname:user.fullname,

    };
    const token=jwt.sign(playload,secret);
    return token;
}
function validatetoken(token){
    const playload=jwt.verify(token,secret);
    return playload;
}
//used in authentication
module.exports={
    createtoken,
    validatetoken,
}