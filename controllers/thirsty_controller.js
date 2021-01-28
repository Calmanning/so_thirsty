
var express = require("express");

var router = express.Router();

var db = require("../models");

const tempData = require("../tempObj")

// Routes

router.get("/", function(res,req) {
    res.send("Welcome to The Plant-Love Home Page!");
})

router.get("/:user", function(req,res) {
    res.json(tempData.userPlantPhotos)
})

router.get("/:user/:plant", function(req,res) {
    res.json(tempData.userPlantPhotos.plants.find(plant=> {
        return req.params.plant = plant.id
    }))
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
