
var express = require("express");

var router = express.Router();

var db = require("../models");

const tempData = require("../tempObj")

const helpers = require("../helpers/helpers");
const temp = require("../tempObj");

// Routes

router.get("/addplant", function (req, res) {
    res.render("new-plant");
})

//home page
router.get("/", function (req, res) {
    const hBarObj = {

    }
    res.render("register", hBarObj);
})
//Welcome user page. Need to make a call to grab user's plants
router.get("/:user", function (req, res) {
    res.render("index", tempData.userPlantPhotos.find(searchUser => {
        return searchUser.userName = req.params.user
    }))
})

// READ/get user's specific plants
router.get("/:user/plant/:plant", function (req, res) {
    console.log(req.params.plant);
    res.json(helpers.addWatered(tempData.userPlantPhotos[0].plants.find(plant => {
        return plant.id = req.params.plant
    })))
})
//CREATE a new user name
router.post("/api/user", function (req, res) {
    const newUser = req.body;
    newUser.id = tempData.user.length + 1
    tempData.user.push(newUser);
    console.log("the new user is: " + newUser)
    res.json(newUser)
})
//api call for plant info
router.get("/api/search/:plantName", function (req, res) {
    res.json(tempData.apiSearch)
})

// route for add plant page


//CREATE a new plant for the user
router.post("/api/plant", function (req, res) {
    tempData.userPlantPhotos.plants.push(req.body);
    res.json(tempData.userPlantPhotos);
})
// .catch(err => {
//     console.log("trouble creating plant profile" +err.message)
//     res.status(500).send(err.message);
// })

//Adding a plant photo...kinda
router.post("/api/:plant/:img", function (req, res) {

    return res.send("Hey, that's a great photo")
})

router.delete("/api/:user/plant/:plant", function (req, res) {
    tempData.userPlantPhotos.plants = tempData.userPlantPhotos.plants.filter(plant => {
        return plant.id != req.params.plant;
    })
    res.json(tempData.userPlantPhotos.plants)
})

module.exports = router;
