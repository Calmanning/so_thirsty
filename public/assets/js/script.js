// const { search } = require("../../../controllers/thirsty_controller");

// Client js api calls
$(document).ready(function () {
    var name = $("#name")
    var userName = $("#userName");
    var password = $("#password");
    var confirmPass = $("#confirmPassword");
    // Text boxes in new plant page
    var nickname = $("#nickname");
    var commonName = $("#commonName");
    var scientificName = $("#scientificName");
    var waterFreq = $("#waterFreq");
    var conditions = $("#conditions");
    var plantNotes = $("#plantNotes");
    var searchBox = $("#searchBox");
    var searchBtn = $("#searchBtn");
    var resultsBox = $("#resultsBox");
    var selectPlant = $("#selectPlant");
    var trefleId = $("#trefleId");
    var treflePhoto = $("#treflePhoto");
    var waterBtn = $("#waterBtn");
    var lastWatered = $("#lastWatered");

    // Register user
    $("#newUser").on("submit", function (event) {
        event.preventDefault();
        if (userName.val() && password.val() && confirmPass.val()) {
            console.log("testing on script.js. the user name: " + userName)
            $.ajax({
                method: "POST",
                url: "/api/user",
                data: {
                    name: name.val(),
                    userName: userName.val(),
                    password: password.val()
                }
            }).then(function () {
                window.location.href = "/" + userName.val()
            });
        };
    });
    // TODO: Sign in user
    // $("#current-user").on("submit", function (event) {
    //     event.preventDefault();
    //     if (userName.val() && password.val()) {
    //         $.ajax({
    //             method: "POST",
    //             url: "/api/user",
    //             data: {
    //                 userName: userName.val(),
    //                 password: password.val()
    //             }
    //         }).then(function () {
    //             window.location.href = "/" + userName.val()
    //         });
    //     };
    // });

    // TODO: Get user info


    // Treffle API plant search
    // Search for a plant by it's common name
    searchBtn.on("click", function (event) {
        event.preventDefault();
        console.log(searchBox.val());
        $.ajax({
            method: "GET",
            url: "/api/search/" + searchBox.val()
        }).then(function (data) {
            console.log(data);
            for (let i = 0; i < data.data.length; i++) {
                var container = $("<div>").addClass("searchContainer");
                $("<p>").text(data.data[i].common_name).appendTo(container);
                $("<p>").text(data.data[i].scientific_name).appendTo(container);
                $("<p>").text(data.data[i].genus).appendTo(container);
                $("<p>").text(data.data[i].family).appendTo(container);
                for (let j = 0; j < data.data[i].synonyms.length; j++) {
                    $("<p>").text(data.data[i].synonyms[j]).appendTo(container)
                };
                $("<img>").attr("src", data.data[i].image_url).appendTo(container);
                $("<button>").text("Select this plant").attr("data-id", data.data[i].id).appendTo(container).addClass("resultsButton");
                resultsBox.append(container);
            };
        });
    });

    // Populate Create Plant form
    $(document).on("click", ".resultsButton", function (event) {
        event.preventDefault();
        $.ajax({
            method: "GET",
            url: "/api/searchById/" + $(this).data("id")
        }).then(function (data) {
            console.log("=====================", data);
            commonName.val(data.data.common_name);
            scientificName.val(data.data.scientific_name);
            waterFreq.val(frequencyMap(data.data.main_species.growth.minimum_precipitation));
            conditions.val(filterObj(data.data.main_species.growth));
            trefleId.val(data.data.id);
            treflePhoto.val(data.data.image_url);
        });
    });

    // UPDATE when plant was watered (plant profile)
    waterBtn.on("click", function () {
        console.log("watered!");
        console.log($("<data-id>"));
        // console.log(this);
        $.ajax({
            method: "PUT",
            url: "/:user/plant/" + $(this).val() + "/water"
        }).then(function (data) {
            console.log(data);
        });
    });

    // TODO: DELETE plant from profile button
    // deleteBtn.on("click", function (){

    // })


});

frequencyMap = precipitation => {
    let frequency = 3;

    if (typeof precipitation === "number") {
        console.log("this should not be happening!");
        frequency = (1 / precipitation) * 800;
        frequency = Math.round(frequency);

    }
    else {
        frequency = 3;
    }
    console.log(frequency);
    return frequency;
}
const filterObj = objToFilter => {

    let newObj = {}
    const iterate = (obj, parent = "") => {
        for (var property in obj) {
            if (obj.hasOwnProperty(property)) {
                if (typeof obj[property] != "object") {
                    newObj[parent + property] = obj[property];
                } else {
                    iterate(obj[property], parent + property + " ");
                }
            }
        }
        return obj;
    }
    iterate(objToFilter)
    let returnString = JSON.stringify(newObj, null, 1)
    returnString = returnString.substring(2, returnString.length - 1)
    return returnString;
}

// ==========================================================
// add temp user functions
// ==========================================================

