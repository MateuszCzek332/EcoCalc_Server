const jwt = require("jsonwebtoken")
require("dotenv").config()

let badJWT = []

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
        const authHeader = req.headers['authorization'];
        if(!authHeader) return res.sendStatus(401)
        const token = authHeader.split(' ')[1]

        if(badJWT.includes(token))
            return res.sendStatus(403)
        jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
            if(err) 
                return res.sendStatus(403)

            req.username = user.username
        })

        const accesToken = jwt.sign({username: req.username}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "30m"})
        return res.json({
            accesToken: accesToken,
        })
        
    },
    deleteJWT: (req, res) => {
        const authHeader = req.headers['authorization'];
        if(!authHeader) return res.sendStatus(401)
        
        const token = authHeader.split(' ')[1]
        jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
            if(err) 
                return res.sendStatus(403)

            req.username = user.username
        })

        badJWT.push(token)
    },

}