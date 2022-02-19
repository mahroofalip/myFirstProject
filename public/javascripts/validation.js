$(document).ready(function () {
    $("#form").validate({
        errorClass: "my-error-class",
        validClass: "my-valid-class",
        rules: {

            Email: {
                email: true,
                required: true,
                normalizer: function (value) {
                    return $.trim(value);
                }
            },
            Password: {

                required: true,
                minlength: 4,
                normalizer: function (value) {
                    return $.trim(value);
                }

            }

        }
    })

});




$(document).ready(function () {
    $("#adminlogin").validate({
        errorClass: "my-error-class",
        validClass: "my-valid-class",
        rules: {

            Email: {
                email: true,
                required: true,
                normalizer: function (value) {
                    return $.trim(value);
                }
            },
            Password: {

                required: true,
                minlength: 4,
                normalizer: function (value) {
                    return $.trim(value);
                }

            }

        }
    })

});








$(document).ready(function () {
    $("#otp").validate({
        errorClass: "my-error-class",
        validClass: "my-valid-class",
        rules: {

            mobile: {
                minlength: 10,
                number: true,

                required: true,
                normalizer: function (value) {
                    return $.trim(value);
                }

            }

        }
    })

});




$(document).ready(function () {
    $("#signupform").validate({
        errorClass: "my-error-class",
        validClass: "my-valid-class",
        rules: {
            Name: {
                required: true,
                minlength: 2,
                maxlength: 20,
                normalizer: function (value) {
                    return $.trim(value);
                }
            },
            mobile: {
                required: true,
                minlength: 10,
                number: true
            },
            Email: {
                email: true,
                required: true
            },
            Password: {

                required: true,
                minlength: 4,
                maxlength: 8,
                normalizer: function (value) {
                    return $.trim(value);
                }
            },
            ConformPassword: {

                required: true,
                minlength: 4,
                maxlength: 8,
                normalizer: function (value) {
                    return $.trim(value);
                }
            }


        }
    })

});








