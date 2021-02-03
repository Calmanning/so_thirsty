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
    var saveName = $("#saveName");
    var trefleId = $("#trefleId");
    var treflePhoto = $("#treflePhoto");
    // Edit and Save buttons
    var waterBtn = $("#waterBtn");
    var deleteBtn = $("#deleteBtn");
    var saveName = $("#saveName");
    var saveNotes = $("#saveNotes");
    var editNotes = $(".editNotes");
    var plantText = $("#plantText");
    var editNickname = $(".editNickname");
    var nicknameText = $("#nicknameText");
    var editWater = $(".editWater");
    var saveWater = $("#saveWater");
    var waterUpdate = $("#waterUpdate");
    var waterLevel = $("#waterLevel");
    var hideInput = $("#hideInput");


    // Register user
    $("#newUser").on("submit", function (event) {
        event.preventDefault();
        if (userName.val() && password.val() && confirmPass.val() === password.val() && password.val().length > 7) {
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
            }).fail(function (error) {
                console.log(error);
                Toastify({
                    text: "User name is unavailable",
                    duration: 3000,
                    destination: "https://github.com/apvarun/toastify-js",
                    newWindow: true,
                    close: true,
                    gravity: "top", // `top` or `bottom`
                    position: 'center', // `left`, `center` or `right`
                    backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
                    stopOnFocus: true, // Prevents dismissing of toast on hover
                    onClick: function () {
                    }
                }).showToast();
            })
        } else {
            var message = ""
            if (!userName.val()) {
                message += "User name is required\n"
            }
            if (!password.val()) {
                message += "Password is required\n"
            }
            if (!confirmPass.val() != password.val()) {
                message += "Passwords do not match\n"
            }
            if (password.val().length < 8) {
                message += "Minimum password length is 8 characters\n"
            }
            Toastify({
                text: message,
                duration: 3000,
                destination: "https://github.com/apvarun/toastify-js",
                newWindow: true,
                close: true,
                gravity: "top", // `top` or `bottom`
                position: 'center', // `left`, `center` or `right`
                backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
                stopOnFocus: true, // Prevents dismissing of toast on hover
                onClick: function () {
                }
            }).showToast();
        }
    });


    // Treffle API plant search
    // Search for a plant by it's common name
    searchBtn.on("click", function (event) {
        event.preventDefault();
        resultsBox.show();
        console.log(searchBox.val());
        $.ajax({
            method: "GET",
            url: "/api/search/" + searchBox.val()
        }).then(function (data) {
            resultsBox.text("");
            console.log(data);
            for (let i = 0; i < data.data.length; i++) {

                var container = $("<div>").addClass("grid-x grid-margin-x align-center");

                $("<div>").addClass("cell medium-3").append(
                    $("<button>").addClass("btn").text("Select this plant").attr("data-id", data.data[i].id).appendTo(container).addClass("resultsButton"))
                    .appendTo(container);

                $("<div>").addClass("cell medium-3").append($("<img>").attr("src", data.data[i].image_url)).appendTo(container);

                $("<div>").addClass("cell medium-3").append([
                    $("<h5>").text("Common Name"),
                    $("<p>").text(data.data[i].common_name)])
                    .appendTo(container);

                $("<div>").addClass("cell medium-3").append([
                    $("<h5>").text("Scientific Name").appendTo(container),
                    $("<p>").text(data.data[i].scientific_name)])
                    .appendTo(container);

                // $("<div>").addClass("cell medium-2").append([
                //     $("<h5>").text("Genus").appendTo(container),
                //     $("<p>").text(data.data[i].genus)])
                // .appendTo(container);

                // $("<div>").addClass("cell medium-2").append([
                //     $("<h5>").text("Family").appendTo(container),
                //     $("<p>").text(data.data[i].family)])
                // .appendTo(container);

                const synonyms = $("<p>");
                for (let j = 0; j < data.data[i].synonyms.length; j++) {
                    if (j > 0) {
                        synonyms.append(", ")
                    }
                    synonyms.append(data.data[i].synonyms[j])
                };

                $("<div>").addClass("grid-x grid-margin-x align-center").append($("<div>").addClass("cell medium-11").append([
                    $("<h5>").text("Synonyms").appendTo(container),
                    synonyms,
                    $("<hr>")
                ])).appendTo(container);

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

            $("#selectedNotice").text(`${data.data.common_name} is selected.`).append([
                $("<br>"),
                $("<a>").addClass("clearSelection").text("clear selection")
            ])
        });
    });

    $(document).on("click", ".clearSelection", function () {
        $("#myForm").trigger("reset");
        $("#selectedNotice").text("");
    });

    // UPDATE notes, nickname, and water frequency in plant profile
    saveName.on("click", function () {
        $.ajax({
            method: "PUT",
            url: "/:user/plant/" + $(this).val(),
            data: {
                nickname: $("#nickname").val()
            }
        }).then(function () {
            location.reload();
        });
    });

    saveNotes.on("click", function () {
        $.ajax({
            method: "PUT",
            url: "/:user/plant/" + $(this).val(),
            data: {
                notes: $("#plantText").val()
            }
        }).then(function () {
            location.reload();
        });
    });

    saveWater.on("click", function () {
        $.ajax({
            method: "PUT",
            url: "/:user/plant/" + $(this).val(),
            data: {
                waterFrequency: $("#waterDays").val()
            }
        }).then(function () {
            location.reload();
        });
    });

    // Toggles the text area for notes, nickname, and water frequency editing
    editNickname.on("click", function () {
        nickname.toggle();
        nicknameText.toggle();
        saveName.toggle();
        editNickname.toggle();
    });

    editNotes.on("click", function () {
        plantNotes.toggle();
        plantText.toggle();
        saveNotes.toggle();
        editNotes.toggle();
    });

    editWater.on("click", function () {
        waterUpdate.toggle();
        saveWater.toggle();
        waterLevel.toggle();
        hideInput.toggle();
        editWater.toggle();
    });

    // UPDATE when plant was watered (plant profile)
    waterBtn.on("click", function () {
        $.ajax({
            method: "PUT",
            url: "/:user/plant/" + $(this).val() + "/water"
        }).then(function (data) {
            location.reload();
        });
    });

    // DELETE plant from profile
    deleteBtn.on("click", function (event) {
        event.stopPropagation();
        var id = $(this).val();
        $.ajax({
            method: "DELETE",
            url: "/api/:user/plant/" + id
        }).then(function () {
            window.location.href = "/";
        });
    });

    //UPDATE just watered information on "/:user"
    $(document).on("click", ".wateredBtn", function (event) {
        event.preventDefault();
        const id = $(this).val() || $(this).attr("data-id");
        console.log($(this));
        console.log("button...uhhhh 'click' " + id);

        $.ajax({
            method: "PUT",
            url: "/:user/water/" + id
        }).then(function (data) {
            location.reload();
        });
    });

    //DELETE plant call from "/:user" page
    $(document).on("click", ".removeBtn", function (event) {
        event.stopPropagation();
        var id = $(this).val();
        alert("/api/:user/dead/" + id)
        console.log(`delete plant event listener fires: `, $(this));
        $.ajax({
            method: "DELETE",
            url: "/api/:user/dead/" + id
        }).then(function () {
            location.reload();
        });
    });

    //Delete caretaker
    $(document).on("click", ".deleteCaretaker", function (event) {

        event.stopPropagation();

        var id = $(this).val();
        $.ajax({
            method: "DELETE",
            url: "/api/caretaker/" + id
        }).then(function () {
            location.reload();
        });
    });

    $(document).on("click", ".deletePhoto", function (e) {
        // alert("/api/photo/delete/" + $(this).data("id"));
        $.ajax({
            url: "/api/photo/delete/" + $(this).data("id"),
            method: "DELETE"
        }).then(function (response) {
            // console.log(`photo deleted`);
            location.reload();
        }).fail(function (err) {
            console.log(err);
        })
    })

    $("#setPublic").click(function () {
        $.ajax({
            url: "/api/user/setPublic/" + $(this).data("id"),
            method: "PUT"
        }).then(function () {
            location.reload()
        })
    })

    $("#setPrivate").click(function () {
        $.ajax({
            url: "/api/user/setPrivate/" + $(this).data("id"),
            method: "PUT"
        }).then(function () {
            location.reload()
        })
    })

}); //end of the document ready

frequencyMap = precipitation => {
    let frequency = 3;

    if (typeof precipitation === "number") {
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

