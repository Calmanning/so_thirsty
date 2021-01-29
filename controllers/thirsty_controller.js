const bcrypt = require("bcrypt");
var express = require("express");
var router = express.Router();

var db = require("../models");

const tempData = require("../tempObj")

const helpers = require("../helpers/helpers");
const temp = require("../tempObj");

const axios = require('axios')

// Routes

router.get("/signin", function (req, res) {
    res.render("signin");
})

// sign in
router.post("/signin", function (req, res) {
    db.User.findOne({
        where: {
            userName: req.body.userName
        }
    }).then(function (data) {
        if (!data) {
            res.status(404).json({ msg: "No user found" })
        } else {
            if (bcrypt.compareSync(req.body.password, data.password)) {
                console.log(`attempting to set req.session.user`, data);
                req.session.user = {
                    id: data.id,
                    name: data.name,
                    userName: data.userName
                }
                res.redirect("/"+ req.session.user.userName)
                // res.redirect("/"+ req.userName)
            }
            else {
                res.status(401).json({ msg: "incorrect password" });
            }
        }
    })
})


router.get("/addplant", ensureAuthenticated, function (req, res) {
    res.render("new-plant");
})

//home page
router.get("/", function (req, res) {
    const hBarObj = {

    }
    res.render("register", hBarObj);
})
//Welcome user page. Need to make a call to grab user's plants
router.get("/:user", ensureAuthenticated, function (req, res) {    
    db.User.findOne(
        {
            where:{
                userName: req.session.user.userName
            }
        }).then(data => {
            console.log('db data: ', data.dataValues);
            res.render("index", data.dataValues)
        })    
})

// READ/get user's specific plants
router.get("/:user/plant/:plant", ensureAuthenticated, function (req, res) {
    console.log(req.params.plant);
    res.render("plant-profile", helpers.addWatered(tempData.userPlantPhotos[0].plants.find(plant => {
        return plant.id = req.params.plant
    })))
})
//UPDATE Plant info
router.put("/:user/plant/:plant/", function (req, res) {
    console.log("making an update.");
    tempData.userPlantPhotos.plants = tempData.userPlantPhotos.plants.filter(plant => {
        return plant.id === req.params.plant;
       
    })
    res.render("plant-profile", tempData.userPlantPhotos.plants)
})


//CREATE a new user name
router.post("/api/user", function (req, res) {
    // const newUser = req.body;
    // newUser.id = tempData.user.length + 1
    // tempData.user.push(newUser);
    // console.log("the new user is: " + newUser)
    // res.json(newUser)

    db.User.create({
        userName: req.body.userName,
        name: req.body.name,
        password: req.body.password
    }).then(function (data) {
        res.redirect("/signin")
    })
})



const plantId = ""
//api call for to get plant info by name (and it's trefle ID)
router.get("/api/search/:plantName", ensureAuthenticated, function (req, res) {
    const key = "RFxyA90U90mDUshDMP8y-PiyRafTF254xr72BbWqlPQ"
    const plantName = req.params.val
    
    axios.get(`https://trefle.io/api/v1/plants/search?q=${plantName}&token=${key}`)
    .then((response) => {
        console.log(response.data);
        console.log(response.status);
        console.log(response.statusText);
        console.log(response.headers);
        console.log(response.config);
        res.json(response);
    })
})




//axios get request to trefle based on plant id
function getPlantByID(plantId) {
 router.get("/api/searchById", ensureAuthenticated, function (req, res) {
    const key = "RFxyA90U90mDUshDMP8y-PiyRafTF254xr72BbWqlPQ"
    // const plantId = req.params.id
    //"139820"

    axios.get(`https://trefle.io/api/v1/plants/${plantId}?token=${key}`)
        .then((response) => {
            console.log(response.data);
            console.log(response.status);
            console.log(response.statusText);
            console.log(response.headers);
            console.log(response.config);
            res.status(200).send(res.json(response));
        });
})
}


//CREATE a new plant for the user
router.post("/api/plant", ensureAuthenticated, function (req, res) {
    tempData.userPlantPhotos.plants.push(req.body);
    res.json(tempData.userPlantPhotos);
})
// .catch(err => {
//     console.log("trouble creating plant profile" +err.message)
//     res.status(500).send(err.message);
// })

//Adding a plant photo...kinda
router.post("/api/:plant/:img", ensureAuthenticated, function (req, res) {

    return res.send("Hey, that's a great photo")
})

//DELETE a plant
router.delete("/api/:user/plant/:plant", ensureAuthenticated, function (req, res) {
    tempData.userPlantPhotos.plants = tempData.userPlantPhotos.plants.filter(plant => {
        return plant.id != req.params.plant;
    })
    res.json(tempData.userPlantPhotos.plants)
})

function ensureAuthenticated(req, res, next) {

    // console.log(`req.session.user: `, req.session.user);
    if (req.session.user) {
        // console.log(session);
        return next();
    }
    else {
        // res.status(401).json({ msg: "not authorized from ensureAuthenticated 1" })
        res.redirect("/signin")
    }

}

module.exports = router;
