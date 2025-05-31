const jwt = require("jsonwebtoken")
require("dotenv").config()

module.exports = {
    verifyJWT: (req, res) => {
        const authHeader = req.headers['authorization'];
        if(!authHeader) return res.sendStatus(401)
        
        const token = authHeader.split(' ')[1]
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if(err) 
                return res.sendStatus(403)

            req.username = user.username
        })
    },
    refreshJWT: (req, res) => {
        //
    },

}