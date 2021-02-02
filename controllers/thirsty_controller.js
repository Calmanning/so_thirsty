const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();
const moment = require("moment");

const db = require("../models");

const helpers = require("../helpers/helpers");

const axios = require('axios')

const cloudinary = require("cloudinary");
const nodemailer = require('nodemailer');

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
        res.render("signin",  {layout: "newUser"});
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
        res.render("register", {layout: "newUser"});
    }
})

//CREATE a new user 
router.post("/api/user", function (req, res) {
    db.User.create({
        userName: req.body.userName,
        name: req.body.name,
        password: req.body.password
    }).then(function (data) {
        if(bcrypt.compareSync(req.body.password, data.password)) {
            req.session.user = {
                id: data.id,
                name: data.name,
                userName: data.userName
            }
        }
        res.redirect("/" + req.session.user.userName)
    })
})

// Sign out
router.get("/signout", (req, res) => {
    req.session.user = undefined;

    res.redirect("/signin");
})

// =======================================================================
// Plant routes
// =======================================================================

// add plant
router.get("/addplant", ensureAuthenticated, function (req, res) {    
    res.render("new-plant", req.session.user);
})

//CREATE a new plant
router.post("/api/plant", ensureAuthenticated, async function (req, res) {
    
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
        include: [db.Photo, db.User],
        
  order: [
    [ db.Photo, 'id', 'DESC' ]]
    }).then(function (data) { 
        let dataToSend = helpers.addWateredSingle(data);
        dataToSend.userName = req.session.user.userName;
        dataToSend.name = req.session.user.userName;
        dataToSend.dataValues.createdAt = moment(dataToSend.createdAt).format('MM/DD/YYYY'); 
        // console.log("plant-data", dataToSend);       
        res.render("plant-profile", dataToSend);
    })
})

//UPDATE a Plant's name and notes
router.put("/:user/plant/:plant/", function(req, res) {
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

//UPDATE a plants watered status on USER HOME PAGE
router.put("/:user/water/:plant", (req, res) => {
    let time = moment(); 
    console.log("time " + time)
    db.Plant.update({
        lastWatered: time
        },
        {
            where: {
                id:req.params.plant
            }
        }).
        then(waterDate => {
            res.json(waterDate)
        })

})
//UPDATE a plants watered status on PLANT-Profile page
router.put("/:user/plant/:plant/water", (req, res) => {
    let time = moment(); 
    console.log("time " + time)
    db.Plant.update({
        lastWatered: time
        },
        {
            where: {
                id:req.params.plant
            }
        }).
        then(waterDate => {
            res.json(waterDate)
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

//DELETE a plant call from "/:user" page
router.delete("/api/:user/dead/:plant", ensureAuthenticated, function (req, res) {
    
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
        data.userName = req.session.user.userName;
        data.name = req.session.user.userName;
        res.render("addphoto", data);
    })
    
})

//Adding a plant photo
router.post("/api/plant/img", ensureAuthenticated, async function (req, res) {
    // console.log('hello from post /api/uploadimg');

    try{
        const file = req.body.data;

        cloudinary.config({
            cloud_name: "drantho",
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });

        const uploadedResponse = await cloudinary.uploader.upload(file);        

        console.log('uploadedResponse: ', uploadedResponse);

        console.log(await addPhoto(req.body.id, uploadedResponse.url))

        console.log(`attempting to redirect to /${req.session.user.userName}/plant/${req.body.id}`);
        return res.json({href: `/${req.session.user.userName}/plant/${req.body.id}`});
    }catch(err){
        console.log(err);
        return res.status(500).json(err)
    }

    // const data = await addPhoto(req.params.plant, req.body.image)
})

// Delete a photo
router.delete("/api/photo/delete/:id", ensureAuthenticated, async (req, res) => {
    cloudinary.config({
        cloud_name: "drantho",
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    db.Photo.findOne({
        where: {
            id: req.params.id
        }
    }).then(async data=> {
        const arr = data.url.split("/");
        let id = arr[arr.length-1];
        id = id.substring(0, id.length-4);
        console.log(`attempting to delete: `, id);
        try{
            const uploadedResponse = await cloudinary.uploader.destroy(id)
            console.log(uploadedResponse);
        }catch{
            console.log(`image not found on cloudinary`);
        }
        db.Photo.destroy({
            where: {
                id: req.params.id
            }
        }).then(deleteData => {
            res.json({msg: "image deleted"})
        })
    })
});

async function addPhoto(id, url) {
    // console.log(`addPhoto(${id}, ${url}) fires`);
    const data = await db.Photo.create({
        PlantId: id,
        url: url
    })

    return data;
}

// =======================================================================
// External API Routes
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


// =========================================================================
// Temp user routes 
// =========================================================================

// Route to let user invite caretaker
router.get("/invite", ensureAuthenticated, (req, res)=>{
    res.render("invite")
})

router.post("/invite", ensureAuthenticated, (req, res) => {
    
    const key = generatePassword();

    // save user in db
    db.Caretaker.create({
        UserId: req.session.user.id,
        name: req.body.name,
        email: req.body.email,
        key: key
    }).then(data => {

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'sothirstyproject@gmail.com',
              pass: process.env.GMAIL_PASSWORD
            }
          });
          
          const mailOptions = {
            from: 'sothirstyproject@gmail.com',
            to: req.body.email,
            subject: `${req.session.user.name} would like to invite you to view their plants at SoThirstyProject!`,
            text: `So Thirsty is a web app that helps users care for their plants. Users can add plants, search for information about them, set watering schedules and more! ${req.session.user.name} wants to show you their plant profile to help you care for their plants. visit http://localhost:3000/caretaker/${key} to get started. Also consider signing up for an account of your own at http://localhost:3000 - The So Thirsty Team`
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
              res.status(500).json(error)
            } else {
              console.log('Email sent: ' + info.response);
              res.redirect("/")
            }
          });


    });

})

router.get("/caretaker/:key", (req, res) => {
    db.Caretaker.findOne({
        where: {
            key: req.params.key
        },
        include: [
            { model: db.User, include: [{model: db.Plant, include: [db.Photo]}] }
        ]
    }).then(data => {
        if(data){
            data.key = req.params.key;
            data.Plants = data.dataValues.User.Plants;

            // console.log(`==================================================`);
            // console.log(`caretaker data: `, data);
            // console.log(`++++++++++++++++++++++++++++++++++++++++++++++++++++`);
            // console.log('data.Plants: ', data.Plants);            
            let dataToSend = helpers.addWatered(data);
            dataToSend.dataValues.userName = dataToSend.dataValues.User.userName;
            res.render("caretaker.handlebars", dataToSend.dataValues);
        }else{
            res.render("unauthorized")
        }
    })
})

router.get("/caretaker/:key/plant/:id", (req, res) => {
    db.Caretaker.findOne({
        where: {
            key: req.params.key
        },
        include: [
            { model: db.User, include: [{model: db.Plant, include: [db.Photo]}] }
        ]
    }).then(data => {
        db.Plant.findOne({
            where: {
                id: req.params.id
            },
            include: [db.Photo, db.User]
        }).then(plant => {
            
            // plant.data.name = data.name;
            plant.data = {name: data.dataValues.name, key: req.params.key}
            const dataToSend = helpers.addWateredSingle(plant);
            dataToSend.key = req.params.key;
            res.render("caretaker-plant", dataToSend);

        })
    })
})

router.delete("/api/caretaker/:id", (req, res) => {
    db.Caretaker.destroy({
        where: {
            id: req.params.id
        }
    }).then(data => {
        res.json({msg: "caretaker deleted"})
    }).catch(err => {
        console.log(err);
        res.status(500).json(err)
    })
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
                { model: db.Plant, include: [db.Photo]}, db.Caretaker
            ]

        }).then(data => {
            // console.log('db data: ', data.dataValues);
            const dataToSend = helpers.addWatered(data.dataValues)
            // console.log(`=============================`);
            // console.log('regular user data: ', dataToSend);

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

function getDigit() {
    var upperCase = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]
    var lowerCase = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
    var numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    var possibleDigits = [];

    possibleDigits = possibleDigits.concat(lowerCase);

    possibleDigits = possibleDigits.concat(upperCase);

    possibleDigits = possibleDigits.concat(numbers);

    return possibleDigits[Math.floor(Math.random() * possibleDigits.length)];
}

function generatePassword() {

    var password = "";

    for (var i = 0; i < 15; i++) {

        var tempDigit = getDigit();

        password = password.concat(tempDigit);
    }

    return password;    
}

module.exports = router;
