const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();
const moment = require("moment");

const db = require("../models");

const tempData = require("../tempObj")

const helpers = require("../helpers/helpers");
const temp = require("../tempObj");

const axios = require('axios')

const cloudinary = require("cloudinary");

require('dotenv').config()

// =========================================================================
// User Account Routes
// =========================================================================

// sign in 
router.get("/signin", function (req, res) {
    if(req.session.user){
        res.redirect("/" + req.session.user.userName)
    }
    else{
        res.render("signin");
    }    
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

//home page/register
router.get("/", function (req, res) {
    if(req.session.user){
        res.redirect("/" + req.session.user.userName)
    }
    else{
        res.render("register");
    }
})

//CREATE a new user 
router.post("/api/user", function (req, res) {
    db.User.create({
        userName: req.body.userName,
        name: req.body.name,
        password: req.body.password
    }).then(function (data) {
        res.redirect("/signin")
    })
})

// =======================================================================
// Plant routes
// =======================================================================

// add plant
router.get("/addplant", ensureAuthenticated, function (req, res) {
    res.render("new-plant");
})

//CREATE a new plant
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
        // console.log(`insert plant data: `, data);
        if (req.body.treflePhoto) {
            const photoData = await addPhoto(data.id, req.body.treflePhoto);
            data.photo = photoData;
        }
        res.redirect("/" + req.session.user.userName)
    })
})

// View single plant
router.get("/:user/plant/:plant", ensureAuthenticated, function (req, res) {
    db.Plant.findOne({
        where: {
            id: req.params.plant
        },
        include: [db.User]
    }).then(function (data) {
        console.log("plant-data", data);
        res.render("plant-profile", data);
    })
})

//UPDATE a Plant
router.put("/:user/plant/:plant/", function(req, res) {
    console.log(req.body);
    db.Plant.update(req.body,
        {
            where: {
                id:req.params.plant
            }
        }).
        then(updatedPlant => {
            res.render("plant-profile", updatedPlant)        
        })

    })

//DELETE a plant
router.delete("/api/:user/plant/:plant", ensureAuthenticated, function (req, res) {
    
    db.Plant.destroy({
        where: {
            id: req.params.plant
        }
    }).then(function (data) {
        res.json(data)
    })
})

// =======================================================================
// Photo Routes
// =======================================================================

// get photo to upload
router.get("/:user/plant/:plant/addphoto", ensureAuthenticated, function(req, res){
    db.Plant.findOne({
        where:{
            id: req.params.plant
        }
    }).then(data => {
        // console.log('plant data: ', data);
        res.render("addphoto", data);
    })
    
})

//Adding a plant photo
router.post("/api/plant/img", ensureAuthenticated, async function (req, res) {
    console.log('hello from post /api/uploadimg');

    try{
        const file = req.body.data;

        cloudinary.config({
            cloud_name: "drantho",
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });

        const uploadedResponse = await cloudinary.uploader.upload(file);        

        console.log('uploadedResponse: ', uploadedResponse);

        console.log(await addPhoto(uploadedResponse.id, uploadedResponse.url))

        console.log(`attempting to redirect to /${req.session.user.userName}/plant/${req.body.id}`);
        return res.json({href: `/${req.session.user.userName}/plant/${req.body.id}`});
    }catch(err){
        console.log(err);
        return res.status(500).json(err)
    }

    // const data = await addPhoto(req.params.plant, req.body.image)
})

async function addPhoto(id, url) {
    console.log(`addPhoto(${id}, ${url}) fires`);
    const data = await db.Photo.create({
        PlantId: id,
        url: url
    })

    return data;
}

// =======================================================================
// PExternal API Routes
// =======================================================================

//api call for to get plant info by name (and it's trefle ID)
router.get("/api/search/:plantName", ensureAuthenticated, function (req, res) {
    const key = process.env.TREFLE_API_KEY;
    const plantName = req.params.plantName

    axios.get(`https://trefle.io/api/v1/plants/search?q=${plantName}&token=${key}`)
        .then((response) => {
            res.json(response.data);
        })
})

//axios get request to trefle based on plant id
router.get("/api/searchById/:id", ensureAuthenticated, function (req, res) {
    const key = process.env.TREFLE_API_KEY;
    const plantId = req.params.id

    axios.get(`https://trefle.io/api/v1/plants/${plantId}?token=${key}`)
        .then((response) => {
            res.json(response.data);
        });
})

// =======================================================================
// Home page catch all route
// =======================================================================

//Welcome user page. Need to make a call to grab user's plants
router.get("/:user", ensureAuthenticated, function (req, res) {
    db.User.findOne(
        {
            where: {
                userName: req.session.user.userName
            },
            include: [
                { model: db.Plant, include: [db.Photo] }
            ],
        }).then(data => {
            // console.log('db data: ', data.dataValues);
            const dataToSend = helpers.addWatered(data.dataValues)
            // console.log('Formatted data: ', dataToSend);
            res.render("index", dataToSend)
        })
})


// =======================================================================
// Helper functions
// =======================================================================

function ensureAuthenticated(req, res, next) {

    if (req.session.user) {
        return next();
    }
    else {
        res.redirect("/signin")
    }

}

module.exports = router;
