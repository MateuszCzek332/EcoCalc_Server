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
    if( !username || !password  || username.length>32)
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
    
    if(!obj) return res.sendStatus(409);

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
    return res.sendStatus(200);
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

app.get("/simpleCalc", async (req, res) => {
    tokenController.verifyJWT(req, res)
    if(!req.username) return res.end()

    let data = await dbcontroller.getSimpleCalc(req.username)
    if(!data)
        return res.sendStatus(404)

    return res.json(data)
})

app.get("/deviceCategories", async (req, res) => {

    let categories = await dbcontroller.getCategories()
    if(!categories)
        return res.sendStatus(404)

    return res.json(categories)
})

app.post("/recomended", async (req, res) => {
        const {list} = req.body
        if(!list) return res.sendStatus(400)

        let reqList = []
        for (let i = 0; i < list.length; i++) {
            let p = await dbcontroller.getProductsFromCategory(list[i].typeName)
            const mostEfficient = p.reduce((min, curr) =>
                curr.PowerUsage < min.PowerUsage ? curr : min
            );
            reqList.push(mostEfficient)
        };
    
        res.json(reqList)
})

app.post("/advancedCalc", async (req, res) => {
    tokenController.verifyJWT(req, res)
    if(!req.username) return res.end()

    const {list} = req.body
    if(!list) return res.sendStatus(400)
    await dbcontroller.deleteUserAppliances(req.username);
    for (let i = 0; i < list.length; i++) {
        let ans = await dbcontroller.saveUserAppliances(req.username, {
            usage: list[i].usage, 
            time: list[i].time, 
            category: list[i].typeName
        })
        
        if(!ans) return res.sendStatus(400)
    };
    return res.sendStatus(200);
})

app.get("/advancedCalc", async (req, res) => {
    tokenController.verifyJWT(req, res)
    if(!req.username) return res.end()

    let ans = await dbcontroller.getUserAppliances(req.username)
    if(!ans) return res.sendStatus(400)

    return res.json(ans)
})


app.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
});