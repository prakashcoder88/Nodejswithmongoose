const express = require("express");
const path = require("path")
const bodyParser = require("body-parser");
const cors = require("cors")
require("dotenv").config();
const PORT = 1000;
// const crypto = require("node:crypto")


require("./src/config/Db.config");
const userRoutes = require("./src/routes/UserRoutes");
const adminRoutes = require("./src/routes/AdminRoutes");



const app = express();

// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use ('/public/profile', express.static(path.join(__dirname, '/public/profile')))


app.use("/company",userRoutes,);
app.use("/company/admin",adminRoutes);

app.listen(PORT, () =>{
    console.log(`Success runing port no ${PORT}`);
})

