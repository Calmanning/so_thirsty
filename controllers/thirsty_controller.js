const bcrypt = require("bcrypt");
var express = require("express");
var router = express.Router();
const moment = require("moment");

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
                res.redirect("/" + req.session.user.userName)
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
    res.render("register");
})

//Welcome user page. Need to make a call to grab user's plants
router.get("/:user", ensureAuthenticated, function (req, res) {
    db.User.findOne(
        {
            where: {
                userName: req.session.user.userName
            },
            include: [db.Plant],
            include: [db.Photo]
        }).then(data => {
            console.log('db data: ', data.dataValues);
            res.render("index", data.dataValues)
        })
})

// READ/get user's specific plants
router.get("/:user/plant/:plant", ensureAuthenticated, function (req, res) {
    console.log(req.params.plant);
    // res.render("plant-profile", helpers.addWatered(tempData.userPlantPhotos[0].plants.find(plant => {
    //     return plant.id = req.params.plant
    // })))
    db.Plant.findAll({
        where: {
            UserId: req.session.id
        }
    }).then(function (data) {
        res.render("plant-profile", data);
    })
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
    const plantName = req.params.plantName

    axios.get(`https://trefle.io/api/v1/plants/search?q=${plantName}&token=${key}`)
        .then((response) => {
            console.log("=============================================");
            console.log(response.data);
            console.log("=============================================");
            console.log(response.status);
            console.log(response.statusText);
            console.log(response.headers);
            console.log(response.config);
            res.json(response.data);
        })
})




//axios get request to trefle based on plant id
router.get("/api/searchById/:id", ensureAuthenticated, function (req, res) {
    const key = "RFxyA90U90mDUshDMP8y-PiyRafTF254xr72BbWqlPQ"
    const plantId = req.params.id
    //"139820"

    axios.get(`https://trefle.io/api/v1/plants/${plantId}?token=${key}`)
        .then((response) => {
            console.log(response.data);
            console.log(response.status);
            console.log(response.statusText);
            console.log(response.headers);
            console.log(response.config);
            res.json(response.data);
        });
})



//CREATE a new plant for the user
router.post("/api/plant", ensureAuthenticated, async function (req, res) {
    // tempData.userPlantPhotos.plants.push(req.body);
    // res.json(tempData.userPlantPhotos);
    db.Plant.create({
        UserId: req.session.user.id,
        commonName: req.body.commonName,
        nickname: req.body.nickname,
        scientificName: req.body.scientificName,
        notes: req.body.notes,
        waterFrequency: parseInt(req.body.waterFrequency),
        lastWatered: moment(),
        trefleId: req.body.trefleId
    }).then(async function (data) {
        if (req.body.treflePhoto) {
            const photoData = await addPhoto(data.insertId, req.body.treflePhoto);
            data.photo = photoData;
        }
        res.json(data)
    })
})
// .catch(err => {
//     console.log("trouble creating plant profile" +err.message)
//     res.status(500).send(err.message);
// })

//Adding a plant photo...kinda
router.post("/api/plant/:plant/img", ensureAuthenticated, async function (req, res) {
    const data = await addPhoto(req.params.plant, req.body.image)
})

//DELETE a plant
router.delete("/api/:user/plant/:plant", ensureAuthenticated, function (req, res) {
    // tempData.userPlantPhotos.plants = tempData.userPlantPhotos.plants.filter(plant => {
    //     return plant.id != req.params.plant;
    // })
    db.Plant.destroy({
        where: {
            id: req.params.plant
        }
    }).then(function (data) {
        res.json(data)
    })
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

async function addPhoto(id, url) {
    const data = await db.Photo.create({
        PlantId: id,
        url: url
    })

    return data;
}

module.exports = router;
