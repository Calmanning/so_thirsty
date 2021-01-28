
var express = require("express");

var router = express.Router();

var db = require("../models");

const tempData = require("../tempObj")

// Routes

router.get("/", function(req,res) {
    const hBarObj = {

    }
    res.render("register", hBarObj);
})

router.get("/:user", function(req,res) {
    res.render("index", tempData.user.find(searchUser => {
        return searchUser.userName = req.params.user
    }))
})

router.get("/:user/:plant", function(req,res) {
    res.json(tempData.userPlantPhotos.plants.find(plant=> {
        return req.params.plant = plant.id
    }))
})

router.post("/api/user", function(req, res) {
    const newUser = req.body;
    newUser.id = tempData.user.length + 1
    tempData.user.push(newUser);
    console.log("the new user is: " + newUser)
    res.json(newUser)
})

router.post("/api/plant", function(req,res){
    tempData.userPlantPhotos.plants.push(req.body);
    res.json(tempData.userPlantPhotos);
})
// .catch(err => {
//     console.log("trouble creating plant profile" +err.message)
//     res.status(500).send(err.message);
// })

module.exports = router;
