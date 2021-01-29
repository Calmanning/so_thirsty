// const { search } = require("../../../controllers/thirsty_controller");

// Client js api calls
$(document).ready(function () {
    var name = $("#name")
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
    $("#newUser").on("submit", function (event) {
        event.preventDefault();
        alert("HELLOOOO?")
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
                var container = $("<div>").addClass("searchContainer");
                $("<p>").text(data.data[i].common_name).appendTo(container);
                $("<p>").text(data.data[i].genus).appendTo(container);
                $("<p>").text(data.data[i].scientific_name).appendTo(container);
                for (let j = 0; j < data.data[i].synonyms.length; j++) {
                    $("<p>").text(data.data[i].synonyms[j]).appendTo(container)
                };
                $("<img>").attr("src", data.data[i].image_url).appendTo(container);
                $("<button>").text(data.data[i].id).appendTo(container);
                resultsBox.append(container);
            };
        });
    });

    // TODO: Upload photo

    // TODO: Fill create form    

});

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
    returnString = returnString.substring(2, returnString.length-1) 
    return returnString;
}
