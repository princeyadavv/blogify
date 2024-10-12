const { validateToken } = require("../services/authentication")

function checkForAuthCookie(cookieName){
    return (req,res,next)=>{
        const tookenCookieValue = req.cookies[cookieName]
        if (!tookenCookieValue) {
           return next()
        }
        try{

            const UserPayload = validateToken(tookenCookieValue)
            req.user = UserPayload

        } catch(err){}
      return  next()
    }
}

module.exports = {
    checkForAuthCookie,
}