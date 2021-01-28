// Client js api calls
$(document).ready(function () {
    var userName = $("#user-name");
    var password = $("#password");
    var confirmPass = $("#confirm-password")
    // TODO: Register user
    $("#user-input").on("Submit", function () {
        if (userName.val() && password.val() && confirmPass.val()) {
            $.ajax({
                method: "POST",
                url: "/api/user",
                data: {
                    userName: userName.val(),
                    password: password.val()
                }
            }).then(function () {
                window.location.href = "/" + userName.val()
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
