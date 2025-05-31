require("dotenv").config()

const express = require('express')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express()
const PORT = 3000;

app.use(express.json());

app.post("/register",  (req, res) => {


})

app.post("/login", async (req, res) => {


})

app.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
});