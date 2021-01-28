// const { search } = require("../../../controllers/thirsty_controller");

// Client js api calls
$(document).ready(function () {
    var userName = $("#userName");
    var password = $("#password");
    var confirmPass = $("#confirmPassword");
    // Text boxes in new plant page
    var nickname = $("#nickname");
    var commonName = $("#commonName")
    var scientificName = $("#scientificName")
    var waterFreq = $("#waterFreq")
    var conditions = $("#conditions")
    var plantNotes = $("#plantNotes")
    var searchBox = $("#searchBox")
    var searchBtn = $("#searchBtn")
    var resultsBox = $("#resultsBox")

    // Register user
    $("#new-user").on("Submit", function (event) {
        event.preventDefault();
        if (userName.val() && password.val() && confirmPass.val()) {
            console.log("testing on script.js. the user name: " + userName)
            $.ajax({
                method: "POST",
                url: "/api/user",
                data: {
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
    // $("#user-info").on("Submit")


    // TODO: Treffle API plant search


    // TODO: Create plant
    searchBtn.on("click", function () {
        console.log("testing");
        $.ajax({
            method: "GET",
            url: "/api/search/" + searchBox.val()
        }).then(function (data) {
            console.log(data.data);
            for (let i = 0; i < data.data.length; i++) {
                $("<p>").text(data.data[i].common_name).appendTo(resultsBox)
                $("<p>").text(data.data[i].genus).appendTo(resultsBox)
                $("<p>").text(data.data[i].scientific_name).appendTo(resultsBox)
                for (let j = 0; j < data.data[i].synonyms.length; j++) {
                    $("<p>").text(data.data[i].synonyms[j]).appendTo(resultsBox)
                };
                $("<img>").attr("src", data.data[i].image_url).appendTo(resultsBox)
                $("<button>").text(data.data[i].id).appendTo(resultsBox)
            }
        });
    });

    // TODO: Upload photo

    // TODO: Fill create form

    frequencyMap = precipitation => {

        let frequency;

        if (precipitation) {

            frequency = (1 / precipitation) * 800;
            frequency = Math.round(frequency);

        }
        else {
            frequency = 3;
        }
        return Math.max(1, frequency);
    }

});
