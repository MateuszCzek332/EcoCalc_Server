require("dotenv").config()

const express = require('express')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const tokenController = require("./app/tokenController");
const dbcontroller = require("./app/database")
const app = express()
const PORT = 3000;

app.use(express.json());

let users = []

app.post("/register",  (req, res) => {
    const {username, password} = req.body
    if( !username || !password )
        return res.sendStatus(400)
        
    if(users.find( (user) => username == user.username ))
        return res.sendStatus(409)

    bcrypt.hash(password, 8,  async (err, hash) => {
        if (err)
            return res.sendStatus(400)
            
        let isAdded =  await dbcontroller.uddUser({
            username: username,
            password: hash
        })

        if(!isAdded)
            return res.sendStatus(409)

        return res.sendStatus(200)
    });
})

app.post("/login", async (req, res) => {
    const {username, password} = req.body

    if( !username || !password )
        return res.sendStatus(400)

    let odj =  await  dbcontroller.isUserValid({username: username})
    const compare = await bcrypt.compare(password, odj.password);
    if(!compare)
        return res.sendStatus(401)

    const accesToken = jwt.sign({username: userInDB.username}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "30m"})
    const refreshToken = jwt.sign({username: userInDB.username}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: "1d"})

    return res.json({
        accesToken: accesToken,
        refreshToken: refreshToken
    })

})

app.get("/refresh", async (req, res) => {
    tokenController.refreshJWT(req, res)
})

app.post("/logout", async (req, res) => {
    tokenController.deleteJWT(req, res)
})

app.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
});