// Client js api calls
$(document).ready(function () {
    var userName = $("#user-name");
    var password = $("#password");
    var confirmPass = $("#confirm-password")
    // TODO: Register user
    $("#user-input").on("submit", function (event) {
        event.preventDefault()
        console.log("error checking")
        if (userName.val() && password.val() && confirmPass.val()) {
           console.log("testing on script.js. the user name: "+userName)
            $.ajax({
                method: "POST",
                url: "/api/user",
                data: {
                    userName: userName.val(),
                    password: password.val()
                }
            }).then(function(user) {
                console.log("user name: "+ user)
                window.location.href = "/" + user.userName
            })
        };
    });
    // TODO: Sign in user
    // TODO: Get user info
    // TODO: Treffle API plant search
    // TODO: Create plant
    // TODO: Upload photo
    // TODO: Fill create form




});
