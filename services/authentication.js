const JWT = require('jsonwebtoken')



function CreateTokerForUser(user){
    const payload = {
        _id: user._id,
        email:user.email,
        profileImageurl :user.profileImageurl,
        role:user.role,
        fullName: user.fullName,
    }
    const token = JWT.sign(payload,process.env.secret)
    return token;
}

function validateToken(token){
    const payload = JWT.verify(token,process.env.secret)
    return payload

}

module.exports ={
    CreateTokerForUser,
    validateToken
}