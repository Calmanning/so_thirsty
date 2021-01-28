const { search } = require("../../../controllers/thirsty_controller");

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
        $.ajax({
            method: "GET",
            url: "/api/search/" + searchBox.val()
        }).then(function (data) {
            var results = $("<p>").text(data.common_name)
            resultsBox.append(results)
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
