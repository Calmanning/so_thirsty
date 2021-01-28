
var express = require("express");

var router = express.Router();

var db = require("../models");

const tempData = require("../tempObj")

const helpers = require("../helpers/helpers");

// Routes

router.get("/", function (req, res) {
    const hBarObj = {

    }
    res.render("register", hBarObj);
})

router.get("/:user", function (req, res) {
    res.render("index", tempData.user.find(searchUser => {
        return searchUser.userName = req.params.user
    }))
})

router.get("/:user/plant/:plant", function (req, res) {
    console.log(req.params.plant);
    res.json(helpers.addWatered(tempData.userPlantPhotos.plants.find(plant => {
        return plant.id = req.params.plant
    })))
})

router.post("/api/user", function (req, res) {
    const newUser = req.body;
    newUser.id = tempData.user.length + 1
    tempData.user.push(newUser);
    console.log("the new user is: " + newUser)
    res.json(newUser)
})

router.post("/api/plant", function (req, res) {
    tempData.userPlantPhotos.plants.push(req.body);
    res.json(tempData.userPlantPhotos);
})
// .catch(err => {
//     console.log("trouble creating plant profile" +err.message)
//     res.status(500).send(err.message);
// })
router.delete("/api/:user/plant/:plant", function (req, res) {
    tempData.userPlantPhotos.plants = tempData.userPlantPhotos.plants.filter(plant => {
        return plant.id != req.params.plant;
    })
    res.json(tempData.userPlantPhotos.plants)
})

module.exports = router;
