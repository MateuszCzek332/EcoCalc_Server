require("dotenv").config()

const express = require('express')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const tokenController = require("./app/tokenController");
const dbcontroller = require("./app/database")
const app = express()
const PORT = 3000;

app.use(express.json());

let simpleCalc = []

app.get("/", (req, res) => {
    res.send = "Hello world!"
})

app.post("/register",  (req, res) => {
    const {username, password} = req.body
    if( !username || !password )
        return res.sendStatus(400)
        
    // if(users.find( (user) => username == user.username ))
    //     return res.sendStatus(409)

    bcrypt.hash(password, 8,  async (err, hash) => {
        if (err)
            return res.sendStatus(400)
            
        let isAdded =  await dbcontroller.addUser({
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

    let obj =  await  dbcontroller.isUserValid({username: username})
    console.log(obj.Password, password);
    
    const compare = await bcrypt.compare(password, obj.Password);
    if(!compare)
        return res.sendStatus(401)

    const accesToken = jwt.sign({username: username}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "30m"})
    const refreshToken = jwt.sign({username: username}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: "1d"})

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

app.post("/simpleCalc", (req, res) => {
    tokenController.verifyJWT(req, res)
    if(!req.username) return res.end()

    if(!req.body.usagePerMonth || !req.body.pricePerKWH || !req.body.fotoSize)
        res.sendStatus(400)

    let a = dbcontroller.saveSimpleCalc(req.username, {
        usagePerMonth: req.body.usagePerMonth,
        pricePerKWH:req.body.pricePerKWH,
        fotoSize:req.body.fotoSize
    })
    if(!a) return res.sendStatus(400);
    return res.sendStatus(200);
})

app.get("/simpleCalc", async () => {
    tokenController.verifyJWT(req, res)
    if(!req.username) return res.end()

    let data = await dbcontroller.getSimpleCalc(req.username)
    if(!data)
        return res.sendStatus(404)

    return res.json(data)
})

app.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
});